import { NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11437";
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "qwen3-vl:latest";

export async function POST(req) {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });

    try {
        // 0. Update Status to Processing
        db.prepare('UPDATE invoices SET reextract_status = ? WHERE id = ?').run('processing', id);

        const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
        if (!invoice) {
            db.prepare('UPDATE invoices SET reextract_status = ? WHERE id = ?').run('failed', id);
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        let imagePath;
        if (invoice.image_url.startsWith('/uploads/')) {
            imagePath = path.join(process.cwd(), 'public', invoice.image_url);
        } else if (invoice.image_url.startsWith('/fatura_images/')) {
            imagePath = path.join(process.cwd(), 'public', invoice.image_url);
        } else {
            return NextResponse.json({ error: "Invalid image URL format" }, { status: 400 });
        }

        if (!fs.existsSync(imagePath)) {
            return NextResponse.json({ error: "Image file not found" }, { status: 404 });
        }

        const imgBuf = fs.readFileSync(imagePath);
        const salt = Date.now();
        console.log(`[Re-extract] Start ID: ${id}, Salt: ${salt}, Vision: ${VISION_MODEL}`);

        // --- Parallel Execution ---
        const [passAResult, passBResult] = await Promise.all([
            // Pass A: Line Items (TATR + Qwen Crop)
            (async () => {
                let items = [];
                let tableBase64 = null;
                try {
                    const { execSync } = require('child_process');
                    const tatrResult = execSync(`python3 /tmp/tatr_helper.py "${imagePath}"`, { encoding: 'utf8' });
                    const tatrJson = JSON.parse(tatrResult);
                    if (tatrJson.tables && tatrJson.tables.length > 0) {
                        tableBase64 = tatrJson.tables[0];
                    }
                } catch (e) { console.error("[Re-extract] TATR failed:", e.message); }

                if (tableBase64) {
                    const PROMPT = `Extract ALL tabular line items from this invoice table. Return ONLY a valid JSON array of objects.
Format: [{"description": "", "quantity": 0.0, "unitPrice": 0.0, "amount": 0.0}]`;
                    try {
                        const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model: VISION_MODEL,
                                prompt: PROMPT,
                                images: [tableBase64],
                                stream: false,
                                options: { temperature: 0.0, num_predict: 1500 }
                            })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            const raw = data.response || "";
                            const f = raw.indexOf('[');
                            const l = raw.lastIndexOf(']');
                            if (f !== -1 && l !== -1) {
                                items = JSON.parse(raw.substring(f, l + 1));
                                console.log(`[Re-extract] Pass A got ${items.length} items.`);
                            }
                        }
                    } catch (e) { console.error("[Re-extract] Pass A failed:", e.message); }
                }
                return items;
            })(),

            // Pass B: Metadata (Full Image resized + Retries)
            (async () => {
                let metaData = {};
                let metadataBase64 = "";
                try {
                    const resized = await sharp(imgBuf).resize(1024, null, { withoutEnlargement: true }).toBuffer();
                    metadataBase64 = resized.toString('base64');
                } catch (e) { metadataBase64 = imgBuf.toString('base64'); }

                const PROMPT = `Extract ALL invoice metadata into JSON. Return ONLY valid JSON.
{
  "seller": "",
  "sellerABN": "",
  "invoiceNumber": "",
  "date": "YYYY-MM-DD",
  "total": 0.0,
  "gst": 0.0,
  "currency": "AUD or NZD",
  "lineItems": []
}`;

                async function fetchMeta(url, model) {
                    try {
                        const r = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model, prompt: PROMPT, images: [metadataBase64],
                                stream: false, options: { temperature: 0.1, num_predict: 1000 }
                            })
                        });
                        if (!r.ok) return "";
                        const d = await r.json();
                        return d.response || "";
                    } catch { return ""; }
                }

                // Try Primary (Qwen)
                let raw = await fetchMeta(`${OLLAMA_BASE_URL}/api/generate`, VISION_MODEL);

                // Fallback (Llava)
                if (!raw || raw.trim().length < 10) {
                    console.warn("[Re-extract] Pass B Primary empty. Trying Fallback...");
                    raw = await fetchMeta("http://localhost:11434/api/generate", "llava:13b");
                }

                if (raw) {
                    const f = raw.indexOf('{');
                    const l = raw.lastIndexOf('}');
                    if (f !== -1 && l !== -1) {
                        try {
                            metaData = JSON.parse(raw.substring(f, l + 1));
                            console.log(`[Re-extract] Pass B Success: ${metaData.seller}`);
                        } catch (e) { console.error("[Re-extract] Pass B JSON error"); }
                    }
                }
                return metaData;
            })()
        ]);

        // Merge Results
        const finalData = { ...passBResult };
        if (passAResult.length > 0) {
            finalData.lineItems = passAResult;
        }

        if (!finalData.seller && !invoice.seller) {
            throw new Error("Could not extract minimal invoice data.");
        }

        // 5. Update DB
        const update = db.prepare(`
            UPDATE invoices SET 
                seller = ?, amount = ?, tax = ?, date = ?, 
                raw_json = ?, invoice_number = ?, due_date = ?, 
                customer_name = ?, customer_address = ?, 
                seller_address = ?, discount = ?, currency = ?,
                reextract_status = 'completed'
            WHERE id = ?
        `);

        update.run(
            finalData.seller || invoice.seller,
            finalData.total || finalData.amount || invoice.amount || 0,
            finalData.gst || invoice.tax || 0,
            finalData.date || invoice.date,
            JSON.stringify(finalData),
            finalData.invoiceNumber || finalData.invoice_number || invoice.invoice_number,
            finalData.dueDate || finalData.due_date || invoice.due_date,
            finalData.buyer || finalData.customer_name || invoice.customer_name,
            finalData.customer_address || invoice.customer_address,
            finalData.seller_address || invoice.seller_address,
            finalData.discount || 0,
            finalData.currency || invoice.currency || 'AUD',
            id
        );

        return NextResponse.json({ success: true, invoice: finalData });

    } catch (err) {
        console.error("[Re-extract] Fatal Error:", err.message);
        db.prepare('UPDATE invoices SET reextract_status = ? WHERE id = ?').run('failed', id);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

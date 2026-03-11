const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11437";
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "qwen3-vl:latest";

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const dynamic = "force-dynamic";

const EXTRACT_PROMPT = `You are a high-precision invoice data extraction expert for Australian and New Zealand (AU/NZ) markets.
Analyze the provided invoice image and extract the data into the following JSON format.
Follow these CRITICAL rules:
1. Identify AU/NZ specific details: ABN (Australia), NZBN (New Zealand), GST numbers.
2. Check for "Tax Invoice" markers to determine type.
3. Validate math: ensure (subtotal + gst = total). If the math doesn't add up, trust the printed "Total" but note the discrepancy in "notes".
4. For lineItems: extract description, quantity (default to 1 if missing), unitPrice, and amount.
5. Return ONLY valid JSON, no markdown blocks, no extra text.

{
  "seller": "full legal name of the supplier",
  "sellerABN": "ABN or NZBN if found",
  "buyer": "customer name if present",
  "invoiceNumber": "invoice or reference number",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD or null",
  "subtotal": numeric,
  "gst": numeric,
  "total": numeric,
  "currency": "AUD, NZD, or other",
  "type": "Tax Invoice, Receipt, etc.",
  "lineItems": [
    { "description": "text", "quantity": number, "unitPrice": number, "amount": number }
  ],
  "notes": "math verification or key terms"
}
`;

export async function POST(req) {
  try {
    console.log("OCR POST started with refined prompt");
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let imgBuf = Buffer.from(buffer);
    let mimeType = file.type || "image/jpeg";

    // Increase resolution for better OCR: 1600 -> 2048
    const MAX_WIDTH = 2048;

    try {
      if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
        imgBuf = await sharp(imgBuf).resize({ width: MAX_WIDTH, withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
        mimeType = "image/jpeg";
      } else {
        const metadata = await sharp(imgBuf).metadata();
        if (metadata.width && metadata.width > MAX_WIDTH) {
          imgBuf = await sharp(imgBuf).resize({ width: MAX_WIDTH }).toBuffer();
        }
      }
    } catch (convErr) {
      console.error("Image conversion failed:", convErr?.message || convErr);
    }

    const base64 = imgBuf.toString("base64");
    console.log("Image length:", base64.length, "Vision Model:", VISION_MODEL);

    async function callOllama(url, body) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resText = await res.text();
      if (!res.ok) {
        throw new Error(resText || `Ollama error: ${res.status}`);
      }
      return JSON.parse(resText);
    }

    let data;
    try {
      console.log("Using native generate for vision...");
      data = await callOllama(`${OLLAMA_BASE_URL}/api/generate`, {
        model: VISION_MODEL,
        prompt: EXTRACT_PROMPT,
        images: [base64],
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 2500,
          top_p: 0.9
        },
      });

      if (!data.response) {
        throw new Error("Empty response from native generate");
      }
    } catch (err) {
      console.log("Native failed, checking for fallback...", err.message);
      // Fallback to OpenAI-compatible chat completions if native vision fails
      const dataUrl = `data:${mimeType};base64,${base64}`;
      data = await callOllama(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
        model: VISION_MODEL,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: EXTRACT_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        }],
        temperature: 0.1,
        stream: false,
      });
    }

    const rawContent = data.response || data.choices?.[0]?.message?.content || "";
    console.log("OCR Result received. Length:", rawContent.length, "Preview:", rawContent.substring(0, 50).replace(/\n/g, ' '));

    if (!rawContent) {
      console.error("Critical: Model returned completely empty response after fallbacks. Full data length:", JSON.stringify(data).length);
      return Response.json({ error: "Model returned an empty response. Try a different image format or model.", raw: rawContent }, { status: 422 });
    }

    let invoiceData;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      invoiceData = JSON.parse(cleaned);
    } catch {
      console.error("JSON Parse failed for OCR result:", rawContent.substring(0, 100).replace(/\n/g, ' '));
      return Response.json({ error: "Extraction failed to return valid JSON", raw: rawContent }, { status: 422 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = mimeType === "image/png" ? "png" : "jpg";
    const fileName = `inv-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, fileName), imgBuf);
    const imageUrl = `/uploads/${fileName}`;

    return Response.json({ success: true, invoice: invoiceData, image_url: imageUrl });
  } catch (err) {
    console.error("OCR Route Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const invoices = db.prepare('SELECT * FROM invoices ORDER BY date DESC').all();
        return NextResponse.json(invoices);
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const invoice = await req.json();

        // Insert into DB
        const insert = db.prepare(`
      INSERT INTO invoices (id, seller, buyer, amount, tax, date, type, status, currency, raw_json, image_url)
      VALUES (@id, @seller, @buyer, @amount, @tax, @date, @type, @status, @currency, @raw_json, @image_url)
    `);

        insert.run({
            id: invoice.id,
            seller: invoice.seller,
            buyer: invoice.buyer,
            amount: invoice.amount || 0,
            tax: invoice.tax || 0,
            date: invoice.date,
            type: invoice.type,
            status: invoice.status || 'Verified',
            currency: invoice.currency || 'AUD',
            raw_json: JSON.stringify(invoice),
            image_url: invoice.image_url || null
        });

        return NextResponse.json({ success: true, invoice });
    } catch (error) {
        console.error("Failed to save invoice:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

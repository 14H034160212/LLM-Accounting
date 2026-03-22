import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';
        const filter = searchParams.get('filter') || 'All';
        const offset = (page - 1) * limit;

        let query = 'FROM invoices WHERE 1=1';
        const params = [];

        if (search) {
            const pattern = `%${search}%`;
            query += ' AND (seller LIKE ? OR id LIKE ? OR invoice_number LIKE ?)';
            params.push(pattern, pattern, pattern);
        }

        if (filter !== 'All') {
            query += ' AND status = ?';
            params.push(filter);
        }

        // Get total count for this specific filter/search
        const total = db.prepare(`SELECT COUNT(*) as total ${query}`).get(...params).total;

        // Get paginated data
        const invoices = db.prepare(`SELECT * ${query} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`)
            .all(...params, limit, offset);

        return NextResponse.json({
            invoices,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
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
      INSERT INTO invoices (
        id, seller, buyer, amount, tax, date, type, status, currency, 
        raw_json, image_url, invoice_number, due_date, customer_name, 
        customer_address, seller_address, discount
      )
      VALUES (
        @id, @seller, @buyer, @amount, @tax, @date, @type, @status, @currency, 
        @raw_json, @image_url, @invoice_number, @due_date, @customer_name, 
        @customer_address, @seller_address, @discount
      )
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
            image_url: invoice.image_url || null,
            invoice_number: invoice.invoice_number || null,
            due_date: invoice.due_date || null,
            customer_name: invoice.customer_name || null,
            customer_address: invoice.customer_address || null,
            seller_address: invoice.seller_address || null,
            discount: invoice.discount || 0
        });

        return NextResponse.json({ success: true, invoice });
    } catch (error) {
        console.error("Failed to save invoice:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

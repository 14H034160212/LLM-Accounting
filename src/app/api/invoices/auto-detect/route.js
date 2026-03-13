import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Find invoices that have 0 line items and are pending re-extraction
        // We check raw_json to see if lineItems array is empty or missing
        const invoices = db.prepare('SELECT id, raw_json, reextract_status FROM invoices').all();

        const toReextract = invoices.filter(inv => {
            // Only re-extract if status is pending or null
            if (inv.reextract_status !== 'pending' && inv.reextract_status !== null) return false;

            try {
                const data = JSON.parse(inv.raw_json || '{}');
                // Target invoices with 0 line items or missing array
                return !data.lineItems || data.lineItems.length === 0;
            } catch (e) {
                return true; // Malformed JSON needs re-extraction
            }
        }).slice(0, 5); // LIMIT TO 5 TO PREVENT FLOODING

        return NextResponse.json({
            count: toReextract.length,
            ids: toReextract.map(inv => inv.id)
        });
    } catch (error) {
        console.error("Auto-detect failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

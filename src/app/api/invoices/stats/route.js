import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Get Total Global Invoices
        const totalCount = db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;

        // 2. Get Completed Invoices (those that have been explicitly re-extracted or processed)
        // We define "completed" as those where reextract_status is 'completed'
        const completedCount = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE reextract_status = 'completed'").get().count;

        // 3. Get total that NEED re-extraction (missing line items)
        // This requires checking the raw_json content. 
        // For performance on 10k items, we'll refine this.
        // Assuming reextract_status tracks this subset now.

        // Count invoices that have empty line items in raw_json
        // We do a full scan but only select the raw_json field to be as fast as possible
        const allInvoices = db.prepare('SELECT raw_json, reextract_status FROM invoices').all();

        let totalNeeded = 0;
        let reextractCompleted = 0;
        let processing = 0;

        allInvoices.forEach(inv => {
            let hasLines = false;
            try {
                const data = JSON.parse(inv.raw_json || '{}');
                hasLines = data.lineItems && data.lineItems.length > 0;
            } catch (e) {
                hasLines = false;
            }

            if (!hasLines) {
                totalNeeded++;
            }

            if (inv.reextract_status === 'completed') {
                reextractCompleted++;
            } else if (inv.reextract_status === 'processing') {
                processing++;
            }
        });

        return NextResponse.json({
            global: {
                total: totalCount,
                completed: completedCount,
                percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
            },
            reextraction: {
                total_needed: totalNeeded,
                completed: reextractCompleted,
                processing: processing,
                percentage: (totalNeeded + reextractCompleted) > 0
                    ? Math.round((reextractCompleted / (totalNeeded + reextractCompleted)) * 100)
                    : 100
            }
        });
    } catch (error) {
        console.error("Stats API failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

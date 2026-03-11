import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { invoice_id, summary, debit_account, credit_account, amount, date } = await req.json();

        if (!invoice_id || !debit_account || !credit_account || !amount) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const journalId = `jrnl-${uuidv4().substring(0, 8)}`;

        const stmt = db.prepare(`
      INSERT INTO journals (id, invoice_id, summary, debit_account, credit_account, amount, date, status, ai_generated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            journalId,
            invoice_id,
            summary || `Journal entry for invoice ${invoice_id}`,
            debit_account,
            credit_account,
            amount,
            date || new Date().toISOString().split('T')[0],
            'Confirmed',
            true
        );

        // Update the invoice status to 'Processed'
        db.prepare("UPDATE invoices SET status = 'Processed' WHERE id = ?").run(invoice_id);

        return Response.json({
            success: true,
            journalId,
            message: `Journal entry ${journalId} created and invoice linked.`
        });
    } catch (err) {
        console.error("Journal Confirmation Error:", err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

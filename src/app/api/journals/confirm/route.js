import db from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        // Support both "confirm existing journal" (journal_id + status) and "create new journal" flows
        const { journal_id, status, invoice_id, summary, debit_account, credit_account, amount, date } = body;

        // ── Confirm existing journal (status update) ──────────────────────────
        if (journal_id && status) {
            db.prepare("UPDATE journals SET status = ? WHERE id = ?").run(status, journal_id);
            return Response.json({ success: true, message: `Journal ${journal_id} updated to ${status}.` });
        }

        // ── Create new journal ────────────────────────────────────────────────
        if (!invoice_id || !debit_account || !credit_account || !amount) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const journalId = `jrnl-${crypto.randomUUID().substring(0, 8)}`;

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

import db from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { journal_id, status, invoice_id, summary, debit_account, credit_account, amount, date } = await req.json();

        // Case 1: Updating an existing journal (Approval flow)
        if (journal_id) {
            const stmt = db.prepare("UPDATE journals SET status = ? WHERE id = ?");
            stmt.run(status || 'Approved', journal_id);
            return Response.json({ success: true, id: journal_id });
        }

        // Case 2: Creating a new journal
        if (!summary || !debit_account || !credit_account || !amount) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const id = `JNL-${Date.now()}`;

        const stmt = db.prepare(`
      INSERT INTO journals (id, invoice_id, summary, debit_account, credit_account, amount, date, status, ai_generated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, invoice_id || null, summary, debit_account, credit_account, amount, date || new Date().toISOString().split('T')[0], 'Posted', 1);

        if (invoice_id) {
            db.prepare("UPDATE invoices SET status = 'Processed' WHERE id = ?").run(invoice_id);
        }

        return Response.json({ success: true, id });
    } catch (error) {
        console.error("Journal Confirmation Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

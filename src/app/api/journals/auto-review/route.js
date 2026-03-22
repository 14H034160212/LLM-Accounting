import db from '@/lib/db';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3:8b';

async function reviewJournal(journal, invoice) {
    const invoiceContext = invoice
        ? `Linked Invoice: seller="${invoice.seller}", amount=${invoice.amount}, tax=${invoice.tax}, type="${invoice.type}", currency="${invoice.currency}"`
        : 'No linked invoice found.';

    const prompt = `You are a strict AU/NZ accounting auditor. Review this AI-generated journal entry and decide if it should be APPROVED or flagged for REVIEW.

Journal Entry:
- Summary: ${journal.summary}
- Debit Account: ${journal.debit_account}
- Credit Account: ${journal.credit_account}
- Amount: ${journal.amount}
- Date: ${journal.date}
- ${invoiceContext}

Rules:
1. For supplier payments: Debit should be an Expense or Asset account, Credit should be Accounts Payable or Bank.
2. For sales: Debit should be Cash/Bank/Receivable, Credit should be Revenue.
3. Amount must be positive and reasonable.
4. Debit and Credit accounts must not be the same.
5. If amount is 0, flag for REVIEW.

Respond ONLY in JSON:
{"decision": "APPROVED" or "REVIEW", "reason": "one short sentence"}`;

    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [{ role: 'user', content: prompt }],
                stream: false,
                options: { temperature: 0.0, num_predict: 128 }
            }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        // Extract JSON from response
        const match = text.match(/\{[^}]+\}/s);
        if (match) {
            const parsed = JSON.parse(match[0]);
            return { decision: parsed.decision || 'REVIEW', reason: parsed.reason || '' };
        }
        return { decision: 'REVIEW', reason: 'Could not parse AI response' };
    } catch (e) {
        return { decision: 'REVIEW', reason: `AI error: ${e.message}` };
    }
}

export async function POST(req) {
    try {
        const { batch_size = 20 } = await req.json().catch(() => ({}));

        // Fetch pending AI-generated journals
        const journals = db.prepare(`
            SELECT j.*, i.seller, i.amount as inv_amount, i.tax, i.type, i.currency
            FROM journals j
            LEFT JOIN invoices i ON j.invoice_id = i.id
            WHERE j.status = 'AI Generated'
            LIMIT ?
        `).all(batch_size);

        if (journals.length === 0) {
            return Response.json({ success: true, processed: 0, message: 'No pending journals to review.' });
        }

        let approved = 0;
        let flagged = 0;
        const results = [];

        for (const j of journals) {
            const invoice = j.seller ? { seller: j.seller, amount: j.inv_amount, tax: j.tax, type: j.type, currency: j.currency } : null;
            const { decision, reason } = await reviewJournal(j, invoice);

            const newStatus = decision === 'APPROVED' ? 'Approved' : 'Needs Review';
            db.prepare("UPDATE journals SET status = ? WHERE id = ?").run(newStatus, j.id);

            if (decision === 'APPROVED') approved++;
            else flagged++;

            results.push({ id: j.id, decision, reason, status: newStatus });
        }

        return Response.json({
            success: true,
            processed: journals.length,
            approved,
            flagged,
            results
        });
    } catch (err) {
        console.error('Auto-review error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}

// GET: check how many journals are pending review
export async function GET() {
    const row = db.prepare("SELECT COUNT(*) as count FROM journals WHERE status = 'AI Generated'").get();
    return Response.json({ pending: row.count });
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3:8b";

export async function GET(req) {
    try {
        const journals = db.prepare('SELECT * FROM journals ORDER BY date DESC').all();
        return NextResponse.json(journals);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { action, ...data } = await req.json();

        if (action === 'generate_from_invoice') {
            const { invoice } = data;

            // Call Ollama to determine double entry bookkeeping accounts
            const prompt = `You are a strict automated accounting system for AU/NZ.
Given the following tax invoice details, generate the double-entry bookkeeping summary, debit account, and credit account.
Invoice ID: ${invoice.id}
Seller: ${invoice.seller}
Total amount: ${invoice.amount}
Tax (GST): ${invoice.tax}
Type: ${invoice.type}

Respond ONLY in strictly valid JSON format, with no markdown formatting or extra text.
{
  "summary": "Short description of the transaction",
  "debit_account": "Chart of account name for debit (e.g., 'Inventory', 'Expense - Utilities')",
  "credit_account": "Chart of account name for credit (e.g., 'Accounts Payable', 'Bank Account')"
}`;

            const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    prompt: prompt,
                    format: "json",
                    stream: false,
                    options: { temperature: 0.1 }
                })
            });

            if (!res.ok) throw new Error("Ollama generation failed");
            const ollamaResponse = await res.json();

            let aiAnalysis;
            try {
                aiAnalysis = JSON.parse(ollamaResponse.response);
            } catch (e) {
                console.error("Failed to parse Ollama JSON response", ollamaResponse.response);
                throw new Error("Invalid AI format generated");
            }

            const journalId = `JNL-${Date.now()}`;
            const insert = db.prepare(`
        INSERT INTO journals (id, invoice_id, summary, debit_account, credit_account, amount, date, status, ai_generated)
        VALUES (@id, @invoice_id, @summary, @debit_account, @credit_account, @amount, @date, @status, @ai_generated)
      `);

            const newJournal = {
                id: journalId,
                invoice_id: invoice.id,
                summary: aiAnalysis.summary,
                debit_account: aiAnalysis.debit_account,
                credit_account: aiAnalysis.credit_account,
                amount: invoice.amount,
                date: invoice.date,
                status: 'AI Generated',
                ai_generated: 1
            };

            insert.run(newJournal);

            return NextResponse.json({ success: true, journal: newJournal });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Journal POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

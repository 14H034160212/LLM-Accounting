import { NextResponse } from 'next/server';
import db from '@/lib/db';

function parseAmount(val) {
    if (typeof val === 'number') return val;
    return parseFloat(String(val || 0).replace(/[$,\s]/g, '')) || 0;
}

export async function GET(req) {
    try {
        const journals = db.prepare('SELECT summary, debit_account, credit_account, amount, date FROM journals WHERE status = "Approved" LIMIT 50').all();

        let totalRevenue = 0;
        let totalExpenses = 0;
        const expenseBreakdown = {};

        journals.forEach(j => {
            const amt = parseAmount(j.amount);
            const cr = (j.credit_account || '').toLowerCase();
            const dr = (j.debit_account || '').toLowerCase();
            if (cr.includes('revenue') || cr.includes('sales') || cr.includes('income')) {
                totalRevenue += amt;
            }
            if (dr.includes('expense') || dr.includes('inventory') || dr.includes('service') || dr.includes('rent') || dr.includes('wage')) {
                totalExpenses += amt;
                expenseBreakdown[j.debit_account] = (expenseBreakdown[j.debit_account] || 0) + amt;
            }
        });

        const topExpenses = Object.entries(expenseBreakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([account, amount]) => `${account}: $${amount.toFixed(2)}`)
            .join(', ');

        const invoiceCount = db.prepare('SELECT COUNT(*) as cnt FROM invoices').get().cnt;

        const prompt = `You are an expert CFO analyzing an AU/NZ small business.

Summary:
- Total Invoices Processed: ${invoiceCount}
- Total Revenue Recorded: A$${totalRevenue.toFixed(2)}
- Total Expenses Recorded: A$${totalExpenses.toFixed(2)}
- Net Position: A$${(totalRevenue - totalExpenses).toFixed(2)}
- Top Expense Categories: ${topExpenses || 'Various operating expenses'}
- Total Approved Journals: ${journals.length}

Provide a concise 3-part financial analysis. Reply ONLY in this exact JSON (no markdown, no extra text):
{"spending_anomalies":"1-2 sentences about unusual expenses or confirmation spending is normal","cash_flow_health":"1-2 sentences about revenue vs expense ratio and business health","tax_optimization":"1-2 sentences about AU GST/BAS compliance and tax deduction opportunities"}`;

        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const ollamaModel = process.env.OLLAMA_MODEL || 'llama3:8b';

        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: prompt,
                stream: false,
                format: 'json',
                options: { temperature: 0.1, num_predict: 300 }
            })
        });

        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

        const data = await response.json();
        const text = data.response || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let insights = {
            spending_anomalies: "Analysis unavailable.",
            cash_flow_health: "Analysis unavailable.",
            tax_optimization: "Analysis unavailable."
        };

        if (jsonMatch) {
            try { insights = JSON.parse(jsonMatch[0]); } catch {}
        } else {
            try { insights = JSON.parse(text); } catch {}
        }

        return NextResponse.json({ success: true, insights });
    } catch (error) {
        console.error("AI analysis error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

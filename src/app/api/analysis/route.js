import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req) {
    try {
        const journals = db.prepare('SELECT summary, debit_account, credit_account, amount, date FROM journals').all();

        // Aggregate high-level info to feed to the AI
        let totalRevenue = 0;
        let totalExpenses = 0;

        journals.forEach(j => {
            if (j.credit_account?.toLowerCase().includes('revenue') || j.credit_account?.toLowerCase().includes('sales')) {
                totalRevenue += j.amount;
            }
            if (j.debit_account?.toLowerCase().includes('expense') || j.debit_account?.toLowerCase().includes('inventory')) {
                totalExpenses += j.amount;
            }
        });

        const prompt = `
        You are an expert Chief Financial Officer (COMPANY CFO) analyzing a small business.
        You have access to the recent accounting journals.
        
        Total Revenue: $${totalRevenue}
        Total Expenses: $${totalExpenses}
        Recent Transactions: 
        ${JSON.stringify(journals, null, 2)}
        
        Provide a succinct, 3-part financial analysis formatted EXACTLY in this JSON structure without any additional markdown formatting or reasoning text outside the JSON:
        {
          "spending_anomalies": "A short 1-2 sentence analysis of any unusual expenses or confirmation that spending is normal.",
          "cash_flow_health": "A short 1-2 sentence assessment of the revenue vs expense ratio.",
          "tax_optimization": "A short 1-2 sentence suggestion for tax savings or compliance regarding these specific transactions."
        }
        `;

        const response = await fetch(process.env.OLLAMA_BASE_URL + '/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || 'qwen3:8b',
                prompt: prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error('Ollama connection failed');
        }

        const data = await response.json();
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        let insights = {
            spending_anomalies: "Could not generate insights.",
            cash_flow_health: "Could not generate insights.",
            tax_optimization: "Could not generate insights."
        };

        if (jsonMatch) {
            insights = JSON.parse(jsonMatch[0]);
        } else {
            insights = JSON.parse(data.response); // Try direct parse if regex fails
        }

        return NextResponse.json({ success: true, insights });
    } catch (error) {
        console.error("Failed to generate AI analysis:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '2025-H1'; // Simplified for demo

        // In a real app, we'd filter by period here. For now, aggregate from all journals.
        const journals = db.prepare('SELECT * FROM journals').all();

        // Mocking the GST calculation logic based on journals
        let totalSales = 0;
        let totalExpenses = 0;

        // Simulate aggregating sales and expenses based on credit/debit accounts
        journals.forEach(j => {
            if (j.credit_account?.toLowerCase().includes('revenue') || j.credit_account?.toLowerCase().includes('sales')) {
                totalSales += j.amount;
            }
            if (j.debit_account?.toLowerCase().includes('expense') || j.debit_account?.toLowerCase().includes('inventory')) {
                totalExpenses += j.amount;
            }
        });

        // If no real data yet, provide defaults from DB or 0
        // Simplified logic: Output tax = totalSales * 10%, Input tax = totalExpenses * 10%
        const output_tax = totalSales * 0.1;
        const input_tax = totalExpenses * 0.1;
        const net_payable = output_tax - input_tax;

        return NextResponse.json({
            period,
            sales: totalSales,
            output_tax,
            input_tax,
            net_payable,
            status: net_payable > 0 ? "Pending" : "Filed",
            deadline: "2025-07-28" // Static for demo
        });

    } catch (error) {
        console.error("Failed to fetch tax data:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

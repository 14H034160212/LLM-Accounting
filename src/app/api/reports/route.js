import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '2025-H1';

        const journals = db.prepare('SELECT * FROM journals').all();

        // Aggregate income statement
        let revenue = 0;
        let expenses = 0;
        let totalTax = 0;

        journals.forEach(j => {
            if (j.credit_account?.toLowerCase().includes('revenue') || j.credit_account?.toLowerCase().includes('sales')) {
                revenue += j.amount;
            }
            if (j.debit_account?.toLowerCase().includes('expense') || j.debit_account?.toLowerCase().includes('inventory')) {
                expenses += j.amount;
            }
        });

        const invoices = db.prepare('SELECT amount, tax FROM invoices').all();
        invoices.forEach(inv => {
            totalTax += inv.tax;
        });

        const operating_profit = revenue - expenses - totalTax;
        const net_profit = operating_profit * 0.85; // rough estimate of tax deduction

        return NextResponse.json({
            period,
            income_statement: {
                revenue,
                expenses,
                tax_and_surcharges: totalTax,
                operating_profit,
                net_profit
            }
        });

    } catch (error) {
        console.error("Failed to fetch reports data:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import db from '@/lib/db';

export async function GET(req) {
    try {
        // 1. Calculate Internal Metrics
        // Revenue (from Sales/Revenue accounts)
        const revenueRow = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Revenue%' OR credit_account LIKE '%Revenue%' OR credit_account LIKE '%Sales%'").get();
        // Expenses
        const expensesRow = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Expense%' OR credit_account LIKE '%Expense%'").get();

        const internalRevenue = revenueRow?.total || 0;
        const internalExpenses = expensesRow?.total || 0;
        const internalMargin = internalRevenue > 0 ? ((internalRevenue - internalExpenses) / internalRevenue) * 100 : 0;

        // 2. Fetch Industry Benchmarks (Simulated for Year 1 - based on ASX/NZX data)
        const benchmarks = {
            sector: "SME General",
            averages: {
                margin: 22.5,
                opexRatio: 45.0,
                revenueGrowth: 5.2
            }
        };

        return Response.json({
            internal: {
                revenue: internalRevenue,
                expenses: internalExpenses,
                margin: internalMargin.toFixed(2),
                opexRatio: ((internalExpenses / internalRevenue) * 100).toFixed(2)
            },
            benchmark: benchmarks,
            comparison: {
                marginGap: (internalMargin - benchmarks.averages.margin).toFixed(2),
                status: internalMargin > benchmarks.averages.margin ? "Above Average" : "Opportunity for Improvement"
            }
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

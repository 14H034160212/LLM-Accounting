import db from './db';

export function getInternalBusinessContext() {
    try {
        // 1. Get Profit & Loss Summary
        let revenueRow = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Revenue%' OR credit_account LIKE '%Revenue%' OR credit_account LIKE '%Sales%'").get();
        let expensesRow = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Expense%' OR credit_account LIKE '%Expense%'").get();

        // 2. Document Processing Status
        const stats = db.prepare("SELECT reextract_status, COUNT(*) as count FROM invoices GROUP BY reextract_status").all();
        const statusMap = stats.reduce((acc, s) => ({ ...acc, [s.reextract_status]: s.count }), {});

        // 3. Top Vendors
        const topVendors = db.prepare("SELECT seller, SUM(amount) as total FROM invoices GROUP BY seller ORDER BY total DESC LIMIT 5").all();

        // 4. Top Expense Categories (from Journals)
        const topCategories = db.prepare("SELECT debit_account, SUM(amount) as total FROM journals WHERE debit_account NOT LIKE '%Cash%' AND debit_account NOT LIKE '%Bank%' GROUP BY debit_account ORDER BY total DESC LIMIT 5").all();

        let context = "\n\n--- INTERNAL BUSINESS DATA (EXECUTIVE SUMMARY) ---\n";
        context += `Financial Health:
- Official Revenue (from Journals): $${(revenueRow?.total || 0).toLocaleString()}
- Official Expenses (from Journals): $${(expensesRow?.total || 0).toLocaleString()}
- Current Profit/Loss: $${((revenueRow?.total || 0) - (expensesRow?.total || 0)).toLocaleString()}\n`;

        context += `\nTop Vendors (by Spend):
${topVendors.length > 0 ? topVendors.map(v => `- ${v.seller || 'Unknown'}: $${(v.total || 0).toLocaleString()}`).join('\n') : "- No vendor data available."}\n`;

        context += `\nTop Expense Categories:
${topCategories.length > 0 ? topCategories.map(c => `- ${c.debit_account}: $${(c.total || 0).toLocaleString()}`).join('\n') : "- No categories mapped yet."}\n`;

        context += `\nAI Extraction Pipeline Status:
- Pending: ${statusMap.pending || 0}
- Processing: ${statusMap.processing || 0}
- Completed: ${statusMap.completed || 0} (Available for analysis)\n`;

        // 5. Get Recent Invoices
        const recentInvoices = db.prepare("SELECT seller, amount, date FROM invoices WHERE reextract_status = 'completed' ORDER BY date DESC LIMIT 5").all();
        if (recentInvoices.length > 0) {
            context += `\nLast 5 Verified Transactions:\n`;
            recentInvoices.forEach(inv => {
                context += `- ${inv.date}: ${inv.seller} ($${inv.amount})\n`;
            });
        }

        context += `\nBusiness Context:
- Currency: AUD/NZD
- Compliance: AU/NZ Tax Standards
- Sector: SME General\n`;

        return context;
    } catch (err) {
        console.error("Context Builder Error:", err);
        return "Internal financial context is currently unavailable.";
    }
}

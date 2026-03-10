import db from './db';

export function getInternalBusinessContext() {
    try {
        // 1. Get Profit & Loss Summary (Simplified from journals)
        const revenue = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Revenue%' OR credit_account LIKE '%Revenue%' OR credit_account LIKE '%Sales%'").get();
        const expenses = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Expense%' OR credit_account LIKE '%Expense%'").get();

        // 2. Get Recent Invoices
        const recentInvoices = db.prepare("SELECT seller, amount, date, status FROM invoices ORDER BY date DESC LIMIT 5").all();

        // 3. Get Tax Status
        const taxStatus = db.prepare("SELECT period, net_payable, status FROM tax_records ORDER BY deadline DESC LIMIT 1").get();

        let context = "\n\n--- INTERNAL BUSINESS DATA (PRIVATE) ---\n";
        context += `Overview:
- Total Revenue: $${revenue?.total || 0}
- Total Expenses: $${expenses?.total || 0}
- Net Profit: $${(revenue?.total || 0) - (expenses?.total || 0)}\n`;

        if (taxStatus) {
            context += `Tax Status:
- Current Period: ${taxStatus.period}
- Net Payable: $${taxStatus.net_payable}
- Status: ${taxStatus.status}\n`;
        }

        if (recentInvoices.length > 0) {
            context += `Recent Transactions:\n`;
            recentInvoices.forEach(inv => {
                context += `- ${inv.date}: ${inv.seller} ($${inv.amount}) - ${inv.status}\n`;
            });
        }

        return context;
    } catch (err) {
        console.error("Context Builder Error:", err);
        return "";
    }
}

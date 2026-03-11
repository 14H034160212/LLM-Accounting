import db from './db';

export function getInternalBusinessContext() {
    try {
        // 1. Get Profit & Loss Summary
        // Check journals first (official records)
        let revenueRow = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Revenue%' OR credit_account LIKE '%Revenue%' OR credit_account LIKE '%Sales%'").get();
        let expensesRow = db.prepare("SELECT SUM(amount) as total FROM journals WHERE debit_account LIKE '%Expense%' OR credit_account LIKE '%Expense%'").get();

        // Check invoices (raw data)
        const invoiceTotal = db.prepare("SELECT SUM(amount) as total FROM invoices").get();
        const invoiceCount = db.prepare("SELECT COUNT(*) as count FROM invoices").get();

        // Get Tax Status
        const taxStatus = db.prepare("SELECT * FROM tax_records ORDER BY period DESC LIMIT 1").get();

        let context = "\n\n--- INTERNAL BUSINESS DATA (PRIVATE) ---\n";
        context += `Financial Summary:
- Official Revenue (from Journals): $${revenueRow?.total || 0}
- Official Expenses (from Journals): $${expensesRow?.total || 0}
- Current Profit/Loss: $${(revenueRow?.total || 0) - (expensesRow?.total || 0)}
- Raw Invoice Total (Accounts Payable/Receivable): $${invoiceTotal?.total || 0} (${invoiceCount?.count || 0} documents)\n`;

        if (taxStatus) {
            context += `Tax Status (GST/BAS):
- Current Period: ${taxStatus.period}
- Net Payable: $${taxStatus.net_payable}
- Status: ${taxStatus.status}\n`;
        } else {
            context += `Tax Status: No records found for current period.\n`;
        }

        // 2. Get Recent Invoices
        const recentInvoices = db.prepare("SELECT seller, amount, date, status FROM invoices ORDER BY date DESC LIMIT 10").all();

        if (recentInvoices.length > 0) {
            context += `Recent Transactions:\n`;
            recentInvoices.forEach(inv => {
                context += `- ${inv.date}: ${inv.seller} ($${inv.amount}) - ${inv.status}\n`;
            });
        }

        // 3. Metadata for Benchmarking
        context += `\nBusiness Context:
- Currency: AUD/NZD
- Compliance: AU/NZ Tax Standards
- Sector: General SME (Benchmarking against ASX/NZX Year 1 data enabled)\n`;

        return context;
    } catch (err) {
        console.error("Context Builder Error:", err);
        return "Internal financial context is currently unavailable due to a system error.";
    }
}

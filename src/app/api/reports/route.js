import { NextResponse } from 'next/server';
import db from '@/lib/db';

function parseAmount(val) {
    if (typeof val === 'number') return val;
    return parseFloat(String(val || 0).replace(/[$,\s]/g, '')) || 0;
}

export async function GET(req) {
    try {
        const journals = db.prepare(`SELECT * FROM journals WHERE status = 'Approved'`).all();
        const invoices = db.prepare(`SELECT id, seller, amount, tax, date, status FROM invoices`).all();

        // === TRIAL BALANCE ===
        const accountMap = {};
        journals.forEach(j => {
            const amount = parseAmount(j.amount);
            const dr = j.debit_account || 'Unclassified';
            const cr = j.credit_account || 'Unclassified';
            if (!accountMap[dr]) accountMap[dr] = { debit: 0, credit: 0 };
            if (!accountMap[cr]) accountMap[cr] = { debit: 0, credit: 0 };
            accountMap[dr].debit += amount;
            accountMap[cr].credit += amount;
        });
        const trialBalance = Object.entries(accountMap)
            .map(([account, { debit, credit }]) => ({ account, debit, credit, net: debit - credit }))
            .sort((a, b) => (b.debit + b.credit) - (a.debit + a.credit));
        const totalDebits = trialBalance.reduce((s, r) => s + r.debit, 0);
        const totalCredits = trialBalance.reduce((s, r) => s + r.credit, 0);

        // === P&L ===
        let revenue = 0, cogs = 0, totalOpex = 0;
        const opexBreakdown = {};

        journals.forEach(j => {
            const amount = parseAmount(j.amount);
            const dr = (j.debit_account || '').toLowerCase();
            const cr = (j.credit_account || '').toLowerCase();
            const drName = j.debit_account || 'Other Expense';

            if (cr.includes('sales') || cr.includes('revenue') || cr.includes('income') || cr.includes('service revenue')) {
                revenue += amount;
            }
            if (dr.includes('cogs') || dr.includes('cost of sales') || dr.includes('inventory') || dr.includes('purchases') || dr.includes('cost of goods')) {
                cogs += amount;
            }
            if (dr.includes('expense') || dr.includes('service fee') || dr.includes('rent') ||
                dr.includes('utility') || dr.includes('wage') || dr.includes('salary') ||
                dr.includes('insurance') || dr.includes('depreciation') || dr.includes('legal') ||
                dr.includes('marketing') || dr.includes('phone') || dr.includes('travel') ||
                dr.includes('professional') || dr.includes('audit') || dr.includes('freight') ||
                dr.includes('printing') || dr.includes('stationery') || dr.includes('subscription') ||
                dr.includes('telecommunication') || dr.includes('postage') || dr.includes('cleaning') ||
                dr.includes('repairs') || dr.includes('maintenance') || dr.includes('advertising')) {
                opexBreakdown[drName] = (opexBreakdown[drName] || 0) + amount;
                totalOpex += amount;
            }
        });

        const gross_profit = revenue - cogs;
        const ebit = gross_profit - totalOpex;
        const income_tax = Math.max(0, ebit * 0.25);
        const net_profit = ebit - income_tax;

        // === INVOICE TOTALS for GST ===
        let totalPurchases = 0, totalGSTonPurchases = 0;
        invoices.forEach(inv => {
            totalPurchases += parseAmount(inv.amount);
            totalGSTonPurchases += parseAmount(inv.tax);
        });

        // === AP AGING ===
        const today = new Date();
        const apRows = db.prepare(`
            SELECT i.id, i.seller, i.amount, i.date
            FROM invoices i
            JOIN journals j ON j.invoice_id = i.id
            WHERE (LOWER(j.credit_account) LIKE '%payable%'
                OR LOWER(j.credit_account) LIKE '%creditor%'
                OR LOWER(j.credit_account) LIKE '%accounts payable%')
            AND j.status = 'Approved'
            GROUP BY i.id
        `).all();

        const agingBuckets = { current: 0, days_30_60: 0, days_60_90: 0, days_90plus: 0 };
        const agingDetails = [];

        apRows.forEach(inv => {
            const invDate = new Date(inv.date);
            const days = isNaN(invDate) ? 0 : Math.floor((today - invDate) / 86400000);
            const amt = parseAmount(inv.amount);
            agingDetails.push({ seller: inv.seller, invoice_id: inv.id, amount: amt, date: inv.date, days_outstanding: days });
            if (days <= 30) agingBuckets.current += amt;
            else if (days <= 60) agingBuckets.days_30_60 += amt;
            else if (days <= 90) agingBuckets.days_60_90 += amt;
            else agingBuckets.days_90plus += amt;
        });
        const totalAP = Object.values(agingBuckets).reduce((a, b) => a + b, 0);

        // === BALANCE SHEET (from journals) ===
        let bankAssets = 0;
        journals.forEach(j => {
            const amount = parseAmount(j.amount);
            const dr = (j.debit_account || '').toLowerCase();
            if (dr.includes('bank') || dr.includes('cash at bank') || dr.includes('cash on hand')) {
                bankAssets += amount;
            }
        });
        const netGSTPayable = Math.max(0, (revenue * 0.1) - totalGSTonPurchases);
        const balanceSheet = {
            assets: {
                cash_and_bank: bankAssets,
                accounts_receivable: 0,
                total_current_assets: bankAssets,
                fixed_assets: 0,
                total_assets: bankAssets
            },
            liabilities: {
                accounts_payable: totalAP,
                gst_payable: netGSTPayable,
                total_current_liabilities: totalAP + netGSTPayable,
                total_liabilities: totalAP + netGSTPayable
            },
            equity: {
                retained_earnings: net_profit,
                total_equity: net_profit
            }
        };

        // === CASH FLOW (simplified from journals) ===
        let cfOperating = 0, cfInvesting = 0, cfFinancing = 0;
        journals.forEach(j => {
            const amount = parseAmount(j.amount);
            const dr = (j.debit_account || '').toLowerCase();
            const cr = (j.credit_account || '').toLowerCase();
            if (dr.includes('expense') || dr.includes('service fee') || dr.includes('wage') || dr.includes('rent')) {
                cfOperating -= amount;
            }
            if (cr.includes('sales') || cr.includes('revenue')) {
                cfOperating += amount;
            }
            if (dr.includes('equipment') || dr.includes('fixed asset') || dr.includes('vehicle') || dr.includes('property')) {
                cfInvesting -= amount;
            }
            if (cr.includes('loan') || cr.includes('mortgage') || cr.includes('finance lease')) {
                cfFinancing += amount;
            }
        });

        return NextResponse.json({
            generated_at: new Date().toISOString(),
            summary: {
                journal_count: journals.length,
                invoice_count: invoices.length,
                total_purchases: totalPurchases,
                revenue,
                net_profit,
                has_revenue: revenue > 0
            },
            income_statement: {
                revenue,
                cogs,
                gross_profit,
                gross_margin_pct: revenue > 0 ? (gross_profit / revenue * 100) : 0,
                operating_expenses: opexBreakdown,
                total_opex: totalOpex,
                ebit,
                income_tax,
                net_profit
            },
            balance_sheet: balanceSheet,
            trial_balance: {
                accounts: trialBalance,
                total_debits: totalDebits,
                total_credits: totalCredits
            },
            ap_aging: {
                buckets: agingBuckets,
                total: totalAP,
                details: agingDetails.sort((a, b) => b.days_outstanding - a.days_outstanding).slice(0, 30)
            },
            gst: {
                total_purchases: totalPurchases,
                gst_input_credits: totalGSTonPurchases,
                gst_on_sales: revenue * 0.1,
                net_gst_payable: (revenue * 0.1) - totalGSTonPurchases,
                deadline: '2025-07-28'
            },
            cash_flow: {
                operating: cfOperating,
                investing: cfInvesting,
                financing: cfFinancing,
                net: cfOperating + cfInvesting + cfFinancing
            }
        });

    } catch (error) {
        console.error("Reports error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

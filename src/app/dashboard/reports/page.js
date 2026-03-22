"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Download, Calendar, DollarSign,
  Activity, RefreshCw, FileText, AlertCircle, CheckCircle,
  Package, CreditCard, BarChart3
} from "lucide-react";

function fmt(num) {
  if (typeof num !== "number") num = parseFloat(num) || 0;
  return num.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── P&L Row ──────────────────────────────────────────────────────────────────
function Row({ label, amount, sub, total, highlight }) {
  const neg = typeof amount === "number" && amount < 0;
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg
      ${total ? "bg-slate-900 mt-1" : highlight ? "bg-blue-50 border border-blue-200" : sub ? "" : ""}`}>
      <span className={`text-sm ${total ? "text-white font-bold" : highlight ? "text-blue-800 font-semibold" : sub ? "text-slate-500 pl-4" : "text-slate-700 font-medium"}`}>
        {label}
      </span>
      <span className={`text-sm font-bold tabular-nums ${total ? "text-white" : highlight ? "text-blue-700" : neg ? "text-red-600" : "text-slate-900"}`}>
        {typeof amount === "number"
          ? neg ? `(A$${fmt(Math.abs(amount))})` : `A$${fmt(amount)}`
          : amount}
      </span>
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "pl",    label: "P&L Statement" },
  { id: "bs",    label: "Balance Sheet" },
  { id: "tb",    label: "Trial Balance" },
  { id: "ap",    label: "AP Aging" },
  { id: "cf",    label: "Cash Flow" },
  { id: "gst",   label: "GST / BAS" },
  { id: "ai",    label: "AI Analysis" },
  { id: "audit", label: "Audit Alerts" },
];

// ─── P&L Tab ──────────────────────────────────────────────────────────────────
function PLTab({ d }) {
  const is = d.income_statement;
  const opex = Object.entries(is.operating_expenses || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-400 mb-3">Based on {d.summary.journal_count} approved journals · FY 2025</p>
      <div className="space-y-0.5">
        <div className="px-4 py-1.5"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</p></div>
        <Row label="Sales / Service Revenue" amount={is.revenue} />
        <Row label="Total Revenue" amount={is.revenue} highlight />

        <div className="px-4 py-1.5 mt-2"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost of Goods Sold</p></div>
        <Row label="Inventory / Cost of Sales" amount={is.cogs > 0 ? -is.cogs : 0} sub />
        <Row label="Gross Profit" amount={is.gross_profit} highlight />

        <div className="px-4 py-1.5 mt-2"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</p></div>
        {opex.length > 0
          ? opex.map(([acct, amt]) => <Row key={acct} label={acct} amount={-amt} sub />)
          : <Row label="Total Operating Expenses" amount={-is.total_opex} sub />
        }
        <Row label="Total Operating Expenses" amount={-is.total_opex} highlight />

        <div className="h-1" />
        <Row label="EBIT (Earnings Before Tax)" amount={is.ebit} highlight />
        <Row label="Income Tax Provision (25%)" amount={-is.income_tax} sub />
        <Row label="Net Profit / (Loss)" amount={is.net_profit} total />
      </div>
      {!d.summary.has_revenue && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-700"><strong>Note:</strong> No sales revenue journals detected. All current entries are purchase/expense transactions. Revenue journals are recorded when sales invoices are processed.</p>
        </div>
      )}
    </div>
  );
}

// ─── Balance Sheet Tab ────────────────────────────────────────────────────────
function BSTab({ d }) {
  const bs = d.balance_sheet;
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-slate-50 rounded-xl p-5 space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assets</p>
        <Row label="Cash & Bank" amount={bs.assets.cash_and_bank} sub />
        <Row label="Accounts Receivable" amount={bs.assets.accounts_receivable} sub />
        <Row label="Total Current Assets" amount={bs.assets.total_current_assets} highlight />
        <Row label="Fixed Assets (Net)" amount={0} sub />
        <Row label="TOTAL ASSETS" amount={bs.assets.total_assets} total />
      </div>
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-5 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Liabilities</p>
          <Row label="Accounts Payable" amount={bs.liabilities.accounts_payable} sub />
          <Row label="GST Payable" amount={bs.liabilities.gst_payable} sub />
          <Row label="TOTAL LIABILITIES" amount={bs.liabilities.total_liabilities} total />
        </div>
        <div className="bg-slate-50 rounded-xl p-5 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Equity</p>
          <Row label="Retained Earnings" amount={bs.equity.retained_earnings} sub />
          <Row label="TOTAL EQUITY" amount={bs.equity.total_equity} total />
        </div>
      </div>
    </div>
  );
}

// ─── Trial Balance Tab ────────────────────────────────────────────────────────
function TBTab({ d }) {
  const tb = d.trial_balance;
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-600 text-left">
            <th className="px-4 py-2.5 rounded-tl-lg font-semibold">Account</th>
            <th className="px-4 py-2.5 text-right font-semibold">Debit (A$)</th>
            <th className="px-4 py-2.5 text-right font-semibold">Credit (A$)</th>
            <th className="px-4 py-2.5 text-right rounded-tr-lg font-semibold">Net (A$)</th>
          </tr>
        </thead>
        <tbody>
          {tb.accounts.map((row, i) => (
            <tr key={row.account} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
              <td className="px-4 py-2 text-slate-700">{row.account}</td>
              <td className="px-4 py-2 text-right text-slate-900 tabular-nums">{row.debit > 0 ? fmt(row.debit) : "–"}</td>
              <td className="px-4 py-2 text-right text-slate-900 tabular-nums">{row.credit > 0 ? fmt(row.credit) : "–"}</td>
              <td className={`px-4 py-2 text-right font-semibold tabular-nums ${row.net < 0 ? "text-red-600" : "text-slate-900"}`}>
                {row.net < 0 ? `(${fmt(Math.abs(row.net))})` : fmt(row.net)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-900 text-white font-bold">
            <td className="px-4 py-3 rounded-bl-lg">TOTALS</td>
            <td className="px-4 py-3 text-right tabular-nums">{fmt(tb.total_debits)}</td>
            <td className="px-4 py-3 text-right tabular-nums">{fmt(tb.total_credits)}</td>
            <td className="px-4 py-3 text-right tabular-nums rounded-br-lg">{fmt(tb.total_debits - tb.total_credits)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── AP Aging Tab ─────────────────────────────────────────────────────────────
function APTab({ d }) {
  const ap = d.ap_aging;
  const buckets = [
    { label: "Current (0–30d)", amount: ap.buckets.current, color: "bg-green-500" },
    { label: "30–60 days", amount: ap.buckets.days_30_60, color: "bg-amber-500" },
    { label: "60–90 days", amount: ap.buckets.days_60_90, color: "bg-orange-500" },
    { label: "Overdue 90d+", amount: ap.buckets.days_90plus, color: "bg-red-500" },
  ];
  const maxAmt = Math.max(...buckets.map(b => b.amount), 1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {buckets.map(b => (
          <div key={b.label} className="bg-slate-50 rounded-xl p-4">
            <div className={`w-8 h-1.5 ${b.color} rounded-full mb-2`} />
            <p className="text-xs text-slate-500 mb-1">{b.label}</p>
            <p className="text-lg font-bold text-slate-900">A${fmt(b.amount)}</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className={`${b.color} h-1.5 rounded-full transition-all`} style={{ width: `${(b.amount / maxAmt) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-700">Total Accounts Payable: <span className="text-blue-600">A${fmt(ap.total)}</span></p>
      {ap.details.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="text-left px-4 py-2 rounded-tl-lg">Supplier</th>
              <th className="text-right px-4 py-2">Amount (A$)</th>
              <th className="text-right px-4 py-2">Invoice Date</th>
              <th className="text-right px-4 py-2 rounded-tr-lg">Days O/S</th>
            </tr>
          </thead>
          <tbody>
            {ap.details.map((row, i) => (
              <tr key={row.invoice_id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                <td className="px-4 py-2 text-slate-700">{row.seller}</td>
                <td className="px-4 py-2 text-right font-semibold tabular-nums">{fmt(row.amount)}</td>
                <td className="px-4 py-2 text-right text-slate-500">{row.date}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.days_outstanding <= 30 ? "bg-green-100 text-green-700" :
                    row.days_outstanding <= 60 ? "bg-amber-100 text-amber-700" :
                    row.days_outstanding <= 90 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                  }`}>{row.days_outstanding}d</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-slate-400 text-sm text-center py-8">No AP entries found. Payables are tracked when journals credit an Accounts Payable account.</p>
      )}
    </div>
  );
}

// ─── Cash Flow Tab ────────────────────────────────────────────────────────────
function CFTab({ d }) {
  const cf = d.cash_flow;
  const rows = [
    { label: "Operating Activities", desc: "Day-to-day business income and expenses", amount: cf.operating },
    { label: "Investing Activities", desc: "Capital assets and equipment purchases", amount: cf.investing },
    { label: "Financing Activities", desc: "Loans, equity contributions and repayments", amount: cf.financing },
  ];
  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.label} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-700">{row.label}</p>
            <p className="text-xs text-slate-400">{row.desc}</p>
          </div>
          <span className={`text-sm font-bold tabular-nums ${row.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
            {row.amount >= 0 ? "+" : ""}A${fmt(row.amount)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 rounded-xl">
        <div>
          <p className="text-sm font-bold text-white">Net Cash Movement</p>
          <p className="text-xs text-slate-400">Total cash in / (out) this period</p>
        </div>
        <span className={`text-sm font-bold tabular-nums ${cf.net >= 0 ? "text-green-400" : "text-red-400"}`}>
          {cf.net >= 0 ? "+" : ""}A${fmt(cf.net)}
        </span>
      </div>
    </div>
  );
}

// ─── GST Tab ──────────────────────────────────────────────────────────────────
function GSTTab({ d }) {
  const g = d.gst;
  const netPos = g.net_gst_payable >= 0;
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-700">Next BAS lodgement deadline: <strong>{g.deadline}</strong></p>
      </div>
      {[
        { label: "Total Purchases (excl. GST)", desc: "Gross spend on all 7,394 invoices", amount: g.total_purchases },
        { label: "GST Input Credits (on purchases)", desc: "10% on all purchase invoices", amount: g.gst_input_credits },
        { label: "GST on Sales", desc: "10% on revenue journals", amount: g.gst_on_sales },
      ].map(row => (
        <div key={row.label} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-700">{row.label}</p>
            <p className="text-xs text-slate-400">{row.desc}</p>
          </div>
          <span className="text-sm font-bold text-slate-900 tabular-nums">A${fmt(row.amount)}</span>
        </div>
      ))}
      <div className={`flex items-center justify-between px-4 py-4 rounded-xl border ${netPos ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
        <div>
          <p className={`text-sm font-bold ${netPos ? "text-red-800" : "text-green-800"}`}>Net GST {netPos ? "Payable" : "Refund"}</p>
          <p className="text-xs text-slate-400">= GST on Sales − Input Credits</p>
        </div>
        <span className={`text-xl font-bold tabular-nums ${netPos ? "text-red-700" : "text-green-700"}`}>
          {netPos ? "" : "-"}A${fmt(Math.abs(g.net_gst_payable))}
        </span>
      </div>
    </div>
  );
}

// ─── AI Analysis Tab ──────────────────────────────────────────────────────────
function AITab({ insights, loading }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
      <p className="text-sm text-slate-500">AI CFO is analysing your financials...</p>
      <p className="text-xs text-slate-400 mt-1">This may take 15–30 seconds</p>
    </div>
  );
  if (!insights) return <p className="text-slate-400 text-sm text-center py-8">AI analysis unavailable. Check Ollama is running on port 11434.</p>;
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-semibold text-amber-800 mb-1.5">⚠️ Spending Anomalies</p>
        <p className="text-amber-700 text-sm leading-relaxed">{insights.spending_anomalies}</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="font-semibold text-green-800 mb-1.5">✅ Cash Flow Health</p>
        <p className="text-green-700 text-sm leading-relaxed">{insights.cash_flow_health}</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-blue-800 mb-1.5">💡 Tax Compliance & Optimisation</p>
        <p className="text-blue-700 text-sm leading-relaxed">{insights.tax_optimization}</p>
      </div>
    </div>
  );
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────
function AuditTab({ auditData, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center py-12 gap-3">
      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      <p className="text-sm text-slate-500">Running audit scan across all invoices...</p>
    </div>
  );
  if (!auditData || auditData.status === "error") return (
    <p className="text-red-500 text-sm py-6 text-center">{auditData?.message || "Audit unavailable."}</p>
  );
  if (auditData.status === "insufficient_data") return (
    <p className="text-slate-400 text-sm py-6 text-center">Insufficient data for audit analysis.</p>
  );
  const alerts = auditData.alerts || [];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
          {auditData.total_documents} documents analysed
        </span>
        <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${alerts.length === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">All clear. No anomalies or duplicate risks detected.</p>
        </div>
      ) : alerts.map((alert, i) => (
        <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
          alert.severity === "High" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
        }`}>
          <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === "High" ? "text-red-500" : "text-amber-500"}`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${alert.severity === "High" ? "text-red-700" : "text-amber-700"}`}>{alert.type}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${alert.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{alert.severity}</span>
            </div>
            <p className={`text-sm ${alert.severity === "High" ? "text-red-600" : "text-amber-600"}`}>{alert.description}</p>
            {alert.invoice_id && <p className="text-xs text-slate-400 mt-0.5">Invoice: {alert.invoice_id}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("pl");
  const [period, setPeriod] = useState("2025-FY");
  const [reportData, setReportData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?period=${period}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setReportData(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetch("/api/analysis")
      .then(r => r.json())
      .then(data => { if (data.success) setInsights(data.insights); })
      .catch(console.error)
      .finally(() => setLoadingInsights(false));

    fetch("/api/analysis/audit")
      .then(r => r.json())
      .then(data => setAuditData(data))
      .catch(console.error)
      .finally(() => setLoadingAudit(false));
  }, []);

  const d = reportData;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500 text-sm">AI-generated · All statements · Real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-transparent outline-none text-sm text-slate-600">
              <option value="2025-FY">FY 2025</option>
              <option value="2025-H2">2025 H2</option>
              <option value="2025-Q4">2025 Q4</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button
            onClick={() => { setLoading(true); fetch(`/api/reports?period=${period}`).then(r=>r.json()).then(d=>{if(!d.error)setReportData(d)}).finally(()=>setLoading(false)); }}
            className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:from-blue-700 transition-all">
            <Download className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {d && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Purchases", value: `A$${fmt(d.summary.total_purchases)}`, icon: Package, color: "from-blue-500 to-blue-600" },
            { label: "Net Profit / (Loss)", value: `A$${fmt(d.income_statement.net_profit)}`, icon: TrendingUp, color: d.income_statement.net_profit >= 0 ? "from-green-500 to-emerald-600" : "from-red-500 to-red-600" },
            { label: "Journals Approved", value: String(d.summary.journal_count), icon: FileText, color: "from-cyan-500 to-blue-500" },
            { label: "GST Input Credits", value: `A$${fmt(d.gst.gst_input_credits)}`, icon: CreditCard, color: "from-indigo-500 to-violet-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="tech-card p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 border-b border-slate-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tech-card p-6">
        {loading && activeTab !== "ai" && activeTab !== "audit" ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading financial data...</p>
          </div>
        ) : !d && activeTab !== "ai" && activeTab !== "audit" ? (
          <p className="text-slate-400 text-sm text-center py-8">No data available.</p>
        ) : (
          <>
            {activeTab === "pl"    && d && <PLTab d={d} />}
            {activeTab === "bs"    && d && <BSTab d={d} />}
            {activeTab === "tb"    && d && <TBTab d={d} />}
            {activeTab === "ap"    && d && <APTab d={d} />}
            {activeTab === "cf"    && d && <CFTab d={d} />}
            {activeTab === "gst"   && d && <GSTTab d={d} />}
            {activeTab === "ai"    && <AITab insights={insights} loading={loadingInsights} />}
            {activeTab === "audit" && <AuditTab auditData={auditData} loading={loadingAudit} />}
          </>
        )}
      </div>
    </div>
  );
}

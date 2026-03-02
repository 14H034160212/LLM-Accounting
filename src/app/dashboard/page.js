"use client";

import Link from "next/link";
import {
  TrendingUp, TrendingDown, FileText, Calculator, AlertCircle,
  CheckCircle, Clock, ArrowRight, Bot, Users, Building2,
  DollarSign, CreditCard, BarChart3, PieChart, Activity,
  ChevronRight, Zap, MessageSquare
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, change, positive, icon: Icon, color }) {
  return (
    <div className="tech-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4.5 h-4.5 text-white" style={{ width: "18px", height: "18px" }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mb-2">{sub}</p>}
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {change}
        </div>
      )}
    </div>
  );
}

// ─── Recent Journals ───────────────────────────────────────────────────────────
const vouchers = [
  { id: "JNL-2025-0891", type: "Sales Revenue", amount: "A$58,000", date: "2025-06-15", status: "Approved" },
  { id: "JNL-2025-0890", type: "Cost of Goods", amount: "A$23,400", date: "2025-06-14", status: "Pending" },
  { id: "JNL-2025-0889", type: "Payroll", amount: "A$85,000", date: "2025-06-14", status: "Approved" },
  { id: "JNL-2025-0888", type: "Travel Expenses", amount: "A$3,280", date: "2025-06-13", status: "AI Generated" },
  { id: "JNL-2025-0887", type: "Utilities", amount: "A$1,560", date: "2025-06-13", status: "Approved" },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────
const tasks = [
  { title: "June GST / BAS Lodgement", deadline: "2025-07-28", priority: "Urgent", done: false },
  { title: "Q2 Income Tax Instalment", deadline: "2025-07-28", priority: "Important", done: false },
  { title: "Upload June Input Invoices", deadline: "2025-06-30", priority: "Normal", done: true },
  { title: "Reconcile June Payroll", deadline: "2025-06-28", priority: "Normal", done: true },
  { title: "Annual Audit Preparation", deadline: "2025-07-31", priority: "Important", done: false },
];

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  { href: "/dashboard/accounting", icon: Calculator, label: "AI Bookkeeping", color: "from-blue-500 to-blue-600", desc: "Smart bookkeeping" },
  { href: "/dashboard/invoices", icon: FileText, label: "Upload Invoice", color: "from-cyan-500 to-blue-500", desc: "Invoice management" },
  { href: "/dashboard/tax", icon: Zap, label: "File Tax", color: "from-indigo-500 to-blue-600", desc: "Tax lodgement" },
  { href: "/dashboard/customer-service", icon: MessageSquare, label: "AI Support", color: "from-violet-500 to-indigo-600", desc: "Tax Q&A" },
];

// ─── Bar Chart (simple CSS) ───────────────────────────────────────────────────
const monthlyData = [
  { month: "Jan", income: 65, expense: 45 },
  { month: "Feb", income: 52, expense: 38 },
  { month: "Mar", income: 78, expense: 52 },
  { month: "Apr", income: 85, expense: 60 },
  { month: "May", income: 92, expense: 58 },
  { month: "Jun", income: 88, expense: 55 },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Alex · Sydney Tech Pty Ltd</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-700">AI Agent Running</span>
        </div>
      </div>

      {/* AI Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">AI has completed this month&apos;s bookkeeping</p>
            <p className="text-blue-200 text-sm">Auto-recorded 234 transactions, generated 89 journals, scanned 312 invoices</p>
          </div>
        </div>
        <Link href="/dashboard/accounting" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map(({ href, icon: Icon, label, color, desc }) => (
          <Link key={label} href={href}>
            <div className="tech-card p-4 flex flex-col items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Revenue" value="A$88.6K" sub="88 invoices issued" change="+12.3% vs last month" positive={true} icon={TrendingUp} color="from-green-500 to-emerald-600" />
        <StatCard title="Monthly Expenses" value="A$55.2K" sub="Journals recorded" change="-5.8% vs last month" positive={true} icon={BarChart3} color="from-blue-500 to-blue-600" />
        <StatCard title="Tax Payable" value="A$12.4K" sub="GST + Income Tax" change="June" positive={true} icon={FileText} color="from-amber-500 to-orange-500" />
        <StatCard title="Pending Tasks" value="3 items" sub="Requires your review" change="1 urgent" positive={false} icon={AlertCircle} color="from-red-500 to-rose-600" />
      </div>

      {/* Charts + Tasks */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly chart */}
        <div className="lg:col-span-2 tech-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue vs Expenses (2025)</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />Expenses</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-40">
            {monthlyData.map(({ month, income, expense }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1 h-32">
                  <div
                    className="flex-1 bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${income}%` }}
                  />
                  <div
                    className="flex-1 bg-slate-200 rounded-t-md transition-all"
                    style={{ height: `${expense}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="tech-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">To-Do Tasks</h3>
            <span className="text-xs text-slate-400">5 items</span>
          </div>
          <div className="space-y-3">
            {tasks.map(({ title, deadline, priority, done }) => (
              <div key={title} className={`flex items-start gap-3 p-3 rounded-xl ${done ? "bg-slate-50" : "bg-blue-50/60"}`}>
                {done
                  ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  : <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{deadline}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  priority === "Urgent" ? "status-error" :
                  priority === "Important" ? "status-warning" : "status-info"
                }`}>{priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Journals */}
      <div className="tech-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">Recent Journals</h3>
          <Link href="/dashboard/accounting" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Journal #</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(({ id, type, amount, date, status }) => (
                <tr key={id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-xs text-slate-500">{id}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{type}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">{amount}</td>
                  <td className="py-3 px-3 text-slate-500">{date}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      status === "Approved" ? "status-success" :
                      status === "AI Generated" ? "status-info" : "status-warning"
                    }`}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

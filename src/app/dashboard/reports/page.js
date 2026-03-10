"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Download, Calendar,
  ChevronDown, FileSpreadsheet, PieChart, DollarSign, Activity,
  ArrowUp, ArrowDown, RefreshCw, Eye, FileText, Printer
} from "lucide-react";

// Mock data removed
// Mock data removed

// ─── Components ───────────────────────────────────────────────────────────────
function SectionHeader({ title, desc, onDownload, onPrint }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onPrint && (
          <button onClick={onPrint} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
            <Printer className="w-3.5 h-3.5" /> 打印
          </button>
        )}
        {onDownload && (
          <button onClick={onDownload} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> 导出Excel
          </button>
        )}
      </div>
    </div>
  );
}

// Unused static tabs removed.

// TrendChart removed
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [period, setPeriod] = useState("2025-H1");
  const [reportData, setReportData] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetch(`/api/reports?period=${period}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setReportData(data);
      })
      .catch(console.error);

    fetch('/api/analysis')
      .then(res => res.json())
      .then(data => {
        if (data.success) setInsights(data.insights);
      })
      .catch(console.error);
  }, [period]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">财务报表</h1>
          <p className="text-slate-500 text-sm">AI自动生成 · 符合会计准则 · 实时更新</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="2025-H1">2025年上半年</option>
              <option value="2025-Q2">2025年第二季度</option>
              <option value="2025-06">2025年6月</option>
              <option value="2024-full">2024年全年</option>
            </select>
          </div>
          <button className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> 刷新数据
          </button>
          <button className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all">
            <Download className="w-4 h-4" /> 导出全部报表
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "营业收入", value: reportData ? `¥${reportData.income_statement.revenue.toFixed(2)}` : "¥0.00", change: "+0%", positive: true, icon: TrendingUp, color: "from-blue-500 to-blue-600" },
          { label: "净利润", value: reportData ? `¥${reportData.income_statement.net_profit.toFixed(2)}` : "¥0.00", change: "+0%", positive: true, icon: DollarSign, color: "from-green-500 to-emerald-600" },
          { label: "净利润率", value: reportData && reportData.income_statement.revenue > 0 ? `${((reportData.income_statement.net_profit / reportData.income_statement.revenue) * 100).toFixed(1)}%` : "0%", change: "+0pp", positive: true, icon: BarChart3, color: "from-cyan-500 to-blue-500" },
          { label: "总税费与附加", value: reportData ? `¥${reportData.income_statement.tax_and_surcharges.toFixed(2)}` : "¥0.00", change: "+0%", positive: true, icon: Activity, color: "from-indigo-500 to-violet-600" },
        ].map(({ label, value, change, positive, icon: Icon, color }) => (
          <div key={label} className="tech-card p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
              {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              较上期 {change}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-5">
        <div className="grid lg:grid-cols-1 gap-5">
          {/* AI Analysis */}
          <div className="tech-card p-6 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">AI Financial Insights (CFO Analysis)</h3>
            </div>

            {!insights ? (
              <div className="flex justify-center flex-col items-center py-10">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-sm text-slate-500">AcctAI is analyzing your current databases...</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-800 mb-1 flex items-center gap-2">⚠️ Spending Anomalies</p>
                  <p className="text-amber-700 text-sm">{insights.spending_anomalies}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-1 flex items-center gap-2">✅ Cash Flow Health</p>
                  <p className="text-green-700 text-sm">{insights.cash_flow_health}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-semibold text-blue-800 mb-1 flex items-center gap-2">💡 Tax Compliance & Optimization</p>
                  <p className="text-blue-700 text-sm">{insights.tax_optimization}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

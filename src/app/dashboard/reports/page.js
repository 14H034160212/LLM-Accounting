"use client";

import { useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Download, Calendar,
  ChevronDown, FileSpreadsheet, PieChart, DollarSign, Activity,
  ArrowUp, ArrowDown, RefreshCw, Eye, FileText, Printer
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const incomeStatement = [
  { label: "一、营业收入", value: "1,286,400.00", bold: true, level: 0 },
  { label: "减：营业成本", value: "748,200.00", level: 1 },
  { label: "税金及附加", value: "62,069.60", level: 1 },
  { label: "销售费用", value: "58,000.00", level: 1 },
  { label: "管理费用", value: "192,300.00", level: 1 },
  { label: "研发费用", value: "35,000.00", level: 1 },
  { label: "财务费用", value: "12,800.00", level: 1 },
  { label: "二、营业利润", value: "178,030.40", bold: true, level: 0, highlight: true },
  { label: "加：营业外收入", value: "5,000.00", level: 1 },
  { label: "减：营业外支出", value: "2,400.00", level: 1 },
  { label: "三、利润总额", value: "180,630.40", bold: true, level: 0 },
  { label: "减：所得税费用", value: "27,094.56", level: 1 },
  { label: "四、净利润", value: "153,535.84", bold: true, level: 0, highlight: true, positive: true },
];

const balanceSheet = {
  assets: [
    { label: "流动资产", items: [
      { name: "货币资金", value: "¥386,200.00" },
      { name: "应收账款", value: "¥234,800.00" },
      { name: "存货", value: "¥158,600.00" },
      { name: "预付账款", value: "¥42,000.00" },
      { name: "其他流动资产", value: "¥18,500.00" },
    ], total: "¥840,100.00" },
    { label: "非流动资产", items: [
      { name: "固定资产（净值）", value: "¥520,000.00" },
      { name: "无形资产", value: "¥80,000.00" },
      { name: "长期投资", value: "¥200,000.00" },
    ], total: "¥800,000.00" },
  ],
  liabilities: [
    { label: "流动负债", items: [
      { name: "短期借款", value: "¥150,000.00" },
      { name: "应付账款", value: "¥186,400.00" },
      { name: "应交税费", value: "¥62,069.60" },
      { name: "应付职工薪酬", value: "¥85,000.00" },
      { name: "其他流动负债", value: "¥28,000.00" },
    ], total: "¥511,469.60" },
    { label: "非流动负债", items: [
      { name: "长期借款", value: "¥300,000.00" },
      { name: "递延税款", value: "¥15,000.00" },
    ], total: "¥315,000.00" },
  ],
  equity: [
    { name: "实收资本", value: "¥500,000.00" },
    { name: "盈余公积", value: "¥160,095.56" },
    { name: "未分配利润", value: "¥153,535.84" },
  ],
};

const cashFlow = [
  { category: "经营活动", items: [
    { label: "销售商品收到的现金", value: "+1,326,400.00", positive: true },
    { label: "支付给职工的现金", value: "-255,000.00", positive: false },
    { label: "支付的各项税费", value: "-62,069.60", positive: false },
    { label: "支付其他经营现金", value: "-310,000.00", positive: false },
  ], net: "+699,330.40", positive: true },
  { category: "投资活动", items: [
    { label: "购买固定资产支出", value: "-80,000.00", positive: false },
    { label: "收回投资收到的现金", value: "+50,000.00", positive: true },
  ], net: "-30,000.00", positive: false },
  { category: "筹资活动", items: [
    { label: "借款收到的现金", value: "+200,000.00", positive: true },
    { label: "偿还债务支付的现金", value: "-150,000.00", positive: false },
    { label: "分配股利支付的现金", value: "-50,000.00", positive: false },
  ], net: "+0.00", positive: true },
];

const monthlyTrend = [
  { month: "1月", revenue: 186400, profit: 28600, expense: 157800 },
  { month: "2月", revenue: 142000, profit: 18200, expense: 123800 },
  { month: "3月", revenue: 218600, profit: 38400, expense: 180200 },
  { month: "4月", revenue: 235800, profit: 42800, expense: 193000 },
  { month: "5月", revenue: 268400, profit: 52400, expense: 216000 },
  { month: "6月", revenue: 235200, profit: 45600, expense: 189600 },
];

const maxRevenue = Math.max(...monthlyTrend.map(d => d.revenue));

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

function IncomeStatementTab() {
  return (
    <div className="tech-card p-6">
      <SectionHeader
        title="利润表"
        desc="2025年1月 - 6月（半年报） · AI自动生成"
        onPrint={() => {}}
        onDownload={() => {}}
      />
      <div className="space-y-1">
        {incomeStatement.map(({ label, value, bold, level, highlight, positive }) => (
          <div
            key={label}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
              highlight
                ? positive
                  ? "bg-green-50 border border-green-200"
                  : "bg-blue-50 border border-blue-200"
                : level === 0
                  ? "bg-slate-50"
                  : "bg-white"
            }`}
          >
            <span className={`text-sm ${
              bold ? "font-bold text-slate-900" : "text-slate-600"
            } ${level === 1 ? "pl-4" : ""}`}>
              {label}
            </span>
            <span className={`text-sm font-semibold ${
              highlight && positive ? "text-green-700 text-base font-bold" :
              highlight ? "text-blue-700 text-base font-bold" :
              bold ? "text-slate-900" : "text-slate-700"
            }`}>
              ¥{value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-green-100 text-sm">本期净利润</p>
          <p className="text-white text-2xl font-bold">¥153,535.84</p>
        </div>
        <div className="text-right">
          <p className="text-green-200 text-xs">净利润率</p>
          <p className="text-white text-xl font-bold flex items-center gap-1 justify-end">
            <TrendingUp className="w-5 h-5" /> 11.9%
          </p>
        </div>
      </div>
    </div>
  );
}

function BalanceSheetTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Assets */}
      <div className="tech-card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-4 bg-blue-500 rounded-full inline-block" />
          资产
        </h3>
        {balanceSheet.assets.map(({ label, items, total }) => (
          <div key={label} className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{label}</p>
            <div className="space-y-1.5">
              {items.map(({ name, value }) => (
                <div key={name} className="flex justify-between text-sm px-3 py-2 bg-blue-50/50 rounded-lg">
                  <span className="text-slate-600 pl-2">{name}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm px-3 py-2 bg-blue-100 rounded-lg font-bold">
                <span className="text-blue-800">{label}合计</span>
                <span className="text-blue-800">{total}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between px-3 py-3 bg-blue-600 rounded-xl text-white font-bold mt-2">
          <span>资产总计</span>
          <span>¥1,640,100.00</span>
        </div>
      </div>

      {/* Liabilities + Equity */}
      <div className="tech-card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-4 bg-indigo-500 rounded-full inline-block" />
          负债及所有者权益
        </h3>
        {balanceSheet.liabilities.map(({ label, items, total }) => (
          <div key={label} className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{label}</p>
            <div className="space-y-1.5">
              {items.map(({ name, value }) => (
                <div key={name} className="flex justify-between text-sm px-3 py-2 bg-indigo-50/50 rounded-lg">
                  <span className="text-slate-600 pl-2">{name}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm px-3 py-2 bg-indigo-100 rounded-lg font-bold">
                <span className="text-indigo-800">{label}合计</span>
                <span className="text-indigo-800">{total}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">所有者权益</p>
          <div className="space-y-1.5">
            {balanceSheet.equity.map(({ name, value }) => (
              <div key={name} className="flex justify-between text-sm px-3 py-2 bg-green-50/50 rounded-lg">
                <span className="text-slate-600 pl-2">{name}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm px-3 py-2 bg-green-100 rounded-lg font-bold">
              <span className="text-green-800">所有者权益合计</span>
              <span className="text-green-800">¥813,631.40</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between px-3 py-3 bg-indigo-600 rounded-xl text-white font-bold mt-2">
          <span>负债和所有者权益总计</span>
          <span>¥1,640,100.00</span>
        </div>
      </div>
    </div>
  );
}

function CashFlowTab() {
  return (
    <div className="space-y-4">
      {cashFlow.map(({ category, items, net, positive }) => (
        <div key={category} className="tech-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">{category}现金流量</h3>
            <div className={`flex items-center gap-1 text-sm font-bold ${positive ? "text-green-600" : "text-red-500"}`}>
              {positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              ¥{net}
            </div>
          </div>
          <div className="space-y-2">
            {items.map(({ label, value, positive: pos }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-sm font-semibold ${pos ? "text-green-600" : "text-red-500"}`}>¥{value}</span>
              </div>
            ))}
          </div>
          <div className={`mt-3 flex items-center justify-between px-4 py-3 rounded-xl font-bold ${
            positive ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <span className={positive ? "text-green-700" : "text-red-700"}>{category}活动产生的现金流量净额</span>
            <span className={positive ? "text-green-700" : "text-red-700"}>¥{net}</span>
          </div>
        </div>
      ))}
      <div className="tech-card p-5 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">现金净增加额</p>
            <p className="text-white text-2xl font-bold mt-1">¥669,330.40</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">期末现金余额</p>
            <p className="text-white text-xl font-bold mt-1">¥386,200.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendChart() {
  return (
    <div className="tech-card p-6">
      <SectionHeader title="收入与利润趋势（2025年上半年）" desc="单位：元" onDownload={() => {}} />
      <div className="flex items-end gap-4 h-48 mb-2">
        {monthlyTrend.map(({ month, revenue, profit, expense }) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-1 h-40">
              <div
                className="flex-1 bg-blue-500 rounded-t-md"
                style={{ height: `${(revenue / maxRevenue) * 100}%` }}
                title={`收入: ¥${revenue.toLocaleString()}`}
              />
              <div
                className="flex-1 bg-slate-200 rounded-t-md"
                style={{ height: `${(expense / maxRevenue) * 100}%` }}
                title={`支出: ¥${expense.toLocaleString()}`}
              />
              <div
                className="flex-1 bg-green-400 rounded-t-md"
                style={{ height: `${(profit / maxRevenue) * 100}%` }}
                title={`利润: ¥${profit.toLocaleString()}`}
              />
            </div>
            <span className="text-xs text-slate-400">{month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />收入</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />支出</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />利润</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("2025-H1");

  const tabs = [
    { key: "overview", label: "综合概览" },
    { key: "income", label: "利润表" },
    { key: "balance", label: "资产负债表" },
    { key: "cashflow", label: "现金流量表" },
  ];

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
          { label: "营业收入", value: "¥128.6万", change: "+18.4%", positive: true, icon: TrendingUp, color: "from-blue-500 to-blue-600" },
          { label: "净利润", value: "¥15.4万", change: "+22.1%", positive: true, icon: DollarSign, color: "from-green-500 to-emerald-600" },
          { label: "净利润率", value: "11.9%", change: "+2.3pp", positive: true, icon: BarChart3, color: "from-cyan-500 to-blue-500" },
          { label: "总资产", value: "¥164.0万", change: "+8.6%", positive: true, icon: Activity, color: "from-indigo-500 to-violet-600" },
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

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              activeTab === key ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <TrendChart />
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Key ratios */}
            <div className="tech-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">核心财务指标</h3>
              <div className="space-y-3">
                {[
                  { label: "流动比率", value: "1.64", note: "流动资产/流动负债", ok: true },
                  { label: "资产负债率", value: "50.4%", note: "总负债/总资产", ok: true },
                  { label: "营业利润率", value: "13.8%", note: "营业利润/营业收入", ok: true },
                  { label: "净资产收益率", value: "18.9%", note: "净利润/所有者权益", ok: true },
                  { label: "应收账款周转率", value: "5.5次", note: "年化，资产利用效率高", ok: true },
                ].map(({ label, value, note, ok }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{note}</p>
                    </div>
                    <span className={`text-sm font-bold ${ok ? "text-green-600" : "text-red-500"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="tech-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">收入构成</h3>
              <div className="space-y-3">
                {[
                  { name: "主营业务收入", amount: "¥116.8万", pct: 90.8, color: "bg-blue-500" },
                  { name: "其他业务收入", amount: "¥11.8万", pct: 9.2, color: "bg-cyan-400" },
                ].map(({ name, amount, pct, color }) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-700">{name}</span>
                      <span className="font-semibold text-slate-900">{amount}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 text-right">{pct}%</p>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">费用构成</h4>
                  {[
                    { name: "营业成本", pct: 73.3, color: "bg-slate-400" },
                    { name: "税金及附加", pct: 6.1, color: "bg-amber-400" },
                    { name: "销售费用", pct: 5.7, color: "bg-orange-400" },
                    { name: "管理费用", pct: 18.8, color: "bg-red-400" },
                  ].map(({ name, pct, color }) => (
                    <div key={name} className="flex items-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-sm ${color} flex-shrink-0`} />
                      <span className="text-xs text-slate-600 flex-1">{name}</span>
                      <span className="text-xs font-medium text-slate-700">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="tech-card p-6 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">AI财务分析</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="font-semibold text-green-800 mb-1">✅ 优势</p>
                  <p className="text-green-700 text-xs">营收同比增长18.4%，净利润率达11.9%，高于同行8-10%平均水平。现金流健康，经营活动现金净流入¥69.9万。</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="font-semibold text-amber-800 mb-1">⚠️ 关注点</p>
                  <p className="text-amber-700 text-xs">应收账款¥23.5万，账龄需关注。资产负债率50.4%在合理范围，但长期借款¥30万需留意还款压力。</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="font-semibold text-blue-800 mb-1">💡 优化建议</p>
                  <p className="text-blue-700 text-xs">建议申请高新技术企业认定，可将所得税率从25%降至15%，预计节税约¥10,000/年。研发费用可申请100%加计扣除。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "income" && <IncomeStatementTab />}
      {activeTab === "balance" && <BalanceSheetTab />}
      {activeTab === "cashflow" && <CashFlowTab />}
    </div>
  );
}

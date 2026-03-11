"use client";

import { useState, useEffect } from "react";
import {
    Brain, TrendingUp, Target, Zap, Shield, ChevronRight,
    ArrowUpRight, ArrowDownRight, Globe, Lock, Sparkles,
    Award, BarChart3, PieChart, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntelligenceHub() {
    const [loading, setLoading] = useState(true);
    const [activeSegment, setActiveSegment] = useState("strategy");
    const [anomalies, setAnomalies] = useState([]);
    const [taxData, setTaxData] = useState(null);
    const [cashflowData, setCashflowData] = useState(null);
    const [auditData, setAuditData] = useState(null);
    const [benchmarks, setBenchmarks] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [anomalyRes, taxRes, cfRes, adRes, benchRes] = await Promise.all([
                    fetch("/api/analysis/anomalies"),
                    fetch("/api/analysis/tax"),
                    fetch("/api/analysis/cashflow"),
                    fetch("/api/analysis/audit"),
                    fetch("/api/analysis/benchmark")
                ]);

                const aData = await anomalyRes.json();
                const tData = await taxRes.json();
                const cData = await cfRes.json();
                const dData = await adRes.json();
                const bData = await benchRes.json();

                if (aData.status === "success") setAnomalies(aData.results);
                if (tData.status === "success") setTaxData(tData);
                if (cData.status === "success") setCashflowData(cData);
                if (dData.status === "success") setAuditData(dData);
                if (!bData.error) setBenchmarks(bData);
            } catch (err) {
                console.error("Failed to fetch intelligence data", err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Helper to format large numbers compactly
    const formatCompact = (num) => {
        if (!num) return "$0";
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}k`;
        return `$${num.toLocaleString()}`;
    };

    const stats = [
        {
            label: "EST. TAX PAYABLE (GST)",
            value: taxData ? formatCompact(taxData.total_gst_input) : "$0",
            change: "Live Forecast",
            trend: "up"
        },
        {
            label: "TOTAL EXPENDITURE",
            value: taxData ? formatCompact(taxData.total_expenditure) : "$0",
            change: "Ingestion Active",
            trend: "neutral"
        },
        {
            label: "INTERNAL MARGIN",
            value: benchmarks ? `${benchmarks.internal.margin}%` : "0%",
            change: benchmarks?.comparison.status || "Analyzing",
            trend: (benchmarks?.internal.margin > benchmarks?.benchmark.averages.margin) ? "up" : "down"
        }
    ];

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-500 font-medium animate-pulse">Synthesizing Business Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-full bg-slate-50 flex flex-col gap-8">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Phase 2: Live</div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enterprise Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Chief <span className="text-blue-600">Intelligence</span> Hub</h1>
                    <p className="text-slate-500 font-medium max-w-lg mt-2">
                        AI-driven strategic nexus linking internal operational data with ASX/NZX market benchmarks.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Globe className="w-4 h-4 text-blue-500" /> Export Dossier
                    </button>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20">
                        <Zap className="w-4 h-4 text-amber-400" /> Executive Action
                    </button>
                </div>
            </div>

            {/* KPI Ribbons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group cursor-default"
                    >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</span>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' :
                                stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                                {stat.change}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">

                {/* Benchmarking Visualization */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Industry Benchmarking
                                </h2>
                                <p className="text-xs text-slate-400 font-bold tracking-tight">VITALITY COMPARISON VS. INDUSTRY AVERAGES</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['Growth', 'Efficiency', 'Risk'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setActiveSegment(s.toLowerCase())}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeSegment === s.toLowerCase() ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col justify-center">
                                <div className="space-y-8">
                                    {benchmarks ? [
                                        { label: "Gross Margin", you: parseFloat(benchmarks.internal.margin), market: benchmarks.benchmark.averages.margin, color: "bg-blue-600" },
                                        { label: "OpEx Ratio", you: parseFloat(benchmarks.internal.opexRatio), market: benchmarks.benchmark.averages.opexRatio, color: "bg-cyan-500" },
                                        { label: "Revenue Growth", you: 0, market: benchmarks.benchmark.averages.revenueGrowth, color: "bg-indigo-500" }
                                    ].map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm font-black text-slate-700">{item.label}</span>
                                                <div className="flex gap-4">
                                                    <span className="text-xs font-black text-blue-600">YOU: {item.you}%</span>
                                                    <span className="text-xs font-black text-slate-400">BENCHMARK: {item.market}%</span>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.market}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="absolute inset-y-0 bg-slate-300 rounded-full opacity-50"
                                                />
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.you}%` }}
                                                    transition={{ duration: 1.2, delay: 0.8 }}
                                                    className={`absolute inset-y-0 ${item.color} rounded-full z-10`}
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-12 text-center text-slate-400 font-medium">
                                            Generating Benchmarks...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 text-blue-600 transform group-hover:rotate-12 transition-transform">
                                    <Award className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                                    {benchmarks?.comparison.status || "Analyzing Efficiency"}
                                </h3>
                                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                    {benchmarks ? `Your margin is ${Math.abs(benchmarks.comparison.marginGap)}% ${parseFloat(benchmarks.comparison.marginGap) > 0 ? 'higher' : 'lower'} than industry.` : "Scanning financial data..."}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-200 w-full">
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                        <span>Performance Tier</span>
                                        <span className="text-blue-600">{parseFloat(benchmarks?.comparison.marginGap) > 5 ? "Top Tier" : "Market Average"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Audit Ledger Category Visualization */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-indigo-600" />
                                    Automated Ledger Sort
                                </h3>
                                <p className="text-xs text-slate-400 font-bold tracking-tight">AI PRE-CATEGORIZATION OF LATEST INGESTIONS</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            {auditData?.summary ? Object.entries(auditData.summary).map(([category, count], idx) => {
                                const total = Object.values(auditData.summary).reduce((a, b) => a + b, 0) || 1;
                                const percent = Math.round((count / total) * 100);
                                const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-cyan-500', 'bg-slate-300'];
                                return (
                                    <div key={category} className="flex-1">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-xs font-bold text-slate-600 truncate mr-2" title={category}>{category.split(' ')[0]}</span>
                                            <span className="text-xs font-black text-slate-900">{count} docs</span>
                                        </div>
                                        <div className="h-8 bg-slate-100 rounded-xl overflow-hidden relative">
                                            <div className={`absolute inset-y-0 left-0 ${colors[idx % colors.length]} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-sm text-slate-400 py-4 flex items-center gap-2">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                                    AI is auditing incoming invoices...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Strategic Roadmap & AI Insights */}
                <div className="flex flex-col gap-8 xl:col-span-2">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transform rotate-12">
                            <Brain className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                Strategic AI Guard
                            </h3>

                            <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] scrollbar-hidden pb-4">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Predictive Cash Flow</h4>
                                                <p className="text-[10px] text-slate-400">Next 30-Day Burn</p>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-white mb-2">
                                            {cashflowData?.next_30_days_forecast ? formatCompact(cashflowData.next_30_days_forecast) : "Calc..."}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-cyan-400">Conf: {cashflowData ? Math.round(cashflowData.confidence_score * 100) : 0}%</span>
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-400" style={{ width: `${cashflowData ? cashflowData.confidence_score * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 group relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                                    <Target className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm">Tax Optimization</h4>
                                                    <p className="text-[10px] text-slate-400">GST Input Credits</p>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-black text-white mb-2">
                                                {taxData?.total_gst_input ? formatCompact(taxData.total_gst_input) : "Calc..."}
                                            </div>
                                            <p className="text-[10px] text-indigo-300 font-medium leading-tight">Ready for BAS submission</p>
                                        </div>
                                    </div>
                                </div>
                                {anomalies.length > 0 ? anomalies.map((item, idx) => (
                                    <div key={idx} className="group cursor-pointer">
                                        <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                                            <div className={`w-12 h-12 rounded-2xl ${item.type === 'Price Outlier' ? 'bg-amber-400/10' : 'bg-red-400/10'
                                                } flex items-center justify-center flex-shrink-0`}>
                                                {item.type === 'Price Outlier' ?
                                                    <Zap className="w-6 h-6 text-amber-400" /> :
                                                    <Shield className="w-6 h-6 text-red-400" />
                                                }
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black uppercase ${item.type === 'Price Outlier' ? 'text-amber-400' : 'text-red-400'
                                                        }`}>{item.type}</span>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{item.severity} SEVERITY</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-white mb-1">{item.description}</h4>
                                                <p className="text-[12px] text-slate-400 leading-snug">ID: {item.invoice_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                                        <Shield className="w-12 h-12 text-slate-500 mb-4" />
                                        <p className="text-white font-bold">Scanning for Risks...</p>
                                        <p className="text-xs text-slate-400 mt-2">AI is monitoring the incoming invoice stream. Strategic anomalies will appear here.</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/5">
                                Full AI Analysis <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

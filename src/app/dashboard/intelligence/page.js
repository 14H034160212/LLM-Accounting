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

    useEffect(() => {
        setTimeout(() => setLoading(false), 800);
    }, []);

    const stats = [
        { label: "Efficiency Score", value: "94.2", change: "+2.1%", trend: "up" },
        { label: "Tax Liability Buffer", value: "$42k", change: "-5.4%", trend: "down" },
        { label: "R&D Multiplier", value: "1.8x", change: "+0.3%", trend: "up" },
        { label: "Market Fit Index", value: "88/100", change: "Stable", trend: "neutral" },
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">

                {/* Benchmarking Visualization */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Industry Benchmarking
                                </h2>
                                <p className="text-xs text-slate-400 font-bold tracking-tight">VITALITY COMPARISON VS. ASX TELECOM SECTOR</p>
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

                        <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="flex flex-col justify-center">
                                <div className="space-y-8">
                                    {[
                                        { label: "Gross Margin", you: 68, market: 52, color: "bg-blue-600" },
                                        { label: "OpEx Ratio", you: 34, market: 44, color: "bg-cyan-500" },
                                        { label: "Net Asset Multiplier", you: 82, market: 71, color: "bg-indigo-500" }
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
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-6 text-blue-600 transform group-hover:rotate-12 transition-transform">
                                    <Award className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Superior Efficiency</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Your operational efficiency is <span className="text-blue-600 font-bold">12.4% higher</span> than the industry average. This provides significant leverage for R&D reinvestment.
                                </p>
                                <div className="mt-8 pt-8 border-t border-slate-200 w-full">
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                                        <span>Performance Tier</span>
                                        <span className="text-blue-600">TOP 5%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategic Roadmap & AI Insights */}
                <div className="flex flex-col gap-8">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transform rotate-12">
                            <Brain className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                Strategic AI Guard
                            </h3>

                            <div className="space-y-6 flex-1">
                                {[
                                    {
                                        type: "Opportunity",
                                        title: "R&D Tax Incentive",
                                        desc: "Based on recent project spend, you qualify for a $38,500 refundable offset. Claim now to boost Q4 cash flow.",
                                        icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10"
                                    },
                                    {
                                        type: "Risk",
                                        title: "Margin Compression",
                                        desc: "Energy costs are trending up in ASX reports. Internal supplier costs up 8%. Recommendation: Hedge Q3 utilities.",
                                        icon: Shield, color: "text-red-400", bg: "bg-red-400/10"
                                    },
                                    {
                                        type: "Benchmark",
                                        title: "Asset Utilization",
                                        desc: "Your asset turnover of 2.1x exceeds SPK (1.8x). High efficiency confirmed. Strategy: Maintain current scale.",
                                        icon: Target, color: "text-cyan-400", bg: "bg-cyan-400/10"
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="group cursor-pointer">
                                        <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                                            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                                                <item.icon className={`w-6 h-6 ${item.color}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.type}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                                                <p className="text-[12px] text-slate-400 leading-snug">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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

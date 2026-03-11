"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Send, FileText, CheckCircle, TrendingUp, BarChart3,
    Search, Eye, Sparkles, RotateCcw, LineChart, Globe, ExternalLink,
    Activity, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, Info
} from "lucide-react";

export default function MarketAnalysisPage() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content: "Welcome to the Market Analyst hub. I can help you analyze the latest annual reports from ASX/NZX listed companies and compare them with your internal performance.",
            time: "10:00",
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [benchmarks, setBenchmarks] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch reports
                const repRes = await fetch("/api/market/reports");
                const repData = await repRes.json();
                if (Array.isArray(repData)) setAnnouncements(repData);

                // Fetch benchmarks
                const benchRes = await fetch("/api/analysis/benchmark");
                const benchData = await benchRes.json();
                setBenchmarks(benchData);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        };
        fetchData();
    }, []);

    const confirmJournal = async (journalData) => {
        try {
            const res = await fetch("/api/journals/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoice_id: "manual-" + Date.now(),
                    ...journalData
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, {
                    role: "ai",
                    content: `✅ Successfully synced to official records. Journal ID: ${data.journalId}`,
                    time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
                }]);
            }
        } catch (err) {
            console.error("Sync error:", err);
        }
    };

    const send = async () => {
        if (!input.trim()) return;
        const now = new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
        const userMsg = { role: "user", content: input, time: now };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages, role: "market-analyst" }),
            });
            const data = await res.json();
            setMessages(m => [...m, {
                role: "ai",
                content: data.error ? `⚠️ ${data.error}` : data.content,
                time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
            }]);
        } catch {
            setMessages(m => [...m, {
                role: "ai",
                content: "⚠️ Unable to connect to AI. Please ensure Ollama is running.",
                time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderContentWithActions = (content) => {
        const journalMatch = content.match(/\[PROPOSE_JOURNAL: (\{.*?\})\]/);
        if (journalMatch) {
            try {
                const journalData = JSON.parse(journalMatch[1]);
                const cleanContent = content.replace(journalMatch[0], "");
                return (
                    <div className="flex flex-col gap-3">
                        <p>{cleanContent}</p>
                        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Proposed Journal Entry</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-600">
                                <div><span className="text-slate-400">Debit:</span> {journalData.debit_account}</div>
                                <div><span className="text-slate-400">Credit:</span> {journalData.credit_account}</div>
                                <div className="col-span-2"><span className="text-slate-400">Summary:</span> {journalData.summary}</div>
                            </div>
                            <div className="text-sm font-black text-blue-600 mt-1">${journalData.amount.toLocaleString()}</div>
                            <button
                                onClick={() => confirmJournal(journalData)}
                                className="mt-2 w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                Confirm & Sync to Ledger
                            </button>
                        </div>
                    </div>
                );
            } catch (e) { return <p>{content}</p>; }
        }
        return <p>{content}</p>;
    };

    return (
        <div className="relative min-h-full bg-slate-50 overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-400/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 p-6 h-full flex flex-col gap-6 max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                <LineChart className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Market<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500"> Analyst</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            Integrated private intelligence active
                        </p>
                    </div>
                </motion.div>

                {/* Benchmarking HUD */}
                {benchmarks && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Internal Margin</span>
                                {benchmarks.internal.margin > benchmarks.benchmark.averages.margin ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-amber-500" />}
                            </div>
                            <div className="text-2xl font-black text-slate-900">{benchmarks.internal.margin}%</div>
                            <div className="text-[10px] mt-1 text-slate-400">Sector Avg: {benchmarks.benchmark.averages.margin}%</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">OpEx Efficiency</span>
                                <Activity className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-2xl font-black text-slate-900">{benchmarks.internal.opexRatio}%</div>
                            <div className="text-[10px] mt-1 text-slate-400">Efficiency Gap: {(benchmarks.internal.opexRatio - benchmarks.benchmark.averages.opexRatio).toFixed(1)}%</div>
                        </div>
                        <div className="bg-indigo-600 p-5 rounded-3xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-lg font-black">{benchmarks.comparison.status}</div>
                                <div className="text-[10px] opacity-70 mt-1">Benchmarked against ASX/NZX Year 1</div>
                            </div>
                            <TrendingUp className="absolute right-[-10px] bottom-[-10px] w-20 h-20 opacity-10" />
                        </div>
                    </motion.div>
                )}

                <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8 flex flex-col bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hidden">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, i) => (
                                    <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                        {msg.role === "ai" && (
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20">
                                                <Bot className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                                            <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all ${msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                                                : "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100"
                                                }`}>
                                                {renderContentWithActions(msg.content)}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase px-1">{msg.time}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {loading && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg"><Bot className="w-6 h-6 text-white animate-pulse" /></div>
                                    <div className="bg-white/50 backdrop-blur-md px-5 py-4 rounded-2xl flex items-center gap-3 border border-blue-100/50"><span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Cross-referencing market data...</span></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-6 bg-gradient-to-t from-white via-white/80 to-transparent">
                            <div className="relative flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-xl shadow-blue-900/5">
                                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="How does my OpEx compare to Spark NZ?" className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none" />
                                <button onClick={send} disabled={!input.trim() || loading} className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:grayscale">
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4 flex flex-col gap-6 min-w-0">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl shadow-slate-200/50 flex flex-col h-[60%] overflow-hidden">
                            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-6">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Market Archive
                            </h3>
                            <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-hidden">
                                {announcements.map((ann, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded uppercase">{ann.ticker}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{ann.date}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">{ann.headline}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-indigo-700 to-blue-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Bot className="w-6 h-6 text-cyan-400" />
                                    <h3 className="font-extrabold text-lg tracking-tight">Intelligence Feed</h3>
                                </div>
                                <p className="text-xs text-blue-100/70 font-medium leading-relaxed mb-4">You are currently outperforming the SME sector in gross margins. Consider optimizing OpEx by reviewing rent expenditures.</p>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-white/10 text-[10px] font-bold">
                                    <ShieldCheck className="w-3 h-3 text-cyan-400" /> System: Audit readiness at 92%
                                </div>
                            </div>
                            <Sparkles className="absolute right-[-20px] top-[-20px] w-24 h-24 opacity-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
            <style jsx global>{`
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

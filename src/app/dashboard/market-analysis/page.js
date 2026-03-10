"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Send, FileText, CheckCircle, TrendingUp, BarChart3,
    Search, Eye, Sparkles, RotateCcw, LineChart, Globe, ExternalLink,
    Activity, ShieldCheck, Zap
} from "lucide-react";

const initialMessages = [
    {
        role: "ai",
        content: "Welcome to the Market Analyst hub. I can help you analyze the latest annual reports from ASX and NZX listed companies.\n\nI have indexed recent reports for companies like Spark NZ, Auckland Airport, and several ASX firms. What would you like to know?",
        time: "10:00",
    },
];

export default function MarketAnalysisPage() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        const fetchAnns = async () => {
            try {
                const res = await fetch("/api/market/reports");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAnnouncements(data);
                }
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            }
        };
        fetchAnns();
    }, []);

    const openReport = (filename) => {
        if (!filename) return;
        window.open(`/api/market/view?file=${filename}`, "_blank");
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

    return (
        <div className="relative min-h-full bg-slate-50 overflow-hidden font-sans">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-400/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 p-6 h-full flex flex-col gap-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between flex-shrink-0"
                >
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
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Real-time ASX/NZX data processing active
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                                +12
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mr-2" />
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95">
                            Live Feed
                        </button>
                    </div>
                </motion.div>

                <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
                    {/* Chat Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 flex flex-col bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-slate-200/50 overflow-hidden relative"
                    >
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hidden">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                    >
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
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase px-1">{msg.time}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg glow-blue">
                                        <Bot className="w-6 h-6 text-white animate-pulse" />
                                    </div>
                                    <div className="bg-white/50 backdrop-blur-md px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-3 border border-blue-100/50 shadow-inner">
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <motion.span
                                                    key={i}
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-blue-600/80 uppercase tracking-widest">Analyzing Documents</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Overlay */}
                        <div className="p-6 bg-gradient-to-t from-white via-white/80 to-transparent">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-xl shadow-blue-900/5 transition-all">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && send()}
                                        placeholder="Compare Spark vs Auckland Airport results..."
                                        className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 outline-none"
                                    />
                                    <button
                                        onClick={send}
                                        disabled={!input.trim() || loading}
                                        className="group/btn relative h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 overflow-hidden shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        <Send className="w-5 h-5 text-white relative z-10" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 flex flex-col gap-6 min-w-0"
                    >
                        {/* Filings Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl shadow-slate-200/50 flex flex-col h-[60%]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                    Recent Filings
                                </h3>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md tracking-tighter uppercase">LIVE</span>
                            </div>

                            <div className="space-y-4 overflow-y-auto pr-1 scrollbar-hidden flex-1">
                                {announcements.map((ann, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 4 }}
                                        onClick={() => openReport(ann.local_file)}
                                        className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer shadow-sm shadow-slate-200/20"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Globe className="w-2.5 h-2.5" /> {ann.ticker}
                                            </span>
                                            <div className={`w-2 h-2 rounded-full ${ann.sentiment === "Bullish" ? "bg-green-500" : ann.sentiment === "Caution" ? "bg-amber-500" : "bg-slate-300"
                                                }`} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors mb-2">
                                            {ann.headline}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ann.date}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-3 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100/50 rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                                Explore Full Archive <BarChart3 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Tips/Insight Card */}
                        <div className="flex-1 bg-gradient-to-br from-indigo-700 to-blue-900 rounded-3xl p-6 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                                <Sparkles className="w-24 h-24 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Zap className="w-5 h-5 text-yellow-300" />
                                    </div>
                                    <h3 className="font-extrabold text-lg tracking-tight">AI Financial RAG</h3>
                                </div>
                                <p className="text-sm text-blue-100/80 leading-relaxed mb-4 font-medium">
                                    Compare company fundamentals instantly. Ask things like:
                                </p>
                                <div className="space-y-2">
                                    {[
                                        "Compare debt levels of AIA vs SPK",
                                        "List risk factors for AMD 2025",
                                        "How much did SPK spend on Capex?"
                                    ].map((tip, i) => (
                                        <div key={i} className="px-3 py-2 bg-black/20 hover:bg-black/30 rounded-xl text-xs font-bold text-blue-100 border border-white/10 flex items-center gap-2 transition-colors cursor-pointer group">
                                            <ShieldCheck className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                                            {tip}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
      `}</style>
        </div>
    );
}

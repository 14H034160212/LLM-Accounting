"use client";

import { useState, useRef, useEffect } from "react";
import {
  CreditCard, TrendingUp, Shield, CheckCircle, Clock, AlertCircle,
  FileText, BarChart3, DollarSign, Building2, ChevronRight,
  ArrowRight, Send, Bot, Star, Lock, Eye, Zap
} from "lucide-react";

const loanProducts = [
  {
    id: 1,
    name: "Tax-Based Finance",
    bank: "CBA Business Lending",
    amount: "Up to A$500K",
    rate: "p.a. 6.5%",
    period: "1–36 months",
    feature: "Based on ATO tax data, no collateral required",
    tag: "Recommended",
    tagColor: "bg-blue-600 text-white",
    color: "from-blue-600 to-blue-500",
  },
  {
    id: 2,
    name: "Invoice Finance",
    bank: "NAB Invoice Finance",
    amount: "Up to A$1,000K",
    rate: "p.a. 7.2%",
    period: "1–24 months",
    feature: "Based on invoice receivables, fast settlement",
    tag: "Popular",
    tagColor: "bg-red-500 text-white",
    color: "from-red-500 to-rose-500",
  },
  {
    id: 3,
    name: "Tax Credit Loan",
    bank: "Judo Bank SME Loan",
    amount: "Up to A$300K",
    rate: "p.a. 5.9%",
    period: "1–12 months",
    feature: "A-grade tax compliance exclusive low rate",
    tag: "Low Rate",
    tagColor: "bg-green-600 text-white",
    color: "from-green-600 to-emerald-500",
  },
  {
    id: 4,
    name: "Business Line of Credit",
    bank: "ANZ Business Lending",
    amount: "Up to A$2,000K",
    rate: "p.a. 8.2%",
    period: "1–60 months",
    feature: "Assessed on business operating performance",
    tag: "High Value",
    tagColor: "bg-violet-600 text-white",
    color: "from-violet-600 to-purple-500",
  },
];

const creditData = {
  score: 782,
  level: "A Grade",
  maxAmount: "A$380K",
  rate: "5.9%",
  items: [
    { label: "Tax Compliance", value: "A Grade", score: 95, color: "bg-blue-600" },
    { label: "Invoice Turnover", value: "Good", score: 88, color: "bg-green-500" },
    { label: "Financial Health", value: "Excellent", score: 92, color: "bg-indigo-500" },
    { label: "Business Standing", value: "Normal", score: 85, color: "bg-cyan-500" },
  ],
};

const loanRecords = [
  { id: "LN-2025-0023", product: "Tax-Based Finance", bank: "CBA", amount: "A$150K", rate: "6.5%", status: "Active", dueDate: "2026-06-15" },
  { id: "LN-2024-0087", product: "Invoice Finance", bank: "NAB", amount: "A$80K", rate: "7.2%", status: "Settled", dueDate: "2025-03-20" },
];

const chatInit = [
  {
    role: "ai",
    content: "Hello! I'm your AcctAI Business Lending Advisor. I've completed your initial credit assessment:\n\n📊 Credit Score: 782 (A Grade)\n💰 Estimated Credit Limit: A$380K\n📈 Lowest Rate: from 5.9% p.a.\n\nI can help you:\n• Match you with the best lending products\n• Assist with application documents\n• Track your loan status end-to-end\n\nReady to explore your options?",
    time: "09:00",
  },
];

export default function LendingPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [messages, setMessages] = useState(chatInit);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = text || input;
    if (!content.trim()) return;
    const now = new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", content, time: now };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, role: "lending" }),
      });
      const data = await res.json();
      setMessages(m => [...m, {
        role: "ai",
        content: data.error ? `⚠️ ${data.error}` : data.content,
        time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      setMessages(m => [...m, { role: "ai", content: "⚠️ Unable to connect to AI. Please ensure Ollama is running (`ollama serve`).", time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Business Lending Agent</h1>
          <p className="text-slate-500 text-sm">Credit Assessment · Product Matching · Full Support</p>
        </div>
      </div>

      {/* Credit overview */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Credit Score</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white">{creditData.score}</span>
              <span className="text-blue-200 mb-1">/ 1000</span>
              <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-1">{creditData.level}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm mb-1">Estimated Credit Limit</p>
            <p className="text-white text-2xl font-bold">{creditData.maxAmount}</p>
            <p className="text-blue-300 text-sm">From {creditData.rate} p.a.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-5">
          {creditData.items.map(({ label, value, score, color }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3">
              <div className="flex justify-between text-xs text-blue-200 mb-1.5">
                <span>{label}</span>
                <span className="text-white font-semibold">{value}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["products", "records", "apply"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {tab === "products" ? "Products" : tab === "records" ? "Loan History" : "AI Lending Advisor"}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div className="grid md:grid-cols-2 gap-4">
          {loanProducts.map(({ id, name, bank, amount, rate, period, feature, tag, tagColor, color }) => (
            <div key={id} className="tech-card p-5 hover:border-blue-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${tagColor}`}>{tag}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-0.5">{name}</h3>
              <p className="text-xs text-slate-400 mb-3">{bank}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Limit</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{amount}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Rate</p>
                  <p className="text-xs font-bold text-blue-700 mt-0.5">{rate}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Term</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{period}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {feature}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg transition-colors">View Details</button>
                <button onClick={() => setActiveTab("apply")} className="flex-1 text-xs text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors">Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "records" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-2">
            {[
              { label: "Total Loans", value: "A$230K", color: "text-blue-600" },
              { label: "Repaid", value: "A$80K", color: "text-green-600" },
              { label: "Outstanding", value: "A$150K", color: "text-amber-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="tech-card p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {loanRecords.map(({ id, product, bank, amount, rate, status, dueDate }) => (
            <div key={id} className="tech-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-900">{product}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-sm text-slate-500">{bank}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{id}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === "Active" ? "status-warning" : "status-success"}`}>{status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Loan Amount</p>
                  <p className="font-bold text-slate-900">{amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Rate p.a.</p>
                  <p className="font-bold text-slate-900">{rate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Due Date</p>
                  <p className="font-bold text-slate-900">{dueDate}</p>
                </div>
              </div>
              {status === "Active" && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                  <button className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">View Repayment Schedule</button>
                  <button className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">Early Repayment</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "apply" && (
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ height: "calc(100vh - 320px)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">AI Lending Advisor</p>
              <p className="text-xs text-slate-500">12 lenders matched · Same-day approval possible</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Credit Score 782</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-400">{msg.time}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                  <span className="text-xs text-slate-400">Matching products for you...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 pt-2 pb-2 flex gap-2 flex-wrap">
            {["I need a A$500K business loan", "Help me find the best product", "What documents do I need?"].map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                {q}
              </button>
            ))}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white transition-all">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Describe your financing needs..." className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none" />
              <button onClick={() => send()} disabled={!input.trim()} className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

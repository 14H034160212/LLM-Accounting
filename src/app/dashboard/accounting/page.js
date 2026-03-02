"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, FileText, CheckCircle, Clock, AlertCircle,
  Plus, Download, Filter, Search, Eye, Edit, Trash2,
  Sparkles, ChevronDown, RotateCcw, Play
} from "lucide-react";

// ─── Sample data ──────────────────────────────────────────────────────────────
const vouchers = [
  { id: "JNL-2025-0891", summary: "June Sales Revenue Recognition", debit: "Bank Account", credit: "Revenue", amount: "A$58,000.00", date: "2025-06-15", status: "Approved", ai: true },
  { id: "JNL-2025-0890", summary: "Purchase Raw Materials", debit: "Inventory", credit: "Accounts Payable", amount: "A$23,400.00", date: "2025-06-14", status: "Pending", ai: true },
  { id: "JNL-2025-0889", summary: "June Payroll", debit: "Admin Expense - Wages", credit: "Wages Payable", amount: "A$85,000.00", date: "2025-06-14", status: "Approved", ai: false },
  { id: "JNL-2025-0888", summary: "Travel Expense Reimbursement", debit: "Admin Expense - Travel", credit: "Bank Account", amount: "A$3,280.00", date: "2025-06-13", status: "AI Generated", ai: true },
  { id: "JNL-2025-0887", summary: "Utilities Payment", debit: "Admin Expense - Utilities", credit: "Bank Account", amount: "A$1,560.00", date: "2025-06-13", status: "Approved", ai: true },
  { id: "JNL-2025-0886", summary: "GST Input Tax Credit", debit: "GST Receivable", credit: "Bank Account", amount: "A$8,120.00", date: "2025-06-12", status: "Pending", ai: true },
];

const chatMessages = [
  {
    role: "ai",
    content: "Hi! I'm your AcctAI Bookkeeping Assistant. I've completed the following automated tasks:\n\n✅ Scanned and recorded 312 invoices this month\n✅ Auto-generated 89 journal entries\n✅ Completed bank reconciliation\n\n⚠️ 2 journal entries require your review — please check the Pending list.",
    time: "09:30",
  },
  {
    role: "user",
    content: "What's our GST payable for June?",
    time: "10:15",
  },
  {
    role: "ai",
    content: "Based on system data, here's your June GST position:\n\n📊 Output Tax (GST Collected): A$75,400.00\n📊 Input Tax Credits (ITCs): A$48,320.00\n\n💰 Net GST Payable: A$27,080.00\n\nBAS lodgement deadline: 28 July 2025\n\nShall I auto-generate the BAS return and prepare it for submission?",
    time: "10:15",
  },
  {
    role: "user",
    content: "Yes, generate the BAS but don't submit yet — I need to review first.",
    time: "10:18",
  },
  {
    role: "ai",
    content: "✅ BAS Return generated!\n\n📄 File: BAS_Return_June_2025.xlsx\n\nKey figures:\n• Total Sales (incl. GST): A$528,800.00\n• Input Tax Invoices: 312 invoices, A$48,320.00\n• Net GST Payable: A$27,080.00\n\nThe BAS has been saved to the Tax Filing module. Please review and submit when ready.",
    time: "10:18",
  },
];

// ─── Chat ─────────────────────────────────────────────────────────────────────
function AIChat() {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "What's this month's profit?",
    "Generate balance sheet",
    "View last month's tax records",
    "Review pending journals",
  ];

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
        body: JSON.stringify({ messages: updatedMessages, role: "accounting" }),
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">AI Bookkeeping Assistant</p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}>
                {msg.content}
              </div>
              <span className="text-xs text-slate-400">{msg.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs text-slate-400">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pt-2 flex gap-2 flex-wrap">
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask AI assistant or start a task..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
          <button onClick={send} disabled={!input.trim()} className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 flex items-center justify-center transition-colors">
            <Send className="w-4 h-4 text-white disabled:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Journal List ──────────────────────────────────────────────────────────────
function VoucherList() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Journal List</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {vouchers.map(({ id, summary, debit, credit, amount, date, status, ai }) => (
          <div key={id} className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-400">{id}</span>
                  {ai && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
                <p className="font-medium text-slate-800 text-sm truncate">{summary}</p>
                <p className="text-xs text-slate-400 mt-0.5">Dr: {debit} / Cr: {credit}</p>
                <p className="text-xs text-slate-400">{date}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-bold text-slate-900 text-sm">{amount}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  status === "Approved" ? "status-success" :
                  status === "AI Generated" ? "status-info" : "status-warning"
                }`}>{status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              {status === "Pending" && (
                <button className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Bookkeeping</h1>
          <p className="text-slate-500 text-sm">AI auto-bookkeeping · Journal generation · Human review</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all">
            <Play className="w-4 h-4" /> Bulk Execute
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: "Transactions This Month", value: "234", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "AI Journals", value: "89", color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Pending Review", value: "2", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Scanned Invoices", value: "312", color: "text-green-600", bg: "bg-green-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-2 lg:hidden flex-shrink-0">
        {["chat", "vouchers"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {tab === "chat" ? "AI Assistant" : "Journal List"}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
        <div className={`${activeTab !== "chat" ? "hidden lg:block" : ""}`}>
          <AIChat />
        </div>
        <div className={`${activeTab !== "vouchers" ? "hidden lg:block" : ""}`}>
          <VoucherList />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, FileText, CheckCircle, Clock, AlertCircle,
  Plus, Download, Filter, Search, Eye, Edit, Trash2,
  Sparkles, ChevronDown, RotateCcw, Play, RefreshCw, TrendingUp, ShieldCheck
} from "lucide-react";

// Mock data removed

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
function AIChat({ stats }) {
  const initialMessages = [
    {
      role: "ai",
      content: `Hi! I'm your AcctAI Bookkeeping Assistant. I've completed the following automated tasks:\n\n✅ Scanned ${stats.scanned.toLocaleString()} documents\n✅ Auto-generated ${stats.aiJournals} journal entries\n✅ All records are synchronized with your ledger.\n\n${stats.pending > 0 ? `⚠️ ${stats.pending} journal entries require your review — please check the Pending list.` : "✨ Your records are fully up to date."}`,
      time: "09:30",
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync initial message when stats load for the first time
  useEffect(() => {
    if (stats.scanned > 0 && messages.length === 1) {
      setMessages(initialMessages);
    }
  }, [stats]);

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
              <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
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
                {[0, 1, 2].map(i => (
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
function VoucherList({ onSelect }) {
  const [vouchers, setVouchers] = useState([]);

  const loadJournals = () => {
    fetch("/api/journals")
      .then(r => r.json())
      .then(data => {
        if (!data.error) setVouchers(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadJournals();
    const interval = setInterval(loadJournals, 10000); // Auto-refresh every 10s
    
    // Listen for external post events (e.g. from Modal)
    const handlePosted = (e) => {
      const { id } = e.detail;
      setVouchers(v => v.map(vch => vch.id === id ? { ...vch, status: 'Approved' } : vch));
    };
    // Listen for bulk refresh (e.g. after AI auto-review)
    const handleRefresh = () => loadJournals();
    window.addEventListener('journal-posted', handlePosted);
    window.addEventListener('journals-refreshed', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('journal-posted', handlePosted);
      window.removeEventListener('journals-refreshed', handleRefresh);
    };
  }, []);

  const postJournal = async (id) => {
    try {
      const res = await fetch("/api/journals/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal_id: id, status: 'Approved' }),
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(v => v.map(vch => vch.id === id ? { ...vch, status: 'Approved' } : vch));
      }
    } catch (err) {
      console.error("Failed to post journal:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Journal List</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadJournals}
            className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
          <button className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {vouchers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm italic">No journals generated yet. AI is processing your batch...</p>
            <button onClick={loadJournals} className="text-xs text-blue-600 mt-2 hover:underline">Click to Sync</button>
          </div>
        ) : vouchers.map((vch) => (
          <div 
            key={vch.id} 
            onClick={() => onSelect(vch)}
            className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50/60 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-slate-400 font-bold tracking-tighter">{vch.id}</span>
                  {vch.ai_generated && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                      <Sparkles className="w-2.5 h-2.5" /> AI SUGGESTED
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-sm truncate">{vch.summary}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">
                  <span className="text-blue-600 font-bold">DR</span> {vch.debit_account} / <span className="text-cyan-600 font-bold">CR</span> {vch.credit_account}
                </p>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                  {vch.date === 'YYYY-MM-DD' ? 'Processing...' : vch.date || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-black text-slate-900 text-base">${Number(vch.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${vch.status === "Approved" || vch.status === "Posted" ? "bg-green-100 text-green-700" :
                    vch.status === "AI Generated" || vch.status === "Pending" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    }`}>{vch.status}</span>
                  {(vch.status === "AI Generated" || vch.status === "Pending") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        postJournal(vch.id);
                      }}
                      className="p-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20 active:scale-90"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function JournalDetailModal({ journal, onClose, onPost }) {
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const loadInvoice = async () => {
    if (invoice) { setShowInvoice(true); return; }
    setInvoiceLoading(true);
    try {
      const res = await fetch(`/api/invoices?search=${journal.invoice_id}&limit=1`);
      const data = await res.json();
      const found = data.invoices?.[0] || null;
      setInvoice(found);
      setShowInvoice(true);
    } catch {
      setInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (!journal) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Journal Entry Details</h2>
            <p className="font-mono text-xs font-bold text-blue-600">{journal.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <Plus className="w-5 h-5 text-slate-400 rotate-45" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
            <p className="text-slate-900 font-bold leading-relaxed">{journal.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Debit Account</p>
              <p className="text-sm font-bold text-slate-800">{journal.debit_account || 'N/A'}</p>
            </div>
            <div className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-100">
              <p className="text-[10px] font-black text-cyan-600 uppercase mb-2">Credit Account</p>
              <p className="text-sm font-bold text-slate-800">{journal.credit_account || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-slate-100 pt-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction Date</p>
              <p className="text-sm font-bold text-slate-900">
                {journal.date === 'YYYY-MM-DD' ? 'Processing...' : journal.date || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-3xl font-black text-slate-900">${journal.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {journal.invoice_id && (
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Source Document</p>
                    <p className="text-xs font-mono font-bold text-slate-600">{journal.invoice_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => showInvoice ? setShowInvoice(false) : loadInvoice()}
                  className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                >
                  {invoiceLoading ? 'Loading...' : showInvoice ? 'Hide' : 'View Origin'}
                </button>
              </div>

              {showInvoice && (
                <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                  {!invoice ? (
                    <p className="text-xs text-slate-400 italic">Invoice not found.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Seller</p>
                          <p className="font-bold text-slate-800">{invoice.seller || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Invoice No.</p>
                          <p className="font-bold text-slate-800">{invoice.invoice_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Invoice Date</p>
                          <p className="font-bold text-slate-800">{invoice.date || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Due Date</p>
                          <p className="font-bold text-slate-800">{invoice.due_date || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Amount (excl. GST)</p>
                          <p className="font-bold text-slate-800">${Number(invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">GST</p>
                          <p className="font-bold text-slate-800">${Number(invoice.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      {invoice.seller_address && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Seller Address</p>
                          <p className="text-xs text-slate-600">{invoice.seller_address}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${invoice.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {invoice.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{invoice.currency || 'AUD'}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Close
          </button>
          {journal.status !== 'Approved' && journal.status !== 'Posted' && (
            <button
              onClick={onPost}
              className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Confirm & Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [stats, setStats] = useState({ transactions: 0, aiJournals: 0, pending: 0, scanned: 0 });
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [autoReviewing, setAutoReviewing] = useState(false);
  const [autoReviewResult, setAutoReviewResult] = useState(null);

  const runAutoReview = async () => {
    setAutoReviewing(true);
    setAutoReviewResult(null);
    try {
      const res = await fetch('/api/journals/auto-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_size: 50 }),
      });
      const data = await res.json();
      setAutoReviewResult(data);
      // Refresh journal list
      window.dispatchEvent(new CustomEvent('journals-refreshed'));
    } catch (e) {
      setAutoReviewResult({ error: e.message });
    } finally {
      setAutoReviewing(false);
    }
  };

  const postJournal = async (id) => {
    try {
      const res = await fetch("/api/journals/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal_id: id, status: 'Approved' }),
      });
      const data = await res.json();
      if (data.success) {
        // We'll need a way to update the VoucherList state if we do it this way.
        // For simplicity, we can just trigger a reload or use a global state.
        // Let's just implement the UI for now, or use a window event.
        window.dispatchEvent(new CustomEvent('journal-posted', { detail: { id } }));
        if (selectedJournal && selectedJournal.id === id) {
          setSelectedJournal({ ...selectedJournal, status: 'Approved' });
        }
      }
    } catch (err) {
      console.error("Failed to post journal:", err);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/journals/stats");
        const data = await res.json();
        if (!data.error) setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 5000); // Pulse stats every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      {selectedJournal && (
        <JournalDetailModal 
          journal={selectedJournal} 
          onClose={() => setSelectedJournal(null)} 
          onPost={() => postJournal(selectedJournal.id)}
        />
      )}
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
          <button
            onClick={runAutoReview}
            disabled={autoReviewing}
            className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 rounded-xl shadow-md hover:from-violet-700 hover:to-purple-600 disabled:opacity-60 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            {autoReviewing ? 'AI Reviewing...' : 'AI Auto-Review'}
          </button>
          <button className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all">
            <Play className="w-4 h-4" /> Bulk Execute
          </button>
        </div>
      </div>

      {/* Auto-review result banner */}
      {autoReviewResult && (
        <div className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${autoReviewResult.error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-violet-50 text-violet-800 border border-violet-100'}`}>
          {autoReviewResult.error ? (
            <span>⚠️ {autoReviewResult.error}</span>
          ) : autoReviewResult.processed === 0 ? (
            <span>✅ All journals already reviewed — nothing pending.</span>
          ) : (
            <span>
              <ShieldCheck className="w-4 h-4 inline mr-1.5" />
              AI reviewed <strong>{autoReviewResult.processed}</strong> journals —&nbsp;
              <strong className="text-green-700">{autoReviewResult.approved} Approved</strong>,&nbsp;
              <strong className="text-amber-600">{autoReviewResult.flagged} flagged for Review</strong>
            </span>
          )}
          <button onClick={() => setAutoReviewResult(null)} className="text-slate-400 hover:text-slate-600 ml-4">✕</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: "Transactions Processed", value: stats.transactions, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "AI Journals", value: stats.aiJournals, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Pending Review", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Scanned Invoices", value: stats.scanned, color: "text-green-600", bg: "bg-green-50" },
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
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
          >
            {tab === "chat" ? "AI Assistant" : "Journal List"}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
        <div className={`${activeTab !== "chat" ? "hidden lg:block" : ""}`}>
          <AIChat stats={stats} />
        </div>
        <div className={`${activeTab !== "vouchers" ? "hidden lg:block" : ""}`}>
          <VoucherList onSelect={setSelectedJournal} />
        </div>

        {/* Benchmarking Section */}
        <Benchmarking />
      </div>
    </div>
  );
}

function Benchmarking() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/analysis/benchmark")
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="hidden xl:block bg-slate-50 rounded-3xl animate-pulse" />;

  return (
    <div className="hidden xl:flex flex-col gap-6 h-full overflow-y-auto pr-1 scrollbar-hidden">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
          <TrendingUp className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 text-white">
          <h3 className="font-extrabold text-lg flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Benchmarking
          </h3>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Your performance compared to ASX/NZX industry averages derived from 2025 Annual Reports.
          </p>

          <div className="space-y-4">
            {data.benchmarks.map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400">{item.label}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.status === 'Optimal' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'Superior' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>{item.status}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-black">{item.you}</p>
                    <p className="text-[10px] font-bold text-slate-500">YOU</p>
                  </div>
                  <div className="h-8 w-px bg-white/10 mx-2" />
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-400">{item.market}</p>
                    <p className="text-[10px] font-bold text-slate-500">MARKET</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            AI Audit alerts
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.alerts?.length || 0} ALERTS</span>
        </h4>
        <div className="space-y-3">
          {(!data.alerts || data.alerts.length === 0) ? (
            <p className="text-sm text-slate-500 italic">No critical anomalies detected in current batch.</p>
          ) : data.alerts.map((alert, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 items-start">
              <div className={`p-1.5 rounded-lg ${alert.severity === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{alert.type}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          Strategic Insight
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed italic">
          "{data.insight}"
        </p>
      </div>
    </div>
  );
}

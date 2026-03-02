"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Bot, Send, Phone, Video, Star,
  ThumbsUp, ThumbsDown, Bookmark, Share2, Search,
  ChevronRight, FileText, TrendingUp, AlertCircle,
  BarChart3, Lightbulb, BookOpen, Users
} from "lucide-react";

const initMessages = [
  {
    role: "ai",
    content: "Hi there! I'm FinBot, your AI tax & accounting assistant. I can help you with:\n\n📊 Tax and accounting questions\n📋 GST / BAS health check reports\n💡 Bookkeeping strategy advice\n🔍 Identifying potential tax savings\n\nHow can I help you today?",
    time: "09:00",
    avatar: "AI",
  },
];

const quickQuestions = [
  "What is a small business entity?",
  "How can I legally minimise tax?",
  "What's the difference between tax invoices and receipts?",
  "Should we register for GST?",
  "How do I do a tax health check?",
  "How should I structure my equity?",
];

const knowledgeCards = [
  { icon: TrendingUp, title: "2025 ATO Tax Rate Tables", tag: "Policy Update", color: "from-blue-500 to-blue-600" },
  { icon: FileText, title: "SME Tax Concessions (AU/NZ)", tag: "Tax Concessions", color: "from-green-500 to-emerald-600" },
  { icon: BarChart3, title: "GST / BAS Lodgement Guide", tag: "How-To Guide", color: "from-indigo-500 to-violet-600" },
  { icon: Lightbulb, title: "10 Legal Tax Minimisation Tips", tag: "Tax Strategy", color: "from-amber-500 to-orange-500" },
  { icon: BookOpen, title: "Chart of Accounts Quick Reference", tag: "Reference", color: "from-cyan-500 to-blue-500" },
  { icon: AlertCircle, title: "Common Tax Risk Alerts", tag: "Risk Alert", color: "from-red-500 to-rose-600" },
];

export default function CustomerServicePage() {
  const [messages, setMessages] = useState(initMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
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
        body: JSON.stringify({ messages: updatedMessages, role: "customer-service" }),
      });
      const data = await res.json();
      setMessages(m => [...m, {
        role: "ai",
        content: data.error ? `⚠️ ${data.error}` : data.content,
        time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
        avatar: "AI",
      }]);
    } catch {
      setMessages(m => [...m, { role: "ai", content: "⚠️ Unable to connect to AI. Please ensure Ollama is running (`ollama serve`).", time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }), avatar: "AI" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Support Agent</h1>
          <p className="text-slate-500 text-sm">24/7 Online · Expert tax &amp; accounting Q&amp;A</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-shrink-0">
        {["chat", "knowledge"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {tab === "chat" ? "Chat" : "Knowledge Base"}
          </button>
        ))}
      </div>

      {activeTab === "chat" ? (
        <div className="flex-1 grid lg:grid-cols-4 gap-4 min-h-0">
          {/* Chat */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">FinBot · Tax &amp; Accounting Assistant</p>
                <p className="text-xs text-slate-500">Accounting · Tax · Business Advisory expertise</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  <span className="text-xs text-slate-500 ml-1">4.9</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                    }`}>
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs text-slate-400">{msg.time}</span>
                      {msg.role === "ai" && (
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-green-100 rounded"><ThumbsUp className="w-3 h-3 text-slate-400 hover:text-green-500" /></button>
                          <button className="p-1 hover:bg-red-100 rounded"><ThumbsDown className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                          <button className="p-1 hover:bg-blue-100 rounded"><Bookmark className="w-3 h-3 text-slate-400 hover:text-blue-500" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                    <span className="text-xs text-slate-400">FinBot is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div className="px-4 pt-2 flex gap-2 overflow-x-auto scrollbar-hidden pb-1 flex-shrink-0">
              {quickQuestions.map(q => (
                <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors flex-shrink-0">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-indigo-300 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Ask your tax or accounting question..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                />
                <button onClick={() => send()} disabled={!input.trim()} className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="tech-card p-4">
              <h4 className="font-bold text-slate-800 text-sm mb-3">Tax Health Check</h4>
              <div className="text-center py-3">
                <div className="text-4xl font-black text-blue-600 mb-1">96</div>
                <div className="text-xs text-slate-500">Compliance Score</div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "96%" }} />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Invoice Compliance", score: "100%", ok: true },
                  { label: "Tax Calculation", score: "98%", ok: true },
                  { label: "Account Codes", score: "90%", ok: false },
                ].map(({ label, score, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{label}</span>
                    <span className={ok ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>{score}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 text-xs text-indigo-600 bg-indigo-50 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                View Full Report
              </button>
            </div>

            <div className="tech-card p-4">
              <h4 className="font-bold text-slate-800 text-sm mb-3">Popular Questions</h4>
              <div className="space-y-2">
                {["Annual tax return process", "SME income tax concessions", "How to record superannuation", "Handling overdue invoice verification"].map(q => (
                  <button key={q} onClick={() => { setActiveTab("chat"); send(q); }} className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between group">
                    <span>{q}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search tax &amp; accounting knowledge..." className="flex-1 bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeCards.map(({ icon: Icon, title, tag, color }) => (
              <div key={title} className="tech-card p-5 cursor-pointer hover:border-blue-300 group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-slate-900 mb-1.5">{title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{tag}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

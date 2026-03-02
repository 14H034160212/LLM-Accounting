"use client";

import { useState, useRef, useEffect } from "react";
import {
  TrendingUp, Shield, FileText, Users, Building2, Scale,
  Lightbulb, ChevronRight, Star, CheckCircle, ArrowRight,
  Clock, Bot, Send, BarChart3, PieChart, DollarSign, Lock
} from "lucide-react";

const services = [
  {
    id: 1,
    icon: TrendingUp,
    title: "Tax & Financial Planning",
    desc: "AI-powered analysis of your business data to identify tax-saving opportunities and optimise your tax structure — fully ATO/IRD compliant.",
    features: ["Tax burden analysis", "Tax minimisation strategy", "Concession matching", "Annual tax planning"],
    saving: "Est. savings A$58,000/yr",
    status: "Available",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: 2,
    icon: PieChart,
    title: "Equity Structure Design",
    desc: "Scientifically design your ownership structure to protect founder equity, optimise tax and prepare for future fundraising or exit.",
    features: ["Equity split planning", "Holding company setup", "Options & incentive schemes", "CGT minimisation"],
    saving: "Reduce tax burden 30%+",
    status: "Available",
    color: "from-violet-600 to-purple-600",
  },
  {
    id: 3,
    icon: BarChart3,
    title: "Advanced Financial Planning",
    desc: "CFO-level financial planning service — optimise capital allocation, control costs and improve financial health.",
    features: ["Cash flow management", "Cost control analysis", "Financial budgeting", "Investment planning"],
    saving: "Boost margins 8–15%",
    status: "Available",
    color: "from-cyan-600 to-teal-600",
  },
  {
    id: 4,
    icon: Scale,
    title: "Legal / Supply Chain / IP",
    desc: "Comprehensive legal support for business operations — contract review, IP protection, supply chain compliance.",
    features: ["Contract legal review", "IP & patent filing", "Supply chain compliance", "Dispute resolution"],
    saving: "Mitigate legal risks",
    status: "Consulting",
    color: "from-emerald-600 to-green-600",
  },
];

const cases = [
  {
    company: "Tech Startup",
    size: "50 staff",
    issue: "High tax burden — paying A$130K/yr in tax",
    solution: "Restructured tax position + R&D tax incentive claim",
    result: "Saved A$62K/yr",
    time: "3 months",
  },
  {
    company: "Trading Company",
    size: "20 staff",
    issue: "Messy equity structure, struggling to raise capital",
    solution: "Redesigned equity structure with holding company",
    result: "Raised A$500K funding",
    time: "2 months",
  },
  {
    company: "Restaurant Chain",
    size: "200 staff",
    issue: "Tight cash flow, poor debtor management",
    solution: "Cash flow optimisation + debtor terms restructure",
    result: "Cash flow improved 40%",
    time: "1 month",
  },
];

const chatInit = [
  {
    role: "ai",
    content: "Hello! I'm your AcctAI Enterprise Advisor — an AI with 10+ years of CFO-equivalent expertise. I can help you with:\n\n🎯 Tax & financial planning\n📊 Equity structure design\n💼 Advanced financial planning\n⚖️ Legal & compliance support\n\nWhat is your biggest business challenge right now?",
    time: "09:00",
  },
];

export default function EnterprisePage() {
  const [messages, setMessages] = useState(chatInit);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState("services");
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
        body: JSON.stringify({ messages: updatedMessages, role: "enterprise" }),
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
          <h1 className="text-xl font-bold text-slate-900">Enterprise Advisory Agent</h1>
          <p className="text-slate-500 text-sm">Tax Planning · Equity Design · CFO Advisory</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5">
            <Star className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
            <span className="text-xs font-medium text-violet-700">Premium Service</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["services", "cases", "consult"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab ? "bg-violet-600 text-white" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {tab === "services" ? "Services" : tab === "cases" ? "Success Stories" : "AI Advisory"}
          </button>
        ))}
      </div>

      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {services.map(({ id, icon: Icon, title, desc, features, saving, status, color }) => (
              <div
                key={id}
                onClick={() => setSelectedService(id === selectedService ? null : id)}
                className={`tech-card p-5 cursor-pointer transition-all ${selectedService === id ? "border-violet-400 border-2 bg-violet-50/20" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === "Available" ? "status-success" : "status-info"}`}>{status}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{desc}</p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm font-semibold text-violet-700">{saving}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveTab("consult"); }}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium"
                  >
                    Consult Now <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Blockchain badge */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Blockchain Case Registry</p>
              <p className="text-slate-400 text-sm">All advisory solutions are blockchain-certified for compliance, credibility and legal admissibility.</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">2,847 cases certified</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cases" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {cases.map(({ company, size, issue, solution, result, time }) => (
              <div key={company} className="tech-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{company}</p>
                    <p className="text-xs text-slate-400">Size: {size}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="bg-red-50 rounded-lg p-2.5">
                    <p className="text-xs font-medium text-red-700 mb-0.5">Challenge</p>
                    <p className="text-xs text-red-600">{issue}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2.5">
                    <p className="text-xs font-medium text-blue-700 mb-0.5">Solution</p>
                    <p className="text-xs text-blue-600">{solution}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs font-medium text-green-700 mb-0.5">Outcome</p>
                    <p className="text-xs text-green-600 font-semibold">{result}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Duration {time}</span>
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "consult" && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">AI Enterprise Advisor</p>
              <p className="text-xs text-slate-500">Tax Planning · Equity Design · Strategic Advisory</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-yellow-500">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-400">{msg.time}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                  <span className="text-xs text-slate-400">Advisor is analysing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 pt-2 pb-2 flex gap-2 flex-wrap">
            {["Help me optimise my tax structure", "Analyse my equity structure", "Create a financial plan"].map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full border border-violet-100 hover:bg-violet-100 transition-colors">
                {q}
              </button>
            ))}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Describe your business challenge..." className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none" />
              <button onClick={() => send()} disabled={!input.trim()} className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

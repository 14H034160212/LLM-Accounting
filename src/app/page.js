"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot, FileText, Calculator, TrendingUp, Shield, Zap,
  ChevronRight, CheckCircle, Building2, Users, DollarSign,
  BarChart3, ArrowRight, Star, Globe, Lock, Clock,
  Brain, Database, Workflow, MessageSquare, CreditCard,
  FileSpreadsheet, Search, Bell, Settings, Menu, X
} from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-blue-900">AcctAI<span className="gradient-text"> Pro</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#agents" className="hover:text-blue-600 transition-colors">Agents</a>
          <a href="#architecture" className="hover:text-blue-600 transition-colors">Architecture</a>
          <a href="#market" className="hover:text-blue-600 transition-colors">Market</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">
            Dashboard
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-5 py-2 rounded-full transition-all shadow-md hover:shadow-lg">
            Free Trial
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-blue-100 px-6 py-4 flex flex-col gap-3 text-sm">
          <a href="#features" className="text-slate-600 hover:text-blue-600">Features</a>
          <a href="#agents" className="text-slate-600 hover:text-blue-600">Agents</a>
          <a href="#architecture" className="text-slate-600 hover:text-blue-600">Architecture</a>
          <Link href="/dashboard" className="text-white bg-blue-600 text-center py-2 rounded-full mt-2">Dashboard</Link>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen gradient-bg flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Now Live · Industry&apos;s first AI that executes tax &amp; accounting tasks
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              AI-Powered Accounting<br />
              <span className="gradient-text">&amp; Tax, Done Smarter!</span>
            </h1>
            <p className="text-xl text-slate-700 font-medium mb-3">
              Next-gen AI bookkeeping &amp; tax agent for AU &amp; NZ SMEs
            </p>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Beyond just talking — an AI that actually does the work.<br />
              The first productivity tool that directly executes accounting and tax tasks.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Zap, label: "Fast Tax Lodgement" },
                { icon: FileText, label: "One-Click Invoice Sync" },
                { icon: FileSpreadsheet, label: "Smart Tax Returns" },
                { icon: Bot, label: "AI Tax Agents" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/80 border border-blue-100 rounded-full px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                  <Icon className="w-4 h-4 text-blue-500" />
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#agents" className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-medium border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
                Learn More <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-80 h-80 float-animation">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl flex items-center justify-center" style={{ animation: "pulse-glow 3s ease-in-out infinite" }}>
                  <Bot className="w-24 h-24 text-white" />
                </div>
              </div>
              {[
                { icon: FileText, label: "Invoice", top: "5%", left: "10%", color: "from-blue-400 to-blue-600" },
                { icon: Calculator, label: "Bookkeeping", top: "5%", right: "10%", color: "from-cyan-400 to-blue-500" },
                { icon: TrendingUp, label: "Tax", bottom: "5%", left: "10%", color: "from-indigo-400 to-blue-600" },
                { icon: BarChart3, label: "Reports", bottom: "5%", right: "10%", color: "from-blue-500 to-cyan-500" },
              ].map(({ icon: Icon, label, color, ...pos }) => (
                <div key={label} className="absolute" style={pos}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} shadow-lg flex flex-col items-center justify-center gap-1`}>
                    <Icon className="w-7 h-7 text-white" />
                    <span className="text-white text-xs font-medium">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: "2.5M+", label: "Registered Businesses", sub: "99% are SMEs (AU+NZ)" },
    { value: "13M+", label: "People employed by SMEs", sub: "Backbone of AU/NZ economy" },
    { value: "800K+", label: "Sole Traders", sub: "All need accounting & tax services" },
    { value: "A$8B+", label: "Tax Services Market", sub: "Tax lodgement alone" },
    { value: "A$25B+", label: "Total Market Size", sub: "Accounting · Advisory · Finance" },
    { value: "3.5 yr", label: "Avg. SME Lifespan", sub: "Min. A$20K services per business" },
  ];

  return (
    <section id="market" className="py-20 bg-gradient-to-b from-slate-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">SME Market Opportunity in Australia &amp; New Zealand</h2>
          <p className="text-blue-300">Massive opportunity — AcctAI Pro helps you capture it</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map(({ value, label, sub }) => (
            <div key={label} className="dark-card p-6 text-center hover:border-blue-400/40 transition-all">
              <div className="text-3xl font-bold gradient-text mb-2">{value}</div>
              <div className="text-white font-semibold mb-1">{label}</div>
              <div className="text-blue-400 text-sm">{sub}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 text-sm mt-8">
          Sources: ATO Business Statistics 2025 · ABS Business Register · MBIE NZ Business Demography
        </p>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Zap,
      title: "All-Tax Fast Lodgement",
      desc: "GST/BAS, income tax, PAYG withholding — lodge all tax types in one click with AI auto-verification. Error rate reduced by 98%.",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: FileText,
      title: "One-Click Invoice Sync",
      desc: "Integrate with ATO & Xero/MYOB to auto-fetch all input invoices in real-time. No more manual downloads.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: FileSpreadsheet,
      title: "Smart Tax Return Generation",
      desc: "AI auto-generates BAS, P&L and ATO-compliant tax returns. Accurate data, correct format, stress-free compliance.",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: Brain,
      title: "AI Tax & Accounting Agent",
      desc: "An AI agent with expert-level knowledge that autonomously plans and executes accounting and tax tasks — truly does the work.",
      color: "from-blue-600 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      desc: "End-to-end encrypted data, ATO/IRD compliant standards, blockchain-certified records that cannot be tampered with.",
      color: "from-emerald-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Human-AI Workflow",
      desc: "AI handles routine tasks, human accountants review and confirm. Collaborative workflow ensures quality at 10x efficiency.",
      color: "from-blue-500 to-blue-700",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
            <Star className="w-3.5 h-3.5" /> Core Capabilities
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Comprehensive AI Accounting &amp; Tax Capabilities
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            From bookkeeping to BAS lodgement, from invoices to reports — AcctAI Pro covers your entire accounting workflow.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="tech-card p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Four Agents ──────────────────────────────────────────────────────────────
function Agents() {
  const agents = [
    {
      num: "01",
      title: "AI Bookkeeping Agent",
      subtitle: "RaaS · Auto Bookkeeping & Tax",
      icon: Calculator,
      color: "from-blue-600 to-cyan-500",
      borderColor: "border-blue-200",
      features: ["Auto Bookkeeping", "Journal Generation", "Tax Lodgement", "Report Generation", "Data Retention"],
      dbLabel: "Finance & Tax Data",
      modelLabel: "Bookkeeping LLM",
    },
    {
      num: "02",
      title: "AI Support Agent",
      subtitle: "24/7 Intelligent Support",
      icon: MessageSquare,
      color: "from-indigo-600 to-blue-500",
      borderColor: "border-indigo-200",
      features: ["Bookkeeping Strategy", "Tax & Finance Q&A", "Tax Health Report", "Issue Resolution", "Business Opportunity Insights"],
      dbLabel: "Tax Knowledge Base",
      modelLabel: "Tax Expert LLM",
    },
    {
      num: "03",
      title: "Enterprise Advisory Agent",
      subtitle: "Professional Business Advisor",
      icon: TrendingUp,
      color: "from-violet-600 to-indigo-600",
      borderColor: "border-violet-200",
      features: ["Tax & Finance Planning", "Equity Structure Design", "Advanced Financial Planning", "Legal / Supply Chain", "IP & Patents"],
      dbLabel: "Case Library (Blockchain)",
      modelLabel: "Tax Expert LLM",
    },
    {
      num: "04",
      title: "Business Lending Agent",
      subtitle: "Finance Empowers Growth",
      icon: CreditCard,
      color: "from-cyan-600 to-teal-500",
      borderColor: "border-cyan-200",
      features: ["Pre-loan Assessment", "Loan Monitoring", "Post-loan Risk Mgmt", "Credit Evaluation", "Financing Solutions"],
      dbLabel: "Finance & Business Data",
      modelLabel: "Data Asset LLM",
    },
  ];

  return (
    <section id="agents" className="py-20 gradient-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
            <Bot className="w-3.5 h-3.5" /> Four Core AI Agents
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Business Dashboard · Complete AI Agent Suite
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Four AI agents working in harmony — from basic bookkeeping to enterprise advisory — covering every SME need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map(({ num, title, subtitle, icon: Icon, color, borderColor, features, dbLabel, modelLabel }) => (
            <div key={num} className={`tech-card p-6 border-2 ${borderColor} flex flex-col`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-4xl font-black text-slate-100">{num}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
              <ul className="flex-1 space-y-2 mb-4">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-blue-700 font-medium">{dbLabel}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                  <Brain className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">{modelLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RaaS Architecture ────────────────────────────────────────────────────────
function Architecture() {
  return (
    <section id="architecture" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700 rounded-full px-4 py-1.5 text-sm text-blue-300 font-medium mb-4">
            <Workflow className="w-3.5 h-3.5" /> Architecture
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            RaaS · Robot as a Service
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            AI Agent + Human Accountant + ERP System + AI Support — a four-in-one intelligent accounting platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="dark-card p-6 border-blue-600/40">
            <div className="text-xs text-blue-400 font-semibold mb-4 uppercase tracking-wider">RaaS CORE</div>
            <div className="space-y-4">
              <div className="bg-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold text-sm">AI Accountant</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Bookkeeping", "Tax", "Journals"].map(t => (
                    <div key={t} className="bg-blue-800/50 rounded-lg py-2 text-center text-xs text-blue-200">{t}</div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold text-sm">Human Accountant</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Result Review", "Journal Print"].map(t => (
                    <div key={t} className="bg-slate-600/50 rounded-lg py-2 text-center text-xs text-slate-300">{t}</div>
                  ))}
                </div>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold text-sm">ERP System</span>
                </div>
                <p className="text-xs text-slate-400">Human-AI workflow management</p>
              </div>
            </div>
          </div>

          <div className="dark-card p-6 border-cyan-600/30">
            <div className="text-xs text-cyan-400 font-semibold mb-4 uppercase tracking-wider">ACCOUNTING FIRM</div>
            <div className="flex flex-col gap-3">
              {["Sales", "Field Work", "Support", "Data Collection"].map(t => (
                <div key={t} className="bg-cyan-900/20 border border-cyan-800/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-white text-sm">{t}</span>
                </div>
              ))}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-blue-900/30 rounded-lg py-2 text-center text-xs text-blue-300">Source Docs →</div>
                <div className="flex-1 bg-blue-900/30 rounded-lg py-2 text-center text-xs text-blue-300">← Journals &amp; Tax</div>
              </div>
            </div>
          </div>

          <div className="dark-card p-6 border-green-600/30">
            <div className="text-xs text-green-400 font-semibold mb-4 uppercase tracking-wider">SME CLIENTS</div>
            <div className="flex flex-col gap-3">
              <div className="bg-green-900/20 rounded-xl p-4 text-center">
                <Building2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Business Dashboard</p>
                <p className="text-slate-400 text-xs mt-1">Real-time financial visibility</p>
              </div>
              <div className="bg-blue-900/20 rounded-xl p-3 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white text-sm font-medium">AI Support</p>
                  <p className="text-slate-400 text-xs">24/7 intelligent responses</p>
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-2">Business owner ecosystem</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {["HR", "Finance", "Procurement", "Digital", "Marketing", "Services"].map(t => (
                    <div key={t} className="bg-slate-600/40 rounded py-1 text-center text-xs text-slate-300">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack ────────────────────────────────────────────────────────────────
function TechStack() {
  const layers = [
    {
      label: "Application Layer",
      color: "from-blue-600 to-cyan-500",
      items: ["AI Bookkeeping Agent", "AI Support Agent", "Enterprise Advisory Agent"],
      grid: 3,
    },
    {
      label: "Capability Layer",
      color: "from-indigo-600 to-blue-600",
      items: [
        "Process Automation", "Conversational AI", "Data Analytics", "Multi-Agent Orchestration",
        "General Search", "Calendar/Calculator", "RPA Integration", "External API",
        "Web Parsing", "Document Parsing", "Invoice OCR", "Stamp & Formula OCR",
        "Vector Index", "Keyword Index", "Metadata Index", "Knowledge Chunking",
      ],
      grid: 4,
    },
    {
      label: "Model Layer",
      color: "from-violet-700 to-indigo-700",
      items: ["Finance Expert LLM", "Tax Expert LLM"],
      grid: 2,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-4">
            <Globe className="w-3.5 h-3.5" /> 3-Layer Architecture
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            The first AI that directly executes accounting &amp; tax tasks
          </h2>
          <p className="text-slate-500">Beyond just talking — built to actually do the work</p>
        </div>

        <div className="space-y-4">
          {layers.map(({ label, color, items, grid }) => (
            <div key={label} className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className={`bg-gradient-to-r ${color} px-6 py-3`}>
                <span className="text-white font-bold text-sm">{label}</span>
              </div>
              <div className={`p-6 grid gap-3`} style={{ gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))` }}>
                {items.map(item => (
                  <div key={item} className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-center text-center">
                    <span className="font-medium text-blue-800 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Start Your AI Accounting Journey
        </h2>
        <p className="text-blue-100 text-lg mb-10">
          Join thousands of AU &amp; NZ SMEs. Let AI handle your bookkeeping and tax.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-base shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#agents" className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-full font-medium text-base hover:bg-white/20 transition-all">
            View Demo
          </a>
        </div>
        <p className="text-blue-200 text-sm mt-6">No credit card · 30-day free trial · Cancel anytime</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">AcctAI<span className="gradient-text"> Pro</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              The first AI productivity tool that directly executes accounting and tax tasks for AU &amp; NZ SMEs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <div className="space-y-2 text-slate-400">
                <p className="hover:text-white cursor-pointer transition-colors">AI Bookkeeping</p>
                <p className="hover:text-white cursor-pointer transition-colors">AI Support</p>
                <p className="hover:text-white cursor-pointer transition-colors">Enterprise Advisory</p>
                <p className="hover:text-white cursor-pointer transition-colors">Business Lending</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Services</h4>
              <div className="space-y-2 text-slate-400">
                <p className="hover:text-white cursor-pointer transition-colors">Tax Lodgement</p>
                <p className="hover:text-white cursor-pointer transition-colors">Invoice Management</p>
                <p className="hover:text-white cursor-pointer transition-colors">Financial Reports</p>
                <p className="hover:text-white cursor-pointer transition-colors">Tax Planning</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">About</h4>
              <div className="space-y-2 text-slate-400">
                <p className="hover:text-white cursor-pointer transition-colors">About Us</p>
                <p className="hover:text-white cursor-pointer transition-colors">Careers</p>
                <p className="hover:text-white cursor-pointer transition-colors">Contact</p>
                <p className="hover:text-white cursor-pointer transition-colors">Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2025 AcctAI Pro. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Data Security</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Compliance Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Agents />
      <Architecture />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
}

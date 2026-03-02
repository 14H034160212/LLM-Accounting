"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calculator, FileText, FileSpreadsheet,
  MessageSquare, TrendingUp, CreditCard, Bell, Settings,
  ChevronLeft, ChevronRight, Bot, Building2, LogOut,
  Search, User, Moon, Sun, BarChart3
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", section: "Main" },
  { href: "/dashboard/accounting", icon: Calculator, label: "AI Bookkeeping", section: "Main" },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices", section: "Main" },
  { href: "/dashboard/tax", icon: FileSpreadsheet, label: "Tax Filing", section: "Main" },
  { href: "/dashboard/reports", icon: BarChart3, label: "Reports", section: "Main" },
  { href: "/dashboard/customer-service", icon: MessageSquare, label: "AI Support", section: "Agents" },
  { href: "/dashboard/enterprise", icon: TrendingUp, label: "Enterprise", section: "Agents" },
  { href: "/dashboard/lending", icon: CreditCard, label: "Business Lending", section: "Agents" },
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-lg">
              AcctAI<span className="gradient-text"> Pro</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hidden space-y-4">
          {sections.map(section => (
            <div key={section}>
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">{section}</p>
              )}
              <div className="space-y-1">
                {navItems.filter(i => i.section === section).map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href}>
                      <div className={`sidebar-item ${active ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-800 p-3 space-y-1">
          <div className={`sidebar-item ${collapsed ? "justify-center px-0" : ""}`}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </div>
          <div className={`sidebar-item text-red-400 hover:text-red-300 hover:bg-red-900/20 ${collapsed ? "justify-center px-0" : ""}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full sidebar-item hover:bg-slate-700/50 ${collapsed ? "justify-center px-0" : ""}`}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices, journals, reports..."
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Alex Chen</p>
                <p className="text-xs text-slate-400">Sydney Tech Pty Ltd</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

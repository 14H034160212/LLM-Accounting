"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet, CheckCircle, Clock, AlertCircle, Send,
  Download, Eye, Play, ChevronRight, Calendar, TrendingUp,
  Shield, Zap, RefreshCw, FileText
} from "lucide-react";

// Mock data removed

export default function TaxPage() {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [taxData, setTaxData] = useState(null);

  useEffect(() => {
    fetch("/api/tax")
      .then(r => r.json())
      .then(data => {
        if (!data.error) setTaxData(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tax Filing</h1>
          <p className="text-slate-500 text-sm">All tax types · AI-generated tax returns</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Sync ATO Data
          </button>
          <button className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all">
            <Zap className="w-4 h-4" /> Lodge All Returns
          </button>
        </div>
      </div>

      {/* Tax calendar banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-amber-800">Filing Reminder</p>
          <p className="text-sm text-amber-600">GST BAS, income tax instalment &amp; PAYG lodgement deadline: <strong>28 July 2025</strong> (13 days away)</p>
        </div>
        <button className="text-sm text-amber-700 bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-200 transition-colors flex-shrink-0">
          View Calendar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Tax Payable", value: taxData ? `A$${taxData.net_payable.toFixed(2)}` : "A$0.00", color: "from-blue-600 to-indigo-600", icon: TrendingUp },
          { label: "Returns Filed", value: "0 items", color: "from-green-500 to-emerald-600", icon: CheckCircle },
          { label: "Returns Pending", value: "1 items", color: "from-amber-500 to-orange-500", icon: Clock },
          { label: "Compliance Score", value: "98/100", color: "from-cyan-500 to-blue-500", icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="tech-card p-4">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Tax list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-slate-800 text-sm">Filing Tasks</h3>
          {!taxData ? (
            <p className="text-slate-400 text-sm p-4 text-center">Loading or no data...</p>
          ) : (
            <div
              onClick={() => setSelected(1)}
              className={`tech-card p-4 cursor-pointer transition-all ${selected === 1 ? "border-blue-400 border-2 bg-blue-50/30" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">GST / BAS Return</p>
                  <p className="text-xs text-slate-400 mt-0.5">{taxData.period} · Monthly</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${taxData.status === "Filed" ? "status-success" :
                  taxData.status === "Pending" ? "status-warning" : "status-info"
                  }`}>{taxData.status}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-slate-900">A${taxData.net_payable.toFixed(2)}</span>
                <span className="text-xs text-slate-400">Due {taxData.deadline}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all bg-amber-400`}
                  style={{ width: `85%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Completion 85%</p>
            </div>
          )}
        </div>

        {/* GST Detail */}
        <div className="lg:col-span-3 tech-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900">GST Return Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">June 2025 · AI auto-generated</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Detail table */}
          <div className="space-y-2 mb-6">
            {!taxData ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Gross Sales (excl. GST)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Calculated from AI Journals</p>
                  </div>
                  <span className="text-base font-bold text-slate-900">A${taxData.sales?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Output Tax (GST Collected)</p>
                    <p className="text-xs text-slate-400 mt-0.5">10% on sales</p>
                  </div>
                  <span className="text-base font-bold text-slate-900">A${taxData.output_tax?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Input Tax Credits</p>
                    <p className="text-xs text-slate-400 mt-0.5">From scanned invoices</p>
                  </div>
                  <span className="text-base font-bold text-slate-900">A${taxData.input_tax?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Net GST Payable</p>
                    <p className="text-xs text-slate-400 mt-0.5">= Output Tax - Input Credits</p>
                  </div>
                  <span className="text-base font-bold text-blue-700">A${taxData.net_payable?.toFixed(2) || "0.00"}</span>
                </div>
              </>
            )}
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-200 text-sm">Total Tax Payable This Period</p>
              <p className="text-white text-2xl font-bold mt-0.5">{taxData ? `A$${taxData.net_payable.toFixed(2)}` : "A$0.00"}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">incl. GST &amp; PAYG</p>
              <p className="text-blue-200 text-xs mt-0.5">Lodge by: 2025-07-28</p>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Lodging return...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Electronic Return
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            This will be submitted to the ATO directly. Please verify all data before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
}

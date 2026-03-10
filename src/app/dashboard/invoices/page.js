"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText, Upload, Download, Search, Filter, CheckCircle,
  AlertCircle, Clock, Eye, Trash2, RefreshCw, Sparkles,
  ChevronDown, Plus, FileCheck, Building2, Calendar, X, Loader2
} from "lucide-react";

// Mock data removed
const typeColors = {
  "Tax Invoice": "text-blue-700 bg-blue-50 border-blue-200",
  "Receipt": "text-indigo-700 bg-indigo-50 border-indigo-200",
  "Credit Note": "text-teal-700 bg-teal-50 border-teal-200",
};

// ─── OCR Result Modal ──────────────────────────────────────────────────────────
function OcrResultModal({ result, onConfirm, onClose }) {
  const inv = result.invoice;

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "—";
    const cur = (inv.currency || "AUD").toUpperCase();
    const symbol = cur.includes("NZ") ? "NZ$" : cur.includes("AU") ? "A$" : "$";
    return `${symbol}${Number(amount).toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">AI Extracted Invoice Data</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { label: "Supplier", value: inv.seller },
            { label: "Invoice No.", value: inv.invoiceNumber },
            { label: "Date", value: inv.date },
            { label: "Type", value: inv.type },
            { label: "Subtotal", value: formatCurrency(inv.subtotal) },
            { label: "GST", value: formatCurrency(inv.gst) },
            { label: "Total", value: formatCurrency(inv.total) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-semibold text-slate-900">{value || "—"}</span>
            </div>
          ))}
          {inv.lineItems?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2 mt-2">Line Items</p>
              {inv.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-1">
                  <span>{item.description}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition-colors">
            Discard
          </button>
          <button onClick={() => onConfirm({ ...inv, image_url: result.image_url })} className="flex-1 text-sm text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition-colors font-medium">
            Add to Invoice List
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewInvoiceModal({ invoice, onClose }) {
  let rawData = null;
  try {
    rawData = invoice.raw_json ? JSON.parse(invoice.raw_json) : invoice;
  } catch (e) {
    rawData = invoice;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">Invoice Comparison View</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Original Document */}
          <div className="md:w-1/2 p-6 bg-slate-200 overflow-y-auto flex items-start justify-center border-r border-slate-100">
            {invoice.image_url ? (
              <img 
                src={invoice.image_url} 
                alt="Original Receipt" 
                className="max-w-full h-auto rounded-lg shadow-lg border border-white" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Upload className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">No original image available for this record</p>
              </div>
            )}
          </div>

          {/* Right Panel: Data Extracted */}
          <div className="md:w-1/2 p-6 overflow-y-auto bg-white space-y-6">
            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Structured Data (SQLite)</h4>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {[
                  { label: "ID", value: invoice.id },
                  { label: "Status", value: invoice.status },
                  { label: "Supplier", value: invoice.seller },
                  { label: "Date", value: invoice.date },
                  { label: "Amount", value: typeof invoice.amount === 'number' ? `$${invoice.amount.toFixed(2)}` : invoice.amount },
                  { label: "Tax (GST)", value: typeof invoice.tax === 'number' ? `$${invoice.tax.toFixed(2)}` : invoice.tax },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.value || "—"}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Raw AI JSON Payload</h4>
              <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 px-6 py-2 rounded-xl transition-colors font-medium shadow-sm">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrError, setOcrError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch real invoices from DB on mount
  useEffect(() => {
    fetch("/api/invoices")
      .then(r => r.json())
      .then(data => {
        if (!data.error) setInvoices(data);
      })
      .catch(console.error);
  }, []);

  const filters = ["All", "Verified", "Pending", "Error"];
  const filtered = invoices.filter(inv => {
    const matchSearch = inv.seller?.toLowerCase().includes(search.toLowerCase()) || inv.id?.includes(search);
    const matchFilter = activeFilter === "All" || inv.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const processFile = async (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setOcrError("Unsupported format. Please upload JPG, PNG, WebP, or PDF.");
      return;
    }
    setOcrLoading(true);
    setOcrError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/invoice-ocr", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) {
        setOcrError(data.error);
      } else {
        setOcrResult(data);
      }
    } catch {
      setOcrError("Failed to connect. Please ensure Ollama is running with qwen3vl:8b.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileInput = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleConfirm = async (inv) => {
    const id = `INV-${Date.now()}`;
    const newInvoice = {
      id,
      seller: inv.seller || "Unknown",
      buyer: "My Company",
      amount: inv.total || 0,
      tax: inv.gst || 0,
      date: inv.date || new Date().toISOString().split("T")[0],
      type: inv.type || "Tax Invoice",
      currency: inv.currency || 'AUD',
      status: "Verified",
      image_url: inv.image_url || null
    };

    // Save to DB
    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice)
      });
      // Trigger AI Journal Entry Generation
      await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_from_invoice", invoice: newInvoice })
      });

      setInvoices(prev => [newInvoice, ...prev]);
      setOcrResult(null);
    } catch (e) {
      console.error(e);
      setOcrError("Failed to save to database");
    }
  };

  const totalTax = invoices.filter(i => i.status === "Verified")
    .reduce((sum, i) => {
      const taxVal = typeof i.tax === 'string' ? parseFloat(i.tax.replace(/[^0-9.-]/g, "")) : Number(i.tax);
      return sum + (isNaN(taxVal) ? 0 : taxVal);
    }, 0);

  return (
    <div className="p-6 space-y-5">
      {/* OCR Result Modal */}
      {ocrResult && <OcrResultModal result={ocrResult} onConfirm={handleConfirm} onClose={() => setOcrResult(null)} />}

      {/* View Data Modal */}
      {viewingInvoice && <ViewInvoiceModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileInput} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Invoice Management</h1>
          <p className="text-slate-500 text-sm">AI-powered invoice recognition · GST extraction · Vision model (preferred JPG/PNG)</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Scan Invoice
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: `${invoices.length}`, sub: "This month", icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Verified", value: `${invoices.filter(i => i.status === "Verified").length}`, sub: "GST claimable", icon: FileCheck, color: "from-green-500 to-emerald-600" },
          { label: "GST Input Credits", value: `A$${totalTax.toFixed(2)}`, sub: "Claimable on BAS", icon: CheckCircle, color: "from-cyan-500 to-blue-500" },
          { label: "Pending Review", value: `${invoices.filter(i => i.status !== "Verified").length}`, sub: "Needs attention", icon: AlertCircle, color: "from-amber-500 to-orange-500" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="tech-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Upload drop zone */}
      <div
        onClick={() => !ocrLoading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragOver ? "border-blue-500 bg-blue-50" : "border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400"
          }`}
      >
        {ocrLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="font-semibold text-slate-700">AI is reading your invoice...</p>
            <p className="text-sm text-slate-400">Vision model is extracting data</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Drop invoice here or click to upload</p>
            <p className="text-sm text-slate-400 mt-1">Preferred: JPG or PNG. WebP may sometimes fail — convert to PNG/JPG if you see an error. Max 10MB. Ensure text is clear for best OCR results.</p>
            <button className="mt-4 text-sm text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition-colors pointer-events-none">
              Choose File
            </button>
          </>
        )}
      </div>

      {/* OCR Error */}
      {ocrError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{ocrError}</span>
          <button onClick={() => setOcrError("")} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search supplier, invoice number..."
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none flex-1"
          />
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-sm px-4 py-2 rounded-xl transition-colors font-medium ${activeFilter === f
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-sm text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Batch actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-blue-700">{selected.length} invoice(s) selected</span>
          <button className="text-sm text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Verify All</button>
          <button className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">Create Journal</button>
          <button onClick={() => setSelected([])} className="text-sm text-slate-500 hover:text-red-500 ml-auto">Clear Selection</button>
        </div>
      )}

      {/* Invoice table */}
      <div className="tech-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-3 px-4 text-left">
                <input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? invoices.map(i => i.id) : [])} />
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Invoice #</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase">GST</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <input type="checkbox" className="rounded" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} />
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">{inv.id}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-800 max-w-[160px] truncate">{inv.seller}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[inv.type] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                    {inv.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">
                  {typeof inv.amount === 'number' ? `$${inv.amount.toFixed(2)}` : inv.amount}
                </td>
                <td className="py-3 px-4 text-right text-slate-600">
                  {typeof inv.tax === 'number' ? `$${inv.tax.toFixed(2)}` : inv.tax}
                </td>
                <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === "Verified" ? "status-success" :
                    inv.status === "Error" ? "status-error" : "status-warning"
                    }`}>{inv.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewingInvoice(inv)} className="p-1 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                    </button>
                    <button onClick={() => setInvoices(prev => prev.filter(i => i.id !== inv.id))} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {invoices.length} invoices</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Prev</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

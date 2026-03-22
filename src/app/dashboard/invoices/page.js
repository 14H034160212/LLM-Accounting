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

// ─── Memoized Header Stat Row ────────────────────────────────────────────────
import { memo } from "react";

const StatCard = memo(({ label, value, sub, icon: Icon, color }) => (
  <div className="tech-card p-4 h-[130px] flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <div>
      <div className="h-8 flex items-baseline">
        <p className="text-2xl font-bold text-slate-900 leading-none">
          {value === "..." ? (
            <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded" />
          ) : value}
        </p>
      </div>
      <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  </div>
));
StatCard.displayName = "StatCard";

// ─── Memoized Invoice Row ──────────────────────────────────────────────────
const InvoiceRow = memo(({ inv, selected, onToggle, onView, onReextract, isReextracting }) => (
  <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors h-[57px]">
    <td className="py-3 px-4">
      <input type="checkbox" className="rounded" checked={selected} onChange={onToggle} />
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
      {inv.reextract_status === 'processing' ? (
        <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          AI Processing...
        </span>
      ) : (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === "Verified" ? "status-success" :
          inv.status === "Error" ? "status-error" : "status-warning"
          }`}>{inv.status}</span>
      )}
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onReextract(inv.id, true)}
          disabled={isReextracting || inv.reextract_status === 'processing'}
          title="Quick Re-extract"
          className={`p-1 rounded-lg transition-colors ${(isReextracting || inv.reextract_status === 'processing') ? "bg-slate-100" : "hover:bg-blue-100"
            }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(isReextracting || inv.reextract_status === 'processing') ? "text-blue-500 animate-spin" : "text-slate-400 hover:text-blue-600"
            }`} />
        </button>
        <button onClick={() => onView(inv)} className="p-1 hover:bg-blue-100 rounded-lg transition-colors">
          <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
        </button>
        <button className="p-1 hover:bg-red-100 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
        </button>
      </div>
    </td>
  </tr>
));
InvoiceRow.displayName = "InvoiceRow";

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

function ViewInvoiceModal({ invoice, onReextract, isReextracting, onClose }) {
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
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                {[
                  { label: "ID", value: invoice.id },
                  { label: "Status", value: invoice.status },
                  { label: "Supplier", value: invoice.seller },
                  { label: "Invoice #", value: invoice.invoice_number || "N/A" },
                  { label: "Date", value: invoice.date },
                  { label: "Due Date", value: invoice.due_date || "—" },
                  { label: "Amount", value: `${invoice.currency || 'AUD'} ${typeof invoice.amount === 'number' ? invoice.amount.toFixed(2) : invoice.amount}` },
                  { label: "Tax", value: `${invoice.currency || 'AUD'} ${typeof invoice.tax === 'number' ? invoice.tax.toFixed(2) : invoice.tax}` },
                  { label: "Discount", value: invoice.discount > 0 ? `${invoice.currency || 'AUD'} ${invoice.discount.toFixed(2)}` : "None" },
                  { label: "Customer", value: invoice.customer_name || "Unknown" },
                ].map(item => (
                  <div key={item.label} className="overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate" title={String(item.value)}>{item.value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Addresses Section */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-50">
                  <p className="text-[9px] text-blue-400 font-bold uppercase mb-1">Seller Address</p>
                  <p className="text-[10px] text-slate-600 leading-relaxed italic line-clamp-2">{invoice.seller_address || "Address not detected"}</p>
                </div>
                <div className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-50">
                  <p className="text-[9px] text-indigo-400 font-bold uppercase mb-1">Customer Address</p>
                  <p className="text-[10px] text-slate-600 leading-relaxed italic line-clamp-2">{invoice.customer_address || "Address not detected"}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Item Analysis</h4>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100">AI DETECTED</div>
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-xl shadow-sm">
                <table className="w-full text-left bg-white">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Qty</th>
                      <th className="px-3 py-2.5 text-right">Price</th>
                      <th className="px-3 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-slate-700 divide-y divide-slate-50">
                    {rawData.lineItems && rawData.lineItems.length > 0 ? (
                      rawData.lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-medium max-w-[150px] truncate" title={item.description}>{item.description}</td>
                          <td className="px-3 py-2.5 text-right text-slate-500">{item.quantity || 1}</td>
                          <td className="px-3 py-2.5 text-right text-slate-500">${Number(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-900">${Number(item.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-8 text-center text-slate-400 italic bg-slate-50/30">No granular line items detected by AI</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Technical Metadata hidden in a small detail for audit */}
              <details className="mt-4 group">
                <summary className="text-[10px] text-slate-300 font-bold uppercase cursor-pointer hover:text-slate-400 list-none flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> View Technical JSON Payload
                </summary>
                <pre className="mt-2 bg-slate-900 text-blue-300/80 p-3 rounded-lg text-[9px] font-mono leading-tight overflow-x-auto border border-slate-800">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </details>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => onReextract(invoice.id)}
              disabled={isReextracting}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all border ${isReextracting
                ? "bg-slate-100 text-slate-400 border-slate-200"
                : "bg-white text-blue-600 border-blue-100 hover:bg-blue-50 shadow-sm"
                }`}
            >
              {isReextracting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  AI Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Re-extract Data (High Precision)
                </>
              )}
            </button>
          </div>
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
  const [reextractingId, setReextractingId] = useState(null);
  const [stats, setStats] = useState(null);
  const [optimizationStatus, setOptimizationStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const fileInputRef = useRef(null);

  const loadInvoices = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search,
        filter: activeFilter
      });
      const r = await fetch(`/api/invoices?${params}`);
      const data = await r.json();
      if (data.invoices) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error("Failed to load invoices:", e);
    }
  };

  const loadStats = async () => {
    try {
      const r = await fetch("/api/invoices/stats");
      const data = await r.json();
      if (!data.error) setStats(data);
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
  };

  useEffect(() => {
    const loadOptimizationStatus = async () => {
      try {
        const r = await fetch("/api/optimization/status");
        const data = await r.json();
        if (data.success) setOptimizationStatus(data.data);
      } catch (e) {
        console.error("Failed to load optimization status:", e);
      }
    };
    loadOptimizationStatus();
    const optInterval = setInterval(loadOptimizationStatus, 30000); // Poll every 30s
    return () => clearInterval(optInterval);
  }, []);

  // Main data loader
  useEffect(() => {
    loadInvoices();
    loadStats();
  }, [currentPage, search, activeFilter]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter]);

  // Initial Auto-detect
  useEffect(() => {
    const triggerAutoDetect = async () => {
      try {
        const r = await fetch("/api/invoices/auto-detect");
        const data = await r.json();
        if (data.ids && data.ids.length > 0) {
          console.log(`[Auto-detect] Triggered for ${data.ids.length} invoices.`);
        }
      } catch (e) {
        console.error("Auto-detect failed:", e);
      }
    };
    const timeout = setTimeout(triggerAutoDetect, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Polling for processing status - using a ref to avoid dependency loops
  const pollingRef = useRef(null);

  useEffect(() => {
    const isProcessing = invoices.some(inv => inv.reextract_status === 'processing');
    const isGlobalProcessing = stats?.reextraction?.processing > 0;
    
    // Clear existing interval if we're not processing or if dependencies changed
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (isProcessing || isGlobalProcessing) {
      pollingRef.current = setInterval(async () => {
        try {
          await Promise.all([loadInvoices(), loadStats()]);
        } catch (e) {
          console.error("Polling failed:", e);
        }
      }, 10000); // 10s for even more stability
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [invoices.length, stats?.reextraction?.processing]); // Only trigger if counts change

  const totalPages = pagination.totalPages;
  const paginatedInvoices = invoices;
  const filters = ["All", "Verified", "Pending", "Error"];

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

  // Handle re-extraction with granular state update
  const handleReextract = async (id, isManual = false) => {
    if (!id) return;
    setReextractingId(id);
    
    // Optimistically update the single row status to 'processing'
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, reextract_status: 'processing' } : inv
    ));

    try {
      const res = await fetch("/api/invoices/reextract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      if (data.success) {
        // Targeted update of only the changed invoice
        setInvoices(prev => prev.map(inv =>
          inv.id === id ? { ...inv, ...data.invoice, reextract_status: 'completed', raw_json: JSON.stringify(data.invoice) } : inv
        ));

        if (viewingInvoice?.id === id) {
          setViewingInvoice(prev => ({ ...prev, ...data.invoice, raw_json: JSON.stringify(data.invoice) }));
        }
      } else {
        setInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, reextract_status: 'failed' } : inv
        ));
        if (isManual) setOcrError("Re-extraction failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, reextract_status: 'failed' } : inv
      ));
      if (isManual) setOcrError("Failed to connect to re-extraction API.");
    } finally {
      setReextractingId(null);
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
      {viewingInvoice && (
        <ViewInvoiceModal
          invoice={viewingInvoice}
          isReextracting={reextractingId === viewingInvoice.id}
          onReextract={(id) => handleReextract(id, true)}
          onClose={() => setViewingInvoice(null)}
        />
      )}

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
          { label: "Total Invoices", value: invoices.length > 0 ? `${invoices.length}` : "...", sub: "This month", icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Verified", value: invoices.length > 0 ? `${invoices.filter(i => i.status === "Verified").length}` : "...", sub: "GST claimable", icon: FileCheck, color: "from-green-500 to-emerald-600" },
          { label: "GST Input Credits", value: invoices.length > 0 ? `A$${totalTax.toFixed(2)}` : "...", sub: "Claimable on BAS", icon: CheckCircle, color: "from-cyan-500 to-blue-500" },
          { label: "Pending Review", value: invoices.length > 0 ? `${invoices.filter(i => i.status !== "Verified").length}` : "...", sub: "Needs attention", icon: AlertCircle, color: "from-amber-500 to-orange-500" },
        ].map(props => (
          <StatCard key={props.label} {...props} />
        ))}
      </div>

      {/* AI Intelligence Pipeline - Stable Layout Container */}
      <div className="min-h-[200px] transition-all duration-300">
        {stats && (stats.global.percentage < 100 || stats.reextraction.processing > 0) ? (
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <RefreshCw className={`w-5 h-5 ${stats.reextraction.processing > 0 ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-none">AI Intelligence Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-1">Real-time extraction & data enrichment in progress</p>
                </div>
              </div>
              {stats.reextraction.processing > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-blue-600 text-white rounded-lg animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {stats.reextraction.processing} ACTIVE TASKS
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 pt-2">
              {/* Library Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Global Library Extraction (10k+)</span>
                  <span className="text-blue-600 font-bold">{stats.global.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-in-out"
                    style={{ width: `${stats.global.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-right">{stats.global.completed} / {stats.global.total} processed</p>
              </div>

              {/* Re-extraction Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Re-extraction Backlog (Missing Lines)</span>
                  <span className="text-emerald-600 font-bold">{stats.reextraction.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-in-out"
                    style={{ width: `${stats.reextraction.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-right">{stats.reextraction.completed} / {stats.reextraction.total_needed + stats.reextraction.completed} re-extracted</p>
              </div>
            </div>

            {/* Model Optimization & Performance */}
            {optimizationStatus && optimizationStatus.metrics && (
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Model Optimization & Performance</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-400">Last Optimized: <span className="text-slate-600 font-semibold">{optimizationStatus.last_run}</span></span>
                    <span className="text-[10px] text-slate-400">Trained Samples: <span className="text-slate-600 font-semibold">{optimizationStatus.last_trained}</span></span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total amount", key: "total" },
                    { label: "Invoice Date", key: "date" },
                    { label: "Seller ABN", key: "sellerABN" },
                    { label: "Buyer Name", key: "buyer" }
                  ].map(metric => {
                    const m = optimizationStatus.metrics[metric.key];
                    const f1 = m ? (m.f1 * 100).toFixed(1) : "0.0";
                    return (
                      <div key={metric.key} className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-500 font-medium">{metric.label}</span>
                          <span className={`text-[10px] font-bold ${Number(f1) > 90 ? "text-green-600" : Number(f1) > 70 ? "text-blue-600" : "text-amber-600"}`}>
                            {f1}% F1
                          </span>
                        </div>
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${Number(f1) > 90 ? "bg-green-500" : Number(f1) > 70 ? "bg-blue-500" : "bg-amber-500"}`}
                            style={{ width: `${f1}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : !stats ? (
          /* Placeholder to maintain layout while stats load */
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 h-[220px] shadow-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs font-bold font-mono">INITIALIZING PIPELINE...</p>
            </div>
          </div>
        ) : null}
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
            {paginatedInvoices.map(inv => (
              <InvoiceRow 
                key={inv.id} 
                inv={inv} 
                selected={selected.includes(inv.id)}
                onToggle={() => toggleSelect(inv.id)}
                onView={setViewingInvoice}
                onReextract={handleReextract}
                isReextracting={reextractingId === inv.id}
              />
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} results</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={`px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-opacity ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Prev
            </button>
            <div className="flex items-center px-2 font-medium">
              Page {currentPage} of {totalPages || 1}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-opacity ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

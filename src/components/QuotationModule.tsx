import React, { useState } from 'react';
import {
  Quotation,
  QuotationLineItem,
  ProjectLead,
  CompanyBillingSettings,
  ServiceCatalogItem,
  Invoice,
} from '../types.ts';
import { GST_RATE_TIERS, STANDARD_QUOTATION_TERMS } from '../data/quotationData.ts';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Printer,
  Receipt,
  Building,
  Calendar,
  X,
  Trash2,
  Copy,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Percent,
} from 'lucide-react';

interface QuotationModuleProps {
  quotations: Quotation[];
  projects: ProjectLead[];
  serviceCatalog: ServiceCatalogItem[];
  companySettings: CompanyBillingSettings;
  onUpdateQuotation: (updated: Quotation) => void;
  onCreateQuotation: (newQuote: Quotation) => void;
  onConvertToInvoice: (quote: Quotation) => void;
}

export const QuotationModule: React.FC<QuotationModuleProps> = ({
  quotations,
  projects,
  serviceCatalog,
  companySettings,
  onUpdateQuotation,
  onCreateQuotation,
  onConvertToInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuoteForView, setSelectedQuoteForView] = useState<Quotation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectPickerModal, setShowProjectPickerModal] = useState(false);

  // Create Form State
  const [formQuoteNumber, setFormQuoteNumber] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formClientGstin, setFormClientGstin] = useState('07AAACG9214H1ZM');
  const [formBillingAddress, setFormBillingAddress] = useState('');
  const [formStateCode, setFormStateCode] = useState('07 - Delhi');
  const [formIsInterState, setFormIsInterState] = useState(false);
  const [formTaxRatePercent, setFormTaxRatePercent] = useState<number>(18);
  const [formValidUntil, setFormValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formProjectId, setFormProjectId] = useState<string | undefined>(undefined);
  const [formProjectLeadCode, setFormProjectLeadCode] = useState<string | undefined>(undefined);
  const [formNotes, setFormNotes] = useState('Standard 30-day architectural graphics estimate.');
  const [formRequiresSiteMeasurement, setFormRequiresSiteMeasurement] = useState(true);
  const [formTerms, setFormTerms] = useState<string[]>([...STANDARD_QUOTATION_TERMS]);

  const [formItems, setFormItems] = useState<QuotationLineItem[]>([
    {
      id: `qi-${Date.now()}-1`,
      productName: 'Frosted Glass Film 3M Dusted Crystal',
      category: 'Window Film',
      hsnSacCode: '391990',
      quantity: 500,
      unit: 'sq.ft',
      unitPrice: 135,
      discountPercent: 0,
      taxRatePercent: 18,
      amount: 67500,
    },
  ]);

  // Catalog item picker in modal
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');

  // Overview metrics
  const totalQuotationsValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
  const approvedQuotes = quotations.filter((q) => q.status === 'approved');
  const approvedTotal = approvedQuotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const sentQuotes = quotations.filter((q) => q.status === 'sent');
  const sentTotal = sentQuotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const draftQuotes = quotations.filter((q) => q.status === 'draft');
  const winRate = quotations.length > 0 ? ((approvedQuotes.length / quotations.length) * 100).toFixed(0) : '0';

  // Filtered list
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.projectLeadCode && q.projectLeadCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            APPROVED
          </span>
        );
      case 'sent':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-400">
            IN REVIEW
          </span>
        );
      case 'draft':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            DRAFT
          </span>
        );
      case 'rejected':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-rose-600 dark:text-rose-400">
            DECLINED
          </span>
        );
    }
  };

  // Line item manipulation
  const handleItemChange = (index: number, field: keyof QuotationLineItem, val: any) => {
    const updated = [...formItems];
    const item = { ...updated[index], [field]: val };

    if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
      const q = field === 'quantity' ? Number(val) || 0 : item.quantity;
      const r = field === 'unitPrice' ? Number(val) || 0 : item.unitPrice;
      const d = field === 'discountPercent' ? Number(val) || 0 : item.discountPercent;
      const raw = q * r;
      item.amount = Math.round(raw - (raw * d) / 100);
    }

    updated[index] = item;
    setFormItems(updated);
  };

  const handleAddCustomItem = () => {
    setFormItems([
      ...formItems,
      {
        id: `qi-${Date.now()}-${formItems.length + 1}`,
        productName: 'Site Survey & Wayfinding Elevation CAD Detail',
        category: 'Installation & Survey',
        hsnSacCode: '998399',
        quantity: 1,
        unit: 'day',
        unitPrice: 4500,
        discountPercent: 0,
        taxRatePercent: formTaxRatePercent,
        amount: 4500,
      },
    ]);
  };

  const handleAddFromCatalog = () => {
    if (!selectedCatalogId) return;
    const cat = serviceCatalog.find((c) => c.id === selectedCatalogId);
    if (!cat) return;

    setFormItems([
      ...formItems,
      {
        id: `qi-${Date.now()}-${formItems.length + 1}`,
        productName: cat.name,
        category: cat.category,
        hsnSacCode: cat.hsnSacCode || '391990',
        quantity: cat.minOrderQuantity || 100,
        unit: cat.unit,
        unitPrice: cat.baseRate,
        discountPercent: 0,
        taxRatePercent: cat.taxRatePercent || formTaxRatePercent,
        amount: (cat.minOrderQuantity || 100) * cat.baseRate,
      },
    ]);
    setSelectedCatalogId('');
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Calculation of GST amounts
  const calculateFormTotals = () => {
    const subtotal = formItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const taxRate = formTaxRatePercent;
    const totalTax = Math.round((subtotal * taxRate) / 100);
    const cgstAmount = formIsInterState ? 0 : Math.round(totalTax / 2);
    const sgstAmount = formIsInterState ? 0 : Math.round(totalTax / 2);
    const igstAmount = formIsInterState ? totalTax : 0;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxAmount: totalTax,
      grandTotal,
    };
  };

  const handleCreateSubmit = (status: Quotation['status'] = 'sent') => {
    if (!formClientName.trim()) {
      return;
    }

    const totals = calculateFormTotals();
    const newQuote: Quotation = {
      id: `q-${Date.now()}`,
      quoteNumber: formQuoteNumber.trim() || `Q-2026-${Math.floor(100 + Math.random() * 900)}-REV0`,
      date: new Date().toISOString().split('T')[0],
      validUntil: formValidUntil,
      clientName: formClientName.trim(),
      clientContactPerson: formContactPerson.trim() || undefined,
      clientContactPhone: formContactPhone.trim() || undefined,
      clientContactEmail: formContactEmail.trim() || undefined,
      clientGstin: formClientGstin.trim() || undefined,
      billingAddress: formBillingAddress.trim() || 'Commercial Office, NCR',
      stateCode: formStateCode,
      isInterState: formIsInterState,
      projectId: formProjectId,
      projectLeadCode: formProjectLeadCode,
      items: formItems,
      taxRatePercent: formTaxRatePercent,
      terms: formTerms,
      subtotal: totals.subtotal,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      status,
      revisionsCount: 0,
      requiresSiteMeasurement: formRequiresSiteMeasurement,
      notes: formNotes,
    };

    onCreateQuotation(newQuote);
    setShowCreateModal(false);
  };

  const handleLoadProjectIntoQuote = (proj: ProjectLead) => {
    setFormProjectId(proj.id);
    setFormProjectLeadCode(proj.leadCode);
    setFormClientName(proj.clientName);
    setFormContactPerson(proj.contactPerson || '');
    setFormContactPhone(proj.contactPhone || '');
    setFormContactEmail(proj.contactEmail || '');
    setFormBillingAddress(`${proj.location}, Commercial Center`);
    setFormQuoteNumber(`Q-${proj.leadCode.replace('E9-', '')}-REV1`);

    if (proj.quotation && proj.quotation.items.length > 0) {
      setFormItems(proj.quotation.items);
      setFormTaxRatePercent(proj.quotation.taxRatePercent || 18);
      setFormIsInterState(proj.quotation.isInterState || false);
    } else {
      setFormItems([
        {
          id: `qi-${Date.now()}-1`,
          productName: `${proj.projectName} - Environmental Graphics Execution`,
          category: 'Wall Graphics',
          hsnSacCode: '491199',
          quantity: 1,
          unit: 'job',
          unitPrice: proj.estimatedValue || 250000,
          discountPercent: 0,
          taxRatePercent: 18,
          amount: proj.estimatedValue || 250000,
        },
      ]);
    }

    setShowProjectPickerModal(false);
    setShowCreateModal(true);
  };

  const handleMarkAsSent = (quote: Quotation) => {
    const updated: Quotation = {
      ...quote,
      status: 'sent',
      lastReminderSentAt: new Date().toISOString(),
    };
    onUpdateQuotation(updated);
    if (selectedQuoteForView?.id === quote.id) {
      setSelectedQuoteForView(updated);
    }
  };

  const handleDuplicateRevision = (quote: Quotation) => {
    const nextRevNum = (quote.revisionsCount || 0) + 1;
    const baseNumber = quote.quoteNumber.replace(/-REV\d+$/, '');
    const newQuote: Quotation = {
      ...quote,
      id: `q-${Date.now()}`,
      quoteNumber: `${baseNumber}-REV${nextRevNum}`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      revisionsCount: nextRevNum,
    };
    onCreateQuotation(newQuote);
  };

  const handleGstinChange = (gst: string) => {
    setFormClientGstin(gst);
    // Auto-detect inter-state if first 2 digits do not match Haryana '06' or Delhi '07'
    const code = gst.substring(0, 2);
    if (code && code !== '06' && code !== '07') {
      setFormIsInterState(true);
      setFormStateCode(`${code} - Inter-State`);
    } else {
      setFormIsInterState(false);
      setFormStateCode(code === '06' ? '06 - Haryana' : '07 - Delhi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Structured 4-Column Enterprise Metric Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Gross Quoted Volume</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono tabular-nums">
            ₹{totalQuotationsValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">{quotations.length} formal proposals</span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Ratified / Approved Value</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            ₹{approvedTotal.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">
            {winRate}% proposal acceptance rate
          </span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Awaiting Client PO</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono tabular-nums">
            ₹{sentTotal.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">{sentQuotes.length} estimates under review</span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Draft Worksheets</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono tabular-nums">
            {draftQuotes.length} <span className="text-sm font-normal text-slate-500">Drafts</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Pending HSN/SAC verification</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and New Quote Triggers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotation #, client, or lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          <select
            aria-label="Filter quotations by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({quotations.length})</option>
            <option value="approved">Approved / Won</option>
            <option value="sent">Sent / Pending</option>
            <option value="draft">Drafts</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowProjectPickerModal(true)}
            className="px-3 py-1.5 rounded bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-zinc-800"
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Import from Project Lead</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormProjectId(undefined);
              setFormProjectLeadCode(undefined);
              setFormClientName('');
              setFormContactPerson('');
              setFormContactPhone('');
              setFormContactEmail('');
              setFormBillingAddress('');
              setFormQuoteNumber(`Q-2026-${Math.floor(100 + Math.random() * 900)}-REV0`);
              setShowCreateModal(true);
            }}
            className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prepare GST Quotation</span>
          </button>
        </div>
      </div>

      {/* Quotation Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="py-3 px-4">Quote # & Date</th>
                <th className="py-3 px-4">Client & Contact</th>
                <th className="py-3 px-4">GST Rate & Tax Type</th>
                <th className="py-3 px-4 text-right">Taxable Subtotal (₹)</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    <FileSpreadsheet className="w-8 h-8 opacity-40 mx-auto mb-2 text-amber-500" />
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">No quotations match your search or filters.</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Create a quotation or import from an active project above.</p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition group"
                  >
                    {/* Quote # & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-mono font-semibold text-[11px]">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                            {quote.quoteNumber}
                          </p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> {quote.date} · Valid till {quote.validUntil}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client & Contact */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{quote.clientName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                        {quote.clientContactPerson && <span>{quote.clientContactPerson}</span>}
                        {quote.projectLeadCode && <span className="font-mono text-[10px]">({quote.projectLeadCode})</span>}
                      </div>
                    </td>

                    {/* GST Rate & Tax Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                          GST {quote.taxRatePercent}%
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {quote.isInterState ? 'IGST (Inter-state)' : 'CGST + SGST (Intra)'}
                        </span>
                      </div>
                      {quote.clientGstin && (
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          GSTIN: {quote.clientGstin}
                        </p>
                      )}
                    </td>

                    {/* Taxable Subtotal */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-mono text-zinc-700 dark:text-zinc-300">
                        ₹{quote.subtotal.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Tax: ₹{quote.taxAmount.toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                        ₹{quote.grandTotal.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        {quote.items.length} line items
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(quote.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View & Print Formal Quotation */}
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteForView(quote)}
                          title="View & Print Official Quotation"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Convert to Tax Invoice (If approved or sent) */}
                        <button
                          type="button"
                          onClick={() => onConvertToInvoice(quote)}
                          title="Convert to Official Tax Invoice"
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate Revision */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateRevision(quote)}
                          title="Create New Revision (Rev+1)"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROJECT PICKER MODAL */}
      {showProjectPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Select Lead to Generate Quotation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectPickerModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Autofills client contact details, project scope, and converts site measurements into quote items.
            </p>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => handleLoadProjectIntoQuote(proj)}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-amber-50/20 dark:hover:bg-amber-500/5 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{proj.clientName}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {proj.leadCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{proj.projectName}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Stage: <strong className="uppercase text-amber-600 dark:text-amber-400">{proj.stage}</strong> · Value: ₹{(proj.estimatedValue || 0).toLocaleString('en-IN')}</p>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition cursor-pointer shrink-0"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Create Commercial Quotation with GST
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client & Quotation Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Quotation Number *</label>
                <input
                  type="text"
                  value={formQuoteNumber}
                  onChange={(e) => setFormQuoteNumber(e.target.value)}
                  placeholder="e.g. Q-2026-108-REV0"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Client Legal Name *</label>
                <input
                  type="text"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="e.g. Microsoft R&D India"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Validity Date</label>
                <input
                  type="date"
                  value={formValidUntil}
                  onChange={(e) => setFormValidUntil(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Contact Person</label>
                <input
                  type="text"
                  value={formContactPerson}
                  onChange={(e) => setFormContactPerson(e.target.value)}
                  placeholder="e.g. Amit Kapoor (Projects)"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Contact Email</label>
                <input
                  type="email"
                  value={formContactEmail}
                  onChange={(e) => setFormContactEmail(e.target.value)}
                  placeholder="amit@client.com"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Contact Phone</label>
                <input
                  type="tel"
                  value={formContactPhone}
                  onChange={(e) => setFormContactPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Client GSTIN</label>
                <input
                  type="text"
                  value={formClientGstin}
                  onChange={(e) => handleGstinChange(e.target.value)}
                  placeholder="e.g. 07AAACG9214H1ZM"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Billing & Site Address</label>
                <input
                  type="text"
                  value={formBillingAddress}
                  onChange={(e) => setFormBillingAddress(e.target.value)}
                  placeholder="Registered commercial address for delivery and installation"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* GST Rate & Place of Supply Configuration Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Statutory GST Rate & Supply Jurisdiction
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500">Tax Type:</span>
                  <button
                    type="button"
                    onClick={() => setFormIsInterState(!formIsInterState)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      formIsInterState
                        ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {formIsInterState ? 'IGST (Inter-State)' : 'CGST + SGST (Intra-State)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">GST Rate Tier</label>
                  <select
                    value={formTaxRatePercent}
                    onChange={(e) => setFormTaxRatePercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    {GST_RATE_TIERS.map((tier) => (
                      <option key={tier.rate} value={tier.rate}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4 sm:pt-6">
                  <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRequiresSiteMeasurement}
                      onChange={(e) => setFormRequiresSiteMeasurement(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>Requires Site Laser Measurement Verification</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Catalog Fast-Adder & Line Items */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Itemized Quotation Specifications
                </h4>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Select service catalog item to add"
                    value={selectedCatalogId}
                    onChange={(e) => setSelectedCatalogId(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 max-w-[200px] cursor-pointer"
                  >
                    <option value="">-- Add from Rate Card --</option>
                    {serviceCatalog.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.baseRate}/{s.unit})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddFromCatalog}
                    disabled={!selectedCatalogId}
                    className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium disabled:opacity-40 transition cursor-pointer"
                  >
                    + Rate Card
                  </button>

                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Custom Item
                  </button>
                </div>
              </div>

              {/* Items Table in Modal */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {formItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Description</label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        placeholder="Item name / specification"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">HSN/SAC</label>
                      <input
                        type="text"
                        value={item.hsnSacCode || ''}
                        onChange={(e) => handleItemChange(index, 'hsnSacCode', e.target.value)}
                        placeholder="HSN"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Quantity ({item.unit})</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-right font-mono"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Unit Rate (₹)</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Rate ₹"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-right font-mono"
                      />
                    </div>
                    <div className="col-span-8 sm:col-span-1 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      <label className="block text-[10px] text-zinc-400 mb-0.5 text-right">Total (₹)</label>
                      <span className="block pt-1.5">₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-1 text-center">
                      <label className="block text-[10px] text-transparent mb-0.5">X</label>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formItems.length <= 1}
                        className="p-1 text-zinc-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            {(() => {
              const totals = calculateFormTotals();
              return (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Taxable Commercial Subtotal:</span>
                    <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {totals.igstAmount > 0 ? (
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Integrated GST (IGST @ {formTaxRatePercent}%):</span>
                      <span>₹{totals.igstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Central GST (CGST @ {(formTaxRatePercent / 2).toFixed(1)}%):</span>
                        <span>₹{totals.cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>State GST (SGST @ {(formTaxRatePercent / 2).toFixed(1)}%):</span>
                        <span>₹{totals.sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100 pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Estimate (INR):</span>
                    <span className="text-amber-600 dark:text-amber-400">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateSubmit('draft')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 text-xs font-semibold transition cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreateSubmit('sent')}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue & Send Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW & PRINT FORMAL QUOTATION MODAL */}
      {selectedQuoteForView && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="printable-document bg-white text-zinc-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 border border-zinc-300">
            {/* Top Bar for Action Buttons (hidden in print) */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[11px] font-semibold">
                  COMMERCIAL ESTIMATE & QUOTATION
                </span>
                <span className="font-mono text-xs text-zinc-600">{selectedQuoteForView.quoteNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onConvertToInvoice(selectedQuoteForView);
                    setSelectedQuoteForView(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Convert to Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQuoteForView(null)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* QUOTATION DOCUMENT BODY */}
            <div className="space-y-6 text-xs font-sans">
              {/* Header Lockup */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-950 font-serif">
                    {companySettings.companyName}
                  </h2>
                  <p className="text-[11px] text-zinc-600 max-w-md mt-0.5">{companySettings.brandTagline}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{companySettings.address}</p>
                  <div className="flex flex-wrap gap-4 font-mono text-[10px] text-zinc-700 mt-1">
                    <span>GSTIN: <strong>{companySettings.gstin}</strong></span>
                    <span>PAN: <strong>{companySettings.panNumber}</strong></span>
                    <span>State: <strong>{companySettings.stateCode}</strong></span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-2.5 py-1 bg-zinc-100 rounded border border-zinc-200 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Quotation Ref</p>
                    <p className="font-mono font-bold text-sm text-zinc-950">{selectedQuoteForView.quoteNumber}</p>
                  </div>
                  <p className="text-[11px] text-zinc-600">Date: <strong>{selectedQuoteForView.date}</strong></p>
                  <p className="text-[11px] text-zinc-600">Valid Until: <strong>{selectedQuoteForView.validUntil}</strong></p>
                  {selectedQuoteForView.projectLeadCode && (
                    <p className="text-[11px] text-zinc-600 font-mono">Lead: <strong>{selectedQuoteForView.projectLeadCode}</strong></p>
                  )}
                </div>
              </div>

              {/* Client Details Box */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Estimate Prepared For:</p>
                  <p className="font-semibold text-zinc-950 text-sm mt-0.5">{selectedQuoteForView.clientName}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{selectedQuoteForView.billingAddress}</p>
                  {selectedQuoteForView.clientContactPerson && (
                    <p className="text-[11px] text-zinc-700 mt-1">
                      Attn: <strong>{selectedQuoteForView.clientContactPerson}</strong>
                      {selectedQuoteForView.clientContactPhone && ` (${selectedQuoteForView.clientContactPhone})`}
                    </p>
                  )}
                  {selectedQuoteForView.clientGstin && (
                    <p className="text-[11px] font-mono text-zinc-700 mt-0.5">
                      Client GSTIN: <strong>{selectedQuoteForView.clientGstin}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Commercial Status & Tax Terms:</p>
                  <div className="mt-1">{getStatusBadge(selectedQuoteForView.status)}</div>
                  <p className="text-[11px] text-zinc-700 mt-1">
                    GST Regime: <strong>{selectedQuoteForView.isInterState ? 'IGST (Inter-State 18%)' : 'CGST (9%) + SGST (9%) Intra-State'}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    Site Measurement: <strong>{selectedQuoteForView.requiresSiteMeasurement ? 'Required before execution' : 'Standard catalog supply'}</strong>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden print-break-inside-avoid">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Scope / Material Specification</th>
                      <th className="py-2.5 px-3">HSN/SAC</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {selectedQuoteForView.items.map((item, idx) => (
                      <tr key={item.id} className="text-zinc-800">
                        <td className="py-2.5 px-3 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium">
                          {item.productName}
                          <span className="block text-[10px] text-zinc-500 font-normal">{item.category}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{item.hsnSacCode || '391990'}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          {(item.amount || item.quantity * item.unitPrice).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Calculations & Bank Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print-break-inside-avoid">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Bank Details for Advance Mobilization:</p>
                  <p className="text-zinc-800 font-medium">{companySettings.bankName}</p>
                  <div className="font-mono text-[11px] space-y-0.5 text-zinc-700">
                    <p>A/C Number: <strong>{companySettings.bankAccountNo}</strong></p>
                    <p>IFSC Code: <strong>{companySettings.bankIfsc}</strong></p>
                    <p>Branch: {companySettings.bankBranch}</p>
                    <p>UPI ID: <strong>{companySettings.upiId}</strong></p>
                  </div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Taxable Subtotal:</span>
                    <span>₹{selectedQuoteForView.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {(selectedQuoteForView.igstAmount ?? 0) > 0 ? (
                    <div className="flex justify-between text-zinc-600">
                      <span>IGST ({selectedQuoteForView.taxRatePercent}%):</span>
                      <span>₹{(selectedQuoteForView.igstAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-zinc-600">
                        <span>CGST ({(selectedQuoteForView.taxRatePercent / 2).toFixed(1)}%):</span>
                        <span>₹{(selectedQuoteForView.cgstAmount ?? Math.round(selectedQuoteForView.taxAmount / 2)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>SGST ({(selectedQuoteForView.taxRatePercent / 2).toFixed(1)}%):</span>
                        <span>₹{(selectedQuoteForView.sgstAmount ?? Math.round(selectedQuoteForView.taxAmount / 2)).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-300">
                    <span>Total Estimate:</span>
                    <span className="text-amber-800">₹{selectedQuoteForView.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Standard Terms & Sign-off */}
              <div className="pt-4 border-t border-zinc-200 space-y-3 print-break-inside-avoid">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Terms & Commercial Conditions:
                </p>
                <ul className="text-[11px] text-zinc-600 space-y-1 list-disc pl-4">
                  {(selectedQuoteForView.terms || STANDARD_QUOTATION_TERMS).map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ul>

                <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[11px] text-zinc-500">
                  <div>
                    <p className="font-semibold text-zinc-800">Client Approval Acceptance:</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Sign / Stamp with PO reference to confirm order</p>
                    <div className="h-8 border-b border-dashed border-zinc-300 w-48 mt-2"></div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900">For {companySettings.companyName}</p>
                    <div className="h-8"></div>
                    <p className="text-[10px] text-zinc-400">Authorized Commercial Desk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

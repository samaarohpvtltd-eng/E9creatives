import React, { useState } from 'react';
import {
  Invoice,
  InvoiceStatus,
  ProjectLead,
  InvoicePaymentRecord,
  CompanyBillingSettings,
  InvoiceLineItem,
} from '../types.ts';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Send,
  CreditCard,
  Building,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  X,
  Trash2,
  Eye,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface InvoicingModuleProps {
  invoices: Invoice[];
  projects: ProjectLead[];
  companySettings: CompanyBillingSettings;
  onUpdateInvoice: (updated: Invoice) => void;
  onCreateInvoice: (newInvoice: Invoice) => void;
  onSendReminderToast?: (invoiceNo: string, clientName: string) => void;
}

export const InvoicingModule: React.FC<InvoicingModuleProps> = ({
  invoices,
  projects,
  companySettings,
  onUpdateInvoice,
  onCreateInvoice,
  onSendReminderToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectPickerModal, setShowProjectPickerModal] = useState(false);

  // New Invoice Form State
  const [formClientName, setFormClientName] = useState('');
  const [formClientGstin, setFormClientGstin] = useState('07AAACG9214H1ZM');
  const [formBillingAddress, setFormBillingAddress] = useState('');
  const [formPoNumber, setFormPoNumber] = useState('');
  const [formProjectId, setFormProjectId] = useState<string | undefined>(undefined);
  const [formProjectLeadCode, setFormProjectLeadCode] = useState<string | undefined>(undefined);
  const [formTaxRatePercent, setFormTaxRatePercent] = useState<number>(18);
  const [formIsInterState, setFormIsInterState] = useState(false);
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formNotes, setFormNotes] = useState('Payment due within 30 days of invoice date.');
  const [formItems, setFormItems] = useState<InvoiceLineItem[]>([
    {
      id: `ii-${Date.now()}-1`,
      description: 'Architectural Frosted Glass Privacy Film Manifestations',
      hsnSacCode: '391990',
      quantity: 500,
      unit: 'sq.ft',
      unitRate: 135,
      taxRatePercent: 18,
      amount: 67500,
    },
  ]);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'neft_rtgs' | 'upi' | 'cheque' | 'cash'>('neft_rtgs');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Overview metrics
  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalCollected = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, curr) => acc + curr.balanceDue, 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const overdueTotal = overdueInvoices.reduce((acc, curr) => acc + curr.balanceDue, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.poNumber && inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.projectLeadCode && inv.projectLeadCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            SETTLED
          </span>
        );
      case 'partially_paid':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-400">
            PART-PAID
          </span>
        );
      case 'issued':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-400">
            ISSUED
          </span>
        );
      case 'overdue':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-rose-600 dark:text-rose-400">
            OVERDUE
          </span>
        );
      case 'draft':
        return (
          <span className="font-mono text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            DRAFT
          </span>
        );
    }
  };

  // Line item helpers for create form
  const handleItemChange = (index: number, field: keyof InvoiceLineItem, val: any) => {
    const updated = [...formItems];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitRate') {
      const q = field === 'quantity' ? Number(val) || 0 : item.quantity;
      const r = field === 'unitRate' ? Number(val) || 0 : item.unitRate;
      item.amount = q * r;
    }
    updated[index] = item;
    setFormItems(updated);
  };

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      {
        id: `ii-${Date.now()}-${formItems.length + 1}`,
        description: 'Architectural Graphic Installation Service',
        hsnSacCode: '998399',
        quantity: 1,
        unit: 'job',
        unitRate: 15000,
        taxRatePercent: 18,
        amount: 15000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleClientGstinChange = (gst: string) => {
    setFormClientGstin(gst);
    const code = gst.substring(0, 2);
    if (code && code !== '06' && code !== '07') {
      setFormIsInterState(true);
    } else {
      setFormIsInterState(false);
    }
  };

  const calculateFormTotals = () => {
    const subtotal = formItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const taxRate = formTaxRatePercent;
    const isInterState = formIsInterState;
    const totalTax = Math.round((subtotal * taxRate) / 100);
    const cgstAmount = isInterState ? 0 : Math.round(totalTax / 2);
    const sgstAmount = isInterState ? 0 : Math.round(totalTax / 2);
    const igstAmount = isInterState ? totalTax : 0;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTax,
      grandTotal,
    };
  };

  const handleCreateSubmit = (status: InvoiceStatus = 'issued') => {
    if (!formClientName.trim()) {
      return;
    }

    const totals = calculateFormTotals();
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: formProjectId,
      projectLeadCode: formProjectLeadCode,
      clientName: formClientName.trim(),
      clientGstin: formClientGstin.trim(),
      billingAddress: formBillingAddress.trim() || 'Commercial Office Tower, India',
      date: new Date().toISOString().split('T')[0],
      dueDate: formDueDate,
      poNumber: formPoNumber.trim() || undefined,
      items: formItems,
      subtotal: totals.subtotal,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      amountPaid: 0,
      balanceDue: totals.grandTotal,
      status,
      notes: formNotes,
      isInterState: formIsInterState,
      paymentHistory: [],
    };

    onCreateInvoice(newInvoice);
    setShowCreateModal(false);
  };

  const handleLoadProjectIntoInvoice = (proj: ProjectLead) => {
    setFormProjectId(proj.id);
    setFormProjectLeadCode(proj.leadCode);
    setFormClientName(proj.clientName);
    setFormBillingAddress(`${proj.location}, Commercial Center`);
    setFormPoNumber(`PO-${proj.leadCode.replace('E9-', '')}`);

    if (proj.quotation && proj.quotation.items.length > 0) {
      const items: InvoiceLineItem[] = proj.quotation.items.map((qi, idx) => ({
        id: `ii-${Date.now()}-${idx}`,
        description: `${qi.productName} (${qi.category})`,
        hsnSacCode: qi.category.includes('Film') ? '391990' : qi.category.includes('Wall') ? '491199' : '831000',
        quantity: qi.quantity,
        unit: qi.unit || 'sq.ft',
        unitRate: qi.unitPrice,
        taxRatePercent: 18,
        amount: qi.quantity * qi.unitPrice,
      }));
      setFormItems(items);
    } else {
      setFormItems([
        {
          id: `ii-${Date.now()}-1`,
          description: `${proj.projectName} - Full Environmental Graphics Execution`,
          hsnSacCode: '998399',
          quantity: 1,
          unit: 'job',
          unitRate: proj.estimatedValue || 250000,
          taxRatePercent: 18,
          amount: proj.estimatedValue || 250000,
        },
      ]);
    }

    setShowProjectPickerModal(false);
    setShowCreateModal(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || payAmount <= 0) return;

    const currentInv = selectedInvoiceForPayment;
    const newPaid = currentInv.amountPaid + payAmount;
    const newBalance = Math.max(0, currentInv.grandTotal - newPaid);
    const newStatus: InvoiceStatus = newBalance === 0 ? 'paid' : 'partially_paid';

    const newPaymentRecord: InvoicePaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: payAmount,
      method: payMethod,
      referenceNo: payReference.trim() || `NEFT-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: payNotes.trim() || 'Payment received and reconciled with bank statement',
    };

    const updated: Invoice = {
      ...currentInv,
      amountPaid: newPaid,
      balanceDue: newBalance,
      status: newStatus,
      paymentHistory: [newPaymentRecord, ...currentInv.paymentHistory],
    };

    onUpdateInvoice(updated);
    setSelectedInvoiceForPayment(null);
    setPayAmount(0);
    setPayReference('');
    setPayNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Structured 4-Column Enterprise Metric Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Gross GST Billing</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono tabular-nums">
            ₹{totalInvoiced.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">{invoices.length} statutory tax invoices</span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Realized Collections</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">
            {((totalCollected / (totalInvoiced || 1)) * 100).toFixed(0)}% realization ratio
          </span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Open Receivables</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono tabular-nums">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Within Net-30 credit terms</span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Overdue Receivables</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono tabular-nums">
            ₹{overdueTotal.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">
            {overdueInvoices.length} accounts past due date
          </span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and New Invoice Triggers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, client, or PO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          <select
            aria-label="Filter invoices by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({invoices.length})</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
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
            <span>Bill from Project PO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormProjectId(undefined);
              setFormProjectLeadCode(undefined);
              setFormClientName('');
              setFormBillingAddress('');
              setFormPoNumber('');
              setShowCreateModal(true);
            }}
            className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue GST Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Client & PO Reference</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-right">Paid / Balance (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    <Receipt className="w-8 h-8 opacity-40 mx-auto mb-2 text-amber-500" />
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">No invoices match your search or filters.</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Generate an invoice from a project or create a new one above.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition group"
                  >
                    {/* Invoice Number & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-mono font-semibold text-[11px]">
                          <Receipt className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                            {inv.invoiceNumber}
                          </p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> {inv.date} · Due {inv.dueDate}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client & PO */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{inv.clientName}</p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                        {inv.poNumber && <span>PO: {inv.poNumber}</span>}
                        {inv.projectLeadCode && <span>({inv.projectLeadCode})</span>}
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                        ₹{inv.grandTotal.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Tax: ₹{inv.totalTax.toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Paid & Balance */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{inv.amountPaid.toLocaleString('en-IN')}
                      </p>
                      <p
                        className={`text-[11px] font-mono font-medium ${
                          inv.balanceDue > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        Bal: ₹{inv.balanceDue.toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View / Print Invoice */}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForView(inv)}
                          title="View & Print Tax Invoice"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Record Payment Button */}
                        {inv.balanceDue > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceForPayment(inv);
                              setPayAmount(inv.balanceDue);
                            }}
                            title="Record Payment"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Send Reminder */}
                        {inv.balanceDue > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onSendReminderToast) {
                                onSendReminderToast(inv.invoiceNumber, inv.clientName);
                              }
                            }}
                            title="Send Payment Reminder"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                  Select Project to Generate Invoice
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
              Autofills client billing address, line items from approved quotations, and estimates.
            </p>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => handleLoadProjectIntoInvoice(proj)}
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

      {/* CREATE / EDIT INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Generate GST Tax Invoice
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

            {/* Client & PO Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Client Legal Name *</label>
                <input
                  type="text"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="e.g. Google India Pvt Ltd"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Client GSTIN</label>
                <input
                  type="text"
                  value={formClientGstin}
                  onChange={(e) => handleClientGstinChange(e.target.value)}
                  placeholder="e.g. 07AAACG9214H1ZM"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">PO / Work Order Number</label>
                <input
                  type="text"
                  value={formPoNumber}
                  onChange={(e) => setFormPoNumber(e.target.value)}
                  placeholder="e.g. PO-2026-9921"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Due Date</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Client Billing Address</label>
                <input
                  type="text"
                  value={formBillingAddress}
                  onChange={(e) => setFormBillingAddress(e.target.value)}
                  placeholder="Registered commercial office address"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* GST Rate and Jurisdiction Row */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">Statutory GST Rate</label>
                  <select
                    value={formTaxRatePercent}
                    onChange={(e) => setFormTaxRatePercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    <option value={18}>18% - Standard Architectural Signage & Installation (SAC 998399)</option>
                    <option value={12}>12% - Printed Substrates & Paper Media (HSN 4911)</option>
                    <option value={5}>5% - Basic Substrates / Raw Goods</option>
                    <option value={28}>28% - Luxury Dimensional LED Displays</option>
                    <option value={0}>0% - SEZ Supply against LUT (Zero Rated)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                  <span className="text-zinc-600 dark:text-zinc-400 text-xs">Tax Supply Mode:</span>
                  <button
                    type="button"
                    onClick={() => setFormIsInterState(!formIsInterState)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      formIsInterState
                        ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {formIsInterState ? 'IGST (Inter-State 18%)' : 'CGST (9%) + SGST (9%) Intra-State'}
                  </button>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Invoice Line Items (GST 18%)
                </h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {formItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="text"
                        value={item.hsnSacCode}
                        onChange={(e) => handleItemChange(index, 'hsnSacCode', e.target.value)}
                        placeholder="HSN/SAC"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-right font-mono"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input
                        type="number"
                        value={item.unitRate}
                        onChange={(e) => handleItemChange(index, 'unitRate', parseFloat(e.target.value) || 0)}
                        placeholder="Rate ₹"
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-right font-mono"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formItems.length <= 1}
                        className="text-zinc-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    <span>Taxable Subtotal:</span>
                    <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {totals.igstAmount > 0 ? (
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>IGST (18% Inter-state):</span>
                      <span>₹{totals.igstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>CGST (9%):</span>
                        <span>₹{totals.cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>SGST (9%):</span>
                        <span>₹{totals.sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Invoice Amount (INR):</span>
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
                onClick={() => handleCreateSubmit('issued')}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Issue Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Record Payment for {selectedInvoiceForPayment.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Client:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedInvoiceForPayment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Invoice Total:</span>
                <span className="font-mono">₹{selectedInvoiceForPayment.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                <span>Current Balance Due:</span>
                <span className="font-mono">₹{selectedInvoiceForPayment.balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Payment Amount Received (₹) *</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  max={selectedInvoiceForPayment.balanceDue}
                  min={1}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-base font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e: any) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    <option value="neft_rtgs">NEFT / RTGS</option>
                    <option value="upi">UPI Transfer</option>
                    <option value="cheque">Bank Cheque</option>
                    <option value="cash">Direct Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Transaction / UTR #</label>
                  <input
                    type="text"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="e.g. HDFCR520261028"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Notes / Reconciliation Remarks</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Cleared into HDFC Current Account"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Confirm Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT FORMAL TAX INVOICE MODAL */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="printable-document relative bg-white text-zinc-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 border border-zinc-300">
            {/* Modal Top Actions (Hidden in Print) */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[11px] font-semibold">
                  GST TAX INVOICE
                </span>
                <span className="font-mono text-xs text-zinc-600">{selectedInvoiceForView.invoiceNumber}</span>
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
                  onClick={() => setSelectedInvoiceForView(null)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PAID STAMP WATERMARK */}
            {selectedInvoiceForView.status === 'paid' && (
              <div className="absolute right-8 top-32 border-4 border-emerald-600/80 text-emerald-700 font-mono font-black text-xl px-4 py-1.5 rounded-lg uppercase tracking-widest transform -rotate-12 pointer-events-none select-none opacity-85 shadow-xs z-10">
                PAID IN FULL
              </div>
            )}

            {/* INVOICE DOCUMENT FRAME (Clean Print-Friendly Paper Style) */}
            <div className="space-y-6 text-xs">
              {/* Document Banner */}
              <div className="flex justify-between items-center pb-2 border-b-2 border-zinc-900">
                <div>
                  <h1 className="text-base font-bold uppercase tracking-wider text-zinc-950 font-serif">
                    TAX INVOICE
                  </h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                    Original for Recipient · Issued under Sec 31 CGST Act
                  </p>
                </div>
                <div className="text-right text-[10px] text-zinc-600 space-y-0.5">
                  <p>Reverse Charge (RCM): <strong className="text-zinc-950">NO</strong></p>
                  <p>Place of Supply: <strong className="text-zinc-950">{selectedInvoiceForView.clientGstin ? `${selectedInvoiceForView.clientGstin.substring(0, 2)} - Client State` : '07 - Delhi'}</strong></p>
                </div>
              </div>

              {/* Company Header Lockup */}
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
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Invoice No</p>
                    <p className="font-mono font-bold text-sm text-zinc-950">{selectedInvoiceForView.invoiceNumber}</p>
                  </div>
                  <p className="text-[11px] text-zinc-600">Date: <strong>{selectedInvoiceForView.date}</strong></p>
                  <p className="text-[11px] text-zinc-600">Due: <strong>{selectedInvoiceForView.dueDate}</strong></p>
                  {selectedInvoiceForView.poNumber && (
                    <p className="text-[11px] text-zinc-600 font-mono">PO Ref: <strong>{selectedInvoiceForView.poNumber}</strong></p>
                  )}
                </div>
              </div>

              {/* Billed To Box */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-3 print-break-inside-avoid">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Billed To (Client Details):</p>
                  <p className="font-semibold text-zinc-950 text-sm mt-0.5">{selectedInvoiceForView.clientName}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{selectedInvoiceForView.billingAddress}</p>
                  {selectedInvoiceForView.clientGstin && (
                    <p className="text-[11px] font-mono text-zinc-700 mt-1">
                      GSTIN / UIN: <strong>{selectedInvoiceForView.clientGstin}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Billing Status:</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoiceForView.status)}</div>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Amount Paid: <strong className="font-mono">₹{selectedInvoiceForView.amountPaid.toLocaleString('en-IN')}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-950">
                    Balance Payable: <strong className="font-mono text-amber-700">₹{selectedInvoiceForView.balanceDue.toLocaleString('en-IN')}</strong>
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden print-break-inside-avoid">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Description of Architectural Signage / Works</th>
                      <th className="py-2.5 px-3">HSN/SAC</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {selectedInvoiceForView.items.map((item, idx) => (
                      <tr key={item.id} className="text-zinc-800">
                        <td className="py-2.5 px-3 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium">{item.description}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{item.hsnSacCode}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.unitRate.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax & Total Calculation Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print-break-inside-avoid">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Bank Details for Wire Transfer:</p>
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
                    <span>₹{selectedInvoiceForView.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoiceForView.igstAmount > 0 ? (
                    <div className="flex justify-between text-zinc-600">
                      <span>IGST (18% Inter-State):</span>
                      <span>₹{selectedInvoiceForView.igstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-zinc-600">
                        <span>CGST (9% Central Tax):</span>
                        <span>₹{selectedInvoiceForView.cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>SGST (9% State Tax):</span>
                        <span>₹{selectedInvoiceForView.sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-300">
                    <span>Total Amount (INR):</span>
                    <span>₹{selectedInvoiceForView.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* HSN/SAC Statutory Summary Table */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 print-break-inside-avoid">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  HSN / SAC Tax Compliance Summary
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500">
                        <th className="py-1">HSN/SAC</th>
                        <th className="py-1 text-right">Taxable Value</th>
                        <th className="py-1 text-right">CGST</th>
                        <th className="py-1 text-right">SGST</th>
                        <th className="py-1 text-right">IGST</th>
                        <th className="py-1 text-right">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="py-1">391990 / 491199 / 998399</td>
                        <td className="py-1 text-right">₹{selectedInvoiceForView.subtotal.toLocaleString('en-IN')}</td>
                        <td className="py-1 text-right">₹{selectedInvoiceForView.cgstAmount.toLocaleString('en-IN')}</td>
                        <td className="py-1 text-right">₹{selectedInvoiceForView.sgstAmount.toLocaleString('en-IN')}</td>
                        <td className="py-1 text-right">₹{selectedInvoiceForView.igstAmount.toLocaleString('en-IN')}</td>
                        <td className="py-1 text-right font-bold">₹{selectedInvoiceForView.totalTax.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Audit Records (if any) */}
              {selectedInvoiceForView.paymentHistory.length > 0 && (
                <div className="space-y-2 print-break-inside-avoid">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Reconciled Payment History
                  </h4>
                  <div className="space-y-1">
                    {selectedInvoiceForView.paymentHistory.map((pay) => (
                      <div
                        key={pay.id}
                        className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-semibold text-emerald-950">₹{pay.amount.toLocaleString('en-IN')}</span>
                          <span className="text-zinc-500">via {pay.method.toUpperCase()}</span>
                          <span className="font-mono text-zinc-600">Ref: {pay.referenceNo}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{pay.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms and Sign-off */}
              <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[11px] text-zinc-500 print-break-inside-avoid">
                <div className="max-w-md">
                  <p className="font-semibold text-zinc-800">Commercial Terms:</p>
                  <p>{companySettings.defaultPaymentTerms}</p>
                </div>
                <div className="text-right sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
                  <p className="font-semibold text-zinc-900">For {companySettings.companyName}</p>
                  <div className="h-10"></div>
                  <p className="text-[10px] text-zinc-400">Authorized Signatory / Accounts Desk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

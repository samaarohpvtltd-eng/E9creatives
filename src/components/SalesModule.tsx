import React, { useState } from 'react';
import {
  ProjectLead,
  Quotation,
  QuotationLineItem,
  ServiceCatalogItem,
} from '../types.ts';
import {
  Plus,
  Search,
  AlertTriangle,
  History,
  Ruler,
  Check,
  X,
  FileText,
  Mail,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  calculateQuotationTotals,
  compareCustomerPrices,
  HistoricalPricePoint,
} from '../utils/crmLogic.ts';

interface SalesModuleProps {
  projects: ProjectLead[];
  historicalPrices: HistoricalPricePoint[];
  serviceCatalog?: ServiceCatalogItem[];
  onUpdateProject: (updated: ProjectLead) => void;
  onCreateEnquiry: (newLead: Partial<ProjectLead>) => void;
  onNavigateToMeasurement: (projectId: string) => void;
}

const DEFAULT_PRODUCT_CATALOG = [
  { name: 'Frosted Glass Film 3M Dusted Crystal', category: 'Window Manifestations', defaultRate: 135, unit: 'sq.ft' },
  { name: 'Custom HP Latex Wallpaper (Textured Canvas)', category: 'Wall Graphics', defaultRate: 240, unit: 'sq.ft' },
  { name: '3D Solid Acrylic Lettering (12mm LED Backlit)', category: 'Signage & Brand', defaultRate: 750, unit: 'rft' },
  { name: 'UV Flatbed Print on 5mm Forex Foam Board', category: 'Wayfinding', defaultRate: 180, unit: 'sq.ft' },
  { name: 'Acoustic Fabric Baffle Panels (Fire-retardant)', category: 'Acoustics', defaultRate: 340, unit: 'sq.ft' },
  { name: 'High-Tack Vinyl Decals for Raw Brick/Plaster', category: 'Specialty Graphics', defaultRate: 210, unit: 'sq.ft' },
];

export const SalesModule: React.FC<SalesModuleProps> = ({
  projects,
  historicalPrices,
  serviceCatalog,
  onUpdateProject,
  onCreateEnquiry,
  onNavigateToMeasurement,
}) => {
  const activeCatalog =
    serviceCatalog && serviceCatalog.length > 0
      ? serviceCatalog.map((s) => ({
          name: s.name,
          category: s.category,
          defaultRate: s.baseRate,
          unit: s.unit,
        }))
      : DEFAULT_PRODUCT_CATALOG;

  const [activeTab, setActiveTab] = useState<'pipeline' | 'tariff'>('pipeline');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNewEnquiryModal, setShowNewEnquiryModal] = useState<boolean>(false);
  const [showLostReasonModal, setShowLostReasonModal] = useState<boolean>(false);
  const [priceCompareItem, setPriceCompareItem] = useState<{
    productName: string;
    currentRate: number;
    clientName: string;
  } | null>(null);

  // New enquiry form state
  const [newClientName, setNewClientName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEstimatedValue, setNewEstimatedValue] = useState<number | ''>(250000);

  // Lost enquiry form state
  const [lostCategory, setLostCategory] = useState<
    'competitor_pricing' | 'budget' | 'timeline' | 'design_rejected' | 'client_cancelled' | 'other'
  >('competitor_pricing');
  const [lostExplanation, setLostExplanation] = useState('');
  const [lostCompetitor, setLostCompetitor] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Filtering
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.leadCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return p.enquiryStatus === statusFilter;
  });

  // KPI stats
  const totalEnquiries = projects.length;
  const wonCount = projects.filter((p) => p.enquiryStatus === 'won').length;
  const lostCount = projects.filter((p) => p.enquiryStatus === 'lost').length;
  const discussingCount = projects.filter(
    (p) => p.enquiryStatus === 'discussing' || p.enquiryStatus === 'quotation_sent' || !p.enquiryStatus
  ).length;

  const handleCreateEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newProjectName) {
      showToast('Client Name and Project Title are required');
      return;
    }

    const defaultItems: QuotationLineItem[] = [
      {
        id: `it-${Date.now()}-1`,
        productName: 'Frosted Glass Film 3M Dusted Crystal',
        category: 'Window Manifestations',
        quantity: 250,
        unit: 'sqft',
        unitPrice: 130,
        discountPercent: 0,
      },
      {
        id: `it-${Date.now()}-2`,
        productName: '3D Solid Acrylic Lettering (12mm LED Backlit)',
        category: 'Signage & Brand',
        quantity: 40,
        unit: 'running_ft',
        unitPrice: 750,
        discountPercent: 5,
      },
    ];

    const totals = calculateQuotationTotals(defaultItems, 18);

    const initialQuote: Quotation = {
      id: `qt-${Date.now()}`,
      quoteNumber: `Q-2026-${Math.floor(100 + Math.random() * 900)}-REV0`,
      date: new Date().toISOString().split('T')[0],
      clientName: newClientName,
      terms: ['50% Advance with PO', '40% on dispatch', '10% on handover signoff'],
      items: defaultItems,
      subtotal: totals.subtotal,
      taxRatePercent: 18,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      status: 'draft',
      requiresSiteMeasurement: true,
    };

    onCreateEnquiry({
      clientName: newClientName,
      projectName: newProjectName,
      contactPerson: newContactPerson || 'Procurement Lead',
      contactPhone: newContactPhone || '+91 98000 12345',
      contactEmail:
        newContactEmail ||
        `procurement@${newClientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.in`,
      location: newLocation || 'Gurugram Corporate Hub',
      estimatedValue: Number(newEstimatedValue) || totals.grandTotal,
      stage: 'enquiry',
      enquiryStatus: 'discussing',
      quotation: initialQuote,
    });

    setShowNewEnquiryModal(false);
    setNewClientName('');
    setNewProjectName('');
    showToast('Corporate enquiry and preliminary estimate initialized');
  };

  const handleMarkWon = () => {
    if (!selectedProject) return;
    const updated: ProjectLead = {
      ...selectedProject,
      enquiryStatus: 'won',
      stage: selectedProject.stage === 'enquiry' ? 'site_measurement' : selectedProject.stage,
      quotation: selectedProject.quotation
        ? { ...selectedProject.quotation, status: 'approved' }
        : undefined,
    };
    onUpdateProject(updated);
    showToast(`Contract marked WON. Handed over to Site Survey Operations.`);
  };

  const handleMarkLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!lostExplanation.trim()) {
      showToast('Mandatory explanation required for lost deals.');
      return;
    }

    const updated: ProjectLead = {
      ...selectedProject,
      enquiryStatus: 'lost',
      lossReason: {
        category: lostCategory,
        explanation: lostExplanation,
        competitorName: lostCompetitor || undefined,
        loggedAt: new Date().toISOString().split('T')[0],
      },
    };

    onUpdateProject(updated);
    setShowLostReasonModal(false);
    setLostExplanation('');
    setLostCompetitor('');
    showToast(`Enquiry marked as Lost. Variance logged in audit register.`);
  };

  const handleSendReminder = () => {
    if (!selectedProject || !selectedProject.quotation) return;
    const now = new Date().toISOString().split('T')[0];
    onUpdateProject({
      ...selectedProject,
      quotation: {
        ...selectedProject.quotation,
        lastReminderSentAt: now,
        status: selectedProject.quotation.status === 'draft' ? 'sent' : selectedProject.quotation.status,
      },
    });
    showToast(`Commercial follow-up dispatched to ${selectedProject.contactEmail || selectedProject.clientName}`);
  };

  const handleAddCatalogItem = (itemSpec: { name: string; category: string; defaultRate: number; unit: string }) => {
    if (!selectedProject || !selectedProject.quotation) return;

    const newItem: QuotationLineItem = {
      id: `it-${Date.now()}`,
      productName: itemSpec.name,
      category: itemSpec.category,
      quantity: 100,
      unit: itemSpec.unit,
      unitPrice: itemSpec.defaultRate,
      discountPercent: 0,
    };

    const newItems = [...selectedProject.quotation.items, newItem];
    const totals = calculateQuotationTotals(newItems, selectedProject.quotation.taxRatePercent);

    onUpdateProject({
      ...selectedProject,
      quotation: {
        ...selectedProject.quotation,
        items: newItems,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
      },
      estimatedValue: totals.grandTotal,
    });

    showToast(`Added "${itemSpec.name}" to estimate schedule`);
  };

  const handleRemoveQuotationItem = (itemId: string) => {
    if (!selectedProject || !selectedProject.quotation) return;
    const newItems = selectedProject.quotation.items.filter((i) => i.id !== itemId);
    const totals = calculateQuotationTotals(newItems, selectedProject.quotation.taxRatePercent);

    onUpdateProject({
      ...selectedProject,
      quotation: {
        ...selectedProject.quotation,
        items: newItems,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
      },
      estimatedValue: totals.grandTotal,
    });
  };

  const handleUpdateItemQuantity = (itemId: string, newQty: number) => {
    if (!selectedProject || !selectedProject.quotation) return;
    const updatedItems = selectedProject.quotation.items.map((it) =>
      it.id === itemId ? { ...it, quantity: Math.max(1, newQty) } : it
    );
    const totals = calculateQuotationTotals(updatedItems, selectedProject.quotation.taxRatePercent);
    onUpdateProject({
      ...selectedProject,
      quotation: {
        ...selectedProject.quotation,
        items: updatedItems,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
      },
      estimatedValue: totals.grandTotal,
    });
  };

  const handleNotifyProjectTeamForMeasurement = () => {
    if (!selectedProject) return;
    const updated: ProjectLead = {
      ...selectedProject,
      stage: 'site_measurement',
      enquiryStatus: 'site_visit_requested',
      quotation: selectedProject.quotation
        ? { ...selectedProject.quotation, requiresSiteMeasurement: true }
        : undefined,
    };
    onUpdateProject(updated);
    showToast(`Site survey assigned to Field Operations`);
    onNavigateToMeasurement(selectedProject.id);
  };

  const statusText = (status?: string) => {
    switch (status) {
      case 'won':
        return <span className="font-mono text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">WON</span>;
      case 'lost':
        return <span className="font-mono text-[11px] font-semibold uppercase text-rose-600 dark:text-rose-400">LOST</span>;
      case 'site_visit_requested':
        return <span className="font-mono text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-400">SURVEY REQ</span>;
      case 'quotation_sent':
        return <span className="font-mono text-[11px] font-semibold uppercase text-slate-700 dark:text-zinc-300">QUOTE SENT</span>;
      default:
        return <span className="font-mono text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-400">DISCUSSING</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean Enterprise Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-800 px-3.5 py-2.5 rounded-md shadow-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls: Segmented Tabs & Ledger Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            Corporate Enquiries & Estimates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tariff')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition cursor-pointer ${
              activeTab === 'tariff'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            Standard Substrate Tariff Card
          </button>
        </div>

        {/* Tabular Summary Strip */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
          <div>
            TOTAL: <strong className="text-slate-900 dark:text-zinc-100">{totalEnquiries}</strong>
          </div>
          <span>·</span>
          <div>
            WON: <strong className="text-emerald-700 dark:text-emerald-400">{wonCount}</strong>
          </div>
          <span>·</span>
          <div>
            ACTIVE: <strong className="text-slate-800 dark:text-zinc-200">{discussingCount}</strong>
          </div>
          <span>·</span>
          <div>
            LOST: <strong className="text-rose-600 dark:text-rose-400">{lostCount}</strong>
          </div>
        </div>
      </div>

      {activeTab === 'tariff' ? (
        /* Tariff Catalog View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Standard Architectural Substrate Tariff Schedule
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Approved base rates for commercial glazing films, wall coverings, and 3D dimensional signage
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Product / Specification</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Billing Unit</th>
                  <th className="py-2.5 px-4 text-right">Base Tariff (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {activeCatalog.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-zinc-200">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">{p.category}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 font-mono">{p.unit}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      ₹{p.defaultRate.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedProject ? (
        /* Focused Full-Width Enquiry & Quotation Workspace */
        <div className="space-y-5">
          {/* Back Button & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Back to Ledger</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">{selectedProject.leadCode}</span>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">{selectedProject.projectName}</h2>
                  <span className="ml-1">{statusText(selectedProject.enquiryStatus)}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Client: <strong className="text-slate-800 dark:text-zinc-200">{selectedProject.clientName}</strong> · Contact: {selectedProject.contactPerson} ({selectedProject.contactPhone}) · {selectedProject.location}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendReminder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded text-xs font-medium border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
                title="Dispatch Quotation Follow-up to Client"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Dispatch Follow-Up</span>
              </button>

              {selectedProject.enquiryStatus !== 'won' && (
                <button
                  type="button"
                  onClick={handleMarkWon}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Ratify as WON</span>
                </button>
              )}
              {selectedProject.enquiryStatus !== 'lost' && (
                <button
                  type="button"
                  onClick={() => setShowLostReasonModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-zinc-800 rounded text-xs font-medium transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Log Lost Bid</span>
                </button>
              )}
            </div>
          </div>

          {/* Lost Audit Banner if Lost */}
          {selectedProject.enquiryStatus === 'lost' && selectedProject.lossReason && (
            <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-md text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold uppercase font-mono text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Post-Bid Loss Variance: {selectedProject.lossReason.category.replace('_', ' ')}</span>
              </div>
              <p className="text-slate-700 dark:text-zinc-300">{selectedProject.lossReason.explanation}</p>
              {selectedProject.lossReason.competitorName && (
                <p className="text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                  Awarded Competitor: <strong>{selectedProject.lossReason.competitorName}</strong>
                </p>
              )}
            </div>
          )}

          {/* Site Measurement Banner */}
          <div className="p-3.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                  Site Laser Measurement & Elevation Verification
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {selectedProject.siteMeasurement
                    ? `Assigned Field Surveyor: ${selectedProject.siteMeasurement.inChargeName}`
                    : 'Assign field surveyor to verify substrate dimensions and scaffolding requirements.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNotifyProjectTeamForMeasurement}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium transition cursor-pointer self-start sm:self-auto"
            >
              {selectedProject.siteMeasurement ? 'Inspect Site Survey Dossier' : 'Assign Site Survey'}
            </button>
          </div>

          {/* Quotation Editor */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Commercial Estimate #{selectedProject.quotation?.quoteNumber || 'DRAFT'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                  Date: {selectedProject.quotation?.date || new Date().toISOString().split('T')[0]} · Statutory GST 18%
                  {selectedProject.quotation?.lastReminderSentAt && (
                    <span className="text-emerald-700 dark:text-emerald-400 ml-2">
                      · Reminder Dispatched: {selectedProject.quotation.lastReminderSentAt}
                    </span>
                  )}
                </p>
              </div>

              {/* Add from Catalog Quick Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Add Line Item:</span>
                <select
                  aria-label="Add item from catalog"
                  onChange={(e) => {
                    const item = activeCatalog.find((p) => p.name === e.target.value);
                    if (item) handleAddCatalogItem(item);
                    e.target.value = '';
                  }}
                  className="px-2.5 py-1.5 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Substrate from Tariff...
                  </option>
                  {activeCatalog.map((cat, idx) => (
                    <option key={idx} value={cat.name}>
                      {cat.name} (₹{cat.defaultRate}/{cat.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quotation Table */}
            {selectedProject.quotation && selectedProject.quotation.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Specification & Substrate</th>
                      <th className="py-2.5 px-3">Unit Rate (INR)</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Net Amount (INR)</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50">
                    {selectedProject.quotation.items.map((item) => {
                      const lineTotal =
                        item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-900 dark:text-zinc-200">{item.productName}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              <span>{item.category}</span>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPriceCompareItem({
                                    productName: item.productName,
                                    currentRate: item.unitPrice,
                                    clientName: selectedProject.clientName,
                                  })
                                }
                                className="text-blue-700 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                              >
                                Historical Rate Benchmark
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-300 tabular-nums">
                            ₹{item.unitPrice.toLocaleString('en-IN')}/{item.unit}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 10)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono text-slate-900 dark:text-zinc-200 w-12 text-center tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 10)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                            ₹{Math.round(lineTotal).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveQuotationItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Remove line item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                No line items in estimate. Select a substrate from the tariff dropdown above.
              </p>
            )}

            {/* Quotation Financials Footer */}
            {selectedProject.quotation && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  Standard Commercial Terms: 50% mobilization advance with PO, 40% prior to dispatch, 10% on handover.
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-right tabular-nums">
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200">
                      ₹{Math.round(selectedProject.quotation.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                    <span>GST (18%):</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200">
                      ₹{Math.round(selectedProject.quotation.taxAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm pt-1.5 border-t border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100">
                    <span>Total Estimate:</span>
                    <span className="font-mono">
                      ₹{Math.round(selectedProject.quotation.grandTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* High-Density Corporate Enquiries Ledger */
        <div className="space-y-4">
          {/* Search, Filter & New Enquiry CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter by client, project scope, or job code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded border border-slate-200 dark:border-zinc-800">
                {['all', 'discussing', 'won', 'lost'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs rounded-xs font-medium capitalize transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewEnquiryModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold rounded text-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Corporate Enquiry</span>
            </button>
          </div>

          {/* Enquiries Master Table */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Job Code</th>
                  <th className="py-2.5 px-4">Client & Project Scope</th>
                  <th className="py-2.5 px-4">Site Location</th>
                  <th className="py-2.5 px-4 text-right">Estimate (INR)</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                      {p.leadCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-zinc-100">{p.projectName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {p.clientName} · {p.contactPerson} ({p.contactEmail})
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{p.location}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      ₹{(p.estimatedValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">{statusText(p.enquiryStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Enquiry Modal */}
      {showNewEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                Register New Corporate Enquiry
              </h3>
              <button
                type="button"
                onClick={() => setShowNewEnquiryModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquirySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                  Client / Corporate Entity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Technologies Ltd"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                  Project Scope & Package Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower B Floor 4 Wayfinding & Acoustic Glazing"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Client Point of Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Facilities Lead"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Site Location / SEZ
                  </label>
                  <input
                    type="text"
                    placeholder="Bengaluru Outer Ring Road"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Preliminary Valuation (INR)
                  </label>
                  <input
                    type="number"
                    value={newEstimatedValue}
                    onChange={(e) => setNewEstimatedValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-slate-600 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEnquiryModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold cursor-pointer"
                >
                  Initialize Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Lost Modal */}
      {showLostReasonModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Post-Bid Loss Variance Audit</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLostReasonModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkLost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                  Primary Loss Classification *
                </label>
                <select
                  value={lostCategory}
                  onChange={(e) => setLostCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="competitor_pricing">Competitor Tariff Undercut</option>
                  <option value="budget">Client CapEx Frozen</option>
                  <option value="timeline">Lead Time Infeasible</option>
                  <option value="design_rejected">Technical Spec Variance</option>
                  <option value="client_cancelled">Project Deferred</option>
                  <option value="other">Other Commercial Factor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                  Commercial Audit Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Document tariff differential or commercial terms that led to bid loss..."
                  value={lostExplanation}
                  onChange={(e) => setLostExplanation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                  Awarded Vendor (if disclosed)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sigma Signage Solutions"
                  value={lostCompetitor}
                  onChange={(e) => setLostCompetitor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLostReasonModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                >
                  Record Loss Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Price Benchmark Modal */}
      {priceCompareItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Historical Tariff Benchmark</span>
              </h3>
              <button
                type="button"
                onClick={() => setPriceCompareItem(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-700 dark:text-zinc-300">
                Specification: <strong className="text-slate-900 dark:text-zinc-100">{priceCompareItem.productName}</strong>
              </p>
              <p className="text-slate-500 dark:text-zinc-400">
                Current Estimate Rate:{' '}
                <strong className="font-mono text-slate-900 dark:text-zinc-100 tabular-nums">
                  ₹{priceCompareItem.currentRate}
                </strong>
              </p>

              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded border border-slate-200 dark:border-zinc-800 space-y-2">
                <p className="text-slate-600 dark:text-zinc-400 font-semibold">Past Ratified PO Rates:</p>
                {(() => {
                  const comparison = compareCustomerPrices(
                    priceCompareItem.productName,
                    priceCompareItem.currentRate,
                    historicalPrices
                  );
                  if (comparison.matches.length === 0) {
                    return (
                      <p className="text-slate-500">
                        No prior PO history for this specification. Master tariff card rate applies.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2 tabular-nums">
                      <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px] pb-1.5 border-b border-slate-200 dark:border-zinc-800 font-mono">
                        <span>Benchmark Mean: ₹{comparison.avgRate}</span>
                        <span
                          className={
                            comparison.percentageDiffFromAvg >= 0
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }
                        >
                          Delta: {comparison.percentageDiffFromAvg > 0 ? `+${comparison.percentageDiffFromAvg}%` : `${comparison.percentageDiffFromAvg}%`}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {comparison.matches.map((m, i) => (
                          <div key={i} className="flex justify-between text-slate-700 dark:text-zinc-300">
                            <span>
                              {m.clientName} <span className="text-slate-400 font-mono">({m.date})</span>
                            </span>
                            <span className="font-mono font-semibold">₹{m.unitPrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPriceCompareItem(null)}
                className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium cursor-pointer"
              >
                Close Benchmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

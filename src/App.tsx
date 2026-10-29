import React, { useState, useEffect } from 'react';
import {
  UserRole,
  ProjectLead,
  DesignerTimesheetEntry,
  ChatMessage,
  UserAccount,
  AccountCredential,
  Invoice,
  Quotation,
  ServiceCatalogItem,
  CompanyBillingSettings,
} from './types.ts';
import {
  INITIAL_PROJECTS,
  HISTORICAL_PRICE_DATABASE,
  INITIAL_TIMESHEET_ENTRIES,
  INITIAL_CHAT_MESSAGES,
} from './data/mockData.ts';
import {
  INITIAL_INVOICES,
  INITIAL_SERVICES_CATALOG,
  INITIAL_COMPANY_SETTINGS,
} from './data/adminAndBillingData.ts';
import { INITIAL_QUOTATIONS } from './data/quotationData.ts';
import { ACCOUNTS_DATABASE } from './data/authData.ts';
import { Header } from './components/Header.tsx';
import { ExecutiveDashboard } from './components/ExecutiveDashboard.tsx';
import { SalesModule } from './components/SalesModule.tsx';
import { ProjectManagerModule } from './components/ProjectManagerModule.tsx';
import { DesignModule } from './components/DesignModule.tsx';
import { ProductionModule } from './components/ProductionModule.tsx';
import { InstallationModule } from './components/InstallationModule.tsx';
import { InternalChatModule } from './components/InternalChatModule.tsx';
import { InvoicingModule } from './components/InvoicingModule.tsx';
import { QuotationModule } from './components/QuotationModule.tsx';
import { AdminPanelModule } from './components/AdminPanelModule.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import {
  Users,
  Lock,
  Sun,
  Moon,
  Search,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Default to crisp Light Mode ('light') for authentic enterprise ERP clarity
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('e9_erp_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('e9_erp_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Persistent employee accounts and credentials state (Role Assigning Engine)
  const [accounts, setAccounts] = useState<AccountCredential[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return ACCOUNTS_DATABASE;
  });

  // Current authenticated user account
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return ACCOUNTS_DATABASE[0]; // Admin: Rajeev Singhania
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('executive');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persistent projects state (use v2 key so updated corporate emails & SVG blueprints load cleanly)
  const [projects, setProjects] = useState<ProjectLead[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_projects_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_PROJECTS;
  });

  // Timesheet entries
  const [timesheetEntries, setTimesheetEntries] = useState<DesignerTimesheetEntry[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_timesheets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_TIMESHEET_ENTRIES;
  });

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_chat_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: ChatMessage) =>
          m.channelId === 'proj-101' ? { ...m, channelId: 'prj-101' } : m
        );
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_CHAT_MESSAGES;
  });

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_invoices');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_INVOICES;
  });

  // Quotations state (Commercial estimates, GST proposals, revisions)
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_quotations_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_QUOTATIONS;
  });

  // Service Catalog state (Admin configurable rates & offerings)
  const [services, setServices] = useState<ServiceCatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_services');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_SERVICES_CATALOG;
  });

  // Company Billing Settings
  const [companySettings, setCompanySettings] = useState<CompanyBillingSettings>(() => {
    try {
      const saved = localStorage.getItem('e9_crm_company');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_COMPANY_SETTINGS;
  });

  // Active Designer Timer State
  const [activeTimer, setActiveTimer] = useState<{
    isRunning: boolean;
    projectId: string;
    elapsedSeconds: number;
    designerName: string;
  }>({
    isRunning: true,
    projectId: 'prj-101',
    elapsedSeconds: 1420,
    designerName: currentUser?.designation === 'designer' ? currentUser.name : 'Priya Sen',
  });

  // Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning]);

  // Sync state to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('e9_crm_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('e9_crm_user');
      }
    } catch (e) {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_accounts', JSON.stringify(accounts));
    } catch (e) {
      // ignore
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_projects_v2', JSON.stringify(projects));
    } catch (e) {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_timesheets', JSON.stringify(timesheetEntries));
    } catch (e) {
      // ignore
    }
  }, [timesheetEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_chat_v2', JSON.stringify(chatMessages));
    } catch (e) {
      // ignore
    }
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_invoices', JSON.stringify(invoices));
    } catch (e) {
      // ignore
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_services', JSON.stringify(services));
    } catch (e) {
      // ignore
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_quotations_v2', JSON.stringify(quotations));
    } catch (e) {
      // ignore
    }
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem('e9_crm_company', JSON.stringify(companySettings));
    } catch (e) {
      // ignore
    }
  }, [companySettings]);

  const handleUpdateQuotation = (updated: Quotation) => {
    setQuotations((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    if (updated.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === updated.projectId
            ? { ...p, quotation: updated, estimatedValue: updated.grandTotal }
            : p
        )
      );
    }
    showToast(`Quotation ${updated.quoteNumber} updated`);
  };

  const handleCreateQuotation = (newQuote: Quotation) => {
    setQuotations((prev) => [newQuote, ...prev]);
    if (newQuote.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === newQuote.projectId
            ? { ...p, quotation: newQuote, estimatedValue: newQuote.grandTotal }
            : p
        )
      );
    }
    showToast(`Quotation ${newQuote.quoteNumber} created for ${newQuote.clientName}`);
  };

  const handleConvertQuotationToInvoice = (quote: Quotation) => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: quote.projectId,
      projectLeadCode: quote.projectLeadCode,
      clientName: quote.clientName,
      clientGstin: quote.clientGstin,
      billingAddress: quote.billingAddress || 'Commercial Office Tower, India',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      poNumber: quote.projectLeadCode ? `PO-${quote.projectLeadCode.replace('E9-', '')}` : undefined,
      quotationNumber: quote.quoteNumber,
      isInterState: quote.isInterState,
      items: quote.items.map((qi, idx) => ({
        id: `ii-${Date.now()}-${idx}`,
        description: `${qi.productName} (${qi.category})`,
        hsnSacCode: qi.hsnSacCode || '391990',
        quantity: qi.quantity,
        unit: qi.unit,
        unitRate: qi.unitPrice,
        taxRatePercent: qi.taxRatePercent || quote.taxRatePercent || 18,
        amount: qi.amount || qi.quantity * qi.unitPrice,
      })),
      subtotal: quote.subtotal,
      cgstAmount: quote.cgstAmount ?? (quote.isInterState ? 0 : Math.round(quote.taxAmount / 2)),
      sgstAmount: quote.sgstAmount ?? (quote.isInterState ? 0 : Math.round(quote.taxAmount / 2)),
      igstAmount: quote.igstAmount ?? (quote.isInterState ? quote.taxAmount : 0),
      totalTax: quote.taxAmount,
      grandTotal: quote.grandTotal,
      amountPaid: 0,
      balanceDue: quote.grandTotal,
      status: 'issued',
      notes: `Generated from Approved Quotation ${quote.quoteNumber}`,
      paymentHistory: [],
    };

    setQuotations((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'approved' } : q))
    );
    if (quote.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === quote.projectId
            ? { ...p, enquiryStatus: 'won', quotation: { ...quote, status: 'approved' } }
            : p
        )
      );
    }
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`Quotation ${quote.quoteNumber} converted to Tax Invoice ${newInvoice.invoiceNumber}`);
    setCurrentRole('invoicing');
  };

  const handleUpdateInvoice = (updated: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    showToast(`Invoice ${updated.invoiceNumber} updated`);
  };

  const handleCreateInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Invoice ${newInv.invoiceNumber} generated for ${newInv.clientName}`);
  };

  const handleUpdateService = (updated: ServiceCatalogItem) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleCreateService = (newSrv: ServiceCatalogItem) => {
    setServices((prev) => [newSrv, ...prev]);
  };

  const handleBulkAdjustPrices = (category: string, percentDelta: number) => {
    const today = new Date().toISOString().split('T')[0];
    setServices((prev) =>
      prev.map((s) => {
        if (category === 'all' || s.category === category) {
          const newRate = Math.round(s.baseRate * (1 + percentDelta / 100));
          return {
            ...s,
            baseRate: Math.max(1, newRate),
            lastUpdated: today,
          };
        }
        return s;
      })
    );
  };

  const handleUpdateCompanySettings = (updated: CompanyBillingSettings) => {
    setCompanySettings(updated);
  };

  const handleUpdateAccount = (updated: AccountCredential) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
    showToast(`Updated clearance & credentials for ${updated.name}`);
  };

  const handleCreateAccount = (newAccount: AccountCredential) => {
    setAccounts((prev) => [...prev, newAccount]);
    showToast(`Employee ${newAccount.name} created with ${newAccount.allowedRoles.length} assigned modules`);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (currentUser?.id === accountId) {
      showToast('Cannot delete your own active signed-in operator account.');
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    showToast('Employee account removed from directory');
  };

  const handleLogin = (user: UserAccount) => {
    const freshAccount = accounts.find((a) => a.id === user.id) || user;
    setCurrentUser(freshAccount);
    if (!freshAccount.allowedRoles.includes(currentRole)) {
      setCurrentRole(freshAccount.defaultRole);
    }
    if (freshAccount.designation === 'designer') {
      setActiveTimer((prev) => ({
        ...prev,
        designerName: freshAccount.name,
      }));
    }
    setShowAuthModal(false);
    showToast(`Active operator: ${freshAccount.name} (${freshAccount.designationTitle})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  const handleUpdateProject = (updated: ProjectLead) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCreateEnquiry = (newLeadData: Partial<ProjectLead>) => {
    const newLead: ProjectLead = {
      id: `prj-${Date.now()}`,
      leadCode: `E9-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: newLeadData.clientName || 'New Client Ltd',
      projectName: newLeadData.projectName || 'Commercial Graphics Project',
      contactPerson: newLeadData.contactPerson || 'Facilities Manager',
      contactPhone: newLeadData.contactPhone || '+91 98000 00000',
      contactEmail: newLeadData.contactEmail || 'facilities@corporateclient.in',
      location: newLeadData.location || 'Metro Hub, India',
      stage: newLeadData.stage || 'enquiry',
      enquiryStatus: newLeadData.enquiryStatus || 'discussing',
      estimatedValue: newLeadData.estimatedValue || 200000,
      createdAt: new Date().toISOString().split('T')[0],
      quotation: newLeadData.quotation,
      siteMeasurement: newLeadData.siteMeasurement,
    };

    setProjects((prev) => [newLead, ...prev]);
  };

  const handleAddTimesheetEntry = (entry: DesignerTimesheetEntry) => {
    setTimesheetEntries((prev) => [entry, ...prev]);
  };

  const handleSendMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const handleToggleTimer = (projectId?: string) => {
    if (activeTimer.isRunning) {
      const targetProjId = activeTimer.projectId;
      const targetProj = projects.find((p) => p.id === targetProjId);

      if (activeTimer.elapsedSeconds > 10) {
        const newEntry: DesignerTimesheetEntry = {
          id: `ts-${Date.now()}`,
          projectId: targetProjId,
          projectName: targetProj?.projectName || 'Design Studio Session',
          designerName: activeTimer.designerName,
          date: new Date().toISOString().split('T')[0],
          startTime: 'Logged Session',
          endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationSeconds: activeTimer.elapsedSeconds,
          activityDescription: 'CAD artwork & prepress production session',
        };
        handleAddTimesheetEntry(newEntry);
      }

      setActiveTimer((prev) => ({
        ...prev,
        isRunning: false,
      }));
    } else {
      setActiveTimer((prev) => ({
        ...prev,
        isRunning: true,
        projectId: projectId || prev.projectId || projects[0]?.id || 'prj-101',
      }));
    }
  };

  const handleResetTimer = () => {
    setActiveTimer((prev) => ({
      ...prev,
      elapsedSeconds: 0,
      isRunning: false,
    }));
    showToast('Job timer reset to 00:00:00');
  };

  const handleResetData = () => {
    localStorage.removeItem('e9_crm_projects_v2');
    localStorage.removeItem('e9_crm_timesheets');
    localStorage.removeItem('e9_crm_chat_v2');
    localStorage.removeItem('e9_crm_invoices');
    localStorage.removeItem('e9_crm_quotations_v2');
    localStorage.removeItem('e9_crm_services');
    localStorage.removeItem('e9_crm_company');
    localStorage.removeItem('e9_crm_accounts');
    setProjects(INITIAL_PROJECTS);
    setTimesheetEntries(INITIAL_TIMESHEET_ENTRIES);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setInvoices(INITIAL_INVOICES);
    setQuotations(INITIAL_QUOTATIONS);
    setServices(INITIAL_SERVICES_CATALOG);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setAccounts(ACCOUNTS_DATABASE);
    showToast('Master ledger restored to default baseline records');
  };

  // Global Search state for Enterprise Quick-Jump
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const trimmedSearch = globalSearch.trim().toLowerCase();
  const searchResults = trimmedSearch
    ? {
        projects: projects.filter(
          (p) =>
            p.clientName.toLowerCase().includes(trimmedSearch) ||
            p.projectName.toLowerCase().includes(trimmedSearch) ||
            p.leadCode.toLowerCase().includes(trimmedSearch) ||
            p.location.toLowerCase().includes(trimmedSearch)
        ).slice(0, 4),
        quotations: quotations.filter(
          (q) =>
            q.quoteNumber.toLowerCase().includes(trimmedSearch) ||
            q.clientName.toLowerCase().includes(trimmedSearch)
        ).slice(0, 3),
        invoices: invoices.filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(trimmedSearch) ||
            i.clientName.toLowerCase().includes(trimmedSearch)
        ).slice(0, 3),
      }
    : null;

  // Breadcrumb metadata for current role
  const roleHeaders: Record<UserRole, { title: string; subtitle: string; group: string }> = {
    executive: {
      group: 'Commercial & Accounts',
      title: 'Executive Overview',
      subtitle: 'Portfolio realization, work-in-progress valuation, and departmental throughput',
    },
    sales: {
      group: 'Commercial & Accounts',
      title: 'Sales & CRM Ledger',
      subtitle: 'Corporate enquiries, estimation sheets, and historical client rate benchmarks',
    },
    quotation: {
      group: 'Commercial & Accounts',
      title: 'Commercial Quotations',
      subtitle: 'Statutory GST estimates, HSN/SAC line schedules, and tax invoice conversion',
    },
    project_manager: {
      group: 'Operations & Execution',
      title: 'Site Surveys & Elevations',
      subtitle: 'Laser elevation dimensions, substrate verification, and access equipment briefs',
    },
    design: {
      group: 'Operations & Execution',
      title: 'Design Studio & CAD Proofs',
      subtitle: 'Architectural elevation drawings, client proof sign-offs, and operator timesheets',
    },
    production: {
      group: 'Operations & Execution',
      title: 'Production Floor & QC',
      subtitle: 'PO quantity enforcement, pre-press verification, QC clearance, and waybill dispatch',
    },
    installation: {
      group: 'Operations & Execution',
      title: 'Site Handover & Fit-Out',
      subtitle: '5-point pre-application safety verification, zone tagging, and client handover certificates',
    },
    invoicing: {
      group: 'Commercial & Accounts',
      title: 'GST Tax Invoicing & Receivables',
      subtitle: 'Tax invoice register, NEFT/RTGS receipts, and statutory CGST/SGST/IGST ledgers',
    },
    admin_panel: {
      group: 'System Administration',
      title: 'Master Rate Card & Access Control',
      subtitle: 'Standard substrate tariffs, HSN/SAC catalog, staff role assignments, and billing credentials',
    },
    chat: {
      group: 'System Administration',
      title: 'Project Audit Log & Dispatches',
      subtitle: 'Cross-departmental handover notes, site readiness updates, and client escalations',
    },
  };

  const currentRoleInfo = roleHeaders[currentRole];

  // If user is logged out, show the login portal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          currentUser={null}
          onLogin={handleLogin}
          isSwitchMode={false}
          accounts={accounts}
        />
      </div>
    );
  }

  // Check if current user has permission to view current role
  const hasAccessToCurrentRole = currentUser.allowedRoles.includes(currentRole);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      {/* Clean Enterprise Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-slate-800 dark:border-zinc-300 px-3.5 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Staff Directory & Clearance Switcher Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        isSwitchMode={true}
        accounts={accounts}
      />

      {/* Primary Left-Docked Navigation Sidebar */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeTimer={activeTimer}
        projects={projects}
        onToggleTimer={() => handleToggleTimer(activeTimer.projectId)}
        onOpenTimerModal={() => setCurrentRole('design')}
        onResetData={handleResetData}
        currentUser={currentUser}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onResetTimer={handleResetTimer}
        invoices={invoices}
        quotations={quotations}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Enterprise Top Bar: Breadcrumb + Global Quick-Jump + Statutory Context */}
        <header className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left Zone: Clean Breadcrumb Trail */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden md:inline text-xs text-slate-500 dark:text-zinc-500 font-medium">
              {currentRoleInfo.group}
            </span>
            <ChevronRight className="hidden md:inline w-3.5 h-3.5 text-slate-300 dark:text-zinc-700 shrink-0" />
            <h1 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">
              {currentRoleInfo.title}
            </h1>
          </div>

          {/* Right Zone: Search + Fiscal Period + Operator Context */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Global Quick-Jump Search Input */}
            <div className="relative w-48 sm:w-64 lg:w-80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search lead code, client, invoice..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md pl-8 pr-10 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:border-slate-400 dark:focus:border-zinc-600 transition"
                />
                <span className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  ⌘K
                </span>
              </div>

              {/* Global Search Results Overlay */}
              {showSearchDropdown && trimmedSearch && searchResults && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md shadow-xl p-2 z-50 max-h-80 overflow-y-auto space-y-2 text-xs">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Matches for "{globalSearch}"</span>
                    <button
                      type="button"
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      ESC
                    </button>
                  </div>

                  {/* Projects */}
                  {searchResults.projects.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="px-2 text-[10px] text-slate-400 uppercase font-mono">Projects & Leads</div>
                      {searchResults.projects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setCurrentRole('sales');
                            setShowSearchDropdown(false);
                            showToast(`Opened ${p.clientName} (${p.leadCode})`);
                          }}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-left"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-zinc-100">{p.clientName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{p.projectName}</p>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                            {p.leadCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quotations */}
                  {searchResults.quotations.length > 0 && (
                    <div className="space-y-0.5 border-t border-slate-100 dark:border-zinc-800/80 pt-1.5">
                      <div className="px-2 text-[10px] text-slate-400 uppercase font-mono">Quotations</div>
                      {searchResults.quotations.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => {
                            setCurrentRole('quotation');
                            setShowSearchDropdown(false);
                            showToast(`Opened Quotation ${q.quoteNumber}`);
                          }}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-left"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-zinc-100">{q.quoteNumber}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{q.clientName}</p>
                          </div>
                          <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 tabular-nums">
                            ₹{q.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Invoices */}
                  {searchResults.invoices.length > 0 && (
                    <div className="space-y-0.5 border-t border-slate-100 dark:border-zinc-800/80 pt-1.5">
                      <div className="px-2 text-[10px] text-slate-400 uppercase font-mono">Tax Invoices</div>
                      {searchResults.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => {
                            setCurrentRole('invoicing');
                            setShowSearchDropdown(false);
                            showToast(`Opened Invoice ${inv.invoiceNumber}`);
                          }}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-left"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-zinc-100">{inv.invoiceNumber}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{inv.clientName}</p>
                          </div>
                          <span className="font-mono text-[11px] text-slate-800 dark:text-zinc-200 tabular-nums">
                            ₹{inv.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.projects.length === 0 &&
                    searchResults.quotations.length === 0 &&
                    searchResults.invoices.length === 0 && (
                      <div className="p-4 text-center text-slate-400">
                        No records matching "{globalSearch}"
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
              <span>FY 2026–27</span>
              <span>·</span>
              <span>Q3</span>
            </div>

            <button
              type="button"
              onClick={handleToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-1.5 rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-md text-xs transition cursor-pointer"
              title="Switch Active Staff Operator"
            >
              <span className="w-5 h-5 rounded-xs bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono font-semibold flex items-center justify-center text-[10px]">
                {currentUser.avatarInitials}
              </span>
              <span className="font-medium text-slate-800 dark:text-zinc-200 hidden sm:inline">
                {currentUser.name}
              </span>
            </button>
          </div>
        </header>

        {/* Workspace Container */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!hasAccessToCurrentRole ? (
            <div className="max-w-md mx-auto my-12 p-6 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-4">
              <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-slate-700 dark:text-zinc-300">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Departmental Clearance Required</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Active operator <strong className="text-slate-800 dark:text-zinc-200">{currentUser.name}</strong> ({currentUser.designationTitle}) is not assigned to this module.
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentRole(currentUser.defaultRole)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-md text-xs font-medium cursor-pointer"
                >
                  Return to Assigned Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold rounded-md text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Switch Operator</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentRole === 'executive' && (
                <ExecutiveDashboard
                  projects={projects}
                  onSelectRole={setCurrentRole}
                  onSelectProject={(projectId, targetRole) => {
                    setCurrentRole(targetRole);
                  }}
                />
              )}

              {currentRole === 'sales' && (
                <SalesModule
                  projects={projects}
                  historicalPrices={HISTORICAL_PRICE_DATABASE}
                  serviceCatalog={services}
                  onUpdateProject={handleUpdateProject}
                  onCreateEnquiry={handleCreateEnquiry}
                  onNavigateToMeasurement={() => {
                    setCurrentRole('project_manager');
                  }}
                />
              )}

              {currentRole === 'quotation' && (
                <QuotationModule
                  quotations={quotations}
                  projects={projects}
                  serviceCatalog={services}
                  companySettings={companySettings}
                  onUpdateQuotation={handleUpdateQuotation}
                  onCreateQuotation={handleCreateQuotation}
                  onConvertToInvoice={handleConvertQuotationToInvoice}
                />
              )}

              {currentRole === 'project_manager' && (
                <ProjectManagerModule
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                  onHandoffToDesign={() => {
                    setCurrentRole('design');
                  }}
                />
              )}

              {currentRole === 'design' && (
                <DesignModule
                  projects={projects}
                  timesheetEntries={timesheetEntries}
                  activeTimer={activeTimer}
                  onUpdateProject={handleUpdateProject}
                  onAddTimesheetEntry={handleAddTimesheetEntry}
                  onToggleTimer={handleToggleTimer}
                  onHandoffToProduction={() => {
                    setCurrentRole('production');
                  }}
                />
              )}

              {currentRole === 'production' && (
                <ProductionModule
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                  onHandoffToInstallation={() => {
                    setCurrentRole('installation');
                  }}
                />
              )}

              {currentRole === 'installation' && (
                <InstallationModule
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                />
              )}

              {currentRole === 'invoicing' && (
                <InvoicingModule
                  invoices={invoices}
                  projects={projects}
                  companySettings={companySettings}
                  onUpdateInvoice={handleUpdateInvoice}
                  onCreateInvoice={handleCreateInvoice}
                  onSendReminderToast={(invNo, client) => {
                    showToast(`Payment reminder dispatched to ${client} (${invNo})`);
                  }}
                />
              )}

              {currentRole === 'admin_panel' && (
                <AdminPanelModule
                  services={services}
                  companySettings={companySettings}
                  currentUser={currentUser}
                  accounts={accounts}
                  onUpdateAccount={handleUpdateAccount}
                  onCreateAccount={handleCreateAccount}
                  onDeleteAccount={handleDeleteAccount}
                  onUpdateService={handleUpdateService}
                  onCreateService={handleCreateService}
                  onBulkAdjustPrices={handleBulkAdjustPrices}
                  onUpdateCompanySettings={handleUpdateCompanySettings}
                  onShowToast={showToast}
                />
              )}

              {currentRole === 'chat' && (
                <InternalChatModule
                  projects={projects}
                  chatMessages={chatMessages}
                  currentUser={currentUser}
                  onSendMessage={handleSendMessage}
                />
              )}
            </>
          )}
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-3 text-xs text-slate-500 dark:text-zinc-400 mt-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px]">
              E9 Graphics & Architectural Signage Systems Pvt Ltd · Udyog Vihar Phase IV, Gurugram
            </p>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-slate-500 dark:text-zinc-500">GSTIN: {companySettings.gstin}</span>
              <span>·</span>
              <button
                type="button"
                onClick={handleResetData}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer underline-offset-2 hover:underline font-sans"
              >
                Restore Baseline Records
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

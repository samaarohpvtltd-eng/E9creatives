import React, { useState } from 'react';
import {
  ServiceCatalogItem,
  ServiceCategory,
  CompanyBillingSettings,
  UserAccount,
  AccountCredential,
  UserRole,
  Designation,
} from '../types.ts';
import {
  Settings,
  Sliders,
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  Building,
  CreditCard,
  Percent,
  Layers,
  ArrowUpDown,
  Tag,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Phone,
  Mail,
  Compass,
  FolderKanban,
  Palette,
  Hammer,
  Wrench,
  FileText,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Briefcase,
  CheckSquare,
  Square,
  Star,
  Info,
} from 'lucide-react';

interface RoleDefinition {
  role: UserRole;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const AVAILABLE_ROLES: RoleDefinition[] = [
  {
    role: 'executive',
    title: 'Executive & Portfolio Analytics',
    badge: 'Executive',
    description: 'High-level business KPIs, profit margin analytics, department workload charts, and executive summaries',
    icon: BarChart3,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'sales',
    title: 'Sales Pipeline & Enquiries',
    badge: 'Sales',
    description: 'Lead qualification, initial client specifications, site visit requests, and enquiry conversion',
    icon: Compass,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'quotation',
    title: 'Estimates & GST Quotations',
    badge: 'Quotation',
    description: 'Dynamic price-database lookup, auto CGST/SGST/IGST tax rates, formal quotation PDF export and prints',
    icon: FileSpreadsheet,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'project_manager',
    title: 'Site Surveys & Laser Measurements',
    badge: 'Project Manager',
    description: 'On-site digital measurement logs, elevation specs, architectural access, and survey sign-offs',
    icon: FolderKanban,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'design',
    title: 'Design Studio & Timesheets',
    badge: 'Design',
    description: 'Artwork proofs, vector revision cycles, client visual approvals, and active stopwatch timesheets',
    icon: Palette,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'production',
    title: 'Production Floor & QC Checks',
    badge: 'Production',
    description: 'Flatbed UV/solvent queue, substrates, plotter cutting, and strict multi-point QC inspection logs',
    icon: Hammer,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'installation',
    title: 'Site Installation & Handover',
    badge: 'Installation',
    description: 'Scaffolding/site logistics, punch-list snags, geo-tagged photos, and digital client handover',
    icon: Wrench,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'invoicing',
    title: 'GST Invoicing & Receivables',
    badge: 'Invoicing',
    description: 'Tax invoices, e-Way bills, payment receipts, customer ledgers, and formal printouts',
    icon: FileText,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'admin_panel',
    title: 'Enterprise Admin & Rate Card',
    badge: 'Admin Panel',
    description: 'Master rate cards, employee role assignments, company tax settings, and security controls',
    icon: ShieldCheck,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
  {
    role: 'chat',
    title: 'Internal Audit & Discussions',
    badge: 'Internal Chat',
    description: 'Cross-departmental project discussions, file sharing, and internal audit message logging',
    icon: MessageSquare,
    color: 'text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
  },
];

const ROLE_PRESETS = [
  {
    label: 'Full Super Admin (All 10)',
    roles: [
      'executive',
      'sales',
      'quotation',
      'project_manager',
      'design',
      'production',
      'installation',
      'invoicing',
      'admin_panel',
      'chat',
    ] as UserRole[],
    designation: 'admin' as Designation,
    defaultRole: 'executive' as UserRole,
  },
  {
    label: 'Operations & Field Lead',
    roles: [
      'project_manager',
      'quotation',
      'sales',
      'installation',
      'invoicing',
      'chat',
    ] as UserRole[],
    designation: 'project_manager' as Designation,
    defaultRole: 'project_manager' as UserRole,
  },
  {
    label: 'Creative Designer',
    roles: ['design', 'chat'] as UserRole[],
    designation: 'designer' as Designation,
    defaultRole: 'design' as UserRole,
  },
  {
    label: 'Production & Field Crew',
    roles: ['production', 'installation', 'chat'] as UserRole[],
    designation: 'employee' as Designation,
    defaultRole: 'production' as UserRole,
  },
  {
    label: 'Commercial & Invoicing',
    roles: ['sales', 'quotation', 'invoicing', 'chat'] as UserRole[],
    designation: 'employee' as Designation,
    defaultRole: 'quotation' as UserRole,
  },
];

interface AdminPanelModuleProps {
  services: ServiceCatalogItem[];
  companySettings: CompanyBillingSettings;
  currentUser: UserAccount;
  accounts: AccountCredential[];
  onUpdateAccount: (updated: AccountCredential) => void;
  onCreateAccount: (newAccount: AccountCredential) => void;
  onDeleteAccount: (accountId: string) => void;
  onUpdateService: (updated: ServiceCatalogItem) => void;
  onCreateService: (newService: ServiceCatalogItem) => void;
  onDeleteService?: (serviceId: string) => void;
  onBulkAdjustPrices: (category: string, percentDelta: number) => void;
  onUpdateCompanySettings: (updated: CompanyBillingSettings) => void;
  onShowToast?: (message: string) => void;
}

export const AdminPanelModule: React.FC<AdminPanelModuleProps> = ({
  services,
  companySettings,
  currentUser,
  accounts,
  onUpdateAccount,
  onCreateAccount,
  onDeleteAccount,
  onUpdateService,
  onCreateService,
  onDeleteService,
  onBulkAdjustPrices,
  onUpdateCompanySettings,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'services' | 'bulk_adjust' | 'company'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Employee Directory & Role Assignment State
  const [empSearchTerm, setEmpSearchTerm] = useState('');
  const [empDesignationFilter, setEmpDesignationFilter] = useState<string>('all');
  const [empStatusFilter, setEmpStatusFilter] = useState<string>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);

  // Employee Modal State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Modal Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState<Designation>('employee');
  const [formDesignationTitle, setFormDesignationTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Operations & Production');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [formAllowedRoles, setFormAllowedRoles] = useState<UserRole[]>(['production', 'installation', 'chat']);
  const [formDefaultRole, setFormDefaultRole] = useState<UserRole>('production');
  const [formDescription, setFormDescription] = useState('');

  // Service Edit Modal
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Service State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('Window Film');
  const [newDesc, setNewDesc] = useState('');
  const [newUnit, setNewUnit] = useState<'sq.ft' | 'rft' | 'unit' | 'set' | 'job' | 'day'>('sq.ft');
  const [newBaseRate, setNewBaseRate] = useState<number>(150);
  const [newMoq, setNewMoq] = useState<number>(50);
  const [newLeadTime, setNewLeadTime] = useState<number>(2);
  const [newHsn, setNewHsn] = useState('391990');

  // Bulk Adjustment State
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkPercent, setBulkPercent] = useState<number>(5);
  const [bulkPreviewActive, setBulkPreviewActive] = useState(false);

  // Company Settings Form State
  const [compForm, setCompForm] = useState<CompanyBillingSettings>(companySettings);

  const categories: ServiceCategory[] = [
    'Window Film',
    'Wall Graphics',
    '3D & Dimensional Signage',
    'UV & Flatbed',
    'Architectural Wayfinding',
    'Installation & Survey',
  ];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.hsnSacCode.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered employees
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
      acc.department.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
      acc.designationTitle.toLowerCase().includes(empSearchTerm.toLowerCase());
    const matchesDesignation =
      empDesignationFilter === 'all' || acc.designation === empDesignationFilter;
    const matchesStatus =
      empStatusFilter === 'all' || (acc.status || 'active') === empStatusFilter;
    return matchesSearch && matchesDesignation && matchesStatus;
  });

  const generateRandomPassword = () => {
    const prefixes = ['E9@Ops', 'E9#Lead', 'E9$Design', 'E9&Team', 'E9*Build'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (nameStr.slice(0, 2) || 'E9').toUpperCase();
  };

  const openEditAccount = (account: AccountCredential) => {
    setIsEditingAccount(true);
    setEditingAccountId(account.id);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormPassword(account.passwordHash);
    setFormShowPassword(false);
    setFormPhone(account.phone || '+91 98000 00000');
    setFormDesignation(account.designation);
    setFormDesignationTitle(account.designationTitle);
    setFormDepartment(account.department);
    setFormStatus(account.status || 'active');
    setFormAllowedRoles(account.allowedRoles || []);
    setFormDefaultRole(account.defaultRole || account.allowedRoles[0] || 'executive');
    setFormDescription(account.description || '');
    setShowAccountModal(true);
  };

  const openCreateAccount = () => {
    setIsEditingAccount(false);
    setEditingAccountId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword(generateRandomPassword());
    setFormShowPassword(true);
    setFormPhone('+91 ');
    setFormDesignation('employee');
    setFormDesignationTitle('Production & Site Technician');
    setFormDepartment('Operations & Field');
    setFormStatus('active');
    setFormAllowedRoles(['production', 'installation', 'chat']);
    setFormDefaultRole('production');
    setFormDescription('Field technician specializing in on-site vinyl and wayfinding mounting.');
    setShowAccountModal(true);
  };

  const handleToggleRoleSelection = (role: UserRole) => {
    setFormAllowedRoles((prev) => {
      let updated: UserRole[];
      if (prev.includes(role)) {
        // Prevent unselecting if it's the only role
        if (prev.length <= 1) return prev;
        updated = prev.filter((r) => r !== role);
      } else {
        updated = [...prev, role];
      }

      // If current default role is not in the updated allowed list, set to first available
      if (!updated.includes(formDefaultRole)) {
        setFormDefaultRole(updated[0]);
      }
      return updated;
    });
  };

  const applyRolePreset = (preset: typeof ROLE_PRESETS[0]) => {
    setFormAllowedRoles(preset.roles);
    setFormDesignation(preset.designation);
    setFormDefaultRole(preset.defaultRole);
    if (onShowToast) onShowToast(`Applied preset: ${preset.label}`);
  };

  const handleCopyPassword = (account: AccountCredential) => {
    navigator.clipboard.writeText(account.passwordHash);
    setCopiedPassId(account.id);
    setTimeout(() => setCopiedPassId(null), 2000);
    if (onShowToast) onShowToast(`Password for ${account.name} copied to clipboard!`);
  };

  const handleTogglePasswordVisibility = (accountId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleSaveAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      if (onShowToast) onShowToast('Please provide name, corporate email, and password.');
      return;
    }

    if (formAllowedRoles.length === 0) {
      if (onShowToast) onShowToast('At least one module clearance must be assigned.');
      return;
    }

    const badgeLabel =
      formDesignation === 'admin'
        ? 'Super Admin'
        : formDesignation === 'project_manager'
        ? 'Project Manager'
        : formDesignation === 'designer'
        ? 'Visual Lead'
        : 'Operations Staff';

    const accountData: AccountCredential = {
      id: isEditingAccount && editingAccountId ? editingAccountId : `acc-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      passwordHash: formPassword.trim(),
      designation: formDesignation,
      designationTitle: formDesignationTitle.trim() || 'Operations Specialist',
      department: formDepartment.trim() || 'Operations',
      avatarInitials: getInitials(formName),
      allowedRoles: formAllowedRoles,
      defaultRole: formAllowedRoles.includes(formDefaultRole) ? formDefaultRole : formAllowedRoles[0],
      badgeLabel,
      description: formDescription.trim() || 'Assigned employee credentials for E9 CRM & Production Operations.',
      phone: formPhone.trim(),
      status: formStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (isEditingAccount) {
      onUpdateAccount(accountData);
      if (onShowToast) onShowToast(`Updated credentials & roles for ${accountData.name}`);
    } else {
      onCreateAccount(accountData);
      if (onShowToast) onShowToast(`Created employee account for ${accountData.name}`);
    }

    setShowAccountModal(false);
  };

  const handleDeleteAccountClick = (account: AccountCredential) => {
    if (account.id === currentUser.id) {
      if (onShowToast) onShowToast('Security Protection: Cannot delete your active operator session.');
      return;
    }

    onDeleteAccount(account.id);
    if (onShowToast) onShowToast(`Removed operator account: ${account.name}`);
  };

  const handleToggleAccountStatus = (account: AccountCredential) => {
    if (account.id === currentUser.id && (account.status || 'active') === 'active') {
      if (onShowToast) onShowToast('Security Protection: Cannot suspend your active operator session.');
      return;
    }

    const newStatus = (account.status || 'active') === 'active' ? 'suspended' : 'active';
    const updated: AccountCredential = {
      ...account,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onUpdateAccount(updated);
    if (onShowToast) {
      onShowToast(`Account ${account.name} is now ${newStatus.toUpperCase()}`);
    }
  };

  const handleSaveEditedService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    const updated = {
      ...editingService,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onUpdateService(updated);
    setEditingService(null);
    if (onShowToast) onShowToast(`Updated rate for ${updated.name}`);
  };

  const handleCreateNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newService: ServiceCatalogItem = {
      id: `srv-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Architectural signage and graphics specification',
      unit: newUnit,
      baseRate: newBaseRate,
      minOrderQuantity: newMoq,
      taxRatePercent: 18,
      turnaroundDays: newLeadTime,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      hsnSacCode: newHsn.trim() || '998399',
    };

    onCreateService(newService);
    setShowCreateModal(false);
    // Reset
    setNewName('');
    setNewDesc('');
    setNewBaseRate(150);
    if (onShowToast) onShowToast(`Created service: ${newService.name}`);
  };

  const handleExecuteBulkAdjust = () => {
    onBulkAdjustPrices(bulkCategory, bulkPercent);
    setBulkPreviewActive(false);
    if (onShowToast) {
      onShowToast(
        `Applied ${bulkPercent > 0 ? '+' : ''}${bulkPercent}% rate adjustment across ${
          bulkCategory === 'all' ? 'all services' : bulkCategory
        }`
      );
    }
  };

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanySettings(compForm);
    if (onShowToast) onShowToast('Company settings & billing details updated successfully');
  };

  // Metrics for employee tab
  const totalEmployees = accounts.length;
  const activeEmployees = accounts.filter((a) => (a.status || 'active') === 'active').length;
  const superAdminCount = accounts.filter((a) => a.designation === 'admin' || a.allowedRoles.includes('admin_panel')).length;
  const totalRoleGrants = accounts.reduce((sum, a) => sum + (a.allowedRoles?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Admin Panel & Operations Control</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                  Role: {currentUser.designation.replace('_', ' ')}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Manage employee module role clearances & login credentials, rate cards, and billing settings
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'employees'
                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Roles & Credentials ({accounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Rate Card ({services.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bulk_adjust')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bulk_adjust'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-sky-500" />
            <span>Bulk Rate Adjuster</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'company'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-purple-500" />
            <span>Company & Bank</span>
          </button>
        </div>
      </div>

      {/* TAB 0: STAFF ROLES & CREDENTIAL ASSIGNMENT */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-xs font-medium">Total Staff Members</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{totalEmployees}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Configured employee profiles</div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-xs font-medium">Active Accounts</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeEmployees}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Eligible for portal login</div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-xs font-medium">Super Administrators</span>
                <ShieldCheck className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{superAdminCount}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Admin & rate card clearance</div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-xs font-medium">Module Grants</span>
                <Layers className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-sky-600 dark:text-sky-400">{totalRoleGrants}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Avg {(totalRoleGrants / (totalEmployees || 1)).toFixed(1)} modules / staff</div>
            </div>
          </div>

          {/* Controls: Search, Filters, and Add Employee Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, email, department, or job title..."
                  value={empSearchTerm}
                  onChange={(e) => setEmpSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <select
                aria-label="Filter staff by designation"
                value={empDesignationFilter}
                onChange={(e) => setEmpDesignationFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Designations ({accounts.length})</option>
                <option value="admin">Administrators</option>
                <option value="project_manager">Project Managers</option>
                <option value="designer">Designers</option>
                <option value="employee">Staff / Technicians</option>
              </select>

              <select
                aria-label="Filter staff by account status"
                value={empStatusFilter}
                onChange={(e) => setEmpStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateAccount}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Employee & Assign Roles</span>
            </button>
          </div>

          {/* Employee Directory List */}
          {filteredAccounts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <Users className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No staff members match filter criteria</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Try resetting your search query or designation filter, or register a new employee.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmpSearchTerm('');
                    setEmpDesignationFilter('all');
                    setEmpStatusFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={openCreateAccount}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-semibold text-xs cursor-pointer"
                >
                  Add Employee
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAccounts.map((account) => {
                const isCurrent = account.id === currentUser.id;
                const isSuspended = (account.status || 'active') === 'suspended';
                const isPasswordShown = !!visiblePasswords[account.id];
                const isCopied = copiedPassId === account.id;

                const designationStyles = {
                  admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
                  project_manager: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
                  designer: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
                  employee: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                }[account.designation];

                return (
                  <div
                    key={account.id}
                    className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
                      isSuspended
                        ? 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 opacity-75'
                        : isCurrent
                        ? 'bg-white dark:bg-zinc-900 border-amber-500/50 ring-1 ring-amber-500/20'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Identity Section */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm border shadow-xs ${designationStyles}`}>
                            {account.avatarInitials || getInitials(account.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {account.name}
                              </h3>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  You (Active)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">{account.designationTitle}</span>
                              <span>•</span>
                              <span>{account.department}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Label */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`font-mono text-[11px] font-semibold uppercase ${
                              isSuspended
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                            {account.badgeLabel}
                          </span>
                        </div>
                      </div>

                      {/* Credentials & Contact Box */}
                      <div className="mt-3.5 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 truncate">
                            <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 truncate">{account.email}</span>
                          </div>
                          {account.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              <span>{account.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
                          <div className="flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Password:</span>
                            <span className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                              {isPasswordShown ? account.passwordHash : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTogglePasswordVisibility(account.id)}
                              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 transition cursor-pointer"
                              title={isPasswordShown ? 'Hide password' : 'Show password'}
                            >
                              {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyPassword(account)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                              isCopied
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 font-semibold'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-500'
                            }`}
                          >
                            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Module Role Clearances Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                            <Shield className="w-3.5 h-3.5 text-amber-500" />
                            <span>Module Clearances ({account.allowedRoles?.length || 0}/10)</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            Default: <span className="font-semibold text-amber-600 dark:text-amber-400">{account.defaultRole}</span>
                          </span>
                        </div>

                        {/* Badges for active roles */}
                        <div className="flex flex-wrap gap-1.5">
                          {AVAILABLE_ROLES.map((roleDef) => {
                            const isAllowed = account.allowedRoles?.includes(roleDef.role);
                            const isDefault = account.defaultRole === roleDef.role;
                            const IconComponent = roleDef.icon;

                            if (!isAllowed) return null;

                            return (
                              <span
                                key={roleDef.role}
                                title={`${roleDef.title}: ${roleDef.description}`}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${roleDef.color} ${
                                  isDefault ? 'ring-1 ring-amber-500 font-semibold' : ''
                                }`}
                              >
                                <IconComponent className="w-3 h-3 shrink-0" />
                                <span>{roleDef.badge}</span>
                                {isDefault && <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAccount(account)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Assign Roles & Credentials</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAccountStatus(account)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Cannot suspend active session' : isSuspended ? 'Activate account' : 'Suspend account'}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                              isCurrent
                                ? 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                : isSuspended
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-red-500'
                            }`}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAccountClick(account)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Cannot delete your own active session' : 'Delete staff account'}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                              isCurrent
                                ? 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SERVICES & MASTER RATE CARD */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Controls: Search, Category Filter, and Add New Service */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search service name, description, or HSN code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>

              <select
                aria-label="Filter by service category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
              >
                <option value="all">All Categories ({services.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Architectural Service</span>
            </button>
          </div>

          {/* Services Table */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Service Name & Specifications</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Base Rate (₹)</th>
                    <th className="py-3 px-4 text-center">Unit & MOQ</th>
                    <th className="py-3 px-4 text-center">Lead Time</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-zinc-400 text-xs">
                        No services match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((srv) => (
                      <tr
                        key={srv.id}
                        className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition group"
                      >
                        {/* Name & Desc */}
                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{srv.name}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {srv.description}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-400">HSN: {srv.hsnSacCode}</span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 whitespace-nowrap">
                            {srv.category}
                          </span>
                        </td>

                        {/* Base Rate */}
                        <td className="py-3 px-4 text-right">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                            ₹{srv.baseRate.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[10px] text-zinc-500">per {srv.unit}</span>
                        </td>

                        {/* Unit & MOQ */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-zinc-800 dark:text-zinc-200">{srv.unit}</span>
                          <span className="text-[10px] text-zinc-500 block">MOQ: {srv.minOrderQuantity}</span>
                        </td>

                        {/* Lead Time */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {srv.turnaroundDays}d
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          {srv.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-500/10 text-zinc-500 border border-zinc-500/30">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Edit Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingService(srv)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-amber-500" />
                            <span>Edit Rate</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK RATE ADJUSTER */}
      {activeTab === 'bulk_adjust' && (
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-5 max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                Bulk Margin & Inflation Rate Adjuster
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Apply a blanket percentage increase or reduction to services to reflect raw material fluctuations, inflation, or seasonal campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Target Category</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                <option value="all">All Service Categories ({services.length} items)</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                Percentage Adjustment (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5 or -5"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-semibold"
                />
                <span className="text-zinc-500 font-mono text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Quick Presets:</span>
            {[+5, +8, +10, -5, -10].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBulkPercent(preset)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition cursor-pointer ${
                  bulkPercent === preset
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                {preset > 0 ? `+${preset}%` : `${preset}%`}
              </button>
            ))}
          </div>

          {/* Live Preview of Adjusted Rates */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Rate Impact Preview</span>
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">
                {bulkPercent >= 0 ? `+${bulkPercent}% Price Rise` : `${bulkPercent}% Price Cut`}
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {services
                .filter((s) => bulkCategory === 'all' || s.category === bulkCategory)
                .slice(0, 6)
                .map((s) => {
                  const newRate = Math.round(s.baseRate * (1 + bulkPercent / 100));
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/50 dark:border-zinc-800/50 last:border-0"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300">{s.name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-400 line-through">₹{s.baseRate}</span>
                        <span className="text-zinc-400">→</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">₹{newRate}</span>
                        <span className="text-[10px] text-zinc-500">/{s.unit}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleExecuteBulkAdjust}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Rate Adjustments</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANY & BANKING CREDENTIALS */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompanySettings} className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-5 max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                Company Details & Bank Credentials
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              These details appear on official GST Tax Invoices, Quotations, and Wire Transfer instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Company Trade Name *</label>
              <input
                type="text"
                value={compForm.companyName}
                onChange={(e) => setCompForm({ ...compForm, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Brand Tagline</label>
              <input
                type="text"
                value={compForm.brandTagline}
                onChange={(e) => setCompForm({ ...compForm, brandTagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">GSTIN *</label>
              <input
                type="text"
                value={compForm.gstin}
                onChange={(e) => setCompForm({ ...compForm, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">PAN Number</label>
              <input
                type="text"
                value={compForm.panNumber}
                onChange={(e) => setCompForm({ ...compForm, panNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Registered Address</label>
              <input
                type="text"
                value={compForm.address}
                onChange={(e) => setCompForm({ ...compForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">State Code</label>
              <input
                type="text"
                value={compForm.stateCode}
                onChange={(e) => setCompForm({ ...compForm, stateCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Accounts Email</label>
              <input
                type="email"
                value={compForm.email}
                onChange={(e) => setCompForm({ ...compForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Bank Wire Details */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              <span>Receiving Bank Account (For Invoices)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Bank Name</label>
                <input
                  type="text"
                  value={compForm.bankName}
                  onChange={(e) => setCompForm({ ...compForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Account Number</label>
                <input
                  type="text"
                  value={compForm.bankAccountNo}
                  onChange={(e) => setCompForm({ ...compForm, bankAccountNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">IFSC Code</label>
                <input
                  type="text"
                  value={compForm.bankIfsc}
                  onChange={(e) => setCompForm({ ...compForm, bankIfsc: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">UPI ID</label>
                <input
                  type="text"
                  value={compForm.upiId}
                  onChange={(e) => setCompForm({ ...compForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Company Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Edit Service & Base Rate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedService} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Service Name</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Base Rate (₹)</label>
                  <input
                    type="number"
                    value={editingService.baseRate}
                    onChange={(e) => setEditingService({ ...editingService, baseRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Unit</label>
                  <select
                    value={editingService.unit}
                    onChange={(e: any) => setEditingService({ ...editingService, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="sq.ft">sq.ft</option>
                    <option value="rft">rft</option>
                    <option value="unit">unit</option>
                    <option value="set">set</option>
                    <option value="job">job</option>
                    <option value="day">day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Min Order Qty (MOQ)</label>
                  <input
                    type="number"
                    value={editingService.minOrderQuantity}
                    onChange={(e) => setEditingService({ ...editingService, minOrderQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={editingService.turnaroundDays}
                    onChange={(e) => setEditingService({ ...editingService, turnaroundDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Status</label>
                <select
                  value={editingService.status}
                  onChange={(e: any) => setEditingService({ ...editingService, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="active">Active (Available for Quotations & Orders)</option>
                  <option value="inactive">Inactive / Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SERVICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Add New Architectural Service
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

            <form onSubmit={handleCreateNewService} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Polycarbonate Tactile Braille Sign"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={newHsn}
                    onChange={(e) => setNewHsn(e.target.value)}
                    placeholder="e.g. 831000"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Base Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newBaseRate}
                    onChange={(e) => setNewBaseRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Unit of Measure</label>
                  <select
                    value={newUnit}
                    onChange={(e: any) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="sq.ft">sq.ft</option>
                    <option value="rft">rft</option>
                    <option value="unit">unit</option>
                    <option value="set">set</option>
                    <option value="job">job</option>
                    <option value="day">day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Minimum Order (MOQ)</label>
                  <input
                    type="number"
                    value={newMoq}
                    onChange={(e) => setNewMoq(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Turnaround (Days)</label>
                  <input
                    type="number"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Material specs, adhesion standard, and finish..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF ROLE ASSIGNMENT & CREDENTIAL MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{isEditingAccount ? 'Assign Roles & Manage Credentials' : 'Add Employee & Grant Module Clearances'}</span>
                    {formName && (
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        ({formName})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Configure login credentials, security clearances, and workspace permissions across all CRM modules
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveAccountSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* SECTION 1: EMPLOYEE IDENTITY & JOB PROFILE */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Employee Profile & Job Info</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rathore"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Login Email ID *
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. v.rathore@e9graphics.com"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Official Designation Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDesignationTitle}
                      onChange={(e) => setFormDesignationTitle(e.target.value)}
                      placeholder="e.g. Senior Architectural Project Lead"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      placeholder="e.g. Operations & Project Surveys"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Designation Band & Badge
                    </label>
                    <select
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value as Designation)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="admin">Administrator / Director (Full Authority)</option>
                      <option value="project_manager">Project Manager (Surveys & Field)</option>
                      <option value="designer">Designer / Visual Lead (Artwork & Timesheets)</option>
                      <option value="employee">Staff / Field Technician (Production & Site)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 98000 00000"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                      Account Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'active' | 'suspended')}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="active">Active (Can log in & perform authorized actions)</option>
                      <option value="suspended">Suspended (Access immediately locked)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CREDENTIALS & SECURITY */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. Login Password & Security</span>
                </h4>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type={formShowPassword ? 'text' : 'password'}
                        required
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Enter secure password"
                        className="w-full pl-9 pr-10 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormShowPassword(!formShowPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newPass = generateRandomPassword();
                        setFormPassword(newPass);
                        setFormShowPassword(true);
                        if (onShowToast) onShowToast(`Generated new password: ${newPass}`);
                      }}
                      className="px-3 py-2 rounded bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Generate Passkey</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Employees can use this email and password to log in through the portal or switch accounts directly.
                      All changes take effect immediately across all sessions.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ROLE PRESETS (BATCH 1-CLICK ASSIGNMENT) */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    <span>3. Role Presets & 1-Click Assignment</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormAllowedRoles(AVAILABLE_ROLES.map((r) => r.role));
                        if (onShowToast) onShowToast('Granted all 10 module clearances');
                      }}
                      className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Select All (10)
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormAllowedRoles(['production']);
                        setFormDefaultRole('production');
                      }}
                      className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      Reset to Min
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyRolePreset(preset)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-amber-500/10 hover:border-amber-500/40 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{preset.label}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono">
                        {preset.roles.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 4: INTERACTIVE MODULE CLEARANCE GRID (ALL 10 MODULES) */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>4. Module Access Clearances</span>
                  </h4>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {formAllowedRoles.length} of 10 Modules Granted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_ROLES.map((roleDef) => {
                    const isSelected = formAllowedRoles.includes(roleDef.role);
                    const isDefault = formDefaultRole === roleDef.role;
                    const IconComponent = roleDef.icon;

                    return (
                      <div
                        key={roleDef.role}
                        onClick={() => handleToggleRoleSelection(roleDef.role)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                          isSelected
                            ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20 shadow-xs'
                            : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}`} />
                              <span className={`text-xs font-semibold truncate ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                {roleDef.title}
                              </span>
                            </div>
                            {isDefault && (
                              <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-zinc-950 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-zinc-950" />
                                <span>Default</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {roleDef.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: DEFAULT LANDING ROLE & DESCRIPTION */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Default Landing Workspace *</span>
                  </label>
                  <select
                    value={formDefaultRole}
                    onChange={(e) => setFormDefaultRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-medium"
                  >
                    {AVAILABLE_ROLES.filter((r) => formAllowedRoles.includes(r.role)).map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.badge} — {r.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    The module screen this employee will immediately open upon logging in.
                  </span>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-semibold">
                    Administrative Notes & Authorization Scope
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Cleared for high-elevation surveys, laser measurements, and commercial rate adjustments."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditingAccount ? 'Save Roles & Credentials' : 'Create Staff Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

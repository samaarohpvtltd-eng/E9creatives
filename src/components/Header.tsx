import React, { useState } from 'react';
import {
  UserRole,
  ProjectLead,
  UserAccount,
  Invoice,
  Quotation,
} from '../types.ts';
import {
  Briefcase,
  Ruler,
  Palette,
  Factory,
  Wrench,
  MessageSquare,
  Receipt,
  FileSpreadsheet,
  Sliders,
  Play,
  Square,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Users,
  Lock,
  Sun,
  Moon,
  RotateCcw as ResetIcon,
} from 'lucide-react';
import { formatElapsedTime } from '../utils/crmLogic.ts';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTimer: {
    isRunning: boolean;
    projectId: string;
    elapsedSeconds: number;
    designerName: string;
  };
  projects: ProjectLead[];
  onToggleTimer: () => void;
  onOpenTimerModal: () => void;
  onResetData?: () => void;
  currentUser: UserAccount;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onResetTimer?: () => void;
  invoices?: Invoice[];
  quotations?: Quotation[];
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activeTimer,
  projects,
  onToggleTimer,
  onOpenTimerModal,
  currentUser,
  onOpenAuthModal,
  onLogout,
  theme,
  onToggleTheme,
  onResetTimer,
  invoices = [],
  quotations = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeProject = projects.find((p) => p.id === activeTimer.projectId);

  // Compute live operational counts for navigation indicators
  const pendingSurveyCount = projects.filter((p) => p.stage === 'site_measurement').length;
  const activeArtworkCount = projects.filter((p) => p.stage === 'design').length;
  const inProductionCount = projects.filter((p) => p.stage === 'production').length;
  const inInstallationCount = projects.filter((p) => p.stage === 'installation').length;
  const unpaidInvoicesCount = invoices.filter((i) => i.status !== 'paid').length;
  const openQuotesCount = quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length;

  const navGroups: {
    category: string;
    items: {
      id: UserRole;
      label: string;
      icon: React.ReactNode;
      count?: number;
    }[];
  }[] = [
    {
      category: 'Commercial & Finance',
      items: [
        {
          id: 'executive',
          label: 'Executive Overview',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'sales',
          label: 'Sales & CRM Ledger',
          icon: <Briefcase className="w-4 h-4 shrink-0" />,
          count: projects.length,
        },
        {
          id: 'quotation',
          label: 'Commercial Quotations',
          icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
          count: openQuotesCount > 0 ? openQuotesCount : undefined,
        },
        {
          id: 'invoicing',
          label: 'GST Tax Invoicing',
          icon: <Receipt className="w-4 h-4 shrink-0" />,
          count: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
        },
      ],
    },
    {
      category: 'Operations & Field',
      items: [
        {
          id: 'project_manager',
          label: 'Site Surveys & CAD',
          icon: <Ruler className="w-4 h-4 shrink-0" />,
          count: pendingSurveyCount > 0 ? pendingSurveyCount : undefined,
        },
        {
          id: 'design',
          label: 'Design Studio',
          icon: <Palette className="w-4 h-4 shrink-0" />,
          count: activeArtworkCount > 0 ? activeArtworkCount : undefined,
        },
        {
          id: 'production',
          label: 'Production & QC',
          icon: <Factory className="w-4 h-4 shrink-0" />,
          count: inProductionCount > 0 ? inProductionCount : undefined,
        },
        {
          id: 'installation',
          label: 'Site Handover',
          icon: <Wrench className="w-4 h-4 shrink-0" />,
          count: inInstallationCount > 0 ? inInstallationCount : undefined,
        },
      ],
    },
    {
      category: 'Administration',
      items: [
        {
          id: 'chat',
          label: 'Project Audit Log',
          icon: <MessageSquare className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'admin_panel',
          label: 'Master Rate Card',
          icon: <Sliders className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Section: Corporate Monogram + Categorized Navigation */}
      <div className="space-y-5">
        {/* Brand Identity Lockup */}
        <div className="px-2 pb-3.5 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-mono font-bold text-xs tracking-tighter shrink-0">
              E9
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-zinc-100">
                  E9 GRAPHICS
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                Architectural Signage Ops
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categorized Navigation List */}
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.category} className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {group.category}
              </div>

              <nav className="space-y-0.5" aria-label={group.category}>
                {group.items.map((item) => {
                  const isAllowed = currentUser.allowedRoles.includes(item.id);
                  const isActive = currentRole === item.id;

                  if (!isAllowed) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onOpenAuthModal();
                          setMobileMenuOpen(false);
                        }}
                        title="Requires departmental clearance"
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectRole(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/80 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={isActive ? 'text-white dark:text-zinc-900' : 'text-slate-400 dark:text-zinc-500'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.count !== undefined && (
                        <span
                          className={`font-mono text-[11px] tabular-nums ${
                            isActive
                              ? 'text-slate-300 dark:text-zinc-600'
                              : 'text-slate-400 dark:text-zinc-500'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Flat Hairline Job Timer + Operator Strip */}
      <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 space-y-3 mt-auto">
        {/* Compact CAD Job Timer Strip */}
        <div className="px-2 py-2 rounded-md bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Studio Job Clock</span>
            <button
              type="button"
              onClick={() => {
                onOpenTimerModal();
                setMobileMenuOpen(false);
              }}
              className="font-medium text-slate-700 dark:text-zinc-300 hover:underline cursor-pointer"
            >
              Timesheet
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {formatElapsedTime(activeTimer.elapsedSeconds)}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleTimer}
                title={activeTimer.isRunning ? 'Pause Job Clock' : 'Resume Job Clock'}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                  activeTimer.isRunning
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200'
                }`}
              >
                {activeTimer.isRunning ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>
              {onResetTimer && (
                <button
                  type="button"
                  onClick={onResetTimer}
                  title="Reset Job Clock"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <ResetIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {activeProject && (
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-1 font-mono">
              {activeProject.leadCode} · {activeProject.clientName}
            </p>
          )}
        </div>

        {/* Active Operator Profile Row */}
        <div className="px-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-[11px] font-mono font-semibold shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {currentUser.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              title="Switch Operator"
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-mono font-bold text-xs">
            E9
          </div>
          <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
            E9 Graphics ERP
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Offcanvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 p-4 flex flex-col z-50"
            aria-label="Mobile Navigation"
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Left-Docked Navigation Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 min-h-screen sticky top-0 h-screen overflow-y-auto py-4 px-3 z-30"
        aria-label="Main Application Navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
};

import React from 'react';
import { ProjectLead, UserRole } from '../types.ts';
import { ProjectAnalyticsSummary } from './ProjectAnalyticsSummary.tsx';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface ExecutiveDashboardProps {
  projects: ProjectLead[];
  onSelectRole: (role: UserRole) => void;
  onSelectProject: (projectId: string, targetRole: UserRole) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  projects,
  onSelectRole,
  onSelectProject,
}) => {
  const totalPipelineValue = projects.reduce(
    (acc, curr) => acc + (curr.estimatedValue || 0),
    0
  );

  const wonProjects = projects.filter((p) => p.enquiryStatus === 'won');
  const wonRevenueValue = wonProjects.reduce(
    (acc, curr) => acc + (curr.estimatedValue || 0),
    0
  );
  const lostProjects = projects.filter((p) => p.enquiryStatus === 'lost');

  const productionCount = projects.filter((p) => p.stage === 'production').length;
  const installationCount = projects.filter(
    (p) => p.stage === 'installation' || p.stage === 'completed'
  ).length;

  const winRatePercent =
    projects.length > 0 ? Math.round((wonProjects.length / projects.length) * 100) : 0;

  // Urgent operational bottlenecks
  const actionItems: {
    id: string;
    projectId: string;
    leadCode: string;
    clientName: string;
    title: string;
    role: UserRole;
    departmentLabel: string;
    severity: 'CRITICAL' | 'PENDING';
    desc: string;
  }[] = [];

  for (const p of projects) {
    if (p.stage === 'site_measurement' && !p.siteMeasurement?.inChargeName) {
      actionItems.push({
        id: `act-${p.id}-sm`,
        projectId: p.id,
        leadCode: p.leadCode,
        clientName: p.clientName,
        title: 'Site Survey Lead Unassigned',
        role: 'project_manager',
        departmentLabel: 'Site Survey',
        severity: 'CRITICAL',
        desc: 'Assign field surveyor to capture laser wall elevations prior to final quotation ratification.',
      });
    }
    if (p.designInfo?.moreTimeRequested && !p.designInfo.moreTimeRequested.salesApproved) {
      actionItems.push({
        id: `act-${p.id}-dt`,
        projectId: p.id,
        leadCode: p.leadCode,
        clientName: p.clientName,
        title: `CAD Timeline Extension (+${p.designInfo.moreTimeRequested.requestedDays}d)`,
        role: 'design',
        departmentLabel: 'CAD Studio',
        severity: 'CRITICAL',
        desc: p.designInfo.moreTimeRequested.reason,
      });
    }
    if (p.productionOrder && p.productionOrder.qcStatus === 'pending') {
      actionItems.push({
        id: `act-${p.id}-qc-pend`,
        projectId: p.id,
        leadCode: p.leadCode,
        clientName: p.clientName,
        title: `Factory QC Inspection Pending (${p.productionOrder.producedQuantity}/${p.productionOrder.poTotalQuantity} ${p.productionOrder.unit})`,
        role: 'production',
        departmentLabel: 'Production Floor',
        severity: 'PENDING',
        desc: `PO ${p.productionOrder.poNumber} requires batch completion and QC clearance prior to waybill dispatch.`,
      });
    }
    if (p.productionOrder && p.productionOrder.qcStatus === 're_production_required') {
      actionItems.push({
        id: `act-${p.id}-qc`,
        projectId: p.id,
        leadCode: p.leadCode,
        clientName: p.clientName,
        title: 'QC Defect Flagged — Reprint Required',
        role: 'production',
        departmentLabel: 'Production Floor',
        severity: 'CRITICAL',
        desc: 'Color banding / substrate defect flagged by QC inspector. Re-run batch on flatbed printer.',
      });
    }
    if (
      p.installationHandover &&
      !p.installationHandover.preInstallationChecklist.surfacesClean
    ) {
      actionItems.push({
        id: `act-${p.id}-inst`,
        projectId: p.id,
        leadCode: p.leadCode,
        clientName: p.clientName,
        title: 'Pre-Installation 5-Point Verification Incomplete',
        role: 'installation',
        departmentLabel: 'Site Fit-Out',
        severity: 'PENDING',
        desc: 'Mandatory dust-free and moisture verification checklist pending from lead site applicator.',
      });
    }
  }

  const stageLabel = (stage: ProjectLead['stage']) => {
    switch (stage) {
      case 'enquiry':
        return '01 · Commercial Enquiry';
      case 'site_measurement':
        return '02 · Site Laser Survey';
      case 'design':
        return '03 · CAD & Proofing';
      case 'production':
        return '04 · Print & Fabrication';
      case 'installation':
        return '05 · Site Fit-Out';
      case 'completed':
        return '06 · Handed Over';
    }
  };

  const stageTargetRole = (stage: ProjectLead['stage']): UserRole => {
    switch (stage) {
      case 'enquiry':
        return 'sales';
      case 'site_measurement':
        return 'project_manager';
      case 'design':
        return 'design';
      case 'production':
        return 'production';
      case 'installation':
      case 'completed':
        return 'installation';
    }
  };

  return (
    <div className="space-y-6">
      {/* Structured 4-Column Enterprise Metric Strip (1px Hairline Divided) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Gross Pipeline Valuation</span>
            <span className="font-mono text-[10px] uppercase">FY26-27</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5 font-mono tabular-nums">
            ₹{totalPipelineValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono tabular-nums">
            {projects.length} active corporate accounts
          </p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Contracted Order Book (Won)</span>
            <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {winRatePercent}% Win Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5 font-mono tabular-nums">
            ₹{wonRevenueValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono tabular-nums">
            {wonProjects.length} ratified purchase orders
          </p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Active Floor & Site Execution</span>
            <span className="font-mono text-[10px] uppercase">WIP</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5 font-mono tabular-nums">
            {productionCount + installationCount} <span className="text-sm font-normal text-slate-500">Orders</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono tabular-nums">
            {productionCount} print floor · {installationCount} on-site crew
          </p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Lost / Archived Bids</span>
            <span className="font-mono text-[10px] uppercase">AUDIT</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5 font-mono tabular-nums">
            {lostProjects.length} <span className="text-sm font-normal text-slate-500">Enquiries</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Post-bid competitor variance logged
          </p>
        </div>
      </div>

      {/* Departmental Valuation & Stage Matrix */}
      <ProjectAnalyticsSummary
        projects={projects}
        onSelectDepartment={onSelectRole}
      />

      {/* Live Master Project Register Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
              Active Corporate Project Register
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              End-to-end operational ledger from commercial enquiry to site handover sign-off
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectRole('sales')}
            className="text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Full CRM Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-3.5">Job Code</th>
                <th className="py-2.5 px-3.5">Client & Project Scope</th>
                <th className="py-2.5 px-3.5">Site Location</th>
                <th className="py-2.5 px-3.5">Execution Stage</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Valuation (INR)</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-zinc-800/70">
              {projects.map((p) => {
                const targetRole = stageTargetRole(p.stage);
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.id, targetRole)}
                    className="hover:bg-slate-50/90 dark:hover:bg-zinc-800/40 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3.5 font-mono text-[11px] font-medium text-slate-600 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                      {p.leadCode}
                    </td>
                    <td className="py-2.5 px-3.5 max-w-[240px]">
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">{p.clientName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {p.projectName}
                      </p>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 dark:text-zinc-400 max-w-[180px] truncate">
                      {p.location}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                      {stageLabel(p.stage)}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-mono font-medium uppercase ${
                          p.enquiryStatus === 'won'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : p.enquiryStatus === 'lost'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {p.enquiryStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100 whitespace-nowrap tabular-nums">
                      ₹{(p.estimatedValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p.id, targetRole);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split: Operational Bottlenecks & Lost Bid Variance Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operational Escalations & Bottlenecks */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                Operational Escalations & Action Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pending sign-offs, unassigned site surveys, and factory QC holds
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
              {actionItems.length} Open Tasks
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {actionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectProject(item.projectId, item.role)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer transition flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase ${
                        item.severity === 'CRITICAL'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      [{item.severity}]
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">{item.leadCode}</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      {item.clientName} — {item.title}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 text-[11px]">{item.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(item.projectId, item.role);
                  }}
                  className="px-2.5 py-1 border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[11px] rounded font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{item.departmentLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Post-Bid Loss Audit */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                Commercial Loss Variance Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Mandatory post-bid audit for unaccepted quotations
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono tabular-nums">
              {lostProjects.length} Records
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-zinc-800 max-h-[320px] overflow-y-auto">
            {lostProjects.map((lp) => (
              <div key={lp.id} className="p-4 text-xs space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{lp.leadCode}</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{lp.clientName}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">
                    ₹{(lp.estimatedValue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  {lp.lossReason?.explanation || 'Commercial terms not ratified by client procurement.'}
                </p>
                {lp.lossReason?.competitorName && (
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-mono">
                    <span>Awarded Vendor: {lp.lossReason.competitorName}</span>
                    <span>{lp.lossReason.loggedAt?.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

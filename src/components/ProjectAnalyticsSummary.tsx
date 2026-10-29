import React, { useState } from 'react';
import { ProjectLead, UserRole } from '../types.ts';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface ProjectAnalyticsSummaryProps {
  projects: ProjectLead[];
  onSelectDepartment?: (role: UserRole) => void;
}

export const ProjectAnalyticsSummary: React.FC<ProjectAnalyticsSummaryProps> = ({
  projects,
  onSelectDepartment,
}) => {
  const [metricMode, setMetricMode] = useState<'value' | 'count'>('value');

  // Authoritative Enterprise Slate & Cobalt Palette (Zero Rainbow Clutter)
  const departmentBreakdown = [
    {
      department: '1. Commercial Enquiry & Estimating',
      shortName: 'Enquiry',
      code: 'SLS',
      role: 'sales' as UserRole,
      color: '#475569', // Slate 600
      projects: projects.filter((p) => p.stage === 'enquiry'),
    },
    {
      department: '2. Site Laser Survey & Elevations',
      shortName: 'Site Survey',
      code: 'SRV',
      role: 'project_manager' as UserRole,
      color: '#334155', // Slate 700
      projects: projects.filter((p) => p.stage === 'site_measurement'),
    },
    {
      department: '3. CAD Studio & Client Proofs',
      shortName: 'CAD Studio',
      code: 'CAD',
      role: 'design' as UserRole,
      color: '#1e40af', // Deep Cobalt 800
      projects: projects.filter((p) => p.stage === 'design'),
    },
    {
      department: '4. Print Floor & CNC Fabrication',
      shortName: 'Production',
      code: 'PRD',
      role: 'production' as UserRole,
      color: '#0f172a', // Slate 900
      projects: projects.filter((p) => p.stage === 'production'),
    },
    {
      department: '5. Site Installation & Handover',
      shortName: 'Site Fit-Out',
      code: 'INS',
      role: 'installation' as UserRole,
      color: '#047857', // Emerald 700
      projects: projects.filter(
        (p) => p.stage === 'installation' || p.stage === 'completed'
      ),
    },
  ];

  const chartData = departmentBreakdown.map((dept) => {
    const totalValue = dept.projects.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
    return {
      name: dept.shortName,
      code: dept.code,
      fullName: dept.department,
      role: dept.role,
      count: dept.projects.length,
      value: Math.round(totalValue / 1000), // In Thousands ₹
      rawTotalValue: totalValue,
      color: dept.color,
      projectList: dept.projects.map((p) => p.clientName),
    };
  });

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-md shadow-lg text-xs space-y-1.5 max-w-xs">
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-zinc-800">
            <span className="font-semibold text-slate-900 dark:text-zinc-100">{data.fullName}</span>
            <span className="font-mono text-[10px] text-slate-400">{data.code}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-zinc-300">
            <span>Active Orders:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">{data.count}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-zinc-300">
            <span>Stage Valuation:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              ₹{data.rawTotalValue.toLocaleString('en-IN')}
            </span>
          </div>
          {data.projectList.length > 0 && (
            <div className="pt-1 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500">
              <p className="truncate">{data.projectList.join(', ')}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-5 space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
            Departmental Work-in-Progress & Valuation
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Capital allocation and active work orders across the 5-stage architectural execution pipeline
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-0.5 rounded border border-slate-200 dark:border-zinc-800 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode('value')}
            className={`px-2.5 py-1 rounded-xs font-medium transition cursor-pointer ${
              metricMode === 'value'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Valuation (₹k)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('count')}
            className={`px-2.5 py-1 rounded-xs font-medium transition cursor-pointer ${
              metricMode === 'count'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Order Volume
          </button>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-[230px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -16, bottom: 12 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedRole = state.activePayload[0].payload.role as UserRole;
                if (onSelectDepartment) onSelectDepartment(clickedRole);
              }
            }}
            className="cursor-pointer"
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="currentColor"
              className="text-slate-200 dark:text-zinc-800"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="currentColor"
              className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium"
              tickLine={false}
              axisLine={{ stroke: 'currentColor', className: 'text-slate-200 dark:text-zinc-800' }}
            />
            <YAxis
              stroke="currentColor"
              className="text-[10px] text-slate-400 font-mono"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{ fill: 'currentColor', className: 'text-slate-100/70 dark:text-zinc-800/40' }}
            />
            <Bar
              dataKey={metricMode === 'count' ? 'count' : 'value'}
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  onClick={() => onSelectDepartment && onSelectDepartment(entry.role)}
                  className="transition-opacity duration-150 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hairline Stage Matrix Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border border-slate-200 dark:border-zinc-800 rounded divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50">
        {chartData.map((dept, idx) => (
          <button
            key={dept.name}
            type="button"
            onClick={() => onSelectDepartment && onSelectDepartment(dept.role)}
            className="p-3 text-left hover:bg-slate-100/80 dark:hover:bg-zinc-900 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
              <span>STAGE 0{idx + 1}</span>
              <span>{dept.code}</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 group-hover:text-slate-950 dark:group-hover:text-white">
              {dept.name}
            </p>
            <div className="flex items-baseline justify-between mt-1.5 pt-1.5 border-t border-slate-200/70 dark:border-zinc-800/80 font-mono text-xs tabular-nums">
              <span className="font-bold text-slate-900 dark:text-zinc-100">{dept.count} jobs</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                ₹{(dept.rawTotalValue / 1000).toFixed(0)}k
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

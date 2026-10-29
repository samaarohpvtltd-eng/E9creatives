import React, { useState } from 'react';
import {
  ProjectLead,
  DesignVersion,
  DesignerTimesheetEntry,
} from '../types.ts';
import { ARCHITECTURAL_ASSETS } from '../utils/blueprintAssets.ts';
import {
  Palette,
  Clock,
  Play,
  Square,
  AlertCircle,
  Download,
  CheckCircle2,
  ArrowRight,
  Plus,
  Send,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { formatElapsedTime } from '../utils/crmLogic.ts';

interface DesignModuleProps {
  projects: ProjectLead[];
  timesheetEntries: DesignerTimesheetEntry[];
  activeTimer: {
    isRunning: boolean;
    projectId: string;
    elapsedSeconds: number;
    designerName: string;
  };
  onUpdateProject: (updated: ProjectLead) => void;
  onAddTimesheetEntry: (entry: DesignerTimesheetEntry) => void;
  onToggleTimer: (projectId?: string) => void;
  onHandoffToProduction: (projectId: string) => void;
}

const DESIGNERS = [
  'Priya Sen (Visual Lead)',
  'Rohan Varma (3D & Wayfinding Specialist)',
  'Ananya Roy (Environmental Graphics)',
  'Kavita Nair (Signage & Production Draftsperson)',
];

export const DesignModule: React.FC<DesignModuleProps> = ({
  projects,
  timesheetEntries,
  activeTimer,
  onUpdateProject,
  onAddTimesheetEntry,
  onToggleTimer,
  onHandoffToProduction,
}) => {
  const designProjects = projects.filter(
    (p) => p.stage === 'design' || (p.designInfo && p.designInfo.versions.length > 0)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    designProjects[0]?.id || projects[0]?.id || ''
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || designProjects[0] || projects[0];

  // Modals
  const [showMoreTimeModal, setShowMoreTimeModal] = useState<boolean>(false);
  const [requestedDays, setRequestedDays] = useState<number>(3);
  const [moreTimeReason, setMoreTimeReason] = useState<string>('');

  const [showUploadVersionModal, setShowUploadVersionModal] = useState<boolean>(false);
  const [versionType, setVersionType] = useState<'moodboard' | 'presentation' | 'final_print'>('presentation');
  const [versionTitle, setVersionTitle] = useState<string>('');
  const [versionLink, setVersionLink] = useState<string>('');

  const [newComment, setNewComment] = useState<{ [versionIndex: number]: string }>({});

  const handleUpdateVersionStatus = (versionIndex: number, newStatus: 'pending' | 'changes_requested' | 'approved') => {
    if (!selectedProject || !selectedProject.designInfo) return;

    const updatedVersions = selectedProject.designInfo.versions.map((v, i) =>
      i === versionIndex ? { ...v, clientStatus: newStatus } : v
    );

    onUpdateProject({
      ...selectedProject,
      designInfo: {
        ...selectedProject.designInfo,
        versions: updatedVersions,
      },
    });

    showToast(`Updated version status to "${newStatus.replace('_', ' ')}"`);
  };

  const handleAddComment = (versionIndex: number) => {
    const text = newComment[versionIndex];
    if (!text || !text.trim() || !selectedProject?.designInfo) return;

    const commentObj = {
      id: `c-${Date.now()}`,
      author: activeTimer.designerName,
      role: 'Designer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      comment: text.trim(),
    };

    const updatedVersions = selectedProject.designInfo.versions.map((v, i) =>
      i === versionIndex ? { ...v, comments: [...(v.comments || []), commentObj] } : v
    );

    onUpdateProject({
      ...selectedProject,
      designInfo: {
        ...selectedProject.designInfo,
        versions: updatedVersions,
      },
    });

    setNewComment({ ...newComment, [versionIndex]: '' });
    showToast('Feedback comment added');
  };

  const handleCreateNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const currentVersions = selectedProject.designInfo?.versions || [];
    const nextVerNum = currentVersions.length + 1;

    const newVer: DesignVersion = {
      versionNumber: nextVerNum,
      type: versionType,
      title: versionTitle || `Revision v${nextVerNum}`,
      fileUrl:
        versionLink ||
        ARCHITECTURAL_ASSETS.glassElevationV2,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: activeTimer.designerName,
      clientStatus: 'pending',
      comments: [
        {
          id: `c-${Date.now()}`,
          author: activeTimer.designerName,
          role: 'Designer',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          comment: versionTitle || `Revision ${nextVerNum} created with adjusted color profiles and dimensions.`,
        },
      ],
      highResDownloadLink:
        'https://drive.google.com/drive/folders/sample_high_res_e9_production_archive',
    };

    const updatedDesignInfo = selectedProject.designInfo
      ? {
          ...selectedProject.designInfo,
          versions: [newVer, ...selectedProject.designInfo.versions],
        }
      : {
          designHead: 'Sameer Kulkarni (Creative Director)',
          assignedDesigner: activeTimer.designerName,
          timelineType: 'open_discussion' as const,
          versions: [newVer],
        };

    onUpdateProject({
      ...selectedProject,
      designInfo: updatedDesignInfo,
    });

    setShowUploadVersionModal(false);
    setVersionTitle('');
    setVersionLink('');
    showToast(`Uploaded Revision v${nextVerNum}`);
  };

  const handleRequestMoreTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    onUpdateProject({
      ...selectedProject,
      designInfo: {
        ...selectedProject.designInfo!,
        moreTimeRequested: {
          requestedDays,
          reason: moreTimeReason || 'Client requested structural revisions after site survey.',
          requestedAt: new Date().toISOString().split('T')[0],
          salesApproved: false,
        },
      },
    });

    setShowMoreTimeModal(false);
    setMoreTimeReason('');
    showToast(`Time extension (+${requestedDays} days) submitted to Sales & Management`);
  };

  const handleHandoff = () => {
    if (!selectedProject) return;
    const updated: ProjectLead = {
      ...selectedProject,
      stage: 'production',
      productionOrder: selectedProject.productionOrder || {
        id: `po-${selectedProject.id}`,
        poNumber: `PO-${selectedProject.leadCode}-01`,
        poTotalQuantity: 300,
        producedQuantity: 0,
        unit: 'sqft',
        prePressApproved: true,
        sampleRequested: true,
        sampleApprovedBySales: true,
        qcStatus: 'pending',
        dispatched: false,
        invoiceRequestedFromAccounts: false,
      },
    };
    onUpdateProject(updated);
    showToast('Handed off approved designs to Production Floor!');
    onHandoffToProduction(selectedProject.id);
  };

  const projectTimesheets = timesheetEntries.filter(
    (t) => t.projectId === selectedProject?.id
  );

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white border border-zinc-700 px-3.5 py-2 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Project Selector & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Design Studio & Versioning</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage artwork revisions, client approvals, and active work sessions</p>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Project:</span>
          <select
            aria-label="Select design project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.leadCode} · {p.clientName} ({p.projectName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <div className="space-y-6">
          {/* Project Summary Banner */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{selectedProject.leadCode}</span>
                <span className="text-zinc-400 dark:text-zinc-600">·</span>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{selectedProject.projectName}</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400">({selectedProject.stage.replace('_', ' ')})</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Client: <strong className="text-zinc-800 dark:text-zinc-200">{selectedProject.clientName}</strong> · Designer: {selectedProject.designInfo?.assignedDesigner || activeTimer.designerName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUploadVersionModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Revision</span>
              </button>

              <button
                type="button"
                onClick={handleHandoff}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
              >
                <span>Handoff to Production</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Time Extension Notice if Requested */}
          {selectedProject.designInfo?.moreTimeRequested && (
            <div className="p-3 bg-amber-50 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">
                    Time Extension Requested: +{selectedProject.designInfo.moreTimeRequested.requestedDays} days
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedProject.designInfo.moreTimeRequested.reason}</p>
                </div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${selectedProject.designInfo.moreTimeRequested.salesApproved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {selectedProject.designInfo.moreTimeRequested.salesApproved ? 'Sales Approved' : 'Pending Sales Approval'}
              </span>
            </div>
          )}

          {/* Section 1: Artwork Versions & Approval Cards */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Design Versions & Client Signoffs</h4>
              <button
                type="button"
                onClick={() => setShowMoreTimeModal(true)}
                className="text-xs text-amber-600 dark:text-amber-400/90 hover:underline cursor-pointer"
              >
                Request Timeline Extension
              </button>
            </div>

            {selectedProject.designInfo?.versions && selectedProject.designInfo.versions.length > 0 ? (
              <div className="space-y-4">
                {selectedProject.designInfo.versions.map((ver, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 font-mono">v{ver.versionNumber}</span>
                        <span className="text-zinc-400 dark:text-zinc-600">·</span>
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 capitalize">{ver.type.replace('_', ' ')}</span>
                        <span className="text-zinc-400 dark:text-zinc-600">·</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Uploaded {ver.uploadedAt} by {ver.uploadedBy}</span>
                      </div>

                      {/* Approval Status Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateVersionStatus(idx, 'approved')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                            ver.clientStatus === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-semibold'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Approved
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVersionStatus(idx, 'changes_requested')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                            ver.clientStatus === 'changes_requested'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 font-semibold'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Revisions Needed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVersionStatus(idx, 'pending')}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                            ver.clientStatus === 'pending'
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-semibold'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Pending
                        </button>
                      </div>
                    </div>

                    {/* Preview Image & Download Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 relative group">
                        <img src={ver.fileUrl} alt={`Version ${ver.versionNumber}`} className="w-full h-36 object-cover" />
                        {ver.highResDownloadLink && (
                          <a
                            href={ver.highResDownloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 p-1.5 rounded bg-black/70 hover:bg-black text-white text-[10px] flex items-center gap-1 transition"
                            title="Download High Res Print Package"
                          >
                            <Download className="w-3 h-3" />
                            <span>High-Res</span>
                          </a>
                        )}
                      </div>
                      <div className="sm:col-span-2 flex flex-col justify-between space-y-2">
                        {/* Comments Thread */}
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                          {ver.comments?.map((c, cIdx) => (
                            <div key={cIdx} className="text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 p-2 rounded border border-zinc-200 dark:border-zinc-800/60">
                              <span className="font-medium text-zinc-900 dark:text-zinc-200">{c.author}: </span>
                              <span>{c.comment}</span>
                              <span className="text-[10px] text-zinc-400 ml-1">({c.timestamp})</span>
                            </div>
                          ))}
                        </div>

                        {/* Quick Add Comment */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add feedback comment..."
                            value={newComment[idx] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [idx]: e.target.value })}
                            className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(idx)}
                            className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded font-medium cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">No artwork uploaded yet. Click "New Revision" to add initial design.</p>
            )}
          </div>

          {/* Section 2: Designer Timesheet Sessions */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Designer Timesheet Sessions</h4>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Logged Work: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                  {Math.round(projectTimesheets.reduce((acc, t) => acc + (t.durationSeconds || 0), 0) / 60)} mins
                </strong>
              </span>
            </div>

            {projectTimesheets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Designer</th>
                      <th className="py-2.5 px-3 font-medium">Date</th>
                      <th className="py-2.5 px-3 font-medium">Duration</th>
                      <th className="py-2.5 px-3 font-medium">Activity Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {projectTimesheets.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-200">{entry.designerName}</td>
                        <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400">{entry.date}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-400 font-medium">
                          {formatElapsedTime(entry.durationSeconds)}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{entry.activityDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-2">No stopwatch sessions saved for this project yet. Use the sidebar stopwatch to log active hours.</p>
            )}
          </div>
        </div>
      )}

      {/* Upload Revision Modal */}
      {showUploadVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Upload New Design Version</h3>
            <form onSubmit={handleCreateNewVersion} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Version Type</label>
                <select
                  value={versionType}
                  onChange={(e) => setVersionType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="moodboard">Moodboard & Concept</option>
                  <option value="presentation">Client Presentation / Mockup</option>
                  <option value="final_print">Final Print Package (High Res)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Description / Revision Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Revised logo height to 12 inches"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Preview Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="Leave blank to attach standard CAD elevation proof"
                  value={versionLink}
                  onChange={(e) => setVersionLink(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadVersionModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold cursor-pointer shadow-xs"
                >
                  Upload Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request More Time Modal */}
      {showMoreTimeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Request Timeline Extension</h3>
            <form onSubmit={handleRequestMoreTime} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Additional Days Requested</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={requestedDays}
                  onChange={(e) => setRequestedDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Justification for Client / Sales</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why extra days are needed (e.g. client brand guide delayed)..."
                  value={moreTimeReason}
                  onChange={(e) => setMoreTimeReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMoreTimeModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold cursor-pointer shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

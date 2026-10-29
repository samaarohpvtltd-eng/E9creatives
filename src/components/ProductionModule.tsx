import React, { useState } from 'react';
import {
  ProjectLead,
  ProductionOrder,
} from '../types.ts';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { validateProductionAgainstPO } from '../utils/crmLogic.ts';

interface ProductionModuleProps {
  projects: ProjectLead[];
  onUpdateProject: (updated: ProjectLead) => void;
  onHandoffToInstallation: (projectId: string) => void;
}

const QC_INSPECTORS = [
  'Devendra Patil (Senior QC Specialist)',
  'Sunil Chawla (Print Fidelity Inspector)',
  'Anita Shrestha (Color Match & Substrate QC)',
];

export const ProductionModule: React.FC<ProductionModuleProps> = ({
  projects,
  onUpdateProject,
  onHandoffToInstallation,
}) => {
  const productionQueue = projects.filter(
    (p) =>
      p.stage === 'production' ||
      p.productionOrder !== undefined ||
      (p.designInfo && p.designInfo.versions.some((v) => v.type === 'final_print'))
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    productionQueue[0]?.id || projects[0]?.id || ''
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || productionQueue[0] || projects[0];

  const [batchProduceQty, setBatchProduceQty] = useState<number>(100);
  const [qcInspector, setQcInspector] = useState<string>(QC_INSPECTORS[0]);
  const [defectNotes, setDefectNotes] = useState<string>('');
  const [showDefectModal, setShowDefectModal] = useState<boolean>(false);
  const [dispatchTracking, setDispatchTracking] = useState<string>('BLUE-DART-AIR-992384');

  const prodOrder: ProductionOrder = selectedProject?.productionOrder || {
    id: `po-${selectedProject?.id || 'demo'}`,
    poNumber: `PO-${selectedProject?.leadCode || '2026'}-01`,
    poTotalQuantity: selectedProject?.quotation?.items.reduce((acc, i) => acc + i.quantity, 0) || 500,
    producedQuantity: 0,
    unit: 'sqft',
    prePressApproved: true,
    sampleRequested: true,
    sampleApprovedBySales: true,
    qcStatus: 'pending',
    dispatched: false,
    invoiceRequestedFromAccounts: false,
  };

  const handleSalesApproveSample = () => {
    if (!selectedProject) return;
    onUpdateProject({
      ...selectedProject,
      productionOrder: {
        ...prodOrder,
        sampleRequested: true,
        sampleApprovedBySales: true,
      },
    });
    showToast('Sample print approved by Sales. Cleared for bulk machine run.');
  };

  const handleRunBatchProduction = () => {
    if (!selectedProject) return;

    const validation = validateProductionAgainstPO(
      batchProduceQty,
      prodOrder.poTotalQuantity,
      prodOrder.producedQuantity
    );

    if (!validation.isValid) {
      showToast(`Warning: Cannot produce ${batchProduceQty} units. ${validation.errorMessage || 'Exceeds PO limit'}`);
      return;
    }

    const newProducedQty = prodOrder.producedQuantity + batchProduceQty;
    onUpdateProject({
      ...selectedProject,
      productionOrder: {
        ...prodOrder,
        producedQuantity: newProducedQty,
      },
    });
    showToast(`Produced +${batchProduceQty} units. Total: ${newProducedQty}/${prodOrder.poTotalQuantity}`);
  };

  const handlePassQC = () => {
    if (!selectedProject) return;
    onUpdateProject({
      ...selectedProject,
      productionOrder: {
        ...prodOrder,
        qcStatus: 'passed',
        qcInspectorName: qcInspector,
        qcCheckedAt: new Date().toISOString().split('T')[0],
      },
    });
    showToast(`QC Certification approved by ${qcInspector}`);
  };

  const handleRejectQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    onUpdateProject({
      ...selectedProject,
      productionOrder: {
        ...prodOrder,
        qcStatus: 're_production_required',
        qcInspectorName: qcInspector,
        qcCheckedAt: new Date().toISOString().split('T')[0],
        qcDefectNotes: defectNotes || 'Color variation beyond acceptable ΔE tolerance',
      },
    });

    setShowDefectModal(false);
    setDefectNotes('');
    showToast('QC Defect logged. Marked for re-production.');
  };

  const handleDispatchOrder = () => {
    if (!selectedProject) return;
    onUpdateProject({
      ...selectedProject,
      productionOrder: {
        ...prodOrder,
        dispatched: true,
        dispatchedAt: new Date().toISOString().split('T')[0],
        dispatchTrackingNo: dispatchTracking,
      },
    });
    showToast(`Order dispatched. Tracking: ${dispatchTracking}`);
  };

  const handleHandoffToInstallationLead = () => {
    if (!selectedProject) return;
    const updated: ProjectLead = {
      ...selectedProject,
      stage: 'installation',
    };
    onUpdateProject(updated);
    showToast('Dispatched materials received by Site Installation Team!');
    onHandoffToInstallation(selectedProject.id);
  };

  const progressPercent = Math.min(
    100,
    Math.round((prodOrder.producedQuantity / Math.max(1, prodOrder.poTotalQuantity)) * 100)
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

      {/* Top Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
            <Factory className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Production Floor & QC Desk</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Monitor print quantities against PO caps, inspect samples, and clear dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Project:</span>
          <select
            aria-label="Select production project"
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
                Client: <strong className="text-zinc-800 dark:text-zinc-200">{selectedProject.clientName}</strong> · PO #{prodOrder.poNumber}
              </p>
            </div>

            <button
              type="button"
              onClick={handleHandoffToInstallationLead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs transition cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <span>Handoff to Installation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 1: Machine Production & PO Limits */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">1. Production Output & PO Cap</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">System restricts printing past approved PO quantity</p>
              </div>
              <span className="font-mono text-xs text-zinc-900 dark:text-zinc-200 font-medium">
                {prodOrder.producedQuantity} / {prodOrder.poTotalQuantity} {prodOrder.unit} ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-2.5 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div
                className="bg-amber-500 h-2.5 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Batch Run Controls */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Add Machine Run Batch:</span>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={batchProduceQty}
                  onChange={(e) => setBatchProduceQty(Number(e.target.value))}
                  className="w-24 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleRunBatchProduction}
                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
                >
                  Log Batch Run
                </button>
              </div>

              {/* Sample Test Approval */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Pre-press Sample:</span>
                {prodOrder.sampleApprovedBySales ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Sales
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSalesApproveSample}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-xs font-medium border border-amber-500/30 cursor-pointer"
                  >
                    Approve Sample Test
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: QC Desk & Quality Certification */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">2. Quality Control (QC) Desk</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Color fidelity, substrate trim bleeds, and zero-defect signoff</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Inspector:</span>
                <select
                  aria-label="Select QC inspector"
                  value={qcInspector}
                  onChange={(e) => setQcInspector(e.target.value)}
                  className="px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {QC_INSPECTORS.map((ins, idx) => (
                    <option key={idx} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Current QC Status:{' '}
                  <span className={`font-semibold capitalize ${
                    prodOrder.qcStatus === 'passed'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : prodOrder.qcStatus === 're_production_required'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {prodOrder.qcStatus.replace('_', ' ')}
                  </span>
                </p>
                {prodOrder.qcInspectorName && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Inspected by {prodOrder.qcInspectorName} on {prodOrder.qcCheckedAt}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePassQC}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Pass QC Inspection</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDefectModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium transition cursor-pointer shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Log Defect</span>
                </button>
              </div>
            </div>

            {/* Defect Log Records if any */}
            {prodOrder.qcDefectNotes && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Defect Documented:</p>
                <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs text-rose-700 dark:text-rose-300">
                  {prodOrder.qcDefectNotes}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Dispatch & Waybill Generation */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">3. Logistics Dispatch & Tracking</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Generate dispatch docket and track shipment to installation site</p>
              </div>
              {prodOrder.dispatched && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched on {prodOrder.dispatchedAt}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Carrier / Waybill No."
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleDispatchOrder}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Issue Dispatch Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defect Logging Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Log Production Defect</span>
            </h3>
            <form onSubmit={handleRejectQC} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Defect Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Scratched acrylic surface, misaligned print registration, color variance..."
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDefectModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Submit Defect & Order Re-run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ProjectLead,
  InstallationHandover,
  TaggedInstallationPhoto,
} from '../types.ts';
import { ARCHITECTURAL_ASSETS } from '../utils/blueprintAssets.ts';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Download,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { validatePreInstallationReadiness } from '../utils/crmLogic.ts';

interface InstallationModuleProps {
  projects: ProjectLead[];
  onUpdateProject: (updated: ProjectLead) => void;
}

const APPLICATOR_LEADS = [
  'Rameshwar Pal (Senior Certified 3M Installer)',
  'Suresh Yadav (Commercial Graphics Specialist)',
  'Gurpreet Singh (Signage & Structural Erector)',
  'Imran Khan (Architectural Film Applicator)',
];

export const InstallationModule: React.FC<InstallationModuleProps> = ({
  projects,
  onUpdateProject,
}) => {
  const installationQueue = projects.filter(
    (p) =>
      p.stage === 'installation' ||
      p.stage === 'completed' ||
      p.installationHandover !== undefined ||
      (p.productionOrder && p.productionOrder.dispatched)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    installationQueue[0]?.id || projects[0]?.id || ''
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || installationQueue[0] || projects[0];

  const currentHandover: InstallationHandover = selectedProject?.installationHandover || {
    assignedApplicatorLead: APPLICATOR_LEADS[0],
    crewCount: 3,
    scheduledDate: new Date().toISOString().split('T')[0],
    preInstallationChecklist: {
      surfacesClean: false,
      dustFree: false,
      storageAvailable: false,
      materialGoodCondition: false,
      materialQuantityMatches: false,
    },
    taggedPhotos: [],
    postApplicationSnagFree: false,
  };

  const [leadApplicator, setLeadApplicator] = useState<string>(
    currentHandover.assignedApplicatorLead || APPLICATOR_LEADS[0]
  );
  const [crewCount, setCrewCount] = useState<number>(currentHandover.crewCount || 3);

  // 5-point checklist state
  const [cleanSurfaces, setCleanSurfaces] = useState(
    currentHandover.preInstallationChecklist.surfacesClean
  );
  const [dustFree, setDustFree] = useState(
    currentHandover.preInstallationChecklist.dustFree
  );
  const [storageAvail, setStorageAvail] = useState(
    currentHandover.preInstallationChecklist.storageAvailable
  );
  const [materialGood, setMaterialGood] = useState(
    currentHandover.preInstallationChecklist.materialGoodCondition
  );
  const [qtyMatches, setQtyMatches] = useState(
    currentHandover.preInstallationChecklist.materialQuantityMatches
  );

  const [clientSignoffName, setClientSignoffName] = useState<string>(
    currentHandover.clientSignOffName || selectedProject?.contactPerson || ''
  );
  const [snagFreeChecked, setSnagFreeChecked] = useState<boolean>(
    currentHandover.postApplicationSnagFree || false
  );

  const readiness = validatePreInstallationReadiness({
    surfacesClean: cleanSurfaces,
    dustFree,
    storageAvailable: storageAvail,
    materialGoodCondition: materialGood,
    materialQuantityMatches: qtyMatches,
  });

  const handleSaveChecklist = () => {
    if (!selectedProject) return;

    onUpdateProject({
      ...selectedProject,
      installationHandover: {
        ...currentHandover,
        assignedApplicatorLead: leadApplicator,
        crewCount,
        preInstallationChecklist: {
          surfacesClean: cleanSurfaces,
          dustFree,
          storageAvailable: storageAvail,
          materialGoodCondition: materialGood,
          materialQuantityMatches: qtyMatches,
        },
      },
    });

    showToast('Pre-installation checklist updated');
  };

  const handleAddSampleInstalledPhoto = () => {
    if (!selectedProject) return;

    const newPhoto: TaggedInstallationPhoto = {
      id: `tip-${Date.now()}`,
      photoUrl: ARCHITECTURAL_ASSETS.installationVerificationPhoto,
      surfaceTag: 'Lobby Feature Wall - Frosted Glass & Acrylic',
      floor: '4th Floor Executive Wing',
      installedBy: leadApplicator,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    onUpdateProject({
      ...selectedProject,
      installationHandover: {
        ...currentHandover,
        taggedPhotos: [...(currentHandover.taggedPhotos || []), newPhoto],
      },
    });

    showToast('Installation photo tagged and added to handover portfolio');
  };

  const handleFinalProjectSignoff = () => {
    if (!selectedProject) return;

    if (!readiness.isReady) {
      showToast('All 5 pre-installation checks must be verified before final handover.');
      return;
    }

    onUpdateProject({
      ...selectedProject,
      stage: 'completed',
      installationHandover: {
        ...currentHandover,
        postApplicationSnagFree: true,
        clientSignOffName: clientSignoffName || 'Client Facilities Lead',
        completedAt: new Date().toISOString().split('T')[0],
      },
    });

    setSnagFreeChecked(true);
    showToast('Final Client Handover Signed & Certified Snag-Free!');
  };

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
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Site Installation & Handover</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pre-installation 5-point readiness audit, photographic records, and client signoff</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Project:</span>
          <select
            aria-label="Select installation project"
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
                Client: <strong className="text-zinc-800 dark:text-zinc-200">{selectedProject.clientName}</strong> · Lead Installer: {leadApplicator}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                readiness.isReady ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {readiness.isReady ? '5/5 Site Checks Ready' : 'Checks Pending'}
              </span>
            </div>
          </div>

          {/* Section 1: 5-Point Pre-Installation Readiness */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">1. Pre-Installation 5-Point Readiness Checklist</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Must be verified on-site before unwrapping graphics rolls</p>
              </div>
              <button
                type="button"
                onClick={handleSaveChecklist}
                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                Save Checklist
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanSurfaces}
                  onChange={(e) => setCleanSurfaces(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">1. Surfaces Clean & Dry</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">No active moisture or oils</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dustFree}
                  onChange={(e) => setDustFree(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">2. Civil Dust-Free Room</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">No ongoing sanding / masonry</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storageAvail}
                  onChange={(e) => setStorageAvail(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">3. Staging Storage Clear</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Lockable room provided</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={materialGood}
                  onChange={(e) => setMaterialGood(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">4. Material Transit Inspection</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">No creases or box crush</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qtyMatches}
                  onChange={(e) => setQtyMatches(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">5. Dispatch Quantity Matches</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Counts verified against waybill</p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Installation Photographic Handover Dossier */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">2. Installed Work Photo Dossier</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Captured on site with surface and applicator metadata</p>
              </div>
              <button
                type="button"
                onClick={handleAddSampleInstalledPhoto}
                className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Upload Installed Photo</span>
              </button>
            </div>

            {currentHandover.taggedPhotos && currentHandover.taggedPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentHandover.taggedPhotos.map((photo) => (
                  <div key={photo.id} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <img src={photo.photoUrl} alt={photo.surfaceTag} className="w-full h-32 object-cover" />
                    <div className="p-2.5 text-xs space-y-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-200 truncate">{photo.surfaceTag}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate">{photo.floor}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
                        <span>{photo.installedBy}</span>
                        <span>{photo.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">No photos uploaded yet. Upload final installation photos above.</p>
            )}
          </div>

          {/* Section 3: Snag-Free Handover Certification */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">3. Snag-Free Certificate & Client Signoff</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Formal handover certificate for final client invoice clearance</p>
              </div>
              {selectedProject.stage === 'completed' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Project Handover Completed
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Client Representative Name for Signoff"
                  value={clientSignoffName}
                  onChange={(e) => setClientSignoffName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleFinalProjectSignoff}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Certify Snag-Free Handover</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

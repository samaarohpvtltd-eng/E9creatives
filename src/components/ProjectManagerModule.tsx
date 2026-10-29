import React, { useState } from 'react';
import {
  ProjectLead,
  SiteMeasurement,
} from '../types.ts';
import { ARCHITECTURAL_ASSETS } from '../utils/blueprintAssets.ts';
import {
  Ruler,
  UserCheck,
  CheckCircle2,
  FileImage,
  ArrowRight,
  HardHat,
  Camera,
  Plus,
  Trash2,
} from 'lucide-react';

interface ProjectManagerModuleProps {
  projects: ProjectLead[];
  onUpdateProject: (updated: ProjectLead) => void;
  onHandoffToDesign: (projectId: string) => void;
}

const AVAILABLE_SITE_LEADS = [
  'Vikram Sharma (Senior Site Lead - North)',
  'Rajesh Kumar (West Region Site Head)',
  'Amitabh Bose (South Region Site Lead)',
  'Pradeep Nambiar (Technical Survey Specialist)',
];

export const ProjectManagerModule: React.FC<ProjectManagerModuleProps> = ({
  projects,
  onUpdateProject,
  onHandoffToDesign,
}) => {
  const actionQueue = projects.filter(
    (p) =>
      p.stage === 'site_measurement' ||
      p.enquiryStatus === 'site_visit_requested' ||
      p.siteMeasurement !== undefined
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    actionQueue[0]?.id || projects[0]?.id || ''
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || actionQueue[0] || projects[0];

  const [selectedInCharge, setSelectedInCharge] = useState<string>(
    selectedProject?.siteMeasurement?.inChargeName || AVAILABLE_SITE_LEADS[0]
  );

  // New dimension item form state
  const [surfaceName, setSurfaceName] = useState('');
  const [widthFeet, setWidthFeet] = useState<number>(12);
  const [heightFeet, setHeightFeet] = useState<number>(10);
  const [surfaceType, setSurfaceType] = useState('Smooth Gypsum Board (Putty finished)');

  // Surface preparation state
  const prep = selectedProject?.siteMeasurement?.surfacePrepInstructions || {
    ladderRequired: true,
    scaffoldingRequired: false,
    scaffoldingTiers: 1,
    surfaceCleaningNeeded: true,
    wallPrimerNeeded: false,
    electricalAccessNeeded: true,
    notes: '',
  };

  const [ladderReq, setLadderReq] = useState<boolean>(prep.ladderRequired);
  const [scaffoldReq, setScaffoldReq] = useState<boolean>(prep.scaffoldingRequired);
  const [scaffoldTiers, setScaffoldTiers] = useState<number>(prep.scaffoldingTiers || 1);
  const [cleanReq, setCleanReq] = useState<boolean>(prep.surfaceCleaningNeeded);
  const [primerReq, setPrimerReq] = useState<boolean>(prep.wallPrimerNeeded);
  const [elecReq, setElecReq] = useState<boolean>(prep.electricalAccessNeeded);
  const [prepNotes, setPrepNotes] = useState<string>(prep.notes || '');

  const handleAssignInCharge = () => {
    if (!selectedProject) return;
    const now = new Date().toISOString().split('T')[0];

    const currentMeasurement: SiteMeasurement = selectedProject.siteMeasurement || {
      id: `sm-${Date.now()}`,
      inChargeId: `lead-${Date.now()}`,
      inChargeName: selectedInCharge,
      assignedDate: now,
      elevationNotes: 'Detailed elevations measured per architectural floor drawings.',
      dimensions: [
        {
          surfaceName: 'Main Entrance Wall',
          widthFeet: 16.5,
          heightFeet: 10.0,
          areaSqFt: 165.0,
          surfaceType: 'Smooth Gypsum Board (Putty finished)',
        },
      ],
      surfacePrepInstructions: {
        ladderRequired: ladderReq,
        scaffoldingRequired: scaffoldReq,
        scaffoldingTiers: scaffoldTiers,
        surfaceCleaningNeeded: cleanReq,
        wallPrimerNeeded: primerReq,
        electricalAccessNeeded: elecReq,
        notes: prepNotes,
      },
      sitePhotos: [],
    };

    onUpdateProject({
      ...selectedProject,
      siteMeasurement: {
        ...currentMeasurement,
        inChargeName: selectedInCharge,
      },
    });

    showToast(`Assigned ${selectedInCharge} as Site Lead`);
  };

  const handleAddDimension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !surfaceName.trim()) return;

    const area = Number((widthFeet * heightFeet).toFixed(1));
    const newDim = {
      surfaceName,
      widthFeet: Number(widthFeet),
      heightFeet: Number(heightFeet),
      areaSqFt: area,
      surfaceType,
    };

    const currentDims = selectedProject.siteMeasurement?.dimensions || [];
    const updatedSiteMeasurement: SiteMeasurement = selectedProject.siteMeasurement
      ? {
          ...selectedProject.siteMeasurement,
          dimensions: [...currentDims, newDim],
        }
      : {
          id: `sm-${Date.now()}`,
          inChargeId: `lead-${Date.now()}`,
          inChargeName: selectedInCharge,
          assignedDate: new Date().toISOString().split('T')[0],
          elevationNotes: 'Recorded on site',
          dimensions: [newDim],
          surfacePrepInstructions: {
            ladderRequired: ladderReq,
            scaffoldingRequired: scaffoldReq,
            scaffoldingTiers: scaffoldTiers,
            surfaceCleaningNeeded: cleanReq,
            wallPrimerNeeded: primerReq,
            electricalAccessNeeded: elecReq,
            notes: prepNotes,
          },
          sitePhotos: [],
        };

    onUpdateProject({
      ...selectedProject,
      siteMeasurement: updatedSiteMeasurement,
    });

    setSurfaceName('');
    showToast(`Added elevation: ${surfaceName} (${area} sqft)`);
  };

  const handleDeleteDimension = (index: number) => {
    if (!selectedProject || !selectedProject.siteMeasurement) return;
    const updatedDims = selectedProject.siteMeasurement.dimensions.filter((_, i) => i !== index);
    onUpdateProject({
      ...selectedProject,
      siteMeasurement: {
        ...selectedProject.siteMeasurement,
        dimensions: updatedDims,
      },
    });
    showToast('Elevation removed');
  };

  const handleSavePrepInstructions = () => {
    if (!selectedProject || !selectedProject.siteMeasurement) return;

    onUpdateProject({
      ...selectedProject,
      siteMeasurement: {
        ...selectedProject.siteMeasurement,
        surfacePrepInstructions: {
          ladderRequired: ladderReq,
          scaffoldingRequired: scaffoldReq,
          scaffoldingTiers: scaffoldTiers,
          surfaceCleaningNeeded: cleanReq,
          wallPrimerNeeded: primerReq,
          electricalAccessNeeded: elecReq,
          notes: prepNotes,
        },
      },
    });
    showToast('Site preparation & scaffolding instructions saved');
  };

  const handleAddSamplePhoto = () => {
    if (!selectedProject) return;

    const newPhoto = {
      id: `sp-${Date.now()}`,
      caption: `Elevation Survey - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      url: ARCHITECTURAL_ASSETS.siteSurveyElevation,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    const currentPhotos = selectedProject.siteMeasurement?.sitePhotos || [];
    onUpdateProject({
      ...selectedProject,
      siteMeasurement: {
        ...(selectedProject.siteMeasurement || {
          id: `sm-${Date.now()}`,
          inChargeId: `lead-${Date.now()}`,
          inChargeName: selectedInCharge,
          assignedDate: new Date().toISOString().split('T')[0],
          elevationNotes: 'Recorded on site',
          dimensions: [],
          surfacePrepInstructions: prep,
          sitePhotos: [],
        }),
        sitePhotos: [...currentPhotos, newPhoto],
      },
    });
    showToast('Survey photo attached to dossier');
  };

  const handleCompleteAndHandoff = () => {
    if (!selectedProject) return;
    const updated: ProjectLead = {
      ...selectedProject,
      stage: 'design',
      siteMeasurement: selectedProject.siteMeasurement
        ? {
            ...selectedProject.siteMeasurement,
            completedDate: new Date().toISOString().split('T')[0],
          }
        : undefined,
    };
    onUpdateProject(updated);
    showToast(`Site Measurement Dossier certified. Handed off to Design Studio.`);
    onHandoffToDesign(selectedProject.id);
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

      {/* Top Project Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Site Measurements & Surveys</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Record dimensions, elevation substrates, and scaffolding safety</p>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Active Project:</span>
          <select
            aria-label="Select active project"
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
                Client: <strong className="text-zinc-800 dark:text-zinc-200">{selectedProject.clientName}</strong> · Location: {selectedProject.location}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCompleteAndHandoff}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs transition cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <span>Handoff to Design Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 1: In-Charge Allocation */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">1. Site In-Charge Assignment</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                aria-label="Assign site in-charge"
                value={selectedInCharge}
                onChange={(e) => setSelectedInCharge(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                {AVAILABLE_SITE_LEADS.map((lead, idx) => (
                  <option key={idx} value={lead}>{lead}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignInCharge}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                Assign Field Lead
              </button>
            </div>
            {selectedProject.siteMeasurement?.inChargeName && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Currently assigned: {selectedProject.siteMeasurement.inChargeName}</span>
              </p>
            )}
          </div>

          {/* Section 2: Dimension Elevation Register */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">2. Measured Dimensions & Surfaces</h4>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Total Measured Area: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                  {selectedProject.siteMeasurement?.dimensions?.reduce((acc, d) => acc + d.areaSqFt, 0) || 0} sqft
                </strong>
              </span>
            </div>

            {/* Existing Dimensions Table */}
            {selectedProject.siteMeasurement?.dimensions && selectedProject.siteMeasurement.dimensions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Surface / Wall Area</th>
                      <th className="py-2.5 px-3 font-medium">Width × Height (ft)</th>
                      <th className="py-2.5 px-3 font-medium">Area (sqft)</th>
                      <th className="py-2.5 px-3 font-medium">Substrate Type</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {selectedProject.siteMeasurement.dimensions.map((dim, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-200">{dim.surfaceName}</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-700 dark:text-zinc-300">{dim.widthFeet} ft × {dim.heightFeet} ft</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">{dim.areaSqFt} sqft</td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{dim.surfaceType}</td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteDimension(idx)}
                            className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                            title="Remove elevation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-2">No dimensions recorded yet. Add your first surface below.</p>
            )}

            {/* Quick Add Dimension Form */}
            <form onSubmit={handleAddDimension} className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Surface name (e.g. Lobby Feature Wall)"
                  value={surfaceName}
                  onChange={(e) => setSurfaceName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Width (ft)"
                  value={widthFeet}
                  onChange={(e) => setWidthFeet(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Height (ft)"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  aria-label="Substrate material"
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="Smooth Gypsum Board (Putty finished)">Smooth Gypsum Board</option>
                  <option value="Toughened Architectural Glass">Architectural Glass</option>
                  <option value="Textured Concrete / Brick">Textured Concrete / Brick</option>
                  <option value="MDF / Plywood Acoustic Panels">MDF / Acoustic Panels</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
                  title="Add dimension"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Surface Preparation & Scaffolding Checklist */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">3. Surface Preparation & Safety Equipment</h4>
              <button
                type="button"
                onClick={handleSavePrepInstructions}
                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                Save Preparation Brief
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ladderReq}
                  onChange={(e) => setLadderReq(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">A-Frame Ladder Required</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Heights under 12 ft</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scaffoldReq}
                  onChange={(e) => setScaffoldReq(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">Mobile Scaffolding</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Required for heights &gt; 12 ft</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanReq}
                  onChange={(e) => setCleanReq(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">Chemical IPA Surface Cleaning</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Dust & grease wipe</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={primerReq}
                  onChange={(e) => setPrimerReq(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">Surface Primer Required</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">High-adhesion coat</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={elecReq}
                  onChange={(e) => setElecReq(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">Electrical 220V Access</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">For heat guns & LED power</p>
                </div>
              </label>

              {scaffoldReq && (
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-700 dark:text-zinc-300">Scaffolding Tiers:</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={scaffoldTiers}
                    onChange={(e) => setScaffoldTiers(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 font-mono text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Site Photos */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">4. Site Survey Photographic Records</h4>
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Upload Elevation Photo</span>
              </button>
            </div>

            {selectedProject.siteMeasurement?.sitePhotos && selectedProject.siteMeasurement.sitePhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedProject.siteMeasurement.sitePhotos.map((photo) => (
                  <div key={photo.id} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <img src={photo.url} alt={photo.caption} className="w-full h-28 object-cover" />
                    <div className="p-2 text-[11px]">
                      <p className="text-zinc-800 dark:text-zinc-200 truncate font-medium">{photo.caption}</p>
                      <p className="text-zinc-500 text-[10px]">{photo.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">No site photos uploaded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

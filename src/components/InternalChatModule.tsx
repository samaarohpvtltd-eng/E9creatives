import React, { useState, useEffect } from 'react';
import { ProjectLead, ChatMessage, UserAccount } from '../types.ts';
import { ARCHITECTURAL_ASSETS } from '../utils/blueprintAssets.ts';
import {
  MessageSquare,
  Send,
  Paperclip,
  Globe,
  Users,
  CheckCircle2,
  X,
  FileText,
  Clock,
} from 'lucide-react';

interface InternalChatModuleProps {
  projects: ProjectLead[];
  chatMessages: ChatMessage[];
  currentUser?: UserAccount;
  onSendMessage: (msg: ChatMessage) => void;
}

export const InternalChatModule: React.FC<InternalChatModuleProps> = ({
  projects,
  chatMessages,
  currentUser,
  onSendMessage,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('dept-general');
  const [messageInput, setMessageInput] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(currentUser?.name || 'Priya Sen');
  const [senderRole, setSenderRole] = useState<string>(
    currentUser?.designationTitle || 'Visual Lead'
  );
  const [department, setDepartment] = useState<string>(currentUser?.department || 'Design');
  const [isClientVisible, setIsClientVisible] = useState<boolean>(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setSenderName(currentUser.name);
      setSenderRole(currentUser.designationTitle);
      setDepartment(currentUser.department);
    }
  }, [currentUser]);

  const departmentChannels = [
    { id: 'dept-general', name: 'general-ops', desc: 'All Company Operations & Announcements' },
    { id: 'dept-sales', name: 'sales-closures', desc: 'Quotations, PO Approvals & Client Follow-ups' },
    { id: 'dept-site', name: 'site-measurements', desc: 'Surveys, Laser Readings & Elevation Reports' },
    { id: 'dept-design', name: 'design-studio', desc: 'Artwork, Vector Prep, Proofs & Revisions' },
    { id: 'dept-production', name: 'production-qc', desc: 'Floor Print Runs, UV Curing & QC Approvals' },
    { id: 'dept-install', name: 'installation-crew', desc: 'Site Readiness, Gate Passes & Signoffs' },
  ];

  const projectChannels = projects.map((p) => ({
    id: p.id,
    name: `${p.leadCode.toLowerCase()}-${p.clientName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 12)}`,
    desc: p.projectName,
    clientName: p.clientName,
  }));

  const allChannels = [...departmentChannels, ...projectChannels];
  const activeChannel = allChannels.find((c) => c.id === selectedChannelId) || departmentChannels[0];
  const filteredMessages = chatMessages.filter((m) => m.channelId === selectedChannelId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !attachmentName) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannelId,
      senderName,
      senderRole,
      department,
      timestamp: now,
      text: messageInput.trim(),
      attachmentName: attachmentName || undefined,
      attachmentUrl: attachmentName
        ? ARCHITECTURAL_ASSETS.siteSurveyElevation
        : undefined,
      isExternalClientVisible: isClientVisible,
    };

    onSendMessage(newMsg);
    setMessageInput('');
    setAttachmentName(null);
  };

  const handleSimulateAttachFile = () => {
    const sampleFiles = [
      'elevation_cad_measurement.pdf',
      'cmyk_pantone_approval_sheet.jpg',
      'site_gate_pass_clearance.pdf',
      'client_approved_moodboard_v2.png',
      'qc_inspection_certificate.pdf',
      'structural_load_calculation.dwg',
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachmentName(picked);
  };

  return (
    <div className="space-y-4">
      {/* Top Channel Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>#{activeChannel.name}</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{activeChannel.desc}</p>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Channel:</span>
          <select
            aria-label="Select channel"
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
          >
            <optgroup label="Department Channels">
              {departmentChannels.map((c) => (
                <option key={c.id} value={c.id}>#{c.name} ({c.desc})</option>
              ))}
            </optgroup>
            <optgroup label="Project Threads">
              {projectChannels.map((c) => (
                <option key={c.id} value={c.id}>#{c.name} ({c.clientName})</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Spacious Chat Frame */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-sm">
        {/* Sub-bar with Visibility Indicator & Active Channel Meta */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className="font-mono text-[11px] font-semibold uppercase text-slate-700 dark:text-zinc-300">Audit Log Active</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{filteredMessages.length} records</span>
          </div>

          <label className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer text-[11px] select-none">
            <input
              type="checkbox"
              checked={isClientVisible}
              onChange={(e) => setIsClientVisible(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500"
            />
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>Visible to External Client Portal</span>
          </label>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs space-y-1">
              <MessageSquare className="w-8 h-8 opacity-40 mb-1 text-amber-500" />
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No messages in #{activeChannel.name} yet.</p>
              <p className="text-[11px] text-zinc-500">Post an update or attach a technical drawing below.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderName === senderName;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-xl ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 mb-0.5 px-1">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.senderRole}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{msg.timestamp}</span>
                    {msg.isExternalClientVisible && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px] bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded border border-emerald-200 dark:border-emerald-800/60">
                        Client Visible
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-xl text-xs space-y-1.5 ${
                      isMe
                        ? 'bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.attachmentName && (
                      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="underline font-mono truncate max-w-xs">{msg.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateAttachFile}
            className={`p-2 rounded-lg text-xs transition cursor-pointer ${
              attachmentName
                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
            title="Attach Architectural File"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {attachmentName && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
              <FileText className="w-3 h-3" />
              <span className="max-w-[120px] truncate font-mono text-[11px]">{attachmentName}</span>
              <button
                type="button"
                onClick={() => setAttachmentName(null)}
                className="hover:text-red-500 cursor-pointer ml-0.5"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder={
              attachmentName
                ? `Attached: ${attachmentName}. Add an explanation...`
                : `Message #${activeChannel.name}...`
            }
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
          />

          <button
            type="submit"
            disabled={!messageInput.trim() && !attachmentName}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

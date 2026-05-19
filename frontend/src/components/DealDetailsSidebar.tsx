import React, { useState, useEffect } from 'react';
import { Lead, TimelineItem, AttachmentItem } from '../types';

interface DealDetailsSidebarProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (id: string, data: any) => Promise<void>;
}

export const DealDetailsSidebar: React.FC<DealDetailsSidebarProps> = ({
  lead,
  onClose,
  onUpdateLead,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [mockUploading, setMockUploading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!lead) return null;

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteItem: TimelineItem = {
      type: 'note',
      text: `Note added: ${newNote.trim()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedTimeline = [...(lead.timeline || []), noteItem];
      await onUpdateLead(lead._id, {
        timeline: updatedTimeline,
        lastContactedAt: new Date().toISOString(),
      });
      setNewNote('');
      setIsAddingNote(false);
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };

  const logActivity = async (type: 'call' | 'email', text: string) => {
    const activityItem: TimelineItem = {
      type,
      text,
      createdAt: new Date().toISOString(),
    };
    try {
      const updatedTimeline = [...(lead.timeline || []), activityItem];
      await onUpdateLead(lead._id, {
        timeline: updatedTimeline,
        lastContactedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to log activity', err);
    }
  };

  const handleAttachMockFile = async () => {
    setMockUploading(true);
    // Simulate upload delay
    setTimeout(async () => {
      const mockFiles = [
        { name: 'Proposal_v2.pdf', size: 1024 * 350, url: '#' },
        { name: 'Pricing_Sheet.xlsx', size: 1024 * 85, url: '#' },
        { name: 'Contract_Draft.docx', size: 1024 * 120, url: '#' },
      ];
      const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      const attachmentItem: AttachmentItem = {
        name: randomFile.name,
        size: randomFile.size,
        url: randomFile.url,
      };
      
      const timelineItem: TimelineItem = {
        type: 'other',
        text: `Attached file: ${randomFile.name}`,
        createdAt: new Date().toISOString(),
      };

      try {
        const updatedAttachments = [...(lead.attachments || []), attachmentItem];
        const updatedTimeline = [...(lead.timeline || []), timelineItem];
        await onUpdateLead(lead._id, {
          attachments: updatedAttachments,
          timeline: updatedTimeline,
        });
      } catch (err) {
        console.error('Failed to attach file', err);
      } finally {
        setMockUploading(false);
      }
    }, 1000);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDaysInStage = (updatedAtStr: string) => {
    const updated = new Date(updatedAtStr);
    const diffTime = Math.abs(Date.now() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysInStage = getDaysInStage(lead.updatedAt || lead.createdAt);

  return (
    <>
      {/* Dark semi-transparent overlay */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[900] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-slate-900 border-l border-white/5 shadow-2xl z-[950] flex flex-col transition-transform duration-300 ease-out transform translate-x-0 font-sans text-gray-200">
        
        {/* Header Section */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Deal Details</h2>
            <span className="text-xs text-gray-400">Manage sales pipeline opportunity</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors duration-150"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          
          {/* Section 1: Deal Summary */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {lead.company || 'No Company Name Specified'}
                </h3>
                <span className="text-xs text-gray-400">Lead: {lead.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                lead.status === 'new' ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' :
                lead.status === 'contacted' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/50' :
                lead.status === 'qualified' ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50' :
                lead.status === 'won' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50' :
                'bg-rose-900/40 text-rose-300 border border-rose-800/50'
              }`}>
                {lead.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs text-gray-400">
              <div>
                <span className="block text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Deal Value</span>
                <span className="text-sm font-bold text-brand-400 font-mono mt-0.5 block">
                  ${lead.value ? lead.value.toLocaleString() : '0'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Days In Stage</span>
                <span className="text-sm font-semibold text-gray-200 mt-0.5 block">
                  {daysInStage} {daysInStage === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Contact Information</h4>
            <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
              {lead.title && (
                <div className="text-xs text-gray-300 font-medium">{lead.title}</div>
              )}
              <div className="flex items-center gap-2.5">
                <span className="text-gray-500">✉️</span>
                <a
                  href={`mailto:${lead.email}`}
                  onClick={() => logActivity('email', `Sent email via link to ${lead.email}`)}
                  className="text-gray-300 hover:text-brand-400 underline decoration-brand-500/30 transition-colors"
                >
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-500">☎️</span>
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={() => logActivity('call', `Started outbound call to ${lead.phone}`)}
                    className="text-gray-300 hover:text-brand-400 underline decoration-brand-500/30 transition-colors"
                  >
                    {lead.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <span className="text-gray-500">📍 Source:</span>
                <span className="capitalize">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Next Steps / Logging Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Next Actions</h4>
            
            {lead.nextAction && (
              <div className="bg-brand-500/10 border border-brand-500/30 p-3 rounded-lg text-xs font-medium text-brand-300 flex items-center justify-between">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-brand-400/80 font-bold mb-0.5">Target Milestone</span>
                  <span>{lead.nextAction}</span>
                </div>
                <span className="text-base">⏰</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  const num = lead.phone || 'Contact';
                  logActivity('call', `Logged a manual voice call with ${lead.name}`);
                  window.open(`tel:${num}`);
                }}
                className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 rounded-lg text-white font-semibold border border-white/5 transition-all"
              >
                <span>☎️</span> Log Call
              </button>
              <button
                onClick={() => {
                  logActivity('email', `Logged email outreach sent to ${lead.name}`);
                  window.open(`mailto:${lead.email}`);
                }}
                className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 rounded-lg text-white font-semibold border border-white/5 transition-all"
              >
                <span>✉️</span> Log Email
              </button>
              <button
                onClick={() => setIsAddingNote(true)}
                className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-brand-600/20 hover:bg-brand-600/35 border border-brand-500/30 text-brand-300 rounded-lg font-semibold transition-all"
              >
                <span>📝</span> Add Custom Note
              </button>
            </div>

            {/* Note form */}
            {isAddingNote && (
              <form onSubmit={handleAddNoteSubmit} className="space-y-2 animate-fade-in">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter notes about this client..."
                  className="w-full text-xs bg-slate-950 border border-white/10 rounded-lg p-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  rows={3}
                />
                <div className="flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-3 py-1.5 bg-transparent hover:bg-white/5 text-gray-400 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 4: Attachments */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Attachments</h4>
              <button
                onClick={handleAttachMockFile}
                disabled={mockUploading}
                className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 disabled:opacity-40"
              >
                {mockUploading ? 'Uploading...' : '+ Attach File'}
              </button>
            </div>
            
            <div className="space-y-2">
              {!lead.attachments || lead.attachments.length === 0 ? (
                <div className="text-xs text-gray-500 italic p-3 text-center bg-slate-950/10 rounded-lg border border-dashed border-white/5">
                  No files attached to this deal.
                </div>
              ) : (
                lead.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-950/30 rounded-lg border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2 max-w-[70%] truncate">
                      <span className="text-base text-gray-400">📄</span>
                      <div>
                        <div className="font-semibold text-gray-300 truncate">{file.name}</div>
                        <div className="text-[10px] text-gray-500">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      className="text-brand-400 hover:text-brand-300 underline font-semibold"
                      download
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Timeline Activity History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Activity Audit Timeline</h4>
            <div className="relative border-l border-white/10 ml-2.5 pl-4 space-y-4 text-xs">
              {!lead.timeline || lead.timeline.length === 0 ? (
                <div className="text-gray-500 italic">No activity logs recorded.</div>
              ) : (
                [...(lead.timeline || [])].reverse().map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon */}
                    <span className={`absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full border border-slate-900 flex items-center justify-center text-[9px] ${
                      item.type === 'creation' ? 'bg-blue-500 text-white' :
                      item.type === 'stage_change' ? 'bg-indigo-500 text-white' :
                      item.type === 'call' ? 'bg-green-500 text-white' :
                      item.type === 'email' ? 'bg-yellow-500 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {item.type === 'creation' ? '➕' :
                       item.type === 'stage_change' ? '⟷' :
                       item.type === 'call' ? '📞' :
                       item.type === 'email' ? '✉️' : '📝'}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-300">{item.text}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
export default DealDetailsSidebar;

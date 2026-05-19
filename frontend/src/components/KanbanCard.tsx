import React, { useState, useRef } from 'react';
import { Lead } from '../types';

interface KanbanCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateLead: (id: string, data: any) => Promise<void>;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onContextMenu: (e: React.MouseEvent, lead: Lead) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  lead,
  isSelected,
  onSelect,
  onUpdateLead,
  onDragStart,
  onDragEnd,
  onContextMenu,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Health Calculation:
  // Green: last contact < 7 days
  // Yellow: last contact 7-14 days
  // Red: last contact > 14 days
  const getHealthColor = () => {
    const lastContact = new Date(lead.lastContactedAt || lead.updatedAt || lead.createdAt);
    const diffTime = Math.abs(Date.now() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return { text: 'Healthy', color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400' };
    if (diffDays <= 14) return { text: 'At Risk', color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400' };
    return { text: 'Critical', color: 'bg-red-500', textClass: 'text-red-650 dark:text-red-400' };
  };

  const health = getHealthColor();

  const getDaysInStage = () => {
    const updated = new Date(lead.updatedAt || lead.createdAt);
    const diffTime = Math.abs(Date.now() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysInStage = getDaysInStage();

  // Next action suggestions based on stage
  const getNextActionPlaceholder = () => {
    switch (lead.status) {
      case 'new': return 'Schedule Discovery Call ☎️';
      case 'contacted': return 'Send Proposal 📎';
      case 'qualified': return 'Negotiate Terms 🤝';
      default: return 'Follow Up 🔔';
    }
  };

  const nextActionLabel = lead.nextAction || getNextActionPlaceholder();

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onUpdateLead(lead._id, { starred: !lead.starred });
    } catch (err) {
      console.error('Failed to star/unstar lead', err);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onUpdateLead(lead._id, { pinned: !lead.pinned });
    } catch (err) {
      console.error('Failed to pin/unpin lead', err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!scheduleDate) return;

    const scheduleStr = `${scheduleDate} ${scheduleTime ? `at ${scheduleTime}` : ''}`;
    const activityText = `Scheduled event: "${nextActionLabel}" for ${scheduleStr}`;
    
    try {
      const updatedTimeline = [
        ...(lead.timeline || []),
        {
          type: 'other',
          text: activityText,
          createdAt: new Date().toISOString(),
        }
      ];

      await onUpdateLead(lead._id, {
        nextAction: `${nextActionLabel} (Scheduled: ${scheduleStr})`,
        timeline: updatedTimeline,
        lastContactedAt: new Date().toISOString(),
      });
      setShowCalendar(false);
    } catch (err) {
      console.error('Failed to schedule action', err);
    }
  };

  // Click handler to display stage timeline history popup
  const handleStageHistoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHistory(!showHistory);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead._id)}
      onDragEnd={onDragEnd}
      onContextMenu={(e) => onContextMenu(e, lead)}
      onClick={onSelect}
      className={`relative w-full md:w-[260px] min-h-[200px] p-4 rounded-xl border select-none transition-all duration-200 cursor-grab active:cursor-grabbing text-slate-800 dark:text-gray-200 ${
        isSelected
          ? 'bg-brand-100/50 border-brand-550 dark:bg-brand-500/15 dark:border-brand-500/60 shadow-lg shadow-brand-550/10'
          : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:border-white/5 dark:hover:border-brand-500/20 shadow-sm hover:shadow-md dark:shadow-none'
      }`}
    >
      {/* Pinned Ribbon Indicator */}
      {lead.pinned && (
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-brand-500 rounded-tr-xl rounded-bl-lg flex items-center justify-center text-[8px] text-slate-950 font-bold z-10">
          📌
        </span>
      )}

      {/* Header: Health Dot + Title */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${health.color}`}
          title={`Health: ${health.text}`}
        />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate flex-1" title={lead.company || lead.name}>
          {lead.company || 'No Company Name'}
        </h4>
      </div>

      {/* Contact Name & Title */}
      <div className="text-xs text-slate-600 dark:text-gray-300 mb-1 leading-normal font-medium truncate">
        {lead.name} {lead.title ? `, ${lead.title}` : ''}
      </div>

      {/* Email / Phone Links */}
      <div className="text-[11px] text-slate-500 dark:text-gray-400 space-y-0.5 mb-3.5 border-b border-slate-100 dark:border-white/5 pb-2.5 font-sans">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-slate-400 dark:text-gray-500 shrink-0">✉️</span>
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition-colors truncate"
          >
            {lead.email}
          </a>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-400 dark:text-gray-500 shrink-0">☎️</span>
            <a
              href={`tel:${lead.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition-colors truncate"
            >
              {lead.phone}
            </a>
          </div>
        )}
      </div>

      {/* Deal Value */}
      <div className="mb-2">
        <span className="text-[10px] text-slate-550 dark:text-gray-500 font-bold uppercase tracking-wider block leading-none">Deal Value</span>
        <span className="text-lg font-bold text-brand-650 dark:text-brand-350 font-mono tracking-tight">
          ${lead.value ? lead.value.toLocaleString() : '0'}
        </span>
      </div>

      {/* Days in Stage */}
      <div className="mb-3 relative">
        <button
          onClick={handleStageHistoryClick}
          className={`text-[10px] flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-300 font-medium transition-colors ${
            daysInStage > 14 ? 'text-red-500 dark:text-red-400' : daysInStage > 7 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-gray-400'
          }`}
        >
          <span>Days in Stage:</span>
          <span className="font-bold underline decoration-dotted">{daysInStage} days</span>
          <span>ℹ️</span>
        </button>

        {/* Floating history popup */}
        {showHistory && (
          <div className="absolute left-0 bottom-6 z-20 w-52 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 shadow-2xl text-[10px] text-slate-700 dark:text-gray-300 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-1">Stage Log History</div>
            <div className="max-h-24 overflow-y-auto space-y-1 pt-1">
              {lead.timeline?.filter(t => t.type === 'stage_change').length === 0 ? (
                <div className="italic text-gray-500">Created: {new Date(lead.createdAt).toLocaleDateString()}</div>
              ) : (
                lead.timeline
                  ?.filter(t => t.type === 'stage_change')
                  .map((t, i) => (
                    <div key={i} className="flex justify-between gap-1 text-[9px]">
                      <span className="truncate">{t.text}</span>
                      <span className="text-gray-500 shrink-0">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next Action Trigger */}
      <div className="mb-3 border-t border-slate-100 dark:border-white/5 pt-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendar(!showCalendar);
          }}
          className="text-[11px] font-medium text-brand-650 dark:text-brand-350 hover:text-brand-800 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-500/5 px-2 py-1 rounded-md border border-brand-200 dark:border-brand-500/20 w-full text-left truncate flex items-center justify-between"
        >
          <span className="truncate">{nextActionLabel}</span>
          <span className="shrink-0 text-xs">⏰</span>
        </button>

        {/* Schedule Overlay Popup */}
        {showCalendar && (
          <div
            ref={calendarRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-4 right-4 bottom-14 z-30 bg-white dark:bg-slate-950 border border-brand-200 dark:border-brand-500/30 rounded-xl p-3 shadow-2xl text-xs space-y-2 animate-fade-in text-slate-800 dark:text-gray-200"
          >
            <h5 className="font-bold text-slate-900 dark:text-white text-[11px] border-b border-slate-100 dark:border-white/5 pb-1">Schedule Milestone</h5>
            <form onSubmit={handleScheduleSubmit} className="space-y-2 text-[10px]">
              <div>
                <label className="block text-slate-500 dark:text-gray-400 mb-0.5">Date</label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-white/10 rounded px-1.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-gray-400 mb-0.5">Time (Optional)</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-white/10 rounded px-1.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex gap-1.5 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-brand-600 text-white rounded font-bold hover:bg-brand-700"
                >
                  Set Date
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer: Quick Action Buttons */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 mt-2">
        <div className="flex items-center gap-1.5">
          {/* Pin Button */}
          <button
            onClick={handleTogglePin}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs ${
              lead.pinned ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-gray-500'
            }`}
            title={lead.pinned ? 'Unpin card' : 'Pin card to top'}
          >
            {lead.pinned ? '📌' : '⬆️'}
          </button>
          
          {/* Star Button */}
          <button
            onClick={handleToggleStar}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs ${
              lead.starred ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-gray-500'
            }`}
            title={lead.starred ? 'Unstar deal' : 'Star deal'}
          >
            {lead.starred ? '⭐' : '☆'}
          </button>
        </div>

        {/* More Options Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, lead);
          }}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-800 dark:text-gray-505 dark:hover:text-white transition-colors"
          title="More actions"
        >
          <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

    </div>
  );
};
export default KanbanCard;

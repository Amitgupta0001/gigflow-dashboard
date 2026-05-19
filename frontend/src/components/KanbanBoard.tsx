import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateLead: (id: string, data: any) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onAddLeadToStage: (status: LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
  onContextMenu: (e: React.MouseEvent, lead: Lead) => void;
  activeColIndex?: number;
  activeCardIndex?: number;
}

interface ColumnConfig {
  id: LeadStatus;
  title: string;
  emoji: string;
  bgTint: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'new', title: 'NEW', emoji: '📘', bgTint: 'hover:bg-slate-200/30 dark:hover:bg-blue-950/10' },
  { id: 'contacted', title: 'CONTACTED', emoji: '💬', bgTint: 'hover:bg-slate-200/30 dark:hover:bg-yellow-950/10' },
  { id: 'qualified', title: 'QUALIFIED', emoji: '✅', bgTint: 'hover:bg-slate-200/30 dark:hover:bg-green-950/10' },
  { id: 'won', title: 'WON', emoji: '🎁', bgTint: 'hover:bg-slate-200/30 dark:hover:bg-emerald-950/10' },
  { id: 'lost', title: 'LOST', emoji: '❌', bgTint: 'hover:bg-slate-200/30 dark:hover:bg-rose-950/10' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onUpdateLead,
  onDeleteLead,
  onEditLead,
  onAddLeadToStage,
  onSelectLead,
  onContextMenu,
  activeColIndex = 0,
  activeCardIndex = -1,
}) => {
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  
  // Mobile swipe navigation state
  const [activeMobileColIdx, setActiveMobileColIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Sync mobile active column with keyboard index
  useEffect(() => {
    setActiveMobileColIdx(activeColIndex);
  }, [activeColIndex]);

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gf_kanban_collapsed');
      if (stored) {
        setCollapsedColumns(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleCollapse = (columnId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = {
      ...collapsedColumns,
      [columnId]: !collapsedColumns[columnId],
    };
    setCollapsedColumns(updated);
    localStorage.setItem('gf_kanban_collapsed', JSON.stringify(updated));
  };

  // HTML5 Drag and Drop events
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual styling to the element being dragged
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.4';
    target.classList.add('rotate-[2deg]');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.classList.remove('rotate-[2deg]');
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedOverColumn !== columnId) {
      setDraggedOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return;

    if (lead.status !== targetStatus) {
      try {
        await onUpdateLead(leadId, { status: targetStatus });
      } catch (err) {
        console.error('Failed to move lead status', err);
      }
    }
  };

  // Mobile Swipe Gestures Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    const isLeftSwipe = diff > 60;
    const isRightSwipe = diff < -60;

    if (isLeftSwipe) {
      setActiveMobileColIdx((prev) => Math.min(prev + 1, COLUMNS.length - 1));
    } else if (isRightSwipe) {
      setActiveMobileColIdx((prev) => Math.max(prev - 1, 0));
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="flex flex-col flex-1 w-full gap-4">
      
      {/* Mobile Column Navigation Header Pills */}
      <div className="flex md:hidden items-center justify-between overflow-x-auto bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 gap-1.5 scrollbar-none shrink-0 select-none">
        {COLUMNS.map((col, idx) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          const isActive = idx === activeMobileColIdx;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileColIdx(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-200/60 dark:bg-white/5 text-slate-650 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <span>{col.emoji}</span>
              <span>{col.title}</span>
              <span className="opacity-70">({colLeads.length})</span>
            </button>
          );
        })}
      </div>

      {/* Main Canvas Grid */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 grid grid-flow-col auto-cols-max md:auto-cols-fr gap-4 overflow-x-auto pb-4 scrollbar-none select-none min-h-[70vh]"
      >
        {COLUMNS.map((col, idx) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          const isCollapsed = collapsedColumns[col.id];
          const isOver = draggedOverColumn === col.id;
          const isColActive = idx === activeColIndex;
          
          const mobileHiddenClass = idx === activeMobileColIdx ? 'flex' : 'hidden md:flex';

          if (isCollapsed) {
            // Collapsed Vertical Column View
            return (
              <div
                key={col.id}
                onClick={(e) => toggleCollapse(col.id, e)}
                className={`w-14 shrink-0 bg-slate-55 dark:bg-slate-950/20 border rounded-xl p-3 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200 ${
                  isColActive 
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/5 ring-1 ring-brand-500/20' 
                    : 'border-slate-200 dark:border-white/5 hover:border-brand-500/25 hover:bg-slate-100 dark:hover:bg-slate-950/45'
                } ${mobileHiddenClass}`}
                title="Click to expand column"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{col.emoji}</span>
                  <span className="bg-brand-100 dark:bg-brand-500/20 text-brand-650 dark:text-brand-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 shrink-0">
                    {colLeads.length}
                  </span>
                </div>
                <div
                  className="font-bold text-slate-550 dark:text-gray-400 tracking-wider text-[11px] whitespace-nowrap uppercase transform rotate-90 origin-center translate-y-16"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {col.title}
                </div>
              </div>
            );
          }

          // Full Expanded Column view
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[285px] shrink-0 bg-slate-50/70 dark:bg-slate-950/25 rounded-xl border flex flex-col transition-all duration-200 ${col.bgTint} ${
                isColActive
                  ? 'border-brand-500 ring-1 ring-brand-500/30 bg-slate-100/50 dark:bg-slate-900/20'
                  : isOver
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/5 shadow-2xl scale-[1.01]'
                  : 'border-slate-200 dark:border-white/5'
              } ${mobileHiddenClass}`}
            >
              
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-100/80 dark:bg-slate-950/30 sticky top-0 z-10 rounded-t-xl select-none">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base shrink-0">{col.emoji}</span>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-white tracking-wider truncate uppercase">
                    {col.title}
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-200 dark:bg-white/5 text-slate-650 dark:text-gray-400 px-2 py-0.5 rounded-full shrink-0">
                    {colLeads.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Collapse Toggle */}
                  <button
                    onClick={(e) => toggleCollapse(col.id, e)}
                    className="text-slate-450 hover:text-slate-850 dark:text-gray-500 dark:hover:text-white transition-colors text-xs font-semibold p-1 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded"
                    title="Collapse Stage Column"
                  >
                    ⟷
                  </button>
                </div>
              </div>

              {/* Card deck scrollable container */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 max-h-[64vh] scrollbar-thin select-none">
                {colLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-450 dark:text-gray-500 px-4">
                    <span className="text-2xl mb-1.5">🎉</span>
                    <p className="text-[11px] font-medium">Stage is empty</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-600 mt-0.5">Looking good, no items here!</p>
                  </div>
                ) : (
                  colLeads.map((lead, cardIdx) => (
                    <KanbanCard
                      key={lead._id}
                      lead={lead}
                      isSelected={isColActive && cardIdx === activeCardIndex}
                      onSelect={() => onSelectLead(lead)}
                      onUpdateLead={onUpdateLead}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onContextMenu={onContextMenu}
                    />
                  ))
                )}
              </div>

              {/* Add Deal Button footer */}
              <div className="p-2 border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/15 rounded-b-xl">
                <button
                  onClick={() => onAddLeadToStage(col.id)}
                  className="w-full py-2 border border-dashed border-brand-500/20 hover:border-brand-500/40 bg-brand-500/5 hover:bg-brand-500/10 text-brand-650 dark:text-brand-300 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5"
                >
                  <span>+</span> Add Deal to {col.title}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
export default KanbanBoard;

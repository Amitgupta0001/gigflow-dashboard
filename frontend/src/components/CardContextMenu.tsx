import React, { useEffect, useRef } from 'react';
import { Lead } from '../types';

interface CardContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCall: () => void;
  onEmail: () => void;
  onAddNote: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onReassign: () => void;
  onAttach: () => void;
  onDelete: () => void;
  lead: Lead;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  x,
  y,
  onClose,
  onCall,
  onEmail,
  onAddNote,
  onViewDetails,
  onEdit,
  onReassign,
  onAttach,
  onDelete,
  lead,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Adjust menu position if it overflows the window boundaries
  const adjustPosition = () => {
    let finalX = x;
    let finalY = y;
    const menuWidth = 240;
    const menuHeight = 360;

    if (x + menuWidth > window.innerWidth) {
      finalX = window.innerWidth - menuWidth - 16;
    }
    if (y + menuHeight > window.innerHeight) {
      finalY = window.innerHeight - menuHeight - 16;
    }
    return { left: `${Math.max(16, finalX)}px`, top: `${Math.max(16, finalY)}px` };
  };

  const menuStyle = adjustPosition();

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', ...menuStyle }}
      className="z-[1000] w-60 bg-slate-950/95 border border-brand-500/30 rounded-xl p-2 shadow-2xl backdrop-blur-md animate-fade-in text-gray-200"
    >
      <div className="px-3 py-1.5 text-xs font-semibold text-brand-400 border-b border-white/5 truncate max-w-full">
        {lead.company || lead.name}
      </div>

      <div className="flex flex-col mt-1.5 gap-0.5">
        <button
          onClick={() => {
            onCall();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">☎️</span>
          <span>Call Contact</span>
        </button>

        <button
          onClick={() => {
            onEmail();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">✉️</span>
          <span>Send Email</span>
        </button>

        <button
          onClick={() => {
            onAddNote();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">📝</span>
          <span>Add Note</span>
        </button>

        <div className="h-px bg-white/5 my-1" />

        <button
          onClick={() => {
            onViewDetails();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">👁️</span>
          <span>View Details</span>
        </button>

        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">✏️</span>
          <span>Edit Deal</span>
        </button>

        <div className="h-px bg-white/5 my-1" />

        <button
          onClick={() => {
            onReassign();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">👤</span>
          <span>Reassign Rep</span>
        </button>

        <button
          onClick={() => {
            onAttach();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-brand-500/15 hover:text-brand-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">📁</span>
          <span>Attach Files</span>
        </button>

        <div className="h-px bg-white/5 my-1" />

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-150"
        >
          <span className="text-base">🗑️</span>
          <span>Delete Deal</span>
        </button>
      </div>
    </div>
  );
};
export default CardContextMenu;

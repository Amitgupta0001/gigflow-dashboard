import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="badge-new">New</span>;
      case 'contacted':
        return <span className="badge-contacted">Contacted</span>;
      case 'qualified':
        return <span className="badge-qualified">Qualified</span>;
      case 'lost':
        return <span className="badge-lost">Lost</span>;
      default:
        return <span className="badge-new">{status}</span>;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      onDelete(lead._id);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/lead/${lead._id}`)}
      className="card hover:border-brand-500/50 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 relative group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors duration-200">
            {lead.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate max-w-[180px]">{lead.email}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {getStatusBadge(lead.status)}
          <span className="badge-source capitalize">{lead.source}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-800/80 mt-4">
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(lead.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}
            className="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-gray-800 rounded-lg transition-all"
            title="Edit Lead"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
            title="Delete Lead"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LeadCard;

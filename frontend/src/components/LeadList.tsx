import React from 'react';
import { Lead, Pagination } from '../types';
import LeadCard from './LeadCard';
import LoadingSpinner from './LoadingSpinner';

interface LeadListProps {
  leads: Lead[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadList: React.FC<LeadListProps> = ({
  leads,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (loading && leads.length === 0) {
    return <LoadingSpinner message="Retrieving leads..." />;
  }

  if (leads.length === 0) {
    return (
      <div className="card text-center py-16 flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-gray-800/50 rounded-full border border-gray-700">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No leads found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            Try adjusting your status, source, search term, or create a brand new lead to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <LeadCard
            key={lead._id}
            lead={lead}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-800/80 pt-6">
          <div className="text-xs text-gray-400 font-medium">
            Showing Page <span className="text-white font-semibold">{pagination.page}</span> of{' '}
            <span className="text-white font-semibold">{pagination.pages}</span> (Total{' '}
            <span className="text-white font-semibold">{pagination.total}</span> leads)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-30"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  pagination.page === p
                    ? 'bg-brand-600 text-white border-brand-500'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeadList;

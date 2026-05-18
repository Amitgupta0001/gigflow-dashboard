import React, { useState, useEffect, useRef } from 'react';
import { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClear,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const isInitialMount = useRef(true);

  // Debounced search term effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const handler = setTimeout(() => {
      onFilterChange({ search: searchTerm });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Sync state if filters cleared from parent
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Calculate active filter count
  const activeCount = [
    filters.status,
    filters.source,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="card space-y-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name or email..."
            className="input pl-10"
          />
        </div>

        {/* Dropdowns group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="input cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="w-full sm:w-44">
            <select
              value={filters.source || ''}
              onChange={(e) => onFilterChange({ source: e.target.value })}
              className="input cursor-pointer"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="w-full sm:w-44">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as 'latest' | 'oldest' })}
              className="input cursor-pointer"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="btn-secondary py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default FilterBar;

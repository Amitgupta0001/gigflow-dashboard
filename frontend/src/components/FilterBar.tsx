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
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Local state for ranges to avoid immediate re-fetches
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [stuckDays, setStuckDays] = useState(filters.stuckDays || '');

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

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Sync state if filters cleared from parent
  useEffect(() => {
    setSearchTerm(filters.search || '');
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
    setStuckDays(filters.stuckDays || '');
  }, [filters.search, filters.minPrice, filters.maxPrice, filters.stuckDays]);

  const handleApplyRanges = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      stuckDays: stuckDays || undefined,
    });
  };

  const handleClearRanges = () => {
    setMinPrice('');
    setMaxPrice('');
    setStuckDays('');
    onFilterChange({
      minPrice: undefined,
      maxPrice: undefined,
      stuckDays: undefined,
    });
  };

  // Calculate active filter count
  const activeCount = [
    filters.status,
    filters.source,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.stuckDays,
    filters.starred ? 'starred' : null,
    filters.pinned ? 'pinned' : null,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-lg flex flex-col gap-4 text-slate-800 dark:text-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-gray-500">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search deals by company, contact name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-900 dark:text-gray-100 rounded-lg text-sm placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all duration-150"
          />
        </div>

        {/* Dropdowns group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-700 dark:text-gray-200 rounded-lg text-xs cursor-pointer focus:outline-none focus:border-brand-500"
            >
              <option value="">All Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="w-full sm:w-40">
            <select
              value={filters.source || ''}
              onChange={(e) => onFilterChange({ source: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-700 dark:text-gray-200 rounded-lg text-xs cursor-pointer focus:outline-none focus:border-brand-500"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="w-full sm:w-40">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as 'latest' | 'oldest' })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 text-slate-700 dark:text-gray-200 rounded-lg text-xs cursor-pointer focus:outline-none focus:border-brand-500"
            >
              <option value="latest">Latest deals</option>
              <option value="oldest">Oldest deals</option>
            </select>
          </div>

          {/* Advanced Filter Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all duration-150 ${
              showAdvanced
                ? 'bg-brand-50 text-brand-650 border-brand-300 dark:bg-brand-600/20 dark:text-brand-300 dark:border-brand-500/50'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10'
            }`}
          >
            <span>⚙️</span>
            <span>Filters</span>
          </button>

          {/* Clear Filters Button */}
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-500/20 flex items-center gap-1.5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* Advanced Collapsible Filter Drawer */}
      {showAdvanced && (
        <form
          onSubmit={handleApplyRanges}
          className="border-t border-slate-200 dark:border-white/5 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in text-xs text-slate-650 dark:text-gray-400"
        >
          {/* Deal Value Range */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-slate-800 dark:text-white">Deal Size ($ value)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-slate-400 dark:text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Stalled Days */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-slate-800 dark:text-white">Days in Stage</span>
            <input
              type="number"
              placeholder="Stuck > X days"
              value={stuckDays}
              onChange={(e) => setStuckDays(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Checkboxes (Starred & Pinned) */}
          <div className="flex items-center gap-5 mt-auto pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!filters.starred}
                onChange={(e) => onFilterChange({ starred: e.target.checked || undefined })}
                className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-brand-600 focus:ring-brand-500 dark:border-white/10 dark:bg-slate-950"
              />
              <span className="text-slate-700 dark:text-gray-300">⭐ Starred Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!filters.pinned}
                onChange={(e) => onFilterChange({ pinned: e.target.checked || undefined })}
                className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-brand-600 focus:ring-brand-500 dark:border-white/10 dark:bg-slate-950"
              />
              <span className="text-slate-700 dark:text-gray-300">📌 Pinned Only</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end mt-auto pb-1 md:col-start-4">
            <button
              type="button"
              onClick={handleClearRanges}
              className="px-3 py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 rounded-lg font-semibold"
            >
              Reset ranges
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold shadow-sm dark:shadow-none"
            >
              Apply Ranges
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
export default FilterBar;

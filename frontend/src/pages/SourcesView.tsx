import React from 'react';
import { Lead } from '../types';

interface SourcesViewProps {
  leads: Lead[];
}

const SOURCES = ['website', 'instagram', 'referral'] as const;

const SourcesView: React.FC<SourcesViewProps> = ({ leads }) => {
  const getSourceDealsCount = (src: string): number =>
    leads.filter(l => l.source === src).length;

  const getSourceDealsValue = (src: string): number =>
    leads
      .filter(l => l.source === src)
      .reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SOURCES.map(src => {
          const count = getSourceDealsCount(src);
          const value = getSourceDealsValue(src);
          return (
            <div
              key={src}
              className="bg-white dark:bg-[#131929]/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                  Source Category
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 capitalize">
                  {src}
                </h4>
              </div>
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-gray-400">
                  <span>Active Deals</span>
                  <span className="font-bold">{count}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-gray-400">
                  <span>Total Value</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-350">
                    ${value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SourcesView;

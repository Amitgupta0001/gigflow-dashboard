import React from 'react';
import { Lead } from '../types';

interface ReportsViewProps {
  leads: Lead[];
}

const SOURCES = ['website', 'instagram', 'referral'] as const;

const ReportsView: React.FC<ReportsViewProps> = ({ leads }) => {
  const totalPipelineValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const avgDealSize = leads.length ? Math.round(totalPipelineValue / leads.length) : 0;
  const wonLeads = leads.filter(l => l.status === 'won');
  const lostLeads = leads.filter(l => l.status === 'lost');
  const wonRevenue = wonLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const winRateDenominator = wonLeads.length + lostLeads.length;
  const winRate = winRateDenominator
    ? Math.round((wonLeads.length / winRateDenominator) * 100)
    : 0;

  const getStagePercentage = (status: string): number => {
    const count = leads.filter(l => l.status === status).length;
    return leads.length ? Math.round((count / leads.length) * 100) : 0;
  };

  const getSourceStats = (): Record<string, { count: number; value: number }> => {
    const sourceMap: Record<string, { count: number; value: number }> = {};
    SOURCES.forEach(s => {
      sourceMap[s] = { count: 0, value: 0 };
    });
    leads.forEach(l => {
      const src = l.source || 'website';
      if (!sourceMap[src]) sourceMap[src] = { count: 0, value: 0 };
      sourceMap[src].count += 1;
      sourceMap[src].value += l.value || 0;
    });
    return sourceMap;
  };

  const sourceStats = getSourceStats();
  const topDeals = [...leads]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 3);

  const stageColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-amber-500',
    qualified: 'bg-emerald-500',
    won: 'bg-brand-500',
    lost: 'bg-red-500',
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-gray-200">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Total Pipeline</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${totalPipelineValue.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-500 dark:text-gray-500 block mt-2">Sum of all active opportunities</span>
        </div>

        <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Avg Deal Value</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            ${avgDealSize.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-500 dark:text-gray-500 block mt-2">Average value per lead</span>
        </div>

        <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Won Revenue</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            ${wonRevenue.toLocaleString()}
          </div>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-500 block mt-2">Total closed-won deals</span>
        </div>

        <div className="bg-white dark:bg-[#131929]/50 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Win Rate</span>
          <div className="text-xl sm:text-2xl font-black text-brand-600 dark:text-brand-300 mt-2 font-mono">
            {winRate}%
          </div>
          <span className="text-[9px] text-slate-500 dark:text-gray-500 block mt-2">Won / (Won + Lost) deals ratio</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline stage breakdown */}
        <div className="bg-white dark:bg-[#131929]/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pipeline Conversion Stage</h3>
          <div className="space-y-4 pt-2">
            {(['new', 'contacted', 'qualified', 'won', 'lost'] as const).map(stage => {
              const pct = getStagePercentage(stage);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-slate-700 dark:text-gray-300">{stage}</span>
                    <span className="text-slate-700 dark:text-gray-300">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${stageColors[stage]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top deals + source breakdown */}
        <div className="bg-white dark:bg-[#131929]/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-none space-y-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Top Value Deal Opportunities</h3>
          <div className="space-y-3.5 pt-1">
            {topDeals.map((deal, idx) => (
              <div
                key={deal._id || idx}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5 rounded-xl"
              >
                <div className="truncate flex-1 pr-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {deal.company || deal.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-500 capitalize">
                    {deal.status} stage • {deal.source}
                  </div>
                </div>
                <div className="text-sm font-black text-brand-600 dark:text-brand-350 font-mono">
                  ${deal.value?.toLocaleString()}
                </div>
              </div>
            ))}
            {topDeals.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-500 italic">
                No deals active to highlight.
              </div>
            )}
          </div>

          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-white/5">
            Pipeline by Source Channel
          </h3>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {Object.entries(sourceStats).map(([src, stat]) => (
              <div
                key={src}
                className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase truncate">{src}</span>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-black">
                    ${stat.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-gray-500">{stat.count} deals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

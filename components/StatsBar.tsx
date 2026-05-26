'use client';

import { sourceLabel, sourceBadgeColor } from '@/lib/utils';

interface Props {
  total: number;
  allTotal: number;
  sources: { name: string; count: number }[];
  loading: boolean;
}

export default function StatsBar({ total, allTotal, sources, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex-none">
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-32 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex-none flex items-center gap-3 overflow-x-auto">
      <span className="text-sm text-slate-600 whitespace-nowrap flex-none">
        <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>
        {total !== allTotal && (
          <span className="text-slate-400"> of {allTotal.toLocaleString()}</span>
        )}{' '}
        jobs found
      </span>

      {sources.length > 0 && (
        <>
          <span className="text-slate-300 flex-none">|</span>
          <div className="flex gap-1.5 flex-none">
            {sources.map((s) => (
              <span
                key={s.name}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceBadgeColor(s.name)}`}
              >
                {sourceLabel(s.name)}: {s.count}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

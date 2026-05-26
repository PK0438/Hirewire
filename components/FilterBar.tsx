'use client';

import { FilterState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Briefcase, Clock, Globe, Database } from 'lucide-react';

interface Props {
  filters: FilterState;
  onFilterChange: (patch: Partial<FilterState>) => void;
}

const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'c2c', label: 'C2C / Corp' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

const DATE_RANGES = [
  { value: 'all', label: 'Any time' },
  { value: '24h', label: 'Last 24h' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
];

const SOURCES = [
  { value: 'all', label: 'All Sources' },
  { value: 'rapidapi', label: 'Active Jobs DB' },
  { value: 'remotive', label: 'Remotive' },
  { value: 'arbeitnow', label: 'Arbeitnow' },
  { value: 'jobicy', label: 'Jobicy' },
  { value: 'themuse', label: 'The Muse' },
];

export default function FilterBar({ filters, onFilterChange }: Props) {
  const chipBase =
    'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap';
  const chipActive = 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
  const chipInactive = 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600';

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 z-10 flex-none overflow-x-auto">
      <div className="flex items-center gap-4 min-w-max">
        {/* Job type */}
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-none" />
          <div className="flex gap-1">
            {JOB_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => onFilterChange({ jobType: t.value })}
                className={cn(chipBase, filters.jobType === t.value ? chipActive : chipInactive)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 flex-none" />

        {/* Remote toggle */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-400 flex-none" />
          <div className="flex gap-1">
            {[
              { value: null, label: 'All' },
              { value: true, label: 'Remote' },
              { value: false, label: 'On-site' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => onFilterChange({ isRemote: opt.value as boolean | null })}
                className={cn(
                  chipBase,
                  filters.isRemote === opt.value ? chipActive : chipInactive
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 flex-none" />

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 flex-none" />
          <div className="flex gap-1">
            {DATE_RANGES.map((d) => (
              <button
                key={d.value}
                onClick={() => onFilterChange({ dateRange: d.value })}
                className={cn(chipBase, filters.dateRange === d.value ? chipActive : chipInactive)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 flex-none" />

        {/* Source */}
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400 flex-none" />
          <div className="flex gap-1">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                onClick={() => onFilterChange({ source: s.value })}
                className={cn(chipBase, filters.source === s.value ? chipActive : chipInactive)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

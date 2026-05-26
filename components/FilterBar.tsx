'use client';

import { FilterState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Briefcase, Clock, Globe, Database, Layers } from 'lucide-react';

interface Props {
  filters: FilterState;
  activeRole: string;
  onFilterChange: (patch: Partial<FilterState>) => void;
  onRoleSelect: (query: string) => void;
}

const ROLES = [
  { label: 'Data Engineer',        query: 'Data Engineer' },
  { label: 'Software Engineer',    query: 'Software Engineer' },
  { label: 'Full Stack',           query: 'Full Stack Developer' },
  { label: 'JavaScript Dev',       query: 'JavaScript Developer' },
  { label: 'Front End Dev',        query: 'Front End Developer' },
  { label: 'React Developer',      query: 'React Developer' },
  { label: 'Backend Engineer',     query: 'Backend Engineer' },
  { label: 'DevOps Engineer',      query: 'DevOps Engineer' },
];

const JOB_TYPES = [
  { value: 'all',         label: 'All Types' },
  { value: 'full-time',   label: 'Full-time' },
  { value: 'part-time',   label: 'Part-time' },
  { value: 'contract',    label: 'Contract' },
  { value: 'c2c',         label: 'C2C / Corp' },
  { value: 'freelance',   label: 'Freelance' },
  { value: 'internship',  label: 'Internship' },
];

const DATE_RANGES = [
  { value: 'all',   label: 'Any time' },
  { value: '24h',   label: 'Last 24h' },
  { value: 'week',  label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
];

const SOURCES = [
  { value: 'all',       label: 'All Sources' },
  { value: 'rapidapi',  label: 'Active Jobs DB' },
  { value: 'remotive',  label: 'Remotive' },
  { value: 'arbeitnow', label: 'Arbeitnow' },
  { value: 'jobicy',    label: 'Jobicy' },
  { value: 'themuse',   label: 'The Muse' },
  { value: 'remoteok',  label: 'Remote OK' },
  { value: 'adzuna',    label: 'Adzuna' },
];

export default function FilterBar({ filters, activeRole, onFilterChange, onRoleSelect }: Props) {
  const chipBase =
    'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap';
  const chipActive = 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
  const chipInactive = 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600';

  const roleChipActive = 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
  const roleChipInactive = 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700';

  return (
    <div className="bg-white border-b border-slate-200 z-10 flex-none">
      {/* Role quick-select row */}
      <div className="px-4 py-2 border-b border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex items-center gap-1.5 flex-none">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</span>
          </div>
          <div className="flex gap-1.5">
            {ROLES.map((role) => (
              <button
                key={role.query}
                onClick={() => onRoleSelect(role.query)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap',
                  activeRole === role.query ? roleChipActive : roleChipInactive
                )}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="px-4 py-2 overflow-x-auto">
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

          <div className="w-px h-5 bg-slate-200 flex-none" />

          {/* Remote toggle */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 flex-none" />
            <div className="flex gap-1">
              {([
                { value: null,  label: 'All' },
                { value: true,  label: 'Remote' },
                { value: false, label: 'On-site' },
              ] as const).map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => onFilterChange({ isRemote: opt.value })}
                  className={cn(chipBase, filters.isRemote === opt.value ? chipActive : chipInactive)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-5 bg-slate-200 flex-none" />

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

          <div className="w-px h-5 bg-slate-200 flex-none" />

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
    </div>
  );
}

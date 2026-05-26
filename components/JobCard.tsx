'use client';

import { Job } from '@/lib/types';
import { cn, timeAgo, jobTypeLabel, jobTypeBadgeColor, sourceBadgeColor, sourceLabel } from '@/lib/utils';
import { MapPin, Clock, DollarSign, Wifi } from 'lucide-react';
import Image from 'next/image';

interface Props {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

export default function JobCard({ job, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-white rounded-xl border transition-all duration-150 p-4 hover:shadow-md hover:border-indigo-200 group',
        isSelected
          ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20 bg-indigo-50/30'
          : 'border-slate-200'
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company} logo={job.logo} />

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold text-sm leading-tight truncate group-hover:text-indigo-700 transition-colors',
              isSelected ? 'text-indigo-700' : 'text-slate-900'
            )}
          >
            {job.title}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 truncate">{job.company}</p>
        </div>

        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium flex-none',
            sourceBadgeColor(job.source)
          )}
        >
          {sourceLabel(job.source)}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            jobTypeBadgeColor(job.type)
          )}
        >
          {jobTypeLabel(job.type)}
        </span>

        {job.isRemote && (
          <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700">
            <Wifi className="w-3 h-3" />
            Remote
          </span>
        )}

        <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
          <MapPin className="w-3 h-3 flex-none" />
          <span className="truncate max-w-[120px]">{job.location}</span>
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(job.postedAt)}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <DollarSign className="w-3 h-3" />
            {job.salary}
          </span>
        )}
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="text-xs text-slate-400">+{job.tags.length - 4}</span>
          )}
        </div>
      )}
    </button>
  );
}

function CompanyLogo({ name, logo }: { name: string; logo?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (logo) {
    return (
      <div className="w-10 h-10 rounded-lg border border-slate-100 bg-white flex items-center justify-center overflow-hidden flex-none">
        <Image
          src={logo}
          alt={name}
          width={40}
          height={40}
          className="object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-none',
        color
      )}
    >
      {initials}
    </div>
  );
}

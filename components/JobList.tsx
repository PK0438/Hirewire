'use client';

import { Job } from '@/lib/types';
import JobCard from './JobCard';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';

interface Props {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  selectedJobId: string | null;
  onSelectJob: (job: Job) => void;
  onRetry: () => void;
}

export default function JobList({ jobs, loading, error, selectedJobId, onSelectJob, onRetry }: Props) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">Failed to load jobs</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
          <Search className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-700">No jobs match your filters</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={job.id === selectedJobId}
          onClick={() => onSelectJob(job)}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg flex-none" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-slate-200 rounded-full w-20" />
        <div className="h-5 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-full" />
    </div>
  );
}

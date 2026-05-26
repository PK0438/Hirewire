'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Job, JobsApiResponse, FilterState } from '@/lib/types';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import JobList from '@/components/JobList';
import JobDetailPane from '@/components/JobDetailPane';
import StatsBar from '@/components/StatsBar';

const DEFAULT_FILTERS: FilterState = {
  query: 'Data Engineer',
  jobType: 'all',
  source: 'all',
  dateRange: 'all',
  isRemote: null,
};

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [inputQuery, setInputQuery] = useState('Data Engineer');
  const [apiData, setApiData] = useState<JobsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchJobs = useCallback(async (query: string, sources?: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ query });
      if (sources && sources !== 'all') params.set('sources', sources);

      const res = await fetch(`/api/jobs?${params}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data: JobsApiResponse = await res.json();
      setApiData(data);
      setSelectedJob(null);
      setDetailOpen(false);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters.query, filters.source !== 'all' ? filters.source : undefined);
  }, []);

  const handleSearch = () => {
    const updated = { ...filters, query: inputQuery };
    setFilters(updated);
    fetchJobs(inputQuery, filters.source !== 'all' ? filters.source : undefined);
  };

  const handleFilterChange = (patch: Partial<FilterState>) => {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    if ('source' in patch) {
      fetchJobs(filters.query, patch.source !== 'all' ? patch.source! : undefined);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setSelectedJob(null), 250);
  };

  const visibleJobs = getFilteredJobs(apiData?.jobs ?? [], filters);

  return (
    <div className="flex flex-col h-full">
      <Header
        query={inputQuery}
        onQueryChange={setInputQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      <StatsBar
        total={visibleJobs.length}
        allTotal={apiData?.jobs.length ?? 0}
        sources={apiData?.sources ?? []}
        loading={loading}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            detailOpen ? 'hidden md:block md:w-[420px] md:flex-none' : 'w-full'
          }`}
        >
          <JobList
            jobs={visibleJobs}
            loading={loading}
            error={error}
            selectedJobId={selectedJob?.id ?? null}
            onSelectJob={handleSelectJob}
            onRetry={() => fetchJobs(filters.query)}
          />
        </div>

        {detailOpen && selectedJob && (
          <JobDetailPane
            job={selectedJob}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}

function getFilteredJobs(jobs: Job[], filters: FilterState): Job[] {
  const q = filters.query.toLowerCase();

  return jobs.filter((job) => {
    if (
      q &&
      !job.title.toLowerCase().includes(q) &&
      !job.company.toLowerCase().includes(q) &&
      !job.description.toLowerCase().includes(q) &&
      !(job.tags ?? []).some((t) => t.toLowerCase().includes(q))
    ) {
      return false;
    }

    if (filters.jobType !== 'all' && job.type !== filters.jobType) return false;

    if (filters.isRemote === true && !job.isRemote) return false;
    if (filters.isRemote === false && job.isRemote) return false;

    if (filters.dateRange !== 'all') {
      const posted = new Date(job.postedAt).getTime();
      const now = Date.now();
      const day = 86400000;
      if (filters.dateRange === '24h' && now - posted > day) return false;
      if (filters.dateRange === 'week' && now - posted > 7 * day) return false;
      if (filters.dateRange === 'month' && now - posted > 30 * day) return false;
    }

    return true;
  });
}

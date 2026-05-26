import { Job, JobsApiResponse } from '../types';
import { fetchRapidApiJobs } from './rapidapi';
import { fetchRemotiveJobs } from './remotive';
import { fetchArbeitnowJobs } from './arbeitnow';
import { fetchJobicyJobs } from './jobicy';
import { fetchMuseJobs } from './themuse';
import { fetchRemoteOKJobs } from './remoteok';
import { fetchAdzunaJobs } from './adzuna';

export const ALL_SOURCES = ['rapidapi', 'remotive', 'arbeitnow', 'jobicy', 'themuse', 'remoteok', 'adzuna'];

export async function fetchAllJobs(
  query: string = 'Data Engineer',
  sources: string[] = ALL_SOURCES
): Promise<JobsApiResponse> {
  const fetchers: Promise<Job[]>[] = [];

  if (sources.includes('rapidapi'))  fetchers.push(fetchRapidApiJobs(query));
  if (sources.includes('remotive'))  fetchers.push(fetchRemotiveJobs(query));
  if (sources.includes('arbeitnow')) fetchers.push(fetchArbeitnowJobs(query));
  if (sources.includes('jobicy'))    fetchers.push(fetchJobicyJobs(query));
  if (sources.includes('themuse'))   fetchers.push(fetchMuseJobs(query));
  if (sources.includes('remoteok'))  fetchers.push(fetchRemoteOKJobs(query));
  if (sources.includes('adzuna'))    fetchers.push(fetchAdzunaJobs(query));

  const results = await Promise.allSettled(fetchers);

  const allJobs: Job[] = results.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : []
  );

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allJobs.filter((job) => {
    const key = job.applyUrl.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: newest first
  unique.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  const sourceCounts = new Map<string, number>();
  for (const job of unique) {
    sourceCounts.set(job.source, (sourceCounts.get(job.source) ?? 0) + 1);
  }

  return {
    jobs: unique,
    total: unique.length,
    sources: Array.from(sourceCounts.entries()).map(([name, count]) => ({
      name,
      count,
    })),
  };
}

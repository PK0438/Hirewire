import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
  company_logo?: string;
  salary_range?: string;
}

export async function fetchArbeitnowJobs(query: string = 'data engineer'): Promise<Job[]> {
  try {
    const url = 'https://arbeitnow.com/api/job-board-api?page=1';
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      console.error(`Arbeitnow error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const allJobs: ArbeitnowJob[] = data.data ?? [];

    const lower = query.toLowerCase();
    const filtered = allJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(lower) ||
        j.tags.some((t) => t.toLowerCase().includes(lower)) ||
        j.description.toLowerCase().includes(lower)
    );

    return filtered.slice(0, 30).map((job): Job => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || (job.remote ? 'Remote' : 'Unknown'),
      type: job.job_types?.length
        ? normalizeJobType(job.job_types[0])
        : 'full-time',
      isRemote: job.remote,
      description: stripHtml(job.description),
      url: job.url,
      applyUrl: job.url,
      postedAt: new Date(job.created_at * 1000).toISOString(),
      source: 'arbeitnow',
      sourceName: 'Arbeitnow',
      salary: job.salary_range || undefined,
      tags: job.tags ?? [],
      logo: job.company_logo,
    }));
  } catch (err) {
    console.error('Arbeitnow fetch failed:', err);
    return [];
  }
}

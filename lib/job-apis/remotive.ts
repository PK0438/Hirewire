import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

export async function fetchRemotiveJobs(query: string = 'data engineer'): Promise<Job[]> {
  try {
    const searchParam = encodeURIComponent(query);
    const url = `https://remotive.com/api/remote-jobs?search=${searchParam}&limit=30`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.error(`Remotive error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs: RemotiveJob[] = data.jobs ?? [];

    return jobs.map((job): Job => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      type: normalizeJobType(job.job_type),
      isRemote: true,
      description: stripHtml(job.description),
      url: job.url,
      applyUrl: job.url,
      postedAt: job.publication_date,
      source: 'remotive',
      sourceName: 'Remotive',
      salary: job.salary || undefined,
      tags: job.tags ?? [],
      logo: job.company_logo,
    }));
  } catch (err) {
    console.error('Remotive fetch failed:', err);
    return [];
  }
}

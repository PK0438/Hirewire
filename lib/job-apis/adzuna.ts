import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  category: { tag: string; label: string };
  contract_type?: string;
  contract_time?: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  latitude?: number;
  longitude?: number;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export async function fetchAdzunaJobs(query: string = 'software engineer'): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return [];
  }

  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&what=${encoded}&results_per_page=40&content-type=application/json&where=usa&sort_by=date`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.error(`Adzuna error: ${res.status}`);
      return [];
    }

    const data: AdzunaResponse = await res.json();
    const jobs = data.results ?? [];

    return jobs.map((job): Job => {
      const contractRaw = job.contract_time ?? job.contract_type ?? 'full_time';
      let salary: string | undefined;
      if (job.salary_min && job.salary_max) {
        salary = `$${Math.round(job.salary_min).toLocaleString()} – $${Math.round(job.salary_max).toLocaleString()}/yr`;
      } else if (job.salary_min) {
        salary = `From $${Math.round(job.salary_min).toLocaleString()}/yr`;
      }

      const locationStr = job.location?.display_name ?? 'United States';
      const isRemote = locationStr.toLowerCase().includes('remote');

      return {
        id: `adzuna-${job.id}`,
        title: job.title,
        company: job.company?.display_name ?? 'Unknown',
        location: locationStr,
        type: normalizeJobType(contractRaw),
        isRemote,
        description: stripHtml(job.description),
        url: job.redirect_url,
        applyUrl: job.redirect_url,
        postedAt: job.created,
        source: 'adzuna',
        sourceName: 'Adzuna',
        salary,
        tags: job.category?.label ? [job.category.label] : [],
      };
    });
  } catch (err) {
    console.error('Adzuna fetch failed:', err);
    return [];
  }
}

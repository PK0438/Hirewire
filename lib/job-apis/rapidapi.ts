import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface RapidApiJob {
  id: string;
  title: string;
  organization: string;
  organization_logo: string | null;
  url: string;
  date_posted: string;
  description_text?: string;
  description?: string;
  employment_type: string[] | string | null;
  location_type: string | null;
  locations_derived: string[];
  locations_alt_raw: string[];
  salary_raw: string | null;
  remote_derived: boolean;
}

export async function fetchRapidApiJobs(
  query: string = 'Data Engineer',
  location: string = 'United States'
): Promise<Job[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    console.warn('RAPIDAPI_KEY not set, skipping RapidAPI source');
    return [];
  }

  const encodedQuery = encodeURIComponent(`"${query}"`);
  const encodedLocation = encodeURIComponent(`"${location}" OR "United Kingdom" OR "Remote"`);
  const url = `https://active-jobs-db.p.rapidapi.com/active-ats-1h?offset=0&title_filter=${encodedQuery}&location_filter=${encodedLocation}&description_type=text`;

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`RapidAPI error: ${res.status} ${await res.text()}`);
      return [];
    }

    const data = await res.json();
    const list: RapidApiJob[] = Array.isArray(data) ? data : (data as any).jobs ?? [];

    return list.slice(0, 50).map((job, i): Job => {
      // employment_type can be string[] like ["FULL_TIME"] or a plain string
      const rawType = Array.isArray(job.employment_type)
        ? (job.employment_type[0] ?? 'full-time')
        : (job.employment_type ?? job.location_type ?? 'full-time');

      const location =
        job.locations_derived?.[0] ??
        job.locations_alt_raw?.[0] ??
        'United States';

      const description =
        job.description_text ??
        stripHtml(job.description ?? '');

      return {
        id: `rapidapi-${job.id ?? i}`,
        title: job.title ?? 'Untitled',
        company: job.organization ?? 'Unknown',
        location,
        type: normalizeJobType(rawType),
        isRemote: job.remote_derived ?? rawType.toLowerCase().includes('remote'),
        description,
        url: job.url ?? '#',
        applyUrl: job.url ?? '#',
        postedAt: job.date_posted ?? new Date().toISOString(),
        source: 'rapidapi',
        sourceName: 'Active Jobs DB',
        salary: job.salary_raw ?? undefined,
        tags: [],
        logo: job.organization_logo ?? undefined,
      };
    });
  } catch (err) {
    console.error('RapidAPI fetch failed:', err);
    return [];
  }
}

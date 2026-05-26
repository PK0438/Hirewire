import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface MonetaryAmount {
  '@type': string;
  currency?: string;
  value?: number | { minValue?: number; maxValue?: number; unitText?: string };
}

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
  salary_raw: string | MonetaryAmount | null;
  remote_derived: boolean;
}

function parseSalary(raw: string | MonetaryAmount | null | undefined): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') return raw;
  // JSON-LD MonetaryAmount object
  const currency = raw.currency ?? 'USD';
  const val = raw.value;
  if (val && typeof val === 'object' && 'minValue' in val) {
    const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
    const min = val.minValue ? fmt(val.minValue) : null;
    const max = val.maxValue ? fmt(val.maxValue) : null;
    if (min && max) return `${currency} ${min} – ${max}/yr`;
    if (min) return `From ${currency} ${min}/yr`;
    if (max) return `Up to ${currency} ${max}/yr`;
  }
  if (typeof val === 'number') return `${currency} ${Math.round(val).toLocaleString('en-US')}/yr`;
  return undefined;
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
        salary: parseSalary(job.salary_raw),
        tags: [],
        logo: job.organization_logo ?? undefined,
      };
    });
  } catch (err) {
    console.error('RapidAPI fetch failed:', err);
    return [];
  }
}

import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface MuseJob {
  id: number;
  name: string;
  short_name?: string;
  refs: { landing_page: string };
  contents: string;
  publication_date: string;
  locations: { name: string }[];
  categories: { name: string }[];
  levels: { name: string; short_name: string }[];
  company: { id: number; name: string; short_name: string };
  type?: string;
}

export async function fetchMuseJobs(query: string = 'data engineer'): Promise<Job[]> {
  try {
    const apiKey = process.env.THE_MUSE_API_KEY;
    const keyParam = apiKey ? `&api_key=${apiKey}` : '';
    const encoded = encodeURIComponent(query);
    const url = `https://www.themuse.com/api/public/jobs?query=${encoded}&page=0&descending=true${keyParam}`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.error(`The Muse error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const results: MuseJob[] = data.results ?? [];

    return results.slice(0, 25).map((job): Job => {
      const location = job.locations?.[0]?.name ?? 'United States';
      const level = job.levels?.[0]?.name ?? '';

      return {
        id: `themuse-${job.id}`,
        title: job.name,
        company: job.company?.name ?? 'Unknown',
        location,
        type: normalizeJobType(job.type ?? 'full-time'),
        isRemote: location.toLowerCase().includes('remote') || location === 'Flexible / Remote',
        description: stripHtml(job.contents),
        url: job.refs.landing_page,
        applyUrl: job.refs.landing_page,
        postedAt: job.publication_date,
        source: 'themuse',
        sourceName: 'The Muse',
        tags: job.categories?.map((c) => c.name) ?? [],
        experienceLevel: level,
      };
    });
  } catch (err) {
    console.error('The Muse fetch failed:', err);
    return [];
  }
}

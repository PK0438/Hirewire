import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface RemoteOKJob {
  slug: string;
  id: string;
  epoch: number;
  date: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  apply_url?: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
}

export async function fetchRemoteOKJobs(query: string = 'software engineer'): Promise<Job[]> {
  try {
    // RemoteOK tag search — map common queries to their tag slugs
    const tagMap: Record<string, string> = {
      'javascript': 'javascript',
      'javascript developer': 'javascript',
      'front end developer': 'front-end',
      'frontend developer': 'front-end',
      'full stack': 'full-stack',
      'full stack developer': 'full-stack',
      'software engineer': 'engineer',
      'data engineer': 'data',
      'react': 'react',
      'node': 'nodejs',
    };

    const lower = query.toLowerCase();
    const tag = Object.entries(tagMap).find(([k]) => lower.includes(k))?.[1] ?? 'engineer';

    const url = `https://remoteok.com/api?tag=${tag}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HireWire Job Board (hirewire.app)' },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`RemoteOK error: ${res.status}`);
      return [];
    }

    const data: (RemoteOKJob | { legal: string })[] = await res.json();
    // First item is always the legal notice — skip it
    const jobs = data.filter((j): j is RemoteOKJob => 'position' in j);

    // Filter strictly by position title — RemoteOK adds the search tag to ALL results
    // so tag-based filtering always returns everything
    const queryWords = lower.split(/\s+/).filter((w) => w.length > 2);
    const filtered = jobs.filter((j) => {
      const title = j.position.toLowerCase();
      return queryWords.some((w) => title.includes(w));
    });

    return (filtered.length > 0 ? filtered : jobs.slice(0, 30)).slice(0, 30).map((job): Job => {
      let salary: string | undefined;
      if (job.salary_min && job.salary_max) {
        salary = `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}/yr`;
      }

      const applyUrl = job.apply_url || job.url;

      return {
        id: `remoteok-${job.id}`,
        title: job.position,
        company: job.company,
        location: job.location || 'Remote',
        type: normalizeJobType('remote'),
        isRemote: true,
        description: stripHtml(job.description ?? ''),
        url: job.url,
        applyUrl,
        postedAt: job.date ?? new Date(job.epoch * 1000).toISOString(),
        source: 'remoteok',
        sourceName: 'Remote OK',
        salary,
        tags: job.tags ?? [],
        logo: job.company_logo || undefined,
      };
    });
  } catch (err) {
    console.error('RemoteOK fetch failed:', err);
    return [];
  }
}

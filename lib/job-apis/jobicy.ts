import { Job } from '../types';
import { normalizeJobType, stripHtml } from '../utils';

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobIndustry?: string[];
  jobType: string[];
  jobGeo: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription: string;
  pubDate: string;
  annualSalaryMin?: number;
  annualSalaryMax?: number;
  salaryCurrency?: string;
}

export async function fetchJobicyJobs(query: string = 'data engineer'): Promise<Job[]> {
  try {
    const tag = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
    const url = `https://jobicy.com/api/v2/remote-jobs?count=30&tag=${tag}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      console.error(`Jobicy error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs: JobicyJob[] = data.jobs ?? [];

    return jobs.map((job): Job => {
      let salary: string | undefined;
      if (job.annualSalaryMin && job.annualSalaryMax) {
        const currency = job.salaryCurrency ?? 'USD';
        salary = `${currency} ${job.annualSalaryMin.toLocaleString()} – ${job.annualSalaryMax.toLocaleString()}/yr`;
      }

      return {
        id: `jobicy-${job.id}`,
        title: job.jobTitle,
        company: job.companyName,
        location: job.jobGeo || 'Remote',
        type: job.jobType?.length ? normalizeJobType(job.jobType[0]) : 'full-time',
        isRemote: true,
        description: stripHtml(job.jobDescription),
        url: job.url,
        applyUrl: job.url,
        postedAt: job.pubDate,
        source: 'jobicy',
        sourceName: 'Jobicy',
        salary,
        tags: job.jobIndustry ?? [],
        logo: job.companyLogo,
        experienceLevel: job.jobLevel,
      };
    });
  } catch (err) {
    console.error('Jobicy fetch failed:', err);
    return [];
  }
}

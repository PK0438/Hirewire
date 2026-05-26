export type JobType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'c2c'
  | 'freelance'
  | 'internship'
  | 'remote'
  | 'other';

export type JobSource =
  | 'rapidapi'
  | 'remotive'
  | 'arbeitnow'
  | 'jobicy'
  | 'usajobs'
  | 'themuse';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  isRemote: boolean;
  description: string;
  url: string;
  applyUrl: string;
  postedAt: string;
  source: JobSource;
  sourceName: string;
  salary?: string;
  tags?: string[];
  logo?: string;
  experienceLevel?: string;
}

export interface JobsApiResponse {
  jobs: Job[];
  total: number;
  sources: { name: string; count: number }[];
}

export interface FilterState {
  query: string;
  jobType: string;
  source: string;
  dateRange: string;
  isRemote: boolean | null;
}

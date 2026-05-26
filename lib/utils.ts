import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { JobType } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function timeAgo(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function normalizeJobType(raw: string): JobType {
  const lower = raw.toLowerCase().replace(/[_\s-]+/g, '');
  if (lower.includes('fulltime') || lower.includes('full_time')) return 'full-time';
  if (lower.includes('parttime') || lower.includes('part_time')) return 'part-time';
  if (lower.includes('contract')) return 'contract';
  if (lower.includes('c2c') || lower.includes('corp')) return 'c2c';
  if (lower.includes('freelance')) return 'freelance';
  if (lower.includes('intern')) return 'internship';
  if (lower.includes('remote')) return 'remote';
  return 'other';
}

export function jobTypeLabel(type: JobType): string {
  const labels: Record<JobType, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'c2c': 'C2C / Corp',
    'freelance': 'Freelance',
    'internship': 'Internship',
    'remote': 'Remote',
    'other': 'Other',
  };
  return labels[type] ?? type;
}

export function jobTypeBadgeColor(type: JobType): string {
  const colors: Record<JobType, string> = {
    'full-time': 'bg-emerald-100 text-emerald-800',
    'part-time': 'bg-blue-100 text-blue-800',
    'contract': 'bg-amber-100 text-amber-800',
    'c2c': 'bg-purple-100 text-purple-800',
    'freelance': 'bg-cyan-100 text-cyan-800',
    'internship': 'bg-pink-100 text-pink-800',
    'remote': 'bg-teal-100 text-teal-800',
    'other': 'bg-gray-100 text-gray-700',
  };
  return colors[type] ?? 'bg-gray-100 text-gray-700';
}

export function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    rapidapi: 'Active Jobs DB',
    remotive: 'Remotive',
    arbeitnow: 'Arbeitnow',
    jobicy: 'Jobicy',
    usajobs: 'USA Jobs',
    themuse: 'The Muse',
  };
  return labels[source] ?? source;
}

export function sourceBadgeColor(source: string): string {
  const colors: Record<string, string> = {
    rapidapi: 'bg-indigo-100 text-indigo-700',
    remotive: 'bg-rose-100 text-rose-700',
    arbeitnow: 'bg-orange-100 text-orange-700',
    jobicy: 'bg-sky-100 text-sky-700',
    usajobs: 'bg-blue-100 text-blue-800',
    themuse: 'bg-violet-100 text-violet-700',
  };
  return colors[source] ?? 'bg-gray-100 text-gray-600';
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

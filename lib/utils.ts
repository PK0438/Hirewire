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
    remoteok: 'Remote OK',
    adzuna: 'Adzuna',
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
    remoteok: 'bg-green-100 text-green-700',
    adzuna: 'bg-yellow-100 text-yellow-700',
  };
  return colors[source] ?? 'bg-gray-100 text-gray-600';
}

// All 50 US state abbreviations + DC
const US_STATE_ABBREVS = new Set([
  'al','ak','az','ar','ca','co','ct','de','fl','ga',
  'hi','id','il','in','ia','ks','ky','la','me','md',
  'ma','mi','mn','ms','mo','mt','ne','nv','nh','nj',
  'nm','ny','nc','nd','oh','ok','or','pa','ri','sc',
  'sd','tn','tx','ut','vt','va','wa','wv','wi','wy','dc',
]);

// Phrases that explicitly indicate a non-USA country
const NON_USA_COUNTRIES = [
  'united kingdom','great britain',' uk ','( uk)','[uk]',
  'england','scotland','wales','ireland',
  'canada','australia','new zealand','india','germany',
  'france','netherlands','spain','italy','portugal',
  'sweden','norway','denmark','finland','switzerland',
  'austria','belgium','poland','brazil','argentina',
  'mexico','singapore','japan','china','south korea',
  'philippines','pakistan','bangladesh','nigeria',
  'south africa','kenya','ghana','egypt','israel',
  'turkey','russia','ukraine','romania','czech',
  'hungary','slovakia','croatia','serbia','bulgaria',
  'latvia','lithuania','estonia','malta','cyprus',
  'luxembourg','liechtenstein','monaco','andorra',
  'europe','asia','africa','latin america','emea',
];

export function isUSAOrRemote(location: string, isRemote: boolean): boolean {
  // Explicitly marked remote — always include
  if (isRemote) return true;

  const loc = location.toLowerCase().trim();

  // Remote / WFH keywords in location string
  if (
    loc.includes('remote') ||
    loc.includes('work from home') ||
    loc.includes('wfh') ||
    loc.includes('anywhere') ||
    loc.includes('worldwide') ||
    loc.includes('global') ||
    loc === '' ||
    loc === 'n/a'
  ) return true;

  // Explicit non-USA country names — reject early
  if (NON_USA_COUNTRIES.some((c) => loc.includes(c))) return false;

  // Positive USA signals
  if (
    loc.includes('united states') ||
    loc.includes(' usa') ||
    loc.includes(',usa') ||
    loc.includes('u.s.a') ||
    loc.includes('u.s.') ||
    loc.includes('america')
  ) return true;

  // Pattern: "City, ST" where ST is a 2-letter US state abbreviation
  // e.g. "Austin, TX"  "New York, NY"  "Tampa, Florida, United States"
  const stateMatch = loc.match(/,\s*([a-z]{2})\b/g);
  if (stateMatch) {
    for (const m of stateMatch) {
      const abbr = m.replace(/[,\s]/g, '').toLowerCase();
      if (US_STATE_ABBREVS.has(abbr)) return true;
    }
  }

  // Full state name in location string
  const US_STATE_NAMES = [
    'alabama','alaska','arizona','arkansas','california','colorado',
    'connecticut','delaware','florida','georgia','hawaii','idaho',
    'illinois','indiana','iowa','kansas','kentucky','louisiana',
    'maine','maryland','massachusetts','michigan','minnesota',
    'mississippi','missouri','montana','nebraska','nevada',
    'new hampshire','new jersey','new mexico','new york',
    'north carolina','north dakota','ohio','oklahoma','oregon',
    'pennsylvania','rhode island','south carolina','south dakota',
    'tennessee','texas','utah','vermont','virginia','washington',
    'west virginia','wisconsin','wyoming','washington d.c',
  ];
  if (US_STATE_NAMES.some((s) => loc.includes(s))) return true;

  // If location is ambiguous (no country signal at all), include it
  // so we don't accidentally hide legitimate remote-friendly jobs
  return true;
}

export function safeString(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  // Objects (like JSON-LD salary) should never reach React as a child
  return fallback;
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

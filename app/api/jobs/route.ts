import { NextRequest, NextResponse } from 'next/server';
import { fetchAllJobs, ALL_SOURCES } from '@/lib/job-apis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ?? 'Data Engineer';
  const sources = searchParams.get('sources')?.split(',') ?? ALL_SOURCES;

  try {
    const data = await fetchAllJobs(query, sources);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Jobs API error:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

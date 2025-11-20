import { NextResponse } from 'next/server';

const API_KEY = process.env.SERPAPI_API_KEY;
const SERP_ENDPOINT = 'https://serpapi.com/search.json';

function describeRange(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) return null;
  const diffDays =
    Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))) + 1;
  const startMonth = startDate.toLocaleString('en', { month: 'long' });
  return { diffDays, startMonth };
}

export async function GET(request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'SerpApi key is not configured.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const rangeMeta = describeRange(start, end);
  const descriptor = rangeMeta
    ? `${rangeMeta.diffDays}-day itinerary ${rangeMeta.startMonth}`
    : '3 day itinerary';

  const params = new URLSearchParams({
    engine: 'google',
    q: `${query} ${descriptor}`,
    google_domain: 'google.com',
    gl: 'us',
    hl: 'en',
    num: '3',
    api_key: API_KEY,
  });

  const response = await fetch(`${SERP_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: text }, { status: 502 });
  }

  const payload = await response.json();
  const items = (payload.organic_results || []).slice(0, 3).map((item) => ({
    title: item.title,
    snippet: item.snippet,
    link: item.link,
  }));

  return NextResponse.json({ results: items });
}

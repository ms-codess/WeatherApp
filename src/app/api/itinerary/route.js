import { NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

export async function GET(request) {
  if (!API_KEY || !ENGINE_ID) {
    return NextResponse.json({ error: 'Google search API is not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const params = new URLSearchParams({
    key: API_KEY,
    cx: ENGINE_ID,
    q: `${query} 3 day itinerary`,
    num: '3',
  });

  const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: text }, { status: 502 });
  }

  const payload = await response.json();
  const items = (payload.items || []).map((item) => ({
    title: item.title,
    snippet: item.snippet,
    link: item.link,
  }));

  return NextResponse.json({ results: items });
}

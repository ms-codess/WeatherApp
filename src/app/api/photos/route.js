import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'SERPAPI_API_KEY is not configured.' }, { status: 500 });
  }

  const params = new URLSearchParams({
    engine: 'google',
    tbm: 'isch',
    q: query,
    num: '3',
    api_key: apiKey,
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    if (!response.ok) {
      throw new Error('SerpApi request failed');
    }
    const data = await response.json();
    const image = data?.images_results?.[0]
      ? {
          thumbnail: data.images_results[0].thumbnail,
          original: data.images_results[0].original,
          context: data.images_results[0].link,
        }
      : null;
    return NextResponse.json({ image }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load photo' }, { status: 500 });
  }
}

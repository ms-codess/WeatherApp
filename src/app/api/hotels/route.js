import { NextResponse } from 'next/server';

const API_KEY = process.env.SERPAPI_API_KEY;
const ENDPOINT = 'https://serpapi.com/search.json';

export async function GET(request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'SerpApi key is not configured.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const params = new URLSearchParams({
    engine: 'google_hotels',
    q: query,
    check_in_date: searchParams.get('start') || undefined,
    check_out_date: searchParams.get('end') || undefined,
    currency: 'USD',
    api_key: API_KEY,
  });

  try {
    const response = await fetch(`${ENDPOINT}?${params.toString()}`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to load hotels.');
    }
    const payload = await response.json();
    const hotels =
      payload?.properties?.map((item) => ({
        id: item?.id || item?.name,
        name: item?.name,
        address: item?.address,
        price: item?.rate_per_night?.lowest,
        rating: item?.overall_rating,
        link: item?.link,
        thumbnail:
          item?.images?.[0] ||
          `https://source.unsplash.com/400x250/?${encodeURIComponent(`${query} hotel`)}`,
      })) ?? [];

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error('Failed to load hotels', error);
    return NextResponse.json(
      { error: error.message || 'Unable to load hotels.' },
      { status: 500 }
    );
  }
}

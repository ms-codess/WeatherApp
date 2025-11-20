import { NextResponse } from 'next/server';

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  try {
    const url = new URL(ENDPOINT);
    url.searchParams.set('name', query.trim());
    url.searchParams.set('count', '10');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'weather-trip-planner' },
    });

    if (!response.ok) {
      throw new Error('Unable to fetch suggestions.');
    }

    const payload = await response.json();
    const results =
      payload?.results?.map((item) => ({
        id: `${item.latitude},${item.longitude}`,
        label: `${item.name}${item.country ? `, ${item.country}` : ''}`,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
        admin: item.admin1,
        timezone: item.timezone,
      })) ?? [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Suggestion lookup failed', error);
    return NextResponse.json(
      { error: 'Unable to fetch suggestions.' },
      { status: 500 }
    );
  }
}

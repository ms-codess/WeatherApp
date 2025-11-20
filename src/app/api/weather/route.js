import { NextResponse } from 'next/server';
import { geocodeLocation, fetchWeather } from '../../../lib/weatherClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const location = await geocodeLocation(query);
    const weatherPayload = await fetchWeather(location.lat, location.lon);

    return NextResponse.json({
      location,
      weather: weatherPayload,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather' },
      { status: 500 }
    );
  }
}

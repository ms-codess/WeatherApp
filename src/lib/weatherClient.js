const BASE_URL =
  process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org';

const API_KEY = process.env.OPENWEATHER_API_KEY;

function requireKey() {
  if (!API_KEY) {
    throw new Error(
      'OPENWEATHER_API_KEY is missing. Please set it in your environment variables.'
    );
  }
}

async function fetchJson(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      label || error || `Request failed with status ${response.status}`
    );
  }
  return response.json();
}

function parseCoordinateQuery(input) {
  if (!input) return null;
  const match = input.trim().match(
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
  );
  if (!match) return null;

  return { lat: Number(match[1]), lon: Number(match[2]) };
}

export async function geocodeLocation(search) {
  requireKey();

  const coords = parseCoordinateQuery(search);
  if (coords) {
    return {
      ...coords,
      city: 'Unknown city',
      country: 'Unknown country',
      label: `${coords.lat}, ${coords.lon}`,
    };
  }

  const url = new URL('/geo/1.0/direct', BASE_URL);
  url.searchParams.set('q', search);
  url.searchParams.set('limit', '1');
  url.searchParams.set('appid', API_KEY);

  const results = await fetchJson(
    url.toString(),
    'Unable to find that location.'
  );

  if (!results?.length) {
    throw new Error('No matching locations found.');
  }

  const [first] = results;
  return {
    lat: first.lat,
    lon: first.lon,
    city: first.name,
    country: first.country,
    label: `${first.name}, ${first.country}`,
  };
}

export async function fetchWeather(lat, lon) {
  requireKey();

  const currentUrl = new URL('/data/2.5/weather', BASE_URL);
  currentUrl.searchParams.set('lat', lat);
  currentUrl.searchParams.set('lon', lon);
  currentUrl.searchParams.set('units', 'metric');
  currentUrl.searchParams.set('appid', API_KEY);

  const forecastUrl = new URL('/data/2.5/forecast', BASE_URL);
  forecastUrl.searchParams.set('lat', lat);
  forecastUrl.searchParams.set('lon', lon);
  forecastUrl.searchParams.set('units', 'metric');
  forecastUrl.searchParams.set('appid', API_KEY);

  const [current, forecast] = await Promise.all([
    fetchJson(currentUrl.toString(), 'Unable to load current weather.'),
    fetchJson(forecastUrl.toString(), 'Unable to load forecast.'),
  ]);

  return { current, forecast };
}

export function summarizeWeather(payload) {
  if (!payload) return {};
  const temps =
    payload.forecast?.list?.map((entry) => entry.main?.temp).filter(isFinite) ??
    [];

  const avgTemp =
    temps.length > 0
      ? temps.reduce((total, temp) => total + temp, 0) / temps.length
      : payload.current?.main?.temp ?? null;

  const minTemp =
    temps.length > 0
      ? Math.min(...temps)
      : payload.current?.main?.temp_min ?? null;

  const maxTemp =
    temps.length > 0
      ? Math.max(...temps)
      : payload.current?.main?.temp_max ?? null;

  const summaryText =
    payload.current?.weather?.[0]?.description ??
    payload.forecast?.list?.[0]?.weather?.[0]?.description ??
    null;

  return { avgTemp, minTemp, maxTemp, summaryText };
}

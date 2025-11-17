const BASE_URL =
  process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org';

const API_KEY =
  process.env.OPENWEATHER_API_KEY ||
  process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
  process.env.WEATHER_API_KEY;

function requireKey() {
  if (!API_KEY) {
    throw new Error(
      'Weather API key is missing. Set OPENWEATHER_API_KEY or WEATHER_API_KEY.'
    );
  }
}

async function fetchJson(url, errorMessage) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(errorMessage ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export async function geocodeLocation(input) {
  requireKey();
  const url = new URL('/geo/1.0/direct', BASE_URL);
  url.searchParams.set('q', input);
  url.searchParams.set('limit', '1');
  url.searchParams.set('appid', API_KEY);

  const results = await fetchJson(
    url.toString(),
    'Unable to resolve that location'
  );

  if (!results?.length) {
    throw new Error('No matching locations found.');
  }

  const [result] = results;
  return {
    lat: result.lat,
    lon: result.lon,
    city: result.name,
    country: result.country,
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
    fetchJson(currentUrl.toString(), 'Unable to load current weather'),
    fetchJson(forecastUrl.toString(), 'Unable to load forecast'),
  ]);

  return { current, forecast };
}

export function summarizeWeather(weatherPayload) {
  if (!weatherPayload) return {};

  const temps = weatherPayload.forecast?.list ?? [];
  const allTemps = temps.map((entry) => entry.main?.temp).filter(Number.isFinite);

  const avgTemp =
    allTemps.length > 0
      ? allTemps.reduce((sum, value) => sum + value, 0) / allTemps.length
      : null;

  const minTemp =
    allTemps.length > 0 ? Math.min(...allTemps) : weatherPayload.current?.main?.temp_min ?? null;
  const maxTemp =
    allTemps.length > 0 ? Math.max(...allTemps) : weatherPayload.current?.main?.temp_max ?? null;

  const summaryText =
    weatherPayload.current?.weather?.[0]?.description ??
    weatherPayload.forecast?.list?.[0]?.weather?.[0]?.description ??
    null;

  return {
    avgTemp,
    minTemp,
    maxTemp,
    summaryText,
  };
}

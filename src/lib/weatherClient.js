const BASE_URL =
  process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com';

const ZIP_REGEX = /^\d{5}(?:[-\s]\d{4})?$/;
const POSTAL_REGEX = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

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
    const reversed = await reverseLookup(coords.lat, coords.lon);
    if (reversed) {
      return reversed;
    }
    return {
      ...coords,
      city: 'Coordinates',
      country: '',
      label: `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`,
      interpretedAs: 'Coordinates',
    };
  }

  if (ZIP_REGEX.test(search) || POSTAL_REGEX.test(search)) {
    return lookupByZip(search);
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
    interpretedAs: /tower|park|museum|bridge|statue/i.test(search)
      ? 'Landmark'
      : 'City/Town',
  };
}

async function lookupByZip(zip) {
  const url = new URL('/geo/1.0/zip', BASE_URL);
  url.searchParams.set('zip', zip);
  url.searchParams.set('appid', API_KEY);

  const result = await fetchJson(
    url.toString(),
    'Postal/ZIP lookup failed.'
  );

  return {
    lat: result.lat,
    lon: result.lon,
    city: result.name,
    country: result.country,
    label: `${zip.toUpperCase()} (${result.name}, ${result.country})`,
    postal: zip.toUpperCase(),
    interpretedAs: 'Postal code',
  };
}

async function reverseLookup(lat, lon) {
  const url = new URL('/geo/1.0/reverse', BASE_URL);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('limit', '1');
  url.searchParams.set('appid', API_KEY);

  try {
    const results = await fetchJson(
      url.toString(),
      'Reverse geocoding failed.'
    );
    if (!results?.length) {
      return null;
    }
    const [first] = results;
    return {
      lat,
      lon,
      city: first.name,
      country: first.country,
      label: `${first.name}, ${first.country}`,
      interpretedAs: 'Coordinates',
    };
  } catch {
    return null;
  }
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

  const alertsUrl = new URL('/data/2.5/onecall', BASE_URL);
  alertsUrl.searchParams.set('lat', lat);
  alertsUrl.searchParams.set('lon', lon);
  alertsUrl.searchParams.set('appid', API_KEY);
  alertsUrl.searchParams.set('units', 'metric');
  alertsUrl.searchParams.set('exclude', 'minutely,hourly,daily');

  const extendedPromise = fetchExtendedDaily(lat, lon).catch(() => null);

  const [current, forecast, alertsPayload, extended] = await Promise.all([
    fetchJson(currentUrl.toString(), 'Unable to load current weather.'),
    fetchJson(forecastUrl.toString(), 'Unable to load forecast.'),
    fetchJson(alertsUrl.toString(), 'Unable to load alerts.').catch(() => null),
    extendedPromise,
  ]);

  return { current, forecast, alerts: alertsPayload?.alerts ?? [], extended };
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

async function fetchExtendedDaily(lat, lon, days = 14) {
  const url = new URL('/v1/forecast', OPEN_METEO_BASE_URL);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,weathercode'
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', String(days));

  const result = await fetchJson(
    url.toString(),
    'Unable to load extended forecast.'
  );

  return result?.daily ?? null;
}

const OPENWEATHER_BASE_URL =
  process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL ||
  'https://api.openweathermap.org';

const API_KEY =
  process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
  process.env.NEXT_PUBLIC_WEATHER_API_KEY ||
  process.env.WEATHER_API_KEY;

function ensureApiKey() {
  if (!API_KEY) {
    throw new Error('OpenWeather API key is not configured.');
  }
}

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(fallbackMessage ?? text ?? 'Request failed');
  }
  return response.json();
}

export async function geocodeLocation(search) {
  ensureApiKey();
  const url = new URL('/geo/1.0/direct', OPENWEATHER_BASE_URL);
  url.searchParams.set('q', search);
  url.searchParams.set('limit', '1');
  url.searchParams.set('appid', API_KEY);

  const payload = await handleResponse(
    await fetch(url.toString()),
    'Unable to find that location'
  );

  if (!payload?.length) {
    throw new Error('No matching locations found.');
  }

  const [result] = payload;

  return {
    lat: result.lat,
    lon: result.lon,
    city: result.name,
    country: result.country,
    label: `${result.name}, ${result.country}`,
  };
}

export async function fetchWeatherForecast(lat, lon) {
  ensureApiKey();
  const currentUrl = new URL('/data/2.5/weather', OPENWEATHER_BASE_URL);
  currentUrl.searchParams.set('lat', lat);
  currentUrl.searchParams.set('lon', lon);
  currentUrl.searchParams.set('units', 'metric');
  currentUrl.searchParams.set('appid', API_KEY);

  const forecastUrl = new URL('/data/2.5/forecast', OPENWEATHER_BASE_URL);
  forecastUrl.searchParams.set('lat', lat);
  forecastUrl.searchParams.set('lon', lon);
  forecastUrl.searchParams.set('units', 'metric');
  forecastUrl.searchParams.set('appid', API_KEY);

  const [current, forecast] = await Promise.all([
    handleResponse(await fetch(currentUrl.toString()), 'Weather lookup failed'),
    handleResponse(
      await fetch(forecastUrl.toString()),
      'Forecast lookup failed'
    ),
  ]);

  return {
    current: normalizeCurrent(current),
    forecast: normalizeForecast(forecast.list ?? []),
  };
}

function normalizeCurrent(payload) {
  return {
    location: `${payload?.name ?? 'Unknown'}, ${payload?.sys?.country ?? ''}`,
    description: payload?.weather?.[0]?.description ?? 'n/a',
    temperature: payload?.main?.temp ?? 0,
    feelsLike: payload?.main?.feels_like ?? 0,
    humidity: payload?.main?.humidity ?? 0,
    windSpeed: (payload?.wind?.speed ?? 0) * 3.6, // m/s → km/h
  };
}

function normalizeForecast(entries) {
  const days = new Map();

  entries.forEach((entry) => {
    const date = entry.dt_txt?.split(' ')[0];
    if (!date) return;

    const existing = days.get(date) ?? {
      date,
      temps: [],
      description: entry.weather?.[0]?.description,
    };
    existing.temps.push(entry.main?.temp ?? 0);
    days.set(date, existing);
  });

  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return Array.from(days.values())
    .slice(0, 5)
    .map((day) => {
      const temps = day.temps.length ? day.temps : [0];
      return {
        date: day.date,
        label: formatter.format(new Date(day.date)),
        summary: day.description ?? 'Forecast unavailable',
        high: Math.max(...temps),
        low: Math.min(...temps),
      };
    });
}

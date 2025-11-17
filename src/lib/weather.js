const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

export async function fetchWeather({ location, days = 5 }) {
  if (!process.env.WEATHER_API_KEY) {
    throw new Error('WEATHER_API_KEY is not set');
  }

  const url = new URL(WEATHER_API_URL);
  url.searchParams.set('key', process.env.WEATHER_API_KEY);
  url.searchParams.set('q', location);
  url.searchParams.set('days', String(days));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}
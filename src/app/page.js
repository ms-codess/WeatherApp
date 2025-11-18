'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import TripForm from '../components/TripForm';
import ForecastList from '../components/ForecastList';

const MapView = dynamic(() => import('../components/Map'), { ssr: false });

function buildForecast(list = []) {
  const days = new Map();
  list?.forEach((entry) => {
    const date = entry?.dt_txt?.split(' ')[0];
    if (!date) return;
    const existing = days.get(date) ?? {
      temps: [],
      summary: entry.weather?.[0]?.description ?? 'n/a',
    };
    existing.temps.push(entry.main?.temp ?? 0);
    days.set(date, existing);
  });

  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return Array.from(days.entries())
    .slice(0, 5)
    .map(([date, info]) => ({
      date,
      label: formatter.format(new Date(date)),
      summary: info.summary,
      high: Math.max(...info.temps),
      low: Math.min(...info.temps),
    }));
}

function formatCurrent(payload) {
  if (!payload) return null;
  const { weather, location } = payload;
  const current = weather?.current;
  return {
    location: location?.label ?? 'Unknown',
    description: current?.weather?.[0]?.description ?? 'n/a',
    temperature: current?.main?.temp ?? 0,
    feelsLike: current?.main?.feels_like ?? 0,
    humidity: current?.main?.humidity ?? 0,
    windSpeed: (current?.wind?.speed ?? 0) * 3.6,
    icon: current?.weather?.[0]?.icon
      ? `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`
      : null,
    visibility: current?.visibility
      ? `${Math.round(current.visibility / 1000)} km`
      : 'n/a',
  };
}

function suggestedDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 5);
  const toInput = (date) => date.toISOString().split('T')[0];
  return { start: toInput(today), end: toInput(end) };
}

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const currentWeather = useMemo(() => formatCurrent(result), [result]);
  const forecastItems = useMemo(
    () => buildForecast(result?.weather?.forecast?.list ?? []),
    [result]
  );

  const defaultDates = useMemo(() => suggestedDates(), [result?.location?.label]);

  async function lookupWeather(query) {
    setStatus({ loading: true, error: '' });
    try {
      const response = await fetch(`/api/weather?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch weather.');
      }
      setResult(data);
      setShowForm(false);
      setStatus({ loading: false, error: '' });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  async function handleSaveTrip(formValues) {
    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues),
    });
    const data = await response.json();
    if (!response.ok) {
      return { errors: data?.errors ?? [data?.error || 'Unable to save trip'] };
    }
    setShowForm(false);
    router.push(`/trips/${data.id}`);
    return { success: true, reset: true };
  }

  function handleMapSelect({ lat, lng }) {
    const coords = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    lookupWeather(coords);
  }

  return (
    <section className="home-viewport">
      <div className="map-layer">
        <MapView
          coordinates={
            result ? { lat: result.location.lat, lng: result.location.lon } : null
          }
          height="100%"
          onSelectLocation={handleMapSelect}
        />
      </div>

      <div className="overlay-panel">
        <div className="overlay-header">
          <div className="overlay-tagline">
            <p className="eyebrow">Plan ahead</p>
            <h2>Navigate weather before you travel</h2>
            <p className="forecast-summary">
              Search any destination or tap on the map to preview live conditions, a
              five-day outlook, and save the best dates.
            </p>
          </div>
          <div className="overlay-location">
            <span className="overlay-location__label">Location</span>
            <strong>{result?.location?.label || 'Tap the map to begin'}</strong>
          </div>
        </div>

        <SearchBar onSearch={lookupWeather} />

        {status.loading ? (
          <p className="form-error">Fetching fresh weather data...</p>
        ) : null}
        {status.error ? <p className="form-error">{status.error}</p> : null}

        {currentWeather ? (
          <div className="overlay-grid">
            <WeatherCard data={currentWeather} />
            <ForecastList items={forecastItems} />
          </div>
        ) : null}

        {result ? (
          <div className="overlay-actions">
            <button className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Close planner' : 'Save as trip'}
            </button>
          </div>
        ) : null}

        {showForm && result ? (
          <div className="form-panel">
            <TripForm
              initialValues={{
                tripName: `${result.location.label} getaway`,
                locationInput: result.location.label,
                startDate: defaultDates.start,
                endDate: defaultDates.end,
              }}
              onSubmit={handleSaveTrip}
              submitLabel="Save Trip"
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

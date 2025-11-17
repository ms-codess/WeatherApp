'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/SearchBar';
import Map from '../components/Map';
import WeatherCard from '../components/WeatherCard';
import TripForm from '../components/TripForm';
import ForecastList from '../components/ForecastList';

function buildForecast(list = []) {
  const days = new Map();
  list.forEach((entry) => {
    const date = entry.dt_txt?.split(' ')[0];
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

function formatCurrent(weather) {
  if (!weather) return null;
  const { weather: weatherData, location } = weather;
  const current = weatherData?.current;
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
    () => buildForecast(result?.weather?.forecast?.list),
    [result]
  );

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
    } catch (error) {
      setStatus({ loading: false, error: error.message });
      return;
    }
    setStatus({ loading: false, error: '' });
  }

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setStatus({ loading: false, error: 'Geolocation is not supported.' });
      return;
    }

    setStatus({ loading: true, error: '' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        lookupWeather(coords);
      },
      (error) => {
        setStatus({
          loading: false,
          error: error.message || 'Unable to access your location.',
        });
      }
    );
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

  return (
    <section style={styles.container}>
      <div style={styles.hero}>
        <div>
          <h1>Weather Trip Planner</h1>
          <p>
            Enter a city, postal code, landmark, or coordinates to preview the
            current weather and a simple five-day forecast before saving the
            trip.
          </p>
        </div>
        <div>
          <button
            style={styles.primaryButton}
            disabled={!result}
            onClick={() => setShowForm(true)}
          >
            Save as Trip
          </button>
          {!result ? (
            <p style={styles.helperText}>
              Search for a location to enable trip planning.
            </p>
          ) : null}
        </div>
      </div>

      <SearchBar onSearch={lookupWeather} onUseCurrentLocation={handleUseLocation} />
      {status.loading ? <p>Loading weather…</p> : null}
      {status.error ? <p style={styles.error}>{status.error}</p> : null}

      <div style={styles.grid}>
        <Map
          coordinates={
            result
              ? { lat: result.location.lat, lng: result.location.lon }
              : null
          }
        />
        <WeatherCard data={currentWeather} />
      </div>

      <ForecastList items={forecastItems} />

      {showForm && result ? (
        <div style={styles.formPanel}>
          <h2>Plan this trip</h2>
          <TripForm
            initialValues={{
              tripName: `${result.location.label} getaway`,
              locationInput: result.location.label,
              startDate: suggestedDates().start,
              endDate: suggestedDates().end,
            }}
            onSubmit={handleSaveTrip}
            submitLabel="Save Trip"
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : null}
    </section>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  primaryButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: '#111a2c',
    color: '#fff',
    cursor: 'pointer',
  },
  helperText: {
    marginTop: '0.35rem',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  error: {
    color: '#b91c1c',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    alignItems: 'stretch',
  },
  formPanel: {
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
  },
};

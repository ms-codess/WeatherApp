'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Map from '../../../components/Map';
import TripForm from '../../../components/TripForm';
import ForecastList from '../../../components/ForecastList';

export default function TripDetailPage({ params }) {
  const router = useRouter();
  const { tripId } = params;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(true);
        const response = await fetch(`/api/trips/${tripId}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Trip not found');
        }
        const data = await response.json();
        setTrip(data);
      } catch (err) {
        setError(err.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [tripId]);

  async function handleUpdate(values) {
    const response = await fetch(`/api/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      return { errors: data?.errors ?? [data?.error || 'Failed to update trip'] };
    }

    setTrip(data);
    setEditing(false);
    return { success: true };
  }

  async function handleDelete() {
    if (!confirm('Delete this trip?')) return;
    const response = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
    if (!response.ok) {
      alert('Unable to delete trip.');
      return;
    }
    router.push('/trips');
  }

  const forecastItems = useMemo(
    () => buildForecastEntries(trip?.weather?.weatherJson),
    [trip]
  );

  if (loading) {
    return <p>Loading trip...</p>;
  }

  if (error || !trip) {
    return (
      <div>
        <p>{error || 'Trip not found'}</p>
        <Link href="/trips">Back to trips</Link>
      </div>
    );
  }

  return (
    <section style={styles.section}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>{trip.normalizedCountry ?? 'Unknown'}</p>
          <h1>{trip.tripName}</h1>
          <p>
            {trip.normalizedCity ?? '--'}, {trip.normalizedCountry ?? '--'}
          </p>
          <p style={styles.dates}>{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setEditing((value) => !value)}>
            {editing ? 'Close form' : 'Edit trip'}
          </button>
          <button onClick={handleDelete}>Delete</button>
          <Link href="/trips">Back to all trips</Link>
        </div>
      </header>

      <div style={styles.layout}>
        <div style={styles.mapPanel}>
          <h3>Map</h3>
          <Map
            coordinates={
              trip.latitude && trip.longitude
                ? { lat: trip.latitude, lng: trip.longitude }
                : null
            }
          />
        </div>
        <div style={styles.weatherPanel}>
          <h3>Weather summary</h3>
          <ul style={styles.summaryList}>
            <li>Avg temp: {formatTemp(trip.weather?.avgTemp)}</li>
            <li>Low: {formatTemp(trip.weather?.minTemp)}</li>
            <li>High: {formatTemp(trip.weather?.maxTemp)}</li>
            <li>Summary: {trip.weather?.summaryText ?? 'No forecast available'}</li>
          </ul>
          {forecastItems.length ? (
            <ForecastList items={forecastItems} />
          ) : (
            <p>No detailed forecast captured.</p>
          )}
        </div>
      </div>

      {editing ? (
        <div style={styles.formPanel}>
          <TripForm
            initialValues={{
              tripName: trip.tripName,
              locationInput: trip.locationInput,
              startDate: formatDateInput(trip.startDate),
              endDate: formatDateInput(trip.endDate),
            }}
            onSubmit={handleUpdate}
            submitLabel="Update Trip"
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}
    </section>
  );
}

function buildForecastEntries(weatherJson) {
  if (!weatherJson) return [];
  let payload = weatherJson;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return [];
    }
  }
  const list = payload?.forecast?.list ?? [];
  const days = new Map();
  list.forEach((entry) => {
    const date = entry.dt_txt?.split(' ')[0];
    if (!date) return;
    const current = days.get(date) ?? {
      temps: [],
      summary: entry.weather?.[0]?.description ?? 'n/a',
    };
    current.temps.push(entry.main?.temp ?? 0);
    days.set(date, current);
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

function formatTemp(value) {
  if (value == null) return 'n/a';
  return `${Math.round(value)} deg C`;
}

function formatDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
}

function formatDateRange(start, end) {
  const startDate = start ? new Date(start).toLocaleDateString() : '--';
  const endDate = end ? new Date(end).toLocaleDateString() : '--';
  return `${startDate} -> ${endDate}`;
}

const styles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  headerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-end',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#6b7280',
  },
  dates: {
    marginTop: '0.35rem',
    color: '#4b5563',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  mapPanel: {
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  weatherPanel: {
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  summaryList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '0.35rem',
  },
  formPanel: {
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
  },
};

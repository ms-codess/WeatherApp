'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/SearchBar';
import Map from '../components/Map';
import WeatherCard from '../components/WeatherCard';
import TripForm from '../components/TripForm';

function getSuggestedDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 5);

  const format = (date) => date.toISOString().split('T')[0];

  return {
    start: format(today),
    end: format(end),
  };
}

export default function HomePage() {
  const router = useRouter();
  const [lastSearch, setLastSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const suggestedDates = useMemo(() => getSuggestedDates(), [lastSearch]);

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
            Search upcoming destinations, preview simple weather details, and
            save itineraries for later review.
          </p>
        </div>
        <div>
          <button
            style={styles.primaryButton}
            disabled={!lastSearch}
            onClick={() => setShowForm(true)}
          >
            Save as Trip
          </button>
          {!lastSearch ? (
            <p style={styles.helperText}>
              Search for a location first to pre-fill trip details.
            </p>
          ) : null}
        </div>
      </div>

      <SearchBar onSearch={(value) => setLastSearch(value)} />

      <div style={styles.grid}>
        <Map coordinates={null} />
        <WeatherCard />
      </div>

      {showForm ? (
        <div style={styles.formPanel}>
          <h2>Plan a trip</h2>
          <TripForm
            initialValues={{
              tripName: lastSearch ? `${lastSearch} getaway` : '',
              locationInput: lastSearch,
              startDate: suggestedDates.start,
              endDate: suggestedDates.end,
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  formPanel: {
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
  },
};

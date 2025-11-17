'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TripForm from '../../components/TripForm';

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trips', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load trips');
      }
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  function openCreateForm() {
    setFormMode('create');
    setActiveTrip(null);
  }

  function openEditForm(trip) {
    setFormMode('edit');
    setActiveTrip(trip);
  }

  async function handleCreate(values) {
    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      return { errors: data?.errors ?? [data?.error || 'Failed to create trip'] };
    }

    await fetchTrips();
    setFormMode(null);
    router.push(`/trips/${data.id}`);
    return { success: true };
  }

  async function handleUpdate(values) {
    if (!activeTrip) return { errors: ['No trip selected'] };
    const response = await fetch(`/api/trips/${activeTrip.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      return { errors: data?.errors ?? [data?.error || 'Failed to update trip'] };
    }

    await fetchTrips();
    setFormMode(null);
    setActiveTrip(null);
    return { success: true };
  }

  async function handleDelete(id) {
    if (!confirm('Remove this trip?')) {
      return;
    }
    const response = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      alert('Failed to delete trip');
      return;
    }
    await fetchTrips();
  }

  const editingValues = useMemo(() => {
    if (!activeTrip) return null;
    return {
      tripName: activeTrip.tripName || '',
      locationInput: activeTrip.locationInput || '',
      startDate: formatDateInput(activeTrip.startDate),
      endDate: formatDateInput(activeTrip.endDate),
    };
  }, [activeTrip]);

  return (
    <section style={styles.section}>
      <header style={styles.header}>
        <div>
          <h1>Saved Trips</h1>
          <p>Manage upcoming adventures, edit details, or plan a new route.</p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateForm}>
          New Trip
        </button>
      </header>

      {loading ? <p>Loading trips...</p> : null}
      {error ? <p style={styles.error}>{error}</p> : null}

      {!loading && trips.length === 0 ? (
        <p>No trips yet. Click "New Trip" to create your first plan.</p>
      ) : null}

      {!loading && trips.length > 0 ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Dates</th>
                <th>Summary</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.tripName}</td>
                  <td>
                    {trip.normalizedCity ?? '--'}, {trip.normalizedCountry ?? '--'}
                  </td>
                  <td>{formatDateRange(trip.startDate, trip.endDate)}</td>
                  <td>{trip.weather?.summaryText ?? 'No forecast yet'}</td>
                  <td style={styles.actionsCell}>
                    <Link href={`/trips/${trip.id}`}>View</Link>
                    <button onClick={() => openEditForm(trip)}>Edit</button>
                    <button onClick={() => handleDelete(trip.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {formMode ? (
        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h2>{formMode === 'edit' ? 'Edit trip' : 'Create trip'}</h2>
            <button onClick={() => setFormMode(null)}>Close</button>
          </div>
          <TripForm
            initialValues={
              formMode === 'edit'
                ? editingValues
                : {
                    tripName: '',
                    locationInput: '',
                    startDate: '',
                    endDate: '',
                  }
            }
            onSubmit={formMode === 'edit' ? handleUpdate : handleCreate}
            submitLabel={formMode === 'edit' ? 'Update Trip' : 'Save Trip'}
            onCancel={() => setFormMode(null)}
          />
        </div>
      ) : null}
    </section>
  );
}

function formatDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
}

function formatDateRange(start, end) {
  const startDate = start ? new Date(start).toLocaleDateString() : '--';
  const endDate = end ? new Date(end).toLocaleDateString() : '--';
  return `${startDate} → ${endDate}`;
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
    alignItems: 'center',
    gap: '1rem',
  },
  primaryButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: '#111a2c',
    color: '#fff',
    cursor: 'pointer',
  },
  error: {
    color: '#b42318',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  actionsCell: {
    display: 'flex',
    gap: '0.5rem',
  },
  formPanel: {
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
};

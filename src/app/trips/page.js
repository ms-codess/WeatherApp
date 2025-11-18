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

  const editingValues = useMemo(() => {
    if (!activeTrip) return null;
    return {
      tripName: activeTrip.tripName || '',
      locationInput: activeTrip.locationInput || '',
      startDate: formatDateInput(activeTrip.startDate),
      endDate: formatDateInput(activeTrip.endDate),
    };
  }, [activeTrip]);

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

  return (
    <section className="content-panel">
      <header className="panel-header">
        <div>
          <strong>Saved trips</strong>
          <span>Manage, edit, and export your itineraries</span>
        </div>
        <div className="panel-header__actions">
          <button className="btn" onClick={fetchTrips} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn--primary" onClick={openCreateForm}>
            New Trip
          </button>
        </div>
      </header>

      <div className="status-badge">
        {loading ? 'Loading trips...' : `${trips.length} planned trip(s)`}
      </div>
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && trips.length > 0 ? (
        <div className="panel-section panel-section--table">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Dates</th>
                <th>Summary</th>
                <th>Actions</th>
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
                  <td className="actions-cell">
                    <Link className="pill-link" href={`/trips/${trip.id}`}>
                      View
                    </Link>
                    <button className="btn" onClick={() => openEditForm(trip)}>
                      Edit
                    </button>
                    <button className="btn" onClick={() => handleDelete(trip.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && trips.length === 0 ? (
        <div className="panel-section">
          <p>No trips yet. Click "New Trip" to capture your first plan.</p>
        </div>
      ) : null}

      {formMode ? (
        <div className="form-panel">
          <div className="panel-header">
            <strong>{formMode === 'edit' ? 'Edit trip' : 'Create trip'}</strong>
            <button className="btn" onClick={() => setFormMode(null)}>
              Close
            </button>
          </div>
          <TripForm
            initialValues=
              {formMode === 'edit'
                ? editingValues
                : { tripName: '', locationInput: '', startDate: '', endDate: '' }}
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
  return `${startDate} -> ${endDate}`;
}

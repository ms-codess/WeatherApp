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
  const [favoriteStatus, setFavoriteStatus] = useState('');
  const [tripImages, setTripImages] = useState({});

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

  const { upcomingCount, nextTrip } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    let nearest = null;
    trips.forEach((trip) => {
      const start = trip.startDate ? new Date(trip.startDate) : null;
      const end = trip.endDate ? new Date(trip.endDate) : null;
      if (start && start > now) {
        upcoming.push(trip);
        if (!nearest || start < new Date(nearest.startDate)) {
          nearest = trip;
        }
      }
    });
    return {
      upcomingCount: upcoming.length,
      nextTrip: nearest,
    };
  }, [trips]);

  useEffect(() => {
    if (!trips.length) return;
    let cancelled = false;
    async function loadImages() {
      const missing = trips.filter((trip) => !(trip.id in tripImages));
      if (!missing.length) return;
      const entries = await Promise.all(
        missing.map(async (trip) => {
          const label = trip.normalizedCity || trip.locationInput || trip.tripName;
          if (!label) {
            return { id: trip.id, image: null };
          }
          try {
            const response = await fetch(`/api/photos?` + new URLSearchParams({ q: label }));
            if (!response.ok) {
              return { id: trip.id, image: null };
            }
            const data = await response.json();
            return { id: trip.id, image: data?.image?.thumbnail || data?.image?.original };
          } catch {
            return { id: trip.id, image: null };
          }
        })
      );
      if (cancelled || !entries.length) return;
      setTripImages((prev) => {
        const next = { ...prev };
        entries.forEach(({ id, image }) => {
          next[id] = image || null;
        });
        return next;
      });
    }
    loadImages();
    return () => {
      cancelled = true;
    };
  }, [trips, tripImages]);

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
    router.push('/trips');
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

  async function handleFavorite(trip) {
    if (!trip) return;
    if (trip.latitude == null || trip.longitude == null) {
      setFavoriteStatus('Trip is missing coordinates for favorites.');
      return;
    }
    try {
      setFavoriteStatus('Saving favorite...');
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: trip.tripName,
          locationInput: trip.locationInput,
          normalizedCity: trip.normalizedCity,
          normalizedCountry: trip.normalizedCountry,
          latitude: trip.latitude,
          longitude: trip.longitude,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.errors?.[0] || 'Unable to save favorite.');
      }
      setFavoriteStatus(`Saved ${data.label} to favorites.`);
    } catch (err) {
      setFavoriteStatus(err.message || 'Unable to save favorite.');
    }
  }

  return (
    <section className="content-panel">
      <div className="trips-hero">
        <div>
          <p className="eyebrow">Saved journeys</p>
          <h1>Plan-ready trips</h1>
          <p>
            Keep every destination organized with live weather summaries, exportable reports, and
            colorful reminders of what is coming up next.
          </p>
        </div>
        <div className="trip-metrics">
          <div className="metric-pill">
            <span>Total trips</span>
            <strong>{trips.length}</strong>
          </div>
          <div className="metric-pill">
            <span>Upcoming</span>
            <strong>{upcomingCount}</strong>
          </div>
        </div>
      </div>

      <header className="panel-header">
        <div>
          <strong>Saved trips</strong>
          <span> Manage, edit, and export your itineraries.</span>
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

   
      {error ? <p className="form-error">{error}</p> : null}
      {favoriteStatus ? <p className="form-error">{favoriteStatus}</p> : null}
      {favoriteStatus ? <p className="form-error">{favoriteStatus}</p> : null}

      {!loading && nextTrip ? (
        <div className="trip-highlight">
          <div>
            <p className="eyebrow">Next departure</p>
            <strong>{nextTrip.tripName}</strong>
            <p>
              {nextTrip.normalizedCity ?? nextTrip.locationInput ?? 'TBD'}
              {nextTrip.normalizedCountry ? `, ${nextTrip.normalizedCountry}` : ''}
            </p>
          </div>
          <div className="trip-highlight__meta">
            <span>{formatDateRange(nextTrip.startDate, nextTrip.endDate)}</span>
            <Link className="pill-link" href={`/trips/${nextTrip.id}`}>
              Open trip
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && trips.length > 0 ? (
        <div className="panel-section panel-section--table">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Preview</th>
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
                  <td>
                    <div className="trip-photo">
                      {tripImages[trip.id] ? (
                        <img src={tripImages[trip.id]} alt={trip.tripName} />
                      ) : (
                        <div className="trip-photo__placeholder">No photo yet</div>
                      )}
                    </div>
                  </td>
                  <td>{trip.tripName}</td>
                  <td>
                    {trip.normalizedCity ?? '--'}, {trip.normalizedCountry ?? '--'}
                  </td>
                  <td>{formatDateRange(trip.startDate, trip.endDate)}</td>
                  <td>{formatSummaryText(trip.weather?.summaryText)}</td>
                  <td className="actions-cell">
                    <Link className="pill-link" href={`/trips/${trip.id}`}>
                      View
                    </Link>
                    <button className="btn" onClick={() => handleFavorite(trip)}>
                      Favorite
                    </button>
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
          <p>No trips yet. Click &ldquo;New Trip&rdquo; to capture your first plan.</p>
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

function formatSummaryText(value) {
  if (!value) return 'No forecast yet';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

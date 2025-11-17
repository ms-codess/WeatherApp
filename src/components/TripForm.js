'use client';

import { useEffect, useState } from 'react';

const defaultValues = {
  tripName: '',
  locationInput: '',
  startDate: '',
  endDate: '',
};

export default function TripForm({
  initialValues = {},
  onSubmit,
  submitLabel = 'Save Trip',
  onCancel,
}) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!onSubmit) return;

    setSubmitting(true);
    setErrors([]);

    try {
      const result = await onSubmit(form);
      if (result?.errors?.length) {
        setErrors(result.errors);
      } else if (result?.reset) {
        setForm({ ...defaultValues, ...initialValues });
      }
    } catch (error) {
      setErrors([error.message || 'Failed to save trip']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <label style={styles.field}>
          Trip Name
          <input
            type="text"
            name="tripName"
            value={form.tripName}
            onChange={(event) => updateField('tripName', event.target.value)}
            required
          />
        </label>

        <label style={styles.field}>
          Location
          <input
            type="text"
            name="locationInput"
            value={form.locationInput}
            onChange={(event) =>
              updateField('locationInput', event.target.value)
            }
            required
          />
        </label>

        <label style={styles.field}>
          Start Date
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            required
          />
        </label>

        <label style={styles.field}>
          End Date
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
            required
          />
        </label>
      </div>

      {errors.length > 0 ? (
        <div style={styles.errorBox}>
          {errors.map((error) => (
            <p key={error} style={styles.error}>
              {error}
            </p>
          ))}
        </div>
      ) : null}

      <div style={styles.actions}>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  errorBox: {
    backgroundColor: '#fdecea',
    border: '1px solid #f5c2c7',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  error: {
    margin: 0,
    color: '#b42318',
  },
};

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
    <form onSubmit={handleSubmit} className="trip-form">
      <div className="trip-form__grid">
        <label>
          Trip Name
          <input
            type="text"
            name="tripName"
            value={form.tripName}
            onChange={(event) => updateField('tripName', event.target.value)}
            required
          />
        </label>

        <label>
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

        <label>
          Start Date
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            required
          />
        </label>

        <label>
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
        <div className="alert alert--error">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <div className="trip-form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

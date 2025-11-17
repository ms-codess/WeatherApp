'use client';

import { useState } from 'react';

const defaultState = {
  name: '',
  origin: '',
  destination: '',
  startDate: '',
  endDate: '',
};

export default function TripForm({ onSubmit }) {
  const [form, setForm] = useState(defaultState);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(form).map(([field, value]) => (
        <label key={field}>
          {field}
          <input
            type={field.toLowerCase().includes('date') ? 'date' : 'text'}
            value={value}
            onChange={(event) => updateField(field, event.target.value)}
          />
        </label>
      ))}
      <button type="submit">Save Trip</button>
    </form>
  );
}
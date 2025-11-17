'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch, onUseCurrentLocation }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError('Enter a city, postal code, coordinates, or landmark name.');
      return;
    }
    setError('');
    onSearch?.(query.trim());
  }

  function handleUseLocation() {
    setError('');
    onUseCurrentLocation?.();
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="City, postal code, coordinates, or landmark"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={styles.input}
          aria-label="Location search"
        />
        <button type="submit" style={styles.primaryButton}>
          Search
        </button>
        <button
          type="button"
          onClick={handleUseLocation}
          style={styles.secondaryButton}
        >
          Use my location
        </button>
      </div>
      {error ? (
        <p style={styles.error} role="status">
          {error}
        </p>
      ) : null}
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '220px',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
  },
  primaryButton: {
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#0f172a',
    color: '#fff',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    border: '1px solid #c7d2fe',
    background: '#eef2ff',
    color: '#312e81',
    cursor: 'pointer',
  },
  error: {
    margin: 0,
    color: '#b42318',
  },
};

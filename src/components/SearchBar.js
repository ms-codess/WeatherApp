'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch, onUseCurrentLocation }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError('Please enter a location to search.');
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
      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="City, landmark, postal code, or coordinates"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={styles.input}
          aria-label="Location search field"
        />
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.primaryBtn}>
            Search
          </button>
          <button
            type="button"
            onClick={handleUseLocation}
            style={styles.secondaryBtn}
          >
            Use My Location
          </button>
        </div>
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
    padding: '1rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 35px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  input: {
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #d0d7de',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#111a2c',
    color: '#fff',
    border: 'none',
    padding: '0.65rem 1.35rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: '#f0f4ff',
    color: '#3b47bd',
    border: '1px solid #d0dbff',
    padding: '0.65rem 1.35rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  error: {
    color: '#c62828',
    fontSize: '0.9rem',
    margin: 0,
  },
};

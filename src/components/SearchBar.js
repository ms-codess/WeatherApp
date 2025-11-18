'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError('Enter a city, postal code, coordinates, or landmark.');
      return;
    }
    setError('');
    onSearch?.(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-bar__row">
        <input
          type="text"
          placeholder="City, postal code, coordinates, or landmark"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="search-bar__input"
          aria-label="Location search"
        />
        <button type="submit" className="search-bar__btn search-bar__btn--primary">
          Search
        </button>
      </div>
      {error ? (
        <p className="form-error" role="status">
          {error}
        </p>
      ) : null}
    </form>
  );
}

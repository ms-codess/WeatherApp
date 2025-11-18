'use client';

import { useEffect, useState } from 'react';
import { classifyInput, getInterpretationLabel } from '../lib/inputParser';

export default function SearchBar({
  onSearch,
  onInterpretationChange,
  onUseLocation,
}) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [interpretation, setInterpretation] = useState(null);

  useEffect(() => {
    const result = classifyInput(query);
    setInterpretation(result);
    onInterpretationChange?.(result);
  }, [query, onInterpretationChange]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError('Enter a city, postal code, coordinates, or landmark.');
      return;
    }
    setError('');
    onSearch?.(query.trim());
  }

  function handleUseLocation() {
    onUseLocation?.();
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
        <button
          type="button"
          className="search-bar__btn"
          onClick={handleUseLocation}
        >
          Use my location
        </button>
      </div>
      {interpretation ? (
        <p className="search-hint">{getInterpretationLabel(interpretation)}</p>
      ) : null}
      {error ? (
        <p className="form-error" role="status">
          {error}
        </p>
      ) : null}
    </form>
  );
}

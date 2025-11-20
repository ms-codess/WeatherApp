'use client';

import { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { classifyInput, getInterpretationLabel } from '../lib/inputParser';

export default function SearchBar({
  onSearch,
  onInterpretationChange,
  onUseLocation,
}) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const abortController = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    const result = classifyInput(query);
    setInterpretation(result);
    onInterpretationChange?.(result);
  }, [query, onInterpretationChange]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return undefined;
    }
    const timer = setTimeout(() => fetchSuggestions(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError('Enter a city, postal code, coordinates, or landmark.');
      return;
    }
    setError('');
    setShowSuggestions(false);
    onSearch?.(query.trim(), interpretation);
  }

  function handleUseLocation() {
    onUseLocation?.();
  }

  async function fetchSuggestions(value) {
    setFetchingSuggestions(true);
    try {
      abortController.current?.abort();
      abortController.current = new AbortController();
      const response = await fetch(`/api/suggest?q=${encodeURIComponent(value)}`, {
        signal: abortController.current.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch suggestions.');
      }
      let list = data?.results ?? [];
      if (list.length > 1) {
        const fuse = new Fuse(list, {
          keys: ['label', 'country', 'admin'],
          threshold: 0.3,
        });
        list = fuse.search(value).map((entry) => entry.item);
      }
      setSuggestions(list.slice(0, 5));
      setShowSuggestions(true);
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') {
        setShowSuggestions(false);
      }
    } finally {
      setFetchingSuggestions(false);
    }
  }

  function handleSuggestionSelect(suggestion) {
    const coords = `${suggestion.latitude},${suggestion.longitude}`;
    setQuery(suggestion.label);
    setShowSuggestions(false);
    onSearch?.(coords, { label: `Suggestion: ${suggestion.label}` });
  }

  function handleBlur() {
    hideTimer.current = setTimeout(() => setShowSuggestions(false), 150);
  }

  function handleFocus() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (suggestions.length) {
      setShowSuggestions(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-bar__row">
        <div className="search-bar__input-wrapper">
          <input
            type="text"
            placeholder="City, postal code, coordinates, or landmark"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-bar__input"
            aria-label="Location search"
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
          {showSuggestions && suggestions.length ? (
            <ul className="search-suggestions">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <span>{suggestion.label}</span>
                    <small>
                      {suggestion.admin ? `${suggestion.admin} • ` : ''}
                      {suggestion.country}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button type="submit" className="search-bar__btn search-bar__btn--primary">
          {fetchingSuggestions ? 'Searching…' : 'Search'}
        </button>
        <button
          type="button"
          className="search-bar__btn"
          onClick={handleUseLocation}
        >
          Use my location
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

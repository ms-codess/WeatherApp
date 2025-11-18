'use client';

import { useEffect, useState } from 'react';

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function ItineraryPreview({ locationLabel, startDate, endDate }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!locationLabel) return;
    let active = true;
    async function fetchIdeas() {
      try {
        setStatus('loading');
        const response = await fetch(
          `/api/itinerary?q=${encodeURIComponent(locationLabel)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load itinerary ideas.');
        }
        if (active) {
          setItems(data.results || []);
          setStatus('loaded');
        }
      } catch (error) {
        if (active) {
          setItems([]);
          setStatus('error');
        }
      }
    }
    fetchIdeas();
    return () => {
      active = false;
    };
  }, [locationLabel]);

  if (!locationLabel) return null;

  return (
    <div className="panel-section itinerary-card">
      <div className="itinerary-card__header">
        <div>
          <p className="eyebrow">Suggested itinerary</p>
          <strong>
            {formatDate(startDate)} → {formatDate(endDate)}
          </strong>
        </div>
        <span role="img" aria-label="calendar">
          🗓️
        </span>
      </div>
      {status === 'loading' ? <p className="search-hint">Gathering ideas…</p> : null}
      <ul className="itinerary-card__list">
        {items.length
          ? items.map((item) => (
              <li key={item.link}>
                <strong>{item.title}</strong>
                <p>{item.snippet}</p>
                <a href={item.link} target="_blank" rel="noreferrer" className="pill-link">
                  View plan
                </a>
              </li>
            ))
          : (
              <li>
                <strong>Day 1–3</strong>
                <p>Explore landmarks, cuisine, and nearby escapes.</p>
              </li>
            )}
      </ul>
    </div>
  );
}

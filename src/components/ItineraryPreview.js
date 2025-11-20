'use client';

import { useEffect, useState } from 'react';

function formatDate(date) {
  if (!date) return '-';
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
        const params = new URLSearchParams({ q: locationLabel });
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);
        const response = await fetch(`/api/itinerary?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load itinerary ideas.');
        }
        if (active) {
          setItems(data.results || []);
          setStatus('loaded');
        }
      } catch {
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
  }, [locationLabel, startDate, endDate]);

  if (!locationLabel) return null;

  const cards = items.length
    ? items
    : [
        {
          title: 'Flexible days',
          snippet:
            'Explore signature landmarks, try local food tours, and plan a nearby day trip to round out your stay.',
          link: `https://www.google.com/search?q=${encodeURIComponent(
            `${locationLabel} travel guide`
          )}`,
        },
      ];

  return (
    <div className="panel-section itinerary-card">
      <div className="itinerary-card__header">
        <div>
          <p className="eyebrow">Itinerary for {locationLabel}</p>
          <strong>
            {formatDate(startDate)} - {formatDate(endDate)}
          </strong>
        </div>
        <span className="itinerary-card__icon" aria-hidden="true">
          PLAN
        </span>
      </div>
      {status === 'loading' ? <p className="search-hint">Gathering ideas...</p> : null}
      <ul className="itinerary-card__list">
        {cards.map((item, index) => (
          <li key={item.link || index} className="itinerary-card__item itinerary-card__item--text">
            <div className="itinerary-card__content">
              <strong>{item.title}</strong>
              <p>{item.snippet}</p>
              <a href={item.link} target="_blank" rel="noreferrer" className="pill-link">
                Read blog
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

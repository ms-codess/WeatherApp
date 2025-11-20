'use client';

import { useEffect, useState } from 'react';

export default function HotelSuggestions({ locationLabel, startDate, endDate }) {
  const [hotels, setHotels] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!locationLabel) return;
    let active = true;
    async function fetchHotels() {
      try {
        setStatus('loading');
        const params = new URLSearchParams({ q: locationLabel });
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);
        const response = await fetch(`/api/hotels?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load hotels.');
        }
        if (active) {
          setHotels(data.hotels || []);
          setStatus('loaded');
        }
      } catch {
        if (active) {
          setStatus('error');
          setHotels([]);
        }
      }
    }
    fetchHotels();
    return () => {
      active = false;
    };
  }, [locationLabel, startDate, endDate]);

  if (!locationLabel) return null;

  const items = hotels.length
    ? hotels
    : [
        {
          id: 'placeholder-hotel',
          name: `${locationLabel} Boutique Stay`,
          address: `Central ${locationLabel}`,
          price: 'n/a',
          rating: 'n/a',
          link: `https://www.google.com/maps/search/${encodeURIComponent(`${locationLabel} hotels`)}`,
        },
      ];

  return (
    <div className="panel-section hotel-grid">
      <div className="travel-videos__header">
        <div>
          <p className="eyebrow">Where to stay</p>
          <strong>Hotel suggestions near {locationLabel}</strong>
        </div>
      </div>
      {status === 'loading' ? <p className="search-hint">Finding nearby stays...</p> : null}
      <ul className="travel-videos__list travel-videos__list--text-only">
        {items.map((hotel) => (
          <li
            key={hotel.id || hotel.name}
            className="travel-video-card travel-video-card--text-only"
          >
            <div className="travel-video-card__body">
              <strong>{hotel.name}</strong>
              <p>{hotel.address || `${locationLabel} center`}</p>
              <p className="hotel-meta">
                {hotel.price && hotel.price !== 'n/a' ? `From ${hotel.price}` : 'Rate varies'}
                {hotel.rating && hotel.rating !== 'n/a' ? ` - ${hotel.rating} stars` : ''}
              </p>
              {hotel.link ? (
                <a href={hotel.link} target="_blank" rel="noreferrer" className="pill-link">
                  View details
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

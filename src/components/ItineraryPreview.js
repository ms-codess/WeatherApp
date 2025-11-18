'use client';

const ideas = [
  { label: 'Day 1', description: 'Arrival, hotel check-in, sunset stroll' },
  { label: 'Day 2', description: 'City highlights + local cuisine tour' },
  { label: 'Day 3', description: 'Nature escape or nearby day trip' },
];

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function ItineraryPreview({ startDate, endDate }) {
  if (!startDate || !endDate) return null;

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
      <ul className="itinerary-card__list">
        {ideas.map((idea) => (
          <li key={idea.label}>
            <strong>{idea.label}</strong>
            <p>{idea.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

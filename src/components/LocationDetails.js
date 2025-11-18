'use client';

export default function LocationDetails({ location }) {
  if (!location) return null;

  const details = [
    { label: 'Type', value: location.interpretedAs || 'City / Town' },
    { label: 'City', value: location.city || location.label },
    { label: 'Country', value: location.country || '—' },
    {
      label: 'Coordinates',
      value: `${Number(location.lat).toFixed(2)}°, ${Number(location.lon).toFixed(2)}°`,
    },
  ];

  return (
    <div className="panel-section location-card">
      <div className="location-card__header">
        <span role="img" aria-label="pin">
          📍
        </span>
        <div>
          <p className="eyebrow">Destination info</p>
          <strong>{location.label}</strong>
        </div>
      </div>

      <dl className="location-card__metrics">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

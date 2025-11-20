'use client';

const PIN_ICON = '\u{1F4CD}';

function formatCoordinate(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}\u00B0`;
}

export default function LocationDetails({ location, query, interpretation }) {
  if (!location) return null;

  const latText = formatCoordinate(location.lat);
  const lonText = formatCoordinate(location.lon);

  const resolvedLocation = [
    location.city || location.normalizedCity || null,
    location.country || location.normalizedCountry || null,
  ]
    .filter(Boolean)
    .join(', ');

  const details = [
    { label: 'Original search', value: query || '-' },
   
    {
      label: 'Resolved location',
      value: resolvedLocation || location.label || 'Unknown',
    },
    { label: 'Postal / ZIP', value: location.postal || '—' },
    {
      label: 'Coordinates',
      value: latText !== '-' && lonText !== '-' ? `${latText}, ${lonText}` : '—',
    },
  ];

  return (
    <div className="panel-section location-card">
      <div className="location-card__header">
        <span role="img" aria-label="pin">
          {PIN_ICON}
        </span>
        <div>
          <p className="eyebrow">Destination info</p>
          <strong>{resolvedLocation || location.label}</strong>
          {location.state ? <p className="location-card__subtle">{location.state}</p> : null}
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

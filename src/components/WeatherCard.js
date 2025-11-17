'use client';

export default function WeatherCard({ data }) {
  if (!data) {
    return (
      <div style={styles.card}>
        <p style={{ margin: 0 }}>Search for a location to preview weather.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <p style={styles.label}>Current weather</p>
          <h3 style={styles.location}>{data.location}</h3>
          <p style={styles.description}>{data.description}</p>
        </div>
        <div style={styles.temperature}>
          {data.icon ? (
            <img
              src={data.icon}
              alt={data.description}
              width={64}
              height={64}
              style={{ display: 'block', margin: '0 auto' }}
            />
          ) : null}
          <span>{Math.round(data.temperature)}°C</span>
          <small>Feels like {Math.round(data.feelsLike)}°C</small>
        </div>
      </div>
      <dl style={styles.metrics}>
        <div>
          <dt>Humidity</dt>
          <dd>{data.humidity}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{Math.round(data.windSpeed)} km/h</dd>
        </div>
        <div>
          <dt>Visibility</dt>
          <dd>{data.visibility ?? '—'}</dd>
        </div>
      </dl>
    </div>
  );
}

const styles = {
  card: {
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginBottom: '0.25rem',
  },
  location: {
    margin: '0 0 0.2rem 0',
  },
  description: {
    margin: 0,
    color: '#475569',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  temperature: {
    textAlign: 'right',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
    gap: '0.75rem',
    margin: '1rem 0 0 0',
  },
};

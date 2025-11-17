'use client';

export default function CurrentWeatherCard({ data }) {
  if (!data) {
    return (
      <section style={styles.card}>
        <p style={styles.placeholder}>
          Search for a location to see live weather.
        </p>
      </section>
    );
  }

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.label}>Current Weather</p>
          <h3 style={styles.title}>{data.location}</h3>
          <p style={styles.subtitle}>{data.description}</p>
        </div>
        <p style={styles.temp}>{Math.round(data.temperature)}°</p>
      </div>

      <dl style={styles.metrics}>
        <div>
          <dt>Feels like</dt>
          <dd>{Math.round(data.feelsLike)}°</dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{data.humidity}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{Math.round(data.windSpeed)} km/h</dd>
        </div>
      </dl>
    </section>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 10px 35px rgba(0,0,0,0.06)',
    minHeight: '200px',
  },
  placeholder: {
    margin: 0,
    color: '#697386',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '0.75rem',
    color: '#8b92a7',
    marginBottom: '0.25rem',
  },
  title: {
    fontSize: '1.4rem',
    margin: 0,
  },
  subtitle: {
    margin: 0,
    color: '#697386',
  },
  temp: {
    fontSize: '3rem',
    fontWeight: 600,
    margin: 0,
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
    gap: '0.75rem',
    margin: 0,
  },
};

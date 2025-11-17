'use client';

export default function ForecastList({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section style={styles.wrapper}>
      <h3 style={styles.title}>5-day outlook</h3>
      <ul style={styles.list}>
        {items.map((item) => (
          <li key={item.date} style={styles.item}>
            <div>
              <p style={styles.day}>{item.label}</p>
              <p style={styles.summary}>{item.summary}</p>
            </div>
            <p style={styles.temp}>
              <strong>{Math.round(item.high)}°C</strong>
              <span>{Math.round(item.low)}°C</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const styles = {
  wrapper: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    background: '#fff',
  },
  title: {
    marginTop: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  day: {
    margin: 0,
    fontWeight: 600,
  },
  summary: {
    margin: 0,
    color: '#6b7280',
  },
  temp: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'baseline',
  },
};

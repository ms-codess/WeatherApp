'use client';

export default function ForecastList({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section style={styles.wrapper}>
      <h3 style={styles.heading}>5-Day Outlook</h3>
      <ul style={styles.list}>
        {items.map((day) => (
          <li key={day.date} style={styles.item}>
            <p style={styles.day}>{day.label}</p>
            <p style={styles.summary}>{day.summary}</p>
            <p style={styles.temp}>
              <strong>{Math.round(day.high)}°</strong>
              <span style={styles.low}>{Math.round(day.low)}°</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const styles = {
  wrapper: {
    marginTop: '1.5rem',
    background: '#fff',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 10px 35px rgba(0,0,0,0.04)',
  },
  heading: {
    marginTop: 0,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gap: '0.75rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    border: '1px solid #e3e8f4',
    borderRadius: '10px',
  },
  day: {
    fontWeight: 600,
  },
  summary: {
    flex: 1,
    textAlign: 'center',
    color: '#697386',
  },
  temp: {
    display: 'flex',
    gap: '0.45rem',
    alignItems: 'baseline',
  },
  low: {
    color: '#8b92a7',
  },
};

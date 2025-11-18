'use client';

import { emojiForDescription } from '../lib/weatherEmojis';

export default function ForecastList({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="panel-section forecast-list">
      <h3>5-day outlook</h3>
      <ul>
        {items.map((item) => (
          <li key={item.date} className="forecast-item">
            <div>
              <p className="forecast-day">
                <span role="img" aria-label="conditions">
                  {emojiForDescription(item.summary)}
                </span>{' '}
                {item.label}
              </p>
              <p className="forecast-summary">{item.summary}</p>
            </div>
            <p>
              <strong>{Math.round(item.high)}°C</strong>
              <span style={{ marginLeft: '0.35rem', color: '#94a3b8' }}>
                {Math.round(item.low)}°C
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

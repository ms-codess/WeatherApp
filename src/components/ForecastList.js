'use client';

import { emojiForDescription } from '../lib/weatherEmojis';

export default function ForecastList({ items, rangeLabel }) {
  if (!items || !items.length) {
    return (
      <section className="panel-section forecast-list">
        <h3>Forecast preview</h3>
        <p className="search-hint">
          Select a destination and date range to view a tailored outlook.
        </p>
      </section>
    );
  }

  return (
    <section className="panel-section forecast-list">
      <div className="forecast-list__header">
        <h3>{rangeLabel || 'Forecast'}</h3>
      </div>
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
            <p className="forecast-temps">
              <strong>{Math.round(item.high)}°C</strong>
              <span className="forecast-low">{Math.round(item.low)}°C</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

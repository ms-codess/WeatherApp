'use client';

const weatherEmojis = [
  { match: /thunder|storm|lightning/i, icon: '⛈️' },
  { match: /snow|sleet/i, icon: '❄️' },
  { match: /hail/i, icon: '🌨️' },
  { match: /rain|shower|drizzle/i, icon: '🌧️' },
  { match: /mist|fog/i, icon: '🌫️' },
  { match: /cloud/i, icon: '☁️' },
  { match: /sun|clear/i, icon: '☀️' },
];

function getEmoji(description) {
  if (!description) return '🌤️';
  const entry = weatherEmojis.find((emoji) => emoji.match.test(description));
  return entry?.icon || '🌤️';
}

export default function WeatherCard({ data }) {
  if (!data) {
    return (
      <div className="panel-section weather-card">
        <p>Search for a location to preview weather.</p>
      </div>
    );
  }

  const emoji = getEmoji(data.description);

  return (
    <div className="panel-section weather-card">
      <div className="weather-card__header">
        <div>
          <p className="eyebrow">Current weather</p>
          <h3>{data.location}</h3>
          <p className="weather-card__summary">
            <span role="img" aria-label="conditions">
              {emoji}
            </span>{' '}
            {data.description}
          </p>
        </div>
        <div className="weather-card__temperature">
          {data.icon ? (
            <img src={data.icon} alt={data.description} width={72} height={72} />
          ) : null}
          <span>{Math.round(data.temperature)}°C</span>
          <small>Feels like {Math.round(data.feelsLike)}°C</small>
        </div>
      </div>
      <dl className="weather-card__metrics">
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

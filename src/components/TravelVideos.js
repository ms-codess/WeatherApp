'use client';

const FALLBACK_TOPICS = [
  { label: 'Highlights', query: 'travel guide' },
  { label: 'Food crawl', query: 'street food vlog' },
  { label: 'Hidden gems', query: 'things to do' },
];

export default function TravelVideos({ locationLabel }) {
  if (!locationLabel) return null;

  return (
    <div className="panel-section travel-videos">
      <div className="travel-videos__header">
        <div>
          <p className="eyebrow">Travel videos</p>
          <strong>Plan visually before you go</strong>
        </div>
        <span role="img" aria-label="video camera">
          📹
        </span>
      </div>
      <ul className="travel-videos__list">
        {FALLBACK_TOPICS.map((topic) => {
          const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
            `${locationLabel} ${topic.query}`
          )}`;
          return (
            <li key={topic.label} className="travel-video-card">
              <div>
                <strong>{topic.label}</strong>
                <p>{locationLabel} · {topic.query}</p>
              </div>
              <a href={url} target="_blank" rel="noreferrer" className="pill-link">
                Watch
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

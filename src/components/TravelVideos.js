'use client';

import { useEffect, useState } from 'react';

const FALLBACK_TOPICS = [
  { label: 'Highlights', query: 'travel guide' },
  { label: 'Food crawl', query: 'street food vlog' },
  { label: 'Hidden gems', query: 'things to do' },
];

export default function TravelVideos({ locationLabel }) {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!locationLabel) return;
    let active = true;
    async function fetchVideos() {
      try {
        setStatus('loading');
        const response = await fetch(
          `/api/videos?q=${encodeURIComponent(locationLabel)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load videos.');
        }
        if (active) {
          setVideos(data.videos || []);
          setStatus('loaded');
        }
      } catch (error) {
        if (active) {
          setStatus('error');
          setVideos([]);
        }
      }
    }
    fetchVideos();
    return () => {
      active = false;
    };
  }, [locationLabel]);

  if (!locationLabel) return null;

  const display = videos.length
    ? videos
    : FALLBACK_TOPICS.map((topic) => ({
        id: topic.label,
        title: topic.label,
        channel: locationLabel,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${locationLabel} ${topic.query}`
        )}`,
        description: `${locationLabel} · ${topic.query}`,
      }));

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
      {status === 'loading' ? <p className="search-hint">Loading videos…</p> : null}
      <ul className="travel-videos__list">
        {display.map((video) => (
          <li key={video.id || video.title} className="travel-video-card">
            <div>
              <strong>{video.title}</strong>
              <p>{video.channel || video.description}</p>
            </div>
            <a href={video.url} target="_blank" rel="noreferrer" className="pill-link">
              Watch
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK_TOPICS = [
  { label: 'Highlights', query: 'travel guide' },
  { label: 'Food crawl', query: 'street food' },
  { label: 'Hidden gems', query: 'things to do' },
];

export default function TravelVideos({ locationLabel, startDate, endDate }) {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!locationLabel) return;
    let active = true;
    async function fetchVideos() {
      try {
        setStatus('loading');
        const params = new URLSearchParams({ q: `${locationLabel} tourism` });
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);
        const response = await fetch(`/api/videos?${params.toString()}`);
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
  }, [locationLabel, startDate, endDate]);

  if (!locationLabel) return null;

  const display = videos.length
    ? videos
    : FALLBACK_TOPICS.map((topic, index) => ({
        id: `${topic.label}-${index}`,
        title: `${locationLabel} ${topic.label}`,
        channel: `${locationLabel} tourism board`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${locationLabel} ${topic.query} tourism`
        )}`,
        thumbnail: `https://source.unsplash.com/500x300/?${encodeURIComponent(
          `${locationLabel} tourism`
        )}&sig=${index}`,
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
            <div className="travel-video-card__image">
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes="(max-width: 600px) 100vw, 240px"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="travel-video-card__body">
              <strong>{video.title}</strong>
              <p>{video.channel}</p>
              <a href={video.url} target="_blank" rel="noreferrer" className="pill-link">
                Watch on YouTube
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

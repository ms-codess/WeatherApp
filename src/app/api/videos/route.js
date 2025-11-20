import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function GET(request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'YouTube API key missing' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const descriptor = describeSeason(start, end);
  const searchTerm = `${query} ${descriptor} tourism`.trim();

  const params = new URLSearchParams({
    key: API_KEY,
    part: 'snippet',
    q: searchTerm,
    maxResults: '3',
    type: 'video',
    safeSearch: 'moderate',
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: text }, { status: 502 });
  }

  const payload = await response.json();
  const videos = (payload.items || []).map((item) => ({
    id: item.id?.videoId,
    title: item.snippet?.title,
    channel: item.snippet?.channelTitle,
    url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    thumbnail: item.snippet?.thumbnails?.medium?.url,
  }));

  return NextResponse.json({ videos });
}

function describeSeason(start, end) {
  const base = start || end;
  if (!base) return '';
  const date = new Date(base);
  if (Number.isNaN(date)) return '';
  return date.toLocaleString('en', { month: 'long' });
}

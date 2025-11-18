import { NextResponse } from 'next/server'

const API_KEY = process.env.SERPAPI_API_KEY
const SERP_ENDPOINT = 'https://serpapi.com/search.json'

export async function GET(request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'SerpApi key is not configured.' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: `${query} 3 day itinerary`,
    google_domain: 'google.com',
    gl: 'us',
    hl: 'en',
    num: '3',
    api_key: API_KEY,
  })

  const response = await fetch(`${SERP_ENDPOINT}?${params.toString()}`)
  if (!response.ok) {
    const text = await response.text()
    return NextResponse.json({ error: text }, { status: 502 })
  }

  const payload = await response.json()
  const items = (payload.organic_results || []).slice(0, 3).map((item) => ({
    title: item.title,
    snippet: item.snippet,
    link: item.link,
  }))

  return NextResponse.json({ results: items })
}

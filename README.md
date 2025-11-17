# weather-trip-planner

## Overview
Plan routes while checking forecasts for each destination before committing to travel dates.

## Features
- Search destinations and instantly preview multi-day forecasts
- Create, list, and export planned trips with notes and weather context
- View trip routes on an interactive map and inspect detailed weather cards

## Tech Stack
Next.js App Router, React, Prisma, PostgreSQL (configurable), and a third-party weather API such as WeatherAPI or OpenWeather.

## Architecture
- `src/app` holds UI routes, nested layouts, and API route handlers
- `src/components` centralizes shared UI elements (forms, map, cards)
- `src/lib` exposes Prisma client, weather fetcher, and validation helpers
- `prisma` directory stores the database schema and migration history

## Setup
1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env` and update credentials
3. Run `npx prisma migrate dev` to provision the database
4. Start the dev server with `npm run dev`

## Environment Variables
`DATABASE_URL`, `WEATHER_API_KEY`, and optional `NEXT_PUBLIC_MAPBOX_TOKEN` for map rendering.

## Scripts
`npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run prisma:generate`, and `npm run prisma:migrate`.

## Future Improvements
- Realtime weather alerts and push notifications
- Offline caching for trip details and map tiles
- Collaboration features for sharing trip plans with friends
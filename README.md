# weather-trip-planner

## Overview
Plan routes while checking forecasts for each destination before committing to travel dates.

## Features
- Search any location (city, postal code, coordinates, or landmark) and instantly preview current conditions plus a five-day outlook.
- "Use my location" shortcut powered by the browser Geolocation API.
- Map-first UI with Leaflet + OpenStreetMap tiles and basic weather icons.
- Full CRUD for saved trips persisted in SQLite via Prisma; each record stores normalized location metadata and the weather JSON payload.
- Trip detail views include historical forecast summaries, editing, and deletion controls.
- CSV/JSON export endpoint for sharing saved trips.

## Tech Stack
Next.js App Router, React, Prisma, SQLite (file-based dev database), Leaflet/react-leaflet for maps, and OpenWeather APIs for geocoding + weather.

## Architecture
- `src/app` holds UI routes, nested layouts, and API route handlers
- `src/components` centralizes shared UI elements (forms, map, cards)
- `src/lib` exposes Prisma client, weather fetcher, and validation helpers
- `prisma` directory stores the database schema and migration history

## Setup
1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env` and add your OpenWeather API key
3. Run `npx prisma db push` (or `npx prisma migrate dev`) to create/update `dev.db`
4. Start the dev server with `npm run dev`

## Environment Variables
`DATABASE_URL` (default `file:./dev.db`) and `OPENWEATHER_API_KEY`.  
Leaflet uses public OpenStreetMap tiles so no map token is required.

## Scripts
`npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run prisma:generate`, and `npm run prisma:migrate`.

## Future Improvements
- Realtime weather alerts and push notifications
- Offline caching for trip details and map tiles
- Collaboration features for sharing trip plans with friends

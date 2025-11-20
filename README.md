 🌦️ Weather Trip Planner

A full-stack weather exploration tool to help users preview conditions for any destination before choosing travel dates. Search locations, view live forecasts, save trips, and inspect detailed weather summaries — all in a simple map-driven interface.

---

## ✨ Features

- 🔍 **Flexible Search** — Find weather by city, postal code, coordinates, or landmark, with instant current conditions and a 5-day outlook.
- 📍 **Use My Location** — Browser Geolocation API for one-tap weather at your current position.
- 🗺️ **Map-First UI** — Interactive map built with Leaflet + OpenStreetMap tiles and clean weather icons.
- 💾 **Full CRUD for Trips** — Store trips in SQLite via Prisma, including normalized location metadata and full weather JSON payloads.
- 📘 **Trip Detail Pages** — Edit saved trips, review stored forecasts, or delete records.
- 📤 **Data Export** — Export saved trips as CSV or JSON for sharing or analysis.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js App Router, React  
- **Backend:** Next.js API Routes  
- **Database:** SQLite (file-based), Prisma ORM  
- **Weather API:** OpenWeather (geocoding + forecast)  
- **Maps:** Leaflet / react-leaflet with OpenStreetMap tiles  

---

## 🧱 Architecture

```

src/
app/          → UI routes, layouts, API handlers
components/   → Shared UI components (forms, map, cards)
lib/          → Prisma client, weather fetcher, validation helpers
prisma/
schema.prisma → Database schema
migrations/   → Migration history

````

---

Here is the corrected and polished **Setup + Environment Variables** section, with environment variables moved *out* of Setup and clearly separated.

````md
## 🚀 Setup

1. Install dependencies  
   ```bash
   npm install
````

2. Copy `.env.example` → `.env`

3. Apply the database schema

   ```bash
   npx prisma db push
   ```

   or

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables

* `DATABASE_URL` — defaults to `file:./dev.db`
* `OPENWEATHER_API_KEY` — required for weather + geocoding
* `SERPAPI_API_KEY` — used for enrichment features (YouTube results, place details, and other SerpAPI lookups)

Leaflet uses public OpenStreetMap tiles — **no map token required.**


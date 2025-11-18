import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { validateTripRequest } from '../../../../lib/validation';
import {
  fetchWeather,
  geocodeLocation,
  summarizeWeather,
} from '../../../../lib/weatherClient';

function parseId(params) {
  const id = Number(params?.tripId ?? params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function hydrateTrip(trip) {
  if (!trip) return trip;
  if (trip.weather?.weatherJson) {
    try {
      trip.weather.weatherJson = JSON.parse(trip.weather.weatherJson);
    } catch {
      // keep raw string
    }
  }
  return trip;
}

async function findTrip(id) {
  return prisma.trip.findUnique({
    where: { id },
    include: { weather: true },
  });
}

export async function GET(_request, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: 'Invalid trip id.' }, { status: 400 });
  }

  const trip = await findTrip(id);
  if (!trip) {
    return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
  }

  return NextResponse.json(hydrateTrip(trip));
}

export async function PUT(request, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: 'Invalid trip id.' }, { status: 400 });
  }

  const existing = await findTrip(id);
  if (!existing) {
    return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
  }

  const payload = await request.json();
  const validation = validateTripRequest(payload);
  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const locationChanged =
    validation.locationInput !== existing.locationInput?.trim();
  const datesChanged =
    existing.startDate.getTime() !== validation.start.getTime() ||
    existing.endDate.getTime() !== validation.end.getTime();

  let location = null;
  if (locationChanged) {
    location = await geocodeLocation(validation.locationInput);
  }

  const shouldRefreshWeather = locationChanged || datesChanged;
  let weatherPayload;
  if (shouldRefreshWeather) {
    const lat = locationChanged ? location.lat : existing.latitude;
    const lon = locationChanged ? location.lon : existing.longitude;
    weatherPayload = await fetchWeather(lat, lon);
  }
  const summary = weatherPayload ? summarizeWeather(weatherPayload) : null;

  const data = {
    tripName: validation.name,
    locationInput: validation.locationInput,
    startDate: validation.start,
    endDate: validation.end,
  };

  if (locationChanged && location) {
    data.normalizedCity = location.city;
    data.normalizedCountry = location.country;
    data.latitude = location.lat;
    data.longitude = location.lon;
  }

  if (shouldRefreshWeather && weatherPayload) {
    data.weather = {
      upsert: {
        update: {
          weatherJson: JSON.stringify(weatherPayload),
          avgTemp: summary?.avgTemp ?? existing.weather?.avgTemp ?? null,
          minTemp: summary?.minTemp ?? existing.weather?.minTemp ?? null,
          maxTemp: summary?.maxTemp ?? existing.weather?.maxTemp ?? null,
          summaryText:
            summary?.summaryText ?? existing.weather?.summaryText ?? null,
        },
        create: {
          weatherJson: JSON.stringify(weatherPayload),
          avgTemp: summary?.avgTemp ?? null,
          minTemp: summary?.minTemp ?? null,
          maxTemp: summary?.maxTemp ?? null,
          summaryText: summary?.summaryText ?? null,
        },
      },
    };
  }

  const updated = await prisma.trip.update({
    where: { id },
    data,
    include: { weather: true },
  });

  return NextResponse.json(hydrateTrip(updated));
}

export async function DELETE(_request, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: 'Invalid trip id.' }, { status: 400 });
  }

  await prisma.tripWeather.deleteMany({ where: { tripId: id } });
  await prisma.trip.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

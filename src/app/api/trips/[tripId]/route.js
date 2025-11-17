import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/db';
import { validateTripRequest } from '../../../../lib/validation';
import {
  geocodeLocation,
  fetchWeather,
  summarizeWeather,
} from '../../../../lib/weatherClient';

function parseId(params) {
  const value = Number(params?.tripId ?? params?.id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function toDecimal(value) {
  return value == null ? null : new Prisma.Decimal(Number(value).toFixed(7));
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
    return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
  }

  const trip = await findTrip(id);
  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PUT(request, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
  }

  const existing = await findTrip(id);
  if (!existing) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  const payload = await request.json();
  const validation = validateTripRequest(payload);
  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const trimmedLocation = payload.locationInput.trim();
  const locationChanged = trimmedLocation !== existing.inputLocation;
  const datesChanged =
    existing.startDate.getTime() !== validation.start.getTime() ||
    existing.endDate.getTime() !== validation.end.getTime();

  let locationData = null;
  if (locationChanged) {
    locationData = await geocodeLocation(trimmedLocation);
  }

  const needsWeatherRefresh = locationChanged || datesChanged;
  let weatherPayload;
  if (needsWeatherRefresh) {
    const lat = locationChanged
      ? locationData.lat
      : Number(existing.latitude);
    const lon = locationChanged
      ? locationData.lon
      : Number(existing.longitude);
    weatherPayload = await fetchWeather(lat, lon);
  }

  const summary = weatherPayload ? summarizeWeather(weatherPayload) : null;

  const data = {
    tripName: payload.tripName.trim(),
    inputLocation: trimmedLocation,
    startDate: validation.start,
    endDate: validation.end,
  };

  if (locationChanged && locationData) {
    data.normalizedCity = locationData.city;
    data.normalizedCountry = locationData.country;
    data.latitude = toDecimal(locationData.lat);
    data.longitude = toDecimal(locationData.lon);
  }

  if (needsWeatherRefresh && weatherPayload) {
    data.weather = {
      upsert: {
        update: {
          weatherJson: weatherPayload,
          avgTemp: summary?.avgTemp ?? existing.weather?.avgTemp ?? null,
          minTemp: summary?.minTemp ?? existing.weather?.minTemp ?? null,
          maxTemp: summary?.maxTemp ?? existing.weather?.maxTemp ?? null,
          summaryText:
            summary?.summaryText ?? existing.weather?.summaryText ?? null,
        },
        create: {
          weatherJson: weatherPayload,
          avgTemp: summary?.avgTemp ?? null,
          minTemp: summary?.minTemp ?? null,
          maxTemp: summary?.maxTemp ?? null,
          summaryText: summary?.summaryText ?? null,
        },
      },
    };
  }

  try {
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data,
      include: { weather: true },
    });
    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error('Failed to update trip', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: 'Invalid trip id' }, { status: 400 });
  }

  try {
    await prisma.tripWeather.deleteMany({ where: { tripId: id } });
    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trip', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

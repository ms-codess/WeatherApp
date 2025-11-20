import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../lib/db';
import { validateTripRequest } from '../../../lib/validation';
import {
  fetchWeather,
  geocodeLocation,
  summarizeWeather,
} from '../../../lib/weatherClient';

function hydrateTrip(trip) {
  if (!trip) return trip;
  if (trip.weather?.weatherJson) {
    try {
      trip.weather.weatherJson = JSON.parse(trip.weather.weatherJson);
    } catch {
      // keep as-is
    }
  }
  return trip;
}

function handlePrismaError(error, actionLabel = 'request') {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'Database schema is not applied.',
          hint: 'Run `npx prisma db push` to create tables, then retry.',
        },
        { status: 500 }
      );
    }
  }
  return NextResponse.json(
    { error: error.message || `Failed to ${actionLabel}.` },
    { status: 500 }
  );
}

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tripName: true,
        locationInput: true,
        normalizedCity: true,
        normalizedCountry: true,
        latitude: true,
        longitude: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        weather: {
          select: {
            avgTemp: true,
            minTemp: true,
            maxTemp: true,
            summaryText: true,
          },
        },
      },
    });
    return NextResponse.json(trips);
  } catch (error) {
    console.error('Failed to fetch trips', error);
    return handlePrismaError(error, 'load trips');
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const validation = validateTripRequest(payload);

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    let location = null;
    try {
      location = await geocodeLocation(validation.locationInput);
    } catch (geoError) {
      console.warn('Geocode failed, saving without normalized location', geoError);
      location = {
        city: null,
        country: null,
        lat: null,
        lon: null,
        label: validation.locationInput,
      };
    }

    let weatherPayload = null;
    let summary = {};
    if (location.lat != null && location.lon != null) {
      try {
        weatherPayload = await fetchWeather(location.lat, location.lon);
        summary = summarizeWeather(weatherPayload);
      } catch (weatherError) {
        console.warn('Weather fetch failed, saving trip without weather', weatherError);
      }
    }

    const trip = await prisma.trip.create({
      data: {
        tripName: validation.name,
        locationInput: validation.locationInput,
        normalizedCity: location.city,
        normalizedCountry: location.country,
        latitude: location.lat,
        longitude: location.lon,
        startDate: validation.start,
        endDate: validation.end,
        weather: weatherPayload
          ? {
              create: {
                weatherJson: JSON.stringify(weatherPayload || {}),
                avgTemp: summary.avgTemp ?? null,
                minTemp: summary.minTemp ?? null,
                maxTemp: summary.maxTemp ?? null,
                summaryText: summary.summaryText ?? null,
              },
            }
          : undefined,
      },
      include: { weather: true },
    });

    return NextResponse.json(hydrateTrip(trip), { status: 201 });
  } catch (error) {
    console.error('Failed to create trip', error);
    return handlePrismaError(error, 'create trip');
  }
}

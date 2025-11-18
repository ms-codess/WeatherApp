import { NextResponse } from 'next/server';
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
    return NextResponse.json(
      { error: 'Failed to load trips.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const validation = validateTripRequest(payload);

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const location = await geocodeLocation(validation.locationInput);
    const weatherPayload = await fetchWeather(location.lat, location.lon);
    const summary = summarizeWeather(weatherPayload);

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
        weather: {
          create: {
            weatherJson: JSON.stringify(weatherPayload),
            avgTemp: summary.avgTemp,
            minTemp: summary.minTemp,
            maxTemp: summary.maxTemp,
            summaryText: summary.summaryText,
          },
        },
      },
      include: { weather: true },
    });

    return NextResponse.json(hydrateTrip(trip), { status: 201 });
  } catch (error) {
    console.error('Failed to create trip', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create trip.' },
      { status: 500 }
    );
  }
}

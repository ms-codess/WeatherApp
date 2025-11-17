import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../lib/db';
import { validateTripRequest } from '../../../lib/validation';
import {
  geocodeLocation,
  fetchWeather,
  summarizeWeather,
} from '../../../lib/weatherClient';

function toDecimal(value) {
  return value == null ? null : new Prisma.Decimal(Number(value).toFixed(7));
}

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tripName: true,
        inputLocation: true,
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
      { error: 'Failed to load trips' },
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

    const location = await geocodeLocation(payload.locationInput);
    const weatherPayload = await fetchWeather(location.lat, location.lon);
    const summary = summarizeWeather(weatherPayload);

    const trip = await prisma.trip.create({
      data: {
        tripName: payload.tripName.trim(),
        inputLocation: payload.locationInput.trim(),
        normalizedCity: location.city,
        normalizedCountry: location.country,
        latitude: toDecimal(location.lat),
        longitude: toDecimal(location.lon),
        startDate: validation.start,
        endDate: validation.end,
        weather: {
          create: {
            weatherJson: weatherPayload,
            avgTemp: summary.avgTemp,
            minTemp: summary.minTemp,
            maxTemp: summary.maxTemp,
            summaryText: summary.summaryText,
          },
        },
      },
      include: { weather: true },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Failed to create trip', error);
    const status = error.message?.includes('location') ? 400 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create trip' },
      { status }
    );
  }
}

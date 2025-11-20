import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET() {
  try {
    const favorites = await prisma.favorite.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Failed to load favorites', error);
    return NextResponse.json(
      { error: 'Unable to load favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const errors = [];

    if (!payload?.label) errors.push('Label is required.');
    if (typeof payload?.latitude !== 'number' || typeof payload?.longitude !== 'number') {
      errors.push('Valid coordinates are required.');
    }
    if (!payload?.locationInput) errors.push('Original search input is missing.');

    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        label: payload.label,
        locationInput: payload.locationInput,
        normalizedCity: payload.normalizedCity,
        normalizedCountry: payload.normalizedCountry,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Failed to save favorite', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A favorite for that location already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Unable to save favorite.' },
      { status: 500 }
    );
  }
}

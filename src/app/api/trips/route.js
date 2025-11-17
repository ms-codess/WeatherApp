import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { validateTripPayload } from '../../../lib/validation';

export async function GET() {
  const trips = await prisma.trip.findMany({ orderBy: { startDate: 'asc' } });
  return NextResponse.json(trips);
}

export async function POST(request) {
  const payload = await request.json();
  const validation = validateTripPayload(payload);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const trip = await prisma.trip.create({ data: validation.data });
  return NextResponse.json(trip, { status: 201 });
}
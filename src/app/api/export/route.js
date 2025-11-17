import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

function toCsv(trips) {
  const header = [
    'Trip Name',
    'Location',
    'City',
    'Country',
    'Start Date',
    'End Date',
    'Summary',
  ];
  const rows = trips.map((trip) =>
    [
      trip.tripName,
      trip.locationInput,
      trip.normalizedCity ?? '',
      trip.normalizedCountry ?? '',
      trip.startDate.toISOString(),
      trip.endDate.toISOString(),
      trip.weather?.summaryText ?? '',
    ].join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'csv').toLowerCase();

  const trips = await prisma.trip.findMany({
    include: { weather: true },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'json') {
    return NextResponse.json(trips);
  }

  const csv = toCsv(trips);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="trips.csv"',
    },
  });
}

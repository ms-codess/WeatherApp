import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET() {
  const trips = await prisma.trip.findMany({
    include: { weatherReports: true },
  });

  const csv = ['Trip,Origin,Destination,Start,End'];
  trips.forEach((trip) => {
    csv.push(
      [trip.name, trip.origin, trip.destination, trip.startDate.toISOString(), trip.endDate.toISOString()].join(',')
    );
  });

  return new NextResponse(csv.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="trips.csv"',
    },
  });
}
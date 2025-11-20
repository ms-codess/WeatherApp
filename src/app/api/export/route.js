import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import prisma from '../../../lib/db';

function baseTrip(trip) {
  return {
    tripName: trip.tripName,
    locationInput: trip.locationInput,
    normalizedCity: trip.normalizedCity ?? '',
    normalizedCountry: trip.normalizedCountry ?? '',
    startDate: trip.startDate?.toISOString() ?? '',
    endDate: trip.endDate?.toISOString() ?? '',
    weatherSummary: trip.weather?.summaryText ?? '',
  };
}

function escapeCsv(value = '') {
  const safe = String(value ?? '');
  if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function toCsv(trips) {
  const header = [
    'Trip Name',
    'Location Input',
    'City',
    'Country',
    'Start Date',
    'End Date',
    'Summary',
  ];
  const rows = trips.map((trip) =>
    [
      escapeCsv(trip.tripName),
      escapeCsv(trip.locationInput),
      escapeCsv(trip.normalizedCity),
      escapeCsv(trip.normalizedCountry),
      escapeCsv(trip.startDate),
      escapeCsv(trip.endDate),
      escapeCsv(trip.weatherSummary),
    ].join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

function escapeXml(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toXml(trips) {
  const body = trips
    .map(
      (trip) => `
    <trip>
      <name>${escapeXml(trip.tripName)}</name>
      <location>${escapeXml(trip.locationInput)}</location>
      <city>${escapeXml(trip.normalizedCity)}</city>
      <country>${escapeXml(trip.normalizedCountry)}</country>
      <startDate>${escapeXml(trip.startDate)}</startDate>
      <endDate>${escapeXml(trip.endDate)}</endDate>
      <summary>${escapeXml(trip.weatherSummary)}</summary>
    </trip>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><trips>${body}\n</trips>`;
}

function toMarkdown(trips) {
  const header =
    '| Trip Name | Location | City | Country | Start Date | End Date | Summary |\n|' +
    ' --- |'.repeat(7);
  const rows = trips.map(
    (trip) =>
      `| ${trip.tripName || '-'} | ${trip.locationInput || '-'} | ${trip.normalizedCity || '-'} | ${
        trip.normalizedCountry || '-'
      } | ${trip.startDate || '-'} | ${trip.endDate || '-'} | ${trip.weatherSummary || '-'} |`
  );
  return [header, ...rows].join('\n');
}

function createPdfBuffer(trips) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Weather Trip Planner Export', { align: 'center' });
    doc.moveDown();

    trips.forEach((trip, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${trip.tripName}`, { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(10);
      doc.text(`Location: ${trip.locationInput}`);
      doc.text(`City/Country: ${trip.normalizedCity}, ${trip.normalizedCountry}`);
      doc.text(`Dates: ${trip.startDate} → ${trip.endDate}`);
      doc.text(`Summary: ${trip.weatherSummary || '—'}`);
      doc.moveDown();
    });

    doc.end();
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'csv').toLowerCase();
  const tripId = searchParams.get('tripId');

  const rawTrips = await prisma.trip.findMany({
    include: { weather: true },
    orderBy: { createdAt: 'desc' },
    where: tripId ? { id: Number(tripId) || -1 } : undefined,
  });

  const trips = rawTrips.map((trip) => baseTrip(trip));

  if (format === 'json') {
    return NextResponse.json(rawTrips);
  }

  if (format === 'xml') {
    const xml = toXml(trips);
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="trips.xml"',
      },
    });
  }

  if (format === 'markdown' || format === 'md') {
    const markdown = toMarkdown(trips);
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="trips.md"',
      },
    });
  }

  if (format === 'pdf') {
    const pdfBuffer = await createPdfBuffer(trips);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="trips.pdf"',
      },
    });
  }

  // default CSV
  const csv = toCsv(trips);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="trips.csv"',
    },
  });
}

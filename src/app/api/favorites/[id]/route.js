import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

export async function DELETE(_request, { params }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid favorite id.' }, { status: 400 });
  }
  try {
    await prisma.favorite.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete favorite', error);
    return NextResponse.json(
      { error: 'Unable to delete favorite.' },
      { status: 500 }
    );
  }
}

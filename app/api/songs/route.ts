import { NextResponse } from 'next/server';
import { readSongs } from '@/lib/data';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const songs = readSongs();
    return NextResponse.json(songs);
  } catch {
    return NextResponse.json({ error: 'Failed to read songs' }, { status: 500 });
  }
}

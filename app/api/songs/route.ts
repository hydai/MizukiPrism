import { NextResponse } from 'next/server';
import { readSongs } from '@/lib/data';
import { createSongsResponse } from '@/lib/songsApi';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const songs = readSongs();
    return createSongsResponse(songs);
  } catch {
    return NextResponse.json({ error: 'Failed to read songs' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import type { Song } from './types';

export function createSongsResponse(songs: Song[]): NextResponse<Song[]> {
  return NextResponse.json(songs);
}

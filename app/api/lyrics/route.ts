import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SongLyrics } from '@/lib/types';

const lyricsPath = path.join(process.cwd(), 'data', 'metadata', 'song-lyrics.json');

export async function GET() {
  try {
    const raw = fs.readFileSync(lyricsPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const lyrics: SongLyrics[] = Array.isArray(parsed) ? parsed : [];
    return NextResponse.json(lyrics);
  } catch {
    return NextResponse.json([]);
  }
}

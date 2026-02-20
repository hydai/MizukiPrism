import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SongMetadata, ArtistInfo } from '@/lib/types';

const metadataDir = path.join(process.cwd(), 'data', 'metadata');

function readJsonFile<T>(filePath: string): T[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const songMetadata = readJsonFile<SongMetadata>(path.join(metadataDir, 'song-metadata.json'));
  const artistInfo = readJsonFile<ArtistInfo>(path.join(metadataDir, 'artist-info.json'));

  return NextResponse.json({ songMetadata, artistInfo });
}

import { NextResponse } from 'next/server';
import { readSongs, writeSongs, generateId } from '@/lib/data';
import { Song } from '@/lib/types';

export async function GET() {
  try {
    const songs = readSongs();
    return NextResponse.json(songs);
  } catch {
    return NextResponse.json({ error: 'Failed to read songs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, originalArtist, tags } = body;

    if (!title || !originalArtist) {
      return NextResponse.json({ error: 'title and originalArtist are required' }, { status: 400 });
    }

    const songs = readSongs();

    // Check if song with same title and artist already exists
    const existing = songs.find(
      s => s.title.toLowerCase() === title.toLowerCase() &&
           s.originalArtist.toLowerCase() === originalArtist.toLowerCase()
    );

    if (existing) {
      return NextResponse.json(existing);
    }

    const newSong: Song = {
      id: generateId('song'),
      title,
      originalArtist,
      tags: tags || [],
      performances: [],
    };

    songs.push(newSong);
    writeSongs(songs);

    return NextResponse.json(newSong, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
  }
}

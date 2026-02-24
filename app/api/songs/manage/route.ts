import { NextResponse } from 'next/server';
import { readSongs, writeSongs, generateId } from '@/lib/data';
import { Song } from '@/lib/types';

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, originalArtist, tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const songs = readSongs();
    const index = songs.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const effectiveTitle = title !== undefined ? title : songs[index].title;
    const effectiveArtist = originalArtist !== undefined ? originalArtist : songs[index].originalArtist;

    const duplicate = songs.find(
      s => s.id !== id &&
        s.title.toLowerCase() === effectiveTitle.toLowerCase() &&
        s.originalArtist.toLowerCase() === effectiveArtist.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        { error: '已存在相同歌名與原唱者的歌曲' },
        { status: 409 }
      );
    }

    if (title !== undefined) songs[index].title = title;
    if (originalArtist !== undefined) songs[index].originalArtist = originalArtist;
    if (tags !== undefined) songs[index].tags = tags;

    writeSongs(songs);

    return NextResponse.json(songs[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const songs = readSongs();
    const index = songs.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const [deleted] = songs.splice(index, 1);
    writeSongs(songs);

    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}

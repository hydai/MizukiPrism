import { NextResponse } from 'next/server';
import { readSongs, writeSongs } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const songs = readSongs();
    const song = songs.find(s => s.id === id);

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch {
    return NextResponse.json({ error: 'Failed to read song' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, originalArtist, tags } = body;

    const songs = readSongs();
    const index = songs.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Compute effective title and artist (use new values if provided, fall back to existing)
    const effectiveTitle = title !== undefined ? title : songs[index].title;
    const effectiveArtist = originalArtist !== undefined ? originalArtist : songs[index].originalArtist;

    // Check if another song already has the same title+artist combination
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

    // Update only provided fields
    if (title !== undefined) songs[index].title = title;
    if (originalArtist !== undefined) songs[index].originalArtist = originalArtist;
    if (tags !== undefined) songs[index].tags = tags;

    writeSongs(songs);

    return NextResponse.json(songs[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

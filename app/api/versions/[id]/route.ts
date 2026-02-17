import { NextResponse } from 'next/server';
import { readSongs, writeSongs, validateTimestamp, timestampToSeconds } from '@/lib/data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { startTimestamp, endTimestamp, note } = body;

    if (startTimestamp !== undefined && !validateTimestamp(startTimestamp)) {
      return NextResponse.json(
        { error: '請輸入有效的時間戳格式（如 1:23:45 或 01:23:45）' },
        { status: 400 }
      );
    }

    if (endTimestamp && !validateTimestamp(endTimestamp)) {
      return NextResponse.json(
        { error: '請輸入有效的時間戳格式（如 1:23:45 或 01:23:45）' },
        { status: 400 }
      );
    }

    const songs = readSongs();

    // Find which song contains this performance
    let songIndex = -1;
    let perfIndex = -1;
    for (let i = 0; i < songs.length; i++) {
      const pi = songs[i].performances.findIndex(p => p.id === id);
      if (pi !== -1) {
        songIndex = i;
        perfIndex = pi;
        break;
      }
    }

    if (songIndex === -1) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
    }

    const perf = songs[songIndex].performances[perfIndex];

    if (startTimestamp !== undefined) {
      perf.timestamp = timestampToSeconds(startTimestamp);
    }
    if (endTimestamp !== undefined) {
      perf.endTimestamp = endTimestamp ? timestampToSeconds(endTimestamp) : null;
    }
    if (note !== undefined) {
      perf.note = note;
    }

    songs[songIndex].performances[perfIndex] = perf;
    writeSongs(songs);

    return NextResponse.json({
      song: songs[songIndex],
      performance: perf,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const songs = readSongs();

    let songIndex = -1;
    let perfIndex = -1;
    for (let i = 0; i < songs.length; i++) {
      const pi = songs[i].performances.findIndex(p => p.id === id);
      if (pi !== -1) {
        songIndex = i;
        perfIndex = pi;
        break;
      }
    }

    if (songIndex === -1) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
    }

    const [deleted] = songs[songIndex].performances.splice(perfIndex, 1);
    writeSongs(songs);

    return NextResponse.json({
      deleted,
      song: songs[songIndex],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import {
  readSongs,
  writeSongs,
  readStreams,
  generateId,
  validateTimestamp,
  timestampToSeconds,
} from '@/lib/data';
import { Performance } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      songTitle,
      originalArtist,
      songTags,
      streamId,
      startTimestamp,
      endTimestamp,
      note,
      songId: existingSongId,
    } = body;

    if (!songTitle || !originalArtist || !streamId || !startTimestamp) {
      return NextResponse.json(
        { error: 'songTitle, originalArtist, streamId, and startTimestamp are required' },
        { status: 400 }
      );
    }

    if (!validateTimestamp(startTimestamp)) {
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

    // Get stream info
    const streams = readStreams();
    const stream = streams.find(s => s.id === streamId);
    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const songs = readSongs();

    // Find existing song or create new one
    let song;
    if (existingSongId) {
      song = songs.find(s => s.id === existingSongId);
    }

    if (!song) {
      // Search by title + artist
      song = songs.find(
        s =>
          s.title.toLowerCase() === songTitle.toLowerCase() &&
          s.originalArtist.toLowerCase() === originalArtist.toLowerCase()
      );
    }

    if (!song) {
      // Create new song
      song = {
        id: generateId('song'),
        title: songTitle,
        originalArtist,
        tags: songTags || [],
        performances: [],
      };
      songs.push(song);
    }

    const startSeconds = timestampToSeconds(startTimestamp);
    const endSeconds = endTimestamp ? timestampToSeconds(endTimestamp) : null;

    const newPerformance: Performance = {
      id: generateId('perf'),
      streamId,
      date: stream.date,
      streamTitle: stream.title,
      videoId: stream.videoId,
      timestamp: startSeconds,
      endTimestamp: endSeconds,
      note: note || '',
    };

    const songIndex = songs.findIndex(s => s.id === song!.id);
    songs[songIndex].performances.push(newPerformance);

    writeSongs(songs);

    return NextResponse.json(
      {
        song: songs[songIndex],
        performance: newPerformance,
        isNewSong: songIndex === songs.length - 1,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}

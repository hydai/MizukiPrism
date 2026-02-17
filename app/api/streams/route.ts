import { NextResponse } from 'next/server';
import { readStreams, writeStreams, generateId, validateYoutubeUrl, extractVideoId } from '@/lib/data';
import { Stream } from '@/lib/types';

export async function GET() {
  try {
    const streams = readStreams();
    return NextResponse.json(streams);
  } catch {
    return NextResponse.json({ error: 'Failed to read streams' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, youtubeUrl } = body;

    if (!title || !date || !youtubeUrl) {
      return NextResponse.json({ error: 'title, date, and youtubeUrl are required' }, { status: 400 });
    }

    if (!validateYoutubeUrl(youtubeUrl)) {
      return NextResponse.json({ error: '請輸入有效的 YouTube URL' }, { status: 400 });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: '請輸入有效的 YouTube URL' }, { status: 400 });
    }

    const streams = readStreams();

    const newStream: Stream = {
      id: generateId('stream'),
      title,
      date,
      videoId,
      youtubeUrl,
    };

    streams.push(newStream);
    writeStreams(streams);

    return NextResponse.json(newStream, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 });
  }
}

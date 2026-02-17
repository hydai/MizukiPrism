import { NextResponse } from 'next/server';
import { readStreams, writeStreams, validateYoutubeUrl, extractVideoId } from '@/lib/data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, date, youtubeUrl } = body;

    const streams = readStreams();
    const index = streams.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (youtubeUrl !== undefined) {
      if (!validateYoutubeUrl(youtubeUrl)) {
        return NextResponse.json({ error: '請輸入有效的 YouTube URL' }, { status: 400 });
      }
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json({ error: '請輸入有效的 YouTube URL' }, { status: 400 });
      }
      streams[index].youtubeUrl = youtubeUrl;
      streams[index].videoId = videoId;
    }

    if (title !== undefined) streams[index].title = title;
    if (date !== undefined) streams[index].date = date;

    writeStreams(streams);

    return NextResponse.json(streams[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const streams = readStreams();
    const index = streams.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const [deleted] = streams.splice(index, 1);
    writeStreams(streams);

    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { readStreams } from '@/lib/data';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const streams = readStreams();
    return NextResponse.json(streams);
  } catch {
    return NextResponse.json({ error: 'Failed to read streams' }, { status: 500 });
  }
}

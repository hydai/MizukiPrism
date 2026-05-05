import assert from 'node:assert/strict';
import { createSongsResponse } from '../lib/songsApi';
import type { Song } from '../lib/types';

const fixtureSongs: Song[] = [
  {
    id: 'song-fixture',
    title: 'Fixture Song',
    originalArtist: 'Fixture Artist',
    tags: [],
    performances: [
      {
        id: 'performance-clipped',
        streamId: 'stream-fixture',
        date: '2026-01-01',
        streamTitle: 'Fixture Stream',
        videoId: 'fixture-video',
        timestamp: 30,
        endTimestamp: 90,
        note: '',
      },
      {
        id: 'performance-full-length',
        streamId: 'stream-fixture',
        date: '2026-01-02',
        streamTitle: 'Fixture Stream',
        videoId: 'fixture-video',
        timestamp: 120,
        endTimestamp: null,
        note: '',
      },
    ],
  },
];

async function main(): Promise<void> {
  const response = createSongsResponse(fixtureSongs);
  const payload = await response.json() as Song[];

  assert.equal(response.status, 200);
  assert.equal(payload[0]?.performances[0]?.endTimestamp, 90);
  assert.equal(payload[0]?.performances[1]?.endTimestamp, null);
}

void main();

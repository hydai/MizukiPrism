import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateArtistInfoData,
  validateSongMetadataData,
  validateSongsData,
  validateStreamsData,
} from '../shared/schema';

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8'));
}

function assertValid(result: { ok: boolean; errors: string[] }, label: string): void {
  assert.equal(result.ok, true, `${label} contract errors:\n${result.errors.join('\n')}`);
}

assertValid(validateSongsData(readJson('data/songs.json')), 'songs.json');
assertValid(validateStreamsData(readJson('data/streams.json')), 'streams.json');
assertValid(validateSongMetadataData(readJson('data/metadata/song-metadata.json')), 'song-metadata.json');
assertValid(validateArtistInfoData(readJson('data/metadata/artist-info.json')), 'artist-info.json');

const invalidSongs = validateSongsData([
  {
    id: 'song-invalid',
    title: 'Invalid',
    originalArtist: 'Artist',
    tags: ['test'],
    performances: [
      {
        id: 'performance-invalid',
        streamId: 'stream-invalid',
        date: 'not-a-date',
        streamTitle: 'Stream',
        videoId: 'video',
        timestamp: 30,
        endTimestamp: 10,
        note: '',
      },
    ],
  },
]);

assert.equal(invalidSongs.ok, false);
assert.ok(
  invalidSongs.errors.some((error) => error.includes('songs[0].performances[0].date')),
  'invalid song data should report the nested date path',
);
assert.ok(
  invalidSongs.errors.some((error) => error.includes('endTimestamp')),
  'invalid song data should report impossible timestamp ranges',
);

const nullableMetadata = validateSongMetadataData([
  {
    songId: 'song-1',
    fetchStatus: 'no_match',
    matchConfidence: null,
    albumArtUrl: null,
    albumArtUrls: null,
    albumTitle: null,
    deezerTrackId: null,
    deezerArtistId: null,
    trackDuration: null,
    fetchedAt: '2026-02-25T16:22:42.362305+00:00',
    lastError: null,
  },
]);

assert.equal(nullableMetadata.ok, true);

const missingRequiredMetadataField = validateSongMetadataData([
  {
    songId: 'song-1',
    fetchStatus: 'no_match',
    matchConfidence: null,
    albumArtUrl: null,
    albumTitle: null,
    deezerTrackId: null,
    deezerArtistId: null,
    trackDuration: null,
    fetchedAt: '2026-02-25T16:22:42.362305+00:00',
    lastError: null,
  },
]);

assert.equal(missingRequiredMetadataField.ok, false);
assert.ok(
  missingRequiredMetadataField.errors.some((error) => error.includes('songMetadata[0].albumArtUrls')),
  'song metadata without albumArtUrls should fail the runtime contract',
);

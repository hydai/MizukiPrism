import assert from 'node:assert/strict';
import {
  buildAlbumArtMap,
  mergeAlbumArtIntoSongs,
  sortStreamsByDateDesc,
  type CatalogSong,
  type CatalogStream,
} from '../app/lib/catalogData';

const albumArtBySongId = buildAlbumArtMap([
  {
    songId: 'song-1',
    albumArtUrl: null,
    albumArtUrls: { small: 'https://example.com/small.jpg' },
  },
  {
    songId: 'song-2',
    albumArtUrl: 'https://example.com/manual.jpg',
    albumArtUrls: { small: 'https://example.com/ignored.jpg' },
  },
  {
    songId: 'song-3',
    albumArtUrl: null,
    albumArtUrls: null,
  },
]);

assert.equal(albumArtBySongId.get('song-1'), 'https://example.com/small.jpg');
assert.equal(albumArtBySongId.get('song-2'), 'https://example.com/manual.jpg');
assert.equal(albumArtBySongId.has('song-3'), false);

const songs: CatalogSong[] = [
  {
    id: 'song-1',
    title: 'Song 1',
    originalArtist: 'Artist 1',
    tags: [],
    performances: [],
  },
  {
    id: 'song-3',
    title: 'Song 3',
    originalArtist: 'Artist 3',
    tags: [],
    performances: [],
  },
];

const mergedSongs = mergeAlbumArtIntoSongs(songs, albumArtBySongId);

assert.equal(mergedSongs[0]?.albumArtUrl, 'https://example.com/small.jpg');
assert.equal(mergedSongs[1]?.albumArtUrl, undefined);
assert.equal(songs[0]?.albumArtUrl, undefined, 'merge should not mutate source songs');

const streams: CatalogStream[] = [
  { id: 'old', title: 'Old', date: '2021-01-01', videoId: 'old-video' },
  { id: 'new', title: 'New', date: '2024-01-01', videoId: 'new-video' },
  { id: 'middle', title: 'Middle', date: '2023-01-01', videoId: 'middle-video' },
];

const sortedStreams = sortStreamsByDateDesc(streams);

assert.deepEqual(
  sortedStreams.map((stream) => stream.id),
  ['new', 'middle', 'old'],
);
assert.deepEqual(
  streams.map((stream) => stream.id),
  ['old', 'new', 'middle'],
  'sort should not mutate source streams',
);

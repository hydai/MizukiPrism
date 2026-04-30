import assert from 'node:assert/strict';
import {
  buildAlbumArtMap,
  buildCatalogArtistList,
  buildCatalogYears,
  filterCatalogStreamsByYears,
  filterFlattenedCatalogSongs,
  filterGroupedCatalogSongs,
  flattenCatalogSongs,
  mergeAlbumArtIntoSongs,
  sortCatalogSongsByTitle,
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

assert.deepEqual(buildCatalogYears(streams), [2024, 2023, 2021]);
assert.deepEqual(
  filterCatalogStreamsByYears(streams, new Set([2023])).map((stream) => stream.id),
  ['middle'],
);
assert.strictEqual(filterCatalogStreamsByYears(streams, new Set()), streams);

const songsWithPerformances: CatalogSong[] = [
  {
    id: 'song-b',
    title: 'Beta Song',
    originalArtist: 'Artist B',
    tags: [],
    albumArtUrl: 'https://example.com/beta.jpg',
    performances: [
      {
        id: 'perf-old',
        streamId: 'old',
        date: '2021-01-01',
        streamTitle: 'Old Karaoke',
        videoId: 'old-video',
        timestamp: 120,
        endTimestamp: null,
        note: '',
      },
    ],
  },
  {
    id: 'song-a',
    title: 'Alpha Song',
    originalArtist: 'Artist A',
    tags: [],
    performances: [
      {
        id: 'perf-new',
        streamId: 'new',
        date: '2024-01-01',
        streamTitle: 'New Karaoke',
        videoId: 'new-video',
        timestamp: 60,
        endTimestamp: 90,
        note: 'encore',
      },
      {
        id: 'perf-middle',
        streamId: 'middle',
        date: '2023-01-01',
        streamTitle: 'Middle Show',
        videoId: 'middle-video',
        timestamp: 180,
        endTimestamp: null,
        note: '',
      },
    ],
  },
];

assert.deepEqual(buildCatalogArtistList(songsWithPerformances), ['Artist A', 'Artist B']);

const flattenedSongs = flattenCatalogSongs(songsWithPerformances);

assert.deepEqual(
  flattenedSongs.map((song) => song.performanceId),
  ['perf-new', 'perf-middle', 'perf-old'],
);
assert.equal(flattenedSongs[0]?.streamId, 'new');
assert.equal(flattenedSongs[0]?.year, 2024);
assert.equal(flattenedSongs[0]?.endTimestamp, 90);
assert.equal(flattenedSongs[1]?.endTimestamp, undefined);
assert.deepEqual(
  songsWithPerformances.map((song) => song.id),
  ['song-b', 'song-a'],
  'flatten should not mutate source songs',
);

assert.deepEqual(
  filterFlattenedCatalogSongs(flattenedSongs, {
    searchTerm: 'karaoke',
    selectedStreamId: 'new',
    selectedArtist: 'Artist A',
    selectedYears: new Set([2024]),
  }).map((song) => song.performanceId),
  ['perf-new'],
);

const sortedCatalogSongs = sortCatalogSongsByTitle(songsWithPerformances);

assert.deepEqual(
  sortedCatalogSongs.map((song) => song.id),
  ['song-a', 'song-b'],
);
assert.deepEqual(
  songsWithPerformances.map((song) => song.id),
  ['song-b', 'song-a'],
  'title sort should not mutate source songs',
);

assert.deepEqual(
  filterGroupedCatalogSongs(sortedCatalogSongs, {
    searchTerm: '',
    selectedStreamId: null,
    selectedArtist: null,
    selectedYears: new Set([2022]),
  }).map((song) => song.id),
  [],
);
assert.deepEqual(
  filterGroupedCatalogSongs(sortedCatalogSongs, {
    searchTerm: 'alpha',
    selectedStreamId: 'middle',
    selectedArtist: 'Artist A',
    selectedYears: new Set([2023]),
  }).map((song) => song.id),
  ['song-a'],
);

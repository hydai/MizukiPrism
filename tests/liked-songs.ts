import assert from 'node:assert/strict';
import { isLikedSong, toggleLikedSongMutation } from '../app/lib/likedSongs';
import type { LikeableVersion, LikedVersion } from '../app/types/likedSongs';

const likeableVersion: LikeableVersion = {
  performanceId: 'performance-1',
  songTitle: 'Song 1',
  originalArtist: 'Artist 1',
  videoId: 'video-1',
  timestamp: 30,
  endTimestamp: 90,
  albumArtUrl: 'https://example.test/album.jpg',
};

const likedVersion: LikedVersion = {
  ...likeableVersion,
  likedAt: 1000,
};

const otherLikedVersion: LikedVersion = {
  performanceId: 'performance-2',
  songTitle: 'Song 2',
  originalArtist: 'Artist 2',
  videoId: 'video-2',
  timestamp: 60,
  likedAt: 900,
};

assert.equal(isLikedSong([likedVersion], likedVersion.performanceId), true);
assert.equal(isLikedSong([likedVersion], 'missing'), false);

assert.deepEqual(toggleLikedSongMutation([], likeableVersion, { now: 2000 }), [
  {
    ...likeableVersion,
    likedAt: 2000,
  },
]);

assert.deepEqual(
  toggleLikedSongMutation([otherLikedVersion], likeableVersion, { now: 2000 }),
  [
    {
      ...likeableVersion,
      likedAt: 2000,
    },
    otherLikedVersion,
  ],
);

assert.deepEqual(toggleLikedSongMutation([likedVersion, otherLikedVersion], likeableVersion), [
  otherLikedVersion,
]);

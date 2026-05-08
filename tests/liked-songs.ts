import assert from 'node:assert/strict';
import { isLikedSong, toggleLikedSongMutation } from '../app/lib/likedSongs';
import {
  LIKED_SONGS_STORAGE_KEY,
  readStoredLikedSongs,
  saveStoredLikedSongs,
  writeStoredLikedSongs,
} from '../app/lib/likedSongsStorage';
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

function createLikedSongsStorage(
  initialValues: Record<string, string> = {},
  options: { failSet?: boolean } = {},
) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.failSet) {
        throw new Error('setItem failed');
      }
      values.set(key, value);
    },
    values,
  };
}

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

function restoreLocalStorage(): void {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorageDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'localStorage');
}

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

assert.equal(readStoredLikedSongs(), null);
assert.equal(readStoredLikedSongs(createLikedSongsStorage()), null);
assert.deepEqual(
  readStoredLikedSongs(createLikedSongsStorage({
    [LIKED_SONGS_STORAGE_KEY]: JSON.stringify([likedVersion]),
  })),
  [likedVersion],
);

const writableStorage = createLikedSongsStorage();
writeStoredLikedSongs([likedVersion], writableStorage);
assert.equal(writableStorage.values.get(LIKED_SONGS_STORAGE_KEY), JSON.stringify([likedVersion]));

const saveStorage = createLikedSongsStorage();
assert.equal(saveStoredLikedSongs([likedVersion], saveStorage), true);
assert.equal(saveStorage.values.get(LIKED_SONGS_STORAGE_KEY), JSON.stringify([likedVersion]));

assert.equal(saveStoredLikedSongs([likedVersion]), false);
assert.equal(saveStoredLikedSongs([likedVersion], createLikedSongsStorage({}, { failSet: true })), false);

try {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('localStorage unavailable');
    },
  });

  assert.equal(readStoredLikedSongs(), null);
  assert.equal(saveStoredLikedSongs([likedVersion]), false);
} finally {
  restoreLocalStorage();
}

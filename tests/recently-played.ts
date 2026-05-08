import assert from 'node:assert/strict';
import { RECENT_PLAYS_MAX_ENTRIES, addRecentPlayMutation } from '../app/lib/recentlyPlayed';
import {
  RECENTLY_PLAYED_STORAGE_KEY,
  readStoredRecentPlays,
  saveStoredRecentPlays,
  writeStoredRecentPlays,
} from '../app/lib/recentlyPlayedStorage';
import type { RecentPlay, RecentPlayable } from '../app/types/recentlyPlayed';
import { captureGlobalStorage, setThrowingStorageGetter } from './storage-test-utils';

const recentPlayable: RecentPlayable = {
  performanceId: 'performance-1',
  songTitle: 'Song 1',
  originalArtist: 'Artist 1',
  videoId: 'video-1',
  timestamp: 30,
  endTimestamp: 90,
  albumArtUrl: 'https://example.test/album.jpg',
};

const existingPlay: RecentPlay = {
  ...recentPlayable,
  playedAt: 1000,
};

const otherPlay: RecentPlay = {
  performanceId: 'performance-2',
  songTitle: 'Song 2',
  originalArtist: 'Artist 2',
  videoId: 'video-2',
  timestamp: 60,
  playedAt: 900,
};

function createRecentlyPlayedStorage(
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

const restoreLocalStorage = captureGlobalStorage('localStorage');

assert.deepEqual(addRecentPlayMutation([], recentPlayable, { now: 2000 }), [
  {
    ...recentPlayable,
    playedAt: 2000,
  },
]);

assert.deepEqual(addRecentPlayMutation([otherPlay], recentPlayable, { now: 2000 }), [
  {
    ...recentPlayable,
    playedAt: 2000,
  },
  otherPlay,
]);

assert.deepEqual(addRecentPlayMutation([existingPlay, otherPlay], recentPlayable, { now: 2000 }), [
  {
    ...recentPlayable,
    playedAt: 2000,
  },
  otherPlay,
]);

const maxedRecentPlays = Array.from({ length: RECENT_PLAYS_MAX_ENTRIES + 1 }, (_, index): RecentPlay => ({
  performanceId: `performance-${index + 2}`,
  songTitle: `Song ${index + 2}`,
  originalArtist: 'Artist',
  videoId: `video-${index + 2}`,
  timestamp: index,
  playedAt: index,
}));

const cappedRecentPlays = addRecentPlayMutation(maxedRecentPlays, recentPlayable, { now: 2000 });

assert.equal(cappedRecentPlays.length, RECENT_PLAYS_MAX_ENTRIES);
assert.deepEqual(cappedRecentPlays[0], {
  ...recentPlayable,
  playedAt: 2000,
});
assert.equal(
  cappedRecentPlays[cappedRecentPlays.length - 1]?.performanceId,
  `performance-${RECENT_PLAYS_MAX_ENTRIES}`,
);

assert.equal(readStoredRecentPlays(), null);
assert.equal(readStoredRecentPlays(createRecentlyPlayedStorage()), null);
assert.deepEqual(
  readStoredRecentPlays(createRecentlyPlayedStorage({
    [RECENTLY_PLAYED_STORAGE_KEY]: JSON.stringify([existingPlay]),
  })),
  [existingPlay],
);

const writableStorage = createRecentlyPlayedStorage();
writeStoredRecentPlays([existingPlay], writableStorage);
assert.equal(writableStorage.values.get(RECENTLY_PLAYED_STORAGE_KEY), JSON.stringify([existingPlay]));

const saveStorage = createRecentlyPlayedStorage();
assert.equal(saveStoredRecentPlays([existingPlay], saveStorage), true);
assert.equal(saveStorage.values.get(RECENTLY_PLAYED_STORAGE_KEY), JSON.stringify([existingPlay]));

assert.equal(saveStoredRecentPlays([existingPlay]), false);
assert.equal(saveStoredRecentPlays([existingPlay], createRecentlyPlayedStorage({}, { failSet: true })), false);

try {
  setThrowingStorageGetter('localStorage', new Error('localStorage unavailable'));

  assert.equal(readStoredRecentPlays(), null);
  assert.equal(saveStoredRecentPlays([existingPlay]), false);
} finally {
  restoreLocalStorage();
}

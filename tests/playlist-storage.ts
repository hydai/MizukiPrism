import assert from 'node:assert/strict';
import {
  PLAYLIST_STORAGE_KEY,
  PLAYLIST_STORAGE_QUOTA_ERROR,
  PLAYLIST_STORAGE_SAVE_ERROR,
  PLAYLIST_STORAGE_UNSUPPORTED_ERROR,
  getPlaylistStorageWriteErrorMessage,
  readStoredPlaylists,
  saveStoredPlaylists,
  writeStoredPlaylists,
} from '../app/lib/playlistStorage';
import type { Playlist } from '../app/types/playlist';
import { captureGlobalStorage, setThrowingStorageGetter } from './storage-test-utils';

interface PlaylistStorageOptions {
  setError?: unknown;
}

function createPlaylistStorage(
  initialValues: Record<string, string> = {},
  options: PlaylistStorageOptions = {},
) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.setError !== undefined) {
        throw options.setError;
      }
      values.set(key, value);
    },
    values,
  };
}

const restoreLocalStorage = captureGlobalStorage('localStorage');

const playlist: Playlist = {
  id: 'playlist-1',
  name: 'My Playlist',
  versions: [
    {
      performanceId: 'performance-1',
      songTitle: 'Song 1',
      originalArtist: 'Artist 1',
      videoId: 'video-1',
      timestamp: 30,
    },
  ],
  createdAt: 1000,
  updatedAt: 2000,
};

assert.equal(readStoredPlaylists(), null);
assert.equal(readStoredPlaylists(createPlaylistStorage()), null);

assert.deepEqual(
  readStoredPlaylists(
    createPlaylistStorage({
      [PLAYLIST_STORAGE_KEY]: JSON.stringify([
        playlist,
        {
          ...playlist,
          id: 'playlist-2',
          updatedAt: undefined,
        },
        {
          ...playlist,
          id: 'playlist-3',
          createdAt: 0,
          updatedAt: 0,
        },
      ]),
    }),
  ),
  [
    playlist,
    {
      ...playlist,
      id: 'playlist-2',
      updatedAt: playlist.createdAt,
    },
    {
      ...playlist,
      id: 'playlist-3',
      createdAt: 0,
      updatedAt: 0,
    },
  ],
);

const writableStorage = createPlaylistStorage();
writeStoredPlaylists([playlist], writableStorage);
assert.equal(writableStorage.values.get(PLAYLIST_STORAGE_KEY), JSON.stringify([playlist]));

const saveStorage = createPlaylistStorage();
assert.deepEqual(saveStoredPlaylists([playlist], saveStorage), { success: true });
assert.equal(saveStorage.values.get(PLAYLIST_STORAGE_KEY), JSON.stringify([playlist]));

const unavailableSaveResult = saveStoredPlaylists([playlist]);
assert.equal(unavailableSaveResult.success, false);
if (!unavailableSaveResult.success) {
  assert.equal(unavailableSaveResult.error, PLAYLIST_STORAGE_SAVE_ERROR);
}

const quotaError = { name: 'QuotaExceededError' };
assert.deepEqual(saveStoredPlaylists([playlist], createPlaylistStorage({}, { setError: quotaError })), {
  success: false,
  error: PLAYLIST_STORAGE_QUOTA_ERROR,
  cause: quotaError,
});

assert.equal(
  getPlaylistStorageWriteErrorMessage({ name: 'QuotaExceededError' }),
  PLAYLIST_STORAGE_QUOTA_ERROR,
);
assert.equal(getPlaylistStorageWriteErrorMessage({ code: 22 }), PLAYLIST_STORAGE_QUOTA_ERROR);
assert.equal(
  getPlaylistStorageWriteErrorMessage({ name: 'NS_ERROR_DOM_QUOTA_REACHED' }),
  PLAYLIST_STORAGE_QUOTA_ERROR,
);
assert.equal(
  getPlaylistStorageWriteErrorMessage({ name: 'SecurityError' }),
  PLAYLIST_STORAGE_UNSUPPORTED_ERROR,
);
assert.equal(
  getPlaylistStorageWriteErrorMessage(new Error('unexpected')),
  PLAYLIST_STORAGE_SAVE_ERROR,
);

try {
  const securityError = { name: 'SecurityError' };
  setThrowingStorageGetter('localStorage', securityError);

  assert.equal(readStoredPlaylists(), null);
  const saveResult = saveStoredPlaylists([playlist]);
  assert.equal(saveResult.success, false);
  if (!saveResult.success) {
    assert.equal(saveResult.error, PLAYLIST_STORAGE_UNSUPPORTED_ERROR);
    assert.equal(saveResult.cause, securityError);
  }
} finally {
  restoreLocalStorage();
}

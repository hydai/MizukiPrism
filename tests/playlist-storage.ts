import assert from 'node:assert/strict';
import {
  PLAYLIST_STORAGE_KEY,
  PLAYLIST_STORAGE_QUOTA_ERROR,
  PLAYLIST_STORAGE_SAVE_ERROR,
  PLAYLIST_STORAGE_UNSUPPORTED_ERROR,
  getPlaylistStorageWriteErrorMessage,
  readStoredPlaylists,
  writeStoredPlaylists,
} from '../app/lib/playlistStorage';
import type { Playlist } from '../app/types/playlist';

function createPlaylistStorage(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  };
}

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

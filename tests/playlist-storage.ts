import assert from 'node:assert/strict';
import {
  PLAYLIST_STORAGE_KEY,
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
  ],
);

const writableStorage = createPlaylistStorage();
writeStoredPlaylists([playlist], writableStorage);
assert.equal(writableStorage.values.get(PLAYLIST_STORAGE_KEY), JSON.stringify([playlist]));

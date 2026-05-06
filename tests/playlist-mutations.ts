import assert from 'node:assert/strict';
import {
  PLAYLIST_NAME_EMPTY_ERROR,
  PLAYLIST_NOT_FOUND_ERROR,
  PLAYLIST_VERSION_EXISTS_ERROR,
  addVersionToPlaylistMutation,
  createPlaylistMutation,
  deletePlaylistMutation,
  removeVersionFromPlaylistMutation,
  renamePlaylistMutation,
  reorderPlaylistVersionsMutation,
} from '../app/lib/playlistMutations';
import type { Playlist, PlaylistVersion } from '../app/types/playlist';

const versionOne: PlaylistVersion = {
  performanceId: 'performance-1',
  songTitle: 'Song 1',
  originalArtist: 'Artist 1',
  videoId: 'video-1',
  timestamp: 30,
};

const versionTwo: PlaylistVersion = {
  performanceId: 'performance-2',
  songTitle: 'Song 2',
  originalArtist: 'Artist 2',
  videoId: 'video-2',
  timestamp: 60,
};

const playlist: Playlist = {
  id: 'playlist-1',
  name: 'My Playlist',
  versions: [versionOne, versionTwo],
  createdAt: 1000,
  updatedAt: 2000,
};

assert.deepEqual(createPlaylistMutation([], '   '), {
  success: false,
  error: PLAYLIST_NAME_EMPTY_ERROR,
});

assert.deepEqual(createPlaylistMutation([playlist], '  New Playlist  ', { now: 3000, idSuffix: 'abc123' }), {
  success: true,
  playlists: [
    playlist,
    {
      id: 'playlist-3000-abc123',
      name: 'New Playlist',
      versions: [],
      createdAt: 3000,
      updatedAt: 3000,
    },
  ],
});

assert.deepEqual(deletePlaylistMutation([playlist], playlist.id), []);

assert.deepEqual(renamePlaylistMutation([playlist], playlist.id, '   '), {
  success: false,
  error: PLAYLIST_NAME_EMPTY_ERROR,
});

assert.deepEqual(renamePlaylistMutation([playlist], playlist.id, '  Renamed  ', { now: 3000 }), {
  success: true,
  playlists: [{ ...playlist, name: 'Renamed', updatedAt: 3000 }],
});

assert.deepEqual(addVersionToPlaylistMutation([playlist], 'missing', versionOne), {
  success: false,
  error: PLAYLIST_NOT_FOUND_ERROR,
});

assert.deepEqual(addVersionToPlaylistMutation([playlist], playlist.id, versionOne), {
  success: false,
  error: PLAYLIST_VERSION_EXISTS_ERROR,
});

const versionThree: PlaylistVersion = {
  performanceId: 'performance-3',
  songTitle: 'Song 3',
  originalArtist: 'Artist 3',
  videoId: 'video-3',
  timestamp: 90,
};

assert.deepEqual(addVersionToPlaylistMutation([playlist], playlist.id, versionThree, { now: 3000 }), {
  success: true,
  playlists: [{ ...playlist, versions: [...playlist.versions, versionThree], updatedAt: 3000 }],
});

assert.deepEqual(removeVersionFromPlaylistMutation([playlist], playlist.id, versionOne.performanceId, { now: 3000 }), [
  { ...playlist, versions: [versionTwo], updatedAt: 3000 },
]);

assert.deepEqual(reorderPlaylistVersionsMutation([playlist], playlist.id, 1, 0, { now: 3000 }), [
  { ...playlist, versions: [versionTwo, versionOne], updatedAt: 3000 },
]);

assert.deepEqual(
  reorderPlaylistVersionsMutation([playlist], playlist.id, -1, 0, { now: 3000 }),
  [playlist],
);
assert.deepEqual(
  reorderPlaylistVersionsMutation([playlist], playlist.id, 0, 2, { now: 3000 }),
  [playlist],
);
assert.deepEqual(
  reorderPlaylistVersionsMutation([playlist], playlist.id, 1, 1, { now: 3000 }),
  [playlist],
);

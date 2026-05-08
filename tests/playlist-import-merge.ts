import assert from 'node:assert/strict';
import { mergeImportedPlaylists } from '../app/lib/playlistImportMerge';
import type { Playlist, PlaylistVersion } from '../app/types/playlist';

const version: PlaylistVersion = {
  performanceId: 'performance-1',
  songTitle: 'Song 1',
  originalArtist: 'Artist 1',
  videoId: 'video-1',
  timestamp: 30,
};

const localPlaylist: Playlist = {
  id: 'playlist-1',
  name: 'Local playlist',
  versions: [version],
  createdAt: 1000,
  updatedAt: 2000,
};

const secondLocalPlaylist: Playlist = {
  id: 'playlist-2',
  name: 'Second local playlist',
  versions: [version],
  createdAt: 1100,
  updatedAt: 2100,
};

function createIdGenerator(ids: string[]): () => string {
  let index = 0;
  return () => ids[index++] ?? `playlist-fallback-${index}`;
}

const importedNewPlaylist: Playlist = {
  id: 'playlist-3',
  name: 'Imported playlist',
  versions: [version],
  createdAt: 1200,
  updatedAt: 2200,
};

assert.deepEqual(
  mergeImportedPlaylists([localPlaylist], [importedNewPlaylist]),
  [localPlaylist, importedNewPlaylist],
);

const importedOlderPlaylist: Playlist = {
  ...localPlaylist,
  name: 'Imported older playlist',
  updatedAt: 1500,
};

assert.deepEqual(
  mergeImportedPlaylists([localPlaylist], [importedOlderPlaylist], {
    createImportedPlaylistId: createIdGenerator(['playlist-copy-1']),
  }),
  [
    localPlaylist,
    {
      ...importedOlderPlaylist,
      id: 'playlist-copy-1',
      name: 'Imported older playlist（匯入）',
    },
  ],
);

const importedSameAgePlaylist: Playlist = {
  ...localPlaylist,
  name: 'Imported same age playlist',
  updatedAt: localPlaylist.updatedAt,
};

assert.deepEqual(
  mergeImportedPlaylists([localPlaylist], [importedSameAgePlaylist], {
    createImportedPlaylistId: createIdGenerator(['playlist-copy-2']),
  }),
  [
    localPlaylist,
    {
      ...importedSameAgePlaylist,
      id: 'playlist-copy-2',
      name: 'Imported same age playlist（匯入）',
    },
  ],
);

const importedNewerPlaylist: Playlist = {
  ...localPlaylist,
  name: 'Imported newer playlist',
  updatedAt: 3000,
};

assert.deepEqual(
  mergeImportedPlaylists([localPlaylist], [importedNewerPlaylist], {
    createImportedPlaylistId: createIdGenerator(['playlist-copy-3']),
  }),
  [
    importedNewerPlaylist,
    {
      ...localPlaylist,
      id: 'playlist-copy-3',
      name: 'Local playlist（匯入）',
    },
  ],
);

const importedOlderSecondPlaylist: Playlist = {
  ...secondLocalPlaylist,
  name: 'Imported older second playlist',
  updatedAt: 1600,
};

assert.deepEqual(
  mergeImportedPlaylists(
    [localPlaylist, secondLocalPlaylist],
    [importedNewerPlaylist, importedOlderSecondPlaylist],
    {
      createImportedPlaylistId: createIdGenerator(['playlist-copy-4', 'playlist-copy-5']),
    },
  ),
  [
    importedNewerPlaylist,
    secondLocalPlaylist,
    {
      ...localPlaylist,
      id: 'playlist-copy-4',
      name: 'Local playlist（匯入）',
    },
    {
      ...importedOlderSecondPlaylist,
      id: 'playlist-copy-5',
      name: 'Imported older second playlist（匯入）',
    },
  ],
);

const importedNewerDuplicatePlaylist: Playlist = {
  ...importedNewPlaylist,
  name: 'Imported newer duplicate playlist',
  updatedAt: 2300,
};

assert.deepEqual(
  mergeImportedPlaylists(
    [localPlaylist],
    [importedNewPlaylist, importedNewerDuplicatePlaylist],
    {
      createImportedPlaylistId: createIdGenerator(['playlist-copy-6']),
    },
  ),
  [
    localPlaylist,
    importedNewerDuplicatePlaylist,
    {
      ...importedNewPlaylist,
      id: 'playlist-copy-6',
      name: 'Imported playlist（匯入）',
    },
  ],
);

assert.deepEqual(
  mergeImportedPlaylists([localPlaylist], [importedOlderPlaylist], {
    createImportedPlaylistId: createIdGenerator(['playlist-1', 'playlist-copy-7']),
  }),
  [
    localPlaylist,
    {
      ...importedOlderPlaylist,
      id: 'playlist-copy-7',
      name: 'Imported older playlist（匯入）',
    },
  ],
);

const localPlaylists = [localPlaylist];
const importedPlaylists = [importedOlderPlaylist];
mergeImportedPlaylists(localPlaylists, importedPlaylists, {
  createImportedPlaylistId: createIdGenerator(['playlist-copy-8']),
});
assert.deepEqual(localPlaylists, [localPlaylist]);
assert.deepEqual(importedPlaylists, [importedOlderPlaylist]);

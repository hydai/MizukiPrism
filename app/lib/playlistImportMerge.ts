import type { Playlist } from '../types/playlist';

interface PlaylistImportMergeOptions {
  createImportedPlaylistId?: () => string;
}

function createDefaultImportedPlaylistId(): string {
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createImportedPlaylistCopy(
  playlist: Playlist,
  createImportedPlaylistId: () => string,
): Playlist {
  return {
    ...playlist,
    id: createImportedPlaylistId(),
    name: `${playlist.name}（匯入）`,
  };
}

export function mergeImportedPlaylists(
  localPlaylists: Playlist[],
  importedPlaylists: Playlist[],
  options: PlaylistImportMergeOptions = {},
): Playlist[] {
  const createImportedPlaylistId = options.createImportedPlaylistId ?? createDefaultImportedPlaylistId;
  const localMap = new Map(localPlaylists.map(playlist => [playlist.id, playlist]));
  const merged: Playlist[] = [...localPlaylists];

  for (const imported of importedPlaylists) {
    const existing = localMap.get(imported.id);
    if (!existing) {
      merged.push(imported);
      continue;
    }

    if (imported.updatedAt > existing.updatedAt) {
      const index = merged.findIndex(playlist => playlist.id === existing.id);
      if (index !== -1) {
        merged[index] = imported;
      }
      merged.push(createImportedPlaylistCopy(existing, createImportedPlaylistId));
      continue;
    }

    merged.push(createImportedPlaylistCopy(imported, createImportedPlaylistId));
  }

  return merged;
}

import type { Playlist } from '../types/playlist';

interface PlaylistImportMergeOptions {
  createImportedPlaylistId?: () => string;
}

function createDefaultImportedPlaylistId(): string {
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createUniqueImportedPlaylistId(
  createImportedPlaylistId: () => string,
  usedPlaylistIds: Set<string>,
): string {
  let id = createImportedPlaylistId();
  while (usedPlaylistIds.has(id)) {
    id = createImportedPlaylistId();
  }
  return id;
}

function createImportedPlaylistCopy(
  playlist: Playlist,
  createImportedPlaylistId: () => string,
  usedPlaylistIds: Set<string>,
): Playlist {
  return {
    ...playlist,
    id: createUniqueImportedPlaylistId(createImportedPlaylistId, usedPlaylistIds),
    name: `${playlist.name}（匯入）`,
  };
}

export function mergeImportedPlaylists(
  localPlaylists: Playlist[],
  importedPlaylists: Playlist[],
  options: PlaylistImportMergeOptions = {},
): Playlist[] {
  const createImportedPlaylistId = options.createImportedPlaylistId ?? createDefaultImportedPlaylistId;
  const usedPlaylistIds = new Set(localPlaylists.map(playlist => playlist.id));
  const mergedPlaylistIndexesById = new Map<string, number>();
  const merged: Playlist[] = [...localPlaylists];

  for (const [index, playlist] of merged.entries()) {
    if (!mergedPlaylistIndexesById.has(playlist.id)) {
      mergedPlaylistIndexesById.set(playlist.id, index);
    }
  }

  const appendPlaylist = (playlist: Playlist) => {
    mergedPlaylistIndexesById.set(playlist.id, merged.length);
    usedPlaylistIds.add(playlist.id);
    merged.push(playlist);
  };

  for (const imported of importedPlaylists) {
    const existingIndex = mergedPlaylistIndexesById.get(imported.id);
    if (existingIndex == null) {
      appendPlaylist(imported);
      continue;
    }

    const existing = merged[existingIndex];
    if (imported.updatedAt > existing.updatedAt) {
      merged[existingIndex] = imported;
      appendPlaylist(createImportedPlaylistCopy(existing, createImportedPlaylistId, usedPlaylistIds));
      continue;
    }

    appendPlaylist(createImportedPlaylistCopy(imported, createImportedPlaylistId, usedPlaylistIds));
  }

  return merged;
}

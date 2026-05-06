import type { Playlist, PlaylistVersion } from '../types/playlist';

export const PLAYLIST_NAME_EMPTY_ERROR = '播放清單名稱不可為空';
export const PLAYLIST_NOT_FOUND_ERROR = '播放清單不存在';
export const PLAYLIST_VERSION_EXISTS_ERROR = '此版本已在播放清單中';

type PlaylistMutationResult =
  | { success: true; playlists: Playlist[] }
  | { success: false; error: string };

interface PlaylistMutationOptions {
  now?: number;
  idSuffix?: string;
}

function getTimestamp(options: PlaylistMutationOptions): number {
  return options.now ?? Date.now();
}

function getIdSuffix(options: PlaylistMutationOptions): string {
  return options.idSuffix ?? Math.random().toString(36).substr(2, 9);
}

function createPlaylistId(now: number, idSuffix: string): string {
  return `playlist-${now}-${idSuffix}`;
}

export function createPlaylistMutation(
  playlists: Playlist[],
  name: string,
  options: PlaylistMutationOptions = {},
): PlaylistMutationResult {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: PLAYLIST_NAME_EMPTY_ERROR };
  }

  const now = getTimestamp(options);
  const newPlaylist: Playlist = {
    id: createPlaylistId(now, getIdSuffix(options)),
    name: trimmedName,
    versions: [],
    createdAt: now,
    updatedAt: now,
  };

  return { success: true, playlists: [...playlists, newPlaylist] };
}

export function deletePlaylistMutation(playlists: Playlist[], id: string): Playlist[] {
  return playlists.filter(playlist => playlist.id !== id);
}

export function renamePlaylistMutation(
  playlists: Playlist[],
  id: string,
  newName: string,
  options: PlaylistMutationOptions = {},
): PlaylistMutationResult {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { success: false, error: PLAYLIST_NAME_EMPTY_ERROR };
  }

  const now = getTimestamp(options);
  return {
    success: true,
    playlists: playlists.map(playlist =>
      playlist.id === id ? { ...playlist, name: trimmedName, updatedAt: now } : playlist
    ),
  };
}

export function addVersionToPlaylistMutation(
  playlists: Playlist[],
  playlistId: string,
  version: PlaylistVersion,
  options: PlaylistMutationOptions = {},
): PlaylistMutationResult {
  const playlist = playlists.find(item => item.id === playlistId);
  if (!playlist) {
    return { success: false, error: PLAYLIST_NOT_FOUND_ERROR };
  }

  const exists = playlist.versions.some(item => item.performanceId === version.performanceId);
  if (exists) {
    return { success: false, error: PLAYLIST_VERSION_EXISTS_ERROR };
  }

  const now = getTimestamp(options);
  return {
    success: true,
    playlists: playlists.map(item =>
      item.id === playlistId
        ? { ...item, versions: [...item.versions, version], updatedAt: now }
        : item
    ),
  };
}

export function removeVersionFromPlaylistMutation(
  playlists: Playlist[],
  playlistId: string,
  performanceId: string,
  options: PlaylistMutationOptions = {},
): Playlist[] {
  const now = getTimestamp(options);
  return playlists.map(playlist =>
    playlist.id === playlistId
      ? {
          ...playlist,
          versions: playlist.versions.filter(version => version.performanceId !== performanceId),
          updatedAt: now,
        }
      : playlist
  );
}

export function reorderPlaylistVersionsMutation(
  playlists: Playlist[],
  playlistId: string,
  fromIndex: number,
  toIndex: number,
  options: PlaylistMutationOptions = {},
): Playlist[] {
  const now = getTimestamp(options);

  return playlists.map(playlist => {
    if (playlist.id !== playlistId) {
      return playlist;
    }

    const versions = [...playlist.versions];
    const [removed] = versions.splice(fromIndex, 1);
    versions.splice(toIndex, 0, removed);
    return { ...playlist, versions, updatedAt: now };
  });
}

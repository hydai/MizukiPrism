import type { Playlist } from '../types/playlist';
import { getLocalStorage } from './browserStorage';

export const PLAYLIST_STORAGE_KEY = 'mizukiprism_playlists';
export const PLAYLIST_STORAGE_QUOTA_ERROR = '本機儲存空間不足';
export const PLAYLIST_STORAGE_SAVE_ERROR = '無法儲存播放清單';
export const PLAYLIST_STORAGE_UNSUPPORTED_ERROR = '您的瀏覽器不支援本機儲存，播放清單功能無法使用';

type StoredPlaylist = Omit<Playlist, 'updatedAt'> & {
  updatedAt?: number;
};

type PlaylistStorageReader = Pick<Storage, 'getItem'>;
type PlaylistStorageWriter = Pick<Storage, 'setItem'>;

export type PlaylistStorageSaveResult =
  | { success: true }
  | { success: false; error: string; cause: unknown };

function parseStoredPlaylists(stored: string): Playlist[] {
  const parsed = JSON.parse(stored) as StoredPlaylist[];

  return parsed.map(playlist => ({
    ...playlist,
    updatedAt: playlist.updatedAt ?? playlist.createdAt ?? Date.now(),
  }));
}

export function readStoredPlaylists(storage?: PlaylistStorageReader): Playlist[] | null {
  const resolvedStorage = storage ?? getLocalStorage();
  if (!resolvedStorage) return null;

  const stored = resolvedStorage.getItem(PLAYLIST_STORAGE_KEY);
  if (!stored) return null;

  return parseStoredPlaylists(stored);
}

export function writeStoredPlaylists(
  playlists: Playlist[],
  storage?: PlaylistStorageWriter,
): void {
  const resolvedStorage = storage ?? getLocalStorage();
  if (!resolvedStorage) {
    throw new Error('localStorage is unavailable');
  }

  resolvedStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists));
}

export function saveStoredPlaylists(
  playlists: Playlist[],
  storage?: PlaylistStorageWriter,
): PlaylistStorageSaveResult {
  try {
    writeStoredPlaylists(playlists, storage);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getPlaylistStorageWriteErrorMessage(error),
      cause: error,
    };
  }
}

export function getPlaylistStorageWriteErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return PLAYLIST_STORAGE_SAVE_ERROR;
  }

  const { code, name } = error as { code?: unknown; name?: unknown };
  if (
    name === 'QuotaExceededError'
    || name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || code === 22
    || code === 1014
  ) {
    return PLAYLIST_STORAGE_QUOTA_ERROR;
  }

  if (name === 'SecurityError') {
    return PLAYLIST_STORAGE_UNSUPPORTED_ERROR;
  }

  return PLAYLIST_STORAGE_SAVE_ERROR;
}

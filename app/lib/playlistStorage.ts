import type { Playlist } from '../types/playlist';

export const PLAYLIST_STORAGE_KEY = 'mizukiprism_playlists';
export const PLAYLIST_STORAGE_QUOTA_ERROR = '本機儲存空間不足';
export const PLAYLIST_STORAGE_UNSUPPORTED_ERROR = '您的瀏覽器不支援本機儲存，播放清單功能無法使用';

type StoredPlaylist = Omit<Playlist, 'updatedAt'> & {
  updatedAt?: number;
};

type PlaylistStorageReader = Pick<Storage, 'getItem'>;
type PlaylistStorageWriter = Pick<Storage, 'setItem'>;

function parseStoredPlaylists(stored: string): Playlist[] {
  const parsed = JSON.parse(stored) as StoredPlaylist[];

  return parsed.map(playlist => ({
    ...playlist,
    updatedAt: playlist.updatedAt ?? playlist.createdAt ?? Date.now(),
  }));
}

export function readStoredPlaylists(storage: PlaylistStorageReader = localStorage): Playlist[] | null {
  const stored = storage.getItem(PLAYLIST_STORAGE_KEY);
  if (!stored) return null;

  return parseStoredPlaylists(stored);
}

export function writeStoredPlaylists(
  playlists: Playlist[],
  storage: PlaylistStorageWriter = localStorage,
): void {
  storage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists));
}

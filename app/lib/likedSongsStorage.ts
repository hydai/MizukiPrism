import type { LikedVersion } from '../types/likedSongs';

export const LIKED_SONGS_STORAGE_KEY = 'mizukiprism_liked_songs';

type LikedSongsStorageReader = Pick<Storage, 'getItem'>;
type LikedSongsStorageWriter = Pick<Storage, 'setItem'>;

export function readStoredLikedSongs(
  storage: LikedSongsStorageReader = localStorage,
): LikedVersion[] | null {
  const stored = storage.getItem(LIKED_SONGS_STORAGE_KEY);
  if (!stored) return null;

  return JSON.parse(stored) as LikedVersion[];
}

export function writeStoredLikedSongs(
  likedSongs: LikedVersion[],
  storage: LikedSongsStorageWriter = localStorage,
): void {
  storage.setItem(LIKED_SONGS_STORAGE_KEY, JSON.stringify(likedSongs));
}

export function saveStoredLikedSongs(
  likedSongs: LikedVersion[],
  storage: LikedSongsStorageWriter = localStorage,
): boolean {
  try {
    writeStoredLikedSongs(likedSongs, storage);
    return true;
  } catch {
    return false;
  }
}

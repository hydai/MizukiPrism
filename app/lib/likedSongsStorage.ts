import type { LikedVersion } from '../types/likedSongs';
import { getLocalStorage, getLocalStorageOrThrow } from './browserStorage';

export const LIKED_SONGS_STORAGE_KEY = 'mizukiprism_liked_songs';

type LikedSongsStorageReader = Pick<Storage, 'getItem'>;
type LikedSongsStorageWriter = Pick<Storage, 'setItem'>;

export function readStoredLikedSongs(
  storage?: LikedSongsStorageReader,
): LikedVersion[] | null {
  const resolvedStorage = storage ?? getLocalStorage();
  if (!resolvedStorage) return null;

  const stored = resolvedStorage.getItem(LIKED_SONGS_STORAGE_KEY);
  if (!stored) return null;

  return JSON.parse(stored) as LikedVersion[];
}

export function writeStoredLikedSongs(
  likedSongs: LikedVersion[],
  storage?: LikedSongsStorageWriter,
): void {
  const resolvedStorage = storage ?? getLocalStorageOrThrow();
  resolvedStorage.setItem(LIKED_SONGS_STORAGE_KEY, JSON.stringify(likedSongs));
}

export function saveStoredLikedSongs(
  likedSongs: LikedVersion[],
  storage?: LikedSongsStorageWriter,
): boolean {
  try {
    writeStoredLikedSongs(likedSongs, storage);
    return true;
  } catch {
    return false;
  }
}

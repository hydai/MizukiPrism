import type { RecentPlay } from '../types/recentlyPlayed';
import { getLocalStorage, getLocalStorageOrThrow } from './browserStorage';

export const RECENTLY_PLAYED_STORAGE_KEY = 'mizukiprism_recently_played';

type RecentlyPlayedStorageReader = Pick<Storage, 'getItem'>;
type RecentlyPlayedStorageWriter = Pick<Storage, 'setItem'>;

export function readStoredRecentPlays(
  storage?: RecentlyPlayedStorageReader,
): RecentPlay[] | null {
  const resolvedStorage = storage ?? getLocalStorage();
  if (!resolvedStorage) return null;

  const stored = resolvedStorage.getItem(RECENTLY_PLAYED_STORAGE_KEY);
  if (!stored) return null;

  return JSON.parse(stored) as RecentPlay[];
}

export function writeStoredRecentPlays(
  recentPlays: RecentPlay[],
  storage?: RecentlyPlayedStorageWriter,
): void {
  const resolvedStorage = storage ?? getLocalStorageOrThrow();
  resolvedStorage.setItem(RECENTLY_PLAYED_STORAGE_KEY, JSON.stringify(recentPlays));
}

export function saveStoredRecentPlays(
  recentPlays: RecentPlay[],
  storage?: RecentlyPlayedStorageWriter,
): boolean {
  try {
    writeStoredRecentPlays(recentPlays, storage);
    return true;
  } catch {
    return false;
  }
}

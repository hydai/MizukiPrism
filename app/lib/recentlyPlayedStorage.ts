import type { RecentPlay } from '../types/recentlyPlayed';

export const RECENTLY_PLAYED_STORAGE_KEY = 'mizukiprism_recently_played';

type RecentlyPlayedStorageReader = Pick<Storage, 'getItem'>;
type RecentlyPlayedStorageWriter = Pick<Storage, 'setItem'>;

export function readStoredRecentPlays(
  storage: RecentlyPlayedStorageReader = localStorage,
): RecentPlay[] | null {
  const stored = storage.getItem(RECENTLY_PLAYED_STORAGE_KEY);
  if (!stored) return null;

  return JSON.parse(stored) as RecentPlay[];
}

export function writeStoredRecentPlays(
  recentPlays: RecentPlay[],
  storage: RecentlyPlayedStorageWriter = localStorage,
): void {
  storage.setItem(RECENTLY_PLAYED_STORAGE_KEY, JSON.stringify(recentPlays));
}

export function saveStoredRecentPlays(
  recentPlays: RecentPlay[],
  storage: RecentlyPlayedStorageWriter = localStorage,
): boolean {
  try {
    writeStoredRecentPlays(recentPlays, storage);
    return true;
  } catch {
    return false;
  }
}

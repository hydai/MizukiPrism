import type { RecentPlay, RecentPlayable } from '../types/recentlyPlayed';

export const RECENT_PLAYS_MAX_ENTRIES = 50;

interface RecentlyPlayedMutationOptions {
  now?: number;
  maxEntries?: number;
}

function getTimestamp(options: RecentlyPlayedMutationOptions): number {
  return options.now ?? Date.now();
}

function getMaxEntries(options: RecentlyPlayedMutationOptions): number {
  return options.maxEntries ?? RECENT_PLAYS_MAX_ENTRIES;
}

export function addRecentPlayMutation(
  recentPlays: RecentPlay[],
  play: RecentPlayable,
  options: RecentlyPlayedMutationOptions = {},
): RecentPlay[] {
  const filtered = recentPlays.filter(recentPlay => recentPlay.performanceId !== play.performanceId);

  return [{ ...play, playedAt: getTimestamp(options) }, ...filtered].slice(0, getMaxEntries(options));
}

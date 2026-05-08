import type { LikeableVersion, LikedVersion } from '../types/likedSongs';

interface LikedSongsMutationOptions {
  now?: number;
}

function getTimestamp(options: LikedSongsMutationOptions): number {
  return options.now ?? Date.now();
}

export function isLikedSong(likedSongs: LikedVersion[], performanceId: string): boolean {
  return likedSongs.some(song => song.performanceId === performanceId);
}

export function toggleLikedSongMutation(
  likedSongs: LikedVersion[],
  version: LikeableVersion,
  options: LikedSongsMutationOptions = {},
): LikedVersion[] {
  if (isLikedSong(likedSongs, version.performanceId)) {
    return likedSongs.filter(song => song.performanceId !== version.performanceId);
  }

  return [{ ...version, likedAt: getTimestamp(options) }, ...likedSongs];
}

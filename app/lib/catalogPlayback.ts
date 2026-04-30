import type { Track } from '../contexts/PlayerContext';
import type { CatalogPerformance, CatalogSong, FlattenedSong } from './catalogData';

export type CatalogPlaybackTrack = Track;

export function trackFromFlattenedSong(song: FlattenedSong): CatalogPlaybackTrack {
  return {
    id: song.performanceId,
    songId: song.id,
    title: song.title,
    originalArtist: song.originalArtist,
    videoId: song.videoId,
    timestamp: song.timestamp,
    endTimestamp: song.endTimestamp,
    albumArtUrl: song.albumArtUrl,
  };
}

export function latestPerformanceForSong(song: CatalogSong): CatalogPerformance | undefined {
  return song.performances.reduce<CatalogPerformance | undefined>((latest, performance) => {
    if (!latest || performance.date > latest.date) {
      return performance;
    }
    return latest;
  }, undefined);
}

export function trackFromPerformance(
  song: CatalogSong,
  performance: CatalogPerformance,
): CatalogPlaybackTrack {
  return {
    id: performance.id,
    songId: song.id,
    title: song.title,
    originalArtist: song.originalArtist,
    videoId: performance.videoId,
    timestamp: performance.timestamp,
    endTimestamp: performance.endTimestamp ?? undefined,
    albumArtUrl: song.albumArtUrl,
  };
}

export function buildTimelinePlaybackTracks(songs: readonly FlattenedSong[]): CatalogPlaybackTrack[] {
  return songs.map(trackFromFlattenedSong);
}

export function buildGroupedPlaybackTracks(songs: readonly CatalogSong[]): CatalogPlaybackTrack[] {
  return songs.flatMap((song) => {
    const latestPerformance = latestPerformanceForSong(song);
    return latestPerformance ? [trackFromPerformance(song, latestPerformance)] : [];
  });
}

export function filterPlayableTracks<T extends Pick<CatalogPlaybackTrack, 'videoId'>>(
  tracks: readonly T[],
  unavailableVideoIds: ReadonlySet<string>,
): T[] {
  return tracks.filter((track) => !unavailableVideoIds.has(track.videoId));
}

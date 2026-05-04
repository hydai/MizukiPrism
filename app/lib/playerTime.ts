import type { Track } from '../types/player';

export const TIMESTAMP_WARNING_MESSAGE = '時間戳可能有誤';

export function getTrackCurrentTime(track: Track | null, currentTime: number): number {
  return track ? Math.max(0, currentTime - track.timestamp) : 0;
}

export function getTrackDuration(track: Track | null): number | null {
  return track?.endTimestamp != null
    ? track.endTimestamp - track.timestamp
    : null;
}

interface TrackStartPosition {
  startSeconds: number;
  timestampOutOfBounds: boolean;
}

export function resolveTrackStartPosition(track: Track, videoDuration: number): TrackStartPosition {
  const timestampOutOfBounds = track.timestamp > 0
    && videoDuration > 0
    && track.timestamp >= videoDuration;

  return {
    startSeconds: timestampOutOfBounds ? 0 : track.timestamp,
    timestampOutOfBounds,
  };
}

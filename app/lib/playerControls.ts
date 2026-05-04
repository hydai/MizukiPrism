import type { RepeatMode, Track } from '../types/player';

export function getNextRepeatMode(repeatMode: RepeatMode): RepeatMode {
  if (repeatMode === 'off') return 'all';
  if (repeatMode === 'all') return 'one';
  return 'off';
}

export function addUniqueTrackById(tracks: Track[], track: Track): Track[] {
  return tracks.some((existing) => existing.id === track.id)
    ? tracks
    : [...tracks, track];
}

export function removeTrackAtIndex(tracks: Track[], index: number): Track[] {
  if (index < 0 || index >= tracks.length) {
    return tracks;
  }

  return tracks.filter((_, currentIndex) => currentIndex !== index);
}

export function moveTrack(tracks: Track[], fromIndex: number, toIndex: number): Track[] {
  if (
    fromIndex < 0
    || fromIndex >= tracks.length
    || toIndex < 0
    || toIndex >= tracks.length
    || fromIndex === toIndex
  ) {
    return tracks;
  }

  const nextTracks = [...tracks];
  const [removed] = nextTracks.splice(fromIndex, 1);
  nextTracks.splice(toIndex, 0, removed!);
  return nextTracks;
}

type PreviousPlaybackAction =
  | { type: 'none' }
  | { type: 'restart'; track: Track }
  | { type: 'history'; track: Track };

interface ResolvePreviousPlaybackOptions {
  currentTrack: Track | null;
  currentTime: number;
  playHistory: readonly Track[];
  restartThresholdSeconds?: number;
}

export function resolvePreviousPlayback({
  currentTrack,
  currentTime,
  playHistory,
  restartThresholdSeconds = 3,
}: ResolvePreviousPlaybackOptions): PreviousPlaybackAction {
  if (!currentTrack) {
    return { type: 'none' };
  }

  const timePlayed = currentTime - currentTrack.timestamp;
  if (timePlayed > restartThresholdSeconds) {
    return { type: 'restart', track: currentTrack };
  }

  const previousTrack = playHistory[playHistory.length - 1];
  if (!previousTrack) {
    return { type: 'none' };
  }

  return {
    type: 'history',
    track: previousTrack,
  };
}

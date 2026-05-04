import type { RepeatMode, Track } from '../types/player';

const YOUTUBE_PLAYER_STATE_ENDED = 0;
const YOUTUBE_PLAYER_STATE_PLAYING = 1;
const YOUTUBE_PLAYER_STATE_PAUSED = 2;

export type YouTubePlaybackState = 'ended' | 'playing' | 'paused' | 'ignored';

export type PlaybackEndAction =
  | { type: 'loop'; track: Track }
  | { type: 'advance' }
  | { type: 'stop' };

export type YouTubePlayerLoadAction =
  | { type: 'create' }
  | { type: 'seek-existing' }
  | { type: 'load-existing' };

interface ResolvePlaybackEndActionOptions {
  currentTrack: Track | null;
  queueLength: number;
  repeatMode: RepeatMode;
}

interface ResolveYouTubePlayerLoadActionOptions {
  hasPlayer: boolean;
  loadedVideoId: string | null;
  nextVideoId: string;
}

export function hasReachedTrackEnd(track: Track | null, currentTime: number): boolean {
  return track?.endTimestamp != null && currentTime >= track.endTimestamp;
}

export function resolvePlaybackEndAction({
  currentTrack,
  queueLength,
  repeatMode,
}: ResolvePlaybackEndActionOptions): PlaybackEndAction {
  if (repeatMode === 'one' && currentTrack) {
    return { type: 'loop', track: currentTrack };
  }

  if (queueLength > 0 || repeatMode === 'all') {
    return { type: 'advance' };
  }

  return { type: 'stop' };
}

export function resolveYouTubePlaybackState(stateCode: unknown): YouTubePlaybackState {
  if (stateCode === YOUTUBE_PLAYER_STATE_PLAYING) return 'playing';
  if (stateCode === YOUTUBE_PLAYER_STATE_PAUSED) return 'paused';
  if (stateCode === YOUTUBE_PLAYER_STATE_ENDED) return 'ended';
  return 'ignored';
}

export function resolveYouTubePlayerLoadAction({
  hasPlayer,
  loadedVideoId,
  nextVideoId,
}: ResolveYouTubePlayerLoadActionOptions): YouTubePlayerLoadAction {
  if (!hasPlayer || !loadedVideoId) {
    return { type: 'create' };
  }

  if (loadedVideoId === nextVideoId) {
    return { type: 'seek-existing' };
  }

  return { type: 'load-existing' };
}

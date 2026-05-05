import type { PlayerAudioControls } from '../lib/playerVolume';

export interface YouTubePlayerInstance extends PlayerAudioControls {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (options: { videoId: string; startSeconds: number }) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

export interface YouTubePlayerReadyEvent {
  target: YouTubePlayerInstance;
}

export interface YouTubePlayerStateChangeEvent {
  target: YouTubePlayerInstance;
  data: number;
}

export interface YouTubePlayerErrorEvent {
  data: number;
}

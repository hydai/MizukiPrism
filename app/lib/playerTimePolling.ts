import { hasReachedTrackEnd } from './playerPlayback';
import type { Track } from '../types/player';

export const PLAYER_TIME_POLL_INTERVAL_MS = 500;

export type CurrentRef<T> = {
  current: T;
};

export type TrackEndHandler = () => 'continue' | 'stop';

export interface PlayerTimePollingSnapshot {
  playerRef: CurrentRef<any>;
  currentTrackRef: CurrentRef<Track | null>;
  setCurrentTime: (time: number) => void;
  handleTrackEnd: TrackEndHandler;
}

type IntervalId = ReturnType<typeof setInterval>;

interface PlayerTimePollerTimers {
  setIntervalFn?: (handler: () => void, timeout: number) => IntervalId;
  clearIntervalFn?: (intervalId: IntervalId) => void;
}

export interface PlayerTimePoller {
  start: () => void;
  stop: () => void;
  update: (snapshot: PlayerTimePollingSnapshot) => void;
  isRunning: () => boolean;
}

export function createPlayerTimePoller(
  initialSnapshot: PlayerTimePollingSnapshot,
  {
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
  }: PlayerTimePollerTimers = {},
): PlayerTimePoller {
  let snapshot = initialSnapshot;
  let intervalId: IntervalId | null = null;

  const stop = () => {
    if (!intervalId) return;
    clearIntervalFn(intervalId);
    intervalId = null;
  };

  const tick = () => {
    const player = snapshot.playerRef.current;
    if (!player?.getCurrentTime) return;

    const current = player.getCurrentTime();
    snapshot.setCurrentTime(current);

    const track = snapshot.currentTrackRef.current;
    if (!hasReachedTrackEnd(track, current)) return;

    if (snapshot.handleTrackEnd() === 'stop') {
      stop();
    }
  };

  const start = () => {
    stop();
    intervalId = setIntervalFn(tick, PLAYER_TIME_POLL_INTERVAL_MS);
  };

  const update = (nextSnapshot: PlayerTimePollingSnapshot) => {
    snapshot = nextSnapshot;
  };

  const isRunning = () => intervalId !== null;

  return {
    start,
    stop,
    update,
    isRunning,
  };
}

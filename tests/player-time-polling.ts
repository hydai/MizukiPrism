import assert from 'node:assert/strict';
import {
  createPlayerTimePoller,
  PLAYER_TIME_POLL_INTERVAL_MS,
  type PlayerTimePollingSnapshot,
} from '../app/lib/playerTimePolling';
import type { Track } from '../app/types/player';

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: 'track-a',
    songId: 'song-a',
    title: 'Song A',
    originalArtist: 'Artist A',
    videoId: 'video-a',
    timestamp: 10,
    ...overrides,
  };
}

function createFakeTimers() {
  let nextId = 1;
  const callbacks = new Map<number, () => void>();
  const delays: number[] = [];
  const cleared: number[] = [];

  return {
    delays,
    cleared,
    setIntervalFn: (handler: () => void, timeout: number) => {
      const id = nextId++;
      delays.push(timeout);
      callbacks.set(id, handler);
      return id as unknown as ReturnType<typeof setInterval>;
    },
    clearIntervalFn: (intervalId: ReturnType<typeof setInterval>) => {
      const id = intervalId as unknown as number;
      cleared.push(id);
      callbacks.delete(id);
    },
    run: (id: number) => callbacks.get(id)?.(),
    has: (id: number) => callbacks.has(id),
  };
}

function snapshot(overrides: Partial<PlayerTimePollingSnapshot> = {}): PlayerTimePollingSnapshot {
  return {
    playerRef: { current: null },
    currentTrackRef: { current: null },
    setCurrentTime: () => {},
    handleTrackEnd: () => 'continue',
    ...overrides,
  };
}

{
  const timers = createFakeTimers();
  const poller = createPlayerTimePoller(snapshot(), timers);

  poller.start();
  assert.equal(poller.isRunning(), true);
  assert.deepEqual(timers.delays, [PLAYER_TIME_POLL_INTERVAL_MS]);

  poller.stop();
  assert.equal(poller.isRunning(), false);
  assert.deepEqual(timers.cleared, [1]);
  assert.equal(timers.has(1), false);
}

{
  const timers = createFakeTimers();
  const poller = createPlayerTimePoller(snapshot(), timers);

  poller.start();
  poller.start();

  assert.deepEqual(timers.delays, [
    PLAYER_TIME_POLL_INTERVAL_MS,
    PLAYER_TIME_POLL_INTERVAL_MS,
  ]);
  assert.deepEqual(timers.cleared, [1]);
  assert.equal(timers.has(1), false);
  assert.equal(timers.has(2), true);
}

{
  let currentTime = 20;
  const times: number[] = [];
  let endCalls = 0;
  const timers = createFakeTimers();
  const poller = createPlayerTimePoller(
    snapshot({
      playerRef: { current: { getCurrentTime: () => currentTime } },
      currentTrackRef: { current: track({ endTimestamp: 30 }) },
      setCurrentTime: (time) => times.push(time),
      handleTrackEnd: () => {
        endCalls += 1;
        return 'continue';
      },
    }),
    timers,
  );

  poller.start();
  timers.run(1);

  assert.deepEqual(times, [20]);
  assert.equal(endCalls, 0);

  currentTime = 30;
  timers.run(1);

  assert.deepEqual(times, [20, 30]);
  assert.equal(endCalls, 1);
  assert.equal(poller.isRunning(), true);
}

{
  const timers = createFakeTimers();
  const poller = createPlayerTimePoller(
    snapshot({
      playerRef: { current: { getCurrentTime: () => 30 } },
      currentTrackRef: { current: track({ endTimestamp: 30 }) },
      handleTrackEnd: () => 'stop',
    }),
    timers,
  );

  poller.start();
  timers.run(1);

  assert.equal(poller.isRunning(), false);
  assert.deepEqual(timers.cleared, [1]);
}

{
  let endCalls = 0;
  const timers = createFakeTimers();
  const poller = createPlayerTimePoller(
    snapshot({
      playerRef: { current: { getCurrentTime: () => 30 } },
      currentTrackRef: { current: track({ endTimestamp: 30 }) },
      handleTrackEnd: () => {
        throw new Error('stale handler should not be called');
      },
    }),
    timers,
  );

  poller.start();
  poller.update(snapshot({
    playerRef: { current: { getCurrentTime: () => 30 } },
    currentTrackRef: { current: track({ endTimestamp: 30 }) },
    handleTrackEnd: () => {
      endCalls += 1;
      return 'continue';
    },
  }));
  timers.run(1);

  assert.equal(endCalls, 1);
}

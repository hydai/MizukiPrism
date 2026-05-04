import assert from 'node:assert/strict';
import {
  hasReachedTrackEnd,
  resolvePlaybackEndAction,
  resolveYouTubePlaybackState,
} from '../app/lib/playerPlayback';
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

assert.equal(hasReachedTrackEnd(null, 30), false);
assert.equal(hasReachedTrackEnd(track(), 30), false);
assert.equal(hasReachedTrackEnd(track({ endTimestamp: 40 }), 39.9), false);
assert.equal(hasReachedTrackEnd(track({ endTimestamp: 40 }), 40), true);
assert.equal(hasReachedTrackEnd(track({ endTimestamp: 40 }), 45), true);
assert.equal(hasReachedTrackEnd(track({ timestamp: 0, endTimestamp: 0 }), 0), true);

const loopingTrack = track();
assert.deepEqual(
  resolvePlaybackEndAction({
    currentTrack: loopingTrack,
    queueLength: 0,
    repeatMode: 'one',
  }),
  { type: 'loop', track: loopingTrack },
);

assert.deepEqual(
  resolvePlaybackEndAction({
    currentTrack: null,
    queueLength: 1,
    repeatMode: 'one',
  }),
  { type: 'advance' },
);

assert.deepEqual(
  resolvePlaybackEndAction({
    currentTrack: track(),
    queueLength: 1,
    repeatMode: 'off',
  }),
  { type: 'advance' },
);

assert.deepEqual(
  resolvePlaybackEndAction({
    currentTrack: track(),
    queueLength: 0,
    repeatMode: 'all',
  }),
  { type: 'advance' },
);

assert.deepEqual(
  resolvePlaybackEndAction({
    currentTrack: track(),
    queueLength: 0,
    repeatMode: 'off',
  }),
  { type: 'stop' },
);

assert.equal(resolveYouTubePlaybackState(1), 'playing');
assert.equal(resolveYouTubePlaybackState(2), 'paused');
assert.equal(resolveYouTubePlaybackState(0), 'ended');
assert.equal(resolveYouTubePlaybackState(3), 'ignored');
assert.equal(resolveYouTubePlaybackState('1'), 'ignored');

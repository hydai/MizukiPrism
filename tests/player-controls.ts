import assert from 'node:assert/strict';
import {
  addUniqueTrackById,
  getNextRepeatMode,
  moveTrack,
  removeTrackAtIndex,
  resolvePreviousPlayback,
} from '../app/lib/playerControls';
import type { Track } from '../app/types/player';

function track(id: string, timestamp = 0): Track {
  return {
    id,
    songId: `song-${id}`,
    title: `Song ${id}`,
    originalArtist: `Artist ${id}`,
    videoId: `video-${id}`,
    timestamp,
  };
}

const trackA = track('a', 10);
const trackB = track('b', 20);
const trackC = track('c', 30);

assert.equal(getNextRepeatMode('off'), 'all');
assert.equal(getNextRepeatMode('all'), 'one');
assert.equal(getNextRepeatMode('one'), 'off');

assert.deepEqual(addUniqueTrackById([trackA], trackB).map((item) => item.id), ['a', 'b']);
assert.deepEqual(addUniqueTrackById([trackA], { ...trackB, id: 'a' }).map((item) => item.id), ['a']);

assert.deepEqual(removeTrackAtIndex([trackA, trackB, trackC], 1).map((item) => item.id), ['a', 'c']);
assert.deepEqual(removeTrackAtIndex([trackA, trackB], 4).map((item) => item.id), ['a', 'b']);

assert.deepEqual(moveTrack([trackA, trackB, trackC], 0, 2).map((item) => item.id), ['b', 'c', 'a']);
assert.deepEqual(moveTrack([trackA, trackB, trackC], 2, 0).map((item) => item.id), ['c', 'a', 'b']);
assert.deepEqual(moveTrack([trackA, trackB], 1, 1).map((item) => item.id), ['a', 'b']);
assert.deepEqual(moveTrack([trackA, trackB], -1, 1).map((item) => item.id), ['a', 'b']);
assert.deepEqual(moveTrack([trackA, trackB], 0, 4).map((item) => item.id), ['a', 'b']);

assert.deepEqual(
  resolvePreviousPlayback({
    currentTrack: null,
    currentTime: 0,
    playHistory: [trackA],
  }),
  { type: 'none' },
);

assert.deepEqual(
  resolvePreviousPlayback({
    currentTrack: trackB,
    currentTime: 24,
    playHistory: [trackA],
  }),
  { type: 'restart', track: trackB },
);

assert.deepEqual(
  resolvePreviousPlayback({
    currentTrack: trackB,
    currentTime: 23,
    playHistory: [trackA],
  }),
  { type: 'history', track: trackA, history: [] },
);

assert.deepEqual(
  resolvePreviousPlayback({
    currentTrack: trackB,
    currentTime: 20,
    playHistory: [],
  }),
  { type: 'none' },
);

assert.deepEqual(
  resolvePreviousPlayback({
    currentTrack: trackC,
    currentTime: 34,
    playHistory: [trackA, trackB],
    restartThresholdSeconds: 5,
  }),
  { type: 'history', track: trackB, history: [trackA] },
);

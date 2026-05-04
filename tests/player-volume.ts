import assert from 'node:assert/strict';
import {
  clampPlayerVolume,
  getNextMutedState,
  shouldAutoUnmute,
} from '../app/lib/playerVolume';

assert.equal(clampPlayerVolume(-25), 0);
assert.equal(clampPlayerVolume(0), 0);
assert.equal(clampPlayerVolume(37), 37);
assert.equal(clampPlayerVolume(100), 100);
assert.equal(clampPlayerVolume(125), 100);

assert.equal(shouldAutoUnmute(0, true), false);
assert.equal(shouldAutoUnmute(1, true), true);
assert.equal(shouldAutoUnmute(50, false), false);

assert.equal(getNextMutedState(false), true);
assert.equal(getNextMutedState(true), false);

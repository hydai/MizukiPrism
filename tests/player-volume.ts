import assert from 'node:assert/strict';
import {
  applyPlayerAudioSettings,
  applyPlayerMutedState,
  applyPlayerVolume,
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

const calls: string[] = [];
const player = {
  setVolume: (volume: number) => calls.push(`volume:${volume}`),
  mute: () => calls.push('mute'),
  unMute: () => calls.push('unmute'),
};

applyPlayerVolume(player, 42);
assert.deepEqual(calls, ['volume:42']);

calls.length = 0;
applyPlayerMutedState(player, true);
applyPlayerMutedState(player, false);
assert.deepEqual(calls, ['mute', 'unmute']);

calls.length = 0;
applyPlayerAudioSettings(player, 25, true);
assert.deepEqual(calls, ['volume:25', 'mute']);

calls.length = 0;
applyPlayerAudioSettings(player, 75, false);
assert.deepEqual(calls, ['volume:75', 'unmute']);

assert.doesNotThrow(() => {
  applyPlayerAudioSettings(null, 50, true);
  applyPlayerAudioSettings({}, 50, false);
});

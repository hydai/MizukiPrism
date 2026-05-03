import assert from 'node:assert/strict';
import { advancePlayerQueue, shuffleTracks } from '../app/lib/playerQueue';
import type { Track } from '../app/types/player';

function queueTrack(id: string, deleted = false): Track {
  return {
    id,
    songId: `song-${id}`,
    title: `Song ${id}`,
    originalArtist: `Artist ${id}`,
    videoId: `video-${id}`,
    timestamp: 0,
    deleted,
  };
}

const queueA = queueTrack('a');
const queueB = queueTrack('b');
const deletedQueueTrack = queueTrack('deleted', true);

const skippedQueue = advancePlayerQueue({
  queue: [deletedQueueTrack, queueA, queueB],
  fromTrack: null,
  repeatMode: 'off',
  shuffleOn: false,
  allTracks: [],
});

assert.equal(skippedQueue.nextTrack?.id, 'a');
assert.deepEqual(skippedQueue.queue.map((track) => track.id), ['b']);
assert.equal(skippedQueue.skippedDeleted, true);

const repeatAllQueue = advancePlayerQueue({
  queue: [],
  fromTrack: queueA,
  repeatMode: 'all',
  shuffleOn: false,
  allTracks: [queueA, queueB, deletedQueueTrack],
});

assert.equal(repeatAllQueue.nextTrack?.id, 'a');
assert.deepEqual(repeatAllQueue.queue.map((track) => track.id), ['b', 'a']);
assert.equal(repeatAllQueue.skippedDeleted, false);

const repeatAllQueueWithExistingFromTrack = advancePlayerQueue({
  queue: [],
  fromTrack: queueB,
  repeatMode: 'all',
  shuffleOn: false,
  allTracks: [queueA, queueB, deletedQueueTrack],
});

assert.equal(repeatAllQueueWithExistingFromTrack.nextTrack?.id, 'a');
assert.deepEqual(repeatAllQueueWithExistingFromTrack.queue.map((track) => track.id), ['b']);
assert.equal(repeatAllQueueWithExistingFromTrack.skippedDeleted, false);

assert.deepEqual(
  shuffleTracks([queueA, queueB], () => 1).map((track) => track.id),
  ['a', 'b'],
);

const shuffledPickWithUpperBoundRandom = advancePlayerQueue({
  queue: [queueA, queueB],
  fromTrack: null,
  repeatMode: 'off',
  shuffleOn: true,
  allTracks: [],
  random: () => 1,
});

assert.equal(shuffledPickWithUpperBoundRandom.nextTrack?.id, 'b');
assert.deepEqual(shuffledPickWithUpperBoundRandom.queue.map((track) => track.id), ['a']);
assert.equal(shuffledPickWithUpperBoundRandom.skippedDeleted, false);

const emptyQueue = advancePlayerQueue({
  queue: [deletedQueueTrack],
  fromTrack: null,
  repeatMode: 'off',
  shuffleOn: false,
  allTracks: [],
});

assert.equal(emptyQueue.nextTrack, null);
assert.deepEqual(emptyQueue.queue, []);
assert.equal(emptyQueue.skippedDeleted, true);

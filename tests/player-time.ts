import assert from 'node:assert/strict';
import {
  getTrackCurrentTime,
  getTrackDuration,
  resolveTrackStartPosition,
  TIMESTAMP_WARNING_MESSAGE,
} from '../app/lib/playerTime';
import type { Track } from '../app/types/player';

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: 'track-1',
    songId: 'song-1',
    title: 'Song 1',
    originalArtist: 'Artist 1',
    videoId: 'video-1',
    timestamp: 30,
    ...overrides,
  };
}

assert.equal(getTrackCurrentTime(null, 45), 0);
assert.equal(getTrackCurrentTime(track(), 45), 15);
assert.equal(getTrackCurrentTime(track(), 10), 0);

assert.equal(getTrackDuration(null), null);
assert.equal(getTrackDuration(track()), null);
assert.equal(getTrackDuration(track({ endTimestamp: 75 })), 45);

assert.deepEqual(
  resolveTrackStartPosition(track({ timestamp: 30 }), 120),
  { startSeconds: 30, timestampOutOfBounds: false },
);
assert.deepEqual(
  resolveTrackStartPosition(track({ timestamp: 30 }), 30),
  { startSeconds: 0, timestampOutOfBounds: true },
);
assert.deepEqual(
  resolveTrackStartPosition(track({ timestamp: 30 }), 0),
  { startSeconds: 30, timestampOutOfBounds: false },
);
assert.deepEqual(
  resolveTrackStartPosition(track({ timestamp: 0 }), 0),
  { startSeconds: 0, timestampOutOfBounds: false },
);

assert.equal(TIMESTAMP_WARNING_MESSAGE, '時間戳可能有誤');

import assert from 'node:assert/strict';
import {
  formatSongList,
  parseTimestamp,
  secondsToFullTimestamp,
  secondsToTimestamp,
} from '../shared/parse';
import {
  secondsToTimestamp as legacySecondsToTimestamp,
  timestampToSeconds,
  validateTimestamp,
} from '../lib/utils';

assert.equal(parseTimestamp('5:30'), 330);
assert.equal(parseTimestamp('1:02:03'), 3723);
assert.equal(parseTimestamp('not-a-time'), null);

assert.equal(secondsToTimestamp(330), '5:30');
assert.equal(secondsToTimestamp(3723), '1:02:03');
assert.equal(secondsToFullTimestamp(330), '0:05:30');
assert.equal(secondsToFullTimestamp(3723), '1:02:03');

assert.equal(validateTimestamp('1:02:03'), true);
assert.equal(validateTimestamp('5:30'), false);
assert.equal(timestampToSeconds('1:02:03'), 3723);
assert.equal(timestampToSeconds('5:30'), 0);
assert.equal(legacySecondsToTimestamp(330), '0:05:30');

assert.equal(
  formatSongList([
    {
      title: 'Song A',
      originalArtist: 'Artist A',
      timestamp: 330,
      endTimestamp: 3723,
    },
    {
      title: 'Song B',
      originalArtist: '',
      timestamp: 4000,
      endTimestamp: null,
    },
  ]),
  [
    '01. 0:05:30 ~ 1:02:03 Song A / Artist A',
    '02. 1:06:40 ~ --:--:-- Song B',
  ].join('\n'),
);

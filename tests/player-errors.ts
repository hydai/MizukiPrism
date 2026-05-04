import assert from 'node:assert/strict';
import {
  addUnavailableVideoId,
  isUnavailableVideoError,
  PLAYER_API_LOAD_ERROR_MESSAGE,
  PLAYER_UNAVAILABLE_ERROR_MESSAGE,
  resolvePlayerError,
} from '../app/lib/playerErrors';

assert.equal(PLAYER_API_LOAD_ERROR_MESSAGE, '播放器載入失敗，請重新整理頁面');
assert.equal(PLAYER_UNAVAILABLE_ERROR_MESSAGE, '此影片已無法播放');

assert.equal(isUnavailableVideoError(100), true);
assert.equal(isUnavailableVideoError(101), true);
assert.equal(isUnavailableVideoError(150), true);
assert.equal(isUnavailableVideoError(2), false);
assert.equal(isUnavailableVideoError(5), false);
assert.equal(isUnavailableVideoError('100'), false);

assert.deepEqual(
  resolvePlayerError(100, 'video-1'),
  {
    message: PLAYER_UNAVAILABLE_ERROR_MESSAGE,
    unavailableVideoId: 'video-1',
  },
);
assert.equal(resolvePlayerError(100, null), null);
assert.equal(resolvePlayerError(2, 'video-1'), null);

const unavailableVideoIds = new Set(['video-1']);
const duplicateVideoIds = addUnavailableVideoId(unavailableVideoIds, 'video-1');

assert.strictEqual(duplicateVideoIds, unavailableVideoIds);
assert.deepEqual([...addUnavailableVideoId(unavailableVideoIds, 'video-2')], ['video-1', 'video-2']);

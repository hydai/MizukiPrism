import assert from 'node:assert/strict';
import { clearTrackWarningState, markTrackWarningShown } from '../app/lib/playerWarnings';

{
  const shownTrackIds = new Set<string>();

  assert.equal(markTrackWarningShown(shownTrackIds, 'track-a'), true);
  assert.deepEqual([...shownTrackIds], ['track-a']);
  assert.equal(markTrackWarningShown(shownTrackIds, 'track-a'), false);
  assert.deepEqual([...shownTrackIds], ['track-a']);
  assert.equal(markTrackWarningShown(shownTrackIds, 'track-b'), true);
  assert.deepEqual([...shownTrackIds], ['track-a', 'track-b']);
}

{
  const shownTrackIds = new Set(['track-a', 'track-b']);

  clearTrackWarningState(shownTrackIds);

  assert.equal(shownTrackIds.size, 0);
  assert.equal(markTrackWarningShown(shownTrackIds, 'track-a'), true);
  assert.deepEqual([...shownTrackIds], ['track-a']);
}

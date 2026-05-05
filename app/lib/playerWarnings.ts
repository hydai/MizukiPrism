export function markTrackWarningShown(shownTrackIds: Set<string>, trackId: string): boolean {
  if (shownTrackIds.has(trackId)) return false;
  shownTrackIds.add(trackId);
  return true;
}

export function clearTrackWarningState(shownTrackIds: Set<string>): void {
  shownTrackIds.clear();
}

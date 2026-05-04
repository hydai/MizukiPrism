export function clampPlayerVolume(volume: number): number {
  return Math.max(0, Math.min(100, volume));
}

export function shouldAutoUnmute(nextVolume: number, isMuted: boolean): boolean {
  return isMuted && nextVolume > 0;
}

export function getNextMutedState(isMuted: boolean): boolean {
  return !isMuted;
}

interface PlayerAudioControls {
  setVolume?: (volume: number) => void;
  mute?: () => void;
  unMute?: () => void;
}

export function clampPlayerVolume(volume: number): number {
  return Math.max(0, Math.min(100, volume));
}

export function shouldAutoUnmute(nextVolume: number, isMuted: boolean): boolean {
  return isMuted && nextVolume > 0;
}

export function getNextMutedState(isMuted: boolean): boolean {
  return !isMuted;
}

export function applyPlayerVolume(
  player: PlayerAudioControls | null | undefined,
  volume: number,
): void {
  player?.setVolume?.(volume);
}

export function applyPlayerMutedState(
  player: PlayerAudioControls | null | undefined,
  isMuted: boolean,
): void {
  if (isMuted) {
    player?.mute?.();
  } else {
    player?.unMute?.();
  }
}

export function applyPlayerAudioSettings(
  player: PlayerAudioControls | null | undefined,
  volume: number,
  isMuted: boolean,
): void {
  applyPlayerVolume(player, volume);
  applyPlayerMutedState(player, isMuted);
}

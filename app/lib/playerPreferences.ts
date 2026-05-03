export interface PlayerPreferences {
  volume?: number;
  isMuted?: boolean;
}

const PLAYER_VOLUME_KEY = 'mizuki-volume';
const PLAYER_MUTED_KEY = 'mizuki-muted';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPlayerPreferences(): PlayerPreferences {
  const storage = getLocalStorage();
  if (!storage) return {};

  const preferences: PlayerPreferences = {};

  try {
    const savedVolume = storage.getItem(PLAYER_VOLUME_KEY);
    if (savedVolume !== null) {
      const volume = Number(savedVolume);
      if (!Number.isNaN(volume) && volume >= 0 && volume <= 100) {
        preferences.volume = volume;
      }
    }

    const savedMuted = storage.getItem(PLAYER_MUTED_KEY);
    if (savedMuted !== null) {
      preferences.isMuted = savedMuted === 'true';
    }
  } catch {
    return {};
  }

  return preferences;
}

export function savePlayerVolume(volume: number): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(PLAYER_VOLUME_KEY, String(volume));
  } catch {}
}

export function savePlayerMuted(isMuted: boolean): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(PLAYER_MUTED_KEY, String(isMuted));
  } catch {}
}

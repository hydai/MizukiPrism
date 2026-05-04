export const PLAYER_API_LOAD_ERROR_MESSAGE = '播放器載入失敗，請重新整理頁面';
export const PLAYER_UNAVAILABLE_ERROR_MESSAGE = '此影片已無法播放';

const UNAVAILABLE_VIDEO_ERROR_CODES = new Set([100, 101, 150]);

export function isUnavailableVideoError(errorCode: unknown): boolean {
  return typeof errorCode === 'number' && UNAVAILABLE_VIDEO_ERROR_CODES.has(errorCode);
}

interface ResolvedPlayerError {
  message: string;
  unavailableVideoId: string;
}

export function resolvePlayerError(errorCode: unknown, videoId: string | null): ResolvedPlayerError | null {
  if (!videoId || !isUnavailableVideoError(errorCode)) {
    return null;
  }

  return {
    message: PLAYER_UNAVAILABLE_ERROR_MESSAGE,
    unavailableVideoId: videoId,
  };
}

export function addUnavailableVideoId(videoIds: Set<string>, videoId: string): Set<string> {
  if (videoIds.has(videoId)) {
    return videoIds;
  }

  return new Set([...videoIds, videoId]);
}

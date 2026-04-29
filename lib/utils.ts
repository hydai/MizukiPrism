import {
  parseTimestamp,
  secondsToFullTimestamp,
} from '../shared/parse';

export function validateYoutubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|live\/)|youtu\.be\/)[a-zA-Z0-9_-]+/.test(url);
}

export function validateTimestamp(ts: string): boolean {
  return /^\d{1,2}:\d{2}:\d{2}$/.test(ts);
}

export function timestampToSeconds(ts: string): number {
  if (!validateTimestamp(ts)) return 0;
  return parseTimestamp(ts) ?? 0;
}

export function secondsToTimestamp(seconds: number): string {
  return secondsToFullTimestamp(seconds);
}

export function extractVideoId(youtubeUrl: string): string | null {
  // Match youtube.com/watch?v=VIDEO_ID
  const watchMatch = youtubeUrl.match(/youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  // Match youtube.com/live/VIDEO_ID
  const liveMatch = youtubeUrl.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch) return liveMatch[1];

  // Match youtu.be/VIDEO_ID
  const shortMatch = youtubeUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
}

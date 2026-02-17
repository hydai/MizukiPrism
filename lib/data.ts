import fs from 'fs';
import path from 'path';
import { Song, Stream } from './types';
export {
  validateYoutubeUrl,
  validateTimestamp,
  timestampToSeconds,
  secondsToTimestamp,
} from './utils';

const songsPath = path.join(process.cwd(), 'data', 'songs.json');
const streamsPath = path.join(process.cwd(), 'data', 'streams.json');

export function readSongs(): Song[] {
  const raw = fs.readFileSync(songsPath, 'utf-8');
  return JSON.parse(raw) as Song[];
}

export function writeSongs(songs: Song[]): void {
  fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2), 'utf-8');
}

export function readStreams(): Stream[] {
  const raw = fs.readFileSync(streamsPath, 'utf-8');
  return JSON.parse(raw) as Stream[];
}

export function writeStreams(streams: Stream[]): void {
  fs.writeFileSync(streamsPath, JSON.stringify(streams, null, 2), 'utf-8');
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function extractVideoId(youtubeUrl: string): string | null {
  // Match youtube.com/watch?v=VIDEO_ID
  const watchMatch = youtubeUrl.match(/youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  // Match youtu.be/VIDEO_ID
  const shortMatch = youtubeUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
}

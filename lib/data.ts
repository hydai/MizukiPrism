import fs from 'fs';
import path from 'path';
import { Song, Stream } from './types';

const songsPath = path.join(process.cwd(), 'data', 'songs.json');
const streamsPath = path.join(process.cwd(), 'data', 'streams.json');

export function readSongs(): Song[] {
  const raw = fs.readFileSync(songsPath, 'utf-8');
  return JSON.parse(raw) as Song[];
}

export function readStreams(): Stream[] {
  const raw = fs.readFileSync(streamsPath, 'utf-8');
  return JSON.parse(raw) as Stream[];
}

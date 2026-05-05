'use client';

import {
  getTrackCurrentTime,
  getTrackDuration,
} from '../lib/playerTime';
import type { Track } from '../types/player';

interface UsePlayerTrackTimeOptions {
  currentTrack: Track | null;
  currentTime: number;
}

interface UsePlayerTrackTimeResult {
  trackCurrentTime: number;
  trackDuration: number | null;
}

export function usePlayerTrackTime({
  currentTrack,
  currentTime,
}: UsePlayerTrackTimeOptions): UsePlayerTrackTimeResult {
  return {
    trackCurrentTime: getTrackCurrentTime(currentTrack, currentTime),
    trackDuration: getTrackDuration(currentTrack),
  };
}

import type { RepeatMode, Track } from '../types/player';

interface AdvancePlayerQueueOptions {
  queue: readonly Track[];
  fromTrack: Track | null;
  repeatMode: RepeatMode;
  shuffleOn: boolean;
  allTracks: readonly Track[];
  random?: () => number;
}

interface AdvancePlayerQueueResult {
  nextTrack: Track | null;
  queue: Track[];
  skippedDeleted: boolean;
}

export function shuffleTracks<T>(tracks: readonly T[], random: () => number = Math.random): T[] {
  const result = [...tracks];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function advancePlayerQueue({
  queue,
  fromTrack,
  repeatMode,
  shuffleOn,
  allTracks,
  random = Math.random,
}: AdvancePlayerQueueOptions): AdvancePlayerQueueResult {
  let skippedDeleted = false;
  let firstQueuedIndex = 0;

  while (firstQueuedIndex < queue.length && queue[firstQueuedIndex]?.deleted) {
    skippedDeleted = true;
    firstQueuedIndex += 1;
  }

  let remainingQueue = queue.slice(firstQueuedIndex);

  if (remainingQueue.length === 0 && repeatMode === 'all' && allTracks.length > 0) {
    const tracks = allTracks.filter((track) => !track.deleted);
    if (tracks.length > 0) {
      remainingQueue = shuffleOn ? shuffleTracks(tracks, random) : [...tracks];
    }
  }

  const playable = remainingQueue.filter((track) => !track.deleted);

  if (playable.length === 0) {
    return {
      nextTrack: null,
      queue: [],
      skippedDeleted,
    };
  }

  const pickIndex = shuffleOn
    ? Math.floor(random() * playable.length)
    : 0;
  const nextTrack = playable[pickIndex]!;
  const actualIndex = remainingQueue.indexOf(nextTrack);
  const nextQueue = [...remainingQueue];
  nextQueue.splice(actualIndex, 1);

  if (
    repeatMode === 'all'
    && fromTrack
    && !fromTrack.deleted
    && !nextQueue.some((track) => track.id === fromTrack.id)
  ) {
    nextQueue.push(fromTrack);
  }

  return {
    nextTrack,
    queue: nextQueue,
    skippedDeleted,
  };
}

import { LyricLine } from './types';

/**
 * Parse an LRC-format string into an array of LyricLine objects.
 *
 * LRC format: [MM:SS.xx] text
 *   - MM  = minutes (two digits)
 *   - SS  = seconds (two digits)
 *   - xx  = hundredths of a second (1-3 digits, optional)
 *   - text = lyric text (may be empty for instrumental breaks)
 *
 * Lines without a valid timestamp are ignored.
 * Returned array is sorted ascending by time.
 *
 * Examples:
 *   "[01:23.45] 夜に駆ける"  → { time: 83.45, text: "夜に駆ける" }
 *   "[00:05.00]"             → { time: 5.0,   text: "" }
 */
export function parseLRC(lrcText: string): LyricLine[] {
  const lineRe = /\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]\s?(.*)/;
  const lines: LyricLine[] = [];

  for (const raw of lrcText.split('\n')) {
    const match = raw.match(lineRe);
    if (!match) continue;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);

    // Normalise fractional seconds: always treat as hundredths then convert to seconds
    let frac = 0;
    if (match[3]) {
      const digits = match[3];
      // Pad or truncate to 3 digits then divide by 1000 to get seconds
      const padded = digits.padEnd(3, '0');
      frac = parseInt(padded, 10) / 1000;
    }

    const time = minutes * 60 + seconds + frac;
    const text = match[4] ?? '';

    lines.push({ time, text });
  }

  lines.sort((a, b) => a.time - b.time);
  return lines;
}

/**
 * Given the current playback time and a sorted array of LyricLine, return the
 * index of the active line (largest i where lines[i].time <= currentTime).
 *
 * Returns -1 when no line has started yet.
 *
 * If the active line has empty text (instrumental break), this function skips
 * forward to find the next line that has non-empty text.  The returned index
 * may therefore be larger than the naïve "largest i where time <= currentTime".
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1;

  // Binary-search for largest i where lines[i].time <= currentTime
  let lo = 0;
  let hi = lines.length - 1;
  let active = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= currentTime) {
      active = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (active === -1) return -1;

  // If the active line is an instrumental break, advance to the next line with text
  if (lines[active].text === '') {
    for (let i = active + 1; i < lines.length; i++) {
      if (lines[i].text !== '') return i;
    }
    // All remaining lines are empty — fall back to the original index
    return active;
  }

  return active;
}

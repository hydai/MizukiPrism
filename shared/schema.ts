import type {
  AlbumArtUrls,
  ArtistInfo,
  ArtistPictureUrls,
  FetchStatus,
  MatchConfidence,
  Performance,
  Song,
  SongMetadata,
  Stream,
  StreamCredit,
} from './types';

export type ValidationResult<T> =
  | { ok: true; data: T; errors: [] }
  | { ok: false; errors: string[] };

const FETCH_STATUSES = new Set<FetchStatus>(['matched', 'no_match', 'error', 'manual']);
const MATCH_CONFIDENCES = new Set<MatchConfidence>(['exact', 'fuzzy', 'manual']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function push(errors: string[], path: string, expected: string): void {
  errors.push(`${path} must be ${expected}`);
}

function expectString(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== 'string') push(errors, path, 'a string');
}

function expectDateString(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    push(errors, path, 'a YYYY-MM-DD string');
  }
}

function expectNumber(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) push(errors, path, 'a finite number');
}

function expectNonNegativeInteger(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    push(errors, path, 'a non-negative integer');
  }
}

function expectNullableString(value: unknown, path: string, errors: string[]): void {
  if (value !== null && typeof value !== 'string') push(errors, path, 'a string or null');
}

function expectNullableNumber(value: unknown, path: string, errors: string[]): void {
  if (value !== null) expectNumber(value, path, errors);
}

function expectOptionalNullableNumber(
  record: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
): void {
  if (key in record) expectNullableNumber(record[key], `${path}.${key}`, errors);
}

function expectStringArray(value: unknown, path: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    push(errors, path, 'an array');
    return;
  }
  value.forEach((item, index) => expectString(item, `${path}[${index}]`, errors));
}

function validateOptionalStringFields(
  value: unknown,
  path: string,
  fields: readonly string[],
  errors: string[],
): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    push(errors, path, 'an object');
    return;
  }
  for (const field of fields) {
    if (field in value) expectString(value[field], `${path}.${field}`, errors);
  }
}

function validateNullableOptionalStringFields(
  value: unknown,
  path: string,
  fields: readonly string[],
  errors: string[],
): void {
  if (value === null) return;
  validateOptionalStringFields(value, path, fields, errors);
}

function validateRequiredNullableOptionalStringFields(
  record: Record<string, unknown>,
  key: string,
  path: string,
  fields: readonly string[],
  errors: string[],
): void {
  if (!(key in record) || record[key] === undefined) {
    push(errors, `${path}.${key}`, 'an object with optional string fields or null');
    return;
  }
  validateNullableOptionalStringFields(record[key], `${path}.${key}`, fields, errors);
}

function validateArray<T>(
  value: unknown,
  path: string,
  errors: string[],
  validateItem: (item: unknown, path: string, errors: string[]) => void,
): T[] | null {
  if (!Array.isArray(value)) {
    push(errors, path, 'an array');
    return null;
  }

  value.forEach((item, index) => validateItem(item, `${path}[${index}]`, errors));
  return value as T[];
}

function validatePerformance(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    push(errors, path, 'an object');
    return;
  }

  expectString(value.id, `${path}.id`, errors);
  expectString(value.streamId, `${path}.streamId`, errors);
  expectDateString(value.date, `${path}.date`, errors);
  expectString(value.streamTitle, `${path}.streamTitle`, errors);
  expectString(value.videoId, `${path}.videoId`, errors);
  expectNonNegativeInteger(value.timestamp, `${path}.timestamp`, errors);
  if (value.endTimestamp !== null) {
    expectNonNegativeInteger(value.endTimestamp, `${path}.endTimestamp`, errors);
    if (
      typeof value.timestamp === 'number' &&
      Number.isInteger(value.timestamp) &&
      typeof value.endTimestamp === 'number' &&
      Number.isInteger(value.endTimestamp) &&
      value.endTimestamp < value.timestamp
    ) {
      errors.push(`${path}.endTimestamp must be greater than or equal to ${path}.timestamp`);
    }
  }
  expectString(value.note, `${path}.note`, errors);
}

function validateSong(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    push(errors, path, 'an object');
    return;
  }

  expectString(value.id, `${path}.id`, errors);
  expectString(value.title, `${path}.title`, errors);
  expectString(value.originalArtist, `${path}.originalArtist`, errors);
  expectStringArray(value.tags, `${path}.tags`, errors);
  validateArray<Performance>(value.performances, `${path}.performances`, errors, validatePerformance);
}

function validateStream(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    push(errors, path, 'an object');
    return;
  }

  expectString(value.id, `${path}.id`, errors);
  expectString(value.title, `${path}.title`, errors);
  expectDateString(value.date, `${path}.date`, errors);
  expectString(value.videoId, `${path}.videoId`, errors);
  expectString(value.youtubeUrl, `${path}.youtubeUrl`, errors);
  validateOptionalStringFields(
    value.credit,
    `${path}.credit`,
    ['author', 'authorUrl', 'commentUrl'] satisfies (keyof StreamCredit)[],
    errors,
  );
}

function validateSongMetadataEntry(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    push(errors, path, 'an object');
    return;
  }

  expectString(value.songId, `${path}.songId`, errors);
  if (typeof value.fetchStatus !== 'string' || !FETCH_STATUSES.has(value.fetchStatus as FetchStatus)) {
    push(errors, `${path}.fetchStatus`, 'one of matched, no_match, error, manual');
  }
  if (
    value.matchConfidence !== null &&
    (typeof value.matchConfidence !== 'string' ||
      !MATCH_CONFIDENCES.has(value.matchConfidence as MatchConfidence))
  ) {
    push(errors, `${path}.matchConfidence`, 'one of exact, fuzzy, manual, or null');
  }
  expectNullableString(value.albumArtUrl, `${path}.albumArtUrl`, errors);
  validateRequiredNullableOptionalStringFields(
    value,
    'albumArtUrls',
    path,
    ['small', 'medium', 'big', 'xl'] satisfies (keyof AlbumArtUrls)[],
    errors,
  );
  expectNullableString(value.albumTitle, `${path}.albumTitle`, errors);
  expectNullableNumber(value.deezerTrackId, `${path}.deezerTrackId`, errors);
  expectNullableNumber(value.deezerArtistId, `${path}.deezerArtistId`, errors);
  expectOptionalNullableNumber(value, 'itunesTrackId', path, errors);
  expectOptionalNullableNumber(value, 'itunesCollectionId', path, errors);
  expectNullableNumber(value.trackDuration, `${path}.trackDuration`, errors);
  expectString(value.fetchedAt, `${path}.fetchedAt`, errors);
  expectNullableString(value.lastError, `${path}.lastError`, errors);
}

function validateArtistInfoEntry(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    push(errors, path, 'an object');
    return;
  }

  expectString(value.normalizedArtist, `${path}.normalizedArtist`, errors);
  expectString(value.originalName, `${path}.originalName`, errors);
  expectOptionalNullableNumber(value, 'deezerArtistId', path, errors);
  expectOptionalNullableNumber(value, 'itunesArtistId', path, errors);
  validateNullableOptionalStringFields(
    value.pictureUrls,
    `${path}.pictureUrls`,
    ['medium', 'big', 'xl'] satisfies (keyof ArtistPictureUrls)[],
    errors,
  );
  expectString(value.fetchedAt, `${path}.fetchedAt`, errors);
}

function result<T>(data: T | null, errors: string[]): ValidationResult<T> {
  if (errors.length > 0 || data === null) return { ok: false, errors };
  return { ok: true, data, errors: [] };
}

export function validateSongsData(value: unknown): ValidationResult<Song[]> {
  const errors: string[] = [];
  return result(validateArray<Song>(value, 'songs', errors, validateSong), errors);
}

export function validateStreamsData(value: unknown): ValidationResult<Stream[]> {
  const errors: string[] = [];
  return result(validateArray<Stream>(value, 'streams', errors, validateStream), errors);
}

export function validateSongMetadataData(value: unknown): ValidationResult<SongMetadata[]> {
  const errors: string[] = [];
  return result(validateArray<SongMetadata>(value, 'songMetadata', errors, validateSongMetadataEntry), errors);
}

export function validateArtistInfoData(value: unknown): ValidationResult<ArtistInfo[]> {
  const errors: string[] = [];
  return result(validateArray<ArtistInfo>(value, 'artistInfo', errors, validateArtistInfoEntry), errors);
}

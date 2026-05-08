import type { Playlist, PlaylistExportEnvelope, PlaylistVersion } from '../types/playlist';

type PlaylistImportValidationResult =
  | { valid: true; playlists: Playlist[] }
  | { valid: false; error: string };

type PlaylistImportReadResult =
  | { success: true; playlists: Playlist[] }
  | { success: false; error: string };

type PlaylistImportFileReader = Pick<File, 'text'>;

export const PLAYLIST_IMPORT_INVALID_FILE_ERROR = '無法匯入：檔案格式無效';
const PLAYLIST_EXPORT_FILENAME_FALLBACK = 'playlist';

export function formatPlaylistExportDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function buildPlaylistCollectionExportFilename(date = new Date()): string {
  return `mizukiprism-playlists-${formatPlaylistExportDate(date)}.json`;
}

function sanitizePlaylistExportFilenameSegment(value: string): string {
  const sanitized = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/(?:\s*-+\s*)+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || PLAYLIST_EXPORT_FILENAME_FALLBACK;
}

export function buildSinglePlaylistExportFilename(playlistName: string, date = new Date()): string {
  return `mizukiprism-${sanitizePlaylistExportFilenameSegment(playlistName)}-${formatPlaylistExportDate(date)}.json`;
}

export function downloadPlaylistJson(data: PlaylistExportEnvelope, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildPlaylistExportEnvelope(
  playlists: Playlist[],
  exportedAt = new Date().toISOString(),
): PlaylistExportEnvelope {
  return {
    version: 1,
    exportedAt,
    source: 'MizukiPrism',
    playlists,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isPlaylistVersion(value: unknown): value is PlaylistVersion {
  if (!isRecord(value)) return false;

  return typeof value.performanceId === 'string'
    && typeof value.songTitle === 'string'
    && typeof value.originalArtist === 'string'
    && typeof value.videoId === 'string'
    && typeof value.timestamp === 'number'
    && (value.endTimestamp == null || typeof value.endTimestamp === 'number');
}

export function validatePlaylistImport(data: unknown): PlaylistImportValidationResult {
  if (!isRecord(data)) {
    return { valid: false, error: '檔案格式無效' };
  }

  if (data.source !== 'MizukiPrism') {
    return { valid: false, error: '非 MizukiPrism 匯出檔案' };
  }

  if (data.version !== 1) {
    return { valid: false, error: '檔案版本不支援' };
  }

  if (!Array.isArray(data.playlists) || data.playlists.length === 0) {
    return { valid: false, error: '檔案不含播放清單' };
  }

  const validPlaylists: Playlist[] = [];
  for (const p of data.playlists) {
    if (
      isRecord(p) &&
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      Array.isArray(p.versions) &&
      p.versions.every(isPlaylistVersion) &&
      typeof p.createdAt === 'number' &&
      typeof p.updatedAt === 'number'
    ) {
      validPlaylists.push({
        id: p.id,
        name: p.name,
        versions: p.versions,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    }
  }

  if (validPlaylists.length === 0) {
    return { valid: false, error: '檔案不含有效的播放清單' };
  }

  return { valid: true, playlists: validPlaylists };
}

export function parsePlaylistImportText(text: string): PlaylistImportReadResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { success: false, error: PLAYLIST_IMPORT_INVALID_FILE_ERROR };
  }

  const result = validatePlaylistImport(data);
  if (!result.valid) {
    return { success: false, error: `無法匯入：${result.error}` };
  }

  return { success: true, playlists: result.playlists };
}

export async function readPlaylistImportFile(
  file: PlaylistImportFileReader,
): Promise<PlaylistImportReadResult> {
  try {
    return parsePlaylistImportText(await file.text());
  } catch {
    return { success: false, error: PLAYLIST_IMPORT_INVALID_FILE_ERROR };
  }
}

import type { Playlist, PlaylistExportEnvelope } from '../types/playlist';

type PlaylistImportValidationResult =
  | { valid: true; playlists: Playlist[] }
  | { valid: false; error: string };

export function formatPlaylistExportDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

export function validatePlaylistImport(data: unknown): PlaylistImportValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '檔案格式無效' };
  }

  const envelope = data as Record<string, unknown>;

  if (envelope.source !== 'MizukiPrism') {
    return { valid: false, error: '非 MizukiPrism 匯出檔案' };
  }

  if (envelope.version !== 1) {
    return { valid: false, error: '檔案版本不支援' };
  }

  if (!Array.isArray(envelope.playlists) || envelope.playlists.length === 0) {
    return { valid: false, error: '檔案不含播放清單' };
  }

  const validPlaylists: Playlist[] = [];
  for (const p of envelope.playlists) {
    if (
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      Array.isArray(p.versions) &&
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

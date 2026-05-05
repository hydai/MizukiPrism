import assert from 'node:assert/strict';
import {
  buildPlaylistExportEnvelope,
  formatPlaylistExportDate,
  validatePlaylistImport,
} from '../app/lib/playlistImportExport';
import type { Playlist } from '../app/types/playlist';

const playlist: Playlist = {
  id: 'playlist-1',
  name: 'My Playlist',
  versions: [
    {
      performanceId: 'performance-1',
      songTitle: 'Song 1',
      originalArtist: 'Artist 1',
      videoId: 'video-1',
      timestamp: 30,
    },
  ],
  createdAt: 1000,
  updatedAt: 2000,
};

assert.equal(formatPlaylistExportDate(new Date(2026, 4, 5, 12, 34, 56)), '2026-05-05');

assert.deepEqual(
  buildPlaylistExportEnvelope([playlist], '2026-05-05T12:34:56.000Z'),
  {
    version: 1,
    exportedAt: '2026-05-05T12:34:56.000Z',
    source: 'MizukiPrism',
    playlists: [playlist],
  },
);

assert.deepEqual(
  validatePlaylistImport({
    version: 1,
    source: 'MizukiPrism',
    playlists: [playlist],
  }),
  {
    valid: true,
    playlists: [playlist],
  },
);

assert.deepEqual(
  validatePlaylistImport({
    version: 1,
    source: 'MizukiPrism',
    playlists: [null],
  }),
  {
    valid: false,
    error: '檔案不含有效的播放清單',
  },
);

assert.deepEqual(
  validatePlaylistImport({
    version: 1,
    source: 'MizukiPrism',
    playlists: [
      {
        ...playlist,
        versions: [null],
      },
    ],
  }),
  {
    valid: false,
    error: '檔案不含有效的播放清單',
  },
);

assert.deepEqual(
  validatePlaylistImport({
    version: 1,
    source: 'MizukiPrism',
    playlists: [
      {
        ...playlist,
        versions: [{ ...playlist.versions[0], timestamp: '30' }],
      },
    ],
  }),
  {
    valid: false,
    error: '檔案不含有效的播放清單',
  },
);

assert.deepEqual(
  validatePlaylistImport({
    version: 1,
    source: 'MizukiPrism',
    playlists: [
      {
        ...playlist,
        versions: [{ ...playlist.versions[0], endTimestamp: '60' }],
      },
    ],
  }),
  {
    valid: false,
    error: '檔案不含有效的播放清單',
  },
);

assert.deepEqual(validatePlaylistImport(null), {
  valid: false,
  error: '檔案格式無效',
});

assert.deepEqual(validatePlaylistImport({ version: 1, source: 'Other', playlists: [playlist] }), {
  valid: false,
  error: '非 MizukiPrism 匯出檔案',
});

assert.deepEqual(validatePlaylistImport({ version: 2, source: 'MizukiPrism', playlists: [playlist] }), {
  valid: false,
  error: '檔案版本不支援',
});

assert.deepEqual(validatePlaylistImport({ version: 1, source: 'MizukiPrism', playlists: [] }), {
  valid: false,
  error: '檔案不含播放清單',
});

assert.deepEqual(
  validatePlaylistImport({
    version: 1,
    source: 'MizukiPrism',
    playlists: [{ id: 'playlist-invalid' }],
  }),
  {
    valid: false,
    error: '檔案不含有效的播放清單',
  },
);

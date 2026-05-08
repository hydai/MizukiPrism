import assert from 'node:assert/strict';
import {
  PLAYLIST_IMPORT_INVALID_FILE_ERROR,
  buildPlaylistCollectionExportFilename,
  buildPlaylistExportEnvelope,
  buildSinglePlaylistExportFilename,
  formatPlaylistExportDate,
  parsePlaylistImportText,
  readPlaylistImportFile,
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

function createPlaylistImportFile(text: string): Pick<File, 'text'> {
  return {
    text: async () => text,
  };
}

assert.equal(formatPlaylistExportDate(new Date(2026, 4, 5, 12, 34, 56)), '2026-05-05');
assert.equal(
  buildPlaylistCollectionExportFilename(new Date(2026, 4, 5, 12, 34, 56)),
  'mizukiprism-playlists-2026-05-05.json',
);
assert.equal(
  buildSinglePlaylistExportFilename('My Playlist', new Date(2026, 4, 5, 12, 34, 56)),
  'mizukiprism-My Playlist-2026-05-05.json',
);

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
  parsePlaylistImportText(JSON.stringify({
    version: 1,
    source: 'MizukiPrism',
    playlists: [playlist],
  })),
  {
    success: true,
    playlists: [playlist],
  },
);

assert.deepEqual(parsePlaylistImportText('{'), {
  success: false,
  error: PLAYLIST_IMPORT_INVALID_FILE_ERROR,
});

assert.deepEqual(
  parsePlaylistImportText(JSON.stringify({ version: 2, source: 'MizukiPrism', playlists: [playlist] })),
  {
    success: false,
    error: '無法匯入：檔案版本不支援',
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

async function main(): Promise<void> {
  assert.deepEqual(
    await readPlaylistImportFile(createPlaylistImportFile(JSON.stringify({
      version: 1,
      source: 'MizukiPrism',
      playlists: [playlist],
    }))),
    {
      success: true,
      playlists: [playlist],
    },
  );

  assert.deepEqual(await readPlaylistImportFile(createPlaylistImportFile('not json')), {
    success: false,
    error: PLAYLIST_IMPORT_INVALID_FILE_ERROR,
  });

  assert.deepEqual(
    await readPlaylistImportFile({
      text: async () => {
        throw new Error('file read failed');
      },
    }),
    {
      success: false,
      error: PLAYLIST_IMPORT_INVALID_FILE_ERROR,
    },
  );
}

void main();

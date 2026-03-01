import { Hono } from 'hono';
import { requireAuth, requireCurator } from './auth';
import {
  listSongs,
  getSongById,
  insertSong,
  updateSong,
  updateSongStatus,
  generateSongId,
  listPerformances,
  insertPerformance,
  getPerformanceStatus as db_getPerformanceStatus,
  updatePerformanceStatus,
  generatePerformanceId,
  listStreams,
  getStreamById,
  insertStream,
  updateStreamStatus,
  generateStreamId,
  generateStreamIdFallback,
  streamIdExists,
  getDashboardStats,
  exportSongs,
  exportStreams,
  listPerformancesForStream,
  createSongAndPerformance,
  updatePerformanceTimestamps,
  updatePerformanceSongDetails,
  deletePerformanceAndOrphanSong,
  listStreamsWithPendingCounts,
  getStampStats,
  clearAllEndTimestamps,
  getPerformanceWithSong,
  bulkCreatePerformances,
  getStreamDetail,
  updatePerformanceNote,
} from './db';
import { fetchItunesDuration } from './itunes';
import { parseTextToSongs } from '../shared/parse';
import type {
  AuthUser,
  CreateSongBody,
  UpdateSongBody,
  CreatePerformanceBody,
  CreateStreamBody,
  StatusUpdateBody,
  CreateStampPerformanceBody,
  UpdateTimestampsBody,
  UpdateSongDetailsBody,
  FetchDurationResponse,
  PasteImportBody,
  PasteImportResponse,
} from '../shared/types';

type Bindings = {
  DB: D1Database;
  CURATOR_EMAILS: string;
};

type Variables = {
  user: AuthUser;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --- Status transition rules ---

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected', 'excluded', 'extracted']);

const ALLOWED_TRANSITIONS: Record<string, Set<string>> = {
  pending:   new Set(['approved', 'rejected', 'excluded', 'extracted']),
  extracted: new Set(['approved', 'rejected', 'excluded', 'pending']),
  approved:  new Set(['extracted', 'pending']),  // unapprove
  rejected:  new Set(['pending', 'excluded']),
  excluded:  new Set(['pending']),               // restore from excluded
};

function isValidTransition(from: string, to: string): boolean {
  return ALLOWED_TRANSITIONS[from]?.has(to) ?? false;
}

// All routes require authentication
app.use('/api/*', requireAuth);

// --- Auth info ---

app.get('/api/me', async (c) => {
  return c.json(c.get('user'));
});

// --- Songs ---

app.get('/api/songs', async (c) => {
  const status = c.req.query('status');
  const songs = await listSongs(c.env.DB, status);
  return c.json({ data: songs, total: songs.length });
});

app.get('/api/songs/:id', async (c) => {
  const song = await getSongById(c.env.DB, c.req.param('id'));
  if (!song) return c.json({ error: 'Song not found' }, 404);
  return c.json(song);
});

app.post('/api/songs', async (c) => {
  const body = await c.req.json<CreateSongBody>();
  if (!body.title || !body.originalArtist) {
    return c.json({ error: 'title and originalArtist are required' }, 400);
  }

  const user = c.get('user');
  const id = generateSongId();
  await insertSong(c.env.DB, id, body.title, body.originalArtist, body.tags || [], user.email);

  // If inline performances are provided, insert them too
  if (body.performances && body.performances.length > 0) {
    for (const perf of body.performances) {
      const perfId = generatePerformanceId();
      await insertPerformance(
        c.env.DB,
        perfId,
        id,
        perf.streamId,
        perf.date,
        perf.streamTitle,
        perf.videoId,
        perf.timestamp,
        perf.endTimestamp ?? null,
        perf.note ?? '',
        user.email,
      );
    }
  }

  const song = await getSongById(c.env.DB, id);
  return c.json(song, 201);
});

app.put('/api/songs/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  const existing = await getSongById(c.env.DB, id);
  if (!existing) return c.json({ error: 'Song not found' }, 404);

  // Contributors can only edit their own pending entries
  if (user.role !== 'curator') {
    if (existing.status !== 'pending') {
      return c.json({ error: 'Can only edit pending songs' }, 403);
    }
    if (existing.submittedBy !== user.email) {
      return c.json({ error: 'Can only edit your own submissions' }, 403);
    }
  }

  const body = await c.req.json<UpdateSongBody>();
  await updateSong(c.env.DB, id, {
    title: body.title,
    originalArtist: body.originalArtist,
    tags: body.tags,
  });

  const updated = await getSongById(c.env.DB, id);
  return c.json(updated);
});

app.patch('/api/songs/:id/status', requireCurator, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<StatusUpdateBody>();

  if (!VALID_STATUSES.has(body.status)) {
    return c.json({ error: `Invalid status: ${body.status}` }, 400);
  }

  const existing = await getSongById(c.env.DB, id);
  if (!existing) return c.json({ error: 'Song not found' }, 404);

  if (!isValidTransition(existing.status, body.status)) {
    return c.json({ error: `Cannot transition from ${existing.status} to ${body.status}` }, 400);
  }

  const user = c.get('user');
  await updateSongStatus(c.env.DB, id, body.status, user.email);
  const song = await getSongById(c.env.DB, id);
  return c.json(song);
});

// --- Performances ---

app.get('/api/performances', async (c) => {
  const songId = c.req.query('songId');
  const status = c.req.query('status');
  const performances = await listPerformances(c.env.DB, songId, status);
  return c.json({ data: performances, total: performances.length });
});

app.post('/api/performances', async (c) => {
  const body = await c.req.json<CreatePerformanceBody>();
  if (!body.songId || !body.streamId || !body.date || !body.streamTitle || !body.videoId || body.timestamp === undefined) {
    return c.json({ error: 'songId, streamId, date, streamTitle, videoId, and timestamp are required' }, 400);
  }

  const user = c.get('user');
  const id = generatePerformanceId();
  await insertPerformance(
    c.env.DB,
    id,
    body.songId,
    body.streamId,
    body.date,
    body.streamTitle,
    body.videoId,
    body.timestamp,
    body.endTimestamp ?? null,
    body.note ?? '',
    user.email,
  );

  return c.json({ id, status: 'pending' }, 201);
});

app.patch('/api/performances/:id/status', requireCurator, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<StatusUpdateBody>();

  if (!VALID_STATUSES.has(body.status)) {
    return c.json({ error: `Invalid status: ${body.status}` }, 400);
  }

  // Get current status for transition check
  const current = await db_getPerformanceStatus(c.env.DB, id);
  if (!current) return c.json({ error: 'Performance not found' }, 404);

  if (!isValidTransition(current, body.status)) {
    return c.json({ error: `Cannot transition from ${current} to ${body.status}` }, 400);
  }

  await updatePerformanceStatus(c.env.DB, id, body.status);
  return c.json({ id, status: body.status });
});

// --- Streams ---

app.get('/api/streams', async (c) => {
  const status = c.req.query('status');
  const streams = await listStreams(c.env.DB, status);
  return c.json({ data: streams, total: streams.length });
});

app.post('/api/streams', async (c) => {
  const body = await c.req.json<CreateStreamBody>();
  if (!body.title || !body.date || !body.videoId || !body.youtubeUrl) {
    return c.json({ error: 'title, date, videoId, and youtubeUrl are required' }, 400);
  }

  const user = c.get('user');

  // Generate stream ID: prefer date-based, fallback to UUID if collision
  let id = generateStreamId(body.date);
  if (await streamIdExists(c.env.DB, id)) {
    id = generateStreamIdFallback();
  }

  await insertStream(
    c.env.DB,
    id,
    body.title,
    body.date,
    body.videoId,
    body.youtubeUrl,
    JSON.stringify(body.credit || {}),
    user.email,
  );

  return c.json({ id, status: 'pending' }, 201);
});

app.patch('/api/streams/:id/status', requireCurator, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<StatusUpdateBody>();

  if (!VALID_STATUSES.has(body.status)) {
    return c.json({ error: `Invalid status: ${body.status}` }, 400);
  }

  const existing = await getStreamById(c.env.DB, id);
  if (!existing) return c.json({ error: 'Stream not found' }, 404);

  if (!isValidTransition(existing.status, body.status)) {
    return c.json({ error: `Cannot transition from ${existing.status} to ${body.status}` }, 400);
  }

  const user = c.get('user');
  await updateStreamStatus(c.env.DB, id, body.status, user.email);
  return c.json({ id, status: body.status });
});

// --- Stamp editor ---

app.get('/api/streams/:streamId/performances', async (c) => {
  const streamId = c.req.param('streamId');
  const performances = await listPerformancesForStream(c.env.DB, streamId);
  return c.json({ data: performances, total: performances.length });
});

app.post('/api/streams/:streamId/performances', async (c) => {
  const streamId = c.req.param('streamId');
  const body = await c.req.json<CreateStampPerformanceBody>();
  if (!body.title || !body.originalArtist || body.timestamp === undefined) {
    return c.json({ error: 'title, originalArtist, and timestamp are required' }, 400);
  }

  const stream = await getStreamById(c.env.DB, streamId);
  if (!stream) return c.json({ error: 'Stream not found' }, 404);

  const user = c.get('user');
  const result = await createSongAndPerformance(
    c.env.DB,
    streamId,
    stream.date,
    stream.title,
    stream.videoId,
    body.title,
    body.originalArtist,
    body.timestamp,
    body.endTimestamp ?? null,
    body.note ?? '',
    user.email,
  );

  return c.json(result, 201);
});

app.patch('/api/performances/:id/timestamps', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<UpdateTimestampsBody>();
  const updated = await updatePerformanceTimestamps(c.env.DB, id, {
    timestamp: body.timestamp,
    endTimestamp: body.endTimestamp,
  });
  if (!updated) return c.json({ error: 'Performance not found' }, 404);
  return c.json({ ok: true });
});

app.patch('/api/performances/:id/details', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<UpdateSongDetailsBody>();
  const updated = await updatePerformanceSongDetails(c.env.DB, id, {
    title: body.title,
    originalArtist: body.originalArtist,
  });
  if (!updated) return c.json({ error: 'Performance not found' }, 404);
  return c.json({ ok: true });
});

app.delete('/api/performances/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deletePerformanceAndOrphanSong(c.env.DB, id);
  if (!deleted) return c.json({ error: 'Performance not found' }, 404);
  return c.json({ ok: true });
});

// --- Stamp: streams with pending counts ---

app.get('/api/stamp/streams', async (c) => {
  const streams = await listStreamsWithPendingCounts(c.env.DB);
  return c.json({ data: streams, total: streams.length });
});

// --- Stamp: stats ---

app.get('/api/stamp/stats', async (c) => {
  const stats = await getStampStats(c.env.DB);
  return c.json(stats);
});

// --- Stream detail ---

app.get('/api/streams/:streamId/detail', async (c) => {
  const streamId = c.req.param('streamId');
  const detail = await getStreamDetail(c.env.DB, streamId);
  if (!detail) return c.json({ error: 'Stream not found' }, 404);
  return c.json(detail);
});

// --- Performance note update ---

app.patch('/api/performances/:id/note', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ note: string }>();
  if (body.note === undefined) {
    return c.json({ error: 'note is required' }, 400);
  }
  const updated = await updatePerformanceNote(c.env.DB, id, body.note);
  if (!updated) return c.json({ error: 'Performance not found' }, 404);
  return c.json({ ok: true });
});

// --- Stamp: paste import ---

app.post('/api/streams/:streamId/paste-import', async (c) => {
  const streamId = c.req.param('streamId');
  const body = await c.req.json<PasteImportBody>();
  if (!body.text || !body.text.trim()) {
    return c.json({ error: 'text is required' }, 400);
  }

  const stream = await getStreamById(c.env.DB, streamId);
  if (!stream) return c.json({ error: 'Stream not found' }, 404);

  const parsed = parseTextToSongs(body.text);
  if (parsed.length === 0) {
    return c.json<PasteImportResponse>({
      ok: false,
      parsed: 0,
      created: 0,
      replaced: false,
      errors: ['No valid song lines found in the pasted text'],
    });
  }

  const user = c.get('user');
  const songs = parsed.map((s) => ({
    songName: s.songName,
    artist: s.artist,
    startSeconds: s.startSeconds,
    endSeconds: s.endSeconds,
  }));

  const { created } = await bulkCreatePerformances(
    c.env.DB,
    streamId,
    stream.date,
    stream.title,
    stream.videoId,
    songs,
    user.email,
    body.replace ?? false,
  );

  return c.json<PasteImportResponse>({
    ok: true,
    parsed: parsed.length,
    created,
    replaced: body.replace ?? false,
    errors: [],
  });
});

// --- Stamp: clear all end timestamps ---

app.delete('/api/streams/:streamId/end-timestamps', async (c) => {
  const streamId = c.req.param('streamId');
  const cleared = await clearAllEndTimestamps(c.env.DB, streamId);
  return c.json({ ok: true, cleared });
});

// --- Stamp: fetch duration from iTunes ---

app.post('/api/performances/:id/fetch-duration', async (c) => {
  const id = c.req.param('id');
  const perf = await getPerformanceWithSong(c.env.DB, id);
  if (!perf) return c.json({ error: 'Performance not found' }, 404);

  const { durationSec, matchConfidence } = await fetchItunesDuration(
    perf.originalArtist,
    perf.title,
  );

  let endTimestamp: number | null = null;
  if (durationSec && perf.endTimestamp === null) {
    endTimestamp = perf.timestamp + durationSec;
    await updatePerformanceTimestamps(c.env.DB, id, { endTimestamp });
  }

  const resp: FetchDurationResponse = {
    ok: true,
    durationSec,
    endTimestamp,
    matchConfidence,
  };
  return c.json(resp);
});

// --- Export (fan-site format) ---

app.get('/api/export/songs', requireCurator, async (c) => {
  const songs = await exportSongs(c.env.DB);
  return c.json(songs);
});

app.get('/api/export/streams', requireCurator, async (c) => {
  const streams = await exportStreams(c.env.DB);
  return c.json(streams);
});

// --- Stats ---

app.get('/api/stats', async (c) => {
  const stats = await getDashboardStats(c.env.DB);
  return c.json(stats);
});

// Static assets (admin UI) are served automatically by the [assets]
// binding in wrangler.toml for non-API routes.
export default app;

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
  updatePerformanceStatus,
  generatePerformanceId,
  listStreams,
  insertStream,
  updateStreamStatus,
  generateStreamId,
  generateStreamIdFallback,
  streamIdExists,
  getDashboardStats,
  exportSongs,
  exportStreams,
} from './db';
import type {
  AuthUser,
  CreateSongBody,
  UpdateSongBody,
  CreatePerformanceBody,
  CreateStreamBody,
  StatusUpdateBody,
} from '../shared/types';

type Bindings = {
  DB: D1Database;
  CURATOR_EMAILS: string;
};

type Variables = {
  user: AuthUser;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

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

  if (body.status !== 'approved' && body.status !== 'rejected') {
    return c.json({ error: 'status must be "approved" or "rejected"' }, 400);
  }

  const user = c.get('user');
  const updated = await updateSongStatus(c.env.DB, id, body.status, user.email);
  if (!updated) return c.json({ error: 'Song not found' }, 404);

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

  if (body.status !== 'approved' && body.status !== 'rejected') {
    return c.json({ error: 'status must be "approved" or "rejected"' }, 400);
  }

  const updated = await updatePerformanceStatus(c.env.DB, id, body.status);
  if (!updated) return c.json({ error: 'Performance not found' }, 404);

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

  if (body.status !== 'approved' && body.status !== 'rejected') {
    return c.json({ error: 'status must be "approved" or "rejected"' }, 400);
  }

  const user = c.get('user');
  const updated = await updateStreamStatus(c.env.DB, id, body.status, user.email);
  if (!updated) return c.json({ error: 'Stream not found' }, 404);

  return c.json({ id, status: body.status });
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

export default app;

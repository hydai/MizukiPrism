import { Env, FanUser, PlaylistVersion } from "../types";

/**
 * GET /api/playlists
 * Returns all playlists for the authenticated user.
 * Requires: Authorization: Bearer {token}
 * Subrequest estimate: 1 (D1 SELECT)
 */
export async function handleGetPlaylists(
  _request: Request,
  env: Env,
  user: FanUser
): Promise<Response> {
  const result = await env.DB.prepare(
    "SELECT id, name, versions, created_at, updated_at FROM playlists WHERE user_id = ?"
  )
    .bind(user.id)
    .all<{
      id: string;
      name: string;
      versions: string;
      created_at: number;
      updated_at: number;
    }>();

  const playlists = (result.results ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    versions: JSON.parse(row.versions) as PlaylistVersion[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return new Response(JSON.stringify({ playlists }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /api/playlists/sync
 * Full batch sync: replaces all user playlists atomically.
 * Uses D1 batch: delete all then insert each.
 * Requires: Authorization: Bearer {token}
 * Subrequest estimate: 2 + N (1 DELETE stmt + N INSERT stmts in batch)
 */
export async function handleSyncPlaylists(
  request: Request,
  env: Env,
  user: FanUser
): Promise<Response> {
  let body: { playlists: Array<{ id: string; name: string; versions: PlaylistVersion[]; createdAt: number; updatedAt: number }> };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { playlists } = body;

  if (!Array.isArray(playlists)) {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build batch statements: first delete all, then insert each
  const deleteStmt = env.DB.prepare(
    "DELETE FROM playlists WHERE user_id = ?"
  ).bind(user.id);

  const insertStmts = playlists.map((playlist) =>
    env.DB.prepare(
      "INSERT INTO playlists (id, user_id, name, versions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      playlist.id,
      user.id,
      playlist.name,
      JSON.stringify(playlist.versions),
      playlist.createdAt,
      playlist.updatedAt
    )
  );

  try {
    await env.DB.batch([deleteStmt, ...insertStmts]);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "INTERNAL_ERROR" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, syncedCount: playlists.length }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * PUT /api/playlists/:id
 * Create or update a single playlist.
 * Implements last-write-wins conflict resolution based on updatedAt.
 * Requires: Authorization: Bearer {token}
 * Subrequest estimate: 2-3 (1 SELECT + 0-1 UPSERT)
 */
export async function handleUpsertPlaylist(
  request: Request,
  env: Env,
  user: FanUser,
  playlistId: string
): Promise<Response> {
  let body: { id: string; name: string; versions: PlaylistVersion[]; createdAt: number; updatedAt: number };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate required fields
  if (
    !body.id ||
    !body.name ||
    !Array.isArray(body.versions) ||
    typeof body.createdAt !== "number" ||
    typeof body.updatedAt !== "number"
  ) {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // URL playlistId must match body id
  if (playlistId !== body.id) {
    return new Response(
      JSON.stringify({ success: false, error: "ID_MISMATCH" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check for existing playlist (conflict resolution)
  const existing = await env.DB.prepare(
    "SELECT updated_at FROM playlists WHERE id = ? AND user_id = ?"
  )
    .bind(playlistId, user.id)
    .first<{ updated_at: number }>();

  // Last-write-wins: if cloud is newer than client, keep cloud version
  if (existing && existing.updated_at > body.updatedAt) {
    return new Response(
      JSON.stringify({ success: true, conflict: true, keptVersion: "cloud" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Upsert the client version
  await env.DB.prepare(
    "INSERT OR REPLACE INTO playlists (id, user_id, name, versions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(
      body.id,
      user.id,
      body.name,
      JSON.stringify(body.versions),
      body.createdAt,
      body.updatedAt
    )
    .run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * DELETE /api/playlists/:id
 * Delete a single playlist.
 * Returns 404 if the playlist does not exist.
 * Requires: Authorization: Bearer {token}
 * Subrequest estimate: 2 (1 DELETE stmt)
 */
export async function handleDeletePlaylist(
  _request: Request,
  env: Env,
  user: FanUser,
  playlistId: string
): Promise<Response> {
  const result = await env.DB.prepare(
    "DELETE FROM playlists WHERE id = ? AND user_id = ?"
  )
    .bind(playlistId, user.id)
    .run();

  if (result.meta.changes === 0) {
    return new Response(
      JSON.stringify({ success: false, error: "NOT_FOUND" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

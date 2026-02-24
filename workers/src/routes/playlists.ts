import { Env, FanUser } from "../types";

/**
 * GET /api/playlists
 * Returns all playlists for the authenticated user.
 * Requires: Authorization: Bearer {token}
 */
export async function handleGetPlaylists(
  _request: Request,
  _env: Env,
  _user: FanUser
): Promise<Response> {
  // TODO: Implement GET /api/playlists
  // 1. Query D1: SELECT * FROM playlists WHERE user_id = user.id
  // 2. Parse versions JSON field for each playlist
  // 3. Return array of CloudPlaylist objects
  return new Response(
    JSON.stringify({ playlists: [] }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * POST /api/playlists/sync
 * Full batch sync: replaces all user playlists atomically.
 * Uses D1 transaction: delete all then insert each.
 * Requires: Authorization: Bearer {token}
 */
export async function handleSyncPlaylists(
  _request: Request,
  _env: Env,
  _user: FanUser
): Promise<Response> {
  // TODO: Implement POST /api/playlists/sync
  // 1. Parse request body (SyncPlaylistsBody)
  // 2. Use D1 transaction:
  //    a. DELETE FROM playlists WHERE user_id = user.id
  //    b. INSERT each playlist (versions serialized as JSON string)
  // 3. Return syncedCount on success, 500 on transaction failure
  return new Response(
    JSON.stringify({ success: true, syncedCount: 0 }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * PUT /api/playlists/:id
 * Create or update a single playlist.
 * Implements last-write-wins conflict resolution based on updatedAt.
 * Requires: Authorization: Bearer {token}
 */
export async function handleUpsertPlaylist(
  _request: Request,
  _env: Env,
  _user: FanUser,
  _playlistId: string
): Promise<Response> {
  // TODO: Implement PUT /api/playlists/:id
  // 1. Parse request body (UpsertPlaylistBody)
  // 2. Query D1 for existing playlist: SELECT * FROM playlists WHERE id = playlistId AND user_id = user.id
  // 3. Conflict resolution (last-write-wins):
  //    - If client updatedAt >= cloud updatedAt: update with client data
  //    - If client updatedAt < cloud updatedAt: keep cloud data, return conflict=true
  // 4. UPSERT into D1 (INSERT OR REPLACE)
  // 5. Return success with optional conflict fields
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * DELETE /api/playlists/:id
 * Delete a single playlist.
 * Returns 404 if the playlist does not exist.
 * Requires: Authorization: Bearer {token}
 */
export async function handleDeletePlaylist(
  _request: Request,
  _env: Env,
  _user: FanUser,
  _playlistId: string
): Promise<Response> {
  // TODO: Implement DELETE /api/playlists/:id
  // 1. DELETE FROM playlists WHERE id = playlistId AND user_id = user.id
  // 2. Check rows affected: if 0, return 404 NOT_FOUND
  // 3. Return 200 success
  return new Response(
    JSON.stringify({ success: false, error: "NOT_FOUND" }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
}

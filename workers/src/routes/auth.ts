import { Env, FanUser } from "../types";

/**
 * GET /api/auth/me
 * Returns the current authenticated user's information.
 * Requires: Authorization: Bearer {token}
 */
export async function handleMe(
  _request: Request,
  _env: Env,
  user: FanUser
): Promise<Response> {
  // TODO: Implement /me endpoint
  // user is already validated by middleware; just return user info
  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * POST /api/auth/logout
 * Revokes the current session token.
 * Requires: Authorization: Bearer {token}
 */
export async function handleLogout(
  request: Request,
  env: Env,
  _user: FanUser
): Promise<Response> {
  // TODO: Implement logout
  // 1. Extract Bearer token from Authorization header
  // 2. Delete session from KV: key = `session:{token}`
  // 3. Return 200 with success
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await env.KV.delete(`session:${token}`);
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

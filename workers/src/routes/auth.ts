import { Env, FanUser } from "../types";
import { deleteSession } from "../services/session";

/**
 * GET /api/auth/me
 * Returns the current authenticated user's information.
 * Requires: Authorization: Bearer {token}
 * Authentication is validated by the router before this handler is called.
 */
export async function handleMe(
  _request: Request,
  _env: Env,
  user: FanUser
): Promise<Response> {
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
 * Revokes the current session token by deleting it from KV.
 * Requires: Authorization: Bearer {token}
 * Authentication is validated by the router before this handler is called.
 */
export async function handleLogout(
  request: Request,
  env: Env,
  _user: FanUser
): Promise<Response> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await deleteSession(token, env);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

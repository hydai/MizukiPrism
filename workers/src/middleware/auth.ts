import { Env, SessionData, FanUser } from "../types";

/**
 * Session validation middleware.
 * Validates the Bearer token from the Authorization header,
 * implements sliding expiry (refreshes session if expiry is within 1 day).
 *
 * @returns FanUser if token is valid, null otherwise
 */
export async function validateSession(
  request: Request,
  env: Env
): Promise<FanUser | null> {
  // TODO: Implement session validation
  // 1. Extract Bearer token from Authorization header
  // 2. Look up session in KV: key = `session:{token}`
  // 3. Check if session exists and is not expired
  // 4. Apply sliding expiry: if expiresAt is within 1 day, extend by 30 days
  // 5. Return FanUser { id, email } if valid, null if invalid/expired
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  if (!token) {
    return null;
  }

  const sessionRaw = await env.KV.get(`session:${token}`);
  if (!sessionRaw) {
    return null;
  }

  let session: SessionData;
  try {
    session = JSON.parse(sessionRaw) as SessionData;
  } catch {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  if (now >= expiresAt) {
    return null;
  }

  // Sliding expiry: if more than 1 day has elapsed since last refresh,
  // update the session expiry to 30 days from now
  const oneDayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();

  if (timeUntilExpiry < thirtyDaysMs - oneDayMs) {
    const newExpiresAt = new Date(now.getTime() + thirtyDaysMs);
    const updatedSession: SessionData = {
      ...session,
      expiresAt: newExpiresAt.toISOString(),
    };
    await env.KV.put(
      `session:${token}`,
      JSON.stringify(updatedSession),
      { expirationTtl: 30 * 24 * 60 * 60 }
    );
  }

  return { id: session.userId, email: session.email };
}

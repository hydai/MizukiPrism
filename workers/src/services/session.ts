import { Env, SessionData } from "../types";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Generate a cryptographically secure session token.
 * Uses 256 bits of randomness, encoded as Base64.
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Create a new session for the given user and store it in KV.
 *
 * @returns The session token string
 */
export async function createSession(
  userId: string,
  email: string,
  env: Env
): Promise<string> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

  const sessionData: SessionData = {
    userId,
    email,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await env.KV.put(`session:${token}`, JSON.stringify(sessionData), {
    expirationTtl: SESSION_TTL_SECONDS,
  });

  return token;
}

/**
 * Verify a session token and apply sliding expiry.
 *
 * Reads KV key `session:{token}`. If valid and not expired, applies sliding
 * expiry: if the session expires in less than 29 days (meaning more than 1 day
 * has passed since creation/last extension), renews to 30 days from now.
 * Skips the KV write if 29+ days remain (throttle optimization: < 1 day since
 * last extension).
 *
 * @returns { userId, email } if valid, null if missing or expired
 */
export async function verifySession(
  env: Env,
  token: string
): Promise<{ userId: string; email: string } | null> {
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

  const now = Date.now();
  const expiresAtMs = Date.parse(session.expiresAt);

  // Expired: delete KV entry and return null
  if (now >= expiresAtMs) {
    await env.KV.delete(`session:${token}`);
    return null;
  }

  // Sliding expiry: if less than 29 days remain, extend to 30 days from now.
  // Throttle: skip the write if 29+ days remain (< 1 day since last extension).
  const daysUntilExpiry = (expiresAtMs - now) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiry < 29) {
    const newExpiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000);
    const updatedSession: SessionData = {
      ...session,
      expiresAt: newExpiresAt.toISOString(),
    };
    await env.KV.put(`session:${token}`, JSON.stringify(updatedSession), {
      expirationTtl: 2592000, // 30 days in seconds
    });
  }

  return { userId: session.userId, email: session.email };
}

/**
 * Delete a session (logout / revoke).
 */
export async function deleteSession(token: string, env: Env): Promise<void> {
  await env.KV.delete(`session:${token}`);
}

import { Env, SessionData } from "../types";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Generate a cryptographically secure session token.
 * Uses 256 bits of randomness, encoded as Base64.
 */
export function generateSessionToken(): string {
  // TODO: Implement session token generation
  // Use crypto.getRandomValues to generate 32 bytes (256 bits)
  // Encode as Base64 string
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
  // TODO: Implement session creation
  // 1. Generate token
  // 2. Build SessionData with 30-day expiry
  // 3. Store in KV: key = `session:{token}`, TTL = 30 days
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
 * Retrieve session data for a given token.
 * Returns null if token is not found or has expired.
 */
export async function getSession(
  token: string,
  env: Env
): Promise<SessionData | null> {
  // TODO: Implement session retrieval
  const raw = await env.KV.get(`session:${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

/**
 * Delete a session (logout / revoke).
 */
export async function deleteSession(token: string, env: Env): Promise<void> {
  await env.KV.delete(`session:${token}`);
}

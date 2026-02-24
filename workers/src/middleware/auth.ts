import { Env, FanUser } from "../types";
import { verifySession } from "../services/session";

export interface AuthResult {
  authenticated: true;
  user: FanUser;
  token: string;
}

export interface UnauthResult {
  authenticated: false;
}

export type AuthContext = AuthResult | UnauthResult;

/**
 * Extract and validate the Bearer token from the Authorization header.
 * Applies sliding expiry via the session service.
 *
 * @returns AuthContext with authenticated=true and user+token if valid,
 *          or authenticated=false if missing, invalid, or expired.
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<AuthContext> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false };
  }

  const token = authHeader.slice(7);
  if (!token) {
    return { authenticated: false };
  }

  const session = await verifySession(env, token);
  if (!session) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: { id: session.userId, email: session.email },
    token,
  };
}

/**
 * Session validation middleware.
 * Validates the Bearer token from the Authorization header and applies
 * sliding expiry. Used by the router to gate authenticated endpoints.
 *
 * @returns FanUser if token is valid, null otherwise
 */
export async function validateSession(
  request: Request,
  env: Env
): Promise<FanUser | null> {
  const auth = await authenticateRequest(request, env);
  if (!auth.authenticated) {
    return null;
  }
  return auth.user;
}

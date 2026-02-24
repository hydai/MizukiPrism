import { Env } from "./types";
import { validateSession } from "./middleware/auth";
import { handleOtpRequest, handleOtpVerify } from "./routes/otp";
import { handleMe, handleLogout } from "./routes/auth";
import {
  handleGetPlaylists,
  handleSyncPlaylists,
  handleUpsertPlaylist,
  handleDeletePlaylist,
} from "./routes/playlists";

// Default allowed origins if ALLOWED_ORIGINS env var is not set
const DEFAULT_ALLOWED_ORIGINS = [
  "https://prism.mizuki.tw",
  "http://localhost:3000",
];

/**
 * Build CORS headers for a given request origin.
 * Only returns Access-Control-Allow-Origin for allowed origins.
 */
function buildCorsHeaders(request: Request, env: Env): HeadersInit {
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : DEFAULT_ALLOWED_ORIGINS;

  const origin = request.headers.get("Origin") ?? "";
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle OPTIONS preflight requests.
 * Returns 204 No Content with appropriate CORS headers.
 */
function handleOptions(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request, env),
  });
}

/**
 * Wrap a Response with CORS headers.
 */
function withCors(response: Response, request: Request, env: Env): Response {
  const corsHeaders = buildCorsHeaders(request, env);
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Return a JSON error response.
 */
function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Main request handler with path-based routing.
 */
async function fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const { pathname, method } = { pathname: url.pathname, method: request.method };

  // Handle OPTIONS preflight for all routes
  if (method === "OPTIONS") {
    return handleOptions(request, env);
  }

  let response: Response;

  // Route dispatch
  if (method === "POST" && pathname === "/api/auth/otp/request") {
    response = await handleOtpRequest(request, env);
  } else if (method === "POST" && pathname === "/api/auth/otp/verify") {
    response = await handleOtpVerify(request, env);
  } else if (method === "GET" && pathname === "/api/auth/me") {
    const user = await validateSession(request, env);
    if (!user) {
      response = jsonError("UNAUTHORIZED", 401);
    } else {
      response = await handleMe(request, env, user);
    }
  } else if (method === "POST" && pathname === "/api/auth/logout") {
    const user = await validateSession(request, env);
    if (!user) {
      response = jsonError("UNAUTHORIZED", 401);
    } else {
      response = await handleLogout(request, env, user);
    }
  } else if (method === "GET" && pathname === "/api/playlists") {
    const user = await validateSession(request, env);
    if (!user) {
      response = jsonError("UNAUTHORIZED", 401);
    } else {
      response = await handleGetPlaylists(request, env, user);
    }
  } else if (method === "POST" && pathname === "/api/playlists/sync") {
    const user = await validateSession(request, env);
    if (!user) {
      response = jsonError("UNAUTHORIZED", 401);
    } else {
      response = await handleSyncPlaylists(request, env, user);
    }
  } else if (method === "PUT" && pathname.startsWith("/api/playlists/")) {
    const playlistId = pathname.slice("/api/playlists/".length);
    if (!playlistId) {
      response = jsonError("NOT_FOUND", 404);
    } else {
      const user = await validateSession(request, env);
      if (!user) {
        response = jsonError("UNAUTHORIZED", 401);
      } else {
        response = await handleUpsertPlaylist(request, env, user, playlistId);
      }
    }
  } else if (method === "DELETE" && pathname.startsWith("/api/playlists/")) {
    const playlistId = pathname.slice("/api/playlists/".length);
    if (!playlistId) {
      response = jsonError("NOT_FOUND", 404);
    } else {
      const user = await validateSession(request, env);
      if (!user) {
        response = jsonError("UNAUTHORIZED", 401);
      } else {
        response = await handleDeletePlaylist(request, env, user, playlistId);
      }
    }
  } else {
    response = jsonError("NOT_FOUND", 404);
  }

  return withCors(response, request, env);
}

export default { fetch };

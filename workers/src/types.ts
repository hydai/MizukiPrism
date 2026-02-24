// Environment bindings for Cloudflare Workers
export interface Env {
  KV: KVNamespace;
  DB: D1Database;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  ALLOWED_ORIGINS: string;
}

// Data models
export interface FanUser {
  id: string;
  email: string;
}

export interface OtpData {
  code: string;
  attempts: number;
}

export interface SessionData {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

// Playlist models
export interface PlaylistVersion {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
}

export interface CloudPlaylist {
  id: string;
  name: string;
  versions: PlaylistVersion[];
  createdAt: number;
  updatedAt: number;
}

// API request/response types from spec §4.1

// POST /api/auth/otp/request
export interface OtpRequestBody {
  email: string; // Valid email format
}

export interface OtpRequestResponse {
  success: true;
  message: string; // "驗證碼已發送" (regardless of whether email exists)
}

export interface OtpRateLimitResponse {
  success: false;
  error: "RATE_LIMITED";
  retryAfterSeconds: number;
}

// POST /api/auth/otp/verify
export interface OtpVerifyBody {
  email: string;
  code: string; // 6-digit numeric string
}

export interface OtpVerifyResponse {
  success: true;
  token: string; // Session Token (Base64-encoded 256-bit random value)
  user: {
    id: string;
    email: string;
  };
  isNewUser: boolean; // Frontend can use this to show a welcome message
}

export interface OtpVerifyErrorResponse {
  success: false;
  error: "INVALID_CODE" | "EXPIRED" | "MAX_ATTEMPTS";
  remainingAttempts?: number; // Only provided for INVALID_CODE
}

// GET /api/auth/me
// Headers: Authorization: Bearer {token}

export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
  };
}

export interface AuthUnauthorizedResponse {
  error: "UNAUTHORIZED";
}

// POST /api/auth/logout
// Headers: Authorization: Bearer {token}

export interface LogoutResponse {
  success: true;
}

// GET /api/playlists
// Headers: Authorization: Bearer {token}

export interface GetPlaylistsResponse {
  playlists: Array<{
    id: string;
    name: string;
    versions: PlaylistVersion[];
    createdAt: number; // Unix timestamp (ms)
    updatedAt: number; // Unix timestamp (ms)
  }>;
}

// PUT /api/playlists/:id
// Headers: Authorization: Bearer {token}

export interface UpsertPlaylistBody {
  id: string;
  name: string;
  versions: PlaylistVersion[];
  createdAt: number;
  updatedAt: number;
}

export interface UpsertPlaylistResponse {
  success: true;
  conflict?: boolean; // true if a conflict occurred (cloud was newer)
  keptVersion?: "cloud" | "client"; // Which version was kept on conflict
}

// DELETE /api/playlists/:id
// Headers: Authorization: Bearer {token}

export interface DeletePlaylistResponse {
  success: true;
}

export interface PlaylistNotFoundResponse {
  success: false;
  error: "NOT_FOUND";
}

// POST /api/playlists/sync
// Headers: Authorization: Bearer {token}

export interface SyncPlaylistsBody {
  playlists: Array<{
    id: string;
    name: string;
    versions: PlaylistVersion[];
    createdAt: number;
    updatedAt: number;
  }>;
}

export interface SyncPlaylistsResponse {
  success: true;
  syncedCount: number;
}

// Generic error response
export interface ErrorResponse {
  error: string;
}

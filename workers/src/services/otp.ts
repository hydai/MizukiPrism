import { Env, OtpData } from "../types";

const OTP_TTL_SECONDS = 600; // 10 minutes
const RATE_LIMIT_TTL_SECONDS = 900; // 15 minutes
const RATE_LIMIT_MAX = 3;
const MAX_ATTEMPTS = 3;

/**
 * Generate a cryptographically random 6-digit OTP.
 * Each digit is independently generated using crypto.getRandomValues,
 * producing a zero-padded string (e.g., "003847").
 */
export function generateOtp(): string {
  const digits = new Uint8Array(6);
  for (let i = 0; i < 6; i++) {
    const buf = new Uint8Array(1);
    // Rejection sampling: discard values >= 250 to avoid modulo bias
    do {
      crypto.getRandomValues(buf);
    } while (buf[0] >= 250);
    digits[i] = buf[0] % 10;
  }
  return Array.from(digits).join("");
}

/**
 * Check if the rate limit for OTP requests has been reached.
 * Limit: 3 requests per email per 15 minutes.
 *
 * @returns { limited: false } if allowed, or { limited: true, retryAfterSeconds } if rate limited
 */
export async function checkRateLimit(
  env: Env,
  email: string
): Promise<{ limited: false } | { limited: true; retryAfterSeconds: number }> {
  const key = `otp_rate:${email}`;
  const countRaw = await env.KV.get(key);
  if (!countRaw) return { limited: false };
  const count = parseInt(countRaw, 10);
  if (count >= RATE_LIMIT_MAX) {
    // Use conservative TTL since exact remaining TTL is not available from KV
    return { limited: true, retryAfterSeconds: RATE_LIMIT_TTL_SECONDS };
  }
  return { limited: false };
}

/**
 * Store a new OTP for the given email address and increment the rate limit counter.
 * OTP TTL: 600 seconds (10 minutes).
 * Rate limit TTL: 900 seconds (15 minutes).
 */
export async function storeOtp(
  env: Env,
  email: string,
  code: string
): Promise<void> {
  const otpData: OtpData = { code, attempts: 0 };
  await env.KV.put(`otp:${email}`, JSON.stringify(otpData), {
    expirationTtl: OTP_TTL_SECONDS,
  });

  // Increment rate limit counter
  const rateKey = `otp_rate:${email}`;
  const countRaw = await env.KV.get(rateKey);
  const count = countRaw ? parseInt(countRaw, 10) + 1 : 1;
  await env.KV.put(rateKey, count.toString(), {
    expirationTtl: RATE_LIMIT_TTL_SECONDS,
  });
}

/**
 * Check if the rate limit for OTP requests has been reached.
 * Limit: 3 requests per email per 15 minutes.
 *
 * @returns true if rate limited, false if allowed
 * @deprecated Use checkRateLimit instead
 */
export async function isRateLimited(email: string, env: Env): Promise<boolean> {
  const key = `otp_rate:${email}`;
  const countRaw = await env.KV.get(key);
  if (!countRaw) return false;
  const count = parseInt(countRaw, 10);
  return count >= RATE_LIMIT_MAX;
}

/**
 * Increment the rate limit counter for an email address.
 * Initializes to 1 if not present, increments if present.
 * @deprecated Use storeOtp (which now also increments rate limit)
 */
export async function incrementRateLimit(
  email: string,
  env: Env
): Promise<void> {
  const key = `otp_rate:${email}`;
  const countRaw = await env.KV.get(key);
  const count = countRaw ? parseInt(countRaw, 10) + 1 : 1;
  await env.KV.put(key, count.toString(), {
    expirationTtl: RATE_LIMIT_TTL_SECONDS,
  });
}

/**
 * Retrieve the OTP data for the given email address.
 *
 * @returns OtpData if exists and not expired, null otherwise
 */
export async function getOtp(
  email: string,
  env: Env
): Promise<OtpData | null> {
  // TODO: Implement OTP retrieval
  const raw = await env.KV.get(`otp:${email}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OtpData;
  } catch {
    return null;
  }
}

/**
 * Validate the provided OTP code against stored OTP data.
 * Increments attempts on failure.
 * Deletes OTP on success or when max attempts is reached.
 *
 * @returns Object indicating validity and remaining attempts
 */
export async function validateOtp(
  email: string,
  code: string,
  env: Env
): Promise<
  | { valid: true }
  | { valid: false; error: "EXPIRED" | "MAX_ATTEMPTS" | "INVALID_CODE"; remainingAttempts?: number }
> {
  // TODO: Implement full OTP validation
  const otpData = await getOtp(email, env);

  if (!otpData) {
    return { valid: false, error: "EXPIRED" };
  }

  if (otpData.attempts >= MAX_ATTEMPTS) {
    await env.KV.delete(`otp:${email}`);
    return { valid: false, error: "MAX_ATTEMPTS" };
  }

  if (otpData.code !== code) {
    const newAttempts = otpData.attempts + 1;
    const remaining = MAX_ATTEMPTS - newAttempts;

    if (newAttempts >= MAX_ATTEMPTS) {
      await env.KV.delete(`otp:${email}`);
      return { valid: false, error: "MAX_ATTEMPTS" };
    }

    const updated: OtpData = { code: otpData.code, attempts: newAttempts };
    await env.KV.put(`otp:${email}`, JSON.stringify(updated), {
      expirationTtl: OTP_TTL_SECONDS,
    });

    return { valid: false, error: "INVALID_CODE", remainingAttempts: remaining };
  }

  // Valid code - delete OTP
  await env.KV.delete(`otp:${email}`);
  return { valid: true };
}

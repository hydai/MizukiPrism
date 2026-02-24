import { Env } from "../types";

/**
 * POST /api/auth/otp/request
 * Request a 6-digit OTP for the given email address.
 * Implements rate limiting: max 3 requests per email per 15 minutes.
 * Always returns 200 to prevent email enumeration.
 */
export async function handleOtpRequest(
  _request: Request,
  _env: Env
): Promise<Response> {
  // TODO: Implement OTP request
  // 1. Parse and validate request body (email field)
  // 2. Check rate limit in KV: key = `otp_rate:{email}` (max 3 per 15 min)
  // 3. Generate 6-digit OTP (crypto.getRandomValues, zero-padded)
  // 4. Store OTP in KV: key = `otp:{email}`, value = { code, attempts: 0 }, TTL = 600s
  // 5. Increment rate limit counter in KV, TTL = 900s
  // 6. Send OTP email via Resend API (email.ts service)
  // 7. Always return 200 with success message
  return new Response(
    JSON.stringify({
      success: true,
      message: "驗證碼已發送",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * POST /api/auth/otp/verify
 * Verify the OTP code for the given email address.
 * On success: creates user if not exists, creates session, returns token.
 * On failure: increments attempt counter, invalidates OTP after 3 failures.
 */
export async function handleOtpVerify(
  _request: Request,
  _env: Env
): Promise<Response> {
  // TODO: Implement OTP verification
  // 1. Parse and validate request body (email, code fields)
  // 2. Retrieve OTP data from KV: key = `otp:{email}`
  // 3. Check if OTP exists (return EXPIRED if not)
  // 4. Check attempt count (return MAX_ATTEMPTS if >= 3)
  // 5. Validate code (return INVALID_CODE with remaining attempts if wrong)
  // 6. Delete OTP from KV on success
  // 7. Upsert user in D1 (SELECT then INSERT if not exists)
  // 8. Generate session token (256-bit random, Base64 encoded)
  // 9. Store session in KV: key = `session:{token}`, TTL = 2592000s (30 days)
  // 10. Return token, user info, isNewUser flag
  return new Response(
    JSON.stringify({
      success: false,
      error: "EXPIRED",
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}

import { Env } from "../types";
import { generateOtp, checkRateLimit, storeOtp, validateOtp } from "../services/otp";
import { sendOtpEmail } from "../services/email";
import { createSession } from "../services/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/otp/request
 * Request a 6-digit OTP for the given email address.
 * Implements rate limiting: max 3 requests per email per 15 minutes.
 * Anti-enumeration: response does not reveal whether the email is registered.
 */
export async function handleOtpRequest(
  request: Request,
  env: Env
): Promise<Response> {
  // 1. Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_EMAIL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const email =
    body !== null && typeof body === "object" && "email" in body
      ? (body as Record<string, unknown>).email
      : undefined;

  // 2. Validate email format
  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_EMAIL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Check rate limit (1 KV read)
  const rateLimit = await checkRateLimit(env, email);
  if (rateLimit.limited) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "RATE_LIMITED",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Generate OTP code
  const code = generateOtp();

  // 5. Store OTP in KV and increment rate limit counter (2 KV writes + 1 KV read = 3 subrequests)
  await storeOtp(env, email, code);

  // 6. Send OTP email via Resend API (1 subrequest)
  // Total subrequests: 1 (rate read) + 1 (OTP write) + 1 (rate read in storeOtp) + 1 (rate write) + 1 (Resend) = 5
  const emailSent = await sendOtpEmail(email, code, env);
  if (!emailSent) {
    return new Response(
      JSON.stringify({ success: false, error: "INTERNAL_ERROR" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 7. Return success (anti-enumeration: same response regardless of registration status)
  return new Response(
    JSON.stringify({ success: true, message: "驗證碼已發送" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Look up a user by email in D1, creating them if they don't exist.
 *
 * @returns Object with user data and whether a new user was created
 */
async function findOrCreateUser(
  env: Env,
  email: string
): Promise<{ user: { id: string; email: string }; isNewUser: boolean }> {
  // Try to find existing user
  const existing = await env.DB.prepare(
    "SELECT id, email FROM users WHERE email = ?"
  )
    .bind(email)
    .first<{ id: string; email: string }>();

  if (existing) {
    return { user: { id: existing.id, email: existing.email }, isNewUser: false };
  }

  // Create new user
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, email, now, now)
    .run();

  return { user: { id, email }, isNewUser: true };
}

/**
 * POST /api/auth/otp/verify
 * Verify the OTP code for the given email address.
 * On success: creates user if not exists, creates session, returns token.
 * On failure: increments attempt counter, invalidates OTP after 3 failures.
 */
export async function handleOtpVerify(
  request: Request,
  env: Env
): Promise<Response> {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, code } = body as { email?: unknown; code?: unknown };

  // 2. Validate email and code
  if (
    typeof email !== "string" ||
    !email ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Verify OTP (read OTP + delete on success/max attempts = up to 2 subrequests)
  const result = await validateOtp(email, code, env);

  if (!result.valid) {
    if (result.error === "INVALID_CODE") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "INVALID_CODE",
          remainingAttempts: result.remainingAttempts,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    // EXPIRED or MAX_ATTEMPTS
    return new Response(
      JSON.stringify({ success: false, error: result.error }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Find or create user in D1 (1 SELECT + potentially 1 INSERT = up to 2 subrequests)
  const { user, isNewUser } = await findOrCreateUser(env, email);

  // 5. Create session in KV (1 KV write = 1 subrequest)
  // Total subrequests: read OTP (1) + delete OTP (1) + D1 SELECT/INSERT (1-2) + KV session write (1) = max 5
  // Note: D1 SELECT and INSERT are separate operations; typical path is SELECT only (existing user)
  const token = await createSession(user.id, email, env);

  // 6. Return success with token and user info
  return new Response(
    JSON.stringify({
      success: true,
      token,
      user: { id: user.id, email: user.email },
      isNewUser,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

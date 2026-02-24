import { Env } from "../types";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Send an OTP verification email via Resend API.
 * Subject is always "MizukiPrism 驗證碼" (no distinction between registration and login).
 *
 * @returns true if sent successfully, false otherwise
 */
export async function sendOtpEmail(
  email: string,
  code: string,
  env: Env
): Promise<boolean> {
  // TODO: Implement Resend API call
  // 1. Build email payload with OTP code, expiry notice, disclaimer
  // 2. POST to Resend API with Authorization: Bearer {RESEND_API_KEY}
  // 3. Return true on 2xx response, false otherwise
  const html = buildOtpEmailHtml(code);
  const text = buildOtpEmailText(code);

  const payload = {
    from: env.RESEND_FROM_EMAIL,
    to: [email],
    subject: "MizukiPrism 驗證碼",
    html,
    text,
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Build HTML content for OTP email.
 */
function buildOtpEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #f0f0f0;">
  <h1 style="color: #ff6eb4; font-size: 24px; margin-bottom: 8px;">MizukiPrism</h1>
  <p style="color: #aaa; font-size: 14px; margin-top: 0;">驗證碼</p>
  <p style="font-size: 16px; color: #f0f0f0;">您的 MizukiPrism 一次性驗證碼：</p>
  <div style="text-align: center; margin: 32px 0;">
    <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #ff6eb4; font-family: monospace;">${code}</span>
  </div>
  <p style="font-size: 14px; color: #aaa;">此驗證碼有效期限為 <strong>10 分鐘</strong>。</p>
  <p style="font-size: 14px; color: #888;">若非您本人的操作，請忽略此郵件。</p>
</body>
</html>
  `.trim();
}

/**
 * Build plain text content for OTP email.
 */
function buildOtpEmailText(code: string): string {
  return [
    "MizukiPrism 驗證碼",
    "",
    `您的一次性驗證碼：${code}`,
    "",
    "此驗證碼有效期限為 10 分鐘。",
    "若非您本人的操作，請忽略此郵件。",
  ].join("\n");
}

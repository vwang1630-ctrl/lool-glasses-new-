// Email-based OTP shared by customer, admin, tracker, and affiliate flows.
// One email has one current 6-digit code, valid 10 minutes, max 5 attempts.

import { env } from "cloudflare:workers";
import { sha256Hex } from "@/server/ids";
import { sendEmail } from "@/server/email";

export type OtpPurpose =
  | "lookup_order"
  | "lookup_rx"
  | "admin_login"
  | "tracker_login"
  | "affiliate_login";

const TTL_SECONDS = 10 * 60;
const TTL_MS = TTL_SECONDS * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

function generateCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return (bytes[0] % 1_000_000).toString().padStart(6, "0");
}

function getOtpKV(): KVNamespace {
  const kv = (env as unknown as { OTP_KV?: KVNamespace }).OTP_KV;
  if (!kv) {
    throw new Error("KV binding 'OTP_KV' not available. Check wrangler.jsonc.");
  }
  return kv;
}

async function readOtp(email: string): Promise<OtpRecord | null> {
  return getOtpKV().get<OtpRecord>(`otp:${email}`, "json");
}

async function writeOtp(
  email: string,
  record: OtpRecord,
  expirationTtl = TTL_SECONDS,
): Promise<void> {
  await getOtpKV().put(`otp:${email}`, JSON.stringify(record), {
    expirationTtl,
  });
}

async function deleteOtp(email: string): Promise<void> {
  await getOtpKV().delete(`otp:${email}`);
}

/** Issue a fresh single OTP for this email and email it. New sends replace older codes. */
export async function requestOtp(
  email: string,
  _purpose: OtpPurpose,
): Promise<void> {
  const code = await writeOtpRecord(email);
  try {
    await sendOtpEmail(email, code);
  } catch {
    // email failure is non-fatal; KV record exists for verify
  }
}

/** Write OTP to KV and return the plaintext code (for caller to email). Throws on KV failure. */
export async function writeOtpRecord(email: string): Promise<string> {
  const now = Date.now();
  const code = generateCode();
  const codeHash = await sha256Hex(`${email}:${code}`);
  await writeOtp(email, { codeHash, expiresAt: now + TTL_MS, attempts: 0 });
  return code;
}

/** Send the OTP email. May throw — caller decides whether to tolerate. */
export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111;">lool 验证码 / Verification code</h2>
      <p style="color: #555;">在 10 分钟内输入下面的验证码。<br />
      Enter this code within 10 minutes.</p>
      <p style="font-size: 32px; letter-spacing: 8px; font-weight: 600; padding: 16px 24px; background: #f5f5f4; border-radius: 12px; text-align: center;">${code}</p>
      <p style="color: #999; font-size: 12px;">如果你没有请求该验证码，请忽略此邮件。 / If you didn't request this, you can safely ignore the email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Your lool verification code: ${code}`,
    html,
    text: `Your lool verification code is ${code}. It expires in 10 minutes.`,
  });
}

interface VerifyResult {
  ok: boolean;
  reason?: "expired" | "wrong" | "too_many_attempts" | "no_code";
}

/** Verify the current email OTP. On success or expiry, deletes the record. */
export async function verifyOtp(
  email: string,
  _purpose: OtpPurpose,
  code: string,
): Promise<VerifyResult> {
  const now = Date.now();
  const codeHash = await sha256Hex(`${email}:${code}`);
  const record = await readOtp(email);

  if (!record) return { ok: false, reason: "no_code" };
  if (record.expiresAt < now) {
    await deleteOtp(email);
    return { ok: false, reason: "expired" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await deleteOtp(email);
    return { ok: false, reason: "too_many_attempts" };
  }
  if (record.codeHash === codeHash) {
    await deleteOtp(email);
    return { ok: true };
  }

  const remainingSeconds = Math.max(
    1,
    Math.ceil((record.expiresAt - now) / 1000),
  );
  await writeOtp(
    email,
    { ...record, attempts: record.attempts + 1 },
    remainingSeconds,
  );
  return { ok: false, reason: "wrong" };
}

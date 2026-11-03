// Customer "account" session: an HMAC-signed cookie that proves the caller
// owns an email address (verified via OTP at /api/otp/verify). Identity is
// just the email — there is no users table, no password.
//
// Mirrors the admin pattern in src/server/admin.ts but with:
//   - a separate cookie name (lool_account_session) so admin/customer
//     sessions can't be confused on shared browsers
//   - rolling 30-day TTL — callers should attach `buildRefreshedAccountCookie`
//     to every authenticated response so the idle clock resets on use. 30
//     days of true inactivity will let the cookie expire. The refresh cost
//     is one HMAC sign (microseconds) + one Set-Cookie header — no DB hit,
//     no extra round trip.
//   - SameSite=Lax (vs admin's Strict) so emailed account links work
//
// Used by the prescriptions write endpoints to confirm the caller isn't
// scribbling on someone else's email.

import { env } from "cloudflare:workers";

export const ACCOUNT_SESSION_COOKIE_NAME = "lool_account_session";
const ACCOUNT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ACCOUNT_SESSION_TTL_S = Math.floor(ACCOUNT_SESSION_TTL_MS / 1000);

export interface AccountSession {
  email: string;
  expMs: number;
}

async function getSecret(): Promise<CryptoKey> {
  const secret = (env as unknown as { SESSION_SECRET?: string }).SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmacHex(message: string): Promise<string> {
  const key = await getSecret();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signAccountSession(email: string): Promise<string> {
  const expMs = Date.now() + ACCOUNT_SESSION_TTL_MS;
  const body = `${email}|${expMs}`;
  const sig = await hmacHex(body);
  return `${body}.${sig}`;
}

export async function verifyAccountSession(
  cookie: string | undefined | null,
): Promise<AccountSession | null> {
  if (!cookie) return null;
  const idx = cookie.lastIndexOf(".");
  if (idx < 0) return null;
  const body = cookie.slice(0, idx);
  const sig = cookie.slice(idx + 1);
  const expectedSig = await hmacHex(body);
  if (sig.length !== expectedSig.length) return null;
  // Constant-time compare to thwart timing attacks against the HMAC tag.
  let diff = 0;
  for (let i = 0; i < sig.length; i++)
    diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  if (diff !== 0) return null;

  const parts = body.split("|");
  if (parts.length !== 2) return null;
  const [email, expStr] = parts;
  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return null;
  return { email, expMs };
}

export function buildAccountSessionCookie(value: string): string {
  return [
    `${ACCOUNT_SESSION_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${ACCOUNT_SESSION_TTL_S}`,
  ].join("; ");
}

export function buildClearAccountCookie(): string {
  return [
    `${ACCOUNT_SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function getAccountSession(
  request: Request,
): Promise<AccountSession | null> {
  const raw = parseCookie(
    request.headers.get("Cookie"),
    ACCOUNT_SESSION_COOKIE_NAME,
  );
  return verifyAccountSession(raw);
}

// Convenience: mint a fresh Set-Cookie string with the TTL re-extended.
// Endpoints that consume a valid session should attach this to their response
// so each authenticated request rolls the cookie forward.
export async function buildRefreshedAccountCookie(
  email: string,
): Promise<string> {
  return buildAccountSessionCookie(await signAccountSession(email));
}

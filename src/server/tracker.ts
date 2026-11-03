// Tracker (订单跟踪 / fulfillment staff) auth — HMAC-signed session cookie +
// requireTracker middleware against the tracker_users table. Kept fully
// separate from admin so a tracker credential cannot satisfy requireAdmin and
// vice versa.
//
// Login itself is OTP-only (see /api/tracker/otp/{request,verify}); this file
// only handles the session cookie shape + middleware. Passwords were
// removed in migration 0062. The DB / API / cookie were unified under the
// "tracker" name in migration 0069.

import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";

const SESSION_TTL_DAYS = 14;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 3600 * 1000;
export const TRACKER_SESSION_COOKIE_NAME = "lool_tracker_session";

// -------- HMAC-signed session cookie --------

interface TrackerSessionPayload {
  trackerId: string;
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

export async function signTrackerSession(p: {
  trackerId: string;
  email: string;
}): Promise<string> {
  const expMs = Date.now() + SESSION_TTL_MS;
  const body = `${p.trackerId}|${p.email}|${expMs}`;
  const sig = await hmacHex(body);
  return `${body}.${sig}`;
}

export async function verifyTrackerSession(
  cookie: string | undefined | null,
): Promise<TrackerSessionPayload | null> {
  if (!cookie) return null;
  const idx = cookie.lastIndexOf(".");
  if (idx < 0) return null;
  const body = cookie.slice(0, idx);
  const sig = cookie.slice(idx + 1);
  const expectedSig = await hmacHex(body);
  if (sig.length !== expectedSig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++)
    diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  if (diff !== 0) return null;

  const parts = body.split("|");
  if (parts.length !== 3) return null;
  const [trackerId, email, expStr] = parts;
  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return null;
  return { trackerId, email, expMs };
}

// -------- Cookie helpers --------

export function buildTrackerSessionCookie(value: string): string {
  return [
    `${TRACKER_SESSION_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_DAYS * 24 * 3600}`,
  ].join("; ");
}

export function buildClearTrackerCookie(): string {
  return [
    `${TRACKER_SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
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

// -------- requireTracker middleware --------

export interface Tracker {
  id: string;
  email: string;
  name: string;
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export async function requireTracker(request: Request): Promise<Tracker> {
  const raw = parseCookie(
    request.headers.get("Cookie"),
    TRACKER_SESSION_COOKIE_NAME,
  );
  const session = await verifyTrackerSession(raw);
  if (!session) throw unauthorized();

  const db = getDB();
  const row = await db
    .prepare(
      "SELECT id, email, name, active FROM tracker_users WHERE id = ? AND email = ?",
    )
    .bind(session.trackerId, session.email)
    .first<{ id: string; email: string; name: string; active: number }>();
  if (!row || !row.active) throw unauthorized();
  return { id: row.id, email: row.email, name: row.name };
}

export async function getTrackerSession(
  request: Request,
): Promise<Tracker | null> {
  try {
    return await requireTracker(request);
  } catch {
    return null;
  }
}

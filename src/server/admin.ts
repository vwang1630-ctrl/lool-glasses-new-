// Admin auth helpers: HMAC-signed session cookie + Bearer API token + the
// requireAdmin middleware. Password hashing was removed in 0062 — admin
// login is OTP-only now (see /api/admin/otp/*).

import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";

const SESSION_TTL_DAYS = 7;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 3600 * 1000;
export const SESSION_COOKIE_NAME = "lool_admin_session";

// -------- HMAC-signed session cookie --------

interface SessionPayload {
  adminId: string;
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

export async function signSession(payload: {
  adminId: string;
  email: string;
}): Promise<string> {
  const expMs = Date.now() + SESSION_TTL_MS;
  const body = `${payload.adminId}|${payload.email}|${expMs}`;
  const sig = await hmacHex(body);
  return `${body}.${sig}`;
}

export async function verifySession(
  cookie: string | undefined | null,
): Promise<SessionPayload | null> {
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
  const [adminId, email, expStr] = parts;
  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return null;
  return { adminId, email, expMs };
}

// -------- Cookie helpers --------

export function buildSessionCookie(value: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_DAYS * 24 * 3600}`,
  ].join("; ");
}

export function buildClearCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
  ].join("; ");
}

export function parseCookie(
  header: string | null,
  name: string,
): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

// -------- API token (Bearer) helpers --------

// SHA-256 hash used for comparing Bearer tokens against stored token_hash.
// Output is lowercase hex (same format stored in admin_api_tokens.token_hash).
export async function hashApiToken(plaintext: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(plaintext),
  );
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++)
    hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

// Random 32-byte URL-safe base64. Prefix `lool_` makes the token recognizable
// in logs and helps secret scanners catch leaks.
export function newApiTokenPlaintext(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `lool_${b64}`;
}

// -------- requireAdmin middleware --------

export interface AdminUser {
  id: string;
  email: string;
  role: "owner" | "staff";
  tokenScope?: "read" | "write";
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function forbidden(error = "forbidden"): Response {
  return new Response(JSON.stringify({ error }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

function isReadMethod(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

// Accepts either:
//   1. HMAC-signed session cookie (browser admin UI)
//   2. Bearer API token in `Authorization` header (scripts / MCP)
export async function requireAdmin(request: Request): Promise<AdminUser> {
  const db = getDB();

  // 1. Cookie session — browser path.
  const raw = parseCookie(request.headers.get("Cookie"), SESSION_COOKIE_NAME);
  const session = await verifySession(raw);
  if (session) {
    const row = await db
      .prepare(
        "SELECT id, email, role, active FROM admin_users WHERE id = ? AND email = ?",
      )
      .bind(session.adminId, session.email)
      .first<{
        id: string;
        email: string;
        role: "owner" | "staff";
        active: number;
      }>();
    if (row && row.active) {
      return { id: row.id, email: row.email, role: row.role };
    }
  }

  // 2. Bearer API token — scripted / MCP path.
  const auth =
    request.headers.get("Authorization") ||
    request.headers.get("authorization") ||
    "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    const plaintext = auth.slice(7).trim();
    if (plaintext) {
      const tokenHash = await hashApiToken(plaintext);
      const row = await db
        .prepare(
          `SELECT t.id AS tid, t.scope AS scope,
                  u.id AS id, u.email AS email, u.role AS role, u.active AS active
           FROM admin_api_tokens t
           JOIN admin_users u ON u.id = t.admin_user_id
           WHERE t.token_hash = ? AND t.revoked_at IS NULL`,
        )
        .bind(tokenHash)
        .first<{
          tid: string;
          scope?: "read" | "write";
          id: string;
          email: string;
          role: "owner" | "staff";
          active: number;
        }>();
      if (row && row.active) {
        const scope = row.scope === "read" ? "read" : "write";
        if (scope === "read" && !isReadMethod(request.method)) {
          throw forbidden("read_only_token");
        }
        // Fire-and-forget last_used_at bump; do not await (avoid latency on every call).
        db.prepare("UPDATE admin_api_tokens SET last_used_at = ? WHERE id = ?")
          .bind(Date.now(), row.tid)
          .run()
          .catch(() => {});
        return {
          id: row.id,
          email: row.email,
          role: row.role,
          tokenScope: scope,
        };
      }
    }
  }

  throw unauthorized();
}

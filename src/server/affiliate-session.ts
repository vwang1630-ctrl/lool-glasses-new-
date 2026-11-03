// Affiliate portal auth — separate from customer account sessions.
//
// Only an admin-created active row in `affiliates` may log in. The OTP flow
// sets this cookie, and affiliate APIs require it instead of the customer
// `lool_account_session` cookie so affiliates never need to enter the C端
// account area.

import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";

const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 3600 * 1000;
const SESSION_TTL_S = SESSION_TTL_DAYS * 24 * 3600;

export const AFFILIATE_SESSION_COOKIE_NAME = "lool_affiliate_session";

export interface AffiliateSession {
  affiliateId: string;
  email: string;
  expMs: number;
}

export interface AffiliateIdentity {
  id: string;
  email: string;
  role: "l1" | "l2";
  level: number;
  status: string;
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

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function signAffiliateSession(p: {
  affiliateId: string;
  email: string;
}): Promise<string> {
  const expMs = Date.now() + SESSION_TTL_MS;
  const body = `${p.affiliateId}|${p.email}|${expMs}`;
  const sig = await hmacHex(body);
  return `${body}.${sig}`;
}

export async function verifyAffiliateSession(
  cookie: string | undefined | null,
): Promise<AffiliateSession | null> {
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
  const [affiliateId, email, expStr] = parts;
  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return null;
  return { affiliateId, email, expMs };
}

export function buildAffiliateSessionCookie(value: string): string {
  return [
    `${AFFILIATE_SESSION_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_S}`,
  ].join("; ");
}

export function buildClearAffiliateCookie(): string {
  return [
    `${AFFILIATE_SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
  ].join("; ");
}

export async function getAffiliateIdentity(
  request: Request,
): Promise<AffiliateIdentity | null> {
  const raw = parseCookie(
    request.headers.get("Cookie"),
    AFFILIATE_SESSION_COOKIE_NAME,
  );
  const session = await verifyAffiliateSession(raw);
  if (!session) return null;

  const row = await getDB()
    .prepare(
      "SELECT id, email, role, level, status FROM affiliates WHERE id = ? AND email = ?",
    )
    .bind(session.affiliateId, session.email)
    .first<AffiliateIdentity>();
  if (!row || row.status !== "active") return null;
  return row;
}

export async function buildRefreshedAffiliateCookie(
  identity: AffiliateIdentity,
): Promise<string> {
  return buildAffiliateSessionCookie(
    await signAffiliateSession({
      affiliateId: identity.id,
      email: identity.email,
    }),
  );
}

// Best-effort audit log helper.
//
// Full audit records are written to R2 as JSON. D1 keeps only the query index
// and R2 key so list pages stay fast while log storage can grow cheaply.

import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { getAccountSession } from "@/server/account-session";
import { getAffiliateIdentity } from "@/server/affiliate-session";
import { requireTracker } from "@/server/tracker";
import { nanoid } from "@/server/ids";

export type AuditScope = "admin" | "affiliate" | "tracker" | "customer";
export type AuditAction =
  | "POST"
  | "PATCH"
  | "PUT"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PAGE_VIEW"
  | "CART_ADD"
  | "CART_REMOVE"
  | "CART_QTY"
  | "CHECKOUT_STARTED"
  | "ORDER_CREATED"
  | "PAYMENT_STARTED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "TRYON_UPLOAD"
  | "TRYON_REQUEST"
  | "TRYON_SUCCEEDED"
  | "TRYON_FAILED"
  | "PRESCRIPTION_UPLOAD"
  | "ADDRESS_CHANGED"
  | "CONTACT_STARTED"
  | "SECURITY_SIGNAL"
  | "CLIENT_IDENTIFIED";

export interface AuditEntry {
  action: AuditAction;
  resource_type: string;
  resource_id?: string | null;
  before?: unknown;
  after?: unknown;
  meta?: unknown;
}

export interface ActorAuditEntry extends AuditEntry {
  scope: Exclude<AuditScope, "customer">;
  actor_id: string;
  actor_email: string;
}

export interface CustomerAuditEntry extends AuditEntry {
  client_id: string;
  actor_email?: string | null;
}

interface AuditRecord extends AuditEntry {
  id: string;
  scope: AuditScope;
  actor_type: "admin" | "affiliate" | "tracker" | "customer" | "anonymous";
  actor_id: string | null;
  actor_email: string | null;
  client_id: string | null;
  path: string;
  referrer: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: number;
}

const CLIENT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidClientId(
  value: string | null | undefined,
): value is string {
  return !!value && CLIENT_ID_RE.test(value);
}

export async function writeAudit(
  request: Request,
  entry: AuditEntry,
): Promise<void> {
  try {
    let admin: { id: string; email: string };
    try {
      admin = await requireAdmin(request);
    } catch {
      return;
    }
    await writeActorAudit(request, {
      ...entry,
      scope: "admin",
      actor_id: admin.id,
      actor_email: admin.email,
    });
  } catch (err) {
    console.error("[audit] write failed:", err);
  }
}

export async function writeAffiliateAudit(
  request: Request,
  entry: AuditEntry,
): Promise<void> {
  try {
    const affiliate = await getAffiliateIdentity(request);
    if (!affiliate) return;
    await writeActorAudit(request, {
      ...entry,
      scope: "affiliate",
      actor_id: affiliate.id,
      actor_email: affiliate.email,
    });
  } catch (err) {
    if (!(err instanceof Response))
      console.error("[audit] affiliate write failed:", err);
  }
}

export async function writeTrackerAudit(
  request: Request,
  entry: AuditEntry,
): Promise<void> {
  try {
    const tracker = await requireTracker(request);
    await writeActorAudit(request, {
      ...entry,
      scope: "tracker",
      actor_id: tracker.id,
      actor_email: tracker.email,
    });
  } catch (err) {
    if (!(err instanceof Response))
      console.error("[audit] tracker write failed:", err);
  }
}

export async function writeCustomerAudit(
  request: Request,
  entry: CustomerAuditEntry,
): Promise<void> {
  try {
    if (!isValidClientId(entry.client_id)) return;
    const session = await getAccountSession(request);
    const actorEmail =
      normalizeEmail(entry.actor_email) ?? session?.email ?? null;
    await writeRecord(request, {
      ...entry,
      scope: "customer",
      actor_type: actorEmail ? "customer" : "anonymous",
      actor_id: actorEmail,
      actor_email: actorEmail,
      client_id: entry.client_id,
    });
    if (actorEmail) {
      await upsertCustomerIdentityLink(
        entry.client_id,
        actorEmail,
        entry.action === "LOGIN",
      );
    }
  } catch (err) {
    console.error("[audit] customer write failed:", err);
  }
}

export async function writeActorAudit(
  request: Request,
  entry: ActorAuditEntry,
): Promise<void> {
  try {
    await writeRecord(request, {
      ...entry,
      actor_type: entry.scope,
      actor_id: entry.actor_id,
      actor_email: normalizeEmail(entry.actor_email) ?? entry.actor_email,
      client_id: null,
    });
  } catch (err) {
    console.error("[audit] actor write failed:", err);
  }
}

async function writeRecord(
  request: Request,
  entry: AuditEntry & {
    scope: AuditScope;
    actor_type: AuditRecord["actor_type"];
    actor_id: string | null;
    actor_email: string | null;
    client_id: string | null;
  },
): Promise<void> {
  const bucket = (env as unknown as { AUDIT_LOGS_BUCKET?: R2Bucket })
    .AUDIT_LOGS_BUCKET;
  if (!bucket) throw new Error("R2 binding 'AUDIT_LOGS_BUCKET' not available");

  const now = Date.now();
  const id = `al-${nanoid()}`;
  const url = new URL(request.url);
  const record: AuditRecord = {
    id,
    scope: entry.scope,
    actor_type: entry.actor_type,
    actor_id: entry.actor_id,
    actor_email: entry.actor_email,
    client_id: entry.client_id,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id ?? null,
    path: url.pathname + (url.search || ""),
    referrer: headerOrNull(request, "referer"),
    ip_hash: await hashIp(headerOrNull(request, "cf-connecting-ip")),
    user_agent: headerOrNull(request, "user-agent"),
    before: entry.before ?? null,
    after: entry.after ?? null,
    meta: entry.meta ?? null,
    created_at: now,
  };
  const r2Key = auditR2Key(record.scope, id, now);
  await bucket.put(r2Key, JSON.stringify(record), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
    customMetadata: {
      scope: record.scope,
      action: record.action,
      resource_type: record.resource_type,
    },
  });

  const db = getDB();
  await db
    .prepare(
      `INSERT INTO audit_log_index (
         id, scope, actor_type, actor_id, actor_email, client_id, action,
         resource_type, resource_id, path, r2_key, summary_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      record.id,
      record.scope,
      record.actor_type,
      record.actor_id,
      record.actor_email,
      record.client_id,
      record.action,
      record.resource_type,
      record.resource_id ?? null,
      record.path,
      r2Key,
      JSON.stringify(buildSummary(record)),
      record.created_at,
    )
    .run();
}

async function upsertCustomerIdentityLink(
  clientId: string,
  email: string,
  countLogin: boolean,
): Promise<void> {
  const now = Date.now();
  const db = getDB();
  await db
    .prepare(
      `INSERT INTO customer_identity_links (
         client_id, email, first_seen_at, last_seen_at, login_count
       ) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(client_id, email) DO UPDATE SET
         last_seen_at = excluded.last_seen_at,
         login_count = customer_identity_links.login_count + excluded.login_count`,
    )
    .bind(clientId, email, now, now, countLogin ? 1 : 0)
    .run();
}

function auditR2Key(scope: AuditScope, id: string, createdAt: number): string {
  const d = new Date(createdAt);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `audit/${scope}/${year}/${month}/${day}/${id}.json`;
}

function buildSummary(record: AuditRecord): Record<string, unknown> {
  return {
    before: record.before == null ? false : true,
    after: record.after == null ? false : true,
    meta: record.meta == null ? false : true,
  };
}

function headerOrNull(request: Request, name: string): string | null {
  const value = request.headers.get(name);
  return value && value.trim() ? value.trim().slice(0, 512) : null;
}

async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeEmail(value: string | null | undefined): string | null {
  const email = (value ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

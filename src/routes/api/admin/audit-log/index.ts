// GET /api/admin/audit-log — paginated audit index with optional R2 detail.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";

type AuditIndexRow = {
  id: string;
  scope: string;
  actor_type: string;
  actor_id: string | null;
  actor_email: string | null;
  client_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  path: string;
  r2_key: string | null;
  summary_json: string | null;
  created_at: number;
};

const SCOPES = new Set(["admin", "affiliate", "tracker", "customer"]);

export const Route = createFileRoute("/api/admin/audit-log/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const url = new URL(request.url);
        const detailId = url.searchParams.get("id");
        if (detailId) return readDetail(detailId);

        const scope = url.searchParams.get("scope");
        const resourceType = url.searchParams.get("resource_type");
        const resourceId = url.searchParams.get("resource_id");
        const actorId = url.searchParams.get("actor_id");
        const actorEmail = url.searchParams.get("actor_email");
        const clientId = url.searchParams.get("client_id");
        const limit = Math.min(
          200,
          Math.max(
            1,
            parseInt(url.searchParams.get("limit") ?? "50", 10) || 50,
          ),
        );
        const offset = Math.max(
          0,
          parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
        );

        const conds: string[] = [];
        const binds: unknown[] = [];
        if (scope && SCOPES.has(scope)) {
          conds.push("scope = ?");
          binds.push(scope);
        }
        if (resourceType) {
          conds.push("resource_type = ?");
          binds.push(resourceType);
        }
        if (resourceId) {
          conds.push("resource_id = ?");
          binds.push(resourceId);
        }
        if (actorId) {
          conds.push("actor_id = ?");
          binds.push(actorId);
        }
        if (actorEmail) {
          conds.push("actor_email = ?");
          binds.push(actorEmail.toLowerCase());
        }
        if (clientId) {
          conds.push("client_id = ?");
          binds.push(clientId);
        }
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const res = await db
          .prepare(
            `SELECT * FROM audit_log_index ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          )
          .bind(...binds, limit, offset)
          .all<AuditIndexRow>();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM audit_log_index ${where}`)
          .bind(...binds)
          .first<{ n: number }>();

        return Response.json({
          logs: res.results ?? [],
          total: total?.n ?? 0,
          limit,
          offset,
        });
      },
      DELETE: async ({ request }) => {
        let admin;
        try {
          admin = await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        if (admin.role !== "owner") {
          return Response.json({ error: "owner_required" }, { status: 403 });
        }

        let body: { scope?: string; olderThanDays?: number; confirm?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        if (body.confirm !== "audit_logs") {
          return Response.json({ error: "confirm_mismatch" }, { status: 400 });
        }
        const scope = body.scope && SCOPES.has(body.scope) ? body.scope : null;
        const olderThanDays =
          typeof body.olderThanDays === "number" &&
          Number.isFinite(body.olderThanDays)
            ? Math.max(0, Math.floor(body.olderThanDays))
            : 90;
        const result = await cleanupAuditLogs(scope, olderThanDays);
        await writeAudit(request, {
          action: "DELETE",
          resource_type: "audit_logs",
          resource_id: scope ?? "all",
          before: result.before,
          after: result.after,
          meta: { scope, olderThanDays },
        });
        return Response.json({ ok: true, scope, olderThanDays, ...result });
      },
    },
  },
});

async function readDetail(id: string): Promise<Response> {
  const db = getDB();
  const row = await db
    .prepare("SELECT * FROM audit_log_index WHERE id = ?")
    .bind(id)
    .first<AuditIndexRow>();
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });

  if (!row.r2_key) {
    const legacy = await db
      .prepare(
        "SELECT before_json, after_json, meta_json FROM admin_audit_log WHERE id = ?",
      )
      .bind(id)
      .first<{
        before_json: string | null;
        after_json: string | null;
        meta_json: string | null;
      }>();
    return Response.json({
      ...row,
      before: parseMaybeJson(legacy?.before_json),
      after: parseMaybeJson(legacy?.after_json),
      meta: parseMaybeJson(legacy?.meta_json),
      legacyD1: true,
    });
  }

  const bucket = (env as unknown as { AUDIT_LOGS_BUCKET?: R2Bucket })
    .AUDIT_LOGS_BUCKET;
  if (!bucket)
    return Response.json({ error: "audit_bucket_missing" }, { status: 503 });
  const object = await bucket.get(row.r2_key);
  if (!object)
    return Response.json({ error: "audit_object_missing" }, { status: 404 });
  return Response.json(await object.json());
}

function parseMaybeJson(value: string | null | undefined): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function cleanupAuditLogs(scope: string | null, olderThanDays: number) {
  const db = getDB();
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const conds = ["created_at < ?"];
  const binds: unknown[] = [cutoff];
  if (scope) {
    conds.push("scope = ?");
    binds.push(scope);
  }
  const where = conds.join(" AND ");
  const rows = await db
    .prepare(`SELECT id, r2_key FROM audit_log_index WHERE ${where}`)
    .bind(...binds)
    .all<{ id: string; r2_key: string | null }>();
  const list = rows.results ?? [];
  const r2Keys = list
    .map((r) => r.r2_key)
    .filter((key): key is string => !!key);
  const legacyIds = list.filter((r) => !r.r2_key).map((r) => r.id);

  const bucket = (env as unknown as { AUDIT_LOGS_BUCKET?: R2Bucket })
    .AUDIT_LOGS_BUCKET;
  if (bucket) {
    for (let i = 0; i < r2Keys.length; i += 50) {
      await Promise.all(
        r2Keys.slice(i, i + 50).map((key) => bucket.delete(key)),
      );
    }
  }

  await db
    .prepare(`DELETE FROM audit_log_index WHERE ${where}`)
    .bind(...binds)
    .run();
  for (let i = 0; i < legacyIds.length; i += 100) {
    const batch = legacyIds.slice(i, i + 100);
    if (batch.length === 0) continue;
    await db
      .prepare(
        `DELETE FROM admin_audit_log WHERE id IN (${batch.map(() => "?").join(",")})`,
      )
      .bind(...batch)
      .run();
  }

  return {
    before: {
      matched: list.length,
      r2Objects: r2Keys.length,
      legacyD1Rows: legacyIds.length,
    },
    after: {
      matched: 0,
      r2Objects: bucket ? 0 : "bucket_missing",
      legacyD1Rows: 0,
    },
  };
}

// GET /api/admin/db/tables/:name?limit=&offset=&orderBy=&orderDir=
//   Read-only paginated view of a single table. Redacts sensitive columns.
//   Auth: requires admin session cookie or Bearer token.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

// Per-table column redaction rules. For each table, list columns whose values
// must be truncated before returning. Hides password hashes and API token
// hashes from the read-only viewer.
const REDACT: Record<string, string[]> = {
  admin_users: ["password_hash"],
  admin_api_tokens: ["token_hash"],
};

function redactValue(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (s.length <= 10) return "***";
  return s.slice(0, 6) + "…(" + (s.length - 6) + " more)";
}

async function listUserTables(db: D1Database): Promise<string[]> {
  const r = await db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type='table'
         AND name NOT LIKE 'sqlite_%'
         AND name NOT LIKE '_cf_%'
         AND name NOT LIKE 'd1_%'`,
    )
    .all<{ name: string }>();
  return (r.results ?? []).map((x) => x.name);
}

async function tableColumns(
  db: D1Database,
  name: string,
): Promise<Array<{ name: string; type: string }>> {
  const r = await db
    .prepare(`PRAGMA table_info("${name}")`)
    .all<{ name: string; type: string }>();
  return (r.results ?? []).map((c) => ({ name: c.name, type: c.type }));
}

export const Route = createFileRoute("/api/admin/db/tables/$name")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();

        // 1. Whitelist: the requested table must exist in sqlite_master.
        const allowed = await listUserTables(db);
        if (!allowed.includes(params.name)) {
          return Response.json({ error: "table_not_found" }, { status: 404 });
        }
        const table = params.name;

        // 2. Column introspection — used to validate orderBy and returned for the UI.
        const columns = await tableColumns(db, table);
        const colNames = new Set(columns.map((c) => c.name));

        // 3. Parse + validate query params.
        const url = new URL(request.url);
        let limit = parseInt(url.searchParams.get("limit") || "50", 10);
        if (!Number.isFinite(limit) || limit < 1) limit = 50;
        if (limit > 200) limit = 200;
        let offset = parseInt(url.searchParams.get("offset") || "0", 10);
        if (!Number.isFinite(offset) || offset < 0) offset = 0;

        const orderByRaw = url.searchParams.get("orderBy") || "";
        const orderBy = colNames.has(orderByRaw) ? orderByRaw : null;
        const orderDirRaw = (
          url.searchParams.get("orderDir") || ""
        ).toLowerCase();
        const orderDir: "asc" | "desc" =
          orderDirRaw === "desc" ? "desc" : "asc";

        // 4. Query: count + page. Both safe — table name came from whitelist and
        //    orderBy is validated against the real column list.
        const countR = await db
          .prepare(`SELECT COUNT(*) AS n FROM "${table}"`)
          .first<{ n: number }>();
        const total = countR?.n ?? 0;

        const orderClause = orderBy
          ? ` ORDER BY "${orderBy}" ${orderDir.toUpperCase()}`
          : "";
        const rowsR = await db
          .prepare(`SELECT * FROM "${table}"${orderClause} LIMIT ? OFFSET ?`)
          .bind(limit, offset)
          .all<Record<string, unknown>>();

        // 5. Redact sensitive columns in-place.
        const redactList = REDACT[table] ?? [];
        const rows = (rowsR.results ?? []).map((row) => {
          if (redactList.length === 0) return row;
          const next: Record<string, unknown> = { ...row };
          for (const col of redactList) {
            if (col in next) next[col] = redactValue(next[col]);
          }
          return next;
        });

        return Response.json({
          table,
          columns,
          rows,
          total,
          limit,
          offset,
          order_by: orderBy,
          order_dir: orderDir,
          redacted_columns: redactList,
        });
      },
    },
  },
});

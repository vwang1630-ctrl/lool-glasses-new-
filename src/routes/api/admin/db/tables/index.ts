// GET /api/admin/db/tables — list user tables with row counts.
// Read-only DB inspector for admin UI / MCP. Never accepts arbitrary SQL.
// Auth: requires admin session cookie or Bearer token.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

export const Route = createFileRoute("/api/admin/db/tables/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        const namesR = await db
          .prepare(
            `SELECT name FROM sqlite_master
             WHERE type='table'
               AND name NOT LIKE 'sqlite_%'
               AND name NOT LIKE '_cf_%'
               AND name NOT LIKE 'd1_%'
             ORDER BY name`,
          )
          .all<{ name: string }>();

        const names = (namesR.results ?? []).map((r) => r.name);

        // D1 caps compound SELECTs; run one COUNT per table.
        // Names come from sqlite_master — trusted — so quoting is safe.
        const tables: Array<{ name: string; row_count: number }> = [];
        for (const name of names) {
          const row = await db
            .prepare(`SELECT COUNT(*) AS n FROM "${name}"`)
            .first<{ n: number }>();
          tables.push({ name, row_count: row?.n ?? 0 });
        }

        return Response.json({ tables });
      },
    },
  },
});

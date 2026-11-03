// GET    /api/admin/logistics-contacts/:id   — single logistics agent route.
// PATCH  /api/admin/logistics-contacts/:id   — update one carrier-agent route.
// DELETE /api/admin/logistics-contacts/:id   — soft-archive (active=0); ?hard=1 deletes row.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const STR = new Set([
  "supplier_id",
  "agent_name",
  "contact_person",
  "phone",
  "email",
  "notes",
]);
const INT = new Set(["sort_order"]);
const BOOL = new Set(["active"]);

export const Route = createFileRoute("/api/admin/logistics-contacts/$id")({
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
        const row = await db
          .prepare(
            `SELECT a.id, a.supplier_id, a.agent_name, a.contact_person, a.phone, a.email,
                    a.notes, a.active, a.sort_order, a.created_at, a.updated_at,
                    s.name_zh AS supplier_name_zh, s.name_en AS supplier_name_en
             FROM logistics_agent a
             JOIN suppliers s ON s.id = a.supplier_id
             WHERE a.id = ?`,
          )
          .bind(params.id)
          .first();
        if (!row) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({ agent: row, contact: row });
      },

      PATCH: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const sets: string[] = [];
        const binds: unknown[] = [];
        for (const [k, v] of Object.entries(body)) {
          if (STR.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v == null ? null : String(v));
          } else if (INT.has(k)) {
            const n =
              typeof v === "number" && Number.isFinite(v)
                ? Math.round(v)
                : null;
            sets.push(`${k} = ?`);
            binds.push(n);
          } else if (BOOL.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v ? 1 : 0);
          }
        }

        const db = getDB();
        if (sets.length > 0) {
          sets.push("updated_at = ?");
          binds.push(Date.now());
          try {
            await db
              .prepare(
                `UPDATE logistics_agent SET ${sets.join(", ")} WHERE id = ?`,
              )
              .bind(...binds, params.id)
              .run();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("FOREIGN KEY"))
              return Response.json(
                { error: "supplier_not_found" },
                { status: 400 },
              );
            return Response.json(
              { error: "update_failed", message: msg },
              { status: 500 },
            );
          }
        }

        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });

        return Response.json({ ok: true, id: params.id });
      },

      DELETE: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        const url = new URL(request.url);
        const hard = url.searchParams.get("hard") === "1";
        if (hard) {
          await db
            .prepare(`DELETE FROM logistics_agent WHERE id = ?`)
            .bind(params.id)
            .run();
        } else {
          await db
            .prepare(
              `UPDATE logistics_agent SET active = 0, updated_at = ? WHERE id = ?`,
            )
            .bind(Date.now(), params.id)
            .run();
        }
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

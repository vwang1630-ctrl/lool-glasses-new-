// PATCH  /api/admin/suppliers/:id
// DELETE /api/admin/suppliers/:id   (?hard=1 to delete row, default flips active=0)
// GET    /api/admin/suppliers/:id
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const VALID_KIND = new Set([
  "lens",
  "frame",
  "both",
  "accessory",
  "payment",
  "logistics",
]);
const STR = new Set([
  "name_zh",
  "name_en",
  "contact_person",
  "contact_email",
  "contact_phone",
  "shipping_address",
  "payment_terms",
  "notes",
]);
const INT = new Set(["lead_time_days", "sort_order"]);
const BOOL = new Set(["active"]);

export const Route = createFileRoute("/api/admin/suppliers/$id")({
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
          .prepare("SELECT * FROM suppliers WHERE id = ?")
          .bind(params.id)
          .first();
        if (!row) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({ supplier: row });
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
          } else if (k === "kind") {
            if (typeof v !== "string" || !VALID_KIND.has(v))
              return Response.json({ error: "invalid_kind" }, { status: 400 });
            sets.push("kind = ?");
            binds.push(v);
          } else if (k === "config" || k === "config_json") {
            // Accept either `config` (object → stringify) or `config_json` (raw string).
            // Empty / null clears the column. Raw strings must be valid JSON.
            if (v == null || (typeof v === "string" && v.trim() === "")) {
              sets.push("config_json = ?");
              binds.push(null);
            } else if (typeof v === "string") {
              try {
                JSON.parse(v);
              } catch {
                return Response.json(
                  { error: "invalid_config_json" },
                  { status: 400 },
                );
              }
              sets.push("config_json = ?");
              binds.push(v);
            } else {
              sets.push("config_json = ?");
              binds.push(JSON.stringify(v));
            }
          }
        }
        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });
        sets.push("updated_at = ?");
        binds.push(Date.now());

        const db = getDB();
        try {
          await db
            .prepare(`UPDATE suppliers SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }
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
          try {
            await db
              .prepare("DELETE FROM suppliers WHERE id = ?")
              .bind(params.id)
              .run();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("FOREIGN KEY"))
              return Response.json(
                {
                  error: "in_use",
                  message: "Supplier is referenced by products or lens_skus.",
                },
                { status: 409 },
              );
            return Response.json(
              { error: "delete_failed", message: msg },
              { status: 500 },
            );
          }
        } else {
          await db
            .prepare(
              "UPDATE suppliers SET active = 0, updated_at = ? WHERE id = ?",
            )
            .bind(Date.now(), params.id)
            .run();
        }
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

// GET    /api/admin/lens-brands/:id
// PATCH  /api/admin/lens-brands/:id
// DELETE /api/admin/lens-brands/:id  (soft: active=0; ?hard=1 row delete)
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { cleanLangMapInput, parseLangMapColumn } from "@/server/lang";

const VALID_TIER = new Set(["budget", "mainstream", "premium", "luxury"]);
const STR = new Set(["hero_img_url"]);
const INT = new Set(["sort_order"]);
const BOOL = new Set(["active"]);

export const Route = createFileRoute("/api/admin/lens-brands/$id")({
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
        const row = (await db
          .prepare("SELECT * FROM lens_brands WHERE id = ?")
          .bind(params.id)
          .first()) as Record<string, unknown> | null;
        if (!row) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({
          brand: {
            ...row,
            name: parseLangMapColumn(row.name_json),
            description: parseLangMapColumn(row.description_json),
          },
        });
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
          } else if (k === "tier") {
            if (v === null) {
              sets.push("tier = NULL");
            } else if (typeof v === "string" && VALID_TIER.has(v)) {
              sets.push("tier = ?");
              binds.push(v);
            } else {
              return Response.json({ error: "invalid_tier" }, { status: 400 });
            }
          } else if (k === "name" || k === "name_json") {
            const json = cleanLangMapInput(v);
            if (!json)
              return Response.json({ error: "name_required" }, { status: 400 });
            sets.push("name_json = ?");
            binds.push(json);
          } else if (k === "description" || k === "description_json") {
            sets.push("description_json = ?");
            binds.push(cleanLangMapInput(v));
          }
        }
        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });
        sets.push("updated_at = ?");
        binds.push(Date.now());

        const db = getDB();
        try {
          await db
            .prepare(`UPDATE lens_brands SET ${sets.join(", ")} WHERE id = ?`)
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
              .prepare("DELETE FROM lens_brands WHERE id = ?")
              .bind(params.id)
              .run();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("FOREIGN KEY"))
              return Response.json(
                {
                  error: "in_use",
                  message: "Brand is referenced by lens_skus.",
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
              "UPDATE lens_brands SET active = 0, updated_at = ? WHERE id = ?",
            )
            .bind(Date.now(), params.id)
            .run();
        }
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

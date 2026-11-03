// PATCH  /api/admin/lens-skus/:id
// DELETE /api/admin/lens-skus/:id   (?hard=1 to delete row, default flips active=0)
// GET    /api/admin/lens-skus/:id   full row for edit form
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { cleanLangMapInput, parseLangMapColumn } from "@/server/lang";

const VALID_PT = new Set([
  "single-vision",
  "progressive",
  "reading",
  "non-prescription",
]);
const VALID_BASE_FN = new Set([
  "clear",
  "blue",
  "photo",
  "driving",
  "tinted",
  "polarized",
]);
// nullable enum columns — null/'' clears them
const NULLABLE_ENUM: Record<string, Set<string>> = {
  progressive_view_area: new Set(["standard", "broader"]),
  progressive_design: new Set(["standard", "short"]),
  function_variant: new Set(["base", "blueUpgrade"]),
};

const STR = new Set(["brand_id", "brand_line", "hero_img_url"]);
const INT = new Set(["retail_cents", "sort_order"]);
const REAL = new Set([
  "refractive_index",
  "sph_min",
  "sph_max",
  "cyl_min",
  "cyl_max",
  "add_min",
  "add_max",
]);
const BOOL = new Set(["recommended", "active"]);

export const Route = createFileRoute("/api/admin/lens-skus/$id")({
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
          .prepare("SELECT * FROM lens_skus WHERE id = ?")
          .bind(params.id)
          .first()) as Record<string, unknown> | null;
        if (!row) return Response.json({ error: "not_found" }, { status: 404 });
        const raw = row.supplier_costs_json;
        let supplierCosts: Record<string, unknown> = {};
        if (typeof raw === "string" && raw.trim()) {
          try {
            const parsed = JSON.parse(raw);
            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              supplierCosts = parsed as Record<string, unknown>;
            }
          } catch {
            // malformed — leave empty
          }
        }
        return Response.json({
          sku: {
            ...row,
            supplier_costs: supplierCosts,
            display_name: parseLangMapColumn(row.display_name_json),
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
          } else if (REAL.has(k)) {
            const n = typeof v === "number" && Number.isFinite(v) ? v : null;
            sets.push(`${k} = ?`);
            binds.push(n);
          } else if (BOOL.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v ? 1 : 0);
          } else if (k === "prescription_type") {
            if (typeof v !== "string" || !VALID_PT.has(v))
              return Response.json(
                { error: "invalid_prescription_type" },
                { status: 400 },
              );
            sets.push("prescription_type = ?");
            binds.push(v);
          } else if (k === "base_function") {
            if (typeof v !== "string" || !VALID_BASE_FN.has(v))
              return Response.json(
                { error: "invalid_base_function" },
                { status: 400 },
              );
            sets.push("base_function = ?");
            binds.push(v);
          } else if (NULLABLE_ENUM[k]) {
            if (v === null || v === "") {
              sets.push(`${k} = ?`);
              binds.push(null);
            } else if (typeof v === "string" && NULLABLE_ENUM[k].has(v)) {
              sets.push(`${k} = ?`);
              binds.push(v);
            } else {
              return Response.json({ error: `invalid_${k}` }, { status: 400 });
            }
          } else if (k === "lens_colors" || k === "lens_colors_json") {
            let json: string | null = null;
            if (Array.isArray(v)) {
              const cleaned: Array<{
                id: string;
                label: Record<string, string>;
                hex: string;
              }> = [];
              for (const item of v) {
                if (!item || typeof item !== "object") continue;
                const e = item as Record<string, unknown>;
                if (typeof e.id !== "string" || typeof e.hex !== "string")
                  continue;
                cleaned.push({
                  id: e.id,
                  label:
                    e.label && typeof e.label === "object"
                      ? (e.label as Record<string, string>)
                      : {},
                  hex: e.hex,
                });
              }
              json = cleaned.length > 0 ? JSON.stringify(cleaned) : null;
            } else if (typeof v === "string" && v.trim() !== "") {
              json = v;
            }
            sets.push("lens_colors_json = ?");
            binds.push(json);
          } else if (k === "display_name" || k === "display_name_json") {
            sets.push("display_name_json = ?");
            binds.push(cleanLangMapInput(v));
          } else if (k === "description" || k === "description_json") {
            sets.push("description_json = ?");
            binds.push(cleanLangMapInput(v));
          } else if (k === "supplier_costs" || k === "supplier_costs_json") {
            let json: string | null = null;
            if (v && typeof v === "object" && !Array.isArray(v)) {
              const obj = v as Record<string, unknown>;
              const cleaned: Record<
                string,
                {
                  cost_cny_cents: number | null;
                  supplier_sku_code: string | null;
                  active: boolean;
                }
              > = {};
              for (const [supplierId, raw] of Object.entries(obj)) {
                if (!supplierId || typeof raw !== "object" || raw === null)
                  continue;
                const r = raw as Record<string, unknown>;
                const costRaw = r.cost_cny_cents;
                const codeRaw = r.supplier_sku_code;
                cleaned[supplierId] = {
                  cost_cny_cents:
                    typeof costRaw === "number" && Number.isFinite(costRaw)
                      ? Math.round(costRaw)
                      : null,
                  supplier_sku_code:
                    typeof codeRaw === "string" && codeRaw.trim()
                      ? codeRaw.trim()
                      : null,
                  active: r.active === false ? false : true,
                };
              }
              if (Object.keys(cleaned).length > 0)
                json = JSON.stringify(cleaned);
            } else if (typeof v === "string" && v.trim() !== "") {
              json = v;
            }
            sets.push("supplier_costs_json = ?");
            binds.push(json);
          }
        }
        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });
        sets.push("updated_at = ?");
        binds.push(Date.now());

        const db = getDB();
        try {
          await db
            .prepare(`UPDATE lens_skus SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "duplicate" }, { status: 409 });
          if (msg.includes("FOREIGN KEY"))
            return Response.json({ error: "fk_violation" }, { status: 400 });
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
          await db
            .prepare("DELETE FROM lens_skus WHERE id = ?")
            .bind(params.id)
            .run();
        } else {
          await db
            .prepare(
              "UPDATE lens_skus SET active = 0, updated_at = ? WHERE id = ?",
            )
            .bind(Date.now(), params.id)
            .run();
        }
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

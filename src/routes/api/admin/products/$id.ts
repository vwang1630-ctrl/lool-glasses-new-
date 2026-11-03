// PATCH /api/admin/products/:id  — partial update
// DELETE /api/admin/products/:id — soft archive (sets archived_at) unless ?hard=1
// GET /api/admin/products/:id     — full row for the edit form
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";

const VALID_KIND = new Set(["eyeglasses", "sunglasses", "accessory"]);
const VALID_SHAPE = new Set([
  "Square",
  "Rectangle",
  "Cat eye",
  "Butterfly",
  "Round",
  "Geometric",
  "Aviator",
  "Browline",
  "Oval",
]);
const VALID_RIM = new Set(["Full Rim", "Semi Rim", "Rimless"]);
const VALID_SIZE = new Set([
  "Narrow",
  "Medium",
  "Wide",
  "Extra Wide",
  "Custom",
]);
const VALID_THICK = new Set(["thin frame", "normal frame", "thick frame"]);
const VALID_BRIDGE_FIT = new Set(["Universal Fit", "Low Fit", "Asian Fit"]);
const VALID_STYLE = new Set(["minimal", "business", "character", "classic"]);
const VALID_CATEGORY = new Set(["presbyopia", "myopia"]);
const VALID_FINISH = new Set(["matte", "gloss", "satin", "brushed"]);

const PATCHABLE_STR = new Set([
  "material",
  "currency",
  "card_image_url",
  "card_hover_image_url",
]);
const PATCHABLE_JSON_ENUM_ARRAY: Record<string, Set<string>> = {
  categories: VALID_CATEGORY,
  styles: VALID_STYLE,
};
const PATCHABLE_INT = new Set([
  "lens_width_mm",
  "bridge_mm",
  "temple_mm",
  "frame_width_mm",
  "price_cents",
  "original_price_cents",
  "review_count",
]);
const PATCHABLE_REAL = new Set([
  "lens_height_mm",
  "weight_g",
  "rating",
  "review_quality",
  "review_fit",
  "review_design",
]);
const PATCHABLE_BOOL = new Set([
  "supports_progressive",
  "supports_transitions",
  "is_frame_only_eligible",
  "supports_reader",
  "supports_single_vision",
  "supports_non_prescription",
  "spring_hinge",
  "adjustable_nosepads",
  "is_kids",
  "is_new",
  "bestseller",
]);
const PATCHABLE_JSON = new Set([
  "name",
  "intro",
  "description",
  "highlights",
  "face_shape_tags",
  "genders",
]);
const PATCHABLE_ENUM: Record<string, Set<string>> = {
  product_kind: VALID_KIND,
  shape: VALID_SHAPE,
  rim_type: VALID_RIM,
  size_class: VALID_SIZE,
  thickness: VALID_THICK,
  bridge_fit: VALID_BRIDGE_FIT,
  finish: VALID_FINISH,
};

export const Route = createFileRoute("/api/admin/products/$id")({
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
          .prepare("SELECT * FROM products WHERE id = ?")
          .bind(params.id)
          .first()) as Record<string, unknown> | null;
        if (!row) return Response.json({ error: "not_found" }, { status: 404 });
        const colors = await db
          .prepare(
            `SELECT id, color_id, label_json, hex,
                    images_json, views_json, tryon_image_url, sort_order
             FROM product_colors WHERE product_id = ? ORDER BY sort_order, color_id`,
          )
          .bind(params.id)
          .all();
        // Parse supplier_costs_json server-side; client treats it as an
        // object and the GET → edit → PATCH round-trip would otherwise
        // double-stringify.
        let supplierCosts: Record<string, unknown> = {};
        const rawSC = row.supplier_costs_json;
        if (typeof rawSC === "string" && rawSC.trim()) {
          try {
            const parsed = JSON.parse(rawSC);
            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              supplierCosts = parsed as Record<string, unknown>;
            }
          } catch {
            /* malformed — leave empty */
          }
        }
        return Response.json({
          product: {
            ...row,
            colors: colors.results ?? [],
            supplier_costs: supplierCosts,
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
          if (PATCHABLE_STR.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v === null ? null : String(v));
          } else if (PATCHABLE_INT.has(k)) {
            const n =
              typeof v === "number" && Number.isFinite(v)
                ? Math.round(v)
                : null;
            sets.push(`${k} = ?`);
            binds.push(n);
          } else if (PATCHABLE_REAL.has(k)) {
            const n = typeof v === "number" && Number.isFinite(v) ? v : null;
            sets.push(`${k} = ?`);
            binds.push(n);
          } else if (PATCHABLE_BOOL.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v ? 1 : 0);
          } else if (PATCHABLE_JSON.has(k)) {
            sets.push(`${k}_json = ?`);
            binds.push(v == null ? null : JSON.stringify(v));
          } else if (PATCHABLE_JSON_ENUM_ARRAY[k]) {
            const allowed = PATCHABLE_JSON_ENUM_ARRAY[k];
            if (v === null || (Array.isArray(v) && v.length === 0)) {
              sets.push(`${k}_json = NULL`);
            } else if (
              Array.isArray(v) &&
              v.every((x) => typeof x === "string" && allowed.has(x))
            ) {
              const uniq = Array.from(new Set(v as string[]));
              sets.push(`${k}_json = ?`);
              binds.push(JSON.stringify(uniq));
            } else {
              return Response.json({ error: `invalid_${k}` }, { status: 400 });
            }
          } else if (PATCHABLE_ENUM[k]) {
            if (typeof v === "string" && PATCHABLE_ENUM[k].has(v)) {
              sets.push(`${k} = ?`);
              binds.push(v);
            } else if (v === null) {
              sets.push(`${k} = NULL`);
            } else
              return Response.json({ error: `invalid_${k}` }, { status: 400 });
          } else if (k === "slug") {
            if (typeof v !== "string" || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(v))
              return Response.json({ error: "invalid_slug" }, { status: 400 });
            sets.push("slug = ?");
            binds.push(v);
          } else if (k === "archived") {
            sets.push("archived_at = ?");
            binds.push(v ? Date.now() : null);
          } else if (k === "supplier_costs" || k === "supplier_costs_json") {
            // Same shape as lens_skus.supplier_costs_json (incl. `active` flag).
            // Empty object → NULL.
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
                const c = r.cost_cny_cents;
                const code = r.supplier_sku_code;
                cleaned[supplierId] = {
                  cost_cny_cents:
                    typeof c === "number" && Number.isFinite(c)
                      ? Math.round(c)
                      : null,
                  supplier_sku_code:
                    typeof code === "string" && code.trim()
                      ? code.trim()
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
        const before = await db
          .prepare("SELECT * FROM products WHERE id = ?")
          .bind(params.id)
          .first();
        try {
          await db
            .prepare(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "slug_taken" }, { status: 409 });
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }
        await writeAudit(request, {
          action: "PATCH",
          resource_type: "products",
          resource_id: params.id,
          before,
          after: body,
        });
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
        const before = await db
          .prepare("SELECT * FROM products WHERE id = ?")
          .bind(params.id)
          .first();
        if (hard) {
          await db
            .prepare("DELETE FROM products WHERE id = ?")
            .bind(params.id)
            .run();
        } else {
          const now = Date.now();
          await db
            .prepare(
              "UPDATE products SET archived_at = ?, updated_at = ? WHERE id = ?",
            )
            .bind(now, now, params.id)
            .run();
        }
        await writeAudit(request, {
          action: "DELETE",
          resource_type: "products",
          resource_id: params.id,
          before,
          meta: { hard },
        });
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

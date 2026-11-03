// GET  /api/admin/lens-skus  — list with optional brand/prescriptionType filters
// POST /api/admin/lens-skus  — create new lens SKU
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { cleanLangMapInput } from "@/server/lang";

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
const VALID_PROGRESSIVE_VIEW_AREA = new Set(["standard", "broader"]);
const VALID_PROGRESSIVE_DESIGN = new Set(["standard", "short"]);
const VALID_FUNCTION_VARIANT = new Set(["base", "blueUpgrade"]);

function cleanLensColors(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string" && raw.trim() !== "") return raw;
  if (!Array.isArray(raw)) return null;
  const out: Array<{ id: string; label: Record<string, string>; hex: string }> =
    [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const e = item as Record<string, unknown>;
    if (typeof e.id !== "string" || typeof e.hex !== "string") continue;
    out.push({
      id: e.id,
      label:
        e.label && typeof e.label === "object"
          ? (e.label as Record<string, string>)
          : {},
      hex: e.hex,
    });
  }
  return out.length > 0 ? JSON.stringify(out) : null;
}

export const Route = createFileRoute("/api/admin/lens-skus/")({
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
        const brandId = url.searchParams.get("brand_id");
        const pt = url.searchParams.get("prescription_type");
        const q = (url.searchParams.get("q") ?? "").trim();
        const limit = Math.min(
          500,
          Math.max(
            1,
            parseInt(url.searchParams.get("limit") ?? "200", 10) || 200,
          ),
        );
        const offset = Math.max(
          0,
          parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
        );

        const conds: string[] = [];
        const binds: unknown[] = [];
        if (brandId) {
          conds.push("brand_id = ?");
          binds.push(brandId);
        }
        if (pt && VALID_PT.has(pt)) {
          conds.push("prescription_type = ?");
          binds.push(pt);
        }
        if (q) {
          conds.push(
            "(id LIKE ? OR display_name_json LIKE ? OR brand_line LIKE ?)",
          );
          const pat = `%${q}%`;
          binds.push(pat, pat, pat);
        }
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const sql = `SELECT * FROM lens_skus ${where} ORDER BY brand_id, prescription_type, sort_order, refractive_index LIMIT ? OFFSET ?`;
        const res = await db
          .prepare(sql)
          .bind(...binds, limit, offset)
          .all();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM lens_skus ${where}`)
          .bind(...binds)
          .first<{ n: number }>();
        return Response.json({
          skus: res.results ?? [],
          total: total?.n ?? 0,
          limit,
          offset,
        });
      },

      POST: async ({ request }) => {
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

        const id = String(body.id ?? "").trim();
        const brand_id = String(body.brand_id ?? "").trim();
        const prescription_type = String(body.prescription_type ?? "");
        const base_function = String(body.base_function ?? "");
        const refractive_index = Number(body.refractive_index);
        const retail_cents = Number(body.retail_cents);
        const nullEnum = (raw: unknown) =>
          raw == null || raw === "" ? null : String(raw);
        const progressive_view_area = nullEnum(body.progressive_view_area);
        const progressive_design = nullEnum(body.progressive_design);
        const function_variant = nullEnum(body.function_variant);
        const lens_colors_json = cleanLensColors(
          body.lens_colors ?? body.lens_colors_json,
        );

        if (!id)
          return Response.json({ error: "id_required" }, { status: 400 });
        if (!brand_id)
          return Response.json({ error: "brand_id_required" }, { status: 400 });
        if (!VALID_PT.has(prescription_type))
          return Response.json(
            { error: "invalid_prescription_type" },
            { status: 400 },
          );
        if (!VALID_BASE_FN.has(base_function))
          return Response.json(
            { error: "invalid_base_function" },
            { status: 400 },
          );
        if (
          progressive_view_area !== null &&
          !VALID_PROGRESSIVE_VIEW_AREA.has(progressive_view_area)
        )
          return Response.json(
            { error: "invalid_progressive_view_area" },
            { status: 400 },
          );
        if (
          progressive_design !== null &&
          !VALID_PROGRESSIVE_DESIGN.has(progressive_design)
        )
          return Response.json(
            { error: "invalid_progressive_design" },
            { status: 400 },
          );
        if (
          function_variant !== null &&
          !VALID_FUNCTION_VARIANT.has(function_variant)
        )
          return Response.json(
            { error: "invalid_function_variant" },
            { status: 400 },
          );
        if (!Number.isFinite(refractive_index))
          return Response.json({ error: "invalid_index" }, { status: 400 });
        if (!Number.isFinite(retail_cents) || retail_cents < 0)
          return Response.json({ error: "invalid_retail" }, { status: 400 });

        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO lens_skus (
               id, brand_id, brand_line, prescription_type,
               base_function, function_variant, refractive_index,
               progressive_design, progressive_view_area, lens_colors_json,
               retail_cents, supplier_costs_json,
               display_name_json, description_json,
               hero_img_url, recommended,
               sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
               active, sort_order
             ) VALUES (
               ?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, ?,
               ?, ?, ?, ?, ?, ?,
               ?, ?
             )`,
            )
            .bind(
              id,
              brand_id,
              body.brand_line == null ? null : String(body.brand_line),
              prescription_type,
              base_function,
              function_variant,
              refractive_index,
              progressive_design,
              progressive_view_area,
              lens_colors_json,
              Math.round(retail_cents),
              (() => {
                const raw = body.supplier_costs ?? body.supplier_costs_json;
                if (raw == null) return null;
                if (typeof raw === "string" && raw.trim() !== "") return raw;
                if (raw && typeof raw === "object" && !Array.isArray(raw)) {
                  const obj = raw as Record<string, unknown>;
                  const cleaned: Record<
                    string,
                    {
                      cost_cny_cents: number | null;
                      supplier_sku_code: string | null;
                      active: boolean;
                    }
                  > = {};
                  for (const [supplierId, entry] of Object.entries(obj)) {
                    if (
                      !supplierId ||
                      typeof entry !== "object" ||
                      entry === null
                    )
                      continue;
                    const e = entry as Record<string, unknown>;
                    const c = e.cost_cny_cents;
                    const code = e.supplier_sku_code;
                    cleaned[supplierId] = {
                      cost_cny_cents:
                        typeof c === "number" && Number.isFinite(c)
                          ? Math.round(c)
                          : null,
                      supplier_sku_code:
                        typeof code === "string" && code.trim()
                          ? code.trim()
                          : null,
                      active: e.active === false ? false : true,
                    };
                  }
                  return Object.keys(cleaned).length > 0
                    ? JSON.stringify(cleaned)
                    : null;
                }
                return null;
              })(),
              cleanLangMapInput(body.display_name ?? body.display_name_json),
              cleanLangMapInput(body.description ?? body.description_json),
              body.hero_img_url == null ? null : String(body.hero_img_url),
              body.recommended ? 1 : 0,
              body.sph_min == null ? null : Number(body.sph_min),
              body.sph_max == null ? null : Number(body.sph_max),
              body.cyl_min == null ? null : Number(body.cyl_min),
              body.cyl_max == null ? null : Number(body.cyl_max),
              body.add_min == null ? null : Number(body.add_min),
              body.add_max == null ? null : Number(body.add_max),
              body.active === false ? 0 : 1,
              Number.isFinite(Number(body.sort_order))
                ? Math.round(Number(body.sort_order))
                : 0,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "duplicate" }, { status: 409 });
          if (msg.includes("FOREIGN KEY"))
            return Response.json({ error: "fk_violation" }, { status: 400 });
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ id });
      },
    },
  },
});

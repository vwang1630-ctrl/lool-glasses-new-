// GET  /api/admin/products       — list with optional filters
// POST /api/admin/products       — create new product
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { nanoid } from "@/server/ids";

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

// Returns null for empty/missing input, the JSON-stringified deduped array
// when every item is a valid enum value, or the special sentinel "__INVALID__"
// to let the caller emit a 400. Empty arrays collapse to null so the row
// stores NULL rather than `[]`.
const enumArrayJsonOrNull = (
  v: unknown,
  allowed: Set<string>,
): string | null | "__INVALID__" => {
  if (v == null) return null;
  if (!Array.isArray(v)) return "__INVALID__";
  if (v.length === 0) return null;
  if (!v.every((x) => typeof x === "string" && allowed.has(x)))
    return "__INVALID__";
  return JSON.stringify(Array.from(new Set(v as string[])));
};

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

const bool = (v: unknown): 0 | 1 => (v ? 1 : 0);
const intOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;
const realOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const strOrNull = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;
const checkEnum = <T>(v: unknown, set: Set<T>): T | null =>
  typeof v === "string" && (set as Set<unknown>).has(v) ? (v as T) : null;

export const Route = createFileRoute("/api/admin/products/")({
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
        const kind = url.searchParams.get("kind");
        const q = (url.searchParams.get("q") ?? "").trim();
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
        const includeArchived = url.searchParams.get("archived") === "1";

        const db = getDB();
        const conds: string[] = [];
        const binds: unknown[] = [];
        if (kind && VALID_KIND.has(kind)) {
          conds.push("product_kind = ?");
          binds.push(kind);
        }
        if (q) {
          conds.push("(id LIKE ? OR slug LIKE ? OR name_json LIKE ?)");
          const pat = `%${q}%`;
          binds.push(pat, pat, pat);
        }
        if (!includeArchived) conds.push("archived_at IS NULL");
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        // Return every column so admin can see the full row in the expanded
        // "All fields" panel without a second round-trip per product.
        const sql = `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const res = await db
          .prepare(sql)
          .bind(...binds, limit, offset)
          .all<{ id: string }>();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM products ${where}`)
          .bind(...binds)
          .first<{ n: number }>();

        // Bulk-load colors for all products in this page in a single query.
        const products = res.results ?? [];
        const productIds = products.map((p: { id: string }) => p.id);
        const colorsByProduct = new Map<string, unknown[]>();
        if (productIds.length > 0) {
          const placeholders = productIds.map(() => "?").join(",");
          const colorsRes = await db
            .prepare(
              `SELECT product_id, color_id, label_json, hex,
                      images_json, tryon_image_url, sort_order
               FROM product_colors WHERE product_id IN (${placeholders})
               ORDER BY product_id, sort_order, color_id`,
            )
            .bind(...productIds)
            .all<{ product_id: string }>();
          for (const c of colorsRes.results ?? []) {
            const arr = colorsByProduct.get(c.product_id) ?? [];
            arr.push(c);
            colorsByProduct.set(c.product_id, arr);
          }
        }
        const productsWithColors = products.map((p: { id: string }) => ({
          ...p,
          colors: colorsByProduct.get(p.id) ?? [],
        }));

        return Response.json({
          products: productsWithColors,
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

        const slug = String(body.slug ?? "").trim();
        if (!SLUG_RE.test(slug))
          return Response.json({ error: "invalid_slug" }, { status: 400 });
        const product_kind = checkEnum(body.product_kind, VALID_KIND);
        if (!product_kind)
          return Response.json({ error: "invalid_kind" }, { status: 400 });
        const nameMap =
          body.name && typeof body.name === "object"
            ? (body.name as Record<string, string>)
            : {};
        if (!nameMap.zh || !nameMap.en)
          return Response.json({ error: "name_required" }, { status: 400 });
        const price_cents = intOrNull(body.price_cents);
        if (price_cents === null || price_cents < 0)
          return Response.json({ error: "invalid_price" }, { status: 400 });

        const categoriesJson = enumArrayJsonOrNull(
          body.categories,
          VALID_CATEGORY,
        );
        if (categoriesJson === "__INVALID__")
          return Response.json(
            { error: "invalid_categories" },
            { status: 400 },
          );
        const stylesJson = enumArrayJsonOrNull(body.styles, VALID_STYLE);
        if (stylesJson === "__INVALID__")
          return Response.json({ error: "invalid_styles" }, { status: 400 });

        const id = nanoid();
        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO products (
                id, slug, product_kind, categories_json, shape, rim_type, size_class, thickness, material,
                supports_progressive, supports_transitions, is_frame_only_eligible,
                supports_reader, supports_single_vision, supports_non_prescription,
                lens_width_mm, bridge_mm, temple_mm, frame_width_mm, lens_height_mm, weight_g,
                bridge_fit, spring_hinge, adjustable_nosepads,
                name_json, intro_json, description_json,
                highlights_json, face_shape_tags_json,
                genders_json, styles_json, is_kids,
                price_cents, original_price_cents, currency,
                is_new, bestseller
              ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, COALESCE(?, 'USD'),
                ?, ?
              )`,
            )
            .bind(
              id,
              slug,
              product_kind,
              categoriesJson,
              checkEnum(body.shape, VALID_SHAPE),
              checkEnum(body.rim_type, VALID_RIM),
              checkEnum(body.size_class, VALID_SIZE),
              checkEnum(body.thickness, VALID_THICK),
              strOrNull(body.material),

              body.supports_progressive === false ? 0 : 1,
              bool(body.supports_transitions),
              body.is_frame_only_eligible === false ? 0 : 1,

              body.supports_reader === false ? 0 : 1,
              body.supports_single_vision === false ? 0 : 1,
              body.supports_non_prescription === false ? 0 : 1,

              intOrNull(body.lens_width_mm),
              intOrNull(body.bridge_mm),
              intOrNull(body.temple_mm),
              intOrNull(body.frame_width_mm),
              realOrNull(body.lens_height_mm),
              realOrNull(body.weight_g),

              checkEnum(body.bridge_fit, VALID_BRIDGE_FIT),
              bool(body.spring_hinge),
              bool(body.adjustable_nosepads),

              JSON.stringify(nameMap),
              body.intro && typeof body.intro === "object"
                ? JSON.stringify(body.intro)
                : null,
              body.description && typeof body.description === "object"
                ? JSON.stringify(body.description)
                : null,

              body.highlights && typeof body.highlights === "object"
                ? JSON.stringify(body.highlights)
                : null,
              body.face_shape_tags
                ? JSON.stringify(body.face_shape_tags)
                : null,

              body.genders ? JSON.stringify(body.genders) : null,
              stylesJson,
              bool(body.is_kids),

              price_cents,
              intOrNull(body.original_price_cents),
              strOrNull(body.currency),

              bool(body.is_new),
              bool(body.bestseller),
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "slug_taken" }, { status: 409 });
          console.error("[admin/products POST] insert failed:", msg);
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ id, slug });
      },
    },
  },
});

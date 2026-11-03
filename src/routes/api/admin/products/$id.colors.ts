// PUT /api/admin/products/:id/colors
// Replaces the full colors array for a product (delete-all + bulk insert).
// Body: ColorPayload[]; each item:
//   { color_id, label: { zh, en, ja?, ... }, hex,
//     images: string[],            // ordered, [0] is hero, must have ≥1
//     tryon_image_url?, sort_order? }
//
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { nearestColorFamily } from "@/lib/color-palette";

const COLOR_ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

const VIEW_KEYS = ["front", "side", "angle", "folded"] as const;
type ViewKey = (typeof VIEW_KEYS)[number];
type Views = Partial<Record<ViewKey, string | null>>;

/** Normalize a client-sent views object into { front,side,angle,folded } with
 *  string-or-null values. Unknown keys are dropped (in particular, the legacy
 *  `hover` slot is discarded — it lives on products.card_hover_image_url now). */
function normaliseViews(raw: unknown): Views | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;
  const out: Views = {};
  for (const k of VIEW_KEYS) {
    const v = src[k];
    if (typeof v === "string" && v.length > 0) out[k] = v;
    else if (v === null || v === undefined) out[k] = null;
  }
  return out;
}

interface ColorPayload {
  color_id: string;
  label: Record<string, string>;
  hex: string;
  images: string[];
  views?: Views | null;
  tryon_image_url?: string | null;
  sort_order?: number;
}

function validate(
  items: unknown,
): { ok: true; value: ColorPayload[] } | { ok: false; reason: string } {
  if (!Array.isArray(items)) return { ok: false, reason: "expected_array" };
  const out: ColorPayload[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    if (!raw || typeof raw !== "object")
      return { ok: false, reason: "invalid_item" };
    const it = raw as Record<string, unknown>;
    const color_id =
      typeof it.color_id === "string" ? it.color_id.trim().toLowerCase() : "";
    if (!COLOR_ID_RE.test(color_id))
      return { ok: false, reason: `invalid_color_id:${color_id}` };
    if (seen.has(color_id))
      return { ok: false, reason: `duplicate_color_id:${color_id}` };
    seen.add(color_id);
    const labelRaw =
      it.label && typeof it.label === "object"
        ? (it.label as Record<string, unknown>)
        : null;
    if (!labelRaw) return { ok: false, reason: `label_required:${color_id}` };
    const label: Record<string, string> = {};
    for (const [k, v] of Object.entries(labelRaw)) {
      if (typeof v === "string" && v.length > 0) label[k] = v;
    }
    if (!label.zh || !label.en)
      return { ok: false, reason: `label_zh_en_required:${color_id}` };
    const hex = typeof it.hex === "string" ? it.hex : "";
    if (!HEX_RE.test(hex))
      return { ok: false, reason: `invalid_hex:${color_id}` };
    const rawImages = Array.isArray(it.images) ? it.images : [];
    const images = rawImages.filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    );
    if (images.length === 0)
      return { ok: false, reason: `images_required:${color_id}` };
    const tryon =
      typeof it.tryon_image_url === "string" && it.tryon_image_url.length > 0
        ? it.tryon_image_url
        : null;
    const views = normaliseViews(it.views);
    out.push({
      color_id,
      label,
      hex,
      images,
      views,
      tryon_image_url: tryon,
      sort_order:
        typeof it.sort_order === "number" && Number.isFinite(it.sort_order)
          ? Math.round(it.sort_order)
          : 0,
    });
  }
  return { ok: true, value: out };
}

export const Route = createFileRoute("/api/admin/products/$id/colors")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
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

        const color_id =
          typeof body.color_id === "string"
            ? body.color_id.trim().toLowerCase()
            : "";
        if (!COLOR_ID_RE.test(color_id))
          return Response.json({ error: "invalid_color_id" }, { status: 400 });
        const hex = typeof body.hex === "string" ? body.hex : "";
        if (!HEX_RE.test(hex))
          return Response.json({ error: "invalid_hex" }, { status: 400 });

        let label_json: string;
        if (
          body.label &&
          typeof body.label === "object" &&
          !Array.isArray(body.label)
        ) {
          label_json = JSON.stringify(body.label);
        } else if (
          typeof body.label_json === "string" &&
          body.label_json.length > 0
        ) {
          label_json = body.label_json;
        } else {
          label_json = JSON.stringify({ en: color_id, zh: color_id });
        }

        let images_json: string;
        if (Array.isArray(body.images)) {
          const cleaned = body.images.filter(
            (x): x is string => typeof x === "string" && x.length > 0,
          );
          images_json = JSON.stringify(cleaned);
        } else if (
          typeof body.images_json === "string" &&
          body.images_json.length > 0
        ) {
          images_json = body.images_json;
        } else {
          images_json = "[]";
        }

        const tryon_image_url =
          typeof body.tryon_image_url === "string" &&
          body.tryon_image_url.length > 0
            ? body.tryon_image_url
            : null;
        const sort_order =
          typeof body.sort_order === "number" &&
          Number.isFinite(body.sort_order)
            ? Math.round(body.sort_order)
            : 0;
        const viewsObj = normaliseViews(body.views);
        const views_json = viewsObj == null ? null : JSON.stringify(viewsObj);

        const db = getDB();
        const productExists = await db
          .prepare("SELECT id FROM products WHERE id = ?")
          .bind(params.id)
          .first();
        if (!productExists)
          return Response.json({ error: "product_not_found" }, { status: 404 });

        try {
          await db
            .prepare(
              `INSERT INTO product_colors (
                 id, product_id, color_id, label_json, hex,
                 images_json, views_json, tryon_image_url, sort_order, color_family
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              `pc-${params.id}-${color_id}`,
              params.id,
              color_id,
              label_json,
              hex,
              images_json,
              views_json,
              tryon_image_url,
              sort_order,
              nearestColorFamily(hex),
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE") || msg.includes("PRIMARY"))
            return Response.json({ error: "color_id_taken" }, { status: 409 });
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ ok: true, color_id });
      },

      PATCH: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const url = new URL(request.url);
        const color_id = url.searchParams.get("color_id");
        if (!color_id)
          return Response.json({ error: "color_id_required" }, { status: 400 });

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const sets: string[] = [];
        const binds: unknown[] = [];

        if (
          body.label &&
          typeof body.label === "object" &&
          !Array.isArray(body.label)
        ) {
          sets.push("label_json = ?");
          binds.push(JSON.stringify(body.label));
        }
        if (typeof body.hex === "string") {
          if (!HEX_RE.test(body.hex))
            return Response.json({ error: "invalid_hex" }, { status: 400 });
          sets.push("hex = ?");
          binds.push(body.hex);
          // Re-bucket whenever hex changes so the filter swatch stays in sync.
          sets.push("color_family = ?");
          binds.push(nearestColorFamily(body.hex));
        }
        if (Array.isArray(body.images)) {
          const cleaned = body.images.filter(
            (x): x is string => typeof x === "string" && x.length > 0,
          );
          sets.push("images_json = ?");
          binds.push(JSON.stringify(cleaned));
        }
        if ("tryon_image_url" in body) {
          sets.push("tryon_image_url = ?");
          binds.push(
            typeof body.tryon_image_url === "string" &&
              body.tryon_image_url.length > 0
              ? body.tryon_image_url
              : null,
          );
        }
        if ("views" in body) {
          const v = normaliseViews(body.views);
          sets.push("views_json = ?");
          binds.push(v == null ? null : JSON.stringify(v));
        }
        if (
          typeof body.sort_order === "number" &&
          Number.isFinite(body.sort_order)
        ) {
          sets.push("sort_order = ?");
          binds.push(Math.round(body.sort_order));
        }

        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });

        const db = getDB();
        try {
          await db
            .prepare(
              `UPDATE product_colors SET ${sets.join(", ")} WHERE product_id = ? AND color_id = ?`,
            )
            .bind(...binds, params.id, color_id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ ok: true, color_id });
      },

      DELETE: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const url = new URL(request.url);
        const color_id = url.searchParams.get("color_id");
        if (!color_id)
          return Response.json({ error: "color_id_required" }, { status: 400 });
        const db = getDB();
        await db
          .prepare(
            "DELETE FROM product_colors WHERE product_id = ? AND color_id = ?",
          )
          .bind(params.id, color_id)
          .run();
        return Response.json({ ok: true, color_id });
      },

      PUT: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const v = validate(body);
        if (!v.ok) return Response.json({ error: v.reason }, { status: 400 });

        const db = getDB();
        const productExists = await db
          .prepare("SELECT id FROM products WHERE id = ?")
          .bind(params.id)
          .first();
        if (!productExists)
          return Response.json({ error: "product_not_found" }, { status: 404 });

        const stmts = [
          db
            .prepare("DELETE FROM product_colors WHERE product_id = ?")
            .bind(params.id),
          ...v.value.map((c) =>
            db
              .prepare(
                `INSERT INTO product_colors (
                   id, product_id, color_id, label_json, hex,
                   images_json, views_json, tryon_image_url, sort_order, color_family
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              )
              .bind(
                `pc-${params.id}-${c.color_id}`,
                params.id,
                c.color_id,
                JSON.stringify(c.label),
                c.hex,
                JSON.stringify(c.images),
                c.views == null ? null : JSON.stringify(c.views),
                c.tryon_image_url ?? null,
                c.sort_order ?? 0,
                nearestColorFamily(c.hex),
              ),
          ),
        ];
        try {
          await db.batch(stmts);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "save_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ ok: true, count: v.value.length });
      },
    },
  },
});

// GET /api/admin/home-banners — list (incl. inactive)
// PUT /api/admin/home-banners — bulk replace (delete-all + insert)
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

interface BannerInput {
  id?: string;
  slot: number;
  product_id: string;
  image_url: string;
  subtitle_json?: Record<string, string> | null;
  eyebrow_json?: Record<string, string> | null;
  title_json?: Record<string, string> | null;
  sub_json?: Record<string, string> | null;
  active?: boolean;
  sort_order?: number;
}

function parseJsonObj(v: unknown): Record<string, string> | null {
  if (v == null) return null;
  if (typeof v === "object") return v as Record<string, string>;
  if (typeof v !== "string") return null;
  try {
    const parsed = JSON.parse(v);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : null;
  } catch {
    return null;
  }
}

function langMapOrNull(v: unknown): Record<string, string> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string" && val.length > 0) out[k] = val;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function validate(
  items: unknown,
): { ok: true; value: BannerInput[] } | { ok: false; reason: string } {
  if (!Array.isArray(items)) return { ok: false, reason: "expected_array" };
  if (items.length > 8) return { ok: false, reason: "too_many_banners" };
  const seenSlot = new Set<number>();
  const out: BannerInput[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object")
      return { ok: false, reason: "invalid_item" };
    const it = raw as Record<string, unknown>;
    const slot = Number(it.slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > 8)
      return { ok: false, reason: `invalid_slot:${slot}` };
    if (seenSlot.has(slot))
      return { ok: false, reason: `duplicate_slot:${slot}` };
    seenSlot.add(slot);
    const product_id = typeof it.product_id === "string" ? it.product_id : "";
    if (!product_id)
      return { ok: false, reason: `product_id_required:${slot}` };
    const image_url = typeof it.image_url === "string" ? it.image_url : "";
    if (!image_url) return { ok: false, reason: `image_url_required:${slot}` };
    out.push({
      id: typeof it.id === "string" && it.id ? it.id : undefined,
      slot,
      product_id,
      image_url,
      subtitle_json: langMapOrNull(it.subtitle_json),
      eyebrow_json: langMapOrNull(it.eyebrow_json),
      title_json: langMapOrNull(it.title_json),
      sub_json: langMapOrNull(it.sub_json),
      active: it.active === false ? false : true,
      sort_order:
        typeof it.sort_order === "number" && Number.isFinite(it.sort_order)
          ? Math.round(it.sort_order)
          : slot * 10,
    });
  }
  return { ok: true, value: out };
}

export const Route = createFileRoute("/api/admin/home-banners")({
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
        const res = await db
          .prepare(
            `SELECT b.id, b.slot, b.product_id, b.image_url,
                    b.subtitle_json, b.eyebrow_json, b.title_json, b.sub_json,
                    b.active, b.sort_order, b.created_at, b.updated_at,
                    p.slug AS product_slug, p.name_json AS product_name_json,
                    p.price_cents
             FROM home_banners b
             LEFT JOIN products p ON p.id = b.product_id
             ORDER BY b.slot`,
          )
          .all();
        // Parse the *_json columns from raw strings into language maps so the
        // admin client (which types them as Record<string,string>) can render
        // them, and so the PUT round-trip doesn't null-out previously saved
        // copy. The validate() helper on PUT only accepts objects; sending
        // back the raw string from GET would fail that check on save.
        const banners = (res.results ?? []).map((row) => {
          const r = row as Record<string, unknown>;
          return {
            ...r,
            subtitle_json: parseJsonObj(r.subtitle_json),
            eyebrow_json: parseJsonObj(r.eyebrow_json),
            title_json: parseJsonObj(r.title_json),
            sub_json: parseJsonObj(r.sub_json),
          };
        });
        return Response.json({ banners });
      },

      PUT: async ({ request }) => {
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
        const now = Date.now();
        const stmts = [
          db.prepare("DELETE FROM home_banners"),
          ...v.value.map((b) =>
            db
              .prepare(
                `INSERT INTO home_banners (
                   id, slot, product_id, image_url,
                   subtitle_json, eyebrow_json, title_json, sub_json,
                   active, sort_order, created_at, updated_at
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              )
              .bind(
                b.id ?? `hb-${b.slot}`,
                b.slot,
                b.product_id,
                b.image_url,
                b.subtitle_json ? JSON.stringify(b.subtitle_json) : null,
                b.eyebrow_json ? JSON.stringify(b.eyebrow_json) : null,
                b.title_json ? JSON.stringify(b.title_json) : null,
                b.sub_json ? JSON.stringify(b.sub_json) : null,
                b.active === false ? 0 : 1,
                b.sort_order ?? b.slot * 10,
                now,
                now,
              ),
          ),
        ];
        try {
          await db.batch(stmts);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("FOREIGN KEY"))
            return Response.json(
              { error: "product_not_found" },
              { status: 400 },
            );
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

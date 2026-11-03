// GET /api/admin/home-promo-banners — list both promo rows (incl. inactive)
// PUT /api/admin/home-promo-banners — bulk replace (delete-all + insert)
// Two `kind` slots: 'tryon' and 'brand'. Both share the same shape.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const ALLOWED_KINDS = new Set(["tryon", "brand"]);

interface PromoInput {
  id?: string;
  kind: "tryon" | "brand";
  image_url: string | null;
  eyebrow_json: Record<string, string> | null;
  title_json: Record<string, string> | null;
  sub_json: Record<string, string> | null;
  cta_json: Record<string, string> | null;
  link_href: string;
  active?: boolean;
}

function parseJsonObj(v: unknown): Record<string, string> | null {
  if (v == null) return null;
  if (typeof v === "object" && !Array.isArray(v))
    return v as Record<string, string>;
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

function nullableStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function validate(
  items: unknown,
): { ok: true; value: PromoInput[] } | { ok: false; reason: string } {
  if (!Array.isArray(items)) return { ok: false, reason: "expected_array" };
  if (items.length > 2) return { ok: false, reason: "too_many_banners" };
  const seenKind = new Set<string>();
  const out: PromoInput[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object")
      return { ok: false, reason: "invalid_item" };
    const it = raw as Record<string, unknown>;
    const kind = typeof it.kind === "string" ? it.kind : "";
    if (!ALLOWED_KINDS.has(kind))
      return { ok: false, reason: `invalid_kind:${kind}` };
    if (seenKind.has(kind))
      return { ok: false, reason: `duplicate_kind:${kind}` };
    seenKind.add(kind);
    const link_href =
      typeof it.link_href === "string" ? it.link_href.trim() : "";
    if (!link_href) return { ok: false, reason: `link_href_required:${kind}` };
    out.push({
      id: typeof it.id === "string" && it.id ? it.id : undefined,
      kind: kind as "tryon" | "brand",
      image_url: nullableStr(it.image_url),
      eyebrow_json: langMapOrNull(it.eyebrow_json),
      title_json: langMapOrNull(it.title_json),
      sub_json: langMapOrNull(it.sub_json),
      cta_json: langMapOrNull(it.cta_json),
      link_href,
      active: it.active === false ? false : true,
    });
  }
  return { ok: true, value: out };
}

export const Route = createFileRoute("/api/admin/home-promo-banners")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        try {
          const db = getDB();
          const res = await db
            .prepare(
              `SELECT id, kind, image_url, eyebrow_json, title_json,
                      sub_json, cta_json, link_href, active,
                      created_at, updated_at
               FROM home_promo_banners
               ORDER BY kind`,
            )
            .all();
          const banners = (res.results ?? []).map((row) => {
            const r = row as Record<string, unknown>;
            return {
              ...r,
              eyebrow_json: parseJsonObj(r.eyebrow_json),
              title_json: parseJsonObj(r.title_json),
              sub_json: parseJsonObj(r.sub_json),
              cta_json: parseJsonObj(r.cta_json),
              active: r.active === 1 || r.active === true,
            };
          });
          return Response.json({ banners });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "load_failed", message: msg },
            { status: 500 },
          );
        }
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
          db.prepare("DELETE FROM home_promo_banners"),
          ...v.value.map((b) =>
            db
              .prepare(
                `INSERT INTO home_promo_banners (
                   id, kind, image_url, eyebrow_json, title_json,
                   sub_json, cta_json, link_href, active,
                   created_at, updated_at
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              )
              .bind(
                b.id ?? `hpb-${b.kind}`,
                b.kind,
                b.image_url,
                b.eyebrow_json ? JSON.stringify(b.eyebrow_json) : null,
                b.title_json ? JSON.stringify(b.title_json) : null,
                b.sub_json ? JSON.stringify(b.sub_json) : null,
                b.cta_json ? JSON.stringify(b.cta_json) : null,
                b.link_href,
                b.active === false ? 0 : 1,
                now,
                now,
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

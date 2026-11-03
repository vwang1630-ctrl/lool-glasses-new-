// GET /api/admin/home-ugc — list all UGC rows (incl. inactive)
// PUT /api/admin/home-ugc — bulk replace (delete-all + insert)
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

interface UgcInput {
  id?: string;
  slot: number;
  image_url: string | null;
  name: string;
  rating: number;
  text_json: Record<string, string> | null;
  link_href: string | null;
  active?: boolean;
  sort_order?: number;
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
): { ok: true; value: UgcInput[] } | { ok: false; reason: string } {
  if (!Array.isArray(items)) return { ok: false, reason: "expected_array" };
  if (items.length > 12) return { ok: false, reason: "too_many_cards" };
  const seenSlot = new Set<number>();
  const out: UgcInput[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object")
      return { ok: false, reason: "invalid_item" };
    const it = raw as Record<string, unknown>;
    const slot = Number(it.slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > 12)
      return { ok: false, reason: `invalid_slot:${slot}` };
    if (seenSlot.has(slot))
      return { ok: false, reason: `duplicate_slot:${slot}` };
    seenSlot.add(slot);
    const name = typeof it.name === "string" ? it.name.trim() : "";
    if (!name) return { ok: false, reason: `name_required:${slot}` };
    let rating = typeof it.rating === "number" ? it.rating : 5;
    if (!Number.isFinite(rating)) rating = 5;
    if (rating < 0) rating = 0;
    if (rating > 5) rating = 5;
    out.push({
      id: typeof it.id === "string" && it.id ? it.id : undefined,
      slot,
      image_url: nullableStr(it.image_url),
      name,
      rating,
      text_json: langMapOrNull(it.text_json),
      link_href: nullableStr(it.link_href),
      active: it.active === false ? false : true,
      sort_order:
        typeof it.sort_order === "number" && Number.isFinite(it.sort_order)
          ? Math.round(it.sort_order)
          : slot * 10,
    });
  }
  return { ok: true, value: out };
}

export const Route = createFileRoute("/api/admin/home-ugc")({
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
              `SELECT id, slot, image_url, name, rating, text_json, link_href,
                      active, sort_order, created_at, updated_at
               FROM home_ugc
               ORDER BY slot`,
            )
            .all();
          const cards = (res.results ?? []).map((row) => {
            const r = row as Record<string, unknown>;
            return {
              ...r,
              text_json: parseJsonObj(r.text_json),
              active: r.active === 1 || r.active === true,
            };
          });
          return Response.json({ cards });
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
          db.prepare("DELETE FROM home_ugc"),
          ...v.value.map((c) =>
            db
              .prepare(
                `INSERT INTO home_ugc (
                   id, slot, image_url, name, rating, text_json, link_href,
                   active, sort_order, created_at, updated_at
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              )
              .bind(
                c.id ?? `hu-${c.slot}`,
                c.slot,
                c.image_url,
                c.name,
                c.rating,
                c.text_json ? JSON.stringify(c.text_json) : null,
                c.link_href,
                c.active === false ? 0 : 1,
                c.sort_order ?? c.slot * 10,
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

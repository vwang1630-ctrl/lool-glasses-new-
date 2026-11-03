// GET /api/admin/audience-banners — list current 2 images (distance + reading)
// PUT /api/admin/audience-banners — upsert
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const AUDIENCES = ["distance", "reading"] as const;
type Audience = (typeof AUDIENCES)[number];

interface Item {
  audience: Audience;
  image_url: string;
  href: string | null;
}

function validate(
  items: unknown,
): { ok: true; value: Item[] } | { ok: false; reason: string } {
  if (!Array.isArray(items)) return { ok: false, reason: "expected_array" };
  if (items.length > 2) return { ok: false, reason: "too_many_items" };
  const seen = new Set<string>();
  const out: Item[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object")
      return { ok: false, reason: "invalid_item" };
    const it = raw as Record<string, unknown>;
    const audience = it.audience;
    if (
      typeof audience !== "string" ||
      !AUDIENCES.includes(audience as Audience)
    )
      return { ok: false, reason: `invalid_audience:${String(audience)}` };
    if (seen.has(audience))
      return { ok: false, reason: `duplicate_audience:${audience}` };
    seen.add(audience);
    const image_url = typeof it.image_url === "string" ? it.image_url : "";
    if (!image_url)
      return { ok: false, reason: `image_url_required:${audience}` };
    const hrefRaw = typeof it.href === "string" ? it.href.trim() : "";
    out.push({
      audience: audience as Audience,
      image_url,
      href: hrefRaw || null,
    });
  }
  return { ok: true, value: out };
}

export const Route = createFileRoute("/api/admin/audience-banners")({
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
              `SELECT audience, image_url, href, updated_at FROM audience_banners`,
            )
            .all();
          return Response.json({ banners: res.results ?? [] });
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
        const stmts = v.value.map((it) =>
          db
            .prepare(
              `INSERT INTO audience_banners (audience, image_url, href, updated_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(audience) DO UPDATE SET
                 image_url  = excluded.image_url,
                 href       = excluded.href,
                 updated_at = excluded.updated_at`,
            )
            .bind(it.audience, it.image_url, it.href, now),
        );
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

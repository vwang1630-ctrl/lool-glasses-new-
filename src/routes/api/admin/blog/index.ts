// GET  /api/admin/blog  — list (incl. inactive)
// POST /api/admin/blog  — create
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { cleanLangMapInput, parseLangMapColumn } from "@/server/lang";
import { nanoid } from "@/server/ids";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

export const Route = createFileRoute("/api/admin/blog/")({
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
            "SELECT * FROM blog_posts ORDER BY sort_order, published_at DESC, created_at DESC",
          )
          .all();
        const posts = (res.results ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return {
            ...row,
            title: parseLangMapColumn(row.title_json),
            content: parseLangMapColumn(row.content_json),
          };
        });
        return Response.json({ posts });
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

        const cover_image_url = String(body.cover_image_url ?? "").trim();
        if (!cover_image_url)
          return Response.json(
            { error: "cover_image_required" },
            { status: 400 },
          );

        const title_json = cleanLangMapInput(body.title ?? body.title_json);
        if (!title_json)
          return Response.json({ error: "title_required" }, { status: 400 });

        const content_json = cleanLangMapInput(
          body.content ?? body.content_json,
        );
        if (!content_json)
          return Response.json({ error: "content_required" }, { status: 400 });

        const now = Date.now();
        const published_at = Number.isFinite(Number(body.published_at))
          ? Math.round(Number(body.published_at))
          : now;
        const sort_order = Number.isFinite(Number(body.sort_order))
          ? Math.round(Number(body.sort_order))
          : 0;
        const id = `bp-${nanoid(16)}`;

        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO blog_posts (
                 id, slug, cover_image_url, title_json, content_json,
                 published_at, sort_order, active, created_at, updated_at
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              id,
              slug,
              cover_image_url,
              title_json,
              content_json,
              published_at,
              sort_order,
              body.active === false ? 0 : 1,
              now,
              now,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "duplicate_slug" }, { status: 409 });
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

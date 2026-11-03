// GET    /api/admin/blog/:id
// PATCH  /api/admin/blog/:id
// DELETE /api/admin/blog/:id  (soft: active=0; ?hard=1 row delete)
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { cleanLangMapInput, parseLangMapColumn } from "@/server/lang";

const STR = new Set(["cover_image_url", "slug"]);
const INT = new Set(["sort_order", "published_at"]);
const BOOL = new Set(["active"]);
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

export const Route = createFileRoute("/api/admin/blog/$id")({
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
          .prepare("SELECT * FROM blog_posts WHERE id = ?")
          .bind(params.id)
          .first()) as Record<string, unknown> | null;
        if (!row) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({
          post: {
            ...row,
            title: parseLangMapColumn(row.title_json),
            content: parseLangMapColumn(row.content_json),
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
          if (k === "slug") {
            const slug = String(v ?? "").trim();
            if (!SLUG_RE.test(slug))
              return Response.json({ error: "invalid_slug" }, { status: 400 });
            sets.push("slug = ?");
            binds.push(slug);
          } else if (k === "cover_image_url") {
            const url = String(v ?? "").trim();
            if (!url)
              return Response.json(
                { error: "cover_image_required" },
                { status: 400 },
              );
            sets.push("cover_image_url = ?");
            binds.push(url);
          } else if (STR.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v == null ? null : String(v));
          } else if (INT.has(k)) {
            const n =
              typeof v === "number" && Number.isFinite(v)
                ? Math.round(v)
                : Number(v) || null;
            sets.push(`${k} = ?`);
            binds.push(n);
          } else if (BOOL.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v ? 1 : 0);
          } else if (k === "title" || k === "title_json") {
            const json = cleanLangMapInput(v);
            if (!json)
              return Response.json(
                { error: "title_required" },
                { status: 400 },
              );
            sets.push("title_json = ?");
            binds.push(json);
          } else if (k === "content" || k === "content_json") {
            const json = cleanLangMapInput(v);
            if (!json)
              return Response.json(
                { error: "content_required" },
                { status: 400 },
              );
            sets.push("content_json = ?");
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
            .prepare(`UPDATE blog_posts SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "duplicate_slug" }, { status: 409 });
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
            .prepare("DELETE FROM blog_posts WHERE id = ?")
            .bind(params.id)
            .run();
        } else {
          await db
            .prepare(
              "UPDATE blog_posts SET active = 0, updated_at = ? WHERE id = ?",
            )
            .bind(Date.now(), params.id)
            .run();
        }
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

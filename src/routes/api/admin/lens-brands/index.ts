// GET  /api/admin/lens-brands  — list
// POST /api/admin/lens-brands  — create
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { cleanLangMapInput, parseLangMapColumn } from "@/server/lang";

const VALID_TIER = new Set(["budget", "mainstream", "premium", "luxury"]);
const ID_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

export const Route = createFileRoute("/api/admin/lens-brands/")({
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
          .prepare("SELECT * FROM lens_brands ORDER BY sort_order, id")
          .all();
        // Parse the *_json columns server-side so the client gets objects
        // instead of raw strings; avoids the GET-as-string / PATCH-as-object
        // double-stringify bug pattern.
        const brands = (res.results ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return {
            ...row,
            name: parseLangMapColumn(row.name_json),
            description: parseLangMapColumn(row.description_json),
          };
        });
        return Response.json({ brands });
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
        if (!ID_RE.test(id))
          return Response.json({ error: "invalid_id" }, { status: 400 });

        const name_json = cleanLangMapInput(body.name ?? body.name_json);
        if (!name_json)
          return Response.json({ error: "name_required" }, { status: 400 });
        const description_json = cleanLangMapInput(
          body.description ?? body.description_json,
        );

        const tier = body.tier == null ? null : String(body.tier);
        if (tier !== null && !VALID_TIER.has(tier))
          return Response.json({ error: "invalid_tier" }, { status: 400 });

        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO lens_brands (
                 id, name_json, description_json,
                 hero_img_url, tier, active, sort_order
               ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              id,
              name_json,
              description_json,
              body.hero_img_url == null ? null : String(body.hero_img_url),
              tier,
              body.active === false ? 0 : 1,
              Number.isFinite(Number(body.sort_order))
                ? Math.round(Number(body.sort_order))
                : 0,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE") || msg.includes("PRIMARY"))
            return Response.json({ error: "duplicate" }, { status: 409 });
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

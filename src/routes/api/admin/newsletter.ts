// GET /api/admin/newsletter            → { subscribers, total }
// GET /api/admin/newsletter?format=csv → CSV download
// PATCH /api/admin/newsletter { id, status } → subscribe / unsubscribe
// Auth: admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

interface Row {
  id: string;
  email: string;
  locale: string | null;
  source: string | null;
  page_path: string | null;
  country: string | null;
  status: string;
  created_at: number;
  updated_at: number;
}

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const Route = createFileRoute("/api/admin/newsletter")({
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
        const { results } = await getDB()
          .prepare(
            `SELECT id, email, locale, source, page_path, country, status, created_at, updated_at
             FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 5000`,
          )
          .all<Row>();
        const rows: Row[] = (results as Row[] | undefined) ?? [];
        if (url.searchParams.get("format") === "csv") {
          const head = ["email", "status", "locale", "country", "source", "page_path", "created_at"];
          const lines = [head.join(",")].concat(
            rows.map((r: Row) =>
              [
                r.email,
                r.status,
                r.locale,
                r.country,
                r.source,
                r.page_path,
                new Date(r.created_at).toISOString(),
              ]
                .map(csvCell)
                .join(","),
            ),
          );
          return new Response("﻿" + lines.join("\r\n"), {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
              "Cache-Control": "no-store",
            },
          });
        }
        return Response.json(
          { subscribers: rows, total: rows.length },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
      PATCH: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const body = (await request.json().catch(() => ({}))) as {
          id?: string;
          status?: string;
        };
        if (!body.id || (body.status !== "subscribed" && body.status !== "unsubscribed")) {
          return Response.json({ error: "invalid_body" }, { status: 400 });
        }
        await getDB()
          .prepare(`UPDATE newsletter_subscribers SET status = ?, updated_at = ? WHERE id = ?`)
          .bind(body.status, Date.now(), body.id)
          .run();
        return Response.json({ ok: true });
      },
    },
  },
});

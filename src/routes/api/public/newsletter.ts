// POST /api/public/newsletter — footer newsletter sign-up.
// Upserts into newsletter_subscribers (re-subscribing an unsubscribed email
// flips it back). Light per-IP throttle via the Cache API to stop list stuffing.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";
import { clientIp, isCrossOrigin, rateLimited } from "@/server/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const Route = createFileRoute("/api/public/newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }
        if (isCrossOrigin(request)) {
          return Response.json({ error: "forbidden" }, { status: 403 });
        }
        if (await rateLimited("newsletter", clientIp(request), 10, 3600)) {
          return Response.json({ error: "rate_limited" }, { status: 429 });
        }
        const locale = String(body.locale ?? "").slice(0, 8) || null;
        const pagePath = String(body.pagePath ?? "").slice(0, 256) || null;
        const source = String(body.source ?? "footer").slice(0, 32);
        const country = request.headers.get("cf-ipcountry");
        const now = Date.now();
        try {
          await getDB()
            .prepare(
              `INSERT INTO newsletter_subscribers
                 (id, email, locale, source, page_path, country, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, 'subscribed', ?, ?)
               ON CONFLICT(email) DO UPDATE SET
                 status = 'subscribed',
                 locale = COALESCE(excluded.locale, newsletter_subscribers.locale),
                 updated_at = excluded.updated_at`,
            )
            .bind(nanoid(), email, locale, source, pagePath, country, now, now)
            .run();
        } catch (err) {
          console.error("[newsletter] D1 write failed:", err);
          return Response.json({ error: "server_error" }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});

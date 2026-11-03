// POST /api/public/consult-track
// Fire-and-forget beacon for first-party consult-funnel attribution.
// Writes into the consult_events table so the operator system can later join
// consult signals with orders / GSC / GA4 data.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";

const ALLOWED_ACTIONS = new Set(["whatsapp_click", "consult_submit"]);

export const Route = createFileRoute("/api/public/consult-track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        if (!body || typeof body !== "object") {
          return Response.json({ error: "invalid_body" }, { status: 400 });
        }

        const action = String(
          (body as Record<string, unknown>).action ?? "",
        ).trim();
        if (!ALLOWED_ACTIONS.has(action)) {
          return Response.json({ error: "invalid_action" }, { status: 400 });
        }

        const surface = String(
          (body as Record<string, unknown>).surface ?? "unknown",
        ).slice(0, 64);
        const pagePath = String(
          (body as Record<string, unknown>).pagePath ?? "",
        ).slice(0, 256);
        const productSlug = String(
          (body as Record<string, unknown>).productSlug ?? "",
        ).slice(0, 128);
        const locale = String(
          (body as Record<string, unknown>).locale ?? "",
        ).slice(0, 8);
        const note = String((body as Record<string, unknown>).note ?? "").slice(
          0,
          256,
        );

        try {
          const db = getDB();
          await db
            .prepare(
              `INSERT INTO consult_events (id, action, surface, page_path, product_slug, locale, note, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              nanoid(),
              action,
              surface,
              pagePath || null,
              productSlug || null,
              locale || null,
              note || null,
              Date.now(),
            )
            .run();
        } catch (err) {
          console.error("[consult-track] D1 write failed:", err);
          // Never fail the click; return 202 so the client does not retry aggressively.
          return Response.json({ ok: true, queued: false }, { status: 202 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});

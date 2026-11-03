// POST /api/tracker/otp/request
// Body: { email }
// Sends a 6-digit login code via email if the address belongs to an active
// tracker_users row AND ends in @loollook.com. Always returns ok:true regardless
// so the endpoint doesn't leak which addresses are trackers.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requestOtp } from "@/server/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIXED_DELAY_MS = 250;

export const Route = createFileRoute("/api/tracker/otp/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { email?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const email = (body.email ?? "").trim().toLowerCase();
        const startedAt = Date.now();

        if (!EMAIL_RE.test(email) || !email.endsWith("@loollook.com")) {
          await new Promise((r) => setTimeout(r, FIXED_DELAY_MS));
          return Response.json({ ok: true });
        }

        const db = getDB();
        const tracker = await db
          .prepare(
            "SELECT id FROM tracker_users WHERE email = ? AND active = 1",
          )
          .bind(email)
          .first<{ id: string }>();

        if (tracker) {
          try {
            await requestOtp(email, "tracker_login");
          } catch (err) {
            console.error("tracker_login otp send failed:", err);
          }
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed < FIXED_DELAY_MS) {
          await new Promise((r) => setTimeout(r, FIXED_DELAY_MS - elapsed));
        }
        return Response.json({ ok: true });
      },
    },
  },
});

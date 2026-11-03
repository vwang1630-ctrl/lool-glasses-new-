// POST /api/affiliate/otp/request
// Sends a login OTP only when the email belongs to an active affiliate.
// Response is generic to avoid leaking which emails are affiliates.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requestOtp } from "@/server/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIXED_DELAY_MS = 250;

export const Route = createFileRoute("/api/affiliate/otp/request")({
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
        if (!EMAIL_RE.test(email)) {
          await new Promise((r) => setTimeout(r, FIXED_DELAY_MS));
          return Response.json({ ok: true });
        }

        const affiliate = await getDB()
          .prepare(
            "SELECT id FROM affiliates WHERE email = ? AND status = 'active'",
          )
          .bind(email)
          .first<{ id: string }>();

        if (affiliate) {
          try {
            await requestOtp(email, "affiliate_login");
          } catch (err) {
            console.error("affiliate_login otp send failed:", err);
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

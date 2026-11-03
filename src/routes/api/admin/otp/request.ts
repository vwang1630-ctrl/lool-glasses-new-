// POST /api/admin/otp/request
// Body: { email }
// Sends a 6-digit login code via email if the address belongs to an active
// admin. Always returns 200 to avoid leaking which emails are admins
// (timing attack mitigation: fixed delay).

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requestOtp } from "@/server/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIXED_DELAY_MS = 250;

export const Route = createFileRoute("/api/admin/otp/request")({
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

        // Admin domain restriction: @loollook.com only. Always responds ok:true
        // regardless of validity so callers can't enumerate admins.
        if (!EMAIL_RE.test(email) || !email.endsWith("@loollook.com")) {
          await new Promise((r) => setTimeout(r, FIXED_DELAY_MS));
          return Response.json({ ok: true });
        }

        const db = getDB();
        const admin = await db
          .prepare("SELECT id FROM admin_users WHERE email = ? AND active = 1")
          .bind(email)
          .first<{ id: string }>();

        if (admin) {
          // KV write is mandatory. Email failure is tolerated.
          try {
            await requestOtp(email, "admin_login");
          } catch (err) {
            // KV write failed — log but still return ok (security: don't leak admin status)
            console.error("admin_login otp KV write failed:", err);
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

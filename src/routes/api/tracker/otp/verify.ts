// POST /api/tracker/otp/verify
// Body: { email, code }
// Validates a 6-digit OTP issued for tracker_login; on success sets the
// HttpOnly tracker session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { verifyOtp } from "@/server/otp";
import {
  signTrackerSession,
  buildTrackerSessionCookie,
} from "@/server/tracker";
import { writeActorAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;

export const Route = createFileRoute("/api/tracker/otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { email?: string; code?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const email = (body.email ?? "").trim().toLowerCase();
        const code = (body.code ?? "").trim();

        if (!EMAIL_RE.test(email) || !CODE_RE.test(code)) {
          return Response.json({ error: "invalid_input" }, { status: 400 });
        }

        const result = await verifyOtp(email, "tracker_login", code);
        if (!result.ok) {
          return Response.json(
            { error: result.reason ?? "invalid" },
            { status: 401 },
          );
        }

        const db = getDB();
        const tracker = await db
          .prepare(
            "SELECT id, email, name, active FROM tracker_users WHERE email = ?",
          )
          .bind(email)
          .first<{ id: string; email: string; name: string; active: number }>();

        if (!tracker || !tracker.active) {
          return Response.json({ error: "no_tracker" }, { status: 401 });
        }

        const cookie = await signTrackerSession({
          trackerId: tracker.id,
          email: tracker.email,
        });
        await db
          .prepare("UPDATE tracker_users SET last_login_at = ? WHERE id = ?")
          .bind(Date.now(), tracker.id)
          .run();
        await writeActorAudit(request, {
          scope: "tracker",
          actor_id: tracker.id,
          actor_email: tracker.email,
          action: "LOGIN",
          resource_type: "tracker_session",
          resource_id: tracker.id,
        });

        return Response.json(
          {
            ok: true,
            tracker: {
              id: tracker.id,
              email: tracker.email,
              name: tracker.name,
            },
          },
          { headers: { "Set-Cookie": buildTrackerSessionCookie(cookie) } },
        );
      },
    },
  },
});

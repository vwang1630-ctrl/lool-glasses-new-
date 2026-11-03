// POST /api/admin/otp/verify
// Body: { email, code }
// Validates a 6-digit OTP issued for admin_login purpose; on success returns
// the admin profile and sets the HttpOnly admin session cookie (same shape as
// the password-based /api/admin/login).

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { verifyOtp } from "@/server/otp";
import { signSession, buildSessionCookie } from "@/server/admin";
import { writeActorAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;

export const Route = createFileRoute("/api/admin/otp/verify")({
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

        const result = await verifyOtp(email, "admin_login", code);
        if (!result.ok) {
          return Response.json(
            { error: result.reason ?? "invalid" },
            { status: 401 },
          );
        }

        const db = getDB();
        const admin = await db
          .prepare(
            "SELECT id, email, role, active FROM admin_users WHERE email = ?",
          )
          .bind(email)
          .first<{
            id: string;
            email: string;
            role: "owner" | "staff";
            active: number;
          }>();

        if (!admin || !admin.active) {
          return Response.json({ error: "no_admin" }, { status: 401 });
        }

        const cookie = await signSession({
          adminId: admin.id,
          email: admin.email,
        });
        await db
          .prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?")
          .bind(Date.now(), admin.id)
          .run();
        await writeActorAudit(request, {
          scope: "admin",
          actor_id: admin.id,
          actor_email: admin.email,
          action: "LOGIN",
          resource_type: "admin_session",
          resource_id: admin.id,
        });

        return Response.json(
          {
            ok: true,
            admin: { id: admin.id, email: admin.email, role: admin.role },
          },
          { headers: { "Set-Cookie": buildSessionCookie(cookie) } },
        );
      },
    },
  },
});

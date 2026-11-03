// POST /api/affiliate/otp/verify
// Validates affiliate_login OTP, then sets lool_affiliate_session.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { verifyOtp } from "@/server/otp";
import {
  buildAffiliateSessionCookie,
  signAffiliateSession,
} from "@/server/affiliate-session";
import { writeActorAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;

export const Route = createFileRoute("/api/affiliate/otp/verify")({
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

        const result = await verifyOtp(email, "affiliate_login", code);
        if (!result.ok) {
          return Response.json(
            { error: result.reason ?? "invalid" },
            { status: 401 },
          );
        }

        const affiliate = await getDB()
          .prepare(
            "SELECT id, email, role, status FROM affiliates WHERE email = ?",
          )
          .bind(email)
          .first<{ id: string; email: string; role: string; status: string }>();
        if (!affiliate || affiliate.status !== "active") {
          return Response.json(
            { error: "affiliate_not_found" },
            { status: 401 },
          );
        }

        const cookie = await signAffiliateSession({
          affiliateId: affiliate.id,
          email: affiliate.email,
        });
        await writeActorAudit(request, {
          scope: "affiliate",
          actor_id: affiliate.id,
          actor_email: affiliate.email,
          action: "LOGIN",
          resource_type: "affiliate_session",
          resource_id: affiliate.id,
        });
        return Response.json(
          {
            ok: true,
            affiliate: {
              id: affiliate.id,
              email: affiliate.email,
              role: affiliate.role,
            },
          },
          { headers: { "Set-Cookie": buildAffiliateSessionCookie(cookie) } },
        );
      },
    },
  },
});

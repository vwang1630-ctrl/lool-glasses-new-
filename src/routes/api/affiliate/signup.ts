// POST /api/affiliate/signup
// Legacy no-op endpoint. Affiliate access is admin-granted only: a customer
// becomes an affiliate by having an `affiliates` row created in admin.
// Existing affiliates still get their profile back for old clients; missing
// rows are rejected so visitors cannot self-enroll.

import { createFileRoute } from "@tanstack/react-router";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { getDB } from "@/server/db";

export const Route = createFileRoute("/api/affiliate/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const db = getDB();
        const headers = {
          "Set-Cookie": await buildRefreshedAccountCookie(session.email),
        };

        const existing = await db
          .prepare(
            "SELECT id, slug, commission_pct, status FROM affiliates WHERE email = ?",
          )
          .bind(session.email)
          .first<{
            id: string;
            slug: string;
            commission_pct: number;
            status: string;
          }>();
        if (existing) {
          if (existing.status !== "active") {
            return Response.json(
              { error: "affiliate_suspended" },
              { status: 403, headers },
            );
          }
          return Response.json(
            {
              slug: existing.slug,
              commissionPct: existing.commission_pct,
              status: existing.status,
            },
            { headers },
          );
        }

        return Response.json(
          { error: "affiliate_not_enabled" },
          { status: 403, headers },
        );
      },
    },
  },
});

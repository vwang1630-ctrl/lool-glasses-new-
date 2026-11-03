// GET /api/account/me
// Returns the verified email + orders + prescriptions for the cookie-bound
// account. Lets the /account UI restore a fresh tab without re-OTP and lets
// the wizard verify the cookie is still alive. Also rolls the session
// cookie forward (30-day idle window).

import { createFileRoute } from "@tanstack/react-router";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { getAccountData } from "@/server/account-data";
import { getDB } from "@/server/db";
import { resolveAttribution } from "@/server/affiliate-ledger";

type CustomerRefRow = {
  affiliate_ref_slug: string | null;
  affiliate_ref_at: number | null;
};

export const Route = createFileRoute("/api/account/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        const db = getDB();
        const customer = await db
          .prepare(
            "SELECT affiliate_ref_slug, affiliate_ref_at FROM customers WHERE email = ?",
          )
          .bind(session.email)
          .first<CustomerRefRow>();
        const attribution = customer?.affiliate_ref_slug
          ? await resolveAttribution(
              db,
              {
                slug: customer.affiliate_ref_slug,
                writtenAt: customer.affiliate_ref_at ?? Date.now(),
              },
              session.email,
            )
          : null;
        const { orders, prescriptions } = await getAccountData(session.email);
        return Response.json(
          {
            email: session.email,
            orders,
            prescriptions,
            affiliateRef: attribution
              ? {
                  slug: attribution.slug,
                  writtenAt: attribution.attributionAt,
                  discountPct: attribution.customerDiscountPct,
                  discountPercent:
                    Math.round(attribution.customerDiscountPct * 10000) / 100,
                }
              : null,
          },
          {
            headers: {
              "Set-Cookie": await buildRefreshedAccountCookie(session.email),
            },
          },
        );
      },
    },
  },
});

// GET /api/affiliate/ref-info?ref=<slug[.writtenAt]>
// Public, read-only helper for the customer-facing referral discount prompt.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import {
  affiliatePoolPctForSplit,
  parseRefValue,
} from "@/server/affiliate-ledger";

export const Route = createFileRoute("/api/affiliate/ref-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ref = parseRefValue(url.searchParams.get("ref"));
        if (!ref)
          return Response.json({ error: "invalid_ref" }, { status: 400 });

        const row = await getDB()
          .prepare(
            `SELECT a.slug, a.email, a.role, a.status, a.commission_pct,
                    a.customer_discount_pct, a.manager_commission_pct,
                    p.level AS parent_level
               FROM affiliates a
               LEFT JOIN affiliates p ON p.id = a.parent_affiliate_id
              WHERE a.slug = ?`,
          )
          .bind(ref.slug)
          .first<{
            slug: string;
            email: string;
            role: string;
            status: string;
            commission_pct: number;
            customer_discount_pct: number | null;
            manager_commission_pct: number | null;
            parent_level: number | null;
          }>();

        if (!row || row.status !== "active" || row.role !== "l2") {
          return Response.json({ error: "not_found" }, { status: 404 });
        }
        const totalPoolPct = affiliatePoolPctForSplit({
          parentLevel: row.parent_level,
          l1Pct: row.manager_commission_pct ?? 0,
          l2Pct: row.commission_pct,
          customerDiscountPct: row.customer_discount_pct ?? 0,
        });
        const maxDiscountPct = Math.max(
          0,
          totalPoolPct - (row.manager_commission_pct ?? 0) - row.commission_pct,
        );
        const customerDiscountPct = Math.min(
          row.customer_discount_pct ?? 0,
          maxDiscountPct,
        );
        return Response.json({
          slug: row.slug,
          discountPct: customerDiscountPct,
          discountPercent: Math.round(customerDiscountPct * 10000) / 100,
        });
      },
    },
  },
});

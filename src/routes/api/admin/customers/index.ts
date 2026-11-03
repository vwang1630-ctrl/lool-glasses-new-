// GET /api/admin/customers — paginated customer list with referral attribution.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

export const Route = createFileRoute("/api/admin/customers/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }

        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim();
        const limit = Math.min(
          200,
          Math.max(
            1,
            parseInt(url.searchParams.get("limit") ?? "50", 10) || 50,
          ),
        );
        const offset = Math.max(
          0,
          parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
        );

        const conds: string[] = [];
        const binds: unknown[] = [];
        if (q) {
          conds.push("(c.email LIKE ? OR c.affiliate_ref_slug LIKE ?)");
          binds.push(`%${q}%`, `%${q}%`);
        }
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const res = await db
          .prepare(
            `SELECT c.id, c.email, c.affiliate_ref_slug, c.affiliate_ref_at,
                    c.first_order_id, c.first_order_at, c.created_at, c.updated_at,
                    a.email AS affiliate_email,
                    a.role AS affiliate_role,
                    (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count,
                    COALESCE((SELECT SUM(total_cents) FROM orders o
                               WHERE o.customer_id = c.id
                                 AND o.status IN ('paid', 'shipped', 'delivered')), 0) AS paid_total_cents
               FROM customers c
               LEFT JOIN affiliates a ON a.slug = c.affiliate_ref_slug
               ${where}
              ORDER BY c.created_at DESC
              LIMIT ? OFFSET ?`,
          )
          .bind(...binds, limit, offset)
          .all();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM customers c ${where}`)
          .bind(...binds)
          .first<{ n: number }>();

        return Response.json({
          customers: res.results ?? [],
          total: total?.n ?? 0,
          limit,
          offset,
        });
      },
    },
  },
});

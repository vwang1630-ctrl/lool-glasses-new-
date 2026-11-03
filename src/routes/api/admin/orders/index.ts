// GET /api/admin/orders — paginated order list with optional status / search filters.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const VALID_STATUS = new Set([
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

export const Route = createFileRoute("/api/admin/orders/")({
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
        const status = url.searchParams.get("status");
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
        if (status && VALID_STATUS.has(status)) {
          conds.push("status = ?");
          binds.push(status);
        }
        if (q) {
          conds.push("(order_number LIKE ? OR email LIKE ?)");
          binds.push(`%${q}%`, `%${q}%`);
        }
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const sql = `SELECT id, order_number, email, status, content_lang,
                            subtotal_cents, shipping_cents, tax_cents, total_cents, currency,
                            ship_recipient, ship_country, payment_provider, paid_at,
                            shipped_at, delivered_at, cancelled_at, created_at
                     FROM orders ${where}
                     ORDER BY created_at DESC
                     LIMIT ? OFFSET ?`;
        const res = await db
          .prepare(sql)
          .bind(...binds, limit, offset)
          .all();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM orders ${where}`)
          .bind(...binds)
          .first<{ n: number }>();

        return Response.json({
          orders: res.results ?? [],
          total: total?.n ?? 0,
          limit,
          offset,
        });
      },
    },
  },
});

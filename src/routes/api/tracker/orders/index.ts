// GET /api/tracker/orders
//
// Lists orders that the tracker portal can act on — status='paid' (waiting to
// be claimed and crafted) or status='processing' (claimed and in-progress).
// Once an order ships it leaves this list per product spec.
//
// Each row carries enough to decide what to do next:
//   - claim status (tracker_id NULL = unclaimed; non-NULL = locked to a tracker)
//   - the assigning tracker's name so the UI can show "由 X 处理中"
//   - item count + first item summary (product name + frame color) for a
//     quick visual scan without having to open the detail page
//
// NO PRICES of any kind in this response. The tracker is internal staff, but
// per spec they should not see retail / cost numbers. Filter happens at the
// SELECT level — we don't even read the *_cents columns from D1.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";
import { parseLangJson } from "@/lib/lang";

interface OrderListRow {
  id: string;
  order_number: string;
  status: string;
  email: string;
  ship_country: string;
  ship_recipient: string;
  paid_at: number | null;
  created_at: number;
  tracker_id: string | null;
  tracker_assigned_at: number | null;
  tracker_name: string | null;
  item_count: number;
  first_product_name_json: string | null;
}

export const Route = createFileRoute("/api/tracker/orders/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireTracker(request);
        } catch (resp) {
          return resp as Response;
        }
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT
               o.id                        AS id,
               o.order_number              AS order_number,
               o.status                    AS status,
               o.email                     AS email,
               o.ship_country              AS ship_country,
               o.ship_recipient            AS ship_recipient,
               o.paid_at                   AS paid_at,
               o.created_at                AS created_at,
               o.tracker_id                AS tracker_id,
               o.tracker_assigned_at       AS tracker_assigned_at,
               tu.name                     AS tracker_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count,
               (SELECT p.name_json
                  FROM order_items oi
                  JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = o.id
                 ORDER BY oi.id LIMIT 1)   AS first_product_name_json
             FROM orders o
             LEFT JOIN tracker_users tu ON tu.id = o.tracker_id
             WHERE o.status IN ('paid', 'processing')
             ORDER BY o.paid_at ASC, o.created_at ASC`,
          )
          .all<OrderListRow>();

        const orders = (res.results ?? []).map((r) => ({
          id: r.id,
          orderNumber: r.order_number,
          status: r.status,
          email: r.email,
          shipCountry: r.ship_country,
          shipRecipient: r.ship_recipient,
          paidAt: r.paid_at,
          createdAt: r.created_at,
          tracker:
            r.tracker_id != null
              ? {
                  id: r.tracker_id,
                  name: r.tracker_name ?? "—",
                  assignedAt: r.tracker_assigned_at,
                }
              : null,
          itemCount: r.item_count,
          firstProductName: parseLangJson(r.first_product_name_json),
        }));

        return Response.json({ orders });
      },
    },
  },
});

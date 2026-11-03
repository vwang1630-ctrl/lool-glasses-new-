// GET  /api/admin/shipments — paginated shipment list, JOIN orders for order_number/email.
// POST /api/admin/shipments — create shipment row for an order.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { nanoid } from "@/server/ids";

const VALID_STATUS = new Set([
  "pending",
  "in-transit",
  "delivered",
  "returned",
]);

export const Route = createFileRoute("/api/admin/shipments/")({
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
          conds.push("s.status = ?");
          binds.push(status);
        }
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const sql = `SELECT s.id, s.order_id, s.carrier, s.tracking_number, s.status,
                            s.shipped_at, s.delivered_at, s.created_at, s.updated_at,
                            s.logistics_agent_id,
                            a.agent_name,
                            a.contact_person,
                            o.order_number, o.email, o.ship_country
                     FROM shipments s
                     LEFT JOIN orders o ON o.id = s.order_id
                     LEFT JOIN logistics_agent a ON a.id = s.logistics_agent_id
                     ${where}
                     ORDER BY s.created_at DESC
                     LIMIT ? OFFSET ?`;
        const res = await db
          .prepare(sql)
          .bind(...binds, limit, offset)
          .all();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM shipments s ${where}`)
          .bind(...binds)
          .first<{ n: number }>();
        return Response.json({
          shipments: res.results ?? [],
          total: total?.n ?? 0,
          limit,
          offset,
        });
      },

      POST: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const order_id = String(body.order_id ?? "").trim();
        if (!order_id)
          return Response.json({ error: "order_id_required" }, { status: 400 });
        const status =
          typeof body.status === "string" ? body.status : "pending";
        if (!VALID_STATUS.has(status))
          return Response.json({ error: "invalid_status" }, { status: 400 });
        const carrier =
          body.carrier == null ? null : String(body.carrier).trim() || null;
        const logistics_agent_id =
          body.logistics_agent_id == null
            ? null
            : String(body.logistics_agent_id).trim() || null;
        const tracking_number =
          body.tracking_number == null
            ? null
            : String(body.tracking_number).trim() || null;

        const id = `sh-${nanoid()}`;
        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO shipments (id, order_id, carrier, logistics_agent_id, tracking_number, status)
               VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              id,
              order_id,
              carrier,
              logistics_agent_id,
              tracking_number,
              status,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("FOREIGN KEY"))
            return Response.json({ error: "order_not_found" }, { status: 400 });
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ id, order_id });
      },
    },
  },
});

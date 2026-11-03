// POST /api/tracker/orders/:id/ship
// Body: { agentId, trackingNumber }
//
// Marks the order shipped: every order_items.fulfillment_status='shipped',
// orders.status='shipped', orders.shipped_at=now, and inserts one shipments
// row carrying the logistics agent + carrier + tracking number. Requires:
//   - order claimed by the calling tracker
//   - order currently in 'processing'
//   - EVERY order_items.fulfillment_status = 'packed'
// Per the user's decision the whole order ships as a single package; the
// pre-flight "all packed" check is what stops a tracker from shipping while
// some items are still in the workshop.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";
import { nanoid } from "@/server/ids";
import { writeTrackerAudit } from "@/server/audit";

export const Route = createFileRoute("/api/tracker/orders/$id/ship")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        let me;
        try {
          me = await requireTracker(request);
        } catch (resp) {
          return resp as Response;
        }
        let body: {
          agentId?: string;
          carrier?: string;
          trackingNumber?: string;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const agentId = (body.agentId ?? "").trim();
        const trackingNumber = (body.trackingNumber ?? "").trim();
        if (!agentId) {
          return Response.json({ error: "agent_required" }, { status: 400 });
        }
        if (!trackingNumber) {
          return Response.json(
            { error: "tracking_number_required" },
            { status: 400 },
          );
        }

        const db = getDB();
        const now = Date.now();

        const agent = await db
          .prepare(
            `SELECT a.id, s.name_en, s.name_zh
             FROM logistics_agent a
             JOIN suppliers s ON s.id = a.supplier_id AND s.active = 1 AND s.kind = 'logistics'
             WHERE a.id = ? AND a.active = 1`,
          )
          .bind(agentId)
          .first<{ id: string; name_en: string; name_zh: string }>();
        if (!agent) {
          return Response.json({ error: "agent_not_found" }, { status: 400 });
        }
        const carrier = agent.name_en || agent.name_zh;

        // Pre-flight: any item not yet packed → 409 with the count so the
        // UI can say "still N items to pack" instead of a generic failure.
        const unpacked = await db
          .prepare(
            `SELECT COUNT(*) AS n
               FROM order_items
              WHERE order_id = ?
                AND COALESCE(fulfillment_status, 'pending') != 'packed'`,
          )
          .bind(params.id)
          .first<{ n: number }>();
        if ((unpacked?.n ?? 0) > 0) {
          return Response.json(
            { error: "items_not_all_packed", unpackedCount: unpacked?.n ?? 0 },
            { status: 409 },
          );
        }

        // Flip the order; if no row matches, we never insert the shipment.
        const upd = await db
          .prepare(
            `UPDATE orders
             SET status = 'shipped', shipped_at = ?, updated_at = ?
             WHERE id = ?
               AND status = 'processing'
               AND tracker_id = ?`,
          )
          .bind(now, now, params.id, me.id)
          .run();
        if (!upd.meta.changes) {
          return Response.json(
            { error: "not_claimed_by_you_or_not_processing" },
            { status: 409 },
          );
        }

        // Drag each item to 'shipped' too — the per-item state isn't strictly
        // load-bearing once the order is shipped, but keeping it consistent
        // makes the historical view honest.
        await db
          .prepare(
            `UPDATE order_items SET fulfillment_status = 'shipped' WHERE order_id = ?`,
          )
          .bind(params.id)
          .run();

        const shipmentId = `sh-${nanoid()}`;
        try {
          await db
            .prepare(
              `INSERT INTO shipments
                 (id, order_id, carrier, logistics_agent_id, tracking_number, status, shipped_at)
               VALUES (?, ?, ?, ?, ?, 'in-transit', ?)`,
            )
            .bind(shipmentId, params.id, carrier, agentId, trackingNumber, now)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "shipment_insert_failed", message: msg },
            { status: 500 },
          );
        }

        await writeTrackerAudit(request, {
          action: "POST",
          resource_type: "shipment",
          resource_id: shipmentId,
          after: {
            order_id: params.id,
            carrier,
            logistics_agent_id: agentId,
            tracking_number: trackingNumber,
            status: "in-transit",
          },
        });
        return Response.json({ ok: true, shipmentId });
      },
    },
  },
});

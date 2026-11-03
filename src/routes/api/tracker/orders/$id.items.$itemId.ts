// POST /api/tracker/orders/:id/items/:itemId
// Body: { action: 'start' | 'pack' | 'revert' }
//
// Per-item fulfillment progression. The order-level status is a roll-up:
// the first time any item moves into in_progress, orders.status flips from
// 'paid' to 'processing'. orders.status doesn't go back to 'paid' on revert.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";
import { writeTrackerAudit } from "@/server/audit";

type Action = "start" | "pack" | "revert";
const VALID: ReadonlySet<Action> = new Set(["start", "pack", "revert"]);

// status transitions allowed per action
const NEXT: Record<Action, { from: string[]; to: string }> = {
  start: { from: ["pending"], to: "in_progress" },
  pack: { from: ["in_progress"], to: "packed" },
  revert: { from: ["in_progress", "packed"], to: "pending" },
};

export const Route = createFileRoute("/api/tracker/orders/$id/items/$itemId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        let me;
        try {
          me = await requireTracker(request);
        } catch (resp) {
          return resp as Response;
        }
        let body: { action?: Action };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const action = body.action as Action | undefined;
        if (!action || !VALID.has(action)) {
          return Response.json({ error: "invalid_action" }, { status: 400 });
        }

        const db = getDB();
        const now = Date.now();
        const { from: allowedFrom, to } = NEXT[action];
        const fromPlaceholders = allowedFrom.map(() => "?").join(",");

        // Single UPDATE gated on:
        //  - the order belongs to this tracker (claimed by them)
        //  - the order is still in paid/processing (not shipped)
        //  - the item's current fulfillment_status is in the allowed-from set
        // The two SELECTs that follow are only for the rollup decision; if
        // the UPDATE didn't change anything we abort with 409.
        const upd = await db
          .prepare(
            `UPDATE order_items
             SET fulfillment_status = ?
             WHERE id = ?
               AND order_id = ?
               AND COALESCE(fulfillment_status, 'pending') IN (${fromPlaceholders})
               AND EXISTS (
                 SELECT 1 FROM orders o
                  WHERE o.id = order_items.order_id
                    AND o.tracker_id = ?
                    AND o.status IN ('paid', 'processing')
               )`,
          )
          .bind(to, params.itemId, params.id, ...allowedFrom, me.id)
          .run();
        if (!upd.meta.changes) {
          return Response.json(
            { error: "wrong_state_or_not_yours" },
            { status: 409 },
          );
        }

        // Roll up: any item in_progress → order.status='processing'. This
        // only moves the order forward, never backward (a single revert
        // doesn't drag the whole order back to 'paid').
        if (to === "in_progress") {
          await db
            .prepare(
              `UPDATE orders
               SET status = 'processing', updated_at = ?
               WHERE id = ? AND status = 'paid'`,
            )
            .bind(now, params.id)
            .run();
        }

        await writeTrackerAudit(request, {
          action: "PATCH",
          resource_type: "order_item",
          resource_id: params.itemId,
          after: { order_id: params.id, fulfillment_status: to },
          meta: { action },
        });
        return Response.json({ ok: true, status: to });
      },
    },
  },
});

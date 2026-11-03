// POST /api/tracker/orders/:id/claim
// Atomically assigns tracker_id = me, only if currently NULL.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";
import { writeTrackerAudit } from "@/server/audit";

export const Route = createFileRoute("/api/tracker/orders/$id/claim")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        let me;
        try {
          me = await requireTracker(request);
        } catch (resp) {
          return resp as Response;
        }
        const db = getDB();
        const now = Date.now();
        const res = await db
          .prepare(
            `UPDATE orders
             SET tracker_id = ?, tracker_assigned_at = ?, updated_at = ?
             WHERE id = ?
               AND tracker_id IS NULL
               AND status IN ('paid', 'processing')`,
          )
          .bind(me.id, now, now, params.id)
          .run();
        if (!res.meta.changes) {
          // Either order doesn't exist, was already claimed by someone else,
          // or has moved past processing.
          return Response.json(
            { error: "already_claimed_or_unavailable" },
            { status: 409 },
          );
        }
        await writeTrackerAudit(request, {
          action: "POST",
          resource_type: "tracker_order_claim",
          resource_id: params.id,
          after: { tracker_id: me.id, tracker_assigned_at: now },
        });
        return Response.json({ ok: true });
      },
    },
  },
});

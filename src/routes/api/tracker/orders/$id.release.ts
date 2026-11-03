// POST /api/tracker/orders/:id/release
// Releases the order back to the unclaimed pool. Only the current claimer can
// release; admin will get a separate path if we need force-release later.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";
import { writeTrackerAudit } from "@/server/audit";

export const Route = createFileRoute("/api/tracker/orders/$id/release")({
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
             SET tracker_id = NULL, tracker_assigned_at = NULL, updated_at = ?
             WHERE id = ?
               AND tracker_id = ?
               AND status = 'paid'`,
          )
          .bind(now, params.id, me.id)
          .run();
        if (!res.meta.changes) {
          return Response.json(
            { error: "not_yours_or_processing_started" },
            { status: 409 },
          );
        }
        await writeTrackerAudit(request, {
          action: "POST",
          resource_type: "tracker_order_release",
          resource_id: params.id,
          after: {
            tracker_id: null,
            tracker_assigned_at: null,
            updated_at: now,
          },
        });
        return Response.json({ ok: true });
      },
    },
  },
});

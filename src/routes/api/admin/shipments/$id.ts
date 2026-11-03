// PATCH  /api/admin/shipments/:id   — update status / logistics_agent / tracking_number;
//                                      auto-stamps shipped_at / delivered_at on transition.
// DELETE /api/admin/shipments/:id   — remove shipment row (rare; usually flip status instead).
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const VALID_STATUS = new Set([
  "pending",
  "in-transit",
  "delivered",
  "returned",
]);

const STATUS_TIMESTAMP_COL: Record<string, string | null> = {
  "in-transit": "shipped_at",
  delivered: "delivered_at",
  pending: null,
  returned: null,
};

export const Route = createFileRoute("/api/admin/shipments/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
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

        const sets: string[] = [];
        const binds: unknown[] = [];

        if (typeof body.status === "string") {
          if (!VALID_STATUS.has(body.status))
            return Response.json({ error: "invalid_status" }, { status: 400 });
          sets.push("status = ?");
          binds.push(body.status);
          const tsCol = STATUS_TIMESTAMP_COL[body.status];
          if (tsCol) {
            sets.push(`${tsCol} = COALESCE(${tsCol}, ?)`);
            binds.push(Date.now());
          }
        }
        if ("carrier" in body) {
          sets.push("carrier = ?");
          binds.push(
            body.carrier == null ? null : String(body.carrier).trim() || null,
          );
        }
        if ("logistics_agent_id" in body) {
          sets.push("logistics_agent_id = ?");
          binds.push(
            body.logistics_agent_id == null
              ? null
              : String(body.logistics_agent_id).trim() || null,
          );
        }
        if ("tracking_number" in body) {
          sets.push("tracking_number = ?");
          binds.push(
            body.tracking_number == null
              ? null
              : String(body.tracking_number).trim() || null,
          );
        }

        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });

        sets.push("updated_at = ?");
        binds.push(Date.now());

        const db = getDB();
        try {
          await db
            .prepare(`UPDATE shipments SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ ok: true, id: params.id });
      },

      DELETE: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        await db
          .prepare("DELETE FROM shipments WHERE id = ?")
          .bind(params.id)
          .run();
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

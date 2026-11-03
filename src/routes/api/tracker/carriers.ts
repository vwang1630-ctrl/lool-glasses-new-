// GET /api/tracker/carriers
//
// Returns active logistics agent routes as a lightweight pick-list for the
// tracker ship form. The tracker picks a concrete route like "DHL — 张三",
// not a carrier alone.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";

export const Route = createFileRoute("/api/tracker/carriers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireTracker(request);
        } catch (resp) {
          return resp as Response;
        }
        const db = getDB();
        const agents = await db
          .prepare(
            `SELECT
               a.id AS agent_id,
               a.agent_name,
               a.contact_person,
               a.phone,
               a.email,
               s.id AS supplier_id,
               s.name_zh AS supplier_name_zh,
               s.name_en AS supplier_name_en
             FROM logistics_agent a
             JOIN suppliers s ON s.id = a.supplier_id AND s.active = 1 AND s.kind = 'logistics'
             WHERE a.active = 1
             ORDER BY s.sort_order, s.name_zh, a.sort_order, a.agent_name`,
          )
          .all();
        return Response.json({
          agents: agents.results ?? [],
          carriers: agents.results ?? [],
        });
      },
    },
  },
});

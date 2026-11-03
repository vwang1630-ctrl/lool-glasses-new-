// GET /api/admin/logistics-contacts/pairs
//   Returns active logistics_agent rows. Each row is a single dropdown choice
//   on shipment/tracker pages: "DHL — 张三".
//
//   Filters: only active suppliers (kind='logistics') × active agents.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

export const Route = createFileRoute("/api/admin/logistics-contacts/pairs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT
               a.id   AS agent_id,
               s.id   AS supplier_id,
               s.name_en AS supplier_name_en,
               s.name_zh AS supplier_name_zh,
               a.agent_name,
               a.contact_person,
               a.phone AS contact_phone,
               a.email AS contact_email
             FROM logistics_agent a
             JOIN suppliers s ON s.id = a.supplier_id AND s.active = 1 AND s.kind = 'logistics'
             WHERE a.active = 1
             ORDER BY s.sort_order, s.name_en, a.sort_order, a.agent_name`,
          )
          .all();
        return Response.json({ pairs: res.results ?? [] });
      },
    },
  },
});

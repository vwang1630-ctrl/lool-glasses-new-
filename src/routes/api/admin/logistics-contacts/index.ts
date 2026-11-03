// GET  /api/admin/logistics-contacts          — list logistics agent routes.
// POST /api/admin/logistics-contacts          — create one carrier-agent route.
// Kept at the existing route path for UI compatibility; the backing table is
// logistics_agent.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { nanoid } from "@/server/ids";

const ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

export const Route = createFileRoute("/api/admin/logistics-contacts/")({
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
        const includeInactive = url.searchParams.get("inactive") === "1";
        const where = includeInactive ? "" : "WHERE active = 1";

        const db = getDB();
        const agents = await db
          .prepare(
            `SELECT a.id, a.supplier_id, a.agent_name, a.contact_person, a.phone, a.email,
                    a.notes, a.active, a.sort_order, a.created_at, a.updated_at,
                    s.name_zh AS supplier_name_zh, s.name_en AS supplier_name_en
             FROM logistics_agent a
             JOIN suppliers s ON s.id = a.supplier_id
             ${where ? where.replace("active", "a.active") : ""}
             ORDER BY a.sort_order, s.sort_order, a.agent_name`,
          )
          .all<{
            id: string;
            supplier_id: string;
            agent_name: string;
            contact_person: string | null;
            phone: string | null;
            email: string | null;
            notes: string | null;
            active: number;
            sort_order: number;
            created_at: number;
            updated_at: number;
            supplier_name_zh: string;
            supplier_name_en: string;
          }>();
        return Response.json({
          agents: agents.results ?? [],
          contacts: agents.results ?? [],
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

        const supplierId = String(body.supplier_id ?? "").trim();
        if (!supplierId)
          return Response.json(
            { error: "supplier_id_required" },
            { status: 400 },
          );
        const agentName = String(body.agent_name ?? body.name ?? "").trim();
        if (!agentName)
          return Response.json(
            { error: "agent_name_required" },
            { status: 400 },
          );
        // Optional caller-supplied id; otherwise auto-generate.
        let id = String(body.id ?? "")
          .trim()
          .toLowerCase();
        if (id && !ID_RE.test(id))
          return Response.json({ error: "invalid_id" }, { status: 400 });
        if (!id) id = `la-${nanoid(12)}`;

        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO logistics_agent
                 (id, supplier_id, agent_name, contact_person, phone, email, notes, active, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              id,
              supplierId,
              agentName,
              body.contact_person == null
                ? agentName
                : String(body.contact_person).trim() || null,
              body.phone == null ? null : String(body.phone).trim() || null,
              body.email == null ? null : String(body.email).trim() || null,
              body.notes == null ? null : String(body.notes).trim() || null,
              body.active === false ? 0 : 1,
              Number.isFinite(Number(body.sort_order))
                ? Math.round(Number(body.sort_order))
                : 0,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE") || msg.includes("PRIMARY KEY"))
            return Response.json({ error: "id_taken" }, { status: 409 });
          if (msg.includes("FOREIGN KEY"))
            return Response.json(
              { error: "supplier_not_found" },
              { status: 400 },
            );
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }

        return Response.json({ id });
      },
    },
  },
});

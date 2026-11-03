// GET  /api/admin/admin-users — list (no password_hash returned)
// POST /api/admin/admin-users — create new admin user
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { nanoid } from "@/server/ids";
import { writeAudit } from "@/server/audit";

// Schema CHECK constraint limits role to owner|staff. Expand via migration if more roles are added later.
const VALID_ROLE = new Set(["owner", "staff"]);

export const Route = createFileRoute("/api/admin/admin-users/")({
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
            `SELECT id, email, role, active, last_login_at, created_at, updated_at
             FROM admin_users ORDER BY created_at DESC`,
          )
          .all();
        return Response.json({ users: res.results ?? [] });
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
        const email = String(body.email ?? "")
          .trim()
          .toLowerCase();
        const role = String(body.role ?? "");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          return Response.json({ error: "invalid_email" }, { status: 400 });
        if (!email.endsWith("@loollook.com"))
          return Response.json({ error: "domain_required" }, { status: 400 });
        if (!VALID_ROLE.has(role))
          return Response.json({ error: "invalid_role" }, { status: 400 });

        const id = nanoid();
        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO admin_users (id, email, role, active) VALUES (?, ?, ?, 1)`,
            )
            .bind(id, email, role)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE"))
            return Response.json({ error: "email_taken" }, { status: 409 });
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        await writeAudit(request, {
          action: "POST",
          resource_type: "admin_users",
          resource_id: id,
          after: { email, role },
        });
        return Response.json({ id, email });
      },
    },
  },
});

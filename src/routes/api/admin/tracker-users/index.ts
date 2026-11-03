// GET  /api/admin/tracker-users — list tracker users
// POST /api/admin/tracker-users — create a new tracker user
// Auth: requires admin session cookie. Writes to tracker_users which backs the
// /tracker portal login (OTP-only, @loollook.com).

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { nanoid } from "@/server/ids";
import { writeAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/admin/tracker-users/")({
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
            `SELECT id, email, name, active, last_login_at, created_at, updated_at
             FROM tracker_users ORDER BY created_at DESC`,
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
        const name = String(body.name ?? "").trim();
        if (!EMAIL_RE.test(email))
          return Response.json({ error: "invalid_email" }, { status: 400 });
        if (!email.endsWith("@loollook.com"))
          return Response.json({ error: "domain_required" }, { status: 400 });
        if (!name)
          return Response.json({ error: "name_required" }, { status: 400 });

        const id = nanoid();
        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO tracker_users (id, email, name, active) VALUES (?, ?, ?, 1)`,
            )
            .bind(id, email, name)
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
          resource_type: "tracker_users",
          resource_id: id,
          after: { email, name },
        });
        return Response.json({ id, email, name });
      },
    },
  },
});

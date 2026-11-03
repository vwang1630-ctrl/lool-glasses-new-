// PATCH  /api/admin/tracker-users/:id  — update name / active
// DELETE /api/admin/tracker-users/:id  — soft deactivate, or hard delete with ?hard=1
// Auth: requires admin session cookie. (No password fields — OTP-only login.)

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";

export const Route = createFileRoute("/api/admin/tracker-users/$id")({
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

        if (typeof body.name === "string") {
          const name = body.name.trim();
          if (!name)
            return Response.json({ error: "name_required" }, { status: 400 });
          sets.push("name = ?");
          binds.push(name);
        }
        if ("active" in body) {
          sets.push("active = ?");
          binds.push(body.active ? 1 : 0);
        }
        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });

        const db = getDB();
        const target = await db
          .prepare("SELECT email, name, active FROM tracker_users WHERE id = ?")
          .bind(params.id)
          .first<{ email: string; name: string; active: number }>();
        if (!target)
          return Response.json({ error: "not_found" }, { status: 404 });

        sets.push("updated_at = ?");
        binds.push(Date.now());
        try {
          await db
            .prepare(`UPDATE tracker_users SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }
        await writeAudit(request, {
          action: "PATCH",
          resource_type: "tracker_users",
          resource_id: params.id,
          before: target,
          after: body,
        });
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
        const target = await db
          .prepare("SELECT email, name, active FROM tracker_users WHERE id = ?")
          .bind(params.id)
          .first<{ email: string; name: string; active: number }>();
        if (!target)
          return Response.json({ error: "not_found" }, { status: 404 });

        const url = new URL(request.url);
        const hard = url.searchParams.get("hard") === "1";
        if (hard) {
          await db
            .prepare("DELETE FROM tracker_users WHERE id = ?")
            .bind(params.id)
            .run();
        } else {
          await db
            .prepare(
              "UPDATE tracker_users SET active = 0, updated_at = ? WHERE id = ?",
            )
            .bind(Date.now(), params.id)
            .run();
        }
        await writeAudit(request, {
          action: "DELETE",
          resource_type: "tracker_users",
          resource_id: params.id,
          before: target,
          meta: { hard },
        });
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

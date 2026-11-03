// PATCH  /api/admin/admin-users/:id  — update role / active / password
// DELETE /api/admin/admin-users/:id  — soft (active=0) or ?hard=1 row delete
// Auth: requires admin session cookie. Refuses to deactivate / delete the last active owner.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";

// Schema CHECK constraint limits role to owner|staff.
const VALID_ROLE = new Set(["owner", "staff"]);

async function ownerCount(db: D1Database): Promise<number> {
  const r = await db
    .prepare(
      "SELECT COUNT(*) AS n FROM admin_users WHERE role = 'owner' AND active = 1",
    )
    .first<{ n: number }>();
  return r?.n ?? 0;
}

export const Route = createFileRoute("/api/admin/admin-users/$id")({
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

        if (typeof body.role === "string") {
          if (!VALID_ROLE.has(body.role))
            return Response.json({ error: "invalid_role" }, { status: 400 });
          sets.push("role = ?");
          binds.push(body.role);
        }
        if ("active" in body) {
          sets.push("active = ?");
          binds.push(body.active ? 1 : 0);
        }
        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });

        const db = getDB();

        const target = await db
          .prepare("SELECT role, active FROM admin_users WHERE id = ?")
          .bind(params.id)
          .first<{ role: string; active: number }>();
        if (!target)
          return Response.json({ error: "not_found" }, { status: 404 });
        if (target.role === "owner" && target.active === 1) {
          const numOwners = await ownerCount(db);
          if (numOwners <= 1) {
            const becomingInactive = "active" in body && !body.active;
            const changingRole =
              typeof body.role === "string" && body.role !== "owner";
            if (becomingInactive || changingRole)
              return Response.json(
                {
                  error: "last_owner_protected",
                  message: "Cannot demote / deactivate the last active owner.",
                },
                { status: 409 },
              );
          }
        }

        sets.push("updated_at = ?");
        binds.push(Date.now());
        try {
          await db
            .prepare(`UPDATE admin_users SET ${sets.join(", ")} WHERE id = ?`)
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
          resource_type: "admin_users",
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
          .prepare("SELECT role, active FROM admin_users WHERE id = ?")
          .bind(params.id)
          .first<{ role: string; active: number }>();
        if (!target)
          return Response.json({ error: "not_found" }, { status: 404 });
        if (target.role === "owner" && target.active === 1) {
          const numOwners = await ownerCount(db);
          if (numOwners <= 1)
            return Response.json(
              { error: "last_owner_protected" },
              { status: 409 },
            );
        }
        const url = new URL(request.url);
        const hard = url.searchParams.get("hard") === "1";
        if (hard) {
          await db
            .prepare("DELETE FROM admin_users WHERE id = ?")
            .bind(params.id)
            .run();
        } else {
          await db
            .prepare(
              "UPDATE admin_users SET active = 0, updated_at = ? WHERE id = ?",
            )
            .bind(Date.now(), params.id)
            .run();
        }
        await writeAudit(request, {
          action: "DELETE",
          resource_type: "admin_users",
          resource_id: params.id,
          before: target,
          meta: { hard },
        });
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

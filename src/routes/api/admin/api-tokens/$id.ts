// DELETE /api/admin/api-tokens/:id — soft-revoke an API token.
// Row is kept (for audit of last_used_at / created_at); revoked_at set so
// the Bearer auth path in src/server/admin.ts ignores it going forward.
// Auth: requires admin session cookie or Bearer token.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";

export const Route = createFileRoute("/api/admin/api-tokens/$id")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        let me;
        try {
          me = await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        const existing = await db
          .prepare(
            "SELECT id, admin_user_id, name, revoked_at FROM admin_api_tokens WHERE id = ?",
          )
          .bind(params.id)
          .first<{
            id: string;
            admin_user_id: string;
            name: string;
            revoked_at: number | null;
          }>();
        if (!existing) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }
        // Owners can revoke any token; staff only their own.
        if (me.role !== "owner" && existing.admin_user_id !== me.id) {
          return Response.json({ error: "forbidden" }, { status: 403 });
        }
        if (existing.revoked_at !== null) {
          return Response.json({ ok: true, already: true, id: params.id });
        }

        const now = Date.now();
        await db
          .prepare("UPDATE admin_api_tokens SET revoked_at = ? WHERE id = ?")
          .bind(now, params.id)
          .run();

        await writeAudit(request, {
          action: "DELETE",
          resource_type: "admin_api_tokens",
          resource_id: params.id,
          before: {
            name: existing.name,
            admin_user_id: existing.admin_user_id,
          },
        });
        return Response.json({ ok: true, id: params.id, revoked_at: now });
      },
    },
  },
});

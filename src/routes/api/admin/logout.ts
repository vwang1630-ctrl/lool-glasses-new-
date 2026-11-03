// POST /api/admin/logout
// Clear the session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { buildClearCookie, requireAdmin } from "@/server/admin";
import { writeActorAudit } from "@/server/audit";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const admin = await requireAdmin(request);
          await writeActorAudit(request, {
            scope: "admin",
            actor_id: admin.id,
            actor_email: admin.email,
            action: "LOGOUT",
            resource_type: "admin_session",
            resource_id: admin.id,
          });
        } catch {
          /* logout should still clear stale cookies */
        }
        return Response.json(
          { ok: true },
          { headers: { "Set-Cookie": buildClearCookie() } },
        );
      },
    },
  },
});

// GET /api/admin/me
// Verify session cookie and return the current admin user.
// Frontend admin shell calls this on boot to gate-keep its UI.

import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/server/admin";

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const admin = await requireAdmin(request);
          return Response.json({ admin });
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
      },
    },
  },
});

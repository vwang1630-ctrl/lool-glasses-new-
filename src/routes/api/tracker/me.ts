// GET /api/tracker/me — returns the currently logged-in tracker, or 401.

import { createFileRoute } from "@tanstack/react-router";
import { requireTracker } from "@/server/tracker";

export const Route = createFileRoute("/api/tracker/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const t = await requireTracker(request);
          return Response.json({ tracker: t });
        } catch (resp) {
          return resp as Response;
        }
      },
    },
  },
});

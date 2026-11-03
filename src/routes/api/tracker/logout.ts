// POST /api/tracker/logout — clears the tracker session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { buildClearTrackerCookie, getTrackerSession } from "@/server/tracker";
import { writeActorAudit } from "@/server/audit";

export const Route = createFileRoute("/api/tracker/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tracker = await getTrackerSession(request);
        if (tracker) {
          await writeActorAudit(request, {
            scope: "tracker",
            actor_id: tracker.id,
            actor_email: tracker.email,
            action: "LOGOUT",
            resource_type: "tracker_session",
            resource_id: tracker.id,
          });
        }
        return Response.json(
          { ok: true },
          { headers: { "Set-Cookie": buildClearTrackerCookie() } },
        );
      },
    },
  },
});

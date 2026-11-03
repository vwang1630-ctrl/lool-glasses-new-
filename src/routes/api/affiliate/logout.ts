import { createFileRoute } from "@tanstack/react-router";
import {
  buildClearAffiliateCookie,
  getAffiliateIdentity,
} from "@/server/affiliate-session";
import { writeActorAudit } from "@/server/audit";

export const Route = createFileRoute("/api/affiliate/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const affiliate = await getAffiliateIdentity(request);
        if (affiliate) {
          await writeActorAudit(request, {
            scope: "affiliate",
            actor_id: affiliate.id,
            actor_email: affiliate.email,
            action: "LOGOUT",
            resource_type: "affiliate_session",
            resource_id: affiliate.id,
          });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": buildClearAffiliateCookie(),
          },
        });
      },
    },
  },
});

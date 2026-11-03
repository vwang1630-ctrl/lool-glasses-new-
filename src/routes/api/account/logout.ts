// POST /api/account/logout
// Clears the lool_account_session cookie. The frontend also wipes its
// sessionStorage copy so a stale UI doesn't claim "still signed in".

import { createFileRoute } from "@tanstack/react-router";
import { buildClearAccountCookie } from "@/server/account-session";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";

export const Route = createFileRoute("/api/account/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { clientId?: string | null; email?: string | null } = {};
        try {
          body = await request.json();
        } catch {
          /* old clients may post an empty body */
        }
        if (isValidClientId(body.clientId)) {
          await writeCustomerAudit(request, {
            client_id: body.clientId,
            actor_email: body.email ?? null,
            action: "LOGOUT",
            resource_type: "account",
            resource_id: body.email ?? null,
          });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": buildClearAccountCookie(),
          },
        });
      },
    },
  },
});

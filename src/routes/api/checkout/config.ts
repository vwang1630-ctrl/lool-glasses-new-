import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { listShippingRules } from "@/server/shipping";

export const Route = createFileRoute("/api/checkout/config")({
  server: {
    handlers: {
      GET: async () => {
        const publishableKey = (
          env as unknown as { STRIPE_PUBLISHABLE_KEY?: string }
        ).STRIPE_PUBLISHABLE_KEY;
        const shippingRules = await listShippingRules(getDB());
        if (!publishableKey) {
          // Still return shipping rules so the order summary is correct; the
          // client shows a "payment unavailable" notice instead of spinning.
          return Response.json(
            {
              publishableKey: null,
              shippingRules,
              error: "stripe_publishable_key_missing",
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        }
        return Response.json(
          { publishableKey, shippingRules },
          { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
        );
      },
    },
  },
});

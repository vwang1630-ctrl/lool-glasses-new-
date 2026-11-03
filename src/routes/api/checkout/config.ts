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
        if (!publishableKey) {
          return Response.json(
            { error: "stripe_publishable_key_missing" },
            { status: 500 },
          );
        }
        const shippingRules = await listShippingRules(getDB());
        return Response.json(
          { publishableKey, shippingRules },
          { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
        );
      },
    },
  },
});

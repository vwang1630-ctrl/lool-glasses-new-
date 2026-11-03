// POST /api/checkout/stripe-webhook
//
// Stripe -> us. Verifies the Stripe-Signature header against STRIPE_WEBHOOK_SECRET
// and applies the event to D1:
//   payment_intent.succeeded     -> orders.status='paid', paid_at=now,
//                                   payment_method='<first allowed type>'
//   payment_intent.payment_failed -> orders.status='cancelled', cancelled_at=now
//
// We dedupe by status: if an order is already in a paid/cancelled terminal
// state, the update is a no-op. Stripe retries webhooks aggressively, so
// idempotency matters.
//
// Body must be read as raw text for HMAC verification — do NOT use .json()
// on the request before constructEvent runs, or the signature won't match.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { getPaymentProvider } from "@/lib/payment";

export const Route = createFileRoute("/api/checkout/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature");
        if (!sig) {
          return new Response("missing signature", { status: 400 });
        }

        const rawBody = await request.text();

        const provider = getPaymentProvider(env);
        let evt;
        try {
          evt = await provider.verifyAndParseWebhook(rawBody, sig);
        } catch (err) {
          return new Response(
            `signature_verification_failed: ${(err as Error).message}`,
            {
              status: 400,
            },
          );
        }

        if (evt.type === "ignored") {
          return new Response("ignored", { status: 200 });
        }

        const db = getDB();
        const now = Date.now();

        if (evt.type === "payment_intent.succeeded") {
          // Only flip pending -> paid; later state changes (shipped, delivered)
          // are admin-driven and shouldn't be reversed by a late webhook retry.
          await db
            .prepare(
              `UPDATE orders
               SET status = 'paid',
                   paid_at = ?,
                   payment_method = COALESCE(payment_method, ?),
                   updated_at = ?
               WHERE payment_intent_id = ?
                 AND status = 'pending'`,
            )
            .bind(now, evt.paymentMethodType, now, evt.paymentIntentId)
            .run();
        } else if (evt.type === "payment_intent.payment_failed") {
          await db
            .prepare(
              `UPDATE orders
               SET status = 'cancelled',
                   cancelled_at = ?,
                   updated_at = ?
               WHERE payment_intent_id = ?
                 AND status = 'pending'`,
            )
            .bind(now, now, evt.paymentIntentId)
            .run();
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

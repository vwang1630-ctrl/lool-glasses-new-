// Stripe provider implementation.
//
// Notes:
// - Workers runtime: we pass `httpClient: Stripe.createFetchHttpClient()` so
//   the SDK uses fetch() instead of node's http (which doesn't exist here).
// - Currency: orders are stored in USD; Stripe account default settlement is
//   HKD but charge currency stays USD — Stripe auto-converts on payout.
// - Webhook verification: Stripe's constructEvent() does HMAC SHA-256 against
//   the raw body; we use the async variant so it works without Node crypto.

import Stripe from "stripe";
import type {
  CreateIntentParams,
  PaymentIntent,
  PaymentProvider,
  WebhookEvent,
} from "../types";

export function makeStripeProvider(
  secretKey: string,
  publishableKey: string,
  webhookSecret: string,
): PaymentProvider {
  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  return {
    name: "stripe",
    publishableKey,

    async createIntent({
      amountCents,
      currency,
      orderId,
      orderNumber,
      email,
    }: CreateIntentParams): Promise<PaymentIntent> {
      const intent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: currency.toLowerCase(),
        receipt_email: email,
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId,
          orderNumber,
        },
      });
      if (!intent.client_secret) {
        throw new Error("Stripe returned PaymentIntent without client_secret");
      }
      return { id: intent.id, clientSecret: intent.client_secret };
    },

    async verifyAndParseWebhook(
      rawBody: string,
      signatureHeader: string,
    ): Promise<WebhookEvent> {
      const event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signatureHeader,
        webhookSecret,
      );

      if (
        event.type === "payment_intent.succeeded" ||
        event.type === "payment_intent.payment_failed"
      ) {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = (pi.metadata?.orderId as string | undefined) ?? null;
        const paymentMethodType =
          (pi.payment_method_types?.[0] as string | undefined) ?? null;
        return {
          type: event.type,
          paymentIntentId: pi.id,
          orderId,
          paymentMethodType,
        };
      }

      return {
        type: "ignored",
        paymentIntentId: null,
        orderId: null,
        paymentMethodType: null,
      };
    },
  };
}

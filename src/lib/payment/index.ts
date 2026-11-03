// Payment provider entry — picks the active provider based on env config.
// Currently always returns the Stripe adapter; PayPal/Airwallex slots are
// reserved for future implementations.

import type { PaymentProvider } from "./types";
import { makeStripeProvider } from "./providers/stripe";

interface PaymentEnv {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export function getPaymentProvider(env: unknown): PaymentProvider {
  const e = env as PaymentEnv;
  const secret = e.STRIPE_SECRET_KEY;
  const publishable = e.STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = e.STRIPE_WEBHOOK_SECRET ?? "";
  if (!secret || !publishable) {
    throw new Error("STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY not set");
  }
  return makeStripeProvider(secret, publishable, webhookSecret);
}

export type {
  PaymentProvider,
  PaymentIntent,
  WebhookEvent,
  CreateIntentParams,
} from "./types";

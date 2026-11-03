// Payment provider adapter contract.
//
// CLAUDE.md prescribes adapter mode for payment so that future providers
// (PayPal fallback, Airwallex local rails) can plug in without touching
// business code. Right now Stripe is the only implementation.

export interface CreateIntentParams {
  amountCents: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  email: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
}

export interface WebhookEvent {
  type:
    | "payment_intent.succeeded"
    | "payment_intent.payment_failed"
    | "ignored";
  paymentIntentId: string | null;
  orderId: string | null;
  paymentMethodType: string | null;
}

export interface PaymentProvider {
  readonly name: "stripe" | "paypal" | "airwallex";
  readonly publishableKey: string;

  createIntent(params: CreateIntentParams): Promise<PaymentIntent>;

  // Verifies the signature header and parses the event body into a normalized
  // shape. Throws on invalid signatures.
  verifyAndParseWebhook(
    rawBody: string,
    signatureHeader: string,
  ): Promise<WebhookEvent>;
}

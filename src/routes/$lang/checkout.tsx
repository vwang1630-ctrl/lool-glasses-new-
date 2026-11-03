// /checkout — payment-first checkout that ends with a Stripe-confirmed order.
//
// The Payment Element renders before the full delivery form. We create the
// pending order + PaymentIntent only when the customer clicks "Place order",
// then immediately confirm that intent with the already-entered payment data.
// Most test-mode cards stay in-page; redirect flows (3DS, alipay, wechat)
// come back to this same URL with payment_intent_client_secret in the query,
// which we detect on mount and show as the done state.
//
// Saved-addresses picker: on mount we probe /api/account/me. If the visitor
// already has a session cookie, we derive a deduped list of shipping
// addresses from their past orders and render a picker above the form.
//
// Selection-aware checkout: only the cart rows the user ticked on /cart are
// submitted. The unticked rows stay in the cart for a future visit. After a
// successful order we drop just the selected items (`removeSelected`), not
// the whole cart.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { getCountryName, isValidIsoCountry } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { CountryPicker } from "@/components/CountryPicker";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Star } from "lucide-react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getCustomerClientId, trackCustomerEvent } from "@/lib/customer-audit";

export const Route = createFileRoute("/$lang/checkout")({
  head: () => ({ meta: [{ title: "lool — Checkout" }] }),
  component: CheckoutPage,
});

interface ShippingForm {
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
  email: string;
}

interface SavedAddress {
  id: string;
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

interface OrderState {
  orderId: string;
  orderNumber: string;
  clientSecret: string;
  publishableKey: string;
  originalSubtotalCents: number;
  countryDiscountPct: number | null;
  countryDiscountCents: number;
  affiliateDiscountPct: number | null;
  affiliateDiscountCents: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

interface ShippingRule {
  country_code: string;
  shipping_cents: number;
  free_shipping_threshold_cents: number;
  country_discount_pct: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SHIPPING_RULE: ShippingRule = {
  country_code: "row",
  shipping_cents: 800,
  free_shipping_threshold_cents: 6900,
  country_discount_pct: 0,
};

// Cache loadStripe by publishable key so we don't reload the script every
// render. The Stripe docs explicitly call this pattern out.
const stripeJsCache = new Map<string, Promise<Stripe | null>>();
function getStripePromise(pk: string): Promise<Stripe | null> {
  let p = stripeJsCache.get(pk);
  if (!p) {
    p = loadStripe(pk);
    stripeJsCache.set(pk, p);
  }
  return p;
}

function CheckoutPage() {
  const { t, contentLang } = useI18n();
  // Render an ISO country code as a localized name; passing a non-ISO value
  // (legacy free-text from /api/account/addresses) just renders verbatim.
  const renderCountry = (c: string) =>
    isValidIsoCountry(c) ? getCountryName(c, contentLang) : c;
  const { selectedItems, selectedSubtotal, removeSelected } = useCart();
  const items = selectedItems;
  const subtotal = selectedSubtotal;

  const [done, setDone] = useState<{ orderNumber: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([
    DEFAULT_SHIPPING_RULE,
  ]);
  const [form, setForm] = useState<ShippingForm>({
    recipient: "",
    country: "",
    zip: "",
    address: "",
    phone: "",
    email: "",
  });
  // Order + PaymentIntent are created at final submit time. Before that the
  // Payment Element runs in deferred-intent mode so payment UI can be first.
  const [orderState, setOrderState] = useState<OrderState | null>(null);

  // Saved addresses derived from this account's past orders. `null` = not yet
  // fetched / signed out. Picker only renders once we have ≥1 saved address.
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[] | null>(
    null,
  );
  const [selectedIdx, setSelectedIdx] = useState<number | "new">("new");
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);

  const originalSubtotalCents = Math.round(subtotal * 100);
  const selectedCountryCode = isValidIsoCountry(form.country)
    ? form.country.toLowerCase()
    : "row";
  const previewShippingRule =
    shippingRules.find((r) => r.country_code === selectedCountryCode) ??
    shippingRules.find((r) => r.country_code === "row") ??
    DEFAULT_SHIPPING_RULE;
  const previewShippingCents =
    originalSubtotalCents >= previewShippingRule.free_shipping_threshold_cents
      ? 0
      : previewShippingRule.shipping_cents;
  const previewCountryDiscountPct = Math.max(
    0,
    previewShippingRule.country_discount_pct ?? 0,
  );
  const previewCountryDiscountCents = Math.round(
    originalSubtotalCents * previewCountryDiscountPct,
  );
  const previewDiscountedSubtotalCents = Math.max(
    0,
    originalSubtotalCents - previewCountryDiscountCents,
  );
  const taxCents = Math.round(previewDiscountedSubtotalCents * 0.05);
  const totalCents =
    previewDiscountedSubtotalCents + previewShippingCents + taxCents;
  const displayOriginalSubtotal =
    (orderState?.originalSubtotalCents ?? Math.round(subtotal * 100)) / 100;
  const displayCountryDiscount =
    (orderState?.countryDiscountCents ?? previewCountryDiscountCents) / 100;
  const displayAffiliateDiscount =
    (orderState?.affiliateDiscountCents ?? 0) / 100;
  const displaySubtotal =
    (orderState?.subtotalCents ?? previewDiscountedSubtotalCents) / 100;
  const displayShipping =
    (orderState?.shippingCents ?? previewShippingCents) / 100;
  const displayTax = (orderState?.taxCents ?? taxCents) / 100;
  const displayTotal = (orderState?.totalCents ?? totalCents) / 100;
  const selectedAddress =
    typeof selectedIdx === "number"
      ? (savedAddresses?.[selectedIdx] ?? null)
      : null;

  // On mount: prefill email + saved addresses; AND if Stripe redirected us
  // back here after a 3DS / wallet flow, the URL carries
  // payment_intent_client_secret. We let the Elements wrapper inspect that
  // (via useStripe.retrievePaymentIntent) inside ReturnHandler.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/account/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/account/addresses").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/checkout/config").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([me, book, checkoutConfig]) => {
        if (cancelled) return;
        const cfg = checkoutConfig as {
          publishableKey?: string;
          shippingRules?: ShippingRule[];
        } | null;
        const pk = cfg?.publishableKey;
        if (pk) setPublishableKey(pk);
        if (Array.isArray(cfg?.shippingRules) && cfg.shippingRules.length > 0) {
          setShippingRules(cfg.shippingRules);
        }
        const email = (me as { email?: string } | null)?.email ?? "";
        if (email) setForm((f) => (f.email ? f : { ...f, email }));
        const list =
          (book as { addresses?: SavedAddress[] } | null)?.addresses ?? [];
        if (list.length > 0) {
          setSavedAddresses(list);
          setSelectedIdx(0);
          setForm((f) => ({
            ...f,
            recipient: list[0].recipient,
            country: list[0].country,
            zip: list[0].zip,
            address: list[0].address,
            phone: f.phone || list[0].phone,
          }));
        }
      })
      .catch(() => {
        /* offline / network — fall back to a blank form */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pickSaved = (idx: number) => {
    const a = savedAddresses?.[idx];
    if (!a) return;
    setSelectedIdx(idx);
    setAddressPickerOpen(false);
    setForm((f) => ({
      ...f,
      recipient: a.recipient,
      country: a.country,
      zip: a.zip,
      address: a.address,
      phone: a.phone || f.phone,
    }));
  };

  const pickNew = () => {
    setSelectedIdx("new");
    setAddressPickerOpen(false);
    setForm((f) => ({
      ...f,
      recipient: "",
      country: "",
      zip: "",
      address: "",
      phone: "",
    }));
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold font-display">
          {t("checkout.success")}
        </h1>
        <p className="text-muted-foreground mt-3">
          {t("checkout.successDesc")}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Order #{done.orderNumber}
        </p>
        <Button asChild className="mt-8 rounded-full px-7 h-11">
          <Link to="/account">{t("checkout.viewMyOrders")}</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        {t("cart.empty")}
      </div>
    );
  }

  const shippingComplete = !!(
    form.recipient.trim() &&
    isValidIsoCountry(form.country) &&
    form.zip.trim() &&
    form.address.trim() &&
    form.phone.trim() &&
    EMAIL_RE.test(form.email.trim())
  );

  const createOrder = async (): Promise<OrderState | null> => {
    setErr(null);
    if (!shippingComplete) {
      setErr(t("checkout.error.required"));
      return null;
    }
    trackCustomerEvent({
      action: "CHECKOUT_STARTED",
      resourceType: "checkout",
      actorEmail: form.email.trim().toLowerCase(),
      meta: { itemCount: items.length, totalCents },
    });
    // Affiliate ref from localStorage (RefCodeWriter in __root.tsx wrote it
    // when the user first arrived via ?ref=). Falls back to whatever
    // (possibly stale) value's there — server validates the slug.
    let ref: string | undefined;
    try {
      ref = window.localStorage.getItem("lool_ref") ?? undefined;
    } catch {
      ref = undefined;
    }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          contentLang,
          ref,
          clientId: getCustomerClientId(),
          items: items.map((it) => ({
            productId: it.product.id,
            colorId: it.colorId,
            qty: it.qty,
            lensSkuId: it.lensSkuId,
            lensColorId: it.lensColorId,
            prescriptionId: it.prescriptionId,
            rx: it.rxSnapshot,
          })),
          shipping: {
            recipient: form.recipient.trim(),
            country: form.country,
            zip: form.zip.trim(),
            address: form.address.trim(),
            phone: form.phone.trim(),
          },
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(j.error ?? t("checkout.error.network"));
        return null;
      }
      const j = (await res.json()) as {
        orderId: string;
        orderNumber: string;
        originalSubtotalCents: number;
        countryDiscountPct: number | null;
        countryDiscountCents: number;
        affiliateDiscountPct: number | null;
        affiliateDiscountCents: number;
        subtotalCents: number;
        shippingCents: number;
        taxCents: number;
        totalCents: number;
        payment: { clientSecret: string; publishableKey: string };
      };
      const nextOrderState = {
        orderId: j.orderId,
        orderNumber: j.orderNumber,
        clientSecret: j.payment.clientSecret,
        publishableKey: j.payment.publishableKey,
        originalSubtotalCents: j.originalSubtotalCents,
        countryDiscountPct: j.countryDiscountPct,
        countryDiscountCents: j.countryDiscountCents,
        affiliateDiscountPct: j.affiliateDiscountPct,
        affiliateDiscountCents: j.affiliateDiscountCents,
        subtotalCents: j.subtotalCents,
        shippingCents: j.shippingCents,
        taxCents: j.taxCents,
        totalCents: j.totalCents,
      };
      setOrderState(nextOrderState);
      return nextOrderState;
    } catch {
      setErr(t("checkout.error.network"));
      return null;
    }
  };

  return (
    <div>
      <section className="page-hero">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-10 pb-10 md:pt-14 md:pb-12">
          <h1 className="section-title">{t("checkout.title")}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-8">
            {publishableKey ? (
              <StripeElementsWrapper
                orderState={orderState}
                publishableKey={publishableKey}
                amountCents={totalCents}
                locale={contentLang}
              >
                <PaymentFlow
                  createOrder={createOrder}
                  err={err}
                  setErr={setErr}
                  submitting={submitting}
                  setSubmitting={setSubmitting}
                  onSuccess={(orderNumber) => {
                    removeSelected();
                    setDone({ orderNumber });
                  }}
                  total={displayTotal}
                  orderState={orderState}
                  tPlaceOrder={t("checkout.placeOrder")}
                  tSubmitting={t("checkout.submitting")}
                  tNetworkError={t("checkout.error.network")}
                >
                  <div className="space-y-5 pt-6 border-t border-border">
                    <Field
                      label={t("checkout.email")}
                      placeholder="you@example.com"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                      hint={t("checkout.email.hint")}
                    />
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {t("checkout.address")}
                      </p>
                      {savedAddresses && savedAddresses.length > 0 && (
                        <div className="space-y-2">
                          {selectedAddress && selectedIdx !== "new" ? (
                            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate text-sm font-medium">
                                    {selectedAddress.recipient}
                                  </p>
                                  {selectedAddress.isDefault && (
                                    <Star className="h-3 w-3 shrink-0 text-primary" />
                                  )}
                                </div>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {selectedAddress.address}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {renderCountry(selectedAddress.country)}
                                  {selectedAddress.zip
                                    ? ` · ${selectedAddress.zip}`
                                    : ""}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setAddressPickerOpen((open) => !open)
                                }
                                className="shrink-0 text-xs font-medium text-primary hover:underline"
                              >
                                {t("checkout.address.change")}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setAddressPickerOpen((open) => !open)
                              }
                              className="w-full rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-smooth hover:border-primary/40"
                            >
                              + {t("checkout.useNewAddress")}
                            </button>
                          )}

                          {addressPickerOpen && (
                            <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-sm">
                              {savedAddresses.map((a, i) => (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => pickSaved(i)}
                                  className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition-smooth ${
                                    selectedIdx === i
                                      ? "bg-primary/5"
                                      : "hover:bg-secondary/60"
                                  }`}
                                >
                                  <span className="min-w-0">
                                    <span className="flex items-center gap-1.5 text-sm font-medium">
                                      <span className="truncate">
                                        {a.recipient}
                                      </span>
                                      {a.isDefault && (
                                        <Star className="h-3 w-3 shrink-0 text-primary" />
                                      )}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                      {a.address}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {renderCountry(a.country)}
                                      {a.zip ? ` · ${a.zip}` : ""}
                                    </span>
                                  </span>
                                  {selectedIdx === i && (
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                                  )}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={pickNew}
                                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-secondary/60"
                              >
                                + {t("checkout.useNewAddress")}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {(!savedAddresses || selectedIdx === "new") && (
                        <div className="space-y-4">
                          <Field
                            label={t("checkout.recipient")}
                            placeholder="Linda Chen"
                            value={form.recipient}
                            onChange={(v) =>
                              setForm((f) => ({ ...f, recipient: v }))
                            }
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                {t("checkout.country")}
                              </span>
                              <div className="mt-1.5">
                                <CountryPicker
                                  value={form.country}
                                  onChange={(v) =>
                                    setForm((f) => ({ ...f, country: v }))
                                  }
                                />
                              </div>
                            </label>
                            <Field
                              label={t("checkout.zip")}
                              placeholder="94105"
                              value={form.zip}
                              onChange={(v) =>
                                setForm((f) => ({ ...f, zip: v }))
                              }
                            />
                          </div>
                          <Field
                            label={t("checkout.address.line")}
                            placeholder="123 Market St, San Francisco"
                            value={form.address}
                            onChange={(v) =>
                              setForm((f) => ({ ...f, address: v }))
                            }
                          />
                          <Field
                            label={t("checkout.phone")}
                            placeholder="+1 415 555 0100"
                            value={form.phone}
                            onChange={(v) =>
                              setForm((f) => ({ ...f, phone: v }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </PaymentFlow>
              </StripeElementsWrapper>
            ) : (
              <div className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                {t("checkout.submitting")}
              </div>
            )}
          </div>

          <aside className="rounded-2xl bg-secondary/40 p-6 h-fit space-y-2 text-sm lg:sticky lg:top-24">
            <div className="space-y-3 pb-4 mb-4 border-b border-border">
              {items.map((it) => (
                <div key={it.product.id} className="flex justify-between gap-4">
                  <span className="min-w-0">
                    {pickLang(it.product.name, contentLang)} × {it.qty}{" "}
                    <span className="text-muted-foreground text-xs">
                      · {it.lens.type} {it.lens.index}
                    </span>
                  </span>
                  <span className="shrink-0">
                    $
                    {(
                      (it.product.priceUSD + it.lens.extraUSD) *
                      it.qty
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("cart.subtotal")}
              </span>
              <span>${displayOriginalSubtotal.toFixed(2)}</span>
            </div>
            {displayCountryDiscount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Country discount
                  {orderState?.countryDiscountPct
                    ? ` (${Math.round(orderState.countryDiscountPct * 100)}%)`
                    : previewCountryDiscountPct > 0
                      ? ` (${Math.round(previewCountryDiscountPct * 100)}%)`
                      : ""}
                </span>
                <span>-${displayCountryDiscount.toFixed(2)}</span>
              </div>
            )}
            {displayAffiliateDiscount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Affiliate discount
                  {orderState?.affiliateDiscountPct
                    ? ` (${Math.round(orderState.affiliateDiscountPct * 100)}%)`
                    : ""}
                </span>
                <span>-${displayAffiliateDiscount.toFixed(2)}</span>
              </div>
            )}
            {(displayCountryDiscount > 0 || displayAffiliateDiscount > 0) && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Discounted subtotal
                </span>
                <span>${displaySubtotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("cart.shipping")}
              </span>
              <span>
                {displayShipping === 0
                  ? t("cart.free")
                  : `$${displayShipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("cart.tax")}</span>
              <span>${displayTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 font-semibold pt-2 border-t border-border">
              <span>{t("cart.total")}</span>
              <span>${displayTotal.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StripeElementsWrapper({
  orderState,
  publishableKey,
  amountCents,
  locale,
  children,
}: {
  orderState: OrderState | null;
  publishableKey: string;
  amountCents: number;
  /** Site UI language (en/zh/es/fr/de/it/pt/ja/ko/ar/vi/th/id/ms). All 14 are
   * valid Stripe Elements locales — passing them through keeps the iframe's
   * built-in card-form labels in the same language as the rest of the page,
   * so a vi user no longer sees "金融卡 / 卡號 / 國家/地區" inside the
   * Payment Element. */
  locale: string;
  children: React.ReactNode;
}) {
  const stripePromise = useMemo(
    () => getStripePromise(orderState?.publishableKey ?? publishableKey),
    [orderState?.publishableKey, publishableKey],
  );
  const baseOptions = orderState
    ? {
        clientSecret: orderState.clientSecret,
        appearance: { theme: "stripe" as const },
      }
    : {
        mode: "payment" as const,
        amount: amountCents,
        currency: "usd",
        appearance: { theme: "stripe" as const },
      };
  // Stripe Elements StripeElementsOptions.locale is typed against its own
  // StripeElementLocale union (~50 entries). Our Lang union is a strict
  // subset of supported locales, so cast through unknown.
  const options = { ...baseOptions, locale: locale as unknown as "auto" };
  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

function PaymentFlow({
  createOrder,
  err,
  setErr,
  submitting,
  setSubmitting,
  onSuccess,
  total,
  orderState,
  tPlaceOrder,
  tSubmitting,
  tNetworkError,
  children,
}: {
  createOrder: () => Promise<OrderState | null>;
  err: string | null;
  setErr: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  onSuccess: (orderNumber: string) => void;
  total: number;
  orderState: OrderState | null;
  tPlaceOrder: string;
  tSubmitting: string;
  tNetworkError: string;
  children: React.ReactNode;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const placeOrder = async () => {
    if (!stripe || !elements) {
      setErr(tNetworkError);
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      if (!orderState) {
        const submitResult = await elements.submit();
        if (submitResult.error) {
          setErr(submitResult.error.message ?? tNetworkError);
          return;
        }
      }
      const order = orderState ?? (await createOrder());
      if (!order) return;
      trackCustomerEvent({
        action: "PAYMENT_STARTED",
        resourceType: "order",
        resourceId: order.orderId,
        meta: { orderNumber: order.orderNumber, totalCents: order.totalCents },
      });
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: order.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}`,
        },
        redirect: "if_required",
      });
      if (error) {
        setErr(error.message ?? tNetworkError);
        trackCustomerEvent({
          action: "PAYMENT_FAILED",
          resourceType: "order",
          resourceId: order.orderId,
          meta: {
            orderNumber: order.orderNumber,
            message: error.message ?? "unknown",
          },
        });
        return;
      }
      if (paymentIntent && paymentIntent.status === "succeeded") {
        trackCustomerEvent({
          action: "PAYMENT_SUCCEEDED",
          resourceType: "order",
          resourceId: order.orderId,
          meta: {
            orderNumber: order.orderNumber,
            paymentIntentId: paymentIntent.id,
          },
        });
        onSuccess(order.orderNumber);
        return;
      }
      // "processing" / "requires_action" without redirect — treat as
      // pending; webhook will eventually flip the order. Show the user the
      // order number so they know it was placed.
      onSuccess(order.orderNumber);
    } catch (err) {
      // Surface the underlying error so we have a fighting chance in
      // production: the UI shows the generic "couldn't reach the server"
      // string, but the browser console gets the real message.
      console.error("[checkout.placeOrder]", err);
      setErr(tNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PaymentElement />
      {children}

      {err && <p className="mt-4 text-xs text-destructive">{err}</p>}

      <div className="mt-8 flex justify-end">
        <Button
          onClick={placeOrder}
          disabled={submitting || !stripe || !elements}
          className="rounded-full px-6 shadow-soft"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {tSubmitting}
            </>
          ) : (
            <>
              {tPlaceOrder} · ${total.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border focus:border-primary/40 outline-none transition-smooth bg-background"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "email" ? "email" : "off"}
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </label>
  );
}

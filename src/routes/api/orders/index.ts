// POST /api/orders
// Creates a pending order with items snapshotted from the wizard's resolved
// lens_skus + product_colors.
//
// Body shape (per item):
//   {
//     productId, colorId?, qty,
//     lensSkuId?,            // omitted for frame-only
//     lensColorId?,          // for tinted/photochromic base lenses
//     prescriptionId?
//   }
//
// Snapshot strategy: every user-visible label and price is frozen onto the
// order_items row so admin edits to lens_skus / lens_brands later don't
// mutate historical orders.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { nanoid, generateOrderNumber } from "@/server/ids";
import { getAccountSession } from "@/server/account-session";
import { upsertAddressFromOrder } from "@/server/addresses";
import {
  parseRefValue,
  parseRefCookie,
  resolveAttribution,
} from "@/server/affiliate-ledger";
import { getPaymentProvider } from "@/lib/payment";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";
import type { RxSnapshot } from "@/lib/rx-snapshot";
import { isValidIsoCountry } from "@/lib/countries";
import { getShippingRuleForCountry, quoteShipping } from "@/server/shipping";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAX_RATE = 0.05;

interface ItemInput {
  productId: string;
  colorId?: string;
  qty: number;
  lensSkuId?: string;
  lensColorId?: string;
  prescriptionId?: string;
  // Client-supplied rx snapshot from the wizard. When present, wins over any
  // prescriptionId-based DB lookup so the user's just-entered values are what
  // gets snapshotted onto order_items (matters for anonymous checkouts and
  // for logged-in users who edited a saved Rx in the wizard).
  rx?: RxSnapshot;
}

interface ShipInput {
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
}

interface OrderBody {
  email: string;
  contentLang?: string;
  items: ItemInput[];
  shipping: ShipInput;
  // Affiliate ref token read from localStorage by the checkout client; same
  // `<slug>.<writtenMs>` shape the old lool_ref cookie used.
  ref?: string;
  clientId?: string | null;
}

type ProductRow = {
  id: string;
  slug: string;
  name_json: string | null;
  price_cents: number;
};

type LensSkuRow = {
  id: string;
  brand_id: string;
  prescription_type: string;
  base_function: string;
  refractive_index: number;
  progressive_view_area: string | null;
  retail_cents: number;
};

type LensBrandRow = {
  id: string;
  name_json: string | null;
};

type ColorRow = {
  product_id: string;
  color_id: string;
  images_json: string | null;
};

type CustomerRow = {
  id: string;
  affiliate_ref_slug: string | null;
  affiliate_ref_at: number | null;
};

function validate(
  body: unknown,
): { ok: true; value: OrderBody } | { ok: false; reason: string } {
  if (!body || typeof body !== "object")
    return { ok: false, reason: "invalid_body" };
  const b = body as Partial<OrderBody>;
  if (!b.email || !EMAIL_RE.test(b.email))
    return { ok: false, reason: "invalid_email" };
  if (!Array.isArray(b.items) || b.items.length === 0)
    return { ok: false, reason: "no_items" };
  for (const it of b.items) {
    if (!it.productId) return { ok: false, reason: "missing_product_id" };
    if (typeof it.qty !== "number" || it.qty <= 0 || it.qty > 10)
      return { ok: false, reason: "invalid_qty" };
  }
  if (!b.shipping) return { ok: false, reason: "no_shipping" };
  const s = b.shipping;
  if (!s.recipient || !s.country || !s.zip || !s.address || !s.phone) {
    return { ok: false, reason: "incomplete_shipping" };
  }
  // Country must be ISO 3166-1 alpha-2 — the picker enforces this client-side;
  // reject anything else server-side so older clients / direct API callers
  // can't seed free-text into a column that downstream analytics depend on.
  const upperCountry = s.country.toUpperCase();
  if (!isValidIsoCountry(upperCountry)) {
    return { ok: false, reason: "invalid_country" };
  }
  s.country = upperCountry;
  return { ok: true, value: b as OrderBody };
}

function firstImageFromColor(row: ColorRow): string | null {
  if (!row.images_json) return null;
  try {
    const arr = JSON.parse(row.images_json);
    if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
  } catch {
    // ignore
  }
  return null;
}

export const Route = createFileRoute("/api/orders/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return await handlePost(request);
        } catch (err) {
          // Log the real error to wrangler tail; the framework default
          // {status:500,unhandled:true,message:"HTTPError"} swallows the
          // underlying message. Body stays empty so the client falls back
          // to the localized network-error toast rather than leaking
          // internals to the user.
          console.error("[api/orders POST] unhandled:", err);
          return Response.json({}, { status: 500 });
        }
      },
    },
  },
});

async function handlePost(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const v = validate(raw);
  if (!v.ok) return Response.json({ error: v.reason }, { status: 400 });
  const body = v.value;

  const db = getDB();
  const email = body.email.toLowerCase();

  const productIds = [...new Set(body.items.map((i) => i.productId))];
  const lensSkuIds = [
    ...new Set(
      body.items.map((i) => i.lensSkuId).filter((x): x is string => !!x),
    ),
  ];
  const colorPairs = body.items
    .filter((i) => i.colorId)
    .map((i) => ({ productId: i.productId, colorId: i.colorId! }));
  const prescriptionIds = [
    ...new Set(
      body.items.map((i) => i.prescriptionId).filter((x): x is string => !!x),
    ),
  ];

  const productPlaceholders = productIds.map(() => "?").join(",");
  const productsRes = await db
    .prepare(
      `SELECT id, slug, name_json, price_cents
             FROM products WHERE id IN (${productPlaceholders})`,
    )
    .bind(...productIds)
    .all<ProductRow>();
  const productById = new Map<string, ProductRow>(
    (productsRes.results ?? []).map((p: ProductRow) => [p.id, p]),
  );

  const skuById = new Map<string, LensSkuRow>();
  const brandIds = new Set<string>();
  if (lensSkuIds.length > 0) {
    const skuPlaceholders = lensSkuIds.map(() => "?").join(",");
    const skusRes = await db
      .prepare(
        `SELECT id, brand_id, prescription_type, base_function, refractive_index,
                      progressive_view_area, retail_cents
               FROM lens_skus WHERE id IN (${skuPlaceholders}) AND active = 1`,
      )
      .bind(...lensSkuIds)
      .all<LensSkuRow>();
    for (const s of skusRes.results ?? []) {
      skuById.set(s.id, s);
      brandIds.add(s.brand_id);
    }
  }

  const brandById = new Map<string, LensBrandRow>();
  if (brandIds.size > 0) {
    const bPlaceholders = [...brandIds].map(() => "?").join(",");
    const brandsRes = await db
      .prepare(
        `SELECT id, name_json FROM lens_brands WHERE id IN (${bPlaceholders})`,
      )
      .bind(...brandIds)
      .all<LensBrandRow>();
    for (const b of brandsRes.results ?? []) brandById.set(b.id, b);
  }

  // Pull prescriptions so we can snapshot Rx onto each order_items row
  // at order-creation time. Per [[order-rx-snapshot]] the row is frozen
  // at this moment — later customer edits to the Rx record don't drift
  // into the historical order, which is what the tracker references.
  interface RxRowSnap {
    id: string;
    source: string;
    label_zh: string | null;
    label_en: string | null;
    sph_od: number | null;
    sph_os: number | null;
    cyl_od: number | null;
    cyl_os: number | null;
    axis_od: number | null;
    axis_os: number | null;
    add_od: number | null;
    add_os: number | null;
    prism_od: number | null;
    prism_base_od: string | null;
    prism_os: number | null;
    prism_base_os: string | null;
    pd_total: number | null;
    pd_od_half: number | null;
    pd_os_half: number | null;
    reader_magnification: number | null;
    exam_date: number | null;
    notes: string | null;
  }
  const rxById = new Map<string, RxRowSnap>();
  if (prescriptionIds.length > 0) {
    const rxPh = prescriptionIds.map(() => "?").join(",");
    const rxRes = await db
      .prepare(
        `SELECT id, source, label_zh, label_en,
                      sph_od, sph_os, cyl_od, cyl_os, axis_od, axis_os,
                      add_od, add_os, prism_od, prism_base_od, prism_os, prism_base_os,
                      pd_total, pd_od_half, pd_os_half,
                      reader_magnification, exam_date, notes
                 FROM prescriptions
                WHERE id IN (${rxPh})`,
      )
      .bind(...prescriptionIds)
      .all<RxRowSnap>();
    for (const r of rxRes.results ?? []) rxById.set(r.id, r);
  }

  const colorByPair = new Map<string, ColorRow>();
  if (colorPairs.length > 0) {
    const orClauses = colorPairs
      .map(() => "(product_id = ? AND color_id = ?)")
      .join(" OR ");
    const binds = colorPairs.flatMap((c) => [c.productId, c.colorId]);
    const colorsRes = await db
      .prepare(
        `SELECT product_id, color_id, images_json FROM product_colors WHERE ${orClauses}`,
      )
      .bind(...binds)
      .all<ColorRow>();
    for (const c of colorsRes.results ?? []) {
      colorByPair.set(`${c.product_id}:${c.color_id}`, c);
    }
  }

  // Per-base-function label snapshots (small fixed map; 10-lang).
  const BASE_FN_LABEL: Record<string, Record<string, string>> = {
    clear: { zh: "普通透明", en: "Clear" },
    blue: { zh: "防蓝光", en: "Blue-Light" },
    photo: { zh: "变色", en: "Photochromic" },
    driving: { zh: "驾驶", en: "Driving" },
    tinted: { zh: "染色", en: "Tinted" },
    polarized: { zh: "偏光", en: "Polarized" },
  };

  type Row = {
    id: string;
    product: ProductRow;
    sku: LensSkuRow | null;
    brand: LensBrandRow | null;
    input: ItemInput;
    framePngUrl: string | null;
    unit_frame_cents: number;
    unit_lens_cents: number;
    line_total_cents: number;
  };
  const itemRows: Row[] = [];
  let subtotal = 0;

  for (const input of body.items) {
    const product = productById.get(input.productId);
    if (!product)
      return Response.json(
        { error: `product_not_found:${input.productId}` },
        { status: 400 },
      );

    let sku: LensSkuRow | null = null;
    if (input.lensSkuId) {
      const found = skuById.get(input.lensSkuId);
      if (!found)
        return Response.json(
          { error: `lens_sku_not_found:${input.lensSkuId}` },
          { status: 400 },
        );
      sku = found;
    }
    const brand = sku ? (brandById.get(sku.brand_id) ?? null) : null;

    const framePngUrl =
      (input.colorId &&
        firstImageFromColor(
          colorByPair.get(`${input.productId}:${input.colorId}`)!,
        )) ||
      null;

    const unit_lens_cents = sku?.retail_cents ?? 0;
    const unit_frame_cents = product.price_cents;
    const unit_cents = unit_frame_cents + unit_lens_cents;
    const line_total_cents = unit_cents * input.qty;
    subtotal += line_total_cents;

    itemRows.push({
      id: nanoid(),
      product,
      sku,
      brand,
      input,
      framePngUrl,
      unit_frame_cents,
      unit_lens_cents,
      line_total_cents,
    });
  }

  const orderId = nanoid();
  const orderNumber = generateOrderNumber();
  const now = Date.now();

  const customer = await db
    .prepare(
      "SELECT id, affiliate_ref_slug, affiliate_ref_at FROM customers WHERE email = ?",
    )
    .bind(email)
    .first<CustomerRow>();
  const customerId = customer?.id ?? nanoid();

  // Affiliate attribution. The current browser's localStorage ref wins
  // when it resolves to an active l2 affiliate; write it back to the
  // customer row so future orders belong to that affiliate. If this
  // request carries no valid ref, fall back to the customer's stored
  // attribution.
  const incomingRef = parseRefValue(body.ref) ?? parseRefCookie(request);
  const incomingAttribution = incomingRef
    ? await resolveAttribution(db, incomingRef, email)
    : null;
  const storedRef = customer?.affiliate_ref_slug
    ? {
        slug: customer.affiliate_ref_slug,
        writtenAt: customer.affiliate_ref_at ?? now,
      }
    : null;
  const storedAttribution =
    !incomingAttribution && storedRef
      ? await resolveAttribution(db, storedRef, email)
      : null;
  const attribution = incomingAttribution ?? storedAttribution;
  const original_subtotal_cents = subtotal;
  const shippingRule = await getShippingRuleForCountry(
    db,
    body.shipping.country,
  );
  const country_discount_pct = Math.max(
    0,
    shippingRule.country_discount_pct ?? 0,
  );
  const country_discount_cents =
    country_discount_pct > 0
      ? Math.round(original_subtotal_cents * country_discount_pct)
      : 0;
  subtotal = Math.max(0, original_subtotal_cents - country_discount_cents);
  const country_discounted_subtotal_cents = subtotal;
  const affiliate_discount_pct = attribution?.customerDiscountPct ?? 0;
  const affiliate_discount_cents = attribution
    ? Math.round(subtotal * affiliate_discount_pct)
    : 0;
  subtotal = Math.max(0, subtotal - affiliate_discount_cents);
  const shippingQuote = quoteShipping(shippingRule, original_subtotal_cents);
  const discounted_shipping_cents = shippingQuote.shippingCents;
  const affiliate_shipping_cost_cents =
    attribution && discounted_shipping_cents === 0
      ? shippingQuote.shippingCostCents
      : 0;
  const affiliate_commission_base_cents = attribution
    ? Math.max(
        0,
        country_discounted_subtotal_cents - affiliate_shipping_cost_cents,
      )
    : null;
  const affiliate_l1_cents =
    attribution && affiliate_commission_base_cents != null
      ? Math.round(
          affiliate_commission_base_cents * attribution.l1CommissionPct,
        )
      : 0;
  const affiliate_l2_cents =
    attribution && affiliate_commission_base_cents != null
      ? Math.round(
          affiliate_commission_base_cents * attribution.l2CommissionPct,
        )
      : 0;
  const tax_cents = Math.round(subtotal * TAX_RATE);
  const total_cents = subtotal + discounted_shipping_cents + tax_cents;

  // Create the Stripe PaymentIntent BEFORE the DB insert so that, if
  // Stripe fails, no orphan order rows are left behind. If the DB
  // insert later fails, the PaymentIntent auto-expires after ~24h
  // unconfirmed — harmless.
  const payment = getPaymentProvider(env);
  let intent;
  try {
    intent = await payment.createIntent({
      amountCents: total_cents,
      currency: "USD",
      orderId,
      orderNumber,
      email,
    });
  } catch (err) {
    return Response.json(
      {
        error: "payment_intent_failed",
        detail: String((err as Error).message),
      },
      { status: 502 },
    );
  }

  await db.batch([
    db
      .prepare(
        `INSERT INTO customers (
                id, email, affiliate_ref_slug, affiliate_ref_at,
                first_order_id, first_order_at, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(email) DO UPDATE SET
                affiliate_ref_slug = COALESCE(excluded.affiliate_ref_slug, customers.affiliate_ref_slug),
                affiliate_ref_at = CASE
                  WHEN excluded.affiliate_ref_slug IS NOT NULL THEN excluded.affiliate_ref_at
                  ELSE customers.affiliate_ref_at
                END,
                first_order_id = COALESCE(customers.first_order_id, excluded.first_order_id),
                first_order_at = COALESCE(customers.first_order_at, excluded.first_order_at),
                updated_at = excluded.updated_at`,
      )
      .bind(
        customerId,
        email,
        incomingAttribution ? incomingAttribution.slug : null,
        incomingAttribution ? incomingAttribution.attributionAt : null,
        orderId,
        now,
        now,
        now,
      ),
    db
      .prepare(
        `INSERT INTO orders (
                id, order_number, customer_id, email, status, content_lang,
                subtotal_cents, shipping_cents, tax_cents, total_cents, currency,
                ship_recipient, ship_country, ship_zip, ship_address, ship_phone,
                country_discount_pct, country_discount_cents,
                affiliate_slug, attribution_at, original_subtotal_cents,
                affiliate_discount_pct, affiliate_discount_cents,
                affiliate_l1_id, affiliate_l1_level, affiliate_total_pool_pct,
                affiliate_l1_pct, affiliate_l1_cents,
                affiliate_l2_id, affiliate_l2_pct, affiliate_l2_cents,
                affiliate_customer_discount_base_cents, affiliate_commission_base_cents,
                affiliate_shipping_cost_cents,
                payment_provider, payment_intent_id,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'stripe', ?, ?, ?)`,
      )
      .bind(
        orderId,
        orderNumber,
        customerId,
        email,
        body.contentLang ?? null,
        subtotal,
        discounted_shipping_cents,
        tax_cents,
        total_cents,
        body.shipping.recipient,
        body.shipping.country,
        body.shipping.zip,
        body.shipping.address,
        body.shipping.phone,
        country_discount_pct > 0 ? country_discount_pct : null,
        country_discount_cents,
        attribution?.slug ?? null,
        attribution?.attributionAt ?? null,
        original_subtotal_cents,
        attribution ? affiliate_discount_pct : null,
        affiliate_discount_cents,
        attribution?.l1Id ?? null,
        attribution?.l1Level ?? null,
        attribution?.totalPoolPct ?? null,
        attribution ? attribution.l1CommissionPct : null,
        affiliate_l1_cents,
        attribution?.l2Id ?? null,
        attribution ? attribution.l2CommissionPct : null,
        affiliate_l2_cents,
        attribution ? country_discounted_subtotal_cents : null,
        affiliate_commission_base_cents,
        affiliate_shipping_cost_cents,
        intent.id,
        now,
        now,
      ),
    ...itemRows.map((row) => {
      const productName = safeParse(row.product.name_json);
      const baseFn = row.sku?.base_function;
      const baseFnLabel = baseFn ? BASE_FN_LABEL[baseFn] : null;
      const dbRx = row.input.prescriptionId
        ? (rxById.get(row.input.prescriptionId) ?? null)
        : null;
      // Snapshot precedence: client-supplied rx (wizard) > DB row keyed
      // by prescriptionId > null. The wizard always sends `rx` when the
      // user entered anything, even for anonymous checkouts that never
      // saved a prescriptions row.
      const cRx = row.input.rx;
      const rxSource = cRx?.source ?? dbRx?.source ?? null;
      const rxSphOd = cRx?.sphOd ?? dbRx?.sph_od ?? null;
      const rxSphOs = cRx?.sphOs ?? dbRx?.sph_os ?? null;
      const rxCylOd = cRx?.cylOd ?? dbRx?.cyl_od ?? null;
      const rxCylOs = cRx?.cylOs ?? dbRx?.cyl_os ?? null;
      const rxAxisOd = cRx?.axisOd ?? dbRx?.axis_od ?? null;
      const rxAxisOs = cRx?.axisOs ?? dbRx?.axis_os ?? null;
      const rxAddOd = cRx?.addOd ?? dbRx?.add_od ?? null;
      const rxAddOs = cRx?.addOs ?? dbRx?.add_os ?? null;
      const rxPdTotal = cRx?.pdTotal ?? dbRx?.pd_total ?? null;
      const rxPdOdHalf = cRx?.pdOdHalf ?? dbRx?.pd_od_half ?? null;
      const rxPdOsHalf = cRx?.pdOsHalf ?? dbRx?.pd_os_half ?? null;
      return db
        .prepare(
          `INSERT INTO order_items (
                  id, order_id,
                  product_id, product_slug, product_name_zh, product_name_en,
                  frame_color_id, frame_png_snapshot_url, qty,
                  lens_option_id, lens_category_snapshot, lens_index_snapshot,
                  lens_color_snapshot, lens_retail_cents_snapshot,
                  lens_base_function_snapshot, lens_color_id_snapshot,
                  lens_brand_id_snapshot, lens_brand_label_json,
                  lens_base_function_label_json, lens_progressive_tier_snapshot,
                  prescription_id,
                  rx_source, rx_label_zh, rx_label_en,
                  rx_sph_od, rx_sph_os, rx_cyl_od, rx_cyl_os,
                  rx_axis_od, rx_axis_os, rx_add_od, rx_add_os,
                  rx_prism_od, rx_prism_base_od, rx_prism_os, rx_prism_base_os,
                  rx_pd_total, rx_pd_od_half, rx_pd_os_half,
                  rx_reader_magnification, rx_exam_date, rx_notes,
                  fulfillment_status,
                  unit_frame_cents, unit_lens_cents, line_total_cents
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                          'pending', ?, ?, ?)`,
        )
        .bind(
          row.id,
          orderId,
          row.product.id,
          row.product.slug,
          productName.zh ?? productName.en ?? "",
          productName.en ?? "",
          row.input.colorId ?? null,
          row.framePngUrl,
          row.input.qty,
          row.sku?.id ?? "frame-only",
          row.sku?.base_function ?? "frame-only",
          row.sku ? String(row.sku.refractive_index) : "—",
          row.input.lensColorId ?? null,
          row.sku?.retail_cents ?? 0,
          row.sku?.base_function ?? null,
          row.input.lensColorId ?? null,
          row.sku?.brand_id ?? null,
          row.brand?.name_json ?? null,
          baseFnLabel ? JSON.stringify(baseFnLabel) : null,
          row.sku?.progressive_view_area ?? null,
          row.input.prescriptionId ?? null,
          rxSource,
          dbRx?.label_zh ?? null,
          dbRx?.label_en ?? null,
          rxSphOd,
          rxSphOs,
          rxCylOd,
          rxCylOs,
          rxAxisOd,
          rxAxisOs,
          rxAddOd,
          rxAddOs,
          dbRx?.prism_od ?? null,
          dbRx?.prism_base_od ?? null,
          dbRx?.prism_os ?? null,
          dbRx?.prism_base_os ?? null,
          rxPdTotal,
          rxPdOdHalf,
          rxPdOsHalf,
          dbRx?.reader_magnification ?? null,
          dbRx?.exam_date ?? null,
          dbRx?.notes ?? null,
          row.unit_frame_cents,
          row.unit_lens_cents,
          row.line_total_cents,
        );
    }),
  ]);

  if (isValidClientId(body.clientId)) {
    await writeCustomerAudit(request, {
      client_id: body.clientId,
      actor_email: email,
      action: "ORDER_CREATED",
      resource_type: "order",
      resource_id: orderId,
      meta: {
        orderNumber,
        itemCount: itemRows.length,
        totalCents: total_cents,
        country: body.shipping.country,
        affiliateSlug: attribution?.slug ?? null,
      },
    });
  }

  // If the customer is signed in to the same email, save this shipping
  // address into their address book so it shows up in the checkout
  // picker next time (and on /account → Address). Guests skip this —
  // we have no identity to attach the row to.
  const session = await getAccountSession(request);
  if (session && session.email === body.email.toLowerCase()) {
    try {
      await upsertAddressFromOrder(db, session.email, body.shipping);
    } catch {
      // Address-book write is best-effort; never fail the order on it.
    }
  }

  return Response.json({
    orderId,
    orderNumber,
    status: "pending",
    subtotalCents: subtotal,
    originalSubtotalCents: original_subtotal_cents,
    countryDiscountPct: country_discount_pct > 0 ? country_discount_pct : null,
    countryDiscountCents: country_discount_cents,
    affiliateDiscountPct: attribution ? affiliate_discount_pct : null,
    affiliateDiscountCents: affiliate_discount_cents,
    shippingCents: discounted_shipping_cents,
    taxCents: tax_cents,
    totalCents: total_cents,
    payment: {
      provider: "stripe",
      clientSecret: intent.clientSecret,
      publishableKey: payment.publishableKey,
    },
  });
}

function safeParse(s: string | null): Record<string, string> {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

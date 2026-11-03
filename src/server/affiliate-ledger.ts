// Helpers for writing to the append-only affiliate ledger.
//
// Entry points:
//   - parseRefValue(raw)               — used by order creation (body field)
//   - parseRefCookie(request)          — legacy fallback for old cookies
//   - accrueCommissionForOrder(db, id) — used by the admin paid hook
//
// Both are idempotent. Both encode the business rules in one place so they
// can't drift:
//   1. only active affiliates earn
//   2. only l2 affiliates can directly attribute customer orders
//   3. l1/l2 percentages are snapshotted on the order when it is created
//   4. one `commission_earned` row per affiliate/order (no double-credit)
//
// balance_after_cents is computed via a subquery during the INSERT — close
// enough to atomic for our scale (the only writers are infrequent admin
// actions, not user traffic).

import { nanoid } from "@/server/ids";

interface OrderRow {
  id: string;
  order_number: string | null;
  email: string;
  subtotal_cents: number;
  original_subtotal_cents: number | null;
  affiliate_slug: string | null;
  affiliate_discount_pct: number | null;
  affiliate_discount_cents: number | null;
  affiliate_l1_id: string | null;
  affiliate_l1_pct: number | null;
  affiliate_l1_cents: number | null;
  affiliate_l2_id: string | null;
  affiliate_l2_pct: number | null;
  affiliate_l2_cents: number | null;
  affiliate_commission_base_cents: number | null;
  paid_at: number | null;
  status: string;
}

interface AffiliateRow {
  id: string;
  email: string;
  role: "l1" | "l2";
  level: number;
  parent_affiliate_id: string | null;
  manager_commission_pct: number;
  commission_pct: number;
  customer_discount_pct: number;
  status: string;
}

export interface Attribution {
  slug: string;
  attributionAt: number;
  l2Id: string;
  l2Email: string;
  l2CommissionPct: number;
  customerDiscountPct: number;
  l1Id: string | null;
  l1Level: number | null;
  totalPoolPct: number | null;
  l1CommissionPct: number;
}

export interface RefCookie {
  slug: string;
  writtenAt: number;
}

// Parse a `<urlencoded slug>.<writtenAt_ms>` value (the format RefCodeWriter
// in __root.tsx writes to localStorage and the old RefCookieWriter wrote to
// the lool_ref cookie). Tolerant — falls back to "now" if the timestamp half
// is missing or unparseable so a hand-written value still attributes (just
// without accurate click time).
export function parseRefValue(raw: unknown): RefCookie | null {
  if (typeof raw !== "string" || !raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) {
    const slug = safeDecode(raw);
    return slug ? { slug, writtenAt: Date.now() } : null;
  }
  const slug = safeDecode(raw.slice(0, dot));
  if (!slug) return null;
  const ts = Number(raw.slice(dot + 1));
  return { slug, writtenAt: Number.isFinite(ts) ? ts : Date.now() };
}

// Fallback for users who set their attribution before we switched to
// localStorage: read the old `lool_ref` cookie from the request headers.
export function parseRefCookie(request: Request): RefCookie | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith("lool_ref=")) continue;
    return parseRefValue(trimmed.slice("lool_ref=".length));
  }
  return null;
}

export function poolPctForLevel(level: number): number {
  const normalized = Math.min(6, Math.max(1, Math.trunc(level)));
  return 0.08 + normalized * 0.02;
}

export function affiliatePoolPctForSplit(input: {
  parentLevel?: number | null;
  l1Pct?: number | null;
  l2Pct?: number | null;
  customerDiscountPct?: number | null;
}): number {
  if (input.parentLevel) return poolPctForLevel(input.parentLevel);
  return (
    Math.max(0, input.l1Pct ?? 0) +
    Math.max(0, input.l2Pct ?? 0) +
    Math.max(0, input.customerDiscountPct ?? 0)
  );
}

function safeDecode(s: string): string | null {
  try {
    const decoded = decodeURIComponent(s);
    // Slugs we mint are 8 hex chars; allow a slightly wider charset for
    // defensive parsing (alphanum + hyphen/underscore, capped length).
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

// Returns the affiliate slug + email if the slug resolves to an active l2
// affiliate. Returns null otherwise — callers should treat that as "don't
// attribute this order".
export async function resolveAttribution(
  db: D1Database,
  ref: RefCookie,
  _buyerEmail: string,
): Promise<Attribution | null> {
  const aff = await db
    .prepare(
      `SELECT id, email, role, level, parent_affiliate_id, manager_commission_pct,
              status, commission_pct, customer_discount_pct
         FROM affiliates WHERE slug = ?`,
    )
    .bind(ref.slug)
    .first<AffiliateRow>();
  if (!aff) return null;
  if (aff.status !== "active") return null;
  if (aff.role !== "l2") return null;

  const parent = aff.parent_affiliate_id
    ? await db
        .prepare("SELECT id, role, level, status FROM affiliates WHERE id = ?")
        .bind(aff.parent_affiliate_id)
        .first<{ id: string; role: string; level: number; status: string }>()
    : null;
  const activeParent =
    parent?.role === "l1" && parent.status === "active" ? parent : null;
  const l1CommissionPct = activeParent
    ? Math.max(0, aff.manager_commission_pct ?? 0)
    : 0;
  const l2CommissionPct = Math.max(0, aff.commission_pct ?? 0);
  const totalPoolPct = affiliatePoolPctForSplit({
    parentLevel: activeParent?.level ?? null,
    l1Pct: l1CommissionPct,
    l2Pct: l2CommissionPct,
    customerDiscountPct: aff.customer_discount_pct ?? 0,
  });
  const maxCustomerDiscountPct = Math.max(
    0,
    totalPoolPct - l1CommissionPct - l2CommissionPct,
  );
  const customerDiscountPct = Math.min(
    aff.customer_discount_pct ?? 0,
    maxCustomerDiscountPct,
  );

  return {
    slug: ref.slug,
    attributionAt: ref.writtenAt,
    l2Id: aff.id,
    l2Email: aff.email,
    l2CommissionPct,
    customerDiscountPct,
    l1Id: activeParent?.id ?? null,
    l1Level: activeParent?.level ?? null,
    totalPoolPct,
    l1CommissionPct,
  };
}

// Idempotent. Writes a `commission_earned` ledger entry for the given order,
// or skips and returns null if:
//   - the order doesn't exist or carries no affiliate_slug
//   - the affiliate is gone or suspended
//   - a `commission_earned` row already exists for this order
//   - the computed commission is zero or negative
export async function accrueCommissionForOrder(
  db: D1Database,
  orderId: string,
): Promise<string | null> {
  const order = await db
    .prepare(
      `SELECT id, order_number, email, subtotal_cents, original_subtotal_cents,
              affiliate_slug, affiliate_discount_pct, affiliate_discount_cents,
              paid_at, status
         FROM orders WHERE id = ?`,
    )
    .bind(orderId)
    .first<OrderRow>();
  if (!order || !order.affiliate_slug) return null;

  const aff = await db
    .prepare("SELECT id, email, role, status FROM affiliates WHERE slug = ?")
    .bind(order.affiliate_slug)
    .first<{ id: string; email: string; role: string; status: string }>();
  if (!aff || aff.status !== "active" || aff.role !== "l2") return null;

  const now = Date.now();
  const baseCents =
    order.affiliate_commission_base_cents ??
    order.original_subtotal_cents ??
    order.subtotal_cents;
  const ids: string[] = [];
  if (order.affiliate_l2_id && (order.affiliate_l2_cents ?? 0) > 0) {
    const id = await insertCommissionEntry(db, {
      affiliateId: order.affiliate_l2_id,
      orderId,
      occurredAt: order.paid_at ?? now,
      amountCents: order.affiliate_l2_cents ?? 0,
      description: `Order ${order.order_number ?? order.id} — L2 commission ${(baseCents / 100).toFixed(2)} × ${pct(order.affiliate_l2_pct ?? 0)}`,
      now,
    });
    if (id) ids.push(id);
  }
  if (order.affiliate_l1_id && (order.affiliate_l1_cents ?? 0) > 0) {
    const id = await insertCommissionEntry(db, {
      affiliateId: order.affiliate_l1_id,
      orderId,
      occurredAt: order.paid_at ?? now,
      amountCents: order.affiliate_l1_cents ?? 0,
      description: `Order ${order.order_number ?? order.id} — L1 management commission ${(baseCents / 100).toFixed(2)} × ${pct(order.affiliate_l1_pct ?? 0)}`,
      now,
    });
    if (id) ids.push(id);
  }
  return ids[0] ?? null;
}

async function insertCommissionEntry(
  db: D1Database,
  input: {
    affiliateId: string;
    orderId: string;
    occurredAt: number;
    amountCents: number;
    description: string;
    now: number;
  },
): Promise<string | null> {
  const existing = await db
    .prepare(
      "SELECT id FROM affiliate_ledger_entries WHERE affiliate_id = ? AND order_id = ? AND kind = 'commission_earned'",
    )
    .bind(input.affiliateId, input.orderId)
    .first();
  if (existing || input.amountCents <= 0) return null;
  const id = nanoid();
  await db
    .prepare(
      `INSERT INTO affiliate_ledger_entries
         (id, affiliate_id, occurred_at, kind, delta_cents,
          balance_after_cents, order_id, description, created_at)
       VALUES (
         ?, ?, ?, 'commission_earned', ?,
         COALESCE((SELECT SUM(delta_cents) FROM affiliate_ledger_entries WHERE affiliate_id = ?), 0) + ?,
         ?, ?, ?
       )`,
    )
    .bind(
      id,
      input.affiliateId,
      input.occurredAt,
      input.amountCents,
      input.affiliateId,
      input.amountCents,
      input.orderId,
      input.description,
      input.now,
    )
    .run();
  return id;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

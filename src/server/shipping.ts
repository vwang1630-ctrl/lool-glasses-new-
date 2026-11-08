import type { getDB } from "@/server/db";

type DB = ReturnType<typeof getDB>;

export interface ShippingRule {
  country_code: string;
  shipping_cents: number;
  free_shipping_threshold_cents: number;
  country_discount_pct: number;
  updated_at?: number;
}

export interface ShippingQuote {
  rule: ShippingRule;
  shippingCents: number;
  freeShippingThresholdCents: number;
  shippingCostCents: number;
}

export const ROW_SHIPPING_RULE: ShippingRule = {
  country_code: "row",
  shipping_cents: 990,
  free_shipping_threshold_cents: 6900,
  country_discount_pct: 0,
};

export function normalizeShippingCountryCode(
  raw: string | null | undefined,
): string {
  const code = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!code) return "row";
  if (code === "row") return "row";
  return /^[a-z]{2}$/.test(code) ? code : "row";
}

export async function listShippingRules(db: DB): Promise<ShippingRule[]> {
  const res = await db
    .prepare(
      `SELECT country_code, shipping_cents, free_shipping_threshold_cents,
              COALESCE(country_discount_pct, 0) AS country_discount_pct,
              updated_at
         FROM shipping_rules
        ORDER BY CASE WHEN country_code = 'row' THEN 0 ELSE 1 END, country_code ASC`,
    )
    .all<ShippingRule>();
  const rows = res.results ?? [];
  if (!rows.some((r) => r.country_code === "row"))
    return [ROW_SHIPPING_RULE, ...rows];
  return rows;
}

export async function getShippingRuleForCountry(
  db: DB,
  countryCode: string | null | undefined,
): Promise<ShippingRule> {
  const country = normalizeShippingCountryCode(countryCode);
  const row = await db
    .prepare(
      `SELECT country_code, shipping_cents, free_shipping_threshold_cents,
              COALESCE(country_discount_pct, 0) AS country_discount_pct,
              updated_at
         FROM shipping_rules
        WHERE country_code IN (?, 'row')
        ORDER BY CASE WHEN country_code = ? THEN 0 WHEN country_code = 'row' THEN 1 ELSE 2 END
        LIMIT 1`,
    )
    .bind(country, country)
    .first<ShippingRule>();
  return row ?? ROW_SHIPPING_RULE;
}

export function quoteShipping(
  rule: ShippingRule,
  originalSubtotalCents: number,
): ShippingQuote {
  const threshold = Math.max(0, Math.trunc(rule.free_shipping_threshold_cents));
  const shippingCost = Math.max(0, Math.trunc(rule.shipping_cents));
  const free = originalSubtotalCents >= threshold;
  return {
    rule,
    shippingCents: free ? 0 : shippingCost,
    freeShippingThresholdCents: threshold,
    shippingCostCents: shippingCost,
  };
}

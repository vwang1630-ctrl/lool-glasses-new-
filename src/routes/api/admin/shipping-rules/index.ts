// GET/POST/DELETE /api/admin/shipping-rules
// Admin-managed country shipping rules. `row` is the fallback rule.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";
import {
  listShippingRules,
  normalizeShippingCountryCode,
} from "@/server/shipping";

function cents(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export const Route = createFileRoute("/api/admin/shipping-rules/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        return Response.json({ rules: await listShippingRules(getDB()) });
      },

      POST: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const countryCode = normalizeShippingCountryCode(
          (body.countryCode ?? body.country_code) as string | undefined,
        );
        if (countryCode !== "row" && !/^[a-z]{2}$/.test(countryCode)) {
          return Response.json(
            { error: "invalid_country_code" },
            { status: 400 },
          );
        }
        const shippingCents = cents(body.shippingCents ?? body.shipping_cents);
        const thresholdCents = cents(
          body.freeShippingThresholdCents ?? body.free_shipping_threshold_cents,
        );
        const countryDiscountPctRaw =
          body.countryDiscountPct ??
          body.country_discount_pct ??
          body.discountPct ??
          0;
        const countryDiscountPct =
          typeof countryDiscountPctRaw === "number"
            ? countryDiscountPctRaw
            : Number(countryDiscountPctRaw);
        if (shippingCents == null) {
          return Response.json(
            { error: "invalid_shipping_cents" },
            { status: 400 },
          );
        }
        if (thresholdCents == null) {
          return Response.json(
            { error: "invalid_free_shipping_threshold_cents" },
            { status: 400 },
          );
        }
        if (
          !Number.isFinite(countryDiscountPct) ||
          countryDiscountPct < 0 ||
          countryDiscountPct > 1
        ) {
          return Response.json(
            { error: "invalid_country_discount_pct" },
            { status: 400 },
          );
        }

        const now = Date.now();
        const db = getDB();
        await db
          .prepare(
            `INSERT INTO shipping_rules (
               country_code, shipping_cents, free_shipping_threshold_cents,
               country_discount_pct, created_at, updated_at
             ) VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(country_code) DO UPDATE SET
               shipping_cents = excluded.shipping_cents,
               free_shipping_threshold_cents = excluded.free_shipping_threshold_cents,
               country_discount_pct = excluded.country_discount_pct,
               updated_at = excluded.updated_at`,
          )
          .bind(
            countryCode,
            shippingCents,
            thresholdCents,
            countryDiscountPct,
            now,
            now,
          )
          .run();

        await writeAudit(request, {
          action: "PUT",
          resource_type: "shipping_rules",
          resource_id: countryCode,
          after: { shippingCents, thresholdCents, countryDiscountPct },
        });

        return Response.json({ ok: true, rules: await listShippingRules(db) });
      },

      DELETE: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }

        const url = new URL(request.url);
        const countryCode = normalizeShippingCountryCode(
          url.searchParams.get("countryCode"),
        );
        if (countryCode === "row") {
          return Response.json({ error: "cannot_delete_row" }, { status: 400 });
        }

        const db = getDB();
        await db
          .prepare("DELETE FROM shipping_rules WHERE country_code = ?")
          .bind(countryCode)
          .run();
        await writeAudit(request, {
          action: "DELETE",
          resource_type: "shipping_rules",
          resource_id: countryCode,
        });
        return Response.json({ ok: true, rules: await listShippingRules(db) });
      },
    },
  },
});

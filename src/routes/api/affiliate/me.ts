// GET /api/affiliate/me
// Returns the signed-in user's affiliate profile, balances, and recent ledger
// entries. Status semantics:
//   401 — not signed in
//   404 — signed in but has no admin-created affiliate row
//   403 — affiliate row exists but is suspended
//   200 — active affiliate row exists; payload includes slug + balances + entries

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { affiliatePoolPctForSplit } from "@/server/affiliate-ledger";
import {
  buildRefreshedAffiliateCookie,
  getAffiliateIdentity,
} from "@/server/affiliate-session";

const LOCK_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const LEDGER_PAGE_LIMIT = 200;

export const Route = createFileRoute("/api/affiliate/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const identity = await getAffiliateIdentity(request);
        if (!identity) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const db = getDB();
        const headers = {
          "Set-Cookie": await buildRefreshedAffiliateCookie(identity),
        };

        const aff = await db
          .prepare(
            `SELECT id, slug, role, level, parent_affiliate_id, manager_commission_pct,
                    commission_pct, customer_discount_pct, payout_method, payout_account,
                    status, created_at
               FROM affiliates WHERE id = ? AND email = ?`,
          )
          .bind(identity.id, identity.email)
          .first<{
            id: string;
            slug: string;
            role: "l1" | "l2";
            level: number;
            parent_affiliate_id: string | null;
            manager_commission_pct: number;
            commission_pct: number;
            customer_discount_pct: number;
            payout_method: string | null;
            payout_account: string | null;
            status: string;
            created_at: number;
          }>();

        if (!aff) {
          return Response.json(
            { error: "affiliate_not_found" },
            { status: 404, headers },
          );
        }
        if (aff.status !== "active") {
          return Response.json(
            { error: "affiliate_suspended" },
            { status: 403, headers },
          );
        }

        // Three balance figures, all derived from the same append-only ledger:
        //   lifetime  = SUM(delta) across all entries
        //   locked    = SUM(commission_earned/reversed within the last 30 days)
        //               — earnings that haven't cleared the refund-safety window
        //   available = lifetime - locked  — what admin can settle today
        const cutoffMs = Date.now() - LOCK_WINDOW_MS;
        const lifetimeRow = await db
          .prepare(
            "SELECT COALESCE(SUM(delta_cents), 0) AS s FROM affiliate_ledger_entries WHERE affiliate_id = ?",
          )
          .bind(aff.id)
          .first<{ s: number }>();
        const lockedRow = await db
          .prepare(
            "SELECT COALESCE(SUM(delta_cents), 0) AS s FROM affiliate_ledger_entries WHERE affiliate_id = ? AND kind IN ('commission_earned','commission_reversed') AND occurred_at > ?",
          )
          .bind(aff.id, cutoffMs)
          .first<{ s: number }>();
        const lifetime = lifetimeRow?.s ?? 0;
        const locked = lockedRow?.s ?? 0;

        const entriesRes = await db
          .prepare(
            "SELECT id, occurred_at, kind, delta_cents, balance_after_cents, order_id, payout_id, description FROM affiliate_ledger_entries WHERE affiliate_id = ? ORDER BY occurred_at DESC, id DESC LIMIT ?",
          )
          .bind(aff.id, LEDGER_PAGE_LIMIT)
          .all<{
            id: string;
            occurred_at: number;
            kind: string;
            delta_cents: number;
            balance_after_cents: number;
            order_id: string | null;
            payout_id: string | null;
            description: string;
          }>();
        const entries = (entriesRes.results ?? []).map((r) => ({
          id: r.id,
          occurredAt: r.occurred_at,
          kind: r.kind,
          deltaCents: r.delta_cents,
          balanceAfterCents: r.balance_after_cents,
          orderId: r.order_id,
          payoutId: r.payout_id,
          description: r.description,
        }));
        const parentLevel =
          aff.role === "l2" && aff.parent_affiliate_id
            ? await db
                .prepare("SELECT level FROM affiliates WHERE id = ?")
                .bind(aff.parent_affiliate_id)
                .first<{ level: number }>()
            : null;
        const totalPoolPct =
          aff.role === "l2"
            ? affiliatePoolPctForSplit({
                parentLevel: parentLevel?.level ?? null,
                l1Pct: aff.manager_commission_pct ?? 0,
                l2Pct: aff.commission_pct,
                customerDiscountPct: aff.customer_discount_pct ?? 0,
              })
            : aff.commission_pct;
        const maxCustomerDiscountPct =
          aff.role === "l2"
            ? Math.max(0, totalPoolPct - (aff.manager_commission_pct ?? 0))
            : 0;

        return Response.json(
          {
            email: identity.email,
            slug: aff.slug,
            role: aff.role,
            level: aff.level,
            parentAffiliateId: aff.parent_affiliate_id,
            managerCommissionPct: aff.manager_commission_pct ?? 0,
            commissionPct: aff.commission_pct,
            customerDiscountPct: aff.customer_discount_pct ?? 0,
            maxCustomerDiscountPct,
            payoutMethod: aff.payout_method,
            payoutAccount: aff.payout_account,
            status: aff.status,
            createdAt: aff.created_at,
            balances: {
              lifetimeCents: lifetime,
              lockedCents: locked,
              availableCents: lifetime - locked,
            },
            entries,
          },
          { headers },
        );
      },

      PATCH: async ({ request }) => {
        const identity = await getAffiliateIdentity(request);
        if (!identity) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const raw = body.customerDiscountPct ?? body.customer_discount_pct;
        const discountPct = typeof raw === "number" ? raw : Number(raw);
        if (!Number.isFinite(discountPct) || discountPct < 0) {
          return Response.json(
            { error: "invalid_customer_discount_pct" },
            { status: 400 },
          );
        }

        const db = getDB();
        const aff = await db
          .prepare(
            `SELECT a.id, a.role, a.commission_pct, a.customer_discount_pct,
                    a.manager_commission_pct, a.status,
                    p.level AS parent_level
               FROM affiliates a
               LEFT JOIN affiliates p ON p.id = a.parent_affiliate_id
              WHERE a.id = ? AND a.email = ?`,
          )
          .bind(identity.id, identity.email)
          .first<{
            id: string;
            role: string;
            commission_pct: number;
            customer_discount_pct: number;
            manager_commission_pct: number;
            status: string;
            parent_level: number | null;
          }>();

        if (!aff)
          return Response.json(
            { error: "affiliate_not_found" },
            { status: 404 },
          );
        if (aff.status !== "active") {
          return Response.json(
            { error: "affiliate_suspended" },
            { status: 403 },
          );
        }
        if (aff.role !== "l2") {
          return Response.json(
            { error: "discount_only_for_l2" },
            { status: 403 },
          );
        }

        const totalPoolPct = affiliatePoolPctForSplit({
          parentLevel: aff.parent_level,
          l1Pct: aff.manager_commission_pct ?? 0,
          l2Pct: aff.commission_pct,
          customerDiscountPct: aff.customer_discount_pct ?? 0,
        });
        const maxDiscountPct = Math.max(
          0,
          totalPoolPct - (aff.manager_commission_pct ?? 0),
        );
        if (discountPct > maxDiscountPct + 0.000001) {
          return Response.json(
            {
              error: "customer_discount_too_high",
              maxCustomerDiscountPct: maxDiscountPct,
            },
            { status: 400 },
          );
        }
        const nextCommissionPct = Math.max(0, maxDiscountPct - discountPct);

        await db
          .prepare(
            "UPDATE affiliates SET commission_pct = ?, customer_discount_pct = ?, updated_at = ? WHERE id = ?",
          )
          .bind(nextCommissionPct, discountPct, Date.now(), aff.id)
          .run();

        return Response.json(
          {
            ok: true,
            commissionPct: nextCommissionPct,
            customerDiscountPct: discountPct,
            maxCustomerDiscountPct: maxDiscountPct,
          },
          {
            headers: {
              "Set-Cookie": await buildRefreshedAffiliateCookie(identity),
            },
          },
        );
      },
    },
  },
});

// GET/POST/PATCH /api/affiliate/children
// First-tier affiliates manage their own second-tier affiliates here.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { affiliatePoolPctForSplit } from "@/server/affiliate-ledger";
import {
  buildRefreshedAffiliateCookie,
  getAffiliateIdentity,
} from "@/server/affiliate-session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genHex(bytes: number): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function uniqueSlug(db: ReturnType<typeof getDB>): Promise<string> {
  let slug = genHex(4);
  for (let attempt = 0; attempt < 5; attempt++) {
    const collide = await db
      .prepare("SELECT id FROM affiliates WHERE slug = ?")
      .bind(slug)
      .first();
    if (!collide) return slug;
    slug = genHex(4);
  }
  return `${genHex(4)}${Date.now().toString(36).slice(-2)}`;
}

async function requireL1(request: Request) {
  const identity = await getAffiliateIdentity(request);
  if (!identity) {
    return { error: Response.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const db = getDB();
  const affiliate = await db
    .prepare(
      "SELECT id, email, role, level, status FROM affiliates WHERE email = ?",
    )
    .bind(identity.email)
    .first<{
      id: string;
      email: string;
      role: string;
      level: number;
      status: string;
    }>();
  if (!affiliate) {
    return {
      error: Response.json({ error: "affiliate_not_found" }, { status: 404 }),
    };
  }
  if (affiliate.status !== "active") {
    return {
      error: Response.json({ error: "affiliate_suspended" }, { status: 403 }),
    };
  }
  if (affiliate.role !== "l1") {
    return { error: Response.json({ error: "l1_only" }, { status: 403 }) };
  }
  return {
    db,
    affiliate,
    identity,
    headers: { "Set-Cookie": await buildRefreshedAffiliateCookie(identity) },
  };
}

export const Route = createFileRoute("/api/affiliate/children")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ctx = await requireL1(request);
        if ("error" in ctx) return ctx.error;
        const res = await ctx.db
          .prepare(
            `SELECT id, email, slug, manager_commission_pct, commission_pct,
                    customer_discount_pct, status, notes, created_at, updated_at,
                    (SELECT COUNT(*) FROM orders WHERE affiliate_slug = a.slug) AS attributed_order_count,
                    COALESCE(
                      (SELECT SUM(delta_cents) FROM affiliate_ledger_entries WHERE affiliate_id = a.id),
                      0
                    ) AS lifetime_cents
               FROM affiliates a
              WHERE parent_affiliate_id = ? AND role = 'l2'
              ORDER BY created_at DESC`,
          )
          .bind(ctx.affiliate.id)
          .all();
        return Response.json(
          {
            children: res.results ?? [],
            poolPct: affiliatePoolPctForSplit({
              parentLevel: ctx.affiliate.level,
            }),
          },
          { headers: ctx.headers },
        );
      },

      POST: async ({ request }) => {
        const ctx = await requireL1(request);
        if ("error" in ctx) return ctx.error;

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const email = String(body.email ?? "")
          .trim()
          .toLowerCase();
        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }
        if (email === ctx.identity.email) {
          return Response.json(
            { error: "cannot_invite_self" },
            { status: 400 },
          );
        }

        const managerPct = Number(
          body.manager_commission_pct ?? body.managerCommissionPct ?? 0,
        );
        const commissionPct = Number(
          body.commission_pct ?? body.commissionPct ?? 0,
        );
        const discountPct = 0;
        for (const [key, value] of [
          ["manager_commission_pct", managerPct],
          ["commission_pct", commissionPct],
        ] as const) {
          if (!Number.isFinite(value) || value < 0 || value > 1) {
            return Response.json({ error: `invalid_${key}` }, { status: 400 });
          }
        }

        const totalPoolPct = affiliatePoolPctForSplit({
          parentLevel: ctx.affiliate.level,
        });
        if (
          managerPct + commissionPct + discountPct >
          totalPoolPct + 0.000001
        ) {
          return Response.json(
            { error: "affiliate_pool_exceeded", poolPct: totalPoolPct },
            { status: 400 },
          );
        }

        const id = genHex(8);
        const slug = await uniqueSlug(ctx.db);
        const now = Date.now();
        const notes =
          body.notes == null || body.notes === "" ? null : String(body.notes);
        try {
          await ctx.db
            .prepare(
              `INSERT INTO affiliates (
                id, email, slug, role, level, parent_affiliate_id, manager_commission_pct,
                commission_pct, customer_discount_pct, status, notes, created_at, updated_at
              ) VALUES (?, ?, ?, 'l2', 1, ?, ?, ?, ?, 'active', ?, ?, ?)`,
            )
            .bind(
              id,
              email,
              slug,
              ctx.affiliate.id,
              managerPct,
              commissionPct,
              discountPct,
              notes,
              now,
              now,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.toLowerCase().includes("unique")) {
            return Response.json(
              { error: "email_already_affiliate" },
              { status: 409 },
            );
          }
          return Response.json(
            { error: "create_failed", message: msg },
            { status: 500 },
          );
        }

        return Response.json(
          { ok: true, id, email, slug },
          { headers: ctx.headers },
        );
      },

      PATCH: async ({ request }) => {
        const ctx = await requireL1(request);
        if ("error" in ctx) return ctx.error;

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const id = String(body.id ?? "").trim();
        if (!id) {
          return Response.json({ error: "missing_id" }, { status: 400 });
        }
        const child = await ctx.db
          .prepare(
            `SELECT id, commission_pct, customer_discount_pct
               FROM affiliates
              WHERE id = ? AND parent_affiliate_id = ? AND role = 'l2'`,
          )
          .bind(id, ctx.affiliate.id)
          .first<{
            id: string;
            commission_pct: number;
            customer_discount_pct: number;
          }>();
        if (!child) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }

        const managerPct = Number(
          body.manager_commission_pct ?? body.managerCommissionPct ?? 0,
        );
        const commissionPct = Number(
          body.commission_pct ?? body.commissionPct ?? 0,
        );
        const discountPct = Number(child.customer_discount_pct ?? 0);
        for (const [key, value] of [
          ["manager_commission_pct", managerPct],
          ["commission_pct", commissionPct],
        ] as const) {
          if (!Number.isFinite(value) || value < 0 || value > 1) {
            return Response.json({ error: `invalid_${key}` }, { status: 400 });
          }
        }
        if (commissionPct + 0.000001 < Number(child.commission_pct ?? 0)) {
          return Response.json(
            { error: "l2_commission_cannot_decrease" },
            { status: 400 },
          );
        }

        const totalPoolPct = affiliatePoolPctForSplit({
          parentLevel: ctx.affiliate.level,
        });
        if (
          managerPct + commissionPct + discountPct >
          totalPoolPct + 0.000001
        ) {
          return Response.json(
            { error: "affiliate_pool_exceeded", poolPct: totalPoolPct },
            { status: 400 },
          );
        }

        const notes =
          body.notes == null || body.notes === "" ? null : String(body.notes);
        await ctx.db
          .prepare(
            `UPDATE affiliates
                SET manager_commission_pct = ?,
                    commission_pct = ?,
                    notes = ?,
                    updated_at = ?
              WHERE id = ? AND parent_affiliate_id = ? AND role = 'l2'`,
          )
          .bind(
            managerPct,
            commissionPct,
            notes,
            Date.now(),
            id,
            ctx.affiliate.id,
          )
          .run();

        return Response.json({ ok: true, id }, { headers: ctx.headers });
      },
    },
  },
});

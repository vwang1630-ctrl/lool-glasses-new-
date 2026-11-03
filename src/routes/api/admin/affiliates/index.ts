// GET  /api/admin/affiliates — list affiliates with rolled-up balance.
// POST /api/admin/affiliates — create an admin-approved affiliate row.
//
// Balance is computed inline (SUM over the ledger) rather than denormalized
// onto affiliates row; we trust the read cost since the admin list is small
// and the ledger never explodes.
//
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";
import { affiliatePoolPctForSplit } from "@/server/affiliate-ledger";

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

export const Route = createFileRoute("/api/admin/affiliates/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();

        // One pass — affiliates left-joined with the per-affiliate ledger
        // sum. The lifetime figure is total credit minus payouts; the locked
        // figure is the recent (last 30 days) commission_earned/reversed
        // window. Available = lifetime − locked is computed on the client to
        // keep the SQL readable.
        const cutoffMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const res = await db
          .prepare(
            `SELECT a.id, a.email, a.slug, a.role, a.level, a.parent_affiliate_id,
                    p.email AS parent_email,
                    a.manager_commission_pct,
                    a.commission_pct, a.customer_discount_pct,
                    a.payout_method, a.payout_account, a.status, a.notes,
                    a.created_at, a.updated_at,
                    COALESCE(
                      (SELECT SUM(delta_cents) FROM affiliate_ledger_entries WHERE affiliate_id = a.id),
                      0
                    ) AS lifetime_cents,
                    COALESCE(
                      (SELECT SUM(delta_cents) FROM affiliate_ledger_entries
                        WHERE affiliate_id = a.id
                          AND kind IN ('commission_earned','commission_reversed')
                          AND occurred_at > ?),
                      0
                    ) AS locked_cents,
                    (SELECT COUNT(*) FROM orders WHERE affiliate_slug = a.slug) AS attributed_order_count
             FROM affiliates a
             LEFT JOIN affiliates p ON p.id = a.parent_affiliate_id
             ORDER BY a.created_at DESC`,
          )
          .bind(cutoffMs)
          .all<{
            id: string;
            email: string;
            slug: string;
            role: string;
            level: number;
            parent_affiliate_id: string | null;
            parent_email: string | null;
            manager_commission_pct: number;
            commission_pct: number;
            customer_discount_pct: number;
            payout_method: string | null;
            payout_account: string | null;
            status: string;
            notes: string | null;
            created_at: number;
            updated_at: number;
            lifetime_cents: number;
            locked_cents: number;
            attributed_order_count: number;
          }>();
        return Response.json({ affiliates: res.results ?? [] });
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

        const email = String(body.email ?? "")
          .trim()
          .toLowerCase();
        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }

        const role = body.role === "l1" ? "l1" : "l2";
        if (role !== "l1") {
          return Response.json(
            { error: "admin_can_only_create_l1" },
            { status: 403 },
          );
        }
        const level =
          role === "l1"
            ? body.level == null || body.level === ""
              ? 1
              : Number(body.level)
            : 1;
        if (!Number.isInteger(level) || level < 1 || level > 6) {
          return Response.json({ error: "invalid_level" }, { status: 400 });
        }
        const parentAffiliateId =
          role === "l2" && body.parent_affiliate_id
            ? String(body.parent_affiliate_id).trim()
            : null;
        const managerCommissionPct =
          role === "l2" &&
          body.manager_commission_pct != null &&
          body.manager_commission_pct !== ""
            ? Number(body.manager_commission_pct)
            : 0;
        if (
          !Number.isFinite(managerCommissionPct) ||
          managerCommissionPct < 0 ||
          managerCommissionPct > 1
        ) {
          return Response.json(
            { error: "invalid_manager_commission_pct" },
            { status: 400 },
          );
        }

        const commissionPct =
          body.commission_pct == null || body.commission_pct === ""
            ? role === "l1"
              ? 0
              : 0.05
            : Number(body.commission_pct);
        if (
          !Number.isFinite(commissionPct) ||
          commissionPct < 0 ||
          commissionPct > 1
        ) {
          return Response.json(
            { error: "invalid_commission_pct" },
            { status: 400 },
          );
        }
        const customerDiscountPct =
          body.customer_discount_pct == null ||
          body.customer_discount_pct === ""
            ? 0
            : Number(body.customer_discount_pct);
        if (!Number.isFinite(customerDiscountPct) || customerDiscountPct < 0) {
          return Response.json(
            { error: "invalid_customer_discount_pct" },
            { status: 400 },
          );
        }

        const db = getDB();
        let parentLevel: number | null = null;
        if (parentAffiliateId) {
          const parent = await db
            .prepare(
              "SELECT id, role, level, status FROM affiliates WHERE id = ?",
            )
            .bind(parentAffiliateId)
            .first<{
              id: string;
              role: string;
              level: number;
              status: string;
            }>();
          if (!parent || parent.role !== "l1") {
            return Response.json(
              { error: "invalid_parent_affiliate" },
              { status: 400 },
            );
          }
          parentLevel = parent.level;
        }
        const totalPoolPct = affiliatePoolPctForSplit({
          parentLevel,
          l1Pct: managerCommissionPct,
          l2Pct: commissionPct,
          customerDiscountPct,
        });
        if (
          role === "l2" &&
          managerCommissionPct + commissionPct + customerDiscountPct >
            totalPoolPct + 0.000001
        ) {
          return Response.json(
            { error: "affiliate_pool_exceeded" },
            { status: 400 },
          );
        }

        const id = genHex(8);
        const slug = await uniqueSlug(db);
        const now = Date.now();
        const notes =
          body.notes == null || body.notes === "" ? null : String(body.notes);

        try {
          await db
            .prepare(
              `INSERT INTO affiliates (
                id, email, slug, role, level, parent_affiliate_id, manager_commission_pct,
                commission_pct, customer_discount_pct, status, notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
            )
            .bind(
              id,
              email,
              slug,
              role,
              level,
              parentAffiliateId,
              managerCommissionPct,
              commissionPct,
              role === "l2" ? customerDiscountPct : 0,
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

        await writeAudit(request, {
          action: "POST",
          resource_type: "affiliates",
          resource_id: id,
          before: null,
          after: {
            email,
            slug,
            role,
            level,
            parent_affiliate_id: parentAffiliateId,
            manager_commission_pct: managerCommissionPct,
            commission_pct: commissionPct,
            customer_discount_pct: role === "l2" ? customerDiscountPct : 0,
            status: "active",
            notes,
          },
        });

        return Response.json({ ok: true, id, email, slug });
      },
    },
  },
});

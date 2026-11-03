// GET   /api/admin/affiliates/:id  — full affiliate row + recent ledger
// PATCH /api/admin/affiliates/:id  — adjust commission/discount, status, payout info, notes
//
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";
import { affiliatePoolPctForSplit } from "@/server/affiliate-ledger";

const VALID_STATUS = new Set(["active", "suspended"]);
const STR = new Set([
  "payout_method",
  "payout_account",
  "notes",
  "parent_affiliate_id",
]);

export const Route = createFileRoute("/api/admin/affiliates/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        const aff = await db
          .prepare("SELECT * FROM affiliates WHERE id = ?")
          .bind(params.id)
          .first();
        if (!aff) return Response.json({ error: "not_found" }, { status: 404 });
        const entries = await db
          .prepare(
            "SELECT * FROM affiliate_ledger_entries WHERE affiliate_id = ? ORDER BY occurred_at DESC, id DESC LIMIT 500",
          )
          .bind(params.id)
          .all();
        return Response.json({
          affiliate: aff,
          entries: entries.results ?? [],
        });
      },

      PATCH: async ({ request, params }) => {
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

        const sets: string[] = [];
        const binds: unknown[] = [];
        for (const [k, v] of Object.entries(body)) {
          if (k === "commission_pct") {
            const n = typeof v === "number" ? v : Number(v);
            if (!Number.isFinite(n) || n < 0 || n > 1) {
              return Response.json(
                { error: "invalid_commission_pct" },
                { status: 400 },
              );
            }
            sets.push("commission_pct = ?");
            binds.push(n);
          } else if (k === "manager_commission_pct") {
            const n = typeof v === "number" ? v : Number(v);
            if (!Number.isFinite(n) || n < 0 || n > 1) {
              return Response.json(
                { error: "invalid_manager_commission_pct" },
                { status: 400 },
              );
            }
            sets.push("manager_commission_pct = ?");
            binds.push(n);
          } else if (k === "level") {
            const n = typeof v === "number" ? v : Number(v);
            if (!Number.isInteger(n) || n < 1 || n > 6) {
              return Response.json({ error: "invalid_level" }, { status: 400 });
            }
            sets.push("level = ?");
            binds.push(n);
          } else if (k === "role") {
            if (v !== "l1" && v !== "l2") {
              return Response.json({ error: "invalid_role" }, { status: 400 });
            }
            sets.push("role = ?");
            binds.push(v);
          } else if (k === "customer_discount_pct") {
            const n = typeof v === "number" ? v : Number(v);
            if (!Number.isFinite(n) || n < 0 || n > 0.1) {
              return Response.json(
                { error: "invalid_customer_discount_pct" },
                { status: 400 },
              );
            }
            sets.push("customer_discount_pct = ?");
            binds.push(n);
          } else if (k === "status") {
            if (typeof v !== "string" || !VALID_STATUS.has(v)) {
              return Response.json(
                { error: "invalid_status" },
                { status: 400 },
              );
            }
            sets.push("status = ?");
            binds.push(v);
          } else if (STR.has(k)) {
            sets.push(`${k} = ?`);
            binds.push(v == null || v === "" ? null : String(v));
          }
        }
        if (sets.length === 0) {
          return Response.json({ error: "nothing_to_update" }, { status: 400 });
        }
        sets.push("updated_at = ?");
        binds.push(Date.now());

        const db = getDB();
        const before = await db
          .prepare("SELECT * FROM affiliates WHERE id = ?")
          .bind(params.id)
          .first<{
            id: string;
            role?: string;
            level?: number;
            parent_affiliate_id?: string | null;
            manager_commission_pct?: number;
            commission_pct?: number;
            customer_discount_pct?: number;
          }>();
        if (!before)
          return Response.json({ error: "not_found" }, { status: 404 });
        const nextCommission =
          body.commission_pct == null
            ? Number(before.commission_pct ?? 0)
            : Number(body.commission_pct);
        const nextDiscount =
          body.customer_discount_pct == null
            ? Number(before.customer_discount_pct ?? 0)
            : Number(body.customer_discount_pct);
        const nextRole = String(body.role ?? before.role ?? "l2");
        const nextParentId =
          body.parent_affiliate_id === undefined
            ? (before.parent_affiliate_id ?? null)
            : body.parent_affiliate_id == null ||
                body.parent_affiliate_id === ""
              ? null
              : String(body.parent_affiliate_id);
        const nextManagerPct =
          body.manager_commission_pct == null
            ? Number(before.manager_commission_pct ?? 0)
            : Number(body.manager_commission_pct);
        if (nextParentId === params.id) {
          return Response.json(
            { error: "parent_cannot_be_self" },
            { status: 400 },
          );
        }
        let parentLevel: number | null = null;
        if (nextParentId) {
          const parent = await db
            .prepare("SELECT id, role, level FROM affiliates WHERE id = ?")
            .bind(nextParentId)
            .first<{ id: string; role: string; level: number }>();
          if (!parent || parent.role !== "l1") {
            return Response.json(
              { error: "invalid_parent_affiliate" },
              { status: 400 },
            );
          }
          parentLevel = parent.level;
        }
        if (nextRole === "l2") {
          const totalPoolPct = affiliatePoolPctForSplit({
            parentLevel,
            l1Pct: nextManagerPct,
            l2Pct: nextCommission,
            customerDiscountPct: nextDiscount,
          });
          if (
            nextManagerPct + nextCommission + nextDiscount >
            totalPoolPct + 0.000001
          ) {
            return Response.json(
              { error: "affiliate_pool_exceeded" },
              { status: 400 },
            );
          }
        }
        try {
          await db
            .prepare(`UPDATE affiliates SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }
        await writeAudit(request, {
          action: "PATCH",
          resource_type: "affiliates",
          resource_id: params.id,
          before,
          after: body,
        });
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

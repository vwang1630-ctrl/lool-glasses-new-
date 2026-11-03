// GET   /api/admin/orders/:id    — full order with items
// PATCH /api/admin/orders/:id    — update status / payment metadata; server stamps *_at timestamps
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";
import { accrueCommissionForOrder } from "@/server/affiliate-ledger";
import { isValidIsoCountry } from "@/lib/countries";

const VALID_STATUS = new Set([
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

const STATUS_TIMESTAMP_COL: Record<string, string | null> = {
  paid: "paid_at",
  shipped: "shipped_at",
  delivered: "delivered_at",
  cancelled: "cancelled_at",
  pending: null,
};

export const Route = createFileRoute("/api/admin/orders/$id")({
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
        const order = await db
          .prepare("SELECT * FROM orders WHERE id = ?")
          .bind(params.id)
          .first();
        if (!order)
          return Response.json({ error: "not_found" }, { status: 404 });
        const items = await db
          .prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id")
          .bind(params.id)
          .all();
        return Response.json({ order, items: items.results ?? [] });
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

        if (typeof body.status === "string") {
          if (!VALID_STATUS.has(body.status))
            return Response.json({ error: "invalid_status" }, { status: 400 });
          sets.push("status = ?");
          binds.push(body.status);
          const tsCol = STATUS_TIMESTAMP_COL[body.status];
          if (tsCol) {
            sets.push(`${tsCol} = COALESCE(${tsCol}, ?)`);
            binds.push(Date.now());
          }
        }
        for (const k of [
          "payment_provider",
          "payment_intent_id",
          "payment_method",
        ] as const) {
          if (k in body) {
            sets.push(`${k} = ?`);
            binds.push(body[k] == null ? null : String(body[k]));
          }
        }
        // Editable shipping address + email (NOT NULL on schema, reject empty).
        for (const k of [
          "email",
          "ship_recipient",
          "ship_country",
          "ship_zip",
          "ship_address",
          "ship_phone",
        ] as const) {
          if (k in body) {
            const v = body[k];
            if (typeof v !== "string" || v.trim().length === 0)
              return Response.json({ error: `${k}_required` }, { status: 400 });
            const trimmed = v.trim();
            if (k === "ship_country") {
              const upper = trimmed.toUpperCase();
              if (!isValidIsoCountry(upper))
                return Response.json(
                  { error: "ship_country_invalid" },
                  { status: 400 },
                );
              sets.push(`${k} = ?`);
              binds.push(upper);
              continue;
            }
            sets.push(`${k} = ?`);
            binds.push(trimmed);
          }
        }

        if (sets.length === 0)
          return Response.json({ error: "nothing_to_update" }, { status: 400 });

        const db = getDB();
        const before = (await db
          .prepare("SELECT * FROM orders WHERE id = ?")
          .bind(params.id)
          .first()) as Record<string, unknown> | null;
        try {
          await db
            .prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`)
            .bind(...binds, params.id)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "update_failed", message: msg },
            { status: 500 },
          );
        }

        // First transition into `paid` triggers the affiliate commission
        // accrual (if any). The helper is idempotent — it self-skips on a
        // retry — but we still gate on the `before` status so we only call
        // it on the real edge, not on every PATCH of an already-paid order.
        if (body.status === "paid" && before?.status !== "paid") {
          try {
            await accrueCommissionForOrder(db, params.id);
          } catch {
            // Don't let a ledger-write error roll back a successful status
            // update; the helper is safe to re-run later.
          }
        }

        await writeAudit(request, {
          action: "PATCH",
          resource_type: "orders",
          resource_id: params.id,
          before,
          after: body,
        });
        return Response.json({ ok: true, id: params.id });
      },
    },
  },
});

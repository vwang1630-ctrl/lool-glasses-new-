// POST /api/admin/cleanup
// Owner-only destructive maintenance actions for customer-facing data.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";
import { writeAudit } from "@/server/audit";

type CleanupTarget = "customers" | "orders" | "prescriptions" | "addresses";

const TARGETS = new Set<CleanupTarget>([
  "customers",
  "orders",
  "prescriptions",
  "addresses",
]);

export const Route = createFileRoute("/api/admin/cleanup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        return Response.json(await cleanupStats());
      },
      POST: async ({ request }) => {
        let admin;
        try {
          admin = await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        if (admin.role !== "owner") {
          return Response.json({ error: "owner_required" }, { status: 403 });
        }

        let body: { target?: CleanupTarget; confirm?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const target = body.target;
        if (!target || !TARGETS.has(target)) {
          return Response.json({ error: "invalid_target" }, { status: 400 });
        }
        if (body.confirm !== target) {
          return Response.json({ error: "confirm_mismatch" }, { status: 400 });
        }

        const result = await cleanupTarget(target);
        await writeAudit(request, {
          action: "DELETE",
          resource_type: "maintenance_cleanup",
          resource_id: target,
          before: result.before,
          after: result.after,
          meta: { target },
        });
        return Response.json({ ok: true, target, ...result });
      },
    },
  },
});

async function cleanupTarget(target: CleanupTarget) {
  switch (target) {
    case "customers":
      return cleanupCustomers();
    case "orders":
      return cleanupOrders();
    case "prescriptions":
      return cleanupPrescriptions();
    case "addresses":
      return cleanupAddresses();
  }
}

async function cleanupCustomers() {
  const db = getDB();
  const customers = await countTable("customers");
  const identityLinks = await countTable("customer_identity_links");
  await db.batch([
    db.prepare(
      "UPDATE orders SET customer_id = NULL WHERE customer_id IS NOT NULL",
    ),
    db.prepare("DELETE FROM customer_identity_links"),
    db.prepare("DELETE FROM customers"),
  ]);
  return {
    before: { customers, identityLinks },
    after: { customers: 0, identityLinks: 0 },
  };
}

async function cleanupStats() {
  return {
    customers: {
      customers: await countTable("customers"),
      identityLinks: await countTable("customer_identity_links"),
    },
    orders: {
      orders: await countTable("orders"),
      orderItems: await countTable("order_items"),
      shipments: await countTable("shipments"),
      shipmentEvents: await countTable("shipment_events"),
    },
    prescriptions: {
      prescriptions: await countTable("prescriptions"),
      uploadObjects: await countRows(
        "SELECT COUNT(*) AS n FROM prescriptions WHERE upload_r2_key IS NOT NULL",
      ),
      linkedOrderItems: await countRows(
        "SELECT COUNT(*) AS n FROM order_items WHERE prescription_id IS NOT NULL",
      ),
    },
    addresses: {
      addresses: await countTable("addresses"),
    },
  };
}

async function cleanupOrders() {
  const db = getDB();
  const before = {
    orders: await countTable("orders"),
    orderItems: await countTable("order_items"),
    shipments: await countTable("shipments"),
    shipmentEvents: await countTable("shipment_events"),
    affiliateLedgerEntries: await countRows(
      "SELECT COUNT(*) AS n FROM affiliate_ledger_entries WHERE order_id IS NOT NULL",
    ),
  };
  await db.batch([
    db.prepare(
      `DELETE FROM shipment_events
       WHERE shipment_id IN (SELECT id FROM shipments)`,
    ),
    db.prepare("DELETE FROM shipments"),
    db.prepare("DELETE FROM order_items"),
    db.prepare(
      "DELETE FROM affiliate_ledger_entries WHERE order_id IS NOT NULL",
    ),
    db.prepare("DELETE FROM orders"),
    db
      .prepare(
        `UPDATE customers
       SET first_order_id = NULL, first_order_at = NULL, updated_at = ?
       WHERE first_order_id IS NOT NULL OR first_order_at IS NOT NULL`,
      )
      .bind(Date.now()),
  ]);
  return {
    before,
    after: {
      orders: 0,
      orderItems: 0,
      shipments: 0,
      shipmentEvents: 0,
      affiliateLedgerEntries: 0,
    },
  };
}

async function cleanupPrescriptions() {
  const db = getDB();
  const rows = await db
    .prepare(
      "SELECT upload_r2_key FROM prescriptions WHERE upload_r2_key IS NOT NULL",
    )
    .all<{ upload_r2_key: string }>();
  const keys = (rows.results ?? []).map((r) => r.upload_r2_key).filter(Boolean);
  const before = {
    prescriptions: await countTable("prescriptions"),
    uploadObjects: keys.length,
    linkedOrderItems: await countRows(
      "SELECT COUNT(*) AS n FROM order_items WHERE prescription_id IS NOT NULL",
    ),
  };
  const bucket = (env as unknown as { RX_BUCKET?: R2Bucket }).RX_BUCKET;
  if (bucket) {
    await deleteR2Keys(bucket, keys);
  }
  await db.batch([
    db.prepare(
      "UPDATE order_items SET prescription_id = NULL WHERE prescription_id IS NOT NULL",
    ),
    db.prepare("DELETE FROM prescriptions"),
  ]);
  return {
    before,
    after: {
      prescriptions: 0,
      uploadObjects: bucket ? 0 : "bucket_missing",
      linkedOrderItems: 0,
    },
  };
}

async function cleanupAddresses() {
  const db = getDB();
  const addresses = await countTable("addresses");
  await db.prepare("DELETE FROM addresses").run();
  return { before: { addresses }, after: { addresses: 0 } };
}

async function countTable(table: string): Promise<number> {
  return countRows(`SELECT COUNT(*) AS n FROM ${table}`);
}

async function countRows(sql: string): Promise<number> {
  const row = await getDB().prepare(sql).first<{ n: number }>();
  return row?.n ?? 0;
}

async function deleteR2Keys(bucket: R2Bucket, keys: string[]) {
  for (let i = 0; i < keys.length; i += 50) {
    await Promise.all(keys.slice(i, i + 50).map((key) => bucket.delete(key)));
  }
}

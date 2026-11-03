-- Orders: extend `payment_provider` CHECK to include 'stripe'.
--
-- Previous CHECK allowed only ('airwallex','paypal'). We're switching the
-- primary payment provider to Stripe (HK entity now opens Stripe). PayPal
-- stays as a future fallback; airwallex stays in the allowed set so old
-- rows (if any) don't break the constraint.
--
-- SQLite has no ALTER CHECK CONSTRAINT. Standard rebuild pattern, mirroring
-- 0025_suppliers_extend_kind.sql: create new table under temp name, copy
-- data, two-step rename, best-effort drop. order_items.order_id FKs resolve
-- by name so the rename swap keeps cascade integrity.

-- 1. New schema under temp name. Identical to 0006_v2_schema's orders
--    definition except payment_provider CHECK now allows 'stripe'.
CREATE TABLE orders_v2 (
  id                TEXT PRIMARY KEY,
  order_number      TEXT NOT NULL UNIQUE,
  email             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  content_lang      TEXT,

  subtotal_cents    INTEGER NOT NULL,
  shipping_cents    INTEGER NOT NULL DEFAULT 0,
  tax_cents         INTEGER NOT NULL DEFAULT 0,
  total_cents       INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',

  ship_recipient    TEXT NOT NULL,
  ship_country      TEXT NOT NULL,
  ship_zip          TEXT NOT NULL,
  ship_address      TEXT NOT NULL,
  ship_phone        TEXT NOT NULL,

  payment_provider  TEXT CHECK (payment_provider IS NULL OR payment_provider IN ('airwallex','paypal','stripe')),
  payment_intent_id TEXT,
  payment_method    TEXT,

  paid_at           INTEGER,
  shipped_at        INTEGER,
  delivered_at      INTEGER,
  cancelled_at      INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- 2. Copy every row across, column-for-column.
INSERT INTO orders_v2 (
  id, order_number, email, status, content_lang,
  subtotal_cents, shipping_cents, tax_cents, total_cents, currency,
  ship_recipient, ship_country, ship_zip, ship_address, ship_phone,
  payment_provider, payment_intent_id, payment_method,
  paid_at, shipped_at, delivered_at, cancelled_at,
  created_at, updated_at
)
SELECT
  id, order_number, email, status, content_lang,
  subtotal_cents, shipping_cents, tax_cents, total_cents, currency,
  ship_recipient, ship_country, ship_zip, ship_address, ship_phone,
  payment_provider, payment_intent_id, payment_method,
  paid_at, shipped_at, delivered_at, cancelled_at,
  created_at, updated_at
FROM orders;

-- 3. Drop old indexes (they'll be recreated against the new table).
DROP INDEX IF EXISTS idx_orders_email;
DROP INDEX IF EXISTS idx_orders_status;

-- 4. Swap names. order_items.order_id references resolve by name, so the
--    cascade FK keeps working after the swap.
ALTER TABLE orders RENAME TO orders_old_v2;
ALTER TABLE orders_v2 RENAME TO orders;

-- 5. Recreate indexes on the new orders table.
CREATE INDEX idx_orders_email  ON orders(email, created_at);
CREATE INDEX idx_orders_status ON orders(status, created_at);

-- 6. Best-effort drop of the orphan. D1 may reject if FK paranoia kicks in;
--    the leftover orders_old_v2 is a harmless detached copy.
DROP TABLE IF EXISTS orders_old_v2;

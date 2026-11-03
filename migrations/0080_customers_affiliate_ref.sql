-- Customer identity + persistent affiliate attribution.
--
-- Checkout is still email-first/OTP-lightweight, but the first successful
-- order creation creates a customer row. Once a valid l2 referral is captured
-- for an email, future orders for that email use the stored referral instead
-- of whatever is currently in localStorage.

CREATE TABLE IF NOT EXISTS customers (
  id                 TEXT PRIMARY KEY,
  email              TEXT NOT NULL UNIQUE,
  affiliate_ref_slug TEXT,
  affiliate_ref_at   INTEGER,
  first_order_id     TEXT,
  first_order_at     INTEGER,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_customers_affiliate_ref
  ON customers(affiliate_ref_slug);

ALTER TABLE orders ADD COLUMN customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id
  ON orders(customer_id, created_at);

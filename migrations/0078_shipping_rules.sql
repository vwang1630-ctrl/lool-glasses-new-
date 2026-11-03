-- 0078_shipping_rules.sql
-- Country-level checkout shipping rules.
--
-- `ROW` is the fallback rule for any country without an explicit row.
-- Amounts are USD cents.

CREATE TABLE IF NOT EXISTS shipping_rules (
  country_code TEXT PRIMARY KEY,
  shipping_cents INTEGER NOT NULL DEFAULT 800,
  free_shipping_threshold_cents INTEGER NOT NULL DEFAULT 6900,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO shipping_rules (
  country_code, shipping_cents, free_shipping_threshold_cents, created_at, updated_at
) VALUES
  ('ROW', 800, 6900, unixepoch() * 1000, unixepoch() * 1000),
  ('JP', 800, 6900, unixepoch() * 1000, unixepoch() * 1000);

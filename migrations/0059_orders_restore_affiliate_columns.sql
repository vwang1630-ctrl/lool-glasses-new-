-- Hotfix for 0058: the orders table rebuild dropped `affiliate_slug` and
-- `attribution_at` because 0058 was authored from the 0006_v2_schema column
-- list and missed the two columns 0057_affiliates.sql had added via ALTER.
--
-- Restore them as nullable columns so POST /api/orders (which references
-- both after the affiliate-week2 merge) stops 500'ing. Pre-0058 affiliate
-- attribution rows are unrecoverable from the orders side; the
-- affiliate_ledger_entries table is the authoritative ledger so this only
-- affects orders-table-level attribution snapshots.

ALTER TABLE orders ADD COLUMN affiliate_slug TEXT;
ALTER TABLE orders ADD COLUMN attribution_at INTEGER;

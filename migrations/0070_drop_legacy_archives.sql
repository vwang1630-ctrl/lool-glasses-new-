-- Drop long-archived legacy tables that no code references.
--
-- 1. `_v1` archives from migration 0005 (v1 → v2 schema rename, kept for
--    rollback). v2/v3 has been stable in prod for ~60 migrations; rollback is
--    no longer a real option. Originally planned as "0008_drop_v1.sql" per
--    0005's header comment, but 0008 ended up being the v2-lens drop.
--
-- 2. `suppliers_old` — orphan left over from migration 0025's suppliers-rebuild
--    (extended `kind` CHECK + added `config_json`). Schema is the pre-0025 shape;
--    rows are stale duplicates of `suppliers` data.
--
-- 3. `payouts` — created in 0057 as an affiliate-payouts stub, never wired up
--    (zero rows, zero code references). Easy to re-add if/when needed.

DROP TABLE IF EXISTS admin_users_v1;
DROP TABLE IF EXISTS order_items_v1;
DROP TABLE IF EXISTS order_otp_v1;
DROP TABLE IF EXISTS orders_v1;
DROP TABLE IF EXISTS prescriptions_v1;
DROP TABLE IF EXISTS shipments_v1;
DROP TABLE IF EXISTS shipment_events_v1;
DROP TABLE IF EXISTS lens_options_v1;
DROP TABLE IF EXISTS product_colors_v1;
DROP TABLE IF EXISTS products_v1;

DROP TABLE IF EXISTS suppliers_old;

DROP TABLE IF EXISTS payouts;

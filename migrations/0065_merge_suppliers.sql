-- Merge lens_suppliers + frame_suppliers back into the unified `suppliers`
-- table. The 0036 split was speculative — both split tables ended up with
-- identical columns, so it created admin & maker code duplication for no
-- structural payoff. Re-merging restores the original "one suppliers table,
-- kind column as discriminator" model that 0001/0025 already shipped.
--
-- The kind CHECK from 0025 already permits 'lens', 'frame', 'both',
-- 'accessory', 'payment', 'logistics' — so no schema change beyond the data
-- move + table drops is needed.
--
-- JSON references (lens_skus.supplier_costs_json, products.supplier_costs_json)
-- carry supplier ids as keys. Those ids appear in lens_suppliers / frame_suppliers
-- today; after this migration they appear in suppliers. The JSON keys themselves
-- don't change, and SQLite doesn't enforce FK constraints on JSON values, so the
-- references keep resolving — just against the merged table.
--
-- ID uniqueness verified pre-migration: lens_suppliers ∩ frame_suppliers = ∅.

INSERT INTO suppliers (
  id, name_zh, name_en, kind, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order, created_at, updated_at
)
SELECT
  id, name_zh, name_en, 'lens' AS kind, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order, created_at, updated_at
FROM lens_suppliers;

INSERT INTO suppliers (
  id, name_zh, name_en, kind, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order, created_at, updated_at
)
SELECT
  id, name_zh, name_en, 'frame' AS kind, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order, created_at, updated_at
FROM frame_suppliers;

DROP TABLE lens_suppliers;
DROP TABLE frame_suppliers;

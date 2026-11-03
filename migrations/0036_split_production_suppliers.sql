-- Split production suppliers (lens labs vs frame factories) into separate
-- tables. The original `suppliers` table mixed 4 kinds (lens / frame /
-- payment / logistics) with `kind` as discriminator; lens & frame have
-- divergent operations (lens labs have refractive-index / prism / coating
-- ranges; frame factories deal with material runs, tooling, color samples)
-- and are conceptually different supply chains.
--
-- After this migration:
--   `lens_suppliers`   — keys referenced by lens_skus.supplier_costs_json
--   `frame_suppliers`  — keys referenced by products.supplier_costs_json (added below)
--   `suppliers`        — only payment + logistics rows; keeps kind column
--                        (used by /admin/suppliers-payment + /admin/suppliers-logistics)

CREATE TABLE lens_suppliers (
  id                TEXT PRIMARY KEY,
  name_zh           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  config_json       TEXT,
  contact_person    TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  shipping_address  TEXT,
  payment_terms     TEXT,
  lead_time_days    INTEGER,
  notes             TEXT,
  active            INTEGER NOT NULL DEFAULT 1,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

INSERT INTO lens_suppliers (
  id, name_zh, name_en, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order,
  created_at, updated_at
)
SELECT
  id, name_zh, name_en, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order,
  created_at, updated_at
FROM suppliers WHERE kind = 'lens';

CREATE TABLE frame_suppliers (
  id                TEXT PRIMARY KEY,
  name_zh           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  config_json       TEXT,
  contact_person    TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  shipping_address  TEXT,
  payment_terms     TEXT,
  lead_time_days    INTEGER,
  notes             TEXT,
  active            INTEGER NOT NULL DEFAULT 1,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

INSERT INTO frame_suppliers (
  id, name_zh, name_en, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order,
  created_at, updated_at
)
SELECT
  id, name_zh, name_en, config_json, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order,
  created_at, updated_at
FROM suppliers WHERE kind = 'frame';

DELETE FROM suppliers WHERE kind IN ('lens', 'frame');

-- products: same multi-supplier pattern as lens_skus (migration 0034).
-- The legacy supplier_id / supplier_sku had zero filled rows, so no
-- backfill into supplier_costs_json is needed.
ALTER TABLE products ADD COLUMN supplier_costs_json TEXT;

DROP INDEX IF EXISTS idx_products_supplier;
ALTER TABLE products DROP COLUMN supplier_id;
ALTER TABLE products DROP COLUMN supplier_sku;

-- Move per-supplier cost off three scalar columns on lens_skus into a JSON
-- map. lens_skus is supposed to be pure spec (brand × prescription_type ×
-- category × index × material) — cost is a function of (spec, supplier) and
-- one sales SKU may carry costs from multiple suppliers.
--
-- Old shape: cost_cny_cents (one number) + supplier_id (one ref) + supplier_sku (one code)
-- New shape: supplier_costs_json
--   { "<supplier_id>": { "cost_cny_cents": <int|null>, "supplier_sku_code": <text|null> } }

ALTER TABLE lens_skus ADD COLUMN supplier_costs_json TEXT;

-- Backfill: existing rows with supplier_id become a single-key JSON object.
-- The current supplier_sku values are prefixed with "<supplier_id>:" — strip
-- the prefix so the supplier_sku_code is the supplier's own internal code.
UPDATE lens_skus
SET supplier_costs_json = json_object(
  supplier_id,
  json_object(
    'cost_cny_cents', cost_cny_cents,
    'supplier_sku_code',
      CASE
        WHEN supplier_sku LIKE supplier_id || ':%' THEN substr(supplier_sku, length(supplier_id) + 2)
        ELSE supplier_sku
      END
  )
)
WHERE supplier_id IS NOT NULL;

DROP INDEX IF EXISTS idx_lens_skus_supplier;
DROP INDEX IF EXISTS idx_lens_skus_supplier_id;

ALTER TABLE lens_skus DROP COLUMN cost_cny_cents;
ALTER TABLE lens_skus DROP COLUMN supplier_id;
ALTER TABLE lens_skus DROP COLUMN supplier_sku;

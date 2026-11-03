-- 0073 — ensure tracker workbench always has production suppliers to call.
--
-- Products had no frame supplier_costs_json, so tracker items showed "—" for
-- frame suppliers. Some newer standard lens SKUs also missed supplier costs.

UPDATE products
SET supplier_costs_json = json_object(
  'wenzhou-acetate', json_object('cost_cny_cents', NULL, 'supplier_sku_code', NULL),
  'shenzhen-titanium', json_object('cost_cny_cents', NULL, 'supplier_sku_code', NULL)
)
WHERE supplier_costs_json IS NULL OR supplier_costs_json = '';

UPDATE lens_skus
SET supplier_costs_json = json_object(
  'mingyue', json_object('cost_cny_cents', NULL, 'supplier_sku_code', NULL)
)
WHERE (supplier_costs_json IS NULL OR supplier_costs_json = '')
  AND brand_id IN ('standard', 'inhouse', 'mingyue');

UPDATE lens_skus
SET supplier_costs_json = json_object(
  'zeiss-china', json_object('cost_cny_cents', NULL, 'supplier_sku_code', NULL)
)
WHERE (supplier_costs_json IS NULL OR supplier_costs_json = '')
  AND brand_id = 'zeiss';

UPDATE lens_skus
SET supplier_costs_json = json_object(
  'essilor-china', json_object('cost_cny_cents', NULL, 'supplier_sku_code', NULL)
)
WHERE (supplier_costs_json IS NULL OR supplier_costs_json = '')
  AND brand_id IN ('essilor', 'kammy', 'conant', 'transitions');

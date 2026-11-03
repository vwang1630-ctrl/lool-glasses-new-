-- 0042 — order_items snapshot columns for the 6-step wizard.
--
-- After 0040, lens SKUs have new dimensions (base_function / progressive_tier);
-- coatings are no longer on the SKU and are written as order-time addons_json.
-- Update snapshot columns so each order_items row captures everything the user
-- saw at purchase, in a future-proof shape.
--
-- Drop (now derived from base_function snapshot or moved to addons_json):
--   lens_has_blue_light_snapshot     -- BL is now either base_function='blue-light-absorbing'
--                                       OR an addon id 'blue-light-coating' inside addons_json
--   lens_coatings_snapshot           -- coatings live in addons_json with full label snapshot
--
-- Rename (semantic alignment with new schema):
--   lens_tint_snapshot         → lens_base_function_snapshot
--
-- Add (snapshot what the user saw — even if admin renames brand or label later):
--   lens_brand_id_snapshot         -- 'standard' / 'mingyue' / ...
--   lens_brand_label_json          -- 10-lang label at purchase time
--   lens_base_function_label_json  -- 10-lang display label of step 3 choice
--   lens_progressive_tier_snapshot -- 'standard' / 'premium' / NULL (step 6)
--
-- order_items has 0 rows in remote, so ALTER is safe (no row backfill needed).
-- Each ALTER is a separate statement; D1 applies them sequentially.

ALTER TABLE order_items DROP COLUMN lens_has_blue_light_snapshot;
ALTER TABLE order_items DROP COLUMN lens_coatings_snapshot;

ALTER TABLE order_items RENAME COLUMN lens_tint_snapshot TO lens_base_function_snapshot;

ALTER TABLE order_items ADD COLUMN lens_brand_id_snapshot          TEXT;
ALTER TABLE order_items ADD COLUMN lens_brand_label_json           TEXT;
ALTER TABLE order_items ADD COLUMN lens_base_function_label_json   TEXT;
ALTER TABLE order_items ADD COLUMN lens_progressive_tier_snapshot  TEXT;

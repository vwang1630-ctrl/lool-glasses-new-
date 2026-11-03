-- Align lens_brands ids with their actual brand identity. Two rows had
-- legacy seed ids that no longer match the brand they describe:
--   id=essilor      → name_en=kammy, name_zh=凯米
--   id=transitions  → name_en=Conant, name_zh=康耐特
-- "Essilor" and "Transitions" are tier-1 western lens makers we don't
-- actually source from; the rows were repurposed to real China-side
-- suppliers (Kammy/Conant) but the ids were never updated. This left
-- /admin and the wizard reading the right name but writing audit logs +
-- API URLs against a wrong-brand id, and confused anyone who used the id
-- column directly. Migration:
--   1. INSERT new brand rows (kammy, conant) preserving all metadata
--   2. UPDATE lens_skus.brand_id to point at the new ids (FK ok — both
--      old and new rows exist at this moment)
--   3. DELETE old brand rows (FK now ok — no SKUs reference them)
--   4. Fix inhouse.name_zh placeholder "哈哈" → "lool"

INSERT INTO lens_brands (id, name_zh, name_en, description_zh, description_en, hero_img_url, tier, active, sort_order, created_at, updated_at)
SELECT 'kammy', name_zh, name_en, description_zh, description_en, hero_img_url, tier, active, sort_order, created_at, unixepoch() * 1000
FROM lens_brands WHERE id = 'essilor';

INSERT INTO lens_brands (id, name_zh, name_en, description_zh, description_en, hero_img_url, tier, active, sort_order, created_at, updated_at)
SELECT 'conant', name_zh, name_en, description_zh, description_en, hero_img_url, tier, active, sort_order, created_at, unixepoch() * 1000
FROM lens_brands WHERE id = 'transitions';

UPDATE lens_skus SET brand_id = 'kammy'  WHERE brand_id = 'essilor';
UPDATE lens_skus SET brand_id = 'conant' WHERE brand_id = 'transitions';

DELETE FROM lens_brands WHERE id IN ('essilor', 'transitions');

UPDATE lens_brands SET name_zh = 'lool', updated_at = unixepoch() * 1000
WHERE id = 'inhouse' AND name_zh = '哈哈';

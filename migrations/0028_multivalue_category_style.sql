-- Convert products.category and products.style from single TEXT to JSON arrays.
-- Stored under the established `_json` convention (matches genders_json,
-- face_shape_tags_json, etc.). Old single columns are dropped after backfill.
--
-- Rationale: a frame can legitimately serve both presbyopia and myopia, and
-- a design may sit across multiple style tags (e.g. "minimal" + "business").
-- Single-value columns forced editors to pick one and broke the storefront
-- mega-nav whenever a frame straddled buckets.

ALTER TABLE products ADD COLUMN categories_json TEXT;
ALTER TABLE products ADD COLUMN styles_json TEXT;

-- Backfill: wrap each existing single value into a one-element JSON array.
UPDATE products
SET categories_json = json_array(category)
WHERE category IS NOT NULL AND TRIM(category) <> '';

UPDATE products
SET styles_json = json_array(style)
WHERE style IS NOT NULL AND TRIM(style) <> '';

-- The old composite index references the column we're dropping.
DROP INDEX IF EXISTS idx_products_category;

ALTER TABLE products DROP COLUMN category;
ALTER TABLE products DROP COLUMN style;

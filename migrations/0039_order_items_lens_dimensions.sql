-- Add v3 lens-dimension snapshot columns to order_items, mirroring the new
-- orthogonal attributes on lens_skus. The legacy `lens_category_snapshot` and
-- `lens_color_snapshot` columns are kept untouched for historical orders;
-- new orders write both for back-compat (legacy gets a derived label).

ALTER TABLE order_items ADD COLUMN lens_tint_snapshot              TEXT;
ALTER TABLE order_items ADD COLUMN lens_has_blue_light_snapshot    INTEGER;
ALTER TABLE order_items ADD COLUMN lens_coatings_snapshot          TEXT; -- JSON array
ALTER TABLE order_items ADD COLUMN lens_color_id_snapshot          TEXT; -- specific tint color id when lens_tint='tinted'

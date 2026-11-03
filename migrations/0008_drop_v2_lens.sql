-- v3 schema migration step 1/3: drop v2 lens dimension tables.
-- v2 used a 4-table formula (categories + indices + colors + options) which
-- assumed lens prices follow a derivable rule. Reality: each brand prices
-- arbitrarily. v3 uses a single denormalized lens_skus table where each row
-- = one orderable lens with its own retail price.
--
-- These v2 tables had only seed data (no orders reference them). Safe to drop.
-- lens_addons / lens_supplier_catalog kept.

DROP TABLE IF EXISTS lens_option_supplier_mapping;  -- FK references lens_options
DROP TABLE IF EXISTS lens_options;
DROP TABLE IF EXISTS lens_categories;
DROP TABLE IF EXISTS lens_indices;
DROP TABLE IF EXISTS lens_colors;

-- 0009 will re-create lens_option_supplier_mapping pointing at lens_skus.

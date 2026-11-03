-- 0040 — lens_skus restructure for the 6-step wizard.
--
-- Step → SKU axis mapping the wizard locked in:
--   step 1 用法           → prescription_type        (single-vision/progressive/reading/non-prescription)
--   step 2 处方           → prescriptions table       (not SKU)
--   step 3 基片功能 5 选 1 → base_function            (clear/photochromic/tinted/polarized/blue-light-absorbing)
--   step 4 涂层多选        → lens_addons + order-time addons_json (NOT on SKU)
--   step 5 折射率          → refractive_index
--   step 6 渐进档位        → progressive_tier         (standard/premium; NULL if not progressive)
--
-- Changes vs 0037:
--   DROP   lens_tint, has_blue_light_filter, coatings_json, is_premium_material
--   ADD    base_function, progressive_tier
--   TIGHTEN prescription_type CHECK to 4 values (drop frame-only / sunglasses-*)
--   UNIQUE  (brand, brand_line, prescription_type, refractive_index, base_function, progressive_tier)
--
-- Data migration:
--   * Coatings move to order-time addons → rows where coatings_json != '[]' are dropped
--     (the no-coating sibling stays as the base-price SKU; coating prices live in
--      lens_addons.retail_cents going forward).
--   * frame-only / sunglasses-* SKUs dropped (don't belong in lens_skus).
--   * lens_tint + has_blue_light_filter → base_function:
--       clear        + BL=0 → 'clear'
--       clear        + BL=1 → 'blue-light-absorbing'
--       photochromic + BL=0 → 'photochromic'
--       photochromic + BL=1 → DROP (was photo + blue-light-coating bundle; coating
--                                   re-emerges as user-multi-select addon)
--       tinted       + BL=0 → 'tinted'
--       tinted       + BL=1 → DROP (same reasoning)
--   * is_premium_material → progressive_tier when prescription_type='progressive':
--       progressive + premium=0 → 'standard'
--       progressive + premium=1 → 'premium'
--       else                    → NULL
--   * 'polarized' base_function has no existing rows — reserved for future inventory.
--
-- Orders/order_items are still empty (no historical rows to preserve).

CREATE TABLE lens_skus_new (
  id                      TEXT PRIMARY KEY,
  brand_id                TEXT NOT NULL REFERENCES lens_brands(id),
  brand_line              TEXT,

  prescription_type       TEXT NOT NULL CHECK (prescription_type IN
                            ('single-vision','progressive','reading','non-prescription')),
  base_function           TEXT NOT NULL CHECK (base_function IN
                            ('clear','photochromic','tinted','polarized','blue-light-absorbing')),
  refractive_index        REAL NOT NULL,
  progressive_tier        TEXT CHECK (progressive_tier IS NULL OR progressive_tier IN ('standard','premium')),

  lens_colors_json        TEXT, -- only populated when base_function='tinted' (or 'photochromic' with color variants)

  retail_cents            INTEGER NOT NULL,
  supplier_costs_json     TEXT,

  display_name_json       TEXT,
  description_json        TEXT,
  hero_img_url            TEXT,
  recommended             INTEGER NOT NULL DEFAULT 0 CHECK (recommended IN (0,1)),

  sph_min REAL, sph_max REAL,
  cyl_min REAL, cyl_max REAL,
  add_min REAL, add_max REAL,

  active                  INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order              INTEGER NOT NULL DEFAULT 0,
  created_at              INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at              INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

  UNIQUE (brand_id, brand_line, prescription_type, refractive_index, base_function, progressive_tier)
);

INSERT INTO lens_skus_new (
  id, brand_id, brand_line, prescription_type, base_function,
  refractive_index, progressive_tier, lens_colors_json,
  retail_cents, supplier_costs_json,
  display_name_json, description_json, hero_img_url, recommended,
  sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  active, sort_order, created_at, updated_at
)
SELECT
  id,
  brand_id,
  brand_line,
  prescription_type,
  CASE
    WHEN lens_tint = 'clear'        AND has_blue_light_filter = 1 THEN 'blue-light-absorbing'
    WHEN lens_tint = 'clear'                                      THEN 'clear'
    WHEN lens_tint = 'photochromic'                               THEN 'photochromic'
    WHEN lens_tint = 'tinted'                                     THEN 'tinted'
  END AS base_function,
  refractive_index,
  CASE
    WHEN prescription_type = 'progressive' AND is_premium_material = 1 THEN 'premium'
    WHEN prescription_type = 'progressive'                             THEN 'standard'
    ELSE NULL
  END AS progressive_tier,
  lens_colors_json,
  retail_cents,
  supplier_costs_json,
  display_name_json,
  description_json,
  hero_img_url,
  recommended,
  sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  active, sort_order, created_at, updated_at
FROM lens_skus
WHERE coatings_json = '[]'
  AND prescription_type IN ('single-vision','progressive','reading','non-prescription')
  AND lens_tint IS NOT NULL
  AND NOT (lens_tint IN ('photochromic','tinted') AND has_blue_light_filter = 1);

DROP TABLE lens_skus;
ALTER TABLE lens_skus_new RENAME TO lens_skus;

CREATE INDEX idx_lens_skus_wizard
  ON lens_skus(prescription_type, base_function, refractive_index, progressive_tier, active);
CREATE INDEX idx_lens_skus_brand_active
  ON lens_skus(brand_id, active);

-- v3 lens dimensions: replace compound `category` enum with orthogonal
-- attributes (lens_tint × has_blue_light_filter × coatings_json × lens_colors_json).
-- Rename brand id 'inhouse' → 'standard' (display name back to "Standard / 白片").
-- Deactivate partner brand rows + their SKUs (kept for future partnership).
--
-- The UNIQUE constraint changes shape (drops `category`, adds the three new
-- orthogonal fields) so the table must be rebuilt. `colors_json` is renamed
-- to `lens_colors_json` to signal it's only populated for tinted lenses.
--
-- FK-safe ordering (no PRAGMA needed):
--   1. INSERT new 'standard' brand row (parent exists before children point to it).
--   2. Rebuild lens_skus child table; INSERT...SELECT remaps brand_id 'inhouse' → 'standard'.
--   3. DELETE old 'inhouse' parent row (no children reference it any more).

-- 1. Create 'standard' brand row alongside 'inhouse'.
INSERT INTO lens_brands (id, name_json, description_json, tier, active, sort_order)
VALUES (
  'standard',
  '{"zh":"白片","en":"Standard"}',
  '{"zh":"基础通用镜片，日常清晰","en":"Reliable everyday clarity at a great value."}',
  'budget',
  1,
  0
);

-- 2. Deactivate partner brand rows (kept for future partnership).
UPDATE lens_brands
   SET active = 0, updated_at = unixepoch() * 1000
 WHERE id IN ('mingyue','kammy','zeiss','hanchuang','conant');

-- 3. Rebuild lens_skus with new columns + new UNIQUE.
CREATE TABLE lens_skus_new (
  id                      TEXT PRIMARY KEY,
  brand_id                TEXT NOT NULL REFERENCES lens_brands(id),
  brand_line              TEXT,

  prescription_type       TEXT NOT NULL CHECK (prescription_type IN
                            ('single-vision','progressive','reading','non-prescription',
                             'sunglasses-prescription','sunglasses-non-prescription','frame-only')),
  refractive_index        REAL NOT NULL,
  is_premium_material     INTEGER NOT NULL DEFAULT 0 CHECK (is_premium_material IN (0,1)),

  -- New orthogonal dimensions (replace `category` enum).
  lens_tint               TEXT CHECK (lens_tint IS NULL OR lens_tint IN ('clear','photochromic','tinted')),
  has_blue_light_filter   INTEGER NOT NULL DEFAULT 0 CHECK (has_blue_light_filter IN (0,1)),
  coatings_json           TEXT NOT NULL DEFAULT '[]',
  lens_colors_json        TEXT, -- only populated when lens_tint='tinted'

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

  UNIQUE (brand_id, brand_line, prescription_type, refractive_index,
          is_premium_material, lens_tint, has_blue_light_filter, coatings_json)
);

INSERT INTO lens_skus_new (
  id, brand_id, brand_line, prescription_type, refractive_index, is_premium_material,
  lens_tint, has_blue_light_filter, coatings_json, lens_colors_json,
  retail_cents, supplier_costs_json,
  display_name_json, description_json, hero_img_url, recommended,
  sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  active, sort_order, created_at, updated_at
)
SELECT
  id,
  CASE WHEN brand_id = 'inhouse' THEN 'standard' ELSE brand_id END,
  brand_line,
  prescription_type,
  refractive_index,
  is_premium_material,
  CASE category
    WHEN 'standard'                THEN 'clear'
    WHEN 'blue-light'              THEN 'clear'
    WHEN 'photochromic'            THEN 'photochromic'
    WHEN 'transitions'             THEN 'photochromic'
    WHEN 'photochromic-blue-combo' THEN 'photochromic'
    WHEN 'color-tinted'            THEN 'tinted'
    WHEN 'polarized'               THEN 'tinted'
    WHEN 'driving'                 THEN 'tinted'
    ELSE NULL   -- frame-only, classic-progressive
  END,
  CASE
    WHEN category = 'blue-light'              THEN 1
    WHEN category = 'photochromic-blue-combo' THEN 1
    ELSE 0
  END,
  '[]',
  colors_json,
  retail_cents,
  supplier_costs_json,
  display_name_json,
  description_json,
  hero_img_url,
  recommended,
  sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  CASE
    WHEN brand_id IN ('mingyue','kammy','zeiss','hanchuang','conant') THEN 0
    ELSE active
  END,
  sort_order,
  created_at,
  updated_at
FROM lens_skus;

-- 4. Swap tables.
DROP TABLE lens_skus;
ALTER TABLE lens_skus_new RENAME TO lens_skus;

-- 5. Recreate indexes.
CREATE INDEX idx_lens_skus_filter
  ON lens_skus(prescription_type, active, brand_id, lens_tint, has_blue_light_filter, refractive_index);
CREATE INDEX idx_lens_skus_brand_active
  ON lens_skus(brand_id, active);

-- 6. Remove old 'inhouse' brand row (no children reference it).
DELETE FROM lens_brands WHERE id = 'inhouse';

-- Lens-color model change: one SKU can support multiple colors.
--
-- Old model: `color TEXT` was part of the SKU's UNIQUE key, so "Zeiss 1.67
-- polarized" with 5 colors needed 5 separate rows in lens_skus.
--
-- New model: `colors_json TEXT` is a JSON array of supported color codes
-- (e.g. ["dark-gray","amber","brown"]). NULL or empty = single default color.
-- The UNIQUE key drops `color` and adds `brand_line` (so brand-line variants
-- like Transitions Gen8 vs Style stay distinct).
--
-- Cart / orders impact: `order_items.lens_color_snapshot` already exists for
-- the chosen color, so order-side schema is unchanged.
--
-- Migration steps:
--   1. CREATE lens_skus_v2 with new schema
--   2. Backfill: copy each row, wrapping non-NULL color in JSON array
--   3. Drop old table, rename new one
--   4. Recreate indexes

CREATE TABLE lens_skus_v2 (
  id                  TEXT PRIMARY KEY,
  brand_id            TEXT NOT NULL REFERENCES lens_brands(id),
  brand_line          TEXT,

  prescription_type   TEXT NOT NULL CHECK (prescription_type IN
                        ('single-vision','progressive','reading','non-prescription',
                         'sunglasses-prescription','sunglasses-non-prescription','frame-only')),
  category            TEXT NOT NULL CHECK (category IN
                        ('frame-only','standard','blue-light','photochromic',
                         'photochromic-blue-combo','transitions','driving',
                         'color-tinted','polarized','classic-progressive')),
  refractive_index    REAL NOT NULL,
  is_premium_material INTEGER NOT NULL DEFAULT 0 CHECK (is_premium_material IN (0,1)),

  -- NEW: JSON array of supported color codes. NULL/empty = lens has no color
  -- variants (single default color, no picker shown to user). Non-empty = user
  -- must choose one at checkout; that choice ends up in
  -- order_items.lens_color_snapshot.
  colors_json         TEXT,

  retail_cents        INTEGER NOT NULL,
  cost_cny_cents      INTEGER,
  supplier_sku        TEXT,

  display_name_zh     TEXT,
  display_name_en     TEXT,
  description_zh      TEXT,
  description_en      TEXT,
  hero_img_url        TEXT,
  recommended         INTEGER NOT NULL DEFAULT 0 CHECK (recommended IN (0,1)),

  sph_min, sph_max    REAL,
  cyl_min, cyl_max    REAL,
  add_min, add_max    REAL,

  active              INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

  -- Drops `color` from the UNIQUE key, adds `brand_line` so the existing
  -- Transitions Gen8 / Style variants (which differ ONLY by brand_line +
  -- color) remain two distinct rows.
  UNIQUE (brand_id, brand_line, prescription_type, category, refractive_index, is_premium_material)
);

-- Backfill: each existing row becomes one new row. If old.color was set,
-- wrap it in a JSON array so the SKU now declares a single supported color
-- (admin can add more colors via UPDATE later).
INSERT INTO lens_skus_v2 (
  id, brand_id, brand_line, prescription_type, category, refractive_index,
  is_premium_material, colors_json, retail_cents, cost_cny_cents, supplier_sku,
  display_name_zh, display_name_en, description_zh, description_en, hero_img_url,
  recommended, sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  active, sort_order, created_at, updated_at
)
SELECT
  id, brand_id, brand_line, prescription_type, category, refractive_index,
  is_premium_material,
  CASE WHEN color IS NOT NULL AND color != '' THEN json_array(color) ELSE NULL END AS colors_json,
  retail_cents, cost_cny_cents, supplier_sku,
  display_name_zh, display_name_en, description_zh, description_en, hero_img_url,
  recommended, sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  active, sort_order, created_at, updated_at
FROM lens_skus;

DROP TABLE lens_skus;
ALTER TABLE lens_skus_v2 RENAME TO lens_skus;

-- Recreate indexes (same as before)
CREATE INDEX idx_lens_skus_filter ON lens_skus
  (prescription_type, active, brand_id, category, refractive_index);
CREATE INDEX idx_lens_skus_brand_active ON lens_skus(brand_id, active);
CREATE INDEX idx_lens_skus_supplier ON lens_skus(supplier_sku);

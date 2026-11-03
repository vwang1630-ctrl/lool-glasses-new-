-- 0043 — lens_skus alignment to the 1:1-replicated 7-step wizard.
--
-- The wizard was re-ported 1:1 from the upstream spectacle-style design
-- (7-step Zeelool spec). This reconciles lens_skus to it.
-- Decisions: docs/lens-wizard-schema-gap.md #1-5. Target: docs/lens-skus-redesign.md.
--
-- Changes vs 0040:
--   base_function    enum → clear/blue/photo/driving/tinted/polarized
--                    (rename photochromic→photo, blue-light-absorbing→blue; add driving)
--   ADD    function_variant       photochromic sub-option (base/blueUpgrade); NULL otherwise
--   ADD    progressive_design     standard/short; NULL if not progressive
--   RENAME progressive_tier → progressive_view_area (standard/broader)
--   UNIQUE + function_variant, progressive_design, progressive_view_area
--
-- Data migration (41 rows, all preserved):
--   base_function:         photochromic→photo, blue-light-absorbing→blue, others unchanged
--   function_variant:      'base' for old photochromic rows, else NULL
--   refractive_index:      1.57 → 1.56 (11 rows; canonical set 1.56/1.61/1.67/1.74)
--   progressive_design:    'standard' for progressive rows, else NULL
--   progressive_view_area: old progressive_tier value (premium→broader)
--
-- No UNIQUE collisions: function_variant / progressive_design are deterministic
-- functions of columns already in the old key; base_function rename is injective;
-- 1.57→1.56 is uniform and no 1.56 rows pre-exist.

CREATE TABLE lens_skus_new (
  id                      TEXT PRIMARY KEY,
  brand_id                TEXT NOT NULL REFERENCES lens_brands(id),
  brand_line              TEXT,

  prescription_type       TEXT NOT NULL CHECK (prescription_type IN
                            ('single-vision','progressive','reading','non-prescription')),
  base_function           TEXT NOT NULL CHECK (base_function IN
                            ('clear','blue','photo','driving','tinted','polarized')),
  function_variant        TEXT CHECK (function_variant IS NULL OR function_variant IN
                            ('base','blueUpgrade')),
  refractive_index        REAL NOT NULL,
  progressive_design      TEXT CHECK (progressive_design IS NULL OR progressive_design IN
                            ('standard','short')),
  progressive_view_area   TEXT CHECK (progressive_view_area IS NULL OR progressive_view_area IN
                            ('standard','broader')),

  lens_colors_json        TEXT, -- populated for base_function in ('tinted','photo') with color variants

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
          base_function, function_variant, progressive_design, progressive_view_area)
);

INSERT INTO lens_skus_new (
  id, brand_id, brand_line, prescription_type, base_function, function_variant,
  refractive_index, progressive_design, progressive_view_area, lens_colors_json,
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
  CASE base_function
    WHEN 'photochromic'         THEN 'photo'
    WHEN 'blue-light-absorbing' THEN 'blue'
    ELSE base_function
  END AS base_function,
  CASE WHEN base_function = 'photochromic' THEN 'base' ELSE NULL END AS function_variant,
  CASE WHEN ABS(refractive_index - 1.57) < 0.001 THEN 1.56 ELSE refractive_index END AS refractive_index,
  CASE WHEN prescription_type = 'progressive' THEN 'standard' ELSE NULL END AS progressive_design,
  CASE progressive_tier WHEN 'premium' THEN 'broader' ELSE progressive_tier END AS progressive_view_area,
  lens_colors_json,
  retail_cents,
  supplier_costs_json,
  display_name_json,
  description_json,
  hero_img_url,
  recommended,
  sph_min, sph_max, cyl_min, cyl_max, add_min, add_max,
  active, sort_order, created_at, updated_at
FROM lens_skus;

DROP TABLE lens_skus;
ALTER TABLE lens_skus_new RENAME TO lens_skus;

CREATE INDEX idx_lens_skus_wizard
  ON lens_skus(prescription_type, base_function, refractive_index,
               progressive_design, progressive_view_area, active);
CREATE INDEX idx_lens_skus_brand_active
  ON lens_skus(brand_id, active);

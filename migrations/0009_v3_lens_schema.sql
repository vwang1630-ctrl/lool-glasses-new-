-- v3 schema migration step 2/3: create lens_brands + lens_skus.
-- Design: each lens row is autonomous — brand, category, index, color, retail
-- price all on one row. Wizard "step-by-step delta" is computed at the frontend
-- via min() over filtered candidates (no formula, no per-step pricing tables).
-- See docs/lens-pricing-model.md for the algorithm.

CREATE TABLE lens_brands (
  id              TEXT PRIMARY KEY,                    -- 'zeiss' / 'mingyue' / 'inhouse' / 'transitions'
  name_zh         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_zh  TEXT,
  description_en  TEXT,
  hero_img_url    TEXT,                                -- brand logo / banner (R2 URL)
  tier            TEXT CHECK (tier IS NULL OR tier IN ('budget','mainstream','premium','luxury')),
  active          INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE lens_skus (
  id                  TEXT PRIMARY KEY,                -- readable slug or nanoid
                                                       -- e.g. 'zeiss-sv-bluelight-1.67-pro'
  brand_id            TEXT NOT NULL REFERENCES lens_brands(id),
  brand_line          TEXT,                            -- sub-series: 'Signature' / 'GEN8' / NULL

  -- Classification (used for wizard filtering)
  prescription_type   TEXT NOT NULL CHECK (prescription_type IN
                        ('single-vision','progressive','reading','non-prescription',
                         'sunglasses-prescription','sunglasses-non-prescription','frame-only')),
  category            TEXT NOT NULL CHECK (category IN
                        ('frame-only','standard','blue-light','photochromic',
                         'photochromic-blue-combo','transitions','driving',
                         'color-tinted','polarized','classic-progressive')),
  refractive_index    REAL NOT NULL,                   -- 1.50 / 1.57 / 1.61 / 1.67 / 1.71 / 1.74
  is_premium_material INTEGER NOT NULL DEFAULT 0 CHECK (is_premium_material IN (0,1)),
                                                       -- MR™ Pro / 蔡司钻立方 / 等
  color               TEXT,                            -- NULL when category has no color
                                                       -- 'dark-gray' / 'amber' / 'gradient-brown' / etc

  -- Pricing (admin-set, no formula)
  retail_cents        INTEGER NOT NULL,                -- USD cents — what user pays
  cost_cny_cents      INTEGER,                         -- supplier cost in CNY cents (margin tracking)
  supplier_sku        TEXT,                            -- 'mingyue:D67JX' / 'zeiss:SKU-XX' (free-form)

  -- Display
  display_name_zh     TEXT,                            -- override; NULL → frontend auto-composes
  display_name_en     TEXT,                            -- e.g. 'Zeiss 1.67 Blue-Light Pro'
  description_zh      TEXT,
  description_en      TEXT,
  hero_img_url        TEXT,                            -- per-SKU image (R2 URL)
  recommended         INTEGER NOT NULL DEFAULT 0 CHECK (recommended IN (0,1)),

  -- Compatibility constraints (optional, used by wizard to gray out)
  sph_min, sph_max    REAL,                            -- supported sphere range (NULL = no constraint)
  cyl_min, cyl_max    REAL,
  add_min, add_max    REAL,                            -- for progressive/reading

  active              INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  UNIQUE (brand_id, prescription_type, category, refractive_index, is_premium_material, color)
);

-- Indexes for common wizard query patterns
CREATE INDEX idx_lens_skus_filter ON lens_skus
  (prescription_type, active, brand_id, category, refractive_index);
CREATE INDEX idx_lens_skus_brand_active ON lens_skus(brand_id, active);
CREATE INDEX idx_lens_skus_supplier ON lens_skus(supplier_sku);

-- Re-create the supplier mapping table (depends on lens_skus now)
CREATE TABLE lens_option_supplier_mapping (
  lens_sku_id           TEXT NOT NULL REFERENCES lens_skus(id) ON DELETE CASCADE,
  supplier_sku_id       TEXT NOT NULL REFERENCES lens_supplier_catalog(id),
  priority              INTEGER NOT NULL DEFAULT 0,    -- higher wins
  match_rule_json       TEXT,                          -- e.g. {"sph_min":-6,"sph_max":6}
  PRIMARY KEY (lens_sku_id, supplier_sku_id)
);
CREATE INDEX idx_lens_supplier_map_sku ON lens_option_supplier_mapping(lens_sku_id, priority);

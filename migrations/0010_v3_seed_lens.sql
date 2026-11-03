-- v3 schema migration step 3/3: seed minimal brands + example SKUs.
-- Admin will add more via /api/admin/lens-skus. This is just enough so the
-- wizard / catalog API has something to render.

-- 5 brands
INSERT INTO lens_brands (id, name_zh, name_en, tier, sort_order, description_en) VALUES
  ('inhouse',     '自营品牌', 'lool House',   'budget',     10, 'Our own house-brand lenses for everyday wear at the best price.'),
  ('mingyue',     '明月光学', 'Mingyue',      'mainstream', 20, 'Leading Chinese optical lens manufacturer; reliable mainstream choice.'),
  ('essilor',     '依视路',   'Essilor',      'premium',    30, 'Global leader in vision care.'),
  ('zeiss',       '蔡司',     'ZEISS',        'luxury',     40, 'German precision optics, premium quality.'),
  ('transitions', 'Transitions', 'Transitions®', 'premium', 50, 'World leader in photochromic lens technology.');

-- ~24 example lens_skus across Single-Vision + Reading + Non-Prescription.
-- Pricing references: zeelool API SKUs + mind map. Admin should review/adjust.
-- USD cents.

INSERT INTO lens_skus (
  id, brand_id, brand_line, prescription_type, category, refractive_index,
  is_premium_material, color, retail_cents, cost_cny_cents, supplier_sku,
  recommended
) VALUES
  -- Inhouse (budget) — Single-Vision
  ('inhouse-sv-standard-1.57',     'inhouse', NULL, 'single-vision', 'standard',    1.57, 0, NULL,  500,  2600, 'mingyue:56AS', 1),
  ('inhouse-sv-standard-1.61',     'inhouse', NULL, 'single-vision', 'standard',    1.61, 0, NULL, 1500,  4400, 'mingyue:60AS', 0),
  ('inhouse-sv-standard-1.67',     'inhouse', NULL, 'single-vision', 'standard',    1.67, 0, NULL, 5500,  9800, 'mingyue:67AS', 0),
  ('inhouse-sv-bluelight-1.57',    'inhouse', NULL, 'single-vision', 'blue-light',  1.57, 0, NULL, 1800,  5400, NULL,           1),
  ('inhouse-sv-bluelight-1.67',    'inhouse', NULL, 'single-vision', 'blue-light',  1.67, 0, NULL, 6800, 14000, NULL,           0),

  -- Mingyue (mainstream) — Single-Vision
  ('mingyue-sv-standard-1.61',     'mingyue', NULL, 'single-vision', 'standard',    1.61, 0, NULL, 2500,  4400, 'mingyue:60AS', 0),
  ('mingyue-sv-bluelight-1.61',    'mingyue', NULL, 'single-vision', 'blue-light',  1.61, 0, NULL, 3500,  7200, NULL,           0),
  ('mingyue-sv-photochromic-1.61', 'mingyue', NULL, 'single-vision', 'photochromic',1.61, 0, NULL, 4500, 11000, NULL,           0),
  ('mingyue-sv-photochromic-blue-1.61', 'mingyue', NULL, 'single-vision', 'photochromic-blue-combo', 1.61, 0, 'gray',  6500, 13000, NULL, 0),

  -- Essilor (premium) — Single-Vision
  ('essilor-sv-bluelight-1.61',    'essilor', 'Crizal', 'single-vision', 'blue-light',   1.61, 0, NULL, 5500, 16000, NULL, 1),
  ('essilor-sv-bluelight-1.67',    'essilor', 'Crizal', 'single-vision', 'blue-light',   1.67, 0, NULL, 9500, 28000, NULL, 0),
  ('essilor-sv-photochromic-1.61', 'essilor', 'Transitions', 'single-vision', 'photochromic', 1.61, 0, NULL, 11500, 32000, NULL, 0),

  -- Zeiss (luxury) — Single-Vision
  ('zeiss-sv-bluelight-1.61',          'zeiss', 'ClearView',  'single-vision', 'blue-light',  1.61, 0, NULL,  7500, 22000, NULL, 0),
  ('zeiss-sv-bluelight-1.67-pro',      'zeiss', 'DuraVision', 'single-vision', 'blue-light',  1.67, 1, NULL, 12500, 38000, NULL, 0),
  ('zeiss-sv-bluelight-1.74-pro',      'zeiss', 'DuraVision', 'single-vision', 'blue-light',  1.74, 1, NULL, 18000, 52000, NULL, 0),

  -- Transitions® — sub-lines as brand_line
  ('transitions-sv-photochromic-1.61-signature', 'transitions', 'Signature', 'single-vision', 'photochromic', 1.61, 0, 'gray',  11500, 0, NULL, 0),
  ('transitions-sv-photochromic-1.67-gen8',      'transitions', 'GEN 8',     'single-vision', 'photochromic', 1.67, 0, 'amber', 12500, 0, NULL, 0),
  ('transitions-sv-photochromic-1.67-style',     'transitions', 'Style Mirror', 'single-vision', 'photochromic', 1.67, 0, 'dark-gray', 13000, 0, NULL, 0),

  -- Reading Glasses (inhouse + mingyue baseline)
  ('inhouse-rg-standard-1.57',     'inhouse', NULL, 'reading', 'standard',   1.57, 0, NULL,  500, 2600, 'mingyue:56AS', 1),
  ('inhouse-rg-bluelight-1.57',    'inhouse', NULL, 'reading', 'blue-light', 1.57, 0, NULL, 1800, 5400, NULL,           0),
  ('inhouse-rg-bluelight-1.61',    'inhouse', NULL, 'reading', 'blue-light', 1.61, 0, NULL, 2800, 7200, NULL,           0),

  -- Non-Prescription
  ('inhouse-nx-standard-1.57',     'inhouse', NULL, 'non-prescription', 'standard',   1.57, 0, NULL,  500, 2600, NULL, 1),
  ('inhouse-nx-bluelight-1.57',    'inhouse', NULL, 'non-prescription', 'blue-light', 1.57, 0, NULL, 1800, 5400, NULL, 0),

  -- Frame Only
  ('inhouse-fo-frameonly',         'inhouse', NULL, 'frame-only',       'frame-only', 1.57, 0, NULL,    0,    0, NULL, 0);

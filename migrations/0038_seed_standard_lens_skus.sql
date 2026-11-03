-- Seed additional Standard-brand lens SKUs to fill wizard coverage matrix
-- (photochromic / tinted / coatings / progressive — all empty pre-launch).
-- All rows under brand_id='standard'. ID convention:
--   std-{rx2}-{tint}-bl{0|1}-{coat}-{idx3}
-- coat: nc = no coating, ar = AR only, full = AR + anti-scratch + hydrophobic + anti-fog
-- All prices in USD cents.
--
-- Tinted SKUs share lens_colors_json with 3 sample colors (gray / brown / green).

-- Sample lens color set for tinted SKUs (inline-substituted below):
--   '[{"id":"gray","label":{"zh":"灰色","en":"Gray"},"hex":"#5a5a5a"},
--     {"id":"brown","label":{"zh":"茶色","en":"Brown"},"hex":"#5a3a1a"},
--     {"id":"green","label":{"zh":"墨绿","en":"Forest Green"},"hex":"#1a3a2a"}]'

INSERT INTO lens_skus
  (id, brand_id, prescription_type, refractive_index, is_premium_material,
   lens_tint, has_blue_light_filter, coatings_json, lens_colors_json,
   retail_cents, recommended, active, sort_order)
VALUES
  -- ─── single-vision photochromic ──────────────────────────────────────
  ('std-sv-photo-bl0-nc-157','standard','single-vision',1.57,0,'photochromic',0,'[]',NULL,3000,0,1,100),
  ('std-sv-photo-bl0-nc-161','standard','single-vision',1.61,0,'photochromic',0,'[]',NULL,4000,1,1,101),
  ('std-sv-photo-bl0-nc-167','standard','single-vision',1.67,0,'photochromic',0,'[]',NULL,7500,0,1,102),
  ('std-sv-photo-bl1-nc-161','standard','single-vision',1.61,0,'photochromic',1,'[]',NULL,5000,0,1,103),
  ('std-sv-photo-bl0-ar-161','standard','single-vision',1.61,0,'photochromic',0,'["anti-reflective"]',NULL,5500,0,1,104),

  -- ─── single-vision tinted ────────────────────────────────────────────
  ('std-sv-tint-bl0-nc-157','standard','single-vision',1.57,0,'tinted',0,'[]',
    '[{"id":"gray","label":{"zh":"灰色","en":"Gray"},"hex":"#5a5a5a"},{"id":"brown","label":{"zh":"茶色","en":"Brown"},"hex":"#5a3a1a"},{"id":"green","label":{"zh":"墨绿","en":"Forest Green"},"hex":"#1a3a2a"}]',
    2500,0,1,110),
  ('std-sv-tint-bl0-nc-161','standard','single-vision',1.61,0,'tinted',0,'[]',
    '[{"id":"gray","label":{"zh":"灰色","en":"Gray"},"hex":"#5a5a5a"},{"id":"brown","label":{"zh":"茶色","en":"Brown"},"hex":"#5a3a1a"},{"id":"green","label":{"zh":"墨绿","en":"Forest Green"},"hex":"#1a3a2a"}]',
    3500,1,1,111),
  ('std-sv-tint-bl0-nc-167','standard','single-vision',1.67,0,'tinted',0,'[]',
    '[{"id":"gray","label":{"zh":"灰色","en":"Gray"},"hex":"#5a5a5a"},{"id":"brown","label":{"zh":"茶色","en":"Brown"},"hex":"#5a3a1a"},{"id":"green","label":{"zh":"墨绿","en":"Forest Green"},"hex":"#1a3a2a"}]',
    6500,0,1,112),

  -- ─── single-vision clear + coatings ──────────────────────────────────
  ('std-sv-clear-bl0-ar-157','standard','single-vision',1.57,0,'clear',0,'["anti-reflective"]',NULL,1200,0,1,120),
  ('std-sv-clear-bl0-ar-161','standard','single-vision',1.61,0,'clear',0,'["anti-reflective"]',NULL,2200,1,1,121),
  ('std-sv-clear-bl0-ar-167','standard','single-vision',1.67,0,'clear',0,'["anti-reflective"]',NULL,6500,0,1,122),
  ('std-sv-clear-bl0-full-161','standard','single-vision',1.61,0,'clear',0,
    '["anti-reflective","anti-scratch","hydrophobic","anti-fog"]',NULL,3500,0,1,123),
  ('std-sv-clear-bl0-full-167','standard','single-vision',1.67,0,'clear',0,
    '["anti-reflective","anti-scratch","hydrophobic","anti-fog"]',NULL,8000,0,1,124),

  -- ─── single-vision clear + BL @ 1.61 (existing gap) ──────────────────
  ('std-sv-clear-bl1-nc-161','standard','single-vision',1.61,0,'clear',1,'[]',NULL,3000,0,1,130),

  -- ─── reading: fill gaps + photochromic/tinted/coating variants ───────
  ('std-rd-clear-bl0-nc-161','standard','reading',1.61,0,'clear',0,'[]',NULL,1500,0,1,200),
  ('std-rd-clear-bl0-nc-167','standard','reading',1.67,0,'clear',0,'[]',NULL,5500,0,1,201),
  ('std-rd-clear-bl1-nc-167','standard','reading',1.67,0,'clear',1,'[]',NULL,6800,0,1,202),
  ('std-rd-clear-bl0-ar-157','standard','reading',1.57,0,'clear',0,'["anti-reflective"]',NULL,1200,0,1,203),
  ('std-rd-photo-bl0-nc-161','standard','reading',1.61,0,'photochromic',0,'[]',NULL,4000,0,1,204),
  ('std-rd-tint-bl0-nc-161','standard','reading',1.61,0,'tinted',0,'[]',
    '[{"id":"gray","label":{"zh":"灰色","en":"Gray"},"hex":"#5a5a5a"},{"id":"brown","label":{"zh":"茶色","en":"Brown"},"hex":"#5a3a1a"},{"id":"green","label":{"zh":"墨绿","en":"Forest Green"},"hex":"#1a3a2a"}]',
    3500,0,1,205),

  -- ─── progressive: entirely new coverage ──────────────────────────────
  ('std-pg-clear-bl0-nc-157','standard','progressive',1.57,0,'clear',0,'[]',NULL,4500,0,1,300),
  ('std-pg-clear-bl0-nc-161','standard','progressive',1.61,0,'clear',0,'[]',NULL,6000,1,1,301),
  ('std-pg-clear-bl0-nc-167','standard','progressive',1.67,0,'clear',0,'[]',NULL,10000,0,1,302),
  ('std-pg-clear-bl1-nc-161','standard','progressive',1.61,0,'clear',1,'[]',NULL,8000,0,1,303),
  ('std-pg-clear-bl0-ar-161','standard','progressive',1.61,0,'clear',0,'["anti-reflective"]',NULL,7500,0,1,304),
  ('std-pg-photo-bl0-nc-161','standard','progressive',1.61,0,'photochromic',0,'[]',NULL,10000,0,1,305),

  -- ─── non-prescription: extras ────────────────────────────────────────
  ('std-nx-clear-bl0-ar-157','standard','non-prescription',1.57,0,'clear',0,'["anti-reflective"]',NULL,1200,0,1,400),
  ('std-nx-photo-bl0-nc-157','standard','non-prescription',1.57,0,'photochromic',0,'[]',NULL,3000,0,1,401),
  ('std-nx-tint-bl0-nc-157','standard','non-prescription',1.57,0,'tinted',0,'[]',
    '[{"id":"gray","label":{"zh":"灰色","en":"Gray"},"hex":"#5a5a5a"},{"id":"brown","label":{"zh":"茶色","en":"Brown"},"hex":"#5a3a1a"},{"id":"green","label":{"zh":"墨绿","en":"Forest Green"},"hex":"#1a3a2a"}]',
    2500,0,1,402);

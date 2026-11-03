-- Seed the 6 placeholder products from src/data/products.ts into D1.
-- These mirror exactly what the storefront has hardcoded so the
-- "front-end hardcode" → "DB-driven" cutover doesn't change UX visuals.
--
-- Each product gets 8 color variants (the shared FRAME_COLORS palette).
-- Gallery angle images (angle/side/folded) stay as static imports keyed
-- by color.id in the PDP component; no schema change needed for them.

INSERT INTO products (
  id, slug, product_kind, category, shape, rim_type, size_class, material,
  supports_progressive, supports_transitions, is_frame_only_eligible,
  lens_width_mm, bridge_mm, temple_mm, weight_g, bridge_fit,
  name_zh, name_en, highlights_zh_json, highlights_en_json,
  genders_json, style, is_kids,
  price_cents, original_price_cents, currency,
  rating, review_count, hero, is_new, bestseller
) VALUES
  (
    'p-pres-01', 'aurora-tortoise', 'eyeglasses', 'presbyopia',
    'Round', 'Full Rim', 'Medium', 'acetate',
    1, 0, 1,
    49, 21, 145, 18, 'Universal Fit',
    'Aurora 玳瑁圆框', 'Aurora Tortoise Round',
    '["醋酸纤维板材","重量仅 18g","渐进多焦可选","去老年化设计"]',
    '["Premium acetate","Just 18g","Progressive optional","Ageless silhouette"]',
    '["unisex","women"]', 'minimal', 0,
    2600, 3900, 'USD',
    4.8, 312, '/frames/frame-tortoise.png', 0, 1
  ),
  (
    'p-pres-02', 'halo-gold-aviator', 'eyeglasses', 'presbyopia',
    'Aviator', 'Full Rim', 'Medium', 'titanium',
    1, 0, 1,
    55, 18, 145, NULL, 'Universal Fit',
    'Halo 金色飞行员', 'Halo Gold Aviator',
    '["纯钛轻量","商务轻奢","防滑鼻托","高透光镜片"]',
    '["Pure titanium","Quiet-luxury","Non-slip nose pads","High-clarity lens"]',
    '["men","unisex"]', 'business', 0,
    2900, NULL, 'USD',
    4.9, 188, '/frames/frame-gold.png', 1, 1
  ),
  (
    'p-pres-03', 'noir-rectangle', 'eyeglasses', 'presbyopia',
    'Square', 'Full Rim', 'Medium', 'acetate',
    1, 0, 1,
    52, 19, 142, NULL, 'Universal Fit',
    'Noir 哑光黑方框', 'Noir Matte Black',
    '["哑光质感","百搭日常","可折叠","防蓝光镜片"]',
    '["Matte finish","Everyday versatile","Foldable","Blue-light filter"]',
    '["unisex","men"]', 'character', 0,
    2200, NULL, 'USD',
    4.7, 244, '/frames/frame-black.png', 0, 0
  ),
  (
    'p-myo-01', 'lumen-square-clear', 'eyeglasses', 'myopia',
    'Square', 'Full Rim', 'Medium', 'TR90',
    1, 0, 1,
    50, 20, 145, NULL, 'Universal Fit',
    'Lumen 透明方框', 'Lumen Clear Square',
    '["TR90 轻便","蓝光防护","适合上班族"]',
    '["TR90 lightweight","Blue-light filter","Office-ready"]',
    '["unisex"]', 'minimal', 0,
    1000, NULL, 'USD',
    4.8, 522, '/frames/frame-black.png', 0, 1
  ),
  (
    'p-myo-02', 'atlas-gold-metal', 'eyeglasses', 'myopia',
    'Aviator', 'Full Rim', 'Medium', 'metal',
    1, 0, 1,
    54, 18, 144, NULL, 'Universal Fit',
    'Atlas 金属细框', 'Atlas Slim Metal',
    '["1.67 超薄镜片","金属细框","防紫外线"]',
    '["1.67 ultra-thin","Slim metal","UV protection"]',
    '["men"]', 'business', 0,
    2800, NULL, 'USD',
    4.9, 401, '/frames/frame-gold.png', 1, 0
  ),
  (
    'p-myo-03', 'iris-tortoise-round', 'eyeglasses', 'myopia',
    'Round', 'Full Rim', 'Medium', 'acetate',
    1, 0, 1,
    48, 21, 145, NULL, 'Universal Fit',
    'Iris 玳瑁圆框', 'Iris Tortoise Round',
    '["复古圆框","板材质感","适合方圆脸"]',
    '["Vintage round","Acetate feel","Flatters most faces"]',
    '["women","unisex"]', 'character', 0,
    600, NULL, 'USD',
    4.7, 287, '/frames/frame-tortoise.png', 0, 0
  );

-- 8 shared colors per product → 48 color variants total.
-- Sort order matches the FRAME_COLORS order in src/data/products.ts.
WITH p(id) AS (VALUES
  ('p-pres-01'), ('p-pres-02'), ('p-pres-03'),
  ('p-myo-01'),  ('p-myo-02'),  ('p-myo-03')
), c(color_id, label_zh, label_en, hex, sort_order) AS (VALUES
  ('tortoise', '玳瑁',     'Tortoise',         '#8c5a2b', 10),
  ('black',    '哑光黑',   'Matte Black',      '#1f1f1f', 20),
  ('gold',     '香槟金',   'Champagne Gold',   '#c9a96a', 30),
  ('crystal',  '透明水晶', 'Crystal Clear',    '#e7e5e0', 40),
  ('burgundy', '酒红',     'Burgundy',         '#6b1f2a', 50),
  ('navy',     '藏青蓝',   'Navy Blue',        '#1d2a44', 60),
  ('pink',     '雾粉',     'Soft Pink',        '#f0b9b0', 70),
  ('silver',   '枪灰银',   'Gunmetal Silver',  '#9aa0a6', 80)
)
INSERT INTO product_colors (id, product_id, color_id, label_zh, label_en, hex, frame_png_url, sort_order)
SELECT
  'pc-' || p.id || '-' || c.color_id,
  p.id,
  c.color_id,
  c.label_zh,
  c.label_en,
  c.hex,
  '/frames/frame-' || c.color_id || '.png',
  c.sort_order
FROM p, c;

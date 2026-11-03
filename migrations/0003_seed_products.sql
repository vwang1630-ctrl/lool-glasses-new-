-- Seed products + product_colors from src/data/products.ts (6 products).
-- Prices in cents. Highlights as JSON arrays.

INSERT INTO products (
  id, slug, category, style, material, shape, genders_json, fashion,
  name_zh, name_en, price_cents, original_price_cents,
  weight_g, rating, review_count,
  lens_width_mm, bridge_mm, temple_mm,
  frame_png, hero, is_new, bestseller,
  highlights_zh_json, highlights_en_json
) VALUES
  -- Presbyopia
  ('p-pres-01','aurora-tortoise','presbyopia','minimal','acetate','round','["unisex","women"]',1,
   'Aurora 玳瑁圆框','Aurora Tortoise Round',2600,3900,
   18,4.8,312,49,21,145,
   '/frames/frame-tortoise.png','/frames/frame-tortoise.png',0,1,
   '["醋酸纤维板材","重量仅 18g","渐进多焦可选","去老年化设计"]',
   '["Premium acetate","Just 18g","Progressive optional","Ageless silhouette"]'),

  ('p-pres-02','halo-gold-aviator','presbyopia','business','titanium','aviator','["men","unisex"]',1,
   'Halo 金色飞行员','Halo Gold Aviator',2900,NULL,
   NULL,4.9,188,55,18,145,
   '/frames/frame-gold.png','/frames/frame-gold.png',1,1,
   '["纯钛轻量","商务轻奢","防滑鼻托","高透光镜片"]',
   '["Pure titanium","Quiet-luxury","Non-slip nose pads","High-clarity lens"]'),

  ('p-pres-03','noir-rectangle','presbyopia','character','acetate','square','["unisex","men"]',1,
   'Noir 哑光黑方框','Noir Matte Black',2200,NULL,
   NULL,4.7,244,52,19,142,
   '/frames/frame-black.png','/frames/frame-black.png',0,0,
   '["哑光质感","百搭日常","可折叠","防蓝光镜片"]',
   '["Matte finish","Everyday versatile","Foldable","Blue-light filter"]'),

  -- Myopia
  ('p-myo-01','lumen-square-clear','myopia','minimal','tr90','square','["unisex"]',1,
   'Lumen 透明方框','Lumen Clear Square',1000,NULL,
   NULL,4.8,522,50,20,145,
   '/frames/frame-black.png','/frames/frame-black.png',0,1,
   '["TR90 轻便","蓝光防护","适合上班族"]',
   '["TR90 lightweight","Blue-light filter","Office-ready"]'),

  ('p-myo-02','atlas-gold-metal','myopia','business','metal','aviator','["men"]',1,
   'Atlas 金属细框','Atlas Slim Metal',2800,NULL,
   NULL,4.9,401,54,18,144,
   '/frames/frame-gold.png','/frames/frame-gold.png',1,0,
   '["1.67 超薄镜片","金属细框","防紫外线"]',
   '["1.67 ultra-thin","Slim metal","UV protection"]'),

  ('p-myo-03','iris-tortoise-round','myopia','character','acetate','round','["women","unisex"]',1,
   'Iris 玳瑁圆框','Iris Tortoise Round',600,NULL,
   NULL,4.7,287,48,21,145,
   '/frames/frame-tortoise.png','/frames/frame-tortoise.png',0,0,
   '["复古圆框","板材质感","适合方圆脸"]',
   '["Vintage round","Acetate feel","Flatters most faces"]');

-- Product colors. p-pres-01 has 3 colors per design. The other 5 products
-- have only their default color in the design — seed each with one row so
-- catalog API can always return at least one color.

INSERT INTO product_colors (id, product_id, color_id, label_zh, label_en, hex, frame_png, sort_order) VALUES
  ('p-pres-01:tortoise','p-pres-01','tortoise','玳瑁','Tortoise',     '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-pres-01:black',   'p-pres-01','black',   '哑光黑','Matte Black',  '#1f1f1f','/frames/frame-black.png',   1),
  ('p-pres-01:gold',    'p-pres-01','gold',    '香槟金','Champagne Gold','#c9a96a','/frames/frame-gold.png',    2),
  ('p-pres-02:gold',    'p-pres-02','gold',    '香槟金','Champagne Gold','#c9a96a','/frames/frame-gold.png',    0),
  ('p-pres-03:black',   'p-pres-03','black',   '哑光黑','Matte Black',  '#1f1f1f','/frames/frame-black.png',   0),
  ('p-myo-01:black',    'p-myo-01', 'black',   '哑光黑','Matte Black',  '#1f1f1f','/frames/frame-black.png',   0),
  ('p-myo-02:gold',     'p-myo-02', 'gold',    '香槟金','Champagne Gold','#c9a96a','/frames/frame-gold.png',    0),
  ('p-myo-03:tortoise', 'p-myo-03', 'tortoise','玳瑁','Tortoise',     '#8c5a2b','/frames/frame-tortoise.png',0);

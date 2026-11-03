-- Upstream redesigned the catalog so every frame ships in 8 shared colors:
-- tortoise / black / gold / crystal / burgundy / navy / pink / silver.
-- Wipe the per-product color rows from 0003 and replace with 8 × 6 = 48 rows.

DELETE FROM product_colors;

INSERT INTO product_colors (id, product_id, color_id, label_zh, label_en, hex, frame_png, sort_order) VALUES
  -- p-pres-01 Aurora
  ('p-pres-01:tortoise','p-pres-01','tortoise','玳瑁',     'Tortoise',        '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-pres-01:black',   'p-pres-01','black',   '哑光黑',   'Matte Black',     '#1f1f1f','/frames/frame-black.png',   1),
  ('p-pres-01:gold',    'p-pres-01','gold',    '香槟金',   'Champagne Gold',  '#c9a96a','/frames/frame-gold.png',    2),
  ('p-pres-01:crystal', 'p-pres-01','crystal', '透明水晶', 'Crystal Clear',   '#e7e5e0','/frames/frame-crystal.png', 3),
  ('p-pres-01:burgundy','p-pres-01','burgundy','酒红',     'Burgundy',        '#6b1f2a','/frames/frame-burgundy.png',4),
  ('p-pres-01:navy',    'p-pres-01','navy',    '藏青蓝',   'Navy Blue',       '#1d2a44','/frames/frame-navy.png',    5),
  ('p-pres-01:pink',    'p-pres-01','pink',    '雾粉',     'Soft Pink',       '#f0b9b0','/frames/frame-pink.png',    6),
  ('p-pres-01:silver',  'p-pres-01','silver',  '枪灰银',   'Gunmetal Silver', '#9aa0a6','/frames/frame-silver.png',  7),

  -- p-pres-02 Halo
  ('p-pres-02:tortoise','p-pres-02','tortoise','玳瑁',     'Tortoise',        '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-pres-02:black',   'p-pres-02','black',   '哑光黑',   'Matte Black',     '#1f1f1f','/frames/frame-black.png',   1),
  ('p-pres-02:gold',    'p-pres-02','gold',    '香槟金',   'Champagne Gold',  '#c9a96a','/frames/frame-gold.png',    2),
  ('p-pres-02:crystal', 'p-pres-02','crystal', '透明水晶', 'Crystal Clear',   '#e7e5e0','/frames/frame-crystal.png', 3),
  ('p-pres-02:burgundy','p-pres-02','burgundy','酒红',     'Burgundy',        '#6b1f2a','/frames/frame-burgundy.png',4),
  ('p-pres-02:navy',    'p-pres-02','navy',    '藏青蓝',   'Navy Blue',       '#1d2a44','/frames/frame-navy.png',    5),
  ('p-pres-02:pink',    'p-pres-02','pink',    '雾粉',     'Soft Pink',       '#f0b9b0','/frames/frame-pink.png',    6),
  ('p-pres-02:silver',  'p-pres-02','silver',  '枪灰银',   'Gunmetal Silver', '#9aa0a6','/frames/frame-silver.png',  7),

  -- p-pres-03 Noir
  ('p-pres-03:tortoise','p-pres-03','tortoise','玳瑁',     'Tortoise',        '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-pres-03:black',   'p-pres-03','black',   '哑光黑',   'Matte Black',     '#1f1f1f','/frames/frame-black.png',   1),
  ('p-pres-03:gold',    'p-pres-03','gold',    '香槟金',   'Champagne Gold',  '#c9a96a','/frames/frame-gold.png',    2),
  ('p-pres-03:crystal', 'p-pres-03','crystal', '透明水晶', 'Crystal Clear',   '#e7e5e0','/frames/frame-crystal.png', 3),
  ('p-pres-03:burgundy','p-pres-03','burgundy','酒红',     'Burgundy',        '#6b1f2a','/frames/frame-burgundy.png',4),
  ('p-pres-03:navy',    'p-pres-03','navy',    '藏青蓝',   'Navy Blue',       '#1d2a44','/frames/frame-navy.png',    5),
  ('p-pres-03:pink',    'p-pres-03','pink',    '雾粉',     'Soft Pink',       '#f0b9b0','/frames/frame-pink.png',    6),
  ('p-pres-03:silver',  'p-pres-03','silver',  '枪灰银',   'Gunmetal Silver', '#9aa0a6','/frames/frame-silver.png',  7),

  -- p-myo-01 Lumen
  ('p-myo-01:tortoise', 'p-myo-01','tortoise','玳瑁',     'Tortoise',        '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-myo-01:black',    'p-myo-01','black',   '哑光黑',   'Matte Black',     '#1f1f1f','/frames/frame-black.png',   1),
  ('p-myo-01:gold',     'p-myo-01','gold',    '香槟金',   'Champagne Gold',  '#c9a96a','/frames/frame-gold.png',    2),
  ('p-myo-01:crystal',  'p-myo-01','crystal', '透明水晶', 'Crystal Clear',   '#e7e5e0','/frames/frame-crystal.png', 3),
  ('p-myo-01:burgundy', 'p-myo-01','burgundy','酒红',     'Burgundy',        '#6b1f2a','/frames/frame-burgundy.png',4),
  ('p-myo-01:navy',     'p-myo-01','navy',    '藏青蓝',   'Navy Blue',       '#1d2a44','/frames/frame-navy.png',    5),
  ('p-myo-01:pink',     'p-myo-01','pink',    '雾粉',     'Soft Pink',       '#f0b9b0','/frames/frame-pink.png',    6),
  ('p-myo-01:silver',   'p-myo-01','silver',  '枪灰银',   'Gunmetal Silver', '#9aa0a6','/frames/frame-silver.png',  7),

  -- p-myo-02 Atlas
  ('p-myo-02:tortoise', 'p-myo-02','tortoise','玳瑁',     'Tortoise',        '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-myo-02:black',    'p-myo-02','black',   '哑光黑',   'Matte Black',     '#1f1f1f','/frames/frame-black.png',   1),
  ('p-myo-02:gold',     'p-myo-02','gold',    '香槟金',   'Champagne Gold',  '#c9a96a','/frames/frame-gold.png',    2),
  ('p-myo-02:crystal',  'p-myo-02','crystal', '透明水晶', 'Crystal Clear',   '#e7e5e0','/frames/frame-crystal.png', 3),
  ('p-myo-02:burgundy', 'p-myo-02','burgundy','酒红',     'Burgundy',        '#6b1f2a','/frames/frame-burgundy.png',4),
  ('p-myo-02:navy',     'p-myo-02','navy',    '藏青蓝',   'Navy Blue',       '#1d2a44','/frames/frame-navy.png',    5),
  ('p-myo-02:pink',     'p-myo-02','pink',    '雾粉',     'Soft Pink',       '#f0b9b0','/frames/frame-pink.png',    6),
  ('p-myo-02:silver',   'p-myo-02','silver',  '枪灰银',   'Gunmetal Silver', '#9aa0a6','/frames/frame-silver.png',  7),

  -- p-myo-03 Iris
  ('p-myo-03:tortoise', 'p-myo-03','tortoise','玳瑁',     'Tortoise',        '#8c5a2b','/frames/frame-tortoise.png',0),
  ('p-myo-03:black',    'p-myo-03','black',   '哑光黑',   'Matte Black',     '#1f1f1f','/frames/frame-black.png',   1),
  ('p-myo-03:gold',     'p-myo-03','gold',    '香槟金',   'Champagne Gold',  '#c9a96a','/frames/frame-gold.png',    2),
  ('p-myo-03:crystal',  'p-myo-03','crystal', '透明水晶', 'Crystal Clear',   '#e7e5e0','/frames/frame-crystal.png', 3),
  ('p-myo-03:burgundy', 'p-myo-03','burgundy','酒红',     'Burgundy',        '#6b1f2a','/frames/frame-burgundy.png',4),
  ('p-myo-03:navy',     'p-myo-03','navy',    '藏青蓝',   'Navy Blue',       '#1d2a44','/frames/frame-navy.png',    5),
  ('p-myo-03:pink',     'p-myo-03','pink',    '雾粉',     'Soft Pink',       '#f0b9b0','/frames/frame-pink.png',    6),
  ('p-myo-03:silver',   'p-myo-03','silver',  '枪灰银',   'Gunmetal Silver', '#9aa0a6','/frames/frame-silver.png',  7);

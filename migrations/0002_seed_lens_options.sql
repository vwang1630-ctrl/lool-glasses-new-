-- Seed lens_options: 3 types × 3 indices = 9 rows.
-- Pricing approximate; tune later via admin.

INSERT INTO lens_options (id, lens_type, lens_index, extra_cents, label_zh, label_en, sort_order) VALUES
  ('single-1.56',      'single',      '1.56',    0, '单光 1.56',       'Single Vision 1.56',     10),
  ('single-1.61',      'single',      '1.61', 2000, '单光 1.61 超薄',  'Single Vision 1.61',     11),
  ('single-1.67',      'single',      '1.67', 4000, '单光 1.67 超薄',  'Single Vision 1.67',     12),
  ('progressive-1.56', 'progressive', '1.56', 8000, '渐进多焦 1.56',   'Progressive 1.56',       20),
  ('progressive-1.61', 'progressive', '1.61',10000, '渐进多焦 1.61',   'Progressive 1.61',       21),
  ('progressive-1.67', 'progressive', '1.67',12000, '渐进多焦 1.67',   'Progressive 1.67',       22),
  ('blue-1.56',        'blue',        '1.56', 3000, '防蓝光 1.56',     'Blue-light Filter 1.56', 30),
  ('blue-1.61',        'blue',        '1.61', 5000, '防蓝光 1.61',     'Blue-light Filter 1.61', 31),
  ('blue-1.67',        'blue',        '1.67', 7000, '防蓝光 1.67',     'Blue-light Filter 1.67', 32);

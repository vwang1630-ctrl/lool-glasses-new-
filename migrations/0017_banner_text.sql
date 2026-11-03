-- Per-banner editable text. Each hero slot now carries its own eyebrow / title /
-- sub copy in zh + en, so as the slideshow advances the headline changes with
-- the image. Existing subtitle_zh / subtitle_en remain (unused for the hero
-- block; can be repurposed later for editor-pick caption etc.).

ALTER TABLE home_banners ADD COLUMN eyebrow_zh TEXT;
ALTER TABLE home_banners ADD COLUMN eyebrow_en TEXT;
ALTER TABLE home_banners ADD COLUMN title_zh   TEXT;
ALTER TABLE home_banners ADD COLUMN title_en   TEXT;
ALTER TABLE home_banners ADD COLUMN sub_zh     TEXT;
ALTER TABLE home_banners ADD COLUMN sub_en     TEXT;

-- Seed sensible defaults for the 4 pre-existing slots. Mirrors the current
-- i18n strings so the homepage looks identical on first deploy.
UPDATE home_banners SET
  eyebrow_zh = '去老年化老花镜系列',
  eyebrow_en = 'The Ageless Reading Collection',
  title_zh   = '老花，也可以很时尚。',
  title_en   = 'Reading glasses, refreshingly modern.',
  sub_zh     = '为 45–60 岁年轻一代重新设计的轻量、简约、时尚老花镜与近视镜。专业镜片，平价直达。',
  sub_en     = 'Lightweight, modern frames designed for the 45–60 generation. Pro lenses, fair prices, free worldwide shipping.'
WHERE slot = 1;

UPDATE home_banners SET
  eyebrow_zh = '日常通勤系列',
  eyebrow_en = 'Everyday Eyeglasses',
  title_zh   = '一副陪你走遍每一天。',
  title_en   = 'One pair for every moment.',
  sub_zh     = '简约镜框搭配高清光学镜片，办公、出行、日常无缝切换。',
  sub_en     = 'Minimal frames with crisp optical lenses—at home, at work, on the go.'
WHERE slot = 2;

UPDATE home_banners SET
  eyebrow_zh = '近视镜系列',
  eyebrow_en = 'Modern Myopia',
  title_zh   = '清晰世界，轻巧上镜。',
  title_en   = 'See sharper. Wear lighter.',
  sub_zh     = '轻量金属与醋酸纤维镜框，配合超薄高折射率镜片，一整天都不累。',
  sub_en     = 'Featherweight metal & acetate frames paired with high-index lenses you can wear all day.'
WHERE slot = 3;

UPDATE home_banners SET
  eyebrow_zh = '本季编辑精选',
  eyebrow_en = 'Editor''s Pick',
  title_zh   = '小细节，大改变。',
  title_en   = 'Small details. Big difference.',
  sub_zh     = '由我们的造型师精选——经典轮廓，现代线条，越戴越喜欢。',
  sub_en     = 'Hand-picked by our stylists—classic silhouettes with a modern twist.'
WHERE slot = 4;

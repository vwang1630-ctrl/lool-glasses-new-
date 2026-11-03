-- Restore per-slot banner copy. Migration 0017 originally seeded 4 distinct
-- title/sub/eyebrow strings (one per slot) into title_zh/title_en etc.
-- Migration 0021 was supposed to fold those into *_json, but the columns
-- ended up NULL on prod — almost certainly because the /admin/home-banners
-- UI's "save all" path roundtripped the rows back through PUT before any
-- copy was filled in, replacing the seeded *_json with null.
--
-- Net effect today: the homepage carousel rotates between 4 slot images
-- but always shows the slot-1 copy (the global hero.* i18n fallback),
-- because per-banner *_json is null. Restore each slot's intended copy
-- so the carousel actually carousels.
--
-- Only writes when the row currently has nothing to lose (*_json IS NULL),
-- so this is safe to re-run and won't clobber any later admin edit.

UPDATE home_banners SET
  eyebrow_json = json_object(
    'zh', '去老年化老花镜系列',
    'en', 'The Ageless Reading Collection'
  ),
  title_json = json_object(
    'zh', '老花，也可以很时尚。',
    'en', 'Reading glasses, refreshingly modern.'
  ),
  sub_json = json_object(
    'zh', '为 45–60 岁年轻一代重新设计的轻量、简约、时尚老花镜与近视镜。专业镜片，平价直达。',
    'en', 'Lightweight, modern frames designed for the 45–60 generation. Pro lenses, fair prices, free worldwide shipping.'
  ),
  updated_at = unixepoch() * 1000
WHERE slot = 1 AND title_json IS NULL;

UPDATE home_banners SET
  eyebrow_json = json_object(
    'zh', '日常通勤系列',
    'en', 'Everyday Eyeglasses'
  ),
  title_json = json_object(
    'zh', '一副陪你走遍每一天。',
    'en', 'One pair for every moment.'
  ),
  sub_json = json_object(
    'zh', '简约镜框搭配高清光学镜片，办公、出行、日常无缝切换。',
    'en', 'Minimal frames with crisp optical lenses—at home, at work, on the go.'
  ),
  updated_at = unixepoch() * 1000
WHERE slot = 2 AND title_json IS NULL;

UPDATE home_banners SET
  eyebrow_json = json_object(
    'zh', '近视镜系列',
    'en', 'Modern Myopia'
  ),
  title_json = json_object(
    'zh', '清晰世界，轻巧上镜。',
    'en', 'See sharper. Wear lighter.'
  ),
  sub_json = json_object(
    'zh', '轻量金属与醋酸纤维镜框，配合超薄高折射率镜片，一整天都不累。',
    'en', 'Featherweight metal & acetate frames paired with high-index lenses you can wear all day.'
  ),
  updated_at = unixepoch() * 1000
WHERE slot = 3 AND title_json IS NULL;

UPDATE home_banners SET
  eyebrow_json = json_object(
    'zh', '本季编辑精选',
    'en', 'Editor''s Pick'
  ),
  title_json = json_object(
    'zh', '小细节，大改变。',
    'en', 'Small details. Big difference.'
  ),
  sub_json = json_object(
    'zh', '由我们的造型师精选——经典轮廓，现代线条，越戴越喜欢。',
    'en', 'Hand-picked by our stylists—classic silhouettes with a modern twist.'
  ),
  updated_at = unixepoch() * 1000
WHERE slot = 4 AND title_json IS NULL;

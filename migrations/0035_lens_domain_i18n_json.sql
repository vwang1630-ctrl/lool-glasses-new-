-- Lens domain i18n: collapse the *_zh / *_en double-column shape into a
-- single *_json TEXT column per migration 0021's pattern (which already did
-- this for products / product_colors / home_banners).
--
-- json_object() omits NULL values, so a row with only zh filled becomes
-- {"zh":"..."} (no "en":null). The CASE wrapper keeps the column NULL when
-- both legacy columns are NULL, preserving "no override / use auto-name".

-- ─── lens_brands ────────────────────────────────────────────────────────────
ALTER TABLE lens_brands ADD COLUMN name_json TEXT;
ALTER TABLE lens_brands ADD COLUMN description_json TEXT;

UPDATE lens_brands
SET
  name_json = json_object('zh', name_zh, 'en', name_en),
  description_json = CASE
    WHEN description_zh IS NULL AND description_en IS NULL THEN NULL
    ELSE json_object('zh', description_zh, 'en', description_en)
  END;

ALTER TABLE lens_brands DROP COLUMN name_zh;
ALTER TABLE lens_brands DROP COLUMN name_en;
ALTER TABLE lens_brands DROP COLUMN description_zh;
ALTER TABLE lens_brands DROP COLUMN description_en;

-- ─── lens_skus ──────────────────────────────────────────────────────────────
ALTER TABLE lens_skus ADD COLUMN display_name_json TEXT;
ALTER TABLE lens_skus ADD COLUMN description_json TEXT;

UPDATE lens_skus
SET
  display_name_json = CASE
    WHEN display_name_zh IS NULL AND display_name_en IS NULL THEN NULL
    ELSE json_object('zh', display_name_zh, 'en', display_name_en)
  END,
  description_json = CASE
    WHEN description_zh IS NULL AND description_en IS NULL THEN NULL
    ELSE json_object('zh', description_zh, 'en', description_en)
  END;

ALTER TABLE lens_skus DROP COLUMN display_name_zh;
ALTER TABLE lens_skus DROP COLUMN display_name_en;
ALTER TABLE lens_skus DROP COLUMN description_zh;
ALTER TABLE lens_skus DROP COLUMN description_en;

-- ─── lens_addons ────────────────────────────────────────────────────────────
ALTER TABLE lens_addons ADD COLUMN label_json TEXT;
ALTER TABLE lens_addons ADD COLUMN description_json TEXT;

UPDATE lens_addons
SET
  label_json = json_object('zh', label_zh, 'en', label_en),
  description_json = CASE
    WHEN description_zh IS NULL AND description_en IS NULL THEN NULL
    ELSE json_object('zh', description_zh, 'en', description_en)
  END;

ALTER TABLE lens_addons DROP COLUMN label_zh;
ALTER TABLE lens_addons DROP COLUMN label_en;
ALTER TABLE lens_addons DROP COLUMN description_zh;
ALTER TABLE lens_addons DROP COLUMN description_en;

-- 用户面文本字段统一改成 JSON，存全部 10 种语言。
-- DB shape：每个 JSON 字段是 {"zh":"…","en":"…","ja":"…","ko":"…","es":"…","fr":"…","de":"…","it":"…","pt":"…","ar":"…"}
-- 没填的语言 fallback 到 en（前端 helper pickLang 处理）。
--
-- 影响表：home_banners (4 字段) + products (4 字段) + product_colors (1 字段)

-- ============================================================
-- 1. home_banners: eyebrow / title / sub / subtitle (4 fields)
-- ============================================================
ALTER TABLE home_banners ADD COLUMN eyebrow_json  TEXT;
ALTER TABLE home_banners ADD COLUMN title_json    TEXT;
ALTER TABLE home_banners ADD COLUMN sub_json      TEXT;
ALTER TABLE home_banners ADD COLUMN subtitle_json TEXT;

UPDATE home_banners SET eyebrow_json  = json_object('zh', eyebrow_zh,  'en', eyebrow_en);
UPDATE home_banners SET title_json    = json_object('zh', title_zh,    'en', title_en);
UPDATE home_banners SET sub_json      = json_object('zh', sub_zh,      'en', sub_en);
UPDATE home_banners SET subtitle_json = json_object('zh', subtitle_zh, 'en', subtitle_en);

ALTER TABLE home_banners DROP COLUMN eyebrow_zh;
ALTER TABLE home_banners DROP COLUMN eyebrow_en;
ALTER TABLE home_banners DROP COLUMN title_zh;
ALTER TABLE home_banners DROP COLUMN title_en;
ALTER TABLE home_banners DROP COLUMN sub_zh;
ALTER TABLE home_banners DROP COLUMN sub_en;
ALTER TABLE home_banners DROP COLUMN subtitle_zh;
ALTER TABLE home_banners DROP COLUMN subtitle_en;

-- ============================================================
-- 2. products: name / intro / description / highlights (4 fields)
-- ============================================================
ALTER TABLE products ADD COLUMN name_json        TEXT;
ALTER TABLE products ADD COLUMN intro_json       TEXT;
ALTER TABLE products ADD COLUMN description_json TEXT;
ALTER TABLE products ADD COLUMN highlights_json  TEXT;

-- name 是 NOT NULL，所以 _json 一定有内容
UPDATE products SET name_json = json_object('zh', name_zh, 'en', name_en);
UPDATE products SET intro_json = json_object('zh', intro_zh, 'en', intro_en);
UPDATE products SET description_json = json_object('zh', description_zh, 'en', description_en);
-- highlights_*_json 本身已经是 JSON 数组字符串；用 json() 解包成 JSON 值，再用 json_object 套个语言键
UPDATE products SET highlights_json = json_object(
  'zh', CASE WHEN highlights_zh_json IS NOT NULL THEN json(highlights_zh_json) ELSE json('[]') END,
  'en', CASE WHEN highlights_en_json IS NOT NULL THEN json(highlights_en_json) ELSE json('[]') END
);

ALTER TABLE products DROP COLUMN name_zh;
ALTER TABLE products DROP COLUMN name_en;
ALTER TABLE products DROP COLUMN intro_zh;
ALTER TABLE products DROP COLUMN intro_en;
ALTER TABLE products DROP COLUMN description_zh;
ALTER TABLE products DROP COLUMN description_en;
ALTER TABLE products DROP COLUMN highlights_zh_json;
ALTER TABLE products DROP COLUMN highlights_en_json;

-- ============================================================
-- 3. product_colors: label (1 field)
-- ============================================================
ALTER TABLE product_colors ADD COLUMN label_json TEXT;

UPDATE product_colors SET label_json = json_object('zh', label_zh, 'en', label_en);

ALTER TABLE product_colors DROP COLUMN label_zh;
ALTER TABLE product_colors DROP COLUMN label_en;

-- 把 product_colors 上的 5 个 url 列合并成一个 JSON 数组 images_json。
-- 顺序即展示顺序，索引 0 默认就是 hero。tryon_image_url 单独保留（透明 PNG）。
--
-- 旧 5 列：hero_url / front_url / angle_url / side_url / folded_url
-- 新 1 列：images_json TEXT  (JSON array of strings)

ALTER TABLE product_colors ADD COLUMN images_json TEXT;

-- Backfill：以 hero 为首，去掉重复 / null / 空串
UPDATE product_colors SET images_json = (
  SELECT json_group_array(value)
  FROM json_each(json_array(
    coalesce(hero_url, front_url),
    CASE WHEN hero_url IS NOT NULL AND hero_url != front_url THEN front_url END,
    angle_url,
    side_url,
    folded_url
  ))
  WHERE value IS NOT NULL AND value != ''
);

-- 干掉旧列
ALTER TABLE product_colors DROP COLUMN hero_url;
ALTER TABLE product_colors DROP COLUMN front_url;
ALTER TABLE product_colors DROP COLUMN angle_url;
ALTER TABLE product_colors DROP COLUMN side_url;
ALTER TABLE product_colors DROP COLUMN folded_url;

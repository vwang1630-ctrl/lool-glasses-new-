-- 把 hero / tryon 从 products 表搬到 product_colors。每种颜色有自己的实拍 + 试戴图。
--
-- products.hero               → 由 product_colors.hero_url（第一个 color）替代
-- products.tryon_image_url    → 改为 product_colors.tryon_image_url（每色一张可选）
--
-- product_colors.hero_url 已经在 migration 0015 加过，本次只补 tryon_image_url 槽。

ALTER TABLE product_colors ADD COLUMN tryon_image_url TEXT;
ALTER TABLE products DROP COLUMN hero;
ALTER TABLE products DROP COLUMN tryon_image_url;

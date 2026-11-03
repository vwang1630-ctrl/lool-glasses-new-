-- Add per-banner jump link to audience_banners.
-- 文案仍由 i18n 管，图片仍上传到 R2，href 决定点击跳转目标。
-- 留空（NULL / ''）= 用默认硬编码路由（/myopia / /presbyopia）。

ALTER TABLE audience_banners ADD COLUMN href TEXT;

-- Homepage section 5 — "audience dual banner" (近视 / 老花 两张大图).
-- 与 home_banners (4 个 hero slot) 是不同的结构：这里只需要图片 URL，文案走 i18n。
-- 用一张极简的 key-value 表，audience 既是主键又是枚举。

CREATE TABLE audience_banners (
  audience    TEXT PRIMARY KEY CHECK (audience IN ('distance','reading')),
  image_url   TEXT NOT NULL,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

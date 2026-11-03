-- 博客文章表。admin 在 /admin/blog 维护，前台 /$lang/blog 拉 active 行展示。
-- 文案沿 *_json 10 语言约定（src/server/lang.ts）。无 D1 行时前台回退到代码里的
-- 静态 POSTS 数组，方便平滑过渡到运营自管。

CREATE TABLE blog_posts (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  cover_image_url TEXT NOT NULL,
  title_json      TEXT,
  content_json    TEXT,
  published_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_blog_posts_active_pub ON blog_posts (active, published_at DESC);

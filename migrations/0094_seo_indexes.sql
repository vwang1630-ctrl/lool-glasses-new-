-- Migration 0094: SEO/GEO query indexes
-- Speeds up sitemap generation and catalog listing queries that filter on
-- live products / active blog posts.

CREATE INDEX IF NOT EXISTS idx_products_archived_at ON products(archived_at);
CREATE INDEX IF NOT EXISTS idx_products_archived_updated ON products(archived_at, updated_at DESC);

-- blog_posts already has idx_blog_posts_active_pub; keep this migration
-- idempotent and explicit for the sitemap ORDER BY published_at filter.
CREATE INDEX IF NOT EXISTS idx_blog_posts_active_published ON blog_posts(active, published_at DESC);

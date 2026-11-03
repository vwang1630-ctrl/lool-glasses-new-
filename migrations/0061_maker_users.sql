-- /maker portal — separate auth surface from /admin for internal fulfillment
-- staff who turn paid orders into shipped orders.
--
-- Two changes:
-- 1. New `maker_users` table holding logins (username/password). Kept fully
--    separate from `admin_users` so a maker credential can never be used to
--    hit any /api/admin/* endpoint (different cookie name, different
--    middleware, different table).
-- 2. New columns on `orders` for the claim mechanism: maker_id NULL means
--    unclaimed (any maker can pick it up); non-NULL means one specific maker
--    is handling it and other makers see it as read-only "由 X 处理中".
--    We don't reference maker_users via FK because makers are an internal
--    concept and we'd rather keep the column nullable + soft if a maker_user
--    row is later deleted.

CREATE TABLE maker_users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  last_login_at INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

ALTER TABLE orders ADD COLUMN maker_id TEXT;
ALTER TABLE orders ADD COLUMN maker_assigned_at INTEGER;

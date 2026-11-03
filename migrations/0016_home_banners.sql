-- Home page hero banners. 4 slots, each mapped to a product. Admin can swap
-- the product or upload a new image per slot. Price + name + try-on link on
-- the homepage are derived from the linked product, not hardcoded.

CREATE TABLE home_banners (
  id              TEXT PRIMARY KEY,
  slot            INTEGER NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 8),
  product_id      TEXT NOT NULL REFERENCES products(id),
  image_url       TEXT NOT NULL,
  subtitle_zh     TEXT,
  subtitle_en     TEXT,
  active          INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_home_banners_active_slot ON home_banners(active, slot);

INSERT INTO home_banners (id, slot, product_id, image_url, sort_order)
VALUES
  ('hb-1', 1, 'p-pres-01', '/banners/hero-1.jpg', 10),
  ('hb-2', 2, 'p-pres-02', '/banners/hero-2.jpg', 20),
  ('hb-3', 3, 'p-myo-01',  '/banners/hero-3.jpg', 30),
  ('hb-4', 4, 'p-myo-02',  '/banners/hero-4.jpg', 40);

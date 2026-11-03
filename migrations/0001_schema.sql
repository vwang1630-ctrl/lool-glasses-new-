-- lool.work — D1 schema v1
-- 10 tables: products + colors, lens options, prescriptions, orders + items,
-- shipments + events, OTP, admin.
-- Timestamps are Unix epoch milliseconds (INTEGER). Prices are cents (INTEGER).

PRAGMA foreign_keys = ON;

-- =====================================================================
-- Catalog
-- =====================================================================

CREATE TABLE products (
  id                   TEXT PRIMARY KEY,                  -- e.g. 'p-pres-01'
  slug                 TEXT NOT NULL UNIQUE,              -- e.g. 'aurora-tortoise'
  category             TEXT NOT NULL CHECK (category IN ('presbyopia','myopia')),
  style                TEXT,                              -- minimal|business|character|classic
  material             TEXT,                              -- acetate|metal|tr90|titanium
  shape                TEXT,                              -- round|square|aviator|cateye|oval
  genders_json         TEXT,                              -- JSON array, e.g. '["unisex","women"]'
  fashion              INTEGER NOT NULL DEFAULT 0 CHECK (fashion IN (0,1)),
  name_zh              TEXT NOT NULL,
  name_en              TEXT NOT NULL,
  price_cents          INTEGER NOT NULL CHECK (price_cents >= 0),
  original_price_cents INTEGER,
  currency             TEXT NOT NULL DEFAULT 'USD',
  weight_g             INTEGER,
  rating               REAL NOT NULL DEFAULT 0,
  review_count         INTEGER NOT NULL DEFAULT 0,
  lens_width_mm        INTEGER,
  bridge_mm            INTEGER,
  temple_mm            INTEGER,
  frame_png            TEXT,                              -- default frame PNG path
  hero                 TEXT,
  is_new               INTEGER NOT NULL DEFAULT 0 CHECK (is_new IN (0,1)),
  bestseller           INTEGER NOT NULL DEFAULT 0 CHECK (bestseller IN (0,1)),
  highlights_zh_json   TEXT,                              -- JSON array
  highlights_en_json   TEXT,                              -- JSON array
  created_at           INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  archived_at          INTEGER
);
CREATE INDEX idx_products_category ON products(category, archived_at);
CREATE INDEX idx_products_bestseller ON products(bestseller, archived_at);

CREATE TABLE product_colors (
  id          TEXT PRIMARY KEY,                           -- e.g. 'p-pres-01:tortoise'
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id    TEXT NOT NULL,                              -- e.g. 'tortoise'
  label_zh    TEXT NOT NULL,
  label_en    TEXT NOT NULL,
  hex         TEXT NOT NULL,
  frame_png   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, color_id)
);
CREATE INDEX idx_product_colors_product ON product_colors(product_id, sort_order);

CREATE TABLE lens_options (
  id          TEXT PRIMARY KEY,                           -- e.g. 'single-1.56'
  lens_type   TEXT NOT NULL CHECK (lens_type IN ('single','progressive','blue')),
  lens_index  TEXT NOT NULL CHECK (lens_index IN ('1.56','1.61','1.67')),
  extra_cents INTEGER NOT NULL DEFAULT 0,
  label_zh    TEXT NOT NULL,
  label_en    TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  UNIQUE (lens_type, lens_index)
);

-- =====================================================================
-- Prescriptions
-- =====================================================================

CREATE TABLE prescriptions (
  id              TEXT PRIMARY KEY,                       -- nanoid
  email           TEXT NOT NULL,
  label_zh        TEXT,
  label_en        TEXT,
  source          TEXT NOT NULL CHECK (source IN ('manual','upload','measure-pd')),

  -- Sphere (球镜)
  sph_od          REAL,
  sph_os          REAL,
  -- Cylinder (柱镜, 散光)
  cyl_od          REAL,
  cyl_os          REAL,
  -- Axis (轴位 0-180)
  axis_od         INTEGER CHECK (axis_od IS NULL OR (axis_od BETWEEN 0 AND 180)),
  axis_os         INTEGER CHECK (axis_os IS NULL OR (axis_os BETWEEN 0 AND 180)),
  -- Add (加光, 老花/双光/渐进)
  add_od          REAL,
  add_os          REAL,
  -- Prism (棱镜)
  prism_od        REAL,
  prism_base_od   TEXT CHECK (prism_base_od IS NULL OR prism_base_od IN ('BU','BD','BI','BO')),
  prism_os        REAL,
  prism_base_os   TEXT CHECK (prism_base_os IS NULL OR prism_base_os IN ('BU','BD','BI','BO')),
  -- PD (瞳距 mm)
  pd_total        REAL,
  pd_od_half      REAL,
  pd_os_half      REAL,

  -- Optional uploaded prescription image/PDF on R2
  upload_r2_key   TEXT,
  upload_filename TEXT,
  upload_mime     TEXT,

  exam_date       INTEGER,                                -- 验光日期 epoch ms
  notes           TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_prescriptions_email ON prescriptions(email, created_at);

-- =====================================================================
-- Orders
-- =====================================================================

CREATE TABLE orders (
  id                TEXT PRIMARY KEY,                     -- ulid
  order_number      TEXT NOT NULL UNIQUE,                 -- 'LMO-XXXXXXXX' (8 chars base36)
  email             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  content_lang      TEXT,                                 -- zh/en/...

  subtotal_cents    INTEGER NOT NULL,
  shipping_cents    INTEGER NOT NULL DEFAULT 0,
  tax_cents         INTEGER NOT NULL DEFAULT 0,
  total_cents       INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',

  ship_recipient    TEXT NOT NULL,
  ship_country      TEXT NOT NULL,
  ship_zip          TEXT NOT NULL,
  ship_address      TEXT NOT NULL,
  ship_phone        TEXT NOT NULL,

  payment_provider  TEXT CHECK (payment_provider IS NULL OR payment_provider IN ('airwallex','paypal')),
  payment_intent_id TEXT,
  payment_method    TEXT,                                 -- card/alipay/wechat/paypal/...

  paid_at           INTEGER,
  shipped_at        INTEGER,
  delivered_at      INTEGER,
  cancelled_at      INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_orders_email ON orders(email, created_at);
CREATE INDEX idx_orders_status ON orders(status, created_at);

CREATE TABLE order_items (
  id                  TEXT PRIMARY KEY,
  order_id            TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          TEXT NOT NULL,                      -- not FK: keep history if product deleted
  product_slug        TEXT NOT NULL,
  color_id            TEXT,
  qty                 INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),

  lens_type           TEXT NOT NULL,
  lens_index          TEXT NOT NULL,
  lens_extra_cents    INTEGER NOT NULL DEFAULT 0,

  prescription_id     TEXT REFERENCES prescriptions(id),

  unit_frame_cents    INTEGER NOT NULL,
  line_total_cents    INTEGER NOT NULL,

  product_name_zh     TEXT NOT NULL,                      -- snapshot
  product_name_en     TEXT NOT NULL,                      -- snapshot
  frame_png_snapshot  TEXT
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =====================================================================
-- Shipments
-- =====================================================================

CREATE TABLE shipments (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier         TEXT,
  tracking_number TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','in_transit','delivered','exception')),
  shipped_at      INTEGER,
  delivered_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_shipments_order ON shipments(order_id);

CREATE TABLE shipment_events (
  id              TEXT PRIMARY KEY,
  shipment_id     TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_at        INTEGER NOT NULL,
  location        TEXT,
  status_text_zh  TEXT,
  status_text_en  TEXT,
  raw_json        TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id, event_at);

-- =====================================================================
-- OTP for email-based lookup
-- =====================================================================

CREATE TABLE order_otp (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,                              -- sha256, never plain
  purpose     TEXT NOT NULL CHECK (purpose IN ('lookup_order','lookup_rx')),
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_otp_email_expires ON order_otp(email, expires_at);

-- =====================================================================
-- Admin
-- =====================================================================

CREATE TABLE admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner','staff')),
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  last_login_at INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

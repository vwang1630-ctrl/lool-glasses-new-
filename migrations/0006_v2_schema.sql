-- v2 schema migration step 2/3: create v2 tables.
-- Authoritative design: docs/schema-v2-design.md
-- Time stamps: Unix epoch ms (INTEGER). Money: cents (USD retail / CNY cost).

PRAGMA foreign_keys = ON;

-- v1 tables were renamed to *_v1 in 0005, but their indexes kept original
-- names (SQLite quirk). Drop them so v2 can use the same index names.
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_bestseller;
DROP INDEX IF EXISTS idx_product_colors_product;
DROP INDEX IF EXISTS idx_orders_email;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_items_order;
DROP INDEX IF EXISTS idx_shipments_order;
DROP INDEX IF EXISTS idx_shipment_events_shipment;
DROP INDEX IF EXISTS idx_otp_email_expires;
DROP INDEX IF EXISTS idx_prescriptions_email;

-- =====================================================================
-- Catalog domain
-- =====================================================================

CREATE TABLE products (
  id                          TEXT PRIMARY KEY,
  slug                        TEXT NOT NULL UNIQUE,

  product_kind                TEXT NOT NULL CHECK (product_kind IN ('eyeglasses','sunglasses','accessory')),
  category                    TEXT,

  shape                       TEXT CHECK (shape IS NULL OR shape IN ('Square','Rectangle','Cat eye','Butterfly','Round','Geometric','Aviator','Browline','Oval')),
  rim_type                    TEXT CHECK (rim_type IS NULL OR rim_type IN ('Full Rim','Semi Rim','Rimless')),
  size_class                  TEXT CHECK (size_class IS NULL OR size_class IN ('Narrow','Medium','Wide','Extra Wide','Custom')),
  thickness                   TEXT CHECK (thickness IS NULL OR thickness IN ('thin frame','normal frame','thick frame')),
  material                    TEXT,

  supports_progressive        INTEGER NOT NULL DEFAULT 0 CHECK (supports_progressive IN (0,1)),
  supports_transitions        INTEGER NOT NULL DEFAULT 0 CHECK (supports_transitions IN (0,1)),
  is_frame_only_eligible      INTEGER NOT NULL DEFAULT 1 CHECK (is_frame_only_eligible IN (0,1)),

  lens_width_mm               INTEGER,
  bridge_mm                   INTEGER,
  temple_mm                   INTEGER,
  frame_width_mm              INTEGER,
  lens_height_mm              REAL,
  weight_g                    REAL,
  bridge_fit                  TEXT CHECK (bridge_fit IS NULL OR bridge_fit IN ('Universal Fit','Low Fit','Asian Fit')),
  spring_hinge                INTEGER NOT NULL DEFAULT 0 CHECK (spring_hinge IN (0,1)),
  adjustable_nosepads         INTEGER NOT NULL DEFAULT 0 CHECK (adjustable_nosepads IN (0,1)),

  name_zh                     TEXT NOT NULL,
  name_en                     TEXT NOT NULL,
  intro_zh                    TEXT,
  intro_en                    TEXT,
  description_zh              TEXT,
  description_en              TEXT,
  highlights_zh_json          TEXT,
  highlights_en_json          TEXT,
  face_shape_tags_json        TEXT,

  genders_json                TEXT,
  style                       TEXT,
  is_kids                     INTEGER NOT NULL DEFAULT 0 CHECK (is_kids IN (0,1)),

  price_cents                 INTEGER NOT NULL CHECK (price_cents >= 0),
  original_price_cents        INTEGER,
  currency                    TEXT NOT NULL DEFAULT 'USD',

  rating                      REAL NOT NULL DEFAULT 0,
  review_count                INTEGER NOT NULL DEFAULT 0,
  hero                        TEXT,
  tryon_image_url             TEXT,
  is_new                      INTEGER NOT NULL DEFAULT 0 CHECK (is_new IN (0,1)),
  bestseller                  INTEGER NOT NULL DEFAULT 0 CHECK (bestseller IN (0,1)),

  created_at                  INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at                  INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  archived_at                 INTEGER
);
CREATE INDEX idx_products_kind        ON products(product_kind, archived_at);
CREATE INDEX idx_products_category    ON products(category, archived_at);
CREATE INDEX idx_products_progressive ON products(supports_progressive, archived_at);
CREATE INDEX idx_products_bestseller  ON products(bestseller, archived_at);

CREATE TABLE product_colors (
  id              TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id        TEXT NOT NULL,
  label_zh        TEXT NOT NULL,
  label_en        TEXT NOT NULL,
  hex             TEXT NOT NULL,
  frame_png_url   TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, color_id)
);
CREATE INDEX idx_product_colors_product ON product_colors(product_id, sort_order);

CREATE TABLE product_lens_overrides (
  product_id        TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rule_kind         TEXT NOT NULL CHECK (rule_kind IN ('disallow_lens_option','disallow_index')),
  lens_option_id    TEXT,
  lens_index_id     TEXT,
  reason            TEXT,
  PRIMARY KEY (product_id, rule_kind, lens_option_id, lens_index_id)
);

-- =====================================================================
-- Lens catalog domain
-- =====================================================================

CREATE TABLE lens_categories (
  id                   TEXT PRIMARY KEY,
  prescription_type    TEXT NOT NULL CHECK (prescription_type IN
                         ('single-vision','progressive','reading','non-prescription',
                          'sunglasses-prescription','sunglasses-non-prescription','frame-only')),
  category_key         TEXT NOT NULL CHECK (category_key IN
                         ('frame-only','standard','blue-light','photochromic','photochromic-blue-combo',
                          'transitions','driving','color-tinted','polarized','classic-progressive')),
  base_cents           INTEGER NOT NULL DEFAULT 0,
  has_color_options    INTEGER NOT NULL DEFAULT 0 CHECK (has_color_options IN (0,1)),
  hero_img_url         TEXT,
  label_zh             TEXT NOT NULL,
  label_en             TEXT NOT NULL,
  description_zh       TEXT,
  description_en       TEXT,
  active               INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order           INTEGER NOT NULL DEFAULT 0,
  UNIQUE (prescription_type, category_key)
);

CREATE TABLE lens_indices (
  id                   TEXT PRIMARY KEY,
  index_value          REAL NOT NULL,
  is_pro               INTEGER NOT NULL DEFAULT 0 CHECK (is_pro IN (0,1)),
  brand                TEXT,
  extra_cents          INTEGER NOT NULL,
  thickness_label      TEXT,
  description_zh       TEXT,
  description_en       TEXT,
  recommended_for      TEXT,
  hero_img_url         TEXT,
  active               INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lens_colors (
  id                          TEXT PRIMARY KEY,
  label_zh                    TEXT NOT NULL,
  label_en                    TEXT NOT NULL,
  hex_preview                 TEXT NOT NULL,
  applies_to_categories_json  TEXT NOT NULL,
  sort_order                  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lens_options (
  id                         TEXT PRIMARY KEY,
  lens_category_id           TEXT NOT NULL REFERENCES lens_categories(id),
  lens_index_id              TEXT NOT NULL REFERENCES lens_indices(id),
  lens_color_id              TEXT REFERENCES lens_colors(id),
  price_override_cents       INTEGER,
  retail_price_cents         INTEGER NOT NULL,
  recommended                INTEGER NOT NULL DEFAULT 0 CHECK (recommended IN (0,1)),
  zeelool_sku_ref            TEXT,
  active                     INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order                 INTEGER NOT NULL DEFAULT 0,
  UNIQUE (lens_category_id, lens_index_id, lens_color_id)
);
CREATE INDEX idx_lens_options_category ON lens_options(lens_category_id, active);

CREATE TABLE lens_addons (
  id                          TEXT PRIMARY KEY,
  kind                        TEXT NOT NULL CHECK (kind IN ('coating','service')),
  retail_cents                INTEGER NOT NULL,
  cost_cny_cents              INTEGER,
  applies_to_kinds_json       TEXT,
  applies_to_categories_json  TEXT,
  label_zh                    TEXT NOT NULL,
  label_en                    TEXT NOT NULL,
  description_zh              TEXT,
  description_en              TEXT,
  active                      INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order                  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lens_supplier_catalog (
  id                          TEXT PRIMARY KEY,
  supplier                    TEXT NOT NULL,
  supplier_sku_code           TEXT NOT NULL,
  series                      TEXT,
  material                    TEXT,
  surface_type                TEXT,
  refractive_index            REAL,
  coating                     TEXT,
  color_treatment             TEXT,
  cost_cny_cents              INTEGER NOT NULL,
  supports_prism              INTEGER NOT NULL DEFAULT 0 CHECK (supports_prism IN (0,1)),
  supports_thinning           INTEGER NOT NULL DEFAULT 0 CHECK (supports_thinning IN (0,1)),
  supports_decentration       INTEGER NOT NULL DEFAULT 0 CHECK (supports_decentration IN (0,1)),
  sph_min                     REAL,
  sph_max                     REAL,
  cyl_min                     REAL,
  cyl_max                     REAL,
  add_min                     REAL,
  add_max                     REAL,
  diameter_min                INTEGER,
  diameter_max                INTEGER,
  active                      INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes_json                  TEXT,
  imported_at                 INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  UNIQUE (supplier, supplier_sku_code)
);
CREATE INDEX idx_supplier_catalog_index    ON lens_supplier_catalog(refractive_index, active);
CREATE INDEX idx_supplier_catalog_supplier ON lens_supplier_catalog(supplier, supplier_sku_code);

CREATE TABLE lens_option_supplier_mapping (
  lens_option_id        TEXT NOT NULL REFERENCES lens_options(id),
  supplier_sku_id       TEXT NOT NULL REFERENCES lens_supplier_catalog(id),
  priority              INTEGER NOT NULL DEFAULT 0,
  match_rule_json       TEXT,
  PRIMARY KEY (lens_option_id, supplier_sku_id)
);

-- =====================================================================
-- Prescription domain
-- =====================================================================

CREATE TABLE prescriptions (
  id                  TEXT PRIMARY KEY,
  email               TEXT NOT NULL,
  label_zh            TEXT,
  label_en            TEXT,
  source              TEXT NOT NULL CHECK (source IN ('manual','upload','measure-pd','readers')),

  sph_od              REAL,
  sph_os              REAL,
  cyl_od              REAL,
  cyl_os              REAL,
  axis_od             INTEGER CHECK (axis_od IS NULL OR (axis_od BETWEEN 0 AND 180)),
  axis_os             INTEGER CHECK (axis_os IS NULL OR (axis_os BETWEEN 0 AND 180)),
  add_od              REAL,
  add_os              REAL,
  prism_od            REAL,
  prism_base_od       TEXT CHECK (prism_base_od IS NULL OR prism_base_od IN ('BU','BD','BI','BO')),
  prism_os            REAL,
  prism_base_os       TEXT CHECK (prism_base_os IS NULL OR prism_base_os IN ('BU','BD','BI','BO')),
  pd_total            REAL,
  pd_od_half          REAL,
  pd_os_half          REAL,

  reader_magnification REAL,

  upload_r2_key       TEXT,
  upload_filename     TEXT,
  upload_mime         TEXT,

  exam_date           INTEGER,
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_prescriptions_email ON prescriptions(email, created_at);

-- =====================================================================
-- Order domain
-- =====================================================================

CREATE TABLE orders (
  id                TEXT PRIMARY KEY,
  order_number      TEXT NOT NULL UNIQUE,
  email             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  content_lang      TEXT,

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
  payment_method    TEXT,

  paid_at           INTEGER,
  shipped_at        INTEGER,
  delivered_at      INTEGER,
  cancelled_at      INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_orders_email  ON orders(email, created_at);
CREATE INDEX idx_orders_status ON orders(status, created_at);

CREATE TABLE order_items (
  id                       TEXT PRIMARY KEY,
  order_id                 TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id               TEXT NOT NULL,
  product_slug             TEXT NOT NULL,
  product_name_zh          TEXT NOT NULL,
  product_name_en          TEXT NOT NULL,
  frame_color_id           TEXT,
  frame_png_snapshot_url   TEXT,
  qty                      INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),

  lens_option_id           TEXT NOT NULL,
  lens_category_snapshot   TEXT NOT NULL,
  lens_index_snapshot      TEXT NOT NULL,
  lens_color_snapshot      TEXT,
  lens_retail_cents_snapshot INTEGER NOT NULL,

  prescription_id          TEXT REFERENCES prescriptions(id),
  addons_json              TEXT,

  unit_frame_cents         INTEGER NOT NULL,
  unit_lens_cents          INTEGER NOT NULL,
  unit_addons_cents        INTEGER NOT NULL DEFAULT 0,
  line_total_cents         INTEGER NOT NULL,

  fulfillment_supplier_sku TEXT,
  fulfillment_status       TEXT,
  fulfillment_notes        TEXT
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =====================================================================
-- Support domain
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

CREATE TABLE order_otp (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('lookup_order','lookup_rx')),
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_otp_email_expires ON order_otp(email, expires_at);

CREATE TABLE admin_users (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  role              TEXT NOT NULL CHECK (role IN ('owner','staff')),
  permissions_json  TEXT,
  active            INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  last_login_at     INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

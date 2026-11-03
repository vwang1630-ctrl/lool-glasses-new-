-- Suppliers dictionary: who actually ships frames and cuts lenses.
-- Each order's fulfillment splits across (frame_supplier, lens_supplier).
-- Frame supplier: usually small Wenzhou/Shenzhen factory.
-- Lens supplier: lens lab (Mingyue / Zeiss / Essilor) that does Rx cutting.

CREATE TABLE suppliers (
  id              TEXT PRIMARY KEY,
  name_zh         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN ('lens','frame','both','accessory')),

  -- Contact
  contact_person  TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  shipping_address TEXT,

  -- Business terms
  payment_terms   TEXT,                               -- 'NET30' / 'COD' / 'prepaid' / 'NET60'
  lead_time_days  INTEGER,                            -- typical processing + shipping
  notes           TEXT,

  active          INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX idx_suppliers_kind_active ON suppliers(kind, active);

-- Frame supplier reference on products
ALTER TABLE products ADD COLUMN supplier_id  TEXT REFERENCES suppliers(id);
ALTER TABLE products ADD COLUMN supplier_sku TEXT;

-- Lens supplier reference on lens_skus (existing supplier_sku TEXT kept)
ALTER TABLE lens_skus ADD COLUMN supplier_id TEXT REFERENCES suppliers(id);

CREATE INDEX idx_products_supplier ON products(supplier_id, archived_at);
CREATE INDEX idx_lens_skus_supplier_id ON lens_skus(supplier_id, active);

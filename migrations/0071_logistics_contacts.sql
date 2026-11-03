-- 0071 — split logistics 对接人 (pickup contact) out of suppliers.
--
-- Before: each row in `suppliers` (kind='logistics') carried a single
-- contact_person / contact_email / contact_phone. Reality: one carrier (DHL)
-- has multiple pickup agents — 张三 走 DHL，李四 也走 DHL — and one person
-- (张三) may serve multiple carriers (DHL + 顺丰国际).
--
-- After:
--   logistics_contacts            — the person (name / phone / email / notes)
--   logistics_supplier_contacts   — m:n join: which carriers this person can do
--   shipments.pickup_contact_id   — which person actually handled this shipment
--
-- The supplier-level contact_person/email/phone columns stay on `suppliers`
-- for the other kinds (lens / frame / payment), but the logistics admin page
-- will hide them and steer everyone to the new dedicated 对接人 page.

CREATE TABLE logistics_contacts (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  notes       TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_logistics_contacts_active ON logistics_contacts(active, sort_order);

CREATE TABLE logistics_supplier_contacts (
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  contact_id  TEXT NOT NULL REFERENCES logistics_contacts(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  PRIMARY KEY (supplier_id, contact_id)
);

CREATE INDEX idx_lsc_contact ON logistics_supplier_contacts(contact_id);

-- shipments is empty in prod (per 0066 note); a simple ALTER ADD COLUMN
-- is safe and avoids another rename-rename rebuild.
ALTER TABLE shipments ADD COLUMN pickup_contact_id TEXT
  REFERENCES logistics_contacts(id) ON DELETE SET NULL;

CREATE INDEX idx_shipments_pickup_contact ON shipments(pickup_contact_id);

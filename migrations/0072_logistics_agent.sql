-- 0072 — model shipment choice as a logistics agent route.
--
-- A tracker does not pick a carrier alone, nor a person alone. They pick one
-- concrete route such as "DHL - Zhang San": the agent receives the package,
-- while supplier_id points at the carrier whose tracking/API config applies.

CREATE TABLE logistics_agent (
  id              TEXT PRIMARY KEY,
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  agent_name      TEXT NOT NULL,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  notes           TEXT,
  active          INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_logistics_agent_active ON logistics_agent(active, sort_order);
CREATE INDEX idx_logistics_agent_supplier ON logistics_agent(supplier_id, active);

INSERT INTO logistics_agent (
  id, supplier_id, agent_name, contact_person, phone, email, notes,
  active, sort_order, created_at, updated_at
)
SELECT
  lsc.supplier_id || '-' || lc.id,
  lsc.supplier_id,
  lc.name,
  lc.name,
  lc.phone,
  lc.email,
  lc.notes,
  lc.active,
  lc.sort_order,
  lc.created_at,
  lc.updated_at
FROM logistics_supplier_contacts lsc
JOIN logistics_contacts lc ON lc.id = lsc.contact_id;

ALTER TABLE shipments ADD COLUMN logistics_agent_id TEXT
  REFERENCES logistics_agent(id) ON DELETE SET NULL;

CREATE INDEX idx_shipments_logistics_agent ON shipments(logistics_agent_id);

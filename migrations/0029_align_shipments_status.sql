-- Align shipments.status enum with the values the admin UI + API have always
-- used. Old CHECK was ('pending','in_transit','delivered','exception'); the
-- code emits ('pending','in-transit','delivered','returned'), so any status
-- transition past 'pending'/'delivered' would have been rejected by SQLite.
-- Discovered during the admin/DB parity audit.

CREATE TABLE shipments_new (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier         TEXT,
  tracking_number TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','in-transit','delivered','returned')),
  shipped_at      INTEGER,
  delivered_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

INSERT INTO shipments_new (
  id, order_id, carrier, tracking_number, status,
  shipped_at, delivered_at, created_at, updated_at
)
SELECT
  id, order_id, carrier, tracking_number,
  CASE
    WHEN status = 'in_transit' THEN 'in-transit'
    WHEN status = 'exception'  THEN 'returned'
    ELSE status
  END AS status,
  shipped_at, delivered_at, created_at, updated_at
FROM shipments;

DROP TABLE shipments;
ALTER TABLE shipments_new RENAME TO shipments;
CREATE INDEX idx_shipments_order ON shipments(order_id);

-- 0066 — fix shipments.order_id FK pointing at the phantom orders_old_v2.
--
-- Background: 0058 (orders_allow_stripe) used a rename-rename pattern —
-- `ALTER TABLE orders RENAME TO orders_old_v2; ALTER TABLE orders_v2 RENAME
-- TO orders; DROP TABLE orders_old_v2;` SQLite silently rewrote
-- shipments.order_id's REFERENCES from `orders` to `orders_old_v2` to follow
-- the rename, and never undid it when the destination table was dropped.
-- Result: shipments.order_id now references a non-existent table, and ANY
-- `DELETE FROM orders` fails with `no such table: main.orders_old_v2` because
-- SQLite tries to follow the cascade.
--
-- Both shipments and shipment_events were and still are empty in production,
-- so the cleanest fix is to drop and re-create them with the correct FK.
-- (Per the sqlite-table-rebuild-gotchas lesson, prefer DROP-then-CREATE over
-- rename-rename to avoid this class of FK rewrite.)

DROP TABLE IF EXISTS shipment_events;
DROP TABLE IF EXISTS shipments;

CREATE TABLE shipments (
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

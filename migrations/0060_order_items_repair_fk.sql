-- Hotfix for 0058: the orders rename swap (RENAME orders → orders_old_v2,
-- RENAME orders_v2 → orders) caused SQLite to auto-rewrite order_items's
-- FK from `REFERENCES orders(id)` to `REFERENCES "orders_old_v2"(id)`.
-- Then 0058's `DROP TABLE IF EXISTS orders_old_v2` left the FK dangling,
-- so every INSERT into order_items now fails with
-- `D1_ERROR: no such table: main.orders_old_v2`.
--
-- Fix: rebuild order_items with the FK explicitly pointing at `orders`.
-- This time use DROP-then-RENAME (not RENAME-then-RENAME) so SQLite has
-- no opportunity to rewrite the new FK.

CREATE TABLE order_items_v2 (
  id                              TEXT PRIMARY KEY,
  order_id                        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id                      TEXT NOT NULL,
  product_slug                    TEXT NOT NULL,
  product_name_zh                 TEXT NOT NULL,
  product_name_en                 TEXT NOT NULL,
  frame_color_id                  TEXT,
  frame_png_snapshot_url          TEXT,
  qty                             INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),

  lens_option_id                  TEXT NOT NULL,
  lens_category_snapshot          TEXT NOT NULL,
  lens_index_snapshot             TEXT NOT NULL,
  lens_color_snapshot             TEXT,
  lens_retail_cents_snapshot      INTEGER NOT NULL,

  prescription_id                 TEXT REFERENCES prescriptions(id),
  unit_frame_cents                INTEGER NOT NULL,
  unit_lens_cents                 INTEGER NOT NULL,
  line_total_cents                INTEGER NOT NULL,

  fulfillment_supplier_sku        TEXT,
  fulfillment_status              TEXT,
  fulfillment_notes               TEXT,

  lens_base_function_snapshot     TEXT,
  lens_color_id_snapshot          TEXT,
  lens_brand_id_snapshot          TEXT,
  lens_brand_label_json           TEXT,
  lens_base_function_label_json   TEXT,
  lens_progressive_tier_snapshot  TEXT
);

INSERT INTO order_items_v2 (
  id, order_id, product_id, product_slug, product_name_zh, product_name_en,
  frame_color_id, frame_png_snapshot_url, qty,
  lens_option_id, lens_category_snapshot, lens_index_snapshot,
  lens_color_snapshot, lens_retail_cents_snapshot,
  prescription_id, unit_frame_cents, unit_lens_cents, line_total_cents,
  fulfillment_supplier_sku, fulfillment_status, fulfillment_notes,
  lens_base_function_snapshot, lens_color_id_snapshot, lens_brand_id_snapshot,
  lens_brand_label_json, lens_base_function_label_json, lens_progressive_tier_snapshot
)
SELECT
  id, order_id, product_id, product_slug, product_name_zh, product_name_en,
  frame_color_id, frame_png_snapshot_url, qty,
  lens_option_id, lens_category_snapshot, lens_index_snapshot,
  lens_color_snapshot, lens_retail_cents_snapshot,
  prescription_id, unit_frame_cents, unit_lens_cents, line_total_cents,
  fulfillment_supplier_sku, fulfillment_status, fulfillment_notes,
  lens_base_function_snapshot, lens_color_id_snapshot, lens_brand_id_snapshot,
  lens_brand_label_json, lens_base_function_label_json, lens_progressive_tier_snapshot
FROM order_items;

DROP INDEX IF EXISTS idx_order_items_order;

DROP TABLE order_items;
ALTER TABLE order_items_v2 RENAME TO order_items;

CREATE INDEX idx_order_items_order ON order_items(order_id);

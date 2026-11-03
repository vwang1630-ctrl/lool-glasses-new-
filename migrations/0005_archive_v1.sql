-- v2 schema migration step 1/3: archive v1 tables.
-- Rationale: prod data is only test entries (alice/bob/test@example.com),
-- but rename instead of drop so we can rollback if needed. After v2 is
-- stable in prod, run 0008_drop_v1.sql to clean up.

ALTER TABLE products            RENAME TO products_v1;
ALTER TABLE product_colors      RENAME TO product_colors_v1;
ALTER TABLE lens_options        RENAME TO lens_options_v1;
ALTER TABLE prescriptions       RENAME TO prescriptions_v1;
ALTER TABLE orders              RENAME TO orders_v1;
ALTER TABLE order_items         RENAME TO order_items_v1;
ALTER TABLE shipments           RENAME TO shipments_v1;
ALTER TABLE shipment_events     RENAME TO shipment_events_v1;
ALTER TABLE order_otp           RENAME TO order_otp_v1;
ALTER TABLE admin_users         RENAME TO admin_users_v1;

-- 0081_country_product_discount.sql
-- Country-level product discount in shipping rules. Percent is stored as a
-- fraction: 0.10 means 10% off all products for that destination country.

ALTER TABLE shipping_rules ADD COLUMN country_discount_pct REAL NOT NULL DEFAULT 0;

ALTER TABLE orders ADD COLUMN country_discount_pct REAL;
ALTER TABLE orders ADD COLUMN country_discount_cents INTEGER NOT NULL DEFAULT 0;

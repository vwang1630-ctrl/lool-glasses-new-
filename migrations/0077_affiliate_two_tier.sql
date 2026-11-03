-- Two-tier affiliate model.
--
-- role='l1': manager account. Admin creates it and sets level 1..6.
-- role='l2': seller account. Belongs to one l1 via parent_affiliate_id.
--
-- Existing commission_pct is reused as the l2 commission pct.
-- manager_commission_pct is the parent l1's pct for this l2 relationship.
-- customer_discount_pct remains controlled by the l2 account.
--
-- Order rows snapshot the exact config and computed amounts so future config
-- changes never rewrite historical economics.

ALTER TABLE affiliates ADD COLUMN role TEXT NOT NULL DEFAULT 'l2';
ALTER TABLE affiliates ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE affiliates ADD COLUMN parent_affiliate_id TEXT REFERENCES affiliates(id);
ALTER TABLE affiliates ADD COLUMN manager_commission_pct REAL NOT NULL DEFAULT 0;

CREATE INDEX idx_affiliates_role ON affiliates(role, status);
CREATE INDEX idx_affiliates_parent ON affiliates(parent_affiliate_id, status);

ALTER TABLE orders ADD COLUMN affiliate_l1_id TEXT;
ALTER TABLE orders ADD COLUMN affiliate_l1_level INTEGER;
ALTER TABLE orders ADD COLUMN affiliate_total_pool_pct REAL;
ALTER TABLE orders ADD COLUMN affiliate_l1_pct REAL;
ALTER TABLE orders ADD COLUMN affiliate_l1_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN affiliate_l2_id TEXT;
ALTER TABLE orders ADD COLUMN affiliate_l2_pct REAL;
ALTER TABLE orders ADD COLUMN affiliate_l2_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN affiliate_customer_discount_base_cents INTEGER;
ALTER TABLE orders ADD COLUMN affiliate_commission_base_cents INTEGER;
ALTER TABLE orders ADD COLUMN affiliate_shipping_cost_cents INTEGER NOT NULL DEFAULT 0;

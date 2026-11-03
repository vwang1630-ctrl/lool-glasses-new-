-- Affiliate customer discount.
--
-- commission_pct is the platform-side allowance for the affiliate. The
-- affiliate may pass part of that allowance to the customer via
-- customer_discount_pct. New orders snapshot both the original subtotal and
-- the applied discount so payout math can use the original price while Stripe
-- charges the discounted price.

ALTER TABLE affiliates ADD COLUMN customer_discount_pct REAL NOT NULL DEFAULT 0;

ALTER TABLE orders ADD COLUMN original_subtotal_cents INTEGER;
ALTER TABLE orders ADD COLUMN affiliate_discount_pct REAL;
ALTER TABLE orders ADD COLUMN affiliate_discount_cents INTEGER NOT NULL DEFAULT 0;

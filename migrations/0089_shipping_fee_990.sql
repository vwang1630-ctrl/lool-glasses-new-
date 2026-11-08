-- 0089_shipping_fee_990.sql
-- Align the flat shipping fee with the published policy: orders under $69
-- pay $9.90 (was the 0078 seed default of $8.00). Only touches rules still on
-- the old seed value so any admin-customised country fee is preserved.

UPDATE shipping_rules
   SET shipping_cents = 990,
       updated_at = unixepoch() * 1000
 WHERE shipping_cents = 800;

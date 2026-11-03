-- 0079_lowercase_shipping_rules.sql
-- Store shipping rule country codes in lowercase ISO alpha-2 style.
-- `row` is the lowercase fallback pseudo-code.

UPDATE shipping_rules
   SET country_code = lower(country_code),
       updated_at = unixepoch() * 1000
 WHERE country_code <> lower(country_code);

INSERT OR IGNORE INTO shipping_rules (
  country_code, shipping_cents, free_shipping_threshold_cents, created_at, updated_at
) VALUES (
  'row', 800, 6900, unixepoch() * 1000, unixepoch() * 1000
);

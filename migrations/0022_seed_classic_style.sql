-- Give one of the existing 6 seed products the "classic" style so all 4
-- style buckets (minimal / business / character / classic) have ≥1 product.
-- Distribution after this migration: minimal=2, business=2, character=1, classic=1.
--
-- Note: products.style remains TEXT (no SQL CHECK). Strict 4-value enum is
-- enforced at the API layer (admin/products POST + PATCH) instead, since
-- SQLite ALTER cannot add CHECK to an existing column without a full table
-- rebuild — and that's heavyweight given the FK references from
-- product_colors / home_banners.

UPDATE products SET style = 'classic' WHERE slug = 'noir-rectangle';

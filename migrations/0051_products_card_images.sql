-- 0051_products_card_images.sql
--
-- Promote storefront card imagery from product_colors → products.
--
-- Rationale: the home page / product list "ProductCard" shows two images per
-- product — a 3/4 hero and a lifestyle/model-worn shot. Both are *product-level*
-- assets (one shoot per model, not per color). Previously the card cobbled them
-- together from `colors[0].images[1]`, which was implicit, hard to control, and
-- conceptually wrong.
--
-- New columns:
--   card_image_url        — front face on ProductCard (clean 3/4 hero)
--   card_hover_image_url  — back face on ProductCard hover (lifestyle / model-worn)
--
-- Both should be set for any product to appear on the storefront. Backfill
-- script (run after this migration) seeds them from colors[0]; admin can refine.
--
-- Companion change: product_colors.views_json drops the `hover` key. PDP
-- gallery + AR continue to use front/side/angle/folded only. Existing hover
-- values are kept in the row (harmless extra key) — the application reader
-- ignores them.

ALTER TABLE products ADD COLUMN card_image_url TEXT;
ALTER TABLE products ADD COLUMN card_hover_image_url TEXT;

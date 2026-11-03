-- Per-color image slots for the PDP gallery.
-- Conceptual model (consistent naming): every color has up to 5 images
--   hero / front / angle / side / folded
--
-- v1 only had `frame_png_url` (which was effectively the "front" view).
-- This migration:
--   1. Renames `frame_png_url` → `front_url` for naming consistency
--   2. Adds 4 sibling columns: `hero_url`, `angle_url`, `side_url`, `folded_url`
--   3. Backfills `hero_url` from `front_url` (so PDP doesn't break)
--   4. Backfills angle/side/folded for the 3 colors that have static
--      gallery images already (tortoise/gold/black) — these were previously
--      keyed by color.id in product.$slug.tsx via GALLERY_BY_VARIANT lookup.

ALTER TABLE product_colors RENAME COLUMN frame_png_url TO front_url;
ALTER TABLE product_colors ADD COLUMN hero_url   TEXT;
ALTER TABLE product_colors ADD COLUMN angle_url  TEXT;
ALTER TABLE product_colors ADD COLUMN side_url   TEXT;
ALTER TABLE product_colors ADD COLUMN folded_url TEXT;

UPDATE product_colors SET hero_url = front_url;

UPDATE product_colors
SET angle_url  = '/gallery/' || color_id || '-angle.jpg',
    side_url   = '/gallery/' || color_id || '-side.jpg',
    folded_url = '/gallery/' || color_id || '-folded.jpg'
WHERE color_id IN ('tortoise', 'gold', 'black');

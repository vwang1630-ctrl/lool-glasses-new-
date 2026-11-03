-- Add `color_family` to product_colors and `finish` to products.
--
-- color_family snaps the free-form `hex` to one of 12 canonical buckets
-- (src/lib/color-palette.ts). Filter swatches on the PLP read this column
-- so multiple products with similar blacks/whites/beiges dedupe to one
-- swatch. AI/admin write paths auto-derive the family server-side via
-- nearestColorFamily(hex) — manual override possible but not the norm.
--
-- finish captures the surface treatment (matte/gloss/satin/brushed). It's
-- product-level (not per-color) because lool products historically share
-- one finish across their color variants. Not filterable today; only shown
-- on PDP alongside material/shape. NULL means "unspecified" (legacy rows).
--
-- Both columns are nullable to keep the migration non-blocking; new rows
-- written via the admin/AI path will be populated.

ALTER TABLE products ADD COLUMN finish TEXT
  CHECK (finish IS NULL OR finish IN ('matte','gloss','satin','brushed'));

ALTER TABLE product_colors ADD COLUMN color_family TEXT
  CHECK (color_family IS NULL OR color_family IN (
    'black','tortoise','brown','beige','white','gray',
    'silver','gold','olive','forest','burgundy','clear'
  ));

-- Backfill color_family for every live hex value. Mapping computed via
-- nearestColorFamily (Lab Delta-E) against the 12-color palette. Archived
-- products are mapped too (best-effort; off-palette colors like navy/pink
-- on the Lovable demo seeds snap to the closest bucket).
UPDATE product_colors SET color_family = 'black'    WHERE hex IN ('#000000','#1a1a1a','#1d2a44','#1f1f1f');
UPDATE product_colors SET color_family = 'forest'   WHERE hex IN ('#397965','#4a5d3a');
UPDATE product_colors SET color_family = 'tortoise' WHERE hex IN ('#4a2818','#7a4a2a');
UPDATE product_colors SET color_family = 'olive'    WHERE hex IN ('#5a6b3a','#888b5b');
UPDATE product_colors SET color_family = 'burgundy' WHERE hex IN ('#5b1010','#6b1f2a');
UPDATE product_colors SET color_family = 'brown'    WHERE hex IN ('#83630c','#8c5a2b','#8e650b','#97582c');
UPDATE product_colors SET color_family = 'beige'    WHERE hex IN ('#95b087','#f0b9b0');
UPDATE product_colors SET color_family = 'gray'     WHERE hex IN ('#9a9a9a','#9aa0a6');
UPDATE product_colors SET color_family = 'silver'   WHERE hex IN ('#b3b2b2','#c6c6c6','#d1d1d1');
UPDATE product_colors SET color_family = 'gold'     WHERE hex IN ('#c9a96a');
UPDATE product_colors SET color_family = 'white'    WHERE hex IN ('#e7e5e0','#e8e8e8','#f4e0cd','#f5f3f2','#fbefe0','#ffffff');

-- Optional sanity: anything left unbucketed gets logged via this no-op.
-- If you ever see this query return >0 rows post-migration, extend the
-- UPDATE list above or expand the palette.
-- SELECT COUNT(*) FROM product_colors WHERE color_family IS NULL AND hex IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_colors_family ON product_colors(color_family);

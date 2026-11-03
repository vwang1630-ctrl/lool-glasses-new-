-- Promote the front-flat shot to the hero slot (images[0]) for the
-- TEA STRIPES color of lool-8663, demoting the 3/4 view to images[1].
-- Front-flat better matches the "frame fully visible, not bleeding off
-- the edges" requirement from the product spec.
UPDATE product_colors
SET images_json = '["/api/admin/r2/product/K1ZKkHDfJixPI3AMUovYg.jpg","/api/admin/r2/product/QoXNrkuvj5I1U6MeMineU.jpg"]'
WHERE product_id = (SELECT id FROM products WHERE slug = 'lool-8663')
  AND color_id = 'tea-stripes-8663';

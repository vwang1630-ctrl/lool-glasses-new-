-- Seed lool-8663 (Classic Boston Oval Frame Eyewear) — 6 colors, 19 images.
-- All 19 source frames uploaded to lool-work-products R2 under product/<nanoid>.jpg.
-- Each color gets its confirmed 3/4 hero shot; remaining 13 images (design
-- sheet + miscellaneous angles for C1/C3/C6 that couldn't be cleanly assigned
-- by visual inspection alone) are staged on the BLACK color so they show up
-- in the admin ColorImagesEditor for manual drag-redistribute.

INSERT INTO products (
  id, slug, product_kind, shape, material,
  lens_width_mm, bridge_mm, temple_mm, frame_width_mm, lens_height_mm,
  genders_json, price_cents, original_price_cents, currency,
  rating, review_count, is_new, bestseller,
  supports_reader, supports_single_vision, supports_non_prescription, supports_progressive,
  name_json, categories_json, styles_json
) VALUES (
  's7SilXJaoi8J6zAtb2bLX', 'lool-8663', 'eyeglasses', 'Oval', 'acetate',
  47, 24, 150, 142, 46,
  '["unisex"]', 2600, 2800, 'USD',
  5.0, 0, 1, 0,
  1, 1, 1, 0,
  '{"en": "Classic Boston Oval Frame Eyewear", "zh": "经典波士顿椭圆框眼镜"}', '["myopia", "presbyopia"]', '["classic"]'
);

INSERT INTO product_colors (
  id, product_id, color_id, hex, sort_order, label_json, images_json
) VALUES (
  'GKjblmxb218CvZNMWMs99', 's7SilXJaoi8J6zAtb2bLX', 'black-8663', '#1a1a1a',
  0, '{"en": "Black", "zh": "亮黑框"}', '["/api/admin/r2/product/JxSqme9fOvlspPYXyG0si.jpg", "/api/admin/r2/product/t4pcTmciSSwLSeQSXmljA.jpg", "/api/admin/r2/product/4I1greYvANq8HjSkfeCqp.jpg", "/api/admin/r2/product/g2TK1cshrzzq7dtNp8YdR.jpg", "/api/admin/r2/product/7kpJHlqZ6MPK6tieV6uwx.jpg", "/api/admin/r2/product/coNUjqF1rzinqu0EnCo9M.jpg", "/api/admin/r2/product/Pq61t2qlokakH0YXW5rBa.jpg", "/api/admin/r2/product/raVkU2dliCMpOcHtZqLkZ.jpg", "/api/admin/r2/product/4AFO7abWX72fSBvEr7Qe9.jpg", "/api/admin/r2/product/kNdboiO3AmJwrjjPwJQJk.jpg", "/api/admin/r2/product/fld66AZdsGA9UzBMxRJJQ.jpg", "/api/admin/r2/product/GIRYhc9Auhmq57pnJ9bDq.jpg", "/api/admin/r2/product/yiCW0zRjmk2a8CadW6lE3.jpg", "/api/admin/r2/product/o9zzB2Ehzm5vMLUixydLd.jpg"]'
);

INSERT INTO product_colors (
  id, product_id, color_id, hex, sort_order, label_json, images_json
) VALUES (
  'BaGQ65fL07CgDKlQSkWuz', 's7SilXJaoi8J6zAtb2bLX', 'gray-8663', '#9a9a9a',
  1, '{"en": "Gray", "zh": "透灰框"}', '["/api/admin/r2/product/IkMAJYDyWz7fVaNoZaHXz.jpg"]'
);

INSERT INTO product_colors (
  id, product_id, color_id, hex, sort_order, label_json, images_json
) VALUES (
  'qr6sywGDRO2o5PEHerGel', 's7SilXJaoi8J6zAtb2bLX', 'transparent-8663', '#e8e8e8',
  2, '{"en": "Transparent", "zh": "透明框"}', '["/api/admin/r2/product/sSMloPnjA0WkVOpjmePLz.jpg"]'
);

INSERT INTO product_colors (
  id, product_id, color_id, hex, sort_order, label_json, images_json
) VALUES (
  'OT9Qm0u4gJL51BKP92xcZ', 's7SilXJaoi8J6zAtb2bLX', 'hawksbill-8663', '#7a4a2a',
  3, '{"en": "Hawksbill", "zh": "玳瑁框"}', '["/api/admin/r2/product/3KIdeYmYnoL7yghUbdXK9.jpg"]'
);

INSERT INTO product_colors (
  id, product_id, color_id, hex, sort_order, label_json, images_json
) VALUES (
  'qCKcKUz6Y3bSIqkv1H1YV', 's7SilXJaoi8J6zAtb2bLX', 'tea-stripes-8663', '#4a2818',
  4, '{"en": "Tea Stripes", "zh": "茶条纹框"}', '["/api/admin/r2/product/QoXNrkuvj5I1U6MeMineU.jpg"]'
);

INSERT INTO product_colors (
  id, product_id, color_id, hex, sort_order, label_json, images_json
) VALUES (
  'x3f7b23As3yRHLFPgzubt', 's7SilXJaoi8J6zAtb2bLX', 'green-8663', '#5a6b3a',
  5, '{"en": "Green", "zh": "透绿框"}', '["/api/admin/r2/product/avKBHWIV4xQ8HmFySyrLt.jpg"]'
);

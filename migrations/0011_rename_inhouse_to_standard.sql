-- Rename the in-house brand display name to "Standard" / "白片".
-- The internal brand_id stays 'inhouse' (24 lens_skus FK to it).
-- Display name is what users see in the wizard's LENS BRAND selector.

UPDATE lens_brands
SET name_zh = '白片',
    name_en = 'Standard',
    description_zh = '基础透明镜片，日常通用',
    description_en = 'Reliable everyday clarity at a great value.'
WHERE id = 'inhouse';

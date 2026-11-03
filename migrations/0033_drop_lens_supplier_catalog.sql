-- Drop the supply-chain mirror tables. They were a one-time import of
-- 明月 2025 标批价格表 (xlsx in DTCS root) that never got wired into any
-- runtime path. The supply-chain model is being redesigned around a
-- simpler `lens_supplier_skus` join table; the catalog mirror + the
-- (sales SKU ↔ catalog SKU) mapping are no longer needed. The xlsx
-- source still exists locally so this is recoverable.

DROP TABLE IF EXISTS lens_option_supplier_mapping;
DROP TABLE IF EXISTS lens_supplier_catalog;

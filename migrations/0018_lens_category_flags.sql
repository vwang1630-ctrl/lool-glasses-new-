-- Lens primary category flags on products. A product can be paired with one,
-- two, or all three lens categories at checkout. This replaces the unused
-- product_lens_overrides table (which was never read/written by app code).
--
-- 一级分类：
--   supports_reader            老花/阅读用镜片（reader）
--   supports_single_vision     单光镜片：近视、远视、阅读距离 (single-vision)
--   supports_non_prescription  无度数 / 平光（non-prescription）
--
-- 默认全部为 1（兼容三种）。Admin 可针对个别 frame 关掉某一种。

DROP TABLE IF EXISTS product_lens_overrides;

ALTER TABLE products ADD COLUMN supports_reader            INTEGER NOT NULL DEFAULT 1 CHECK (supports_reader IN (0,1));
ALTER TABLE products ADD COLUMN supports_single_vision     INTEGER NOT NULL DEFAULT 1 CHECK (supports_single_vision IN (0,1));
ALTER TABLE products ADD COLUMN supports_non_prescription  INTEGER NOT NULL DEFAULT 1 CHECK (supports_non_prescription IN (0,1));

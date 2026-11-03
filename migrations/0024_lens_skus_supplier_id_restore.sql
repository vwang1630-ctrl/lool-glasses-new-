-- Restore supplier_id on lens_skus, lost during the 0023 table rebuild.
-- Migration 0023 forgot that 0012 had ADD COLUMN supplier_id; the rebuilt
-- lens_skus_v2 dropped it. This migration re-adds the column and re-applies
-- the brand→supplier backfill rules originally in migration 0013.

ALTER TABLE lens_skus ADD COLUMN supplier_id TEXT REFERENCES suppliers(id);

UPDATE lens_skus SET supplier_id = 'mingyue'       WHERE brand_id IN ('inhouse', 'mingyue');
UPDATE lens_skus SET supplier_id = 'zeiss-china'   WHERE brand_id = 'zeiss';
UPDATE lens_skus SET supplier_id = 'essilor-china' WHERE brand_id IN ('essilor', 'transitions');

CREATE INDEX idx_lens_skus_supplier_id ON lens_skus(supplier_id, active);

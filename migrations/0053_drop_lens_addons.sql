-- Drop the entire lens addons concept. The five seeded rows were never real
-- products — Lovable design-spec placeholders for a "lens coatings" step the
-- wizard no longer needs. With 0 orders on prod (verified before this
-- migration shipped), no historical data is being abandoned.
--
-- If we ever add billable lens upgrades back, do it as a fresh design:
-- single-select, per-SKU compatibility list, named "extras" not "coatings".
-- That design will likely need a different table shape than this one, so
-- nothing here is worth preserving as a stub.

DROP TABLE IF EXISTS lens_addons;

ALTER TABLE order_items DROP COLUMN addons_json;
ALTER TABLE order_items DROP COLUMN unit_addons_cents;

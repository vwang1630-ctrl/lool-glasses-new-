-- Deactivate the 5 seeded "lens coating" addons (anti-reflective, anti-scratch,
-- hydrophobic, anti-fog, blue-light-coating). They were Lovable design-spec
-- placeholders that don't reflect any product we actually sell, and we don't
-- want them showing in the wizard's coatings step.
--
-- Future redesign (per owner request) is more substantial than re-enabling
-- these rows: single-select instead of multi-select, per-SKU compatibility list
-- on lens_skus, renamed concept from "coatings" to "extras / paid upgrades".
-- When that work lands it will likely seed fresh rows rather than reuse these.
--
-- We deactivate (active=0) instead of DELETE so historic addon references in
-- orders / audit logs keep their human-readable label.
UPDATE lens_addons
SET active = 0
WHERE active = 1 AND kind = 'coating';

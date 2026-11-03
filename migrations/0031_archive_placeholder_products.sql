-- Tidy up products surfaced in the PLP that are not actually finished.
-- Discovered during the data-hygiene sweep:
--   - test-001 / "test-001" / $0 / 0 colors / no categories — leftover from
--     QA, currently visible on /products at $0 with a 0-color PDP.
--   - new-glasses-001 / "New Glass" / 0 colors / no categories — half-built
--     placeholder; PLP shows the card but PDP has no colors to render.
--   - lool-0001 / "LOOL THE ORB VINTAGE READERS" — real product, 6 colors,
--     but categories_json was never set. The name says "READERS", so it
--     belongs in the presbyopia bucket; without it the frame never shows
--     under Reading menu / /presbyopia.
--
-- Both placeholders soft-archived (archived_at = now). lool-0001 gets the
-- correct categories_json and supports_reader=1 so it shows up in the
-- Reading mega-menu and PLP.

UPDATE products
SET archived_at = unixepoch() * 1000, updated_at = unixepoch() * 1000
WHERE slug IN ('test-001', 'new-glasses-001') AND archived_at IS NULL;

UPDATE products
SET categories_json = json_array('presbyopia'),
    supports_reader = 1,
    updated_at = unixepoch() * 1000
WHERE slug = 'lool-0001'
  AND (categories_json IS NULL OR categories_json = '' OR categories_json = '[]');

-- PDP route 开窗 (WO-20261008-01): per-product SEO overrides + 14-section
-- content story, keyed by language (`{"en": {...}, "zh": {...}}`).
-- Each section is optional; the PDP route renders only sections present and
-- falls back to the static UI for anything missing. Stored as a single TEXT
-- JSON column so content production can push a whole section set atomically.
ALTER TABLE products ADD COLUMN content_json TEXT;

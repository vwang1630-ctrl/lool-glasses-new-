-- Consult attribution tracking (SYSTEM-KIT L3/L4 wiring)
-- Captures user-initiated consult signals (WhatsApp click, form submit, etc.)
-- so the operator system can answer "where did this inquiry come from?".
-- The attribution token from src/system-modules/attribution.ts is stored in note.
CREATE TABLE consult_events (
  id           TEXT PRIMARY KEY,
  action       TEXT NOT NULL,        -- whatsapp_click | consult_submit | ...
  surface      TEXT NOT NULL,        -- button name / component id
  page_path    TEXT,
  product_slug TEXT,
  locale       TEXT,
  note         TEXT,                 -- compact attribution token + optional context
  created_at   INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_consult_events_created_at ON consult_events(created_at);
CREATE INDEX idx_consult_events_action ON consult_events(action);

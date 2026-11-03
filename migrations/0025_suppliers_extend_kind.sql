-- Suppliers: extend `kind` CHECK to include payment + logistics providers,
-- and add a generic `config_json` field for provider-specific metadata.
--
-- D1 enforces FK references — products.supplier_id and lens_skus.supplier_id
-- both REFERENCE suppliers(id). The standard SQLite rebuild pattern
-- (CREATE new + INSERT + DROP old + RENAME new) fails on D1 because DROP
-- TABLE on the FK target is rejected.
--
-- Workaround: build the new table under a temp name, copy data, swap names
-- via two RENAMEs (FK references continue resolving by NAME, so no break),
-- then drop the temporarily-renamed old table. The drop may be rejected by
-- D1 if FK paranoia kicks in — that's acceptable, the orphan is harmless.

-- 1. Build new schema under a temp name.
CREATE TABLE suppliers_v2 (
  id              TEXT PRIMARY KEY,
  name_zh         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN
                    ('lens','frame','both','accessory','payment','logistics')),

  -- Generic key-value metadata blob (provider-specific).
  -- Examples:
  --   payment:    {"provider":"airwallex","account_id":"acct_xxx","currencies":["USD","CNY"]}
  --   logistics:  {"carrier":"DHL","tracking_url":"https://www.dhl.com/track?id={tracking_number}"}
  --   lens/frame: usually NULL — the existing columns cover lens/frame needs
  config_json     TEXT,

  contact_person   TEXT,
  contact_email    TEXT,
  contact_phone    TEXT,
  shipping_address TEXT,

  payment_terms   TEXT,
  lead_time_days  INTEGER,
  notes           TEXT,

  active          INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- 2. Copy data.
INSERT INTO suppliers_v2 (
  id, name_zh, name_en, kind, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order,
  created_at, updated_at
)
SELECT
  id, name_zh, name_en, kind, contact_person, contact_email, contact_phone,
  shipping_address, payment_terms, lead_time_days, notes, active, sort_order,
  created_at, updated_at
FROM suppliers;

-- 3. Swap names. RENAME doesn't break FK references in D1 — they resolve at
--    query time by name, and after both renames complete, "suppliers" still
--    exists pointing to the new schema.
ALTER TABLE suppliers RENAME TO suppliers_old_v1;
ALTER TABLE suppliers_v2 RENAME TO suppliers;

-- 4. Best-effort drop of the orphan. D1 may reject this with an FK error;
--    if so, the suppliers_old_v1 table is left as a harmless 5-row stub.
--    A separate cleanup migration can drop it later once D1 permits.
DROP TABLE IF EXISTS suppliers_old_v1;

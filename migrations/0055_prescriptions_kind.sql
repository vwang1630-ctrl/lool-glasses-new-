-- Three saved prescriptions per user: single / reading / progressive.
-- Each kind UPSERTs into a single row keyed by (email, kind), so the
-- account page always renders three slots (filled or empty) rather than
-- piling up an unbounded history with ADD smeared across single rows.

ALTER TABLE prescriptions
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'single'
  CHECK (kind IN ('single', 'reading', 'progressive'));

-- Backfill existing rows. Anything with ADD set (or a 'readers' source)
-- becomes 'reading'; the rest stays 'single'. Progressive can't be
-- inferred from the data, so progressive prescriptions land in 'reading'
-- until the user re-saves through the wizard.
UPDATE prescriptions
  SET kind = 'reading'
  WHERE source = 'readers'
     OR add_od IS NOT NULL
     OR add_os IS NOT NULL;

-- Per the UPSERT contract, (email, kind) must be unique. Existing rows
-- might collide (e.g. user saved 'single' twice manually) — keep the
-- newest per (email, kind), drop the rest.
DELETE FROM prescriptions
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY email, kind
        ORDER BY created_at DESC, id DESC
      ) AS rn
      FROM prescriptions
    )
    WHERE rn = 1
  );

CREATE UNIQUE INDEX prescriptions_email_kind_uniq
  ON prescriptions(email, kind);

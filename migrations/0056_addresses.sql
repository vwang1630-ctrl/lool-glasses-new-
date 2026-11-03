-- One-to-many addresses per customer, keyed by email (same identity model as
-- prescriptions / orders — there is no users table). Each row is an editable
-- shipping address; at most one row per email may carry is_default = 1.
--
-- Field names mirror the ship_* columns on `orders` so checkout can shuttle
-- a saved address straight into the order snapshot without renaming.

CREATE TABLE addresses (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  recipient   TEXT NOT NULL,
  country     TEXT NOT NULL,
  zip         TEXT NOT NULL,
  address     TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  is_default  INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Listing query orders by recency.
CREATE INDEX idx_addresses_email ON addresses(email, updated_at DESC);

-- At most one default per email. Partial unique index leaves non-default rows
-- unconstrained while keeping `is_default = 1` exclusive within an email.
CREATE UNIQUE INDEX addresses_email_default_uniq
  ON addresses(email) WHERE is_default = 1;

-- Backfill from historical orders so signed-in returning customers see their
-- prior addresses populated. Dedupe per email by the case-insensitive composite
-- (recipient | country | zip | address); keep at most 10 most-recent per email;
-- newest per email becomes the default.
INSERT INTO addresses
  (id, email, recipient, country, zip, address, phone, is_default, created_at, updated_at)
WITH deduped AS (
  SELECT
    email,
    ship_recipient AS recipient,
    ship_country   AS country,
    ship_zip       AS zip,
    ship_address   AS address,
    ship_phone     AS phone,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY email,
                   lower(ship_recipient), lower(ship_country),
                   lower(ship_zip), lower(ship_address)
      ORDER BY created_at DESC
    ) AS dup_rn
  FROM orders
  WHERE ship_recipient IS NOT NULL
    AND ship_address IS NOT NULL
),
ranked AS (
  SELECT
    email, recipient, country, zip, address, phone, created_at,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS recency_rn
  FROM deduped
  WHERE dup_rn = 1
)
SELECT
  lower(hex(randomblob(8))),
  email, recipient, country, zip, address,
  COALESCE(phone, ''),
  CASE WHEN recency_rn = 1 THEN 1 ELSE 0 END,
  created_at,
  created_at
FROM ranked
WHERE recency_rn <= 10;

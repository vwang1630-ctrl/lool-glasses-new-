-- Switch admin + maker auth to email-OTP only and rename maker_users.username
-- to email so the field name matches its semantics.
--
-- admin_users: drop password_hash. D1's SQLite supports ALTER TABLE DROP COLUMN
-- as of 3.35, so this is a single statement, no FK risk.
--
-- maker_users: full rebuild because we both rename a column AND drop a column.
-- Uses the DROP-then-RENAME pattern per [[sqlite-table-rebuild-gotchas]] —
-- no other table has an FK referencing maker_users (orders.maker_id is plain
-- TEXT without REFERENCES), so the swap is safe.

ALTER TABLE admin_users DROP COLUMN password_hash;

CREATE TABLE maker_users_v2 (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  last_login_at INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

INSERT INTO maker_users_v2 (
  id, email, name, active, last_login_at, created_at, updated_at
)
SELECT
  id, username, name, active, last_login_at, created_at, updated_at
FROM maker_users;

DROP TABLE maker_users;
ALTER TABLE maker_users_v2 RENAME TO maker_users;

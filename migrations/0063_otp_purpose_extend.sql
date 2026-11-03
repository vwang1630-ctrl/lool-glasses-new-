-- Extend order_otp.purpose CHECK to include the auth purposes.
--
-- The table was created in 0001 / 0006 with CHECK (purpose IN
-- ('lookup_order','lookup_rx')), then otp.ts grew an 'admin_login' purpose
-- without a matching schema migration — so the admin OTP INSERT has been
-- failing silently (wrapped in try/catch + console.error) and admins
-- haven't been able to receive login codes via that path. 0062 added
-- 'maker_login' on top, same silent failure.
--
-- Standard rebuild + DROP-then-RENAME per [[sqlite-table-rebuild-gotchas]].
-- No other table has an FK referencing order_otp, so the swap is safe.

CREATE TABLE order_otp_v2 (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('lookup_order','lookup_rx','admin_login','maker_login')),
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

INSERT INTO order_otp_v2 (id, email, code_hash, purpose, expires_at, used_at, attempts, created_at)
SELECT id, email, code_hash, purpose, expires_at, used_at, attempts, created_at FROM order_otp;

DROP TABLE order_otp;
ALTER TABLE order_otp_v2 RENAME TO order_otp;

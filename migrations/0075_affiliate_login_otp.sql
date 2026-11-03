-- Extend OTP purposes for the standalone affiliate portal login.

CREATE TABLE order_otp_v4 (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('lookup_order','lookup_rx','admin_login','tracker_login','affiliate_login')),
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);

INSERT INTO order_otp_v4 (id, email, code_hash, purpose, expires_at, used_at, attempts, created_at)
SELECT id, email, code_hash, purpose, expires_at, used_at, attempts, created_at FROM order_otp;

DROP TABLE order_otp;
ALTER TABLE order_otp_v4 RENAME TO order_otp;
CREATE INDEX idx_otp_email_expires ON order_otp(email, expires_at);

-- Unify the "订单跟踪 / Order Tracker" concept across DB / API / UI.
-- Renames every maker-named DB object to tracker, plus updates the OTP purpose
-- and audit_log resource_type rows so historical entries don't keep the old
-- name (per "概念命名一致 / 数据库整洁" in CLAUDE.md).

-- 1. Table rename: maker_users → tracker_users.
ALTER TABLE maker_users RENAME TO tracker_users;

-- 2. orders.maker_id / maker_assigned_at → tracker_id / tracker_assigned_at.
ALTER TABLE orders RENAME COLUMN maker_id TO tracker_id;
ALTER TABLE orders RENAME COLUMN maker_assigned_at TO tracker_assigned_at;

-- 3. Rebuild order_otp to swap the CHECK constraint
-- ('maker_login' → 'tracker_login') and migrate any existing rows in the
-- SAME INSERT (via CASE) — separate UPDATE wouldn't work because the
-- existing CHECK forbids the new value, and the new CHECK forbids the old
-- value. Doing it inline sidesteps both. DROP-then-RENAME per
-- [[sqlite-table-rebuild-gotchas]]; no FK references this table.
CREATE TABLE order_otp_v3 (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('lookup_order','lookup_rx','admin_login','tracker_login')),
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

INSERT INTO order_otp_v3 (id, email, code_hash, purpose, expires_at, used_at, attempts, created_at)
SELECT
  id,
  email,
  code_hash,
  CASE WHEN purpose = 'maker_login' THEN 'tracker_login' ELSE purpose END,
  expires_at,
  used_at,
  attempts,
  created_at
FROM order_otp;

DROP TABLE order_otp;
ALTER TABLE order_otp_v3 RENAME TO order_otp;

-- 4. Historical admin_audit_log rows already written with the old
-- resource_type. Update so the admin audit log UI shows the unified name.
UPDATE admin_audit_log SET resource_type = 'tracker_users' WHERE resource_type = 'maker_users';

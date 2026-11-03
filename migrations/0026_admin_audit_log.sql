-- 0026_admin_audit_log.sql
-- Audit log for admin write operations. Records who changed what, when, and how.
-- Inserted from src/server/audit.ts on every PATCH/POST/DELETE handler that opts in.

CREATE TABLE admin_audit_log (
  id              TEXT PRIMARY KEY,
  admin_id        TEXT NOT NULL,                                 -- logical FK to admin_users.id (no constraint to retain logs after admin deletion)
  admin_email     TEXT NOT NULL,                                 -- denormalized snapshot
  action          TEXT NOT NULL,                                 -- 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  resource_type   TEXT NOT NULL,                                 -- 'orders' | 'products' | 'lens_skus' | ...
  resource_id     TEXT,                                          -- nullable (bulk ops)
  path            TEXT NOT NULL,                                 -- request URL path + query
  before_json     TEXT,                                          -- snapshot before mutation (PATCH/DELETE)
  after_json      TEXT,                                          -- snapshot after mutation (POST/PATCH)
  meta_json       TEXT,                                          -- error info, query params, status
  created_at      INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_audit_log_admin     ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_audit_log_resource  ON admin_audit_log(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_log_recent    ON admin_audit_log(created_at DESC);

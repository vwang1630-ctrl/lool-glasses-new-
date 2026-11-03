-- 0083_audit_log_r2_index.sql
-- Cross-scope audit index. Full audit payloads live in R2 under r2_key.

CREATE TABLE audit_log_index (
  id              TEXT PRIMARY KEY,
  scope           TEXT NOT NULL, -- admin | affiliate | tracker | customer
  actor_type      TEXT NOT NULL, -- admin | affiliate | tracker | customer | anonymous
  actor_id        TEXT,
  actor_email     TEXT,
  client_id       TEXT,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,
  path            TEXT NOT NULL,
  r2_key          TEXT,
  summary_json    TEXT,
  created_at      INTEGER NOT NULL
);

CREATE INDEX idx_audit_index_scope_recent
  ON audit_log_index(scope, created_at DESC);
CREATE INDEX idx_audit_index_actor
  ON audit_log_index(scope, actor_id, created_at DESC);
CREATE INDEX idx_audit_index_email
  ON audit_log_index(scope, actor_email, created_at DESC);
CREATE INDEX idx_audit_index_client
  ON audit_log_index(client_id, created_at DESC);
CREATE INDEX idx_audit_index_resource
  ON audit_log_index(scope, resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_index_recent
  ON audit_log_index(created_at DESC);

CREATE TABLE customer_identity_links (
  client_id       TEXT NOT NULL,
  email           TEXT NOT NULL,
  first_seen_at   INTEGER NOT NULL,
  last_seen_at    INTEGER NOT NULL,
  login_count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (client_id, email)
);

CREATE INDEX idx_customer_identity_email
  ON customer_identity_links(email, last_seen_at DESC);
CREATE INDEX idx_customer_identity_client
  ON customer_identity_links(client_id, last_seen_at DESC);

INSERT INTO audit_log_index (
  id, scope, actor_type, actor_id, actor_email, client_id, action,
  resource_type, resource_id, path, r2_key, summary_json, created_at
)
SELECT
  id, 'admin', 'admin', admin_id, admin_email, NULL, action,
  resource_type, resource_id, path, NULL,
  json_object(
    'legacyD1', 1,
    'before', before_json IS NOT NULL,
    'after', after_json IS NOT NULL,
    'meta', meta_json IS NOT NULL
  ),
  created_at
FROM admin_audit_log;

-- 0027_admin_api_tokens.sql
-- Long-lived API tokens for admin endpoints. Used by MCP server (and any
-- scripted client) to authenticate without the browser's session cookie.
-- Tokens are stored SHA-256-hashed; the plaintext is only returned to the
-- admin once at creation time.
--
-- Usage: include `Authorization: Bearer lool_<plaintext>` on any /api/admin/*
-- request. Server hashes and looks up here.

CREATE TABLE admin_api_tokens (
  id             TEXT PRIMARY KEY,
  admin_user_id  TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash     TEXT NOT NULL UNIQUE,            -- sha256(plaintext) hex
  name           TEXT NOT NULL,                   -- human label, e.g. 'MCP on lucas-mbp'
  created_at     INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  last_used_at   INTEGER,
  revoked_at     INTEGER
);

CREATE INDEX idx_admin_api_tokens_user ON admin_api_tokens(admin_user_id);
CREATE INDEX idx_admin_api_tokens_hash ON admin_api_tokens(token_hash);

-- 0075_admin_api_token_scope.sql
-- Add coarse API token scopes so LoolOS / readonly MCP can authenticate without
-- write access to lool.work admin APIs. Existing tokens keep full write scope.

ALTER TABLE admin_api_tokens ADD COLUMN scope TEXT NOT NULL DEFAULT 'write';

CREATE INDEX IF NOT EXISTS idx_admin_api_tokens_scope ON admin_api_tokens(scope);

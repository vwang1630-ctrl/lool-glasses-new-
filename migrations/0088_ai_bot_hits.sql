-- AI crawler hit ledger (SYSTEM-KIT L6 GEO sampling)
-- Fire-and-forget record of known AI bot user-agents hitting the site.
-- Budget: ~200 rows/hour; prune older than 90 days via cron or manual sweep.
CREATE TABLE ai_bot_hits (
  id          TEXT PRIMARY KEY,
  bot_family  TEXT NOT NULL,        -- chatgpt | perplexity | gemini | claude | copilot | ...
  ua_snippet  TEXT,                 -- normalized user-agent substring
  path        TEXT NOT NULL,
  ip_hash     TEXT,                 -- hex hash of visitor IP, not raw IP
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_ai_bot_hits_created_at ON ai_bot_hits(created_at);
CREATE INDEX idx_ai_bot_hits_family ON ai_bot_hits(bot_family);

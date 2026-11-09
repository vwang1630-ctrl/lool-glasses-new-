-- Footer newsletter sign-ups (previously only showed a toast and stored nothing).
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  locale TEXT,
  source TEXT,
  page_path TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed', -- subscribed | unsubscribed
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created ON newsletter_subscribers (created_at);

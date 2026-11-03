// D1 binding access helper for TanStack Start server routes / functions
// running on Cloudflare Workers. The binding is declared in wrangler.jsonc
// (`d1_databases[0].binding = "DB"`) and exposed via `cloudflare:workers`.

import { env } from "cloudflare:workers";

export function getDB(): D1Database {
  if (!env.DB) {
    throw new Error(
      "D1 binding 'DB' not available. Check wrangler.jsonc and re-run `wrangler types`.",
    );
  }
  return env.DB;
}

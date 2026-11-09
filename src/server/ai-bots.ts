// AI / search crawler detection + logging into ai_bot_hits (migration 0088).
// Called from src/server.ts for every request; writes happen via waitUntil so
// the response is never delayed, and failures are swallowed.

import { waitUntil } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { nanoid, sha256Hex } from "@/server/ids";

// Order matters: first match wins (user-triggered agents before generic bots).
const BOTS: { family: string; re: RegExp }[] = [
  { family: "chatgpt", re: /GPTBot|ChatGPT-User|OAI-SearchBot/i },
  {
    family: "claude",
    re: /ClaudeBot|Claude-User|Claude-SearchBot|Claude-Web|anthropic-ai/i,
  },
  { family: "perplexity", re: /PerplexityBot|Perplexity-User/i },
  { family: "gemini", re: /Google-CloudVertexBot|GoogleOther|Gemini/i },
  { family: "copilot-bing", re: /bingbot|BingPreview/i },
  { family: "google-search", re: /Googlebot|Google-InspectionTool/i },
  { family: "apple", re: /Applebot/i },
  {
    family: "meta",
    re: /meta-externalagent|meta-externalfetcher|FacebookBot|facebookexternalhit/i,
  },
  { family: "bytedance", re: /Bytespider/i },
  { family: "commoncrawl", re: /CCBot/i },
  { family: "duckduckgo", re: /DuckAssistBot|DuckDuckBot/i },
  { family: "mistral", re: /MistralAI-User/i },
  { family: "amazon", re: /Amazonbot/i },
  { family: "you", re: /YouBot/i },
];

// Static assets and APIs aren't interesting — we want which *pages* get read.
const SKIP_PATH_RE =
  /^\/(?:assets|images|api|_serverFn|_build)\/|\.(?:js|css|map|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|glb|wasm|task|json)$/i;

export function detectAiBot(ua: string | null): string | null {
  if (!ua) return null;
  for (const b of BOTS) if (b.re.test(ua)) return b.family;
  return null;
}

/** Fire-and-forget: log a crawler hit if the UA is a known AI/search bot. */
export function maybeLogBotHit(request: Request, pathname: string): void {
  if (request.method !== "GET" && request.method !== "HEAD") return;
  if (SKIP_PATH_RE.test(pathname)) return;
  const ua = request.headers.get("user-agent");
  const family = detectAiBot(ua);
  if (!family) return;
  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const task = (async () => {
    try {
      const ipHash = ip ? (await sha256Hex(`bot:${ip}`)).slice(0, 16) : null;
      await getDB()
        .prepare(
          `INSERT INTO ai_bot_hits (id, bot_family, ua_snippet, path, ip_hash, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          nanoid(),
          family,
          (ua ?? "").slice(0, 160),
          pathname.slice(0, 256),
          ipHash,
          Date.now(),
        )
        .run();
    } catch (err) {
      console.error("[ai-bots] log failed:", err);
    }
  })();
  try {
    waitUntil(task);
  } catch {
    // Outside a request context (shouldn't happen) — let it run unawaited.
  }
}

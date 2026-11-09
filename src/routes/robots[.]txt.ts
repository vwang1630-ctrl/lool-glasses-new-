// GET /robots.txt
// Served via Worker route (NOT as static asset) so we bypass Cloudflare's
// "Managed Content" auto-injection that disallows AI bots by default.
// To explicitly allow GPTBot / ClaudeBot / PerplexityBot / etc., we must
// own the response.
//
// Filename uses TanStack's [.] escape so the literal "." in the URL works.

import { createFileRoute } from "@tanstack/react-router";

const BODY = `# loollook.com robots.txt
# Last updated: 2026-04-28

# Default: allow all crawlers, block admin & admin APIs
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /tracker

# ─────────────────────────────────────────────────────────────
# AI search engines — explicitly allowed.
# Updated list per OpenAI / Anthropic / Perplexity / Google docs.
# ─────────────────────────────────────────────────────────────

# OpenAI / ChatGPT
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic / Claude
User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# Google Gemini / AI Overview (separate from Googlebot)
User-agent: Google-Extended
Allow: /

# Apple Intelligence
User-agent: Applebot-Extended
Allow: /

# Common Crawl (used by many LLM training pipelines)
User-agent: CCBot
Allow: /

# Meta / Facebook AI
User-agent: FacebookBot
Allow: /

User-agent: meta-externalagent
Allow: /

# ByteDance / TikTok
User-agent: Bytespider
Allow: /

# Sitemap
Sitemap: https://loollook.com/sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(BODY, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});

// Custom server entry (TanStack Start picks up src/server.ts automatically).
// Wraps the default handler to:
//   • 301 http:// and www. requests to https://loollook.com (same path/query)
//   • add baseline security headers to every Worker response
//   • mark private / transactional pages noindex
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { maybeLogBotHit } from "@/server/ai-bots";

const APEX = "loollook.com";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "frame-ancestors 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Camera is used by /try-on and /measure-pd on our own origin only.
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
};

// Account, cart, checkout and staff tools have no search value.
const NOINDEX_RE =
  /^\/(?:admin|tracker)(?:\/|$)|^\/[a-z]{2}\/(?:account|cart|checkout|favorites|aff)(?:\/|$)/;

export default createServerEntry({
  async fetch(request, ...rest) {
    const url = new URL(request.url);
    const host = url.hostname;
    if (host === APEX || host === `www.${APEX}`) {
      if (url.protocol === "http:" || host !== APEX) {
        url.protocol = "https:";
        url.hostname = APEX;
        url.port = "";
        return new Response(null, {
          status: 301,
          headers: { Location: url.toString(), ...SECURITY_HEADERS },
        });
      }
    }

    // GEO measurement: log AI / search crawler page reads (async, non-blocking).
    maybeLogBotHit(request, url.pathname);

    const res = await handler.fetch(request, ...rest);
    // Upgrade / streaming-special responses are passed through untouched.
    if (res.status === 101) return res;
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(k)) headers.set(k, v);
    }
    if (NOINDEX_RE.test(url.pathname) && !headers.has("X-Robots-Tag")) {
      headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
});

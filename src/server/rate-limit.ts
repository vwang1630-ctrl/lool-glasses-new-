// Best-effort per-key rate limiter on the Workers Cache API (per data centre,
// not globally exact — good enough to stop one client from flooding a public
// write endpoint). Fails open when the Cache API is unavailable (local dev).

export async function rateLimited(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const cache = (caches as unknown as { default: Cache }).default;
    const slot = Math.floor(Date.now() / 1000 / windowSeconds);
    const req = new Request(
      `https://rate-limit.internal/${bucket}/${encodeURIComponent(key)}/${slot}`,
    );
    const hit = await cache.match(req);
    const n = hit ? Number(await hit.text()) || 0 : 0;
    if (n >= limit) return true;
    await cache.put(
      req,
      new Response(String(n + 1), {
        headers: { "Cache-Control": `max-age=${windowSeconds}` },
      }),
    );
  } catch {
    /* fail open */
  }
  return false;
}

/** Client IP as seen by Cloudflare. */
export const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ?? "unknown";

/** True when the request carries an Origin header from another site. */
export function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

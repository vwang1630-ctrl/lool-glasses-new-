// Shared handler for public R2 image routes. Each /images/<prefix>/<file> route
// resolves to the same PRODUCTS_BUCKET object keyed `<prefix>/<file>`, plus the
// legacy /api/admin/r2/<key> internal alias. Immutable, cacheable, public-read.
import { env } from "cloudflare:workers";

export async function serveR2Image(key: string): Promise<Response> {
  if (!key) return new Response("not found", { status: 404 });

  const bucket = (env as unknown as { PRODUCTS_BUCKET?: R2Bucket })
    .PRODUCTS_BUCKET;
  if (!bucket) return new Response("r2_binding_missing", { status: 500 });

  const obj = await bucket.get(key);
  if (!obj) return new Response("not found", { status: 404 });

  const headers = new Headers();
  const ct = obj.httpMetadata?.contentType ?? "application/octet-stream";
  headers.set("Content-Type", ct);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (obj.etag) headers.set("ETag", obj.etag);

  return new Response(obj.body, { headers });
}

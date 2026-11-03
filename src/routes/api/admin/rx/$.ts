// GET /api/admin/rx/<key>  — serve an R2 RX_BUCKET object (prescription upload).
// Auth: requires admin session cookie (these are PHI / private uploads).

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { requireAdmin } from "@/server/admin";

export const Route = createFileRoute("/api/admin/rx/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }

        const key = (params._splat ?? "").replace(/^\/+/, "");
        if (!key) return new Response("not found", { status: 404 });

        const bucket = (env as unknown as { RX_BUCKET?: R2Bucket }).RX_BUCKET;
        if (!bucket) return new Response("rx_binding_missing", { status: 500 });

        const obj = await bucket.get(key);
        if (!obj) return new Response("not found", { status: 404 });

        const headers = new Headers();
        const ct = obj.httpMetadata?.contentType ?? "application/octet-stream";
        headers.set("Content-Type", ct);
        headers.set("Cache-Control", "private, no-store");
        if (obj.etag) headers.set("ETag", obj.etag);

        return new Response(obj.body, { headers });
      },
    },
  },
});

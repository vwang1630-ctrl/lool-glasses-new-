// POST /api/admin/upload — multipart file → R2 PRODUCTS_BUCKET → {key, url}
// Auth: requires admin session cookie.
//
// FormData fields:
//   file:   File (image/jpeg|png|webp|svg+xml, ≤ 10 MB)
//   prefix? string ('frames' / 'lenses' / 'brands')   default 'misc'

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { requireAdmin } from "@/server/admin";
import { nanoid } from "@/server/ids";

const MAX_BYTES = 10 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const VALID_PREFIX = new Set([
  "frames",
  "lenses",
  "brands",
  "banner",
  "product",
  "misc",
]);

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "invalid_form" }, { status: 400 });
        }

        const file = form.get("file");
        if (!(file instanceof File))
          return Response.json({ error: "missing_file" }, { status: 400 });
        if (file.size === 0)
          return Response.json({ error: "empty_file" }, { status: 400 });
        if (file.size > MAX_BYTES)
          return Response.json({ error: "file_too_large" }, { status: 413 });

        const ext = MIME_EXT[file.type];
        if (!ext)
          return Response.json(
            { error: "unsupported_mime", got: file.type },
            { status: 415 },
          );

        const rawPrefix = String(form.get("prefix") ?? "misc");
        const prefix = VALID_PREFIX.has(rawPrefix) ? rawPrefix : "misc";

        const key = `${prefix}/${nanoid()}.${ext}`;
        const bucket = (env as unknown as { PRODUCTS_BUCKET?: R2Bucket })
          .PRODUCTS_BUCKET;
        if (!bucket)
          return Response.json(
            { error: "r2_binding_missing" },
            { status: 500 },
          );

        await bucket.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
          customMetadata: { originalFilename: file.name || "" },
        });

        return Response.json({ key, url: `/images/${key}` });
      },
    },
  },
});

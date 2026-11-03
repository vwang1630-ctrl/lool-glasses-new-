// GET /api/admin/r2/<key>  — internal alias for R2 image serving.
// Retained so admin previews and any stale references holding old URLs keep
// resolving. The storefront now uses the clean /images/<prefix>/<file> routes.

import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/api/admin/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) =>
        serveR2Image((params._splat ?? "").replace(/^\/+/, "")),
    },
  },
});

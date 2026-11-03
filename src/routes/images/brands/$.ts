// GET /images/brands/<file> — public R2 image origin for brand assets.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/brands/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`brands/${params._splat ?? ""}`),
    },
  },
});

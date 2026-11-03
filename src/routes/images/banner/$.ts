// GET /images/banner/<file> — public R2 image origin for banner assets.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/banner/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`banner/${params._splat ?? ""}`),
    },
  },
});

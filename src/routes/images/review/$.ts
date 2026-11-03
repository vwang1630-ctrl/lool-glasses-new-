// GET /images/review/<file> — public R2 image origin for review avatars.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/review/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`review/${params._splat ?? ""}`),
    },
  },
});

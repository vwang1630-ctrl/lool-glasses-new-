// GET /images/lenses/<file> — public R2 image origin for lens assets.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/lenses/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`lenses/${params._splat ?? ""}`),
    },
  },
});

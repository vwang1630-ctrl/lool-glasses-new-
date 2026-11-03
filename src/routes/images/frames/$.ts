// GET /images/frames/<file> — public R2 image origin for frame assets.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/frames/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`frames/${params._splat ?? ""}`),
    },
  },
});

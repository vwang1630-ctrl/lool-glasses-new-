// GET /images/frames-3d/<file> — public R2 origin for 3D try-on GLB models.
// Mirrors /images/frames/<file> but serves from the `frames-3d/` R2 prefix.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/frames-3d/$")({
  server: {
    handlers: {
      GET: async ({ params }) =>
        serveR2Image(`frames-3d/${params._splat ?? ""}`),
    },
  },
});

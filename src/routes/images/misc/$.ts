// GET /images/misc/<file> — public R2 image origin for misc assets (UGC etc).
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/misc/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`misc/${params._splat ?? ""}`),
    },
  },
});

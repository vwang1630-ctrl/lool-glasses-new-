// GET /images/product/<file> — public R2 image origin for product assets.
// Two static segments so this route outranks the dynamic $lang routes.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/product/$")({
  server: {
    handlers: {
      GET: async ({ params }) => serveR2Image(`product/${params._splat ?? ""}`),
    },
  },
});

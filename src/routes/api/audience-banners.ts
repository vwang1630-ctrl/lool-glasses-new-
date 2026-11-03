// GET /api/audience-banners — public read of the homepage section 5 dual banner.
// Returns 0..2 rows. Frontend falls back to bundled assets when missing.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";

export const Route = createFileRoute("/api/audience-banners")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const res = await db
          .prepare(`SELECT audience, image_url, href FROM audience_banners`)
          .all<{ audience: string; image_url: string; href: string | null }>();
        return Response.json(
          { banners: res.results ?? [] },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});

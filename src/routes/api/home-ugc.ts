// GET /api/home-ugc — public read of the "顾客实拍 LOOK" community grid.
// Returns 0..N active cards ordered by sort_order, slot.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangJson } from "@/lib/lang";

type Row = {
  id: string;
  slot: number;
  image_url: string | null;
  name: string;
  rating: number;
  text_json: string | null;
  link_href: string | null;
};

export const Route = createFileRoute("/api/home-ugc")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT id, slot, image_url, name, rating, text_json, link_href
             FROM home_ugc
             WHERE active = 1
             ORDER BY sort_order, slot`,
          )
          .all<Row>();

        const cards = (res.results ?? []).map((r) => ({
          id: r.id,
          slot: r.slot,
          imageUrl: r.image_url,
          name: r.name,
          rating: r.rating,
          text: parseLangJson(r.text_json),
          linkHref: r.link_href,
        }));

        return Response.json(
          { cards },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});

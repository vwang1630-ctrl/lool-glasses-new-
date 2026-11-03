// GET /api/home-banners
// Public read of the home page hero banners — 1..N active slots, each linked
// to a product. The homepage uses this for image / name / price / try-on link.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangJson } from "@/lib/lang";

type Row = {
  slot: number;
  banner_id: string;
  image_url: string;
  subtitle_json: string | null;
  eyebrow_json: string | null;
  title_json: string | null;
  sub_json: string | null;
  product_id: string;
  product_slug: string;
  product_name_json: string | null;
  price_cents: number;
  original_price_cents: number | null;
  front_url: string | null;
};

export const Route = createFileRoute("/api/home-banners")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT b.slot,
                    b.id          AS banner_id,
                    b.image_url,
                    b.subtitle_json,
                    b.eyebrow_json,
                    b.title_json,
                    b.sub_json,
                    p.id          AS product_id,
                    p.slug        AS product_slug,
                    p.name_json   AS product_name_json,
                    p.price_cents,
                    p.original_price_cents,
                    (SELECT json_extract(pc.images_json, '$[0]') FROM product_colors pc
                       WHERE pc.product_id = p.id
                       ORDER BY pc.sort_order, pc.color_id LIMIT 1) AS front_url
             FROM home_banners b
             JOIN products p ON p.id = b.product_id
             WHERE b.active = 1
             ORDER BY b.slot`,
          )
          .all<Row>();

        const banners = (res.results ?? []).map((r: Row) => ({
          slot: r.slot,
          bannerId: r.banner_id,
          imageUrl: r.image_url,
          subtitle: parseLangJson(r.subtitle_json),
          eyebrow: parseLangJson(r.eyebrow_json),
          title: parseLangJson(r.title_json),
          sub: parseLangJson(r.sub_json),
          productId: r.product_id,
          productSlug: r.product_slug,
          productName: parseLangJson(r.product_name_json),
          priceCents: r.price_cents,
          originalPriceCents: r.original_price_cents,
          frontUrl: r.front_url,
        }));

        return Response.json(
          { banners },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});

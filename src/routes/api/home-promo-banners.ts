// GET /api/home-promo-banners — public read of the AI try-on + 品牌主张 strips.
// Returns at most 2 active rows keyed by `kind` ('tryon' | 'brand').

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangJson } from "@/lib/lang";

type Row = {
  id: string;
  kind: "tryon" | "brand";
  image_url: string | null;
  eyebrow_json: string | null;
  title_json: string | null;
  sub_json: string | null;
  cta_json: string | null;
  link_href: string;
};

export const Route = createFileRoute("/api/home-promo-banners")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT id, kind, image_url, eyebrow_json, title_json,
                    sub_json, cta_json, link_href
             FROM home_promo_banners
             WHERE active = 1`,
          )
          .all<Row>();

        const banners = (res.results ?? []).map((r) => ({
          id: r.id,
          kind: r.kind,
          imageUrl: r.image_url,
          eyebrow: parseLangJson(r.eyebrow_json),
          title: parseLangJson(r.title_json),
          sub: parseLangJson(r.sub_json),
          cta: parseLangJson(r.cta_json),
          linkHref: r.link_href,
        }));

        return Response.json(
          { banners },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});

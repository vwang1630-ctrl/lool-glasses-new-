// GET /api/blog
// Public list of active blog posts ordered by published date desc. 前台
// /$lang/blog 拉这条，D1 为空时页面回退到代码里的静态 POSTS（平滑过渡）。

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangJson } from "@/lib/lang";

type Row = {
  id: string;
  slug: string;
  cover_image_url: string;
  title_json: string | null;
  content_json: string | null;
  published_at: number;
  sort_order: number;
};

export const Route = createFileRoute("/api/blog")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT id, slug, cover_image_url, title_json, content_json,
                    published_at, sort_order
               FROM blog_posts
               WHERE active = 1
               ORDER BY sort_order, published_at DESC, id`,
          )
          .all<Row>();

        const posts = (res.results ?? []).map((r: Row) => ({
          id: r.id,
          slug: r.slug,
          coverImageUrl: r.cover_image_url,
          title: parseLangJson(r.title_json),
          content: parseLangJson(r.content_json),
          publishedAt: r.published_at,
        }));

        return Response.json(
          { posts },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});

// GET /sitemap.xml
// Dynamic XML sitemap for AI/search crawlers. Includes static informational
// pages + every non-archived product slug from D1 + active blog posts. Output
// complies with the sitemaps.org 0.9 spec and adds Google image sitemap
// extensions for product card images and blog cover images.
//
// Filename uses TanStack's [.] escape so the literal "." in the URL path works.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { SUPPORTED_LANG_CODES } from "@/lib/i18n";
import { parseLangJson, pickLang } from "@/lib/lang";

const SITE = "https://loollook.com";

// Static, content-rich pages. Each is emitted × 14 languages with hreflang
// xhtml:link alternates so AI/search crawlers index the right language for
// the right region. The path here is the SUFFIX (without /$lang prefix).
const STATIC_PAGES: { path: string; changefreq?: string; priority?: number }[] =
  [
    { path: "/", changefreq: "daily", priority: 1.0 },
    { path: "/products", changefreq: "daily", priority: 0.9 },
    { path: "/presbyopia", changefreq: "weekly", priority: 0.9 },
    { path: "/myopia", changefreq: "weekly", priority: 0.9 },
    { path: "/try-on", changefreq: "monthly", priority: 0.7 },
    { path: "/measure-pd", changefreq: "monthly", priority: 0.6 },
    { path: "/find-your-fit", changefreq: "monthly", priority: 0.5 },
    { path: "/choose-eyeglasses", changefreq: "monthly", priority: 0.5 },
    { path: "/prescription-guide", changefreq: "monthly", priority: 0.5 },
    { path: "/help", changefreq: "weekly", priority: 0.7 },
    { path: "/blog", changefreq: "weekly", priority: 0.7 },
    { path: "/about", changefreq: "monthly", priority: 0.6 },
    { path: "/why-lool", changefreq: "monthly", priority: 0.6 },
    { path: "/promise", changefreq: "monthly", priority: 0.5 },
    { path: "/shipping-returns", changefreq: "monthly", priority: 0.5 },
    { path: "/education-discount", changefreq: "monthly", priority: 0.4 },
    { path: "/affiliate", changefreq: "monthly", priority: 0.4 },
    { path: "/refer", changefreq: "monthly", priority: 0.3 },
    { path: "/rewards", changefreq: "monthly", priority: 0.3 },
    { path: "/privacy", changefreq: "yearly", priority: 0.3 },
    { path: "/cookies", changefreq: "yearly", priority: 0.3 },
    { path: "/terms", changefreq: "yearly", priority: 0.3 },
    { path: "/accessibility", changefreq: "yearly", priority: 0.3 },
    { path: "/contact", changefreq: "yearly", priority: 0.4 },
  ];

/** Build hreflang alternate links block for one canonical path suffix. */
function alternatesForPath(suffix: string): string {
  const links = SUPPORTED_LANG_CODES.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${suffix}"/>`,
  );
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en${suffix}"/>`,
  );
  return links.join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  return u.startsWith("http") ? u : `${SITE}${u}`;
}

/** Return the first candidate image URL that returns HTTP 200 on GET.
 *  HEAD is not reliable for the R2 image route (it can return 200 while GET
 *  returns 404 for a missing object), so we always use GET. */
async function firstValidImageUrl(
  candidates: (string | null | undefined)[],
): Promise<string | null> {
  for (const raw of candidates) {
    const url = toAbsoluteUrl(raw);
    if (!url) continue;
    try {
      const res = await fetch(url, { method: "GET", redirect: "manual" });
      if (res.status === 200) return url;
    } catch {
      // treat network errors as invalid
    }
  }
  return null;
}

function imageBlock(loc: string, title?: string): string {
  const titleLine = title
    ? `\n      <image:title>${escapeXml(title)}</image:title>`
    : "";
  return `    <image:image>
      <image:loc>${escapeXml(loc)}</image:loc>${titleLine}
    </image:image>`;
}

function urlEntry(opts: {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  /** Path suffix used to emit hreflang alternates (omit for non-localizable URLs). */
  alternatesForSuffix?: string;
  /** Absolute image URLs to include as <image:image>. */
  images?: { loc: string; title?: string }[];
}): string {
  const parts = [`    <loc>${escapeXml(opts.loc)}</loc>`];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq)
    parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (typeof opts.priority === "number")
    parts.push(`    <priority>${opts.priority.toFixed(1)}</priority>`);
  if (opts.alternatesForSuffix)
    parts.push(alternatesForPath(opts.alternatesForSuffix));
  for (const img of opts.images ?? []) {
    parts.push(imageBlock(img.loc, img.title));
  }
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const productsRes = await db
          .prepare(
            `SELECT id,
                    slug,
                    name_json,
                    card_image_url,
                    updated_at
               FROM products
              WHERE archived_at IS NULL
              ORDER BY updated_at DESC`,
          )
          .all<{
            id: string;
            slug: string;
            name_json: string;
            card_image_url: string | null;
            updated_at: number;
          }>();
        const products = productsRes.results ?? [];

        // Build a candidate image list per product from product_colors so that
        // products without a dedicated card_image_url can still expose a valid
        // image in the sitemap. We validate every candidate with GET because
        // the image route returns 200 on HEAD for missing R2 objects.
        const colorRes = await db
          .prepare(
            `SELECT product_id, images_json
               FROM product_colors
              ORDER BY sort_order, color_id`,
          )
          .all<{ product_id: string; images_json: string | null }>();
        const productImageCandidates = new Map<string, string[]>();
        for (const c of colorRes.results ?? []) {
          if (!c.images_json) continue;
          try {
            const arr = JSON.parse(c.images_json) as string[];
            const valid = arr.filter((x): x is string => typeof x === "string");
            if (!valid.length) continue;
            const list = productImageCandidates.get(c.product_id) ?? [];
            list.push(...valid);
            productImageCandidates.set(c.product_id, list);
          } catch {
            // ignore malformed JSON
          }
        }

        const blogRes = await db
          .prepare(
            `SELECT slug,
                    title_json,
                    cover_image_url,
                    updated_at
               FROM blog_posts
              WHERE active = 1
              ORDER BY published_at DESC`,
          )
          .all<{
            slug: string;
            title_json: string | null;
            cover_image_url: string | null;
            updated_at: number;
          }>();
        const blogPosts = blogRes.results ?? [];

        const entries: string[] = [];
        // For each canonical URL, emit one <url> per language (14×) with the
        // full set of hreflang alternates inline. This is what AI/search
        // crawlers use to map (lang, region) → indexable URL.
        for (const p of STATIC_PAGES) {
          const isHome = p.path === "/";
          for (const lang of SUPPORTED_LANG_CODES) {
            entries.push(
              urlEntry({
                loc: isHome ? `${SITE}/${lang}` : `${SITE}/${lang}${p.path}`,
                changefreq: p.changefreq,
                priority: p.priority,
                alternatesForSuffix: isHome ? "" : p.path,
              }),
            );
          }
        }
        // Pre-validate product images in parallel; a dead R2 object must not be
        // emitted in the sitemap (the image route HEAD returns 200 on miss).
        const validProductImage = new Map<string, string>();
        await Promise.all(
          products.map(async (p) => {
            const candidates = [
              p.card_image_url,
              ...(productImageCandidates.get(p.id) ?? []),
            ];
            const valid = await firstValidImageUrl(candidates);
            if (valid) validProductImage.set(p.id, valid);
          }),
        );

        for (const p of products) {
          const lastmod = p.updated_at
            ? new Date(p.updated_at).toISOString().slice(0, 10)
            : undefined;
          const name = pickLang(parseLangJson(p.name_json), "en");
          const imageLoc = validProductImage.get(p.id);
          const images = imageLoc ? [{ loc: imageLoc, title: name }] : [];
          for (const lang of SUPPORTED_LANG_CODES) {
            entries.push(
              urlEntry({
                loc: `${SITE}/${lang}/product/${p.slug}`,
                lastmod,
                changefreq: "weekly",
                priority: 0.8,
                alternatesForSuffix: `/product/${p.slug}`,
                images,
              }),
            );
          }
        }
        for (const b of blogPosts) {
          const lastmod = b.updated_at
            ? new Date(b.updated_at).toISOString().slice(0, 10)
            : undefined;
          const title = pickLang(parseLangJson(b.title_json), "en");
          const imageLoc = toAbsoluteUrl(b.cover_image_url);
          const images = imageLoc ? [{ loc: imageLoc, title }] : [];
          for (const lang of SUPPORTED_LANG_CODES) {
            entries.push(
              urlEntry({
                loc: `${SITE}/${lang}/blog/${b.slug}`,
                lastmod,
                changefreq: "monthly",
                priority: 0.7,
                alternatesForSuffix: `/blog/${b.slug}`,
                images,
              }),
            );
          }
        }
        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
          entries.join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=3600",
          },
        });
      },
    },
  },
});

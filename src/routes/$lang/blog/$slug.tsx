// /$lang/blog/$slug — single blog article (SSR head + Article JSON-LD).
// Reads from D1 blog_posts first; falls back to src/data/blog-posts.ts when
// the table is empty or the slug is not yet migrated.

import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { pickLang, parseLangJson, type LangMap } from "@/lib/lang";
import { LangLink } from "@/components/LangLink";
import { Button } from "@/components/ui/button";
import { STATIC_BLOG_POSTS, type BlogPost } from "@/data/blog-posts";
import { JsonLd } from "@/lib/jsonld";

const SITE = "https://loollook.com";

/**
 * Extract FAQ pairs from HTML content for FAQPage schema (GEO).
 * Matches <h3>question</h3><p>answer</p> patterns in the FAQ section.
 */
function extractFaqs(html: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  // Find the FAQ section by looking for an <h2> containing "faq" (case-insensitive)
  const faqMatch = html.match(/<h2[^>]*>[^<]*faq[^<]*<\/h2>/i);
  if (!faqMatch) return faqs; // No FAQ section found — don't extract anything
  const faqStart = html.indexOf(faqMatch[0]);
  const faqSection = html.slice(faqStart);
  // Only match <h3>...</h3> followed by <p>...</p> within the FAQ section
  const h3Pattern = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gis;
  let m: RegExpExecArray | null;
  while ((m = h3Pattern.exec(faqSection)) !== null) {
    const q = m[1]!.replace(/<[^>]*>/g, "").trim();
    const a = m[2]!.replace(/<[^>]*>/g, "").trim();
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

function normalizeBlogRow(r: {
  slug: string;
  cover_image_url: string;
  title_json: string | null;
  content_json: string | null;
  published_at: number;
}): BlogPost {
  const title = parseLangJson(r.title_json);
  const content = parseLangJson(r.content_json);
  return {
    slug: r.slug,
    coverImageUrl: r.cover_image_url,
    publishedAt: r.published_at,
    author: "loollook editorial",
    title,
    excerpt: title,
    body: content,
  };
}

const fetchBlogPost = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    // 1) Try D1 first.
    try {
      const { getDB } = await import("@/server/db");
      const db = getDB();
      const row = await db
        .prepare(
          `SELECT slug, cover_image_url, title_json, content_json, published_at
             FROM blog_posts
            WHERE slug = ? AND active = 1`,
        )
        // D1 first() takes an optional COLUMN name, not bind params —
        // params must go through .bind() or the ? stays unbound and D1 throws.
        .bind(slug)
        .first<{
          slug: string;
          cover_image_url: string;
          title_json: string | null;
          content_json: string | null;
          published_at: number;
        }>();
      if (row) return normalizeBlogRow(row);
    } catch {
      // D1 unavailable locally or unbound — fall through to static registry.
    }

    // 2) Static fallback.
    const post = STATIC_BLOG_POSTS[slug];
    if (post) return post;

    return null;
  });

export const Route = createFileRoute("/$lang/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchBlogPost({ data: params.slug });
    if (!post) throw notFound();
    return { slug: params.slug, lang: params.lang, post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    const lang = loaderData?.lang ?? "en";
    const title = pickLang(post?.title, lang);
    const description = pickLang(post?.excerpt, lang);
    const url = `${SITE}/${lang}/blog/${post?.slug}`;
    const image = post?.coverImageUrl ?? `${SITE}/lool-logo.png`;
    const published = new Date(post?.publishedAt ?? Date.now()).toISOString();
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image,
      url,
      datePublished: published,
      dateModified: published,
      author: { "@type": "Organization", name: "loollook" },
      publisher: {
        "@type": "Organization",
        name: "loollook",
        logo: { "@type": "ImageObject", url: `${SITE}/lool-logo.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    };
    // Extract FAQs from body for FAQPage schema (GEO — AI Overview pickup)
    const bodyHtml = pickLang(post?.body, lang) ?? "";
    const faqs = extractFaqs(bodyHtml);
    const faqJsonLd =
      faqs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: {
                "@type": "Answer",
                text: a,
              },
            })),
          }
        : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      // FAQPage schema for GEO — AI Overview / Perplexity pickup
      scripts: faqJsonLd
        ? [
            {
              type: "application/ld+json" as const,
              children: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
            },
          ]
        : undefined,
    };
  },
  component: BlogPostPage,
});

function formatDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function BlogPostPage() {
  const { lang, t } = useI18n();
  const { post } = Route.useLoaderData();
  const title = pickLang(post.title, lang);
  const body = pickLang(post.body, lang);
  const date = formatDate(post.publishedAt);
  const url = `${SITE}/${lang}/blog/${post.slug}`;
  const image = post.coverImageUrl ?? `${SITE}/lool-logo.png`;
  const published = new Date(post.publishedAt).toISOString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: pickLang(post.excerpt, lang),
    image,
    url,
    datePublished: published,
    dateModified: published,
    author: { "@type": "Organization", name: "loollook" },
    publisher: {
      "@type": "Organization",
      name: "loollook",
      logo: { "@type": "ImageObject", url: `${SITE}/lool-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <div>
      <JsonLd schema={articleJsonLd} />
      <article className="mx-auto max-w-3xl px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
        <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
          <LangLink to="/" className="hover:text-primary transition-smooth">
            {t("nav.home")}
          </LangLink>
          <ChevronRight className="w-3 h-3" />
          <LangLink to="/blog" className="hover:text-primary transition-smooth">
            {t("blog.title")}
          </LangLink>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/80 truncate max-w-[200px]">
            {title}
          </span>
        </nav>

        <header className="mb-8 md:mb-12">
          <span className="eyebrow eyebrow-line mb-4 inline-block">
            {t("blog.eyebrow")}
          </span>
          <h1 className="section-title text-3xl md:text-5xl leading-tight">
            {title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{date}</span>
            <span>·</span>
            <span>{post.author}</span>
          </div>
        </header>

        <img
          src={post.coverImageUrl}
          alt={title}
          loading="eager"
          className="w-full max-h-[28rem] object-cover rounded-xl mb-8 md:mb-12"
        />

        <style>{`
          .article-body p { margin-bottom: 1.25rem; line-height: 1.75; }
          .article-body .lead { font-size: 1.125rem; color: inherit; }
          .article-body h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; }
          .article-body h3 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; line-height: 1.35; }
          .article-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .article-body li { margin-bottom: 0.5rem; }
          .article-body a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
          .article-body a:hover { opacity: 0.85; }
          .article-body hr { margin: 2.5rem 0; border-color: hsl(var(--border)); }
          .article-body strong { font-weight: 600; }
        `}</style>
        <div
          className="article-body max-w-none text-foreground/90"
          // Blog body is authored HTML from our own CMS/static registry.
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Ready to find your pair?
          </p>
          <LangLink to="/products">
            <Button>Shop Fashion Readers</Button>
          </LangLink>
        </div>
      </article>
    </div>
  );
}

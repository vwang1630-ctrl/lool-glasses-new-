// JSON-LD (schema.org) helpers — emits a <script type="application/ld+json">
// tag with the given object serialized. Used by SSR pages so LLM crawlers
// (ChatGPT / Perplexity / Claude / Google AI Overview) can parse the
// structured data on first load.

import type { ReactElement } from "react";

const SITE = "https://loollook.com";

/** Render a JSON-LD <script> tag for the given schema object. */
export function JsonLd({
  schema,
}: {
  schema: Record<string, unknown>;
}): ReactElement {
  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML keeps the JSON exactly as serialized — no
      // React text-node escaping, which would break "@context" etc.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** lool brand Organization schema. Single source of truth for sameAs links. */
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "lool",
  url: SITE,
  logo: `${SITE}/lool-logo.png`,
  description:
    "Modern fashion readers and everyday eyeglasses, designed for the 45–60 generation. Direct-to-consumer eyewear with professional-grade lenses at fair prices.",
  // 对齐 brand-library V1.1 tagline："See clearly, agelessly."
  slogan: "See clearly, agelessly.",
  // Add real social profiles once they exist; placeholders below.
  sameAs: ["https://instagram.com/lool", "https://twitter.com/lool"],
};

/**
 * Build a language-aware WebSite schema with SearchAction. The search target
 * uses the current page language so structured data matches the self-canonical
 * URL surfaced by `$lang.tsx`.
 */
export function websiteSchema(lang = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "lool",
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/${lang}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: [
      "en",
      "zh",
      "ja",
      "ko",
      "es",
      "fr",
      "de",
      "it",
      "pt",
      "ar",
      "vi",
      "th",
      "id",
      "ms",
    ],
  };
}

/** Build a Product schema from the catalog API shape. */
export function productSchema(
  p: {
    slug: string;
    name: Record<string, string>;
    description?: Record<string, string>;
    intro?: Record<string, string>;
    priceCents: number;
    originalPriceCents: number | null;
    currency?: string;
    rating?: number;
    reviewCount?: number;
    categories?: string[];
    shape?: string | null;
    material?: string | null;
    colors?: { id: string; label: Record<string, string>; images: string[] }[];
    hero?: string | null;
  },
  lang = "en",
) {
  const name = p.name[lang] ?? p.name.en ?? p.name.zh ?? p.slug;
  const desc =
    (p.description?.[lang] ?? p.description?.en ?? p.description?.zh) ||
    (p.intro?.[lang] ?? p.intro?.en ?? p.intro?.zh) ||
    `${name} — modern eyewear from lool.`;
  // Collect all images across colors (deduped, absolute URLs)
  const imgs = new Set<string>();
  if (p.hero) imgs.add(p.hero);
  for (const c of p.colors ?? []) for (const u of c.images ?? []) imgs.add(u);
  const images = [...imgs].map((u) =>
    u.startsWith("http") ? u : `${SITE}${u}`,
  );

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: `${SITE}/${lang}/product/${p.slug}`,
    priceCurrency: p.currency || "USD",
    price: (p.priceCents / 100).toFixed(2),
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
  };

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: desc,
    sku: p.slug,
    brand: { "@type": "Brand", name: "lool" },
    category: (p.categories ?? []).includes("presbyopia")
      ? "Fashion Readers"
      : (p.categories ?? []).includes("myopia")
        ? "Single-Vision Eyeglasses"
        : "Eyeglasses",
    offers: offer,
  };
  // Fashion Readers are the primary product, not an accessory/spare part of a
  // broader product. The previous string value also violated schema.org's
  // expected type (Product/Thing), so we keep the category signal above and
  // do not emit isAccessoryOrSparePartFor.
  if (images.length > 0) schema.image = images;
  if (
    typeof p.rating === "number" &&
    p.rating > 0 &&
    typeof p.reviewCount === "number" &&
    p.reviewCount > 0
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (p.shape || p.material) {
    schema.additionalProperty = [
      p.shape && {
        "@type": "PropertyValue",
        name: "Frame shape",
        value: p.shape,
      },
      p.material && {
        "@type": "PropertyValue",
        name: "Material",
        value: p.material,
      },
    ].filter(Boolean);
  }
  return schema;
}

/** BreadcrumbList for any page. Pass [{name, url}, ...] in order from root. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** FAQPage from a list of {question, answer} pairs. */
export function faqSchema(qa: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

/** Article schema for blog longform posts. AI search engines and Google
 * News rely on this for indexing & citation attribution. */
export function articleSchema(
  p: {
    slug: string;
    title: string;
    excerpt: string;
    publishDate: string;
    author: string;
    body: string;
  },
  lang = "en",
) {
  const url = `${SITE}/${lang}/blog/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishDate,
    dateModified: p.publishDate,
    author: { "@type": "Person", name: p.author },
    publisher: {
      "@type": "Organization",
      name: "lool",
      logo: { "@type": "ImageObject", url: `${SITE}/lool-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleBody: p.body,
  };
}

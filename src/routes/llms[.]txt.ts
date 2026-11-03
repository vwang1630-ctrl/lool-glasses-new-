// GET /llms.txt — LLM discovery / GEO exit.
//
// llms.txt (llmstxt.org) gives ChatGPT / Claude / Perplexity etc. a plain-text
// map of the site's real pages. Served via a Worker route (same pattern as
// robots[.]txt.ts) so it bypasses Cloudflare's managed-content auto-injection
// and the $lang/$ guards that would otherwise 302 /llms.txt → /admin.
//
// Filename uses TanStack's [.] escape so the literal "." in the URL works.
// Only real, live URLs are listed. The content roadmap section is driven by
// operator-library content_matrix (via the operator bridge) with status
// labels — planned clusters are marked, never presented as published.
//
// Keywords / banned_terms red lines: no medical vocabulary, no unverified
// numbers; $69 free-shipping threshold is framework-lock trusted_numbers.

import { createFileRoute } from "@tanstack/react-router";
import { BRAND, knowledgeHubCards } from "@/lib/operator";

const SITE = "https://loollook.com";

/** Live customer-facing pages, in order of importance. */
const PAGES: { title: string; url: string; desc: string }[] = [
  {
    title: "Home",
    url: "/en",
    desc: "Fashion readers and everyday eyeglasses for the 45–60 generation.",
  },
  {
    title: "All Eyeglasses",
    url: "/en/products",
    desc: "Browse every style by frame shape, material and lens.",
  },
  {
    title: "Reading Glasses",
    url: "/en/presbyopia",
    desc: "Magnification-only fashion readers, styled for everyday wear.",
  },
  {
    title: "Myopia Glasses",
    url: "/en/myopia",
    desc: "Single-vision prescription eyeglasses.",
  },
  {
    title: "Oversized Square TR90",
    url: "/en/product/lool-tr90-square",
    desc: "Featherlight oversized square cheaters in warm Havana tortoise.",
  },
  {
    title: "Measure PD at Home",
    url: "/en/measure-pd",
    desc: "Free 30-second pupil-distance measurement with your phone camera.",
  },
  {
    title: "Virtual Try-On",
    url: "/en/try-on",
    desc: "Try frames on with your real camera before you buy.",
  },
  {
    title: "Find Your Fit",
    url: "/en/find-your-fit",
    desc: "Best frame shapes for round, oval and square faces.",
  },
  {
    title: "Prescription Guide",
    url: "/en/prescription-guide",
    desc: "Diopter strength, PD measurement and lens choices in plain language.",
  },
  {
    title: "Help Center",
    url: "/en/help",
    desc: "Ordering, shipping, returns and lens FAQs.",
  },
  {
    title: "Shipping & Returns",
    url: "/en/shipping-returns",
    desc: "Free tracked shipping over $69 and 30-day returns.",
  },
  {
    title: "Blog",
    url: "/en/blog",
    desc: "Buying guides, lens tech and the ageless eyewear philosophy.",
  },
];

function buildBody(): string {
  const lines: string[] = [];

  lines.push(`# ${BRAND.name}`);
  lines.push("");
  lines.push(
    `> ${BRAND.tagline} Fashion readers and everyday eyeglasses for the 45–60 generation, direct to consumer with pro-grade lenses.`,
  );
  lines.push("");
  lines.push("## Pages");
  lines.push("");
  for (const p of PAGES) {
    lines.push(`- [${p.title}](${SITE}${p.url}): ${p.desc}`);
  }

  // Content roadmap — from operator-library content_matrix, status-labelled.
  lines.push("");
  lines.push("## Content roadmap");
  lines.push("");
  lines.push(
    "Editorial clusters in the lool plan (status labels reflect progress):",
  );
  lines.push("");
  for (const k of knowledgeHubCards()) {
    lines.push(
      `- [${k.title}](${SITE}${k.href}) (${k.status ?? "planned"}): ${k.desc}`,
    );
  }
  lines.push("");

  return lines.join("\n");
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildBody(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});

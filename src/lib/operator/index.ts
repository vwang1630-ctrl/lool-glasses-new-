// ─────────────────────────────────────────────────────────────────────────────
// 接线层（bridge）— 把操盘手系统 docs/system-kit/library/ 变成前端运行时数据源。
//
// 背景：操盘手系统 28 个库文件此前全部躺在 docs/ 下，前端运行时零消费——
// 首页/全局壳的 SEO/GEO/信任口径/产品标签全是硬编码，操盘手改库不生效。
// 本文件是唯一允许 import docs/system-kit/library/*.json 的入口，各页面路由
// 只从这里拿类型化数据，红线（banned_terms / forbidden_words）不进任何输出。
//
// 相对路径（不能用 @/ 别名——@/* 只映射到 src/）：
//   src/lib/operator/index.ts → 项目根 = ../../../
//
// 不写 unverified 数字：只用 framework-lock trusted_numbers 与库内已验证值。
// 库文件本身不改；money 决策（定价/运费/优惠）归站主，本层不触碰。
// ─────────────────────────────────────────────────────────────────────────────

import frameworkLockJson from "../../../docs/system-kit/library/framework-lock.json";
import keywordLibJson from "../../../docs/system-kit/library/keyword-library.json";
import seoMetaLibJson from "../../../docs/system-kit/library/seo-meta-library.json";
import brandLibJson from "../../../docs/system-kit/library/brand-library.json";
import glossaryLibJson from "../../../docs/system-kit/library/eyewear-glossary-library.json";
import operatorLibJson from "../../../docs/system-kit/library/operator-library.json";

/* ---------- 库内结构的最小类型声明（与 JSON 实参对齐） ---------- */

interface KeywordItem {
  id: string;
  term: string;
  market_layer: string;
  intent: string;
  assigned_to: string;
  evidence_tier: string;
  note?: string;
}

interface BannedTermItem {
  term: string;
  why: string;
}

interface GlossaryStyle {
  term: string;
  alias?: string[];
  search_level: string;
  trend_2026?: string;
  gate: string;
  geo_hook?: string;
  example_skus?: string[];
  note?: string;
}

interface GlossaryLens {
  term: string;
  search_level: string;
  gate: string;
  framing?: string;
  geo_hook?: string;
}

interface GlossaryProductTag {
  gate: string;
  frame_styles: string[];
  materials: string[];
  lens: string[];
  fashion: string[];
  face_shape_age: string[];
  status?: string;
  url?: string;
}

interface ContentClusterItem {
  id: string;
  name: string;
  keywords: string[];
  pillar: string;
  supporting?: string[];
  persona_link: string;
  funnel_stage: string;
  status: string;
  note: string;
}

/* ---------- 品牌常量 ---------- */

/** 全站 OG 图（沿用 __root 现有 R2 图；cro-og-image 工单跟踪换新 bucket）。 */
export const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/80742e2b-540f-4ed9-9b1c-65e5c2551b39/id-preview-3046f0b1--4b6f1bc2-16c9-4dff-8e66-25193bcba9c8.lovable.app-1776927976073.png";

/** GA4 tag —— 来自 operator-library cro-ga4-wiring（已登记未部署）。 */
export const GA4_TAG = "G-FD4MN4RM7G";

/** brand-library V1.1 品牌口径。 */
export const BRAND = {
  name: brandLibJson.brand_identity.name as string,
  tagline: brandLibJson.brand_identity.tagline as string,
  taglineZh: brandLibJson.brand_identity.tagline_zh as string,
  positioning: brandLibJson.brand_identity.positioning as string,
};

/* ---------- head meta（seo-meta-library 模式 + keyword-library 主词 + brand 口径） ---------- */

export interface HeadMeta {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

interface PageMetaCfg {
  /** keyword-library 内登记的主词 id */
  keywordId: string;
  /** title 模式 {benefit} 段 */
  benefit: string;
  /** meta description（150-160 字符，benefit_statement. feature. cta.） */
  description: string;
  /** og:description */
  ogDescription: string;
  /** keywords meta（全部为 keyword-library 在册词） */
  keywords: string[];
}

const PAGE_META: Record<string, PageMetaCfg> = {
  home: {
    keywordId: "kw-fashion-readers",
    benefit: "Ageless Eyewear for 45+",
    description:
      "Ageless fashion readers for the 45-60 generation. Real camera virtual try-on, 30-second PD measurement, pro-grade lenses, free tracked shipping over $69.",
    ogDescription:
      "Fashion readers redesigned for the 45-60 generation — ageless design, real camera try-on, free tracked shipping over $69.",
    keywords: [
      "fashion readers",
      "fashion cheaters",
      "ageless reading glasses",
      "TR90 readers",
      "oversized cheaters",
      "stylish reading glasses for women",
    ],
  },
  // Phase 2+：products / presbyopia / myopia / try-on / measure-pd / help 逐页接入。
};

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * 按页面解析 head meta。主词取 keyword-library 在册词，title 套
 * seo-meta-library meta_patterns.title.pattern（"{keyword} — {benefit} | lool"）。
 */
export function resolveHeadMeta(page: string): HeadMeta {
  const cfg = PAGE_META[page] ?? PAGE_META.home;
  const keyword =
    (keywordLibJson.keywords as unknown as KeywordItem[]).find(
      (k) => k.id === cfg.keywordId,
    )?.term ?? "fashion readers";
  const pattern = (
    seoMetaLibJson.meta_patterns as { title: { pattern: string } }
  ).title.pattern;
  const title = pattern
    .replace("{keyword}", titleCase(keyword))
    .replace("{benefit}", cfg.benefit);
  return {
    title,
    description: cfg.description,
    keywords: cfg.keywords.join(", "),
    ogTitle: title,
    ogDescription: cfg.ogDescription,
    ogImage: OG_IMAGE,
  };
}

/* ---------- Trust（framework-lock trust_kit + delivery_rule） ---------- */

export interface TrustKit {
  tokens: string[];
  numbers: number[];
  delivery: { standard: string; returns: string; progressiveGuarantee: string };
}

/** framework-lock 信任组：trusted_tokens / trusted_numbers / delivery_rule。 */
export function trustTokens(): TrustKit {
  const fk = frameworkLockJson as unknown as {
    trust_kit: { trusted_tokens: string[]; trusted_numbers: number[] };
    delivery_rule: {
      standard: string;
      returns: string;
      progressive_guarantee: string;
    };
  };
  return {
    tokens: fk.trust_kit.trusted_tokens,
    numbers: fk.trust_kit.trusted_numbers,
    delivery: {
      standard: fk.delivery_rule.standard,
      returns: fk.delivery_rule.returns,
      progressiveGuarantee: fk.delivery_rule.progressive_guarantee,
    },
  };
}

/* ---------- Home Shape Cards（glossary frame_styles 驱动） ---------- */

export interface HomeShapeCard {
  /** 与现有 /products?shape=X 过滤值及 menu.shape.* i18n key 对齐 */
  key: string;
  /** glossary 术语（如 Panto / Oversized / Square） */
  term: string;
  geoHook?: string;
  trend2026?: string;
  /** 有 active SKU 时直接链 PDP，否则 /products?shape= */
  skuSlug?: string;
}

/** 9 个首页形状卡 → glossary 术语映射（按搜索意图分，不按工厂目录）。 */
const SHAPE_GLOSSARY_MAP: Record<string, string> = {
  aviator: "Aviator",
  cateye: "Cat-Eye",
  round: "Panto",
  oval: "Panto",
  browline: "Browline",
  butterfly: "Cat-Eye",
  geometric: "Geometric",
  rectangle: "Browline",
  square: "Oversized / Square",
};

/** 有 active SKU 直接承接的形状：oval→lool-8663（Boston Oval），square→lool-tr90-square。 */
const SHAPE_SKU: Record<string, string> = {
  oval: "lool-8663",
  square: "lool-tr90-square",
};

/** 首页 Shop by Frame Shape：图标仍由 index.tsx 的 SVG 数组提供，这里给话术与链接。 */
export function homeShapeCards(): HomeShapeCard[] {
  const styles = (
    glossaryLibJson.categories as unknown as { frame_styles: GlossaryStyle[] }
  ).frame_styles;
  const findStyle = (term: string) =>
    styles.find((s) => s.term === term || (s.alias ?? []).includes(term));
  return Object.keys(SHAPE_GLOSSARY_MAP).map((key) => {
    const g = findStyle(SHAPE_GLOSSARY_MAP[key]);
    return {
      key,
      term: g?.term ?? key,
      geoHook: g?.geo_hook,
      trend2026: g?.trend_2026,
      skuSlug: SHAPE_SKU[key],
    };
  });
}

/* ---------- Gate Tags（glossary product_tags 桥接，DB 无 gate 列） ---------- */

export interface GateTags {
  gate: string | null;
  frameStyles: string[];
  materials: string[];
  lens: string[];
  fashion: string[];
  faceShapeAge: string[];
}

/** 按 SKU 取 glossary 产品标签（gate 值 + 款式/材质/时尚/脸型）。 */
export function gateTags(skuId: string): GateTags | null {
  const tags = (
    glossaryLibJson.product_tags as unknown as Record<
      string,
      GlossaryProductTag
    >
  )[skuId];
  if (!tags) return null;
  return {
    gate: tags.gate ?? null,
    frameStyles: tags.frame_styles ?? [],
    materials: tags.materials ?? [],
    lens: tags.lens ?? [],
    fashion: tags.fashion ?? [],
    faceShapeAge: tags.face_shape_age ?? [],
  };
}

/* ---------- Glossary FAQ（GEO FAQPage + 首页可见手风琴） ---------- */

export interface FaqItem {
  question: string;
  answer: string;
}

/** 首页 FAQ（EN 先行，正文取自 glossary geo_hook + framework-lock delivery_rule）。
 * 用于 SSR FAQPage JSON-LD 与首页可见手风琴区。 */
export function glossaryFaq(): FaqItem[] {
  const categories = glossaryLibJson.categories as unknown as {
    frame_styles: GlossaryStyle[];
    lens_types: GlossaryLens[];
  };
  const panto = categories.frame_styles.find((s) => s.term === "Panto");
  const oversize = categories.frame_styles.find(
    (s) => s.term === "Oversized / Square",
  );
  const reading = categories.lens_types.find(
    (s) => s.term === "Reading Glasses",
  );
  const fk = frameworkLockJson as unknown as {
    delivery_rule: {
      standard: string;
      returns: string;
      progressive_guarantee: string;
    };
  };

  const pantoAnswer = (panto?.geo_hook ?? "")
    .replace(/^What is a Panto frame\?\s*/i, "")
    .trim();

  return [
    {
      question: "What are fashion readers?",
      answer:
        reading?.geo_hook ??
        "Ageless reading glasses for the 45-60 generation — magnification only, styled as fashion readers.",
    },
    {
      question: "What is a Panto frame?",
      answer:
        pantoAnswer ||
        "A vintage round silhouette with a flatter top edge — the classic frame that reads as style, not as an aid.",
    },
    {
      question: "Are oversized square readers in style for 2026?",
      answer: `Yes — ${oversize?.geo_hook ?? "oversized square fashion readers are the fashion-forward intellectual look for 2026."}`,
    },
    {
      question: "How do I measure my PD at home?",
      answer:
        "Use lool's free Measure PD tool — your phone camera measures your pupil distance in about 30 seconds, no ruler or eye exam needed.",
    },
    {
      question:
        "What's the difference between fashion readers and prescription reading glasses?",
      answer:
        "Fashion readers are magnification-only accessories (typically +1.00 to +3.50) with stylish, contemporary frames. They're not a medical device and need no prescription.",
    },
    {
      question: "Do you offer free shipping and returns?",
      answer: `${fk.delivery_rule.standard}. ${fk.delivery_rule.returns}.`,
    },
  ];
}

/* ---------- Content Matrix（operator-library content_matrix → Knowledge Hub + llms.txt） ---------- */

export interface ContentCluster {
  id: string;
  name: string;
  pillar: string;
  funnelStage: string;
  status: string;
  note: string;
  keywords: string[];
  personaLink: string;
}

/** operator-library content_matrix 5 个内容簇。 */
export function contentClusters(): ContentCluster[] {
  return (
    operatorLibJson.content_matrix as unknown as ContentClusterItem[]
  ).map((c) => ({
    id: c.id,
    name: c.name,
    pillar: c.pillar,
    funnelStage: c.funnel_stage,
    status: c.status,
    note: c.note,
    keywords: c.keywords,
    personaLink: c.persona_link,
  }));
}

export interface KnowledgeCard {
  /** lucide 图标 key（index.tsx 映射到组件） */
  icon: "glasses" | "book" | "sparkles" | "wrench" | "award";
  href: string;
  title: string;
  desc: string;
  /** 内容簇状态（planned 等），用于角标 */
  status?: string;
}

const CLUSTER_ICON: Record<string, KnowledgeCard["icon"]> = {
  "cluster-reading-glasses": "glasses",
  "cluster-progressive-lenses": "book",
  "cluster-ageless-eyewear": "sparkles",
  "cluster-frame-fit-guide": "wrench",
  "cluster-lens-tech": "award",
};

const CLUSTER_HREF: Record<string, string> = {
  "cluster-reading-glasses": "/blog",
  "cluster-progressive-lenses": "/blog",
  "cluster-ageless-eyewear": "/blog",
  "cluster-frame-fit-guide": "/find-your-fit",
  "cluster-lens-tech": "/prescription-guide",
};

const CLUSTER_TITLE: Record<string, string> = {
  "cluster-reading-glasses": "Reading Glasses Guide",
  "cluster-progressive-lenses": "Progressive Lenses Explained",
  "cluster-ageless-eyewear": "Ageless Eyewear",
  "cluster-frame-fit-guide": "Face Shape & Frame Fit",
  "cluster-lens-tech": "Lens Tech Buyers Guide",
};

const CLUSTER_DESC: Record<string, string> = {
  "cluster-reading-glasses":
    "Best reading glasses, buying guides, and how to choose — for women, men, and 45+ professionals.",
  "cluster-progressive-lenses":
    "Progressive vs reading glasses, adaptation tips, and our 3-week adaptation guarantee.",
  "cluster-ageless-eyewear":
    "The ageless design philosophy — stylish fashion readers that never look like an aid.",
  "cluster-frame-fit-guide":
    "Best frames for round, oval and square faces — find your fit in minutes.",
  "cluster-lens-tech":
    "Blue-light filtering, photochromic and high-index lenses, explained in plain language.",
};

/** 首页 Knowledge Hub 卡片 = content_matrix 5 簇（EN 展示文案，status 角标标注 planned）。 */
export function knowledgeHubCards(): KnowledgeCard[] {
  return contentClusters().map((c) => ({
    icon: CLUSTER_ICON[c.id] ?? "glasses",
    href: CLUSTER_HREF[c.id] ?? "/blog",
    title: CLUSTER_TITLE[c.id] ?? c.name,
    desc: CLUSTER_DESC[c.id] ?? c.note,
    status: c.status,
  }));
}

/* ---------- scanBanned（开发/验证用：扫描 forbidden_words + banned_terms） ---------- */

export interface BannedHit {
  term: string;
  index: number;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 扫描文本命中的禁词。EN 单次用词边界匹配（避免 "old" 命中 "gold"），
 * 中文用 indexOf，另扫描 keyword-library banned_terms（医疗词库）。 */
export function scanBanned(text: string): BannedHit[] {
  const hits: BannedHit[] = [];
  const fw = frameworkLockJson as unknown as {
    forbidden_words: { en: string[]; zh: string[] };
  };
  const lower = text.toLowerCase();

  for (const w of fw.forbidden_words.en ?? []) {
    const re = new RegExp(`(^|[^a-z])(${escapeRegExp(w)})([^a-z]|$)`, "i");
    const m = lower.match(re);
    if (m) hits.push({ term: w, index: (m.index ?? 0) + (m[1] ? 1 : 0) });
  }
  for (const w of fw.forbidden_words.zh ?? []) {
    const i = text.indexOf(w);
    if (i !== -1) hits.push({ term: w, index: i });
  }
  for (const b of (keywordLibJson.banned_terms as unknown as BannedTermItem[]) ??
    []) {
    const i = lower.indexOf(b.term.toLowerCase());
    if (i !== -1) hits.push({ term: b.term, index: i });
  }
  return hits;
}

/* ---------- ItemList JSON-LD（首页产品列表） ---------- */

/** ItemList schema：首页产品 rails 用（client 数据补全后注入）。 */
export function itemListSchema(items: { slug: string; name: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://loollook.com/en/product/${it.slug}`,
      name: it.name,
    })),
  };
}

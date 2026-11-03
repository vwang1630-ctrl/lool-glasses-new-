// Server-side catalog loader. Same SQL + mapping as /api/catalog GET, but
// callable directly from TanStack Start route loaders (so PDP / sitemap /
// future SSR pages get product data without a self-HTTP roundtrip on the
// Cloudflare Worker).

import { getDB } from "@/server/db";
import { parseLangJson, type LangMap } from "@/lib/lang";
import type { ColorFamilyId, FinishId } from "@/lib/color-palette";

const safeJsonArray = (s: string | null): unknown[] => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const safeJsonObject = (s: string | null): Record<string, unknown> => {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const parseContent = (s: string | null): ProductContentMap | null => {
  const raw = safeJsonObject(s);
  if (Object.keys(raw).length === 0) return null;
  return raw as ProductContentMap;
};

// Per-product content story (WO-20261008-01). Mirrors the section set the
// operator patch ships (docs/system-kit/patch/*.json) so the PDP route can
// render a full DB-driven SSR section story with per-section H2s.
export type ProductContentFaq = { question?: string; answer?: string };
export interface ProductContentSections {
  overview?: { heading?: string; body?: string };
  vto?: { heading?: string; text?: string };
  frame_details?: { label?: string; value?: string }[];
  lens_options?: { brands?: string[]; note?: string };
  pd_measure?: { text?: string };
  progressive_guarantee?: { text?: string; note?: string };
  shipping_returns?: {
    text?: string;
    detail?: {
      shipping_heading?: string;
      shipping_body?: string;
      returns_heading?: string;
      returns_body?: string;
    };
  };
  faq?: ProductContentFaq[];
  reviews?: { note?: string };
  quote?: { text?: string; source?: string };
  ldProperties?: { name?: string; value?: string }[];
}
export interface ProductContent {
  seo?: {
    title?: string;
    description?: string;
    h1?: string;
    keywords?: string[];
  };
  sections?: ProductContentSections;
}
export type ProductContentMap = Record<string, ProductContent>;

export type ColorViewKey = "front" | "side" | "angle" | "folded" | "detail";
export type ColorViews = Record<ColorViewKey, string | null>;
const VIEW_KEYS: ColorViewKey[] = [
  "front",
  "side",
  "angle",
  "folded",
  "detail",
];

const parseViews = (s: string | null): ColorViews => {
  const raw = safeJsonObject(s);
  const out = {} as ColorViews;
  for (const k of VIEW_KEYS) {
    const v = raw[k];
    out[k] = typeof v === "string" && v.length > 0 ? v : null;
  }
  return out;
};

type ProductRow = {
  id: string;
  slug: string;
  product_kind: "eyeglasses" | "sunglasses" | "accessory";
  categories_json: string | null;
  styles_json: string | null;
  material: string | null;
  finish: string | null;
  shape: string | null;
  genders_json: string | null;
  name_json: string | null;
  intro_json: string | null;
  description_json: string | null;
  highlights_json: string | null;
  content_json: string | null;
  price_cents: number;
  original_price_cents: number | null;
  weight_g: number | null;
  rating: number;
  review_count: number;
  review_quality: number;
  review_fit: number;
  review_design: number;
  lens_width_mm: number | null;
  bridge_mm: number | null;
  temple_mm: number | null;
  is_new: number;
  bestseller: number;
  supports_reader: number;
  supports_single_vision: number;
  supports_progressive: number;
  supports_non_prescription: number;
  card_image_url: string | null;
  card_hover_image_url: string | null;
};

type ColorRow = {
  product_id: string;
  color_id: string;
  label_json: string | null;
  hex: string;
  color_family: string | null;
  images_json: string | null;
  views_json: string | null;
  tryon_image_url: string | null;
  tryon_model_url: string | null;
  sort_order: number;
};

export interface CatalogProduct {
  id: string;
  slug: string;
  productKind: string;
  categories: string[];
  styles: string[];
  material: string | null;
  finish: FinishId | null;
  shape: string | null;
  genders: string[];
  name: LangMap;
  intro: LangMap;
  description: LangMap;
  priceCents: number;
  originalPriceCents: number | null;
  weightG: number | null;
  rating: number;
  reviewCount: number;
  reviewQuality: number;
  reviewFit: number;
  reviewDesign: number;
  size: {
    lensWidth: number | null;
    bridge: number | null;
    temple: number | null;
  };
  isNew: boolean;
  bestseller: boolean;
  supportsReader: boolean;
  supportsSingleVision: boolean;
  supportsProgressive: boolean;
  supportsNonPrescription: boolean;
  cardImageUrl: string | null;
  cardHoverImageUrl: string | null;
  highlights: Record<string, string[]>;
  content: ProductContentMap | null;
  colors: {
    id: string;
    label: LangMap;
    hex: string;
    colorFamily: ColorFamilyId | null;
    images: string[];
    views: ColorViews;
    tryonImageUrl: string | null;
    tryonModelUrl: string | null;
  }[];
}

function mapProduct(p: ProductRow, colors: ColorRow[]): CatalogProduct {
  const highlightsRaw = parseLangJson(p.highlights_json) as Record<
    string,
    unknown
  >;
  const highlights: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(highlightsRaw)) {
    if (Array.isArray(v)) {
      highlights[k] = v.filter((x): x is string => typeof x === "string");
    }
  }
  return {
    id: p.id,
    slug: p.slug,
    productKind: p.product_kind,
    categories: safeJsonArray(p.categories_json) as string[],
    styles: safeJsonArray(p.styles_json) as string[],
    material: p.material,
    finish: (p.finish ?? null) as FinishId | null,
    shape: p.shape,
    genders: safeJsonArray(p.genders_json) as string[],
    name: parseLangJson(p.name_json),
    intro: parseLangJson(p.intro_json),
    description: parseLangJson(p.description_json),
    priceCents: p.price_cents,
    originalPriceCents: p.original_price_cents,
    weightG: p.weight_g,
    rating: p.rating,
    reviewCount: p.review_count,
    reviewQuality: p.review_quality,
    reviewFit: p.review_fit,
    reviewDesign: p.review_design,
    size: {
      lensWidth: p.lens_width_mm,
      bridge: p.bridge_mm,
      temple: p.temple_mm,
    },
    isNew: !!p.is_new,
    bestseller: !!p.bestseller,
    supportsReader: !!p.supports_reader,
    supportsSingleVision: !!p.supports_single_vision,
    supportsProgressive: !!p.supports_progressive,
    supportsNonPrescription: !!p.supports_non_prescription,
    cardImageUrl: p.card_image_url,
    cardHoverImageUrl: p.card_hover_image_url,
    highlights,
    content: parseContent(p.content_json),
    colors: colors.map((c) => {
      const images = safeJsonArray(c.images_json) as string[];
      const views = parseViews(c.views_json);
      return {
        id: c.color_id,
        label: parseLangJson(c.label_json),
        hex: c.hex,
        colorFamily: (c.color_family ?? null) as ColorFamilyId | null,
        images,
        views,
        tryonImageUrl: c.tryon_image_url ?? images[0] ?? null,
        tryonModelUrl: c.tryon_model_url ?? null,
      };
    }),
  };
}

const PRODUCT_COLS = `id, slug, product_kind, categories_json, styles_json, material, finish, shape, genders_json,
  name_json, intro_json, description_json, highlights_json, content_json,
  price_cents, original_price_cents, weight_g, rating, review_count,
  review_quality, review_fit, review_design,
  lens_width_mm, bridge_mm, temple_mm, is_new, bestseller,
  supports_reader, supports_single_vision, supports_progressive, supports_non_prescription,
  card_image_url, card_hover_image_url`;

const COLOR_COLS = `product_id, color_id, label_json, hex, color_family, images_json, views_json, tryon_image_url, tryon_model_url, sort_order`;

/** Load a single product by slug, with its colors. Returns null if not found. */
export async function loadProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  const db = getDB();
  const productRow = await db
    .prepare(
      `SELECT ${PRODUCT_COLS} FROM products WHERE slug = ? AND archived_at IS NULL LIMIT 1`,
    )
    .bind(slug)
    .first<ProductRow>();
  if (!productRow) return null;
  const colorsRes = await db
    .prepare(
      `SELECT ${COLOR_COLS} FROM product_colors WHERE product_id = ? ORDER BY sort_order, color_id`,
    )
    .bind(productRow.id)
    .all<ColorRow>();
  return mapProduct(productRow, colorsRes.results ?? []);
}

/** Load full catalog (every non-archived product + colors). */
export async function loadAllProducts(): Promise<CatalogProduct[]> {
  const db = getDB();
  const [pRes, cRes] = await Promise.all([
    db
      .prepare(
        `SELECT ${PRODUCT_COLS} FROM products WHERE archived_at IS NULL ORDER BY product_kind, id`,
      )
      .all<ProductRow>(),
    db
      .prepare(
        `SELECT ${COLOR_COLS} FROM product_colors ORDER BY product_id, sort_order`,
      )
      .all<ColorRow>(),
  ]);
  const colorsByProduct = new Map<string, ColorRow[]>();
  for (const c of cRes.results ?? []) {
    const arr = colorsByProduct.get(c.product_id) ?? [];
    arr.push(c);
    colorsByProduct.set(c.product_id, arr);
  }
  return (pRes.results ?? []).map((p) =>
    mapProduct(p, colorsByProduct.get(p.id) ?? []),
  );
}

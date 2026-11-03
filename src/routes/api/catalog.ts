// GET /api/catalog
// Returns the storefront product catalog: products + their color variants +
// a flat lens-SKU summary. Schema is v3 (lens_brands + lens_skus + suppliers).
// The wizard pulls richer lens metadata from /api/lens/skus separately.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangJson } from "@/lib/lang";

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
  highlights_json: string | null;
  intro_json: string | null;
  description_json: string | null;
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

type ColorViewKey = "front" | "side" | "angle" | "folded" | "detail";
const VIEW_KEYS: ColorViewKey[] = [
  "front",
  "side",
  "angle",
  "folded",
  "detail",
];

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

const parseViews = (s: string | null): Record<ColorViewKey, string | null> => {
  const raw = safeJsonObject(s);
  const out = {} as Record<ColorViewKey, string | null>;
  for (const k of VIEW_KEYS) {
    const v = raw[k];
    out[k] = typeof v === "string" && v.length > 0 ? v : null;
  }
  return out;
};

type LensSkuRow = {
  id: string;
  brand_id: string;
  prescription_type: string;
  refractive_index: number;
  base_function:
    | "clear"
    | "blue"
    | "photo"
    | "driving"
    | "tinted"
    | "polarized";
  function_variant: "base" | "blueUpgrade" | null;
  progressive_design: "standard" | "short" | null;
  progressive_view_area: "standard" | "broader" | null;
  lens_colors_json: string | null;
  retail_cents: number;
  recommended: number;
  sort_order: number;
};

const safeJsonArray = (s: string | null): unknown[] => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const [productsRes, colorsRes, skusRes] = await Promise.all([
          db
            .prepare(
              `SELECT id, slug, product_kind, categories_json, styles_json, material, finish, shape, genders_json,
                      name_json, price_cents, original_price_cents, weight_g,
                      rating, review_count, review_quality, review_fit, review_design,
                      lens_width_mm, bridge_mm, temple_mm,
                      is_new, bestseller,
                      supports_reader, supports_single_vision,
                      supports_progressive, supports_non_prescription,
                      highlights_json, intro_json, description_json,
                      card_image_url, card_hover_image_url
               FROM products WHERE archived_at IS NULL ORDER BY product_kind, id`,
            )
            .all<ProductRow>(),
          db
            .prepare(
              `SELECT product_id, color_id, label_json, hex, color_family,
                      images_json, views_json, tryon_image_url, tryon_model_url, sort_order
               FROM product_colors ORDER BY product_id, sort_order`,
            )
            .all<ColorRow>(),
          db
            .prepare(
              `SELECT id, brand_id, prescription_type, refractive_index,
                      base_function, function_variant, progressive_design,
                      progressive_view_area, lens_colors_json,
                      retail_cents, recommended, sort_order
               FROM lens_skus WHERE active = 1
               ORDER BY brand_id, prescription_type, sort_order, refractive_index`,
            )
            .all<LensSkuRow>(),
        ]);

        const colorsByProduct = new Map<string, ColorRow[]>();
        for (const c of colorsRes.results ?? []) {
          const arr = colorsByProduct.get(c.product_id) ?? [];
          arr.push(c);
          colorsByProduct.set(c.product_id, arr);
        }

        const products = (productsRes.results ?? []).map((p: ProductRow) => {
          const highlightsRaw = parseLangJson(p.highlights_json) as Record<
            string,
            unknown
          >;
          // highlights stored as {zh: [...], en: [...]} — preserve as-is.
          const highlights: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(highlightsRaw)) {
            if (Array.isArray(v)) {
              highlights[k] = v.filter(
                (x): x is string => typeof x === "string",
              );
            }
          }
          return {
            id: p.id,
            slug: p.slug,
            productKind: p.product_kind,
            categories: safeJsonArray(p.categories_json) as string[],
            styles: safeJsonArray(p.styles_json) as string[],
            material: p.material,
            finish: p.finish,
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
            colors: (colorsByProduct.get(p.id) ?? []).map((c) => {
              const images = safeJsonArray(c.images_json) as string[];
              const views = parseViews(c.views_json);
              return {
                id: c.color_id,
                label: parseLangJson(c.label_json),
                hex: c.hex,
                colorFamily: c.color_family,
                images,
                views,
                tryonImageUrl: c.tryon_image_url ?? images[0] ?? null,
                tryonModelUrl: c.tryon_model_url ?? null,
              };
            }),
          };
        });

        const lenses = (skusRes.results ?? []).map((s: LensSkuRow) => ({
          id: s.id,
          brandId: s.brand_id,
          prescriptionType: s.prescription_type,
          refractiveIndex: s.refractive_index,
          baseFunction: s.base_function,
          functionVariant: s.function_variant,
          progressiveDesign: s.progressive_design,
          progressiveViewArea: s.progressive_view_area,
          lensColors: safeJsonArray(s.lens_colors_json),
          retailCents: s.retail_cents,
          recommended: !!s.recommended,
        }));

        return Response.json(
          { products, lenses },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});

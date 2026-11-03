// GET /api/lens/skus
// Returns the lens catalog: brands + skus.
//
// Wizard axes:
//   step 1 prescription_type  →  sku.prescriptionType
//   step 2 prescription form  →  /api/prescriptions (separate)
//   step 3 base_function      →  sku.baseFunction (clear/blue/photo/driving/tinted/polarized)
//                                + functionVariant (base/blueUpgrade for photo)
//   step 4 refractive_index   →  sku.refractiveIndex
//   step 5 progressive        →  sku.progressiveDesign (standard/short) + progressiveViewArea (standard/broader)
//
// All money fields are USD cents. `supplier_costs_json` is NOT exposed.
// Lens addons / coatings used to live here but the concept was retired in
// 0053 — re-add a dedicated step (single-select, per-SKU) if we ever sell
// billable lens upgrades again.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangMapColumn } from "@/server/lang";

type BrandRow = {
  id: string;
  name_json: string | null;
  description_json: string | null;
  hero_img_url: string | null;
  tier: "budget" | "mainstream" | "premium" | "luxury" | null;
  sort_order: number;
};

type SkuRow = {
  id: string;
  brand_id: string;
  brand_line: string | null;
  prescription_type:
    | "single-vision"
    | "progressive"
    | "reading"
    | "non-prescription";
  base_function:
    | "clear"
    | "blue"
    | "photo"
    | "driving"
    | "tinted"
    | "polarized";
  function_variant: "base" | "blueUpgrade" | null;
  refractive_index: number;
  progressive_design: "standard" | "short" | null;
  progressive_view_area: "standard" | "broader" | null;
  lens_colors_json: string | null;
  retail_cents: number;
  display_name_json: string | null;
  description_json: string | null;
  hero_img_url: string | null;
  recommended: number;
  sph_min: number | null;
  sph_max: number | null;
  cyl_min: number | null;
  cyl_max: number | null;
  add_min: number | null;
  add_max: number | null;
  sort_order: number;
};

type LensColorOption = {
  id: string;
  label: Record<string, string>;
  hex: string;
};

function parseLensColors(raw: string | null): LensColorOption[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return null;
    const out: LensColorOption[] = [];
    for (const item of v) {
      if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.hex === "string"
      ) {
        out.push({
          id: item.id,
          label: item.label && typeof item.label === "object" ? item.label : {},
          hex: item.hex,
        });
      }
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/lens/skus")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();

        const [brandsRes, skusRes] = await Promise.all([
          db
            .prepare(
              "SELECT id, name_json, description_json, hero_img_url, tier, sort_order FROM lens_brands WHERE active = 1 ORDER BY sort_order, id",
            )
            .all<BrandRow>(),
          db
            .prepare(
              `SELECT id, brand_id, brand_line, prescription_type, base_function,
                      function_variant, refractive_index, progressive_design,
                      progressive_view_area, lens_colors_json,
                      retail_cents, display_name_json, description_json,
                      hero_img_url, recommended,
                      sph_min, sph_max, cyl_min, cyl_max, add_min, add_max, sort_order
               FROM lens_skus
               WHERE active = 1
               ORDER BY brand_id, prescription_type, sort_order, refractive_index`,
            )
            .all<SkuRow>(),
        ]);

        const brands = (brandsRes.results ?? []).map((b: BrandRow) => ({
          id: b.id,
          name: parseLangMapColumn(b.name_json),
          description: parseLangMapColumn(b.description_json),
          heroImgUrl: b.hero_img_url,
          tier: b.tier,
          sortOrder: b.sort_order,
        }));

        const skus = (skusRes.results ?? []).map((s: SkuRow) => ({
          id: s.id,
          brandId: s.brand_id,
          brandLine: s.brand_line,
          prescriptionType: s.prescription_type,
          baseFunction: s.base_function,
          functionVariant: s.function_variant,
          refractiveIndex: s.refractive_index,
          progressiveDesign: s.progressive_design,
          progressiveViewArea: s.progressive_view_area,
          lensColors: parseLensColors(s.lens_colors_json),
          retailCents: s.retail_cents,
          displayName: parseLangMapColumn(s.display_name_json),
          description: parseLangMapColumn(s.description_json),
          heroImgUrl: s.hero_img_url,
          recommended: !!s.recommended,
          rxRange: {
            sphMin: s.sph_min,
            sphMax: s.sph_max,
            cylMin: s.cyl_min,
            cylMax: s.cyl_max,
            addMin: s.add_min,
            addMax: s.add_max,
          },
          sortOrder: s.sort_order,
        }));

        return Response.json(
          { brands, skus },
          {
            headers: {
              "Cache-Control": "public, max-age=60, s-maxage=300",
            },
          },
        );
      },
    },
  },
});

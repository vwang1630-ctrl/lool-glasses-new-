// Shared client hook: fetches /api/catalog once and adapts the response into
// the legacy `Product` shape consumed by the storefront pages.
//
// Renders an empty list while loading; catches and logs network errors.

import { useEffect, useState } from "react";
import type { ColorViews, Product } from "@/data/products";

interface ApiColor {
  id: string;
  label: Record<string, string>;
  hex: string;
  images: string[];
  views?: ColorViews;
  tryonImageUrl: string | null;
  tryonModelUrl: string | null;
}
interface ApiProduct {
  id: string;
  slug: string;
  productKind: string;
  categories: string[];
  styles: string[];
  material: string | null;
  shape: string | null;
  genders: string[];
  name: Record<string, string>;
  intro?: Record<string, string>;
  description?: Record<string, string>;
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
  supportsReader?: boolean;
  supportsSingleVision?: boolean;
  supportsProgressive?: boolean;
  supportsNonPrescription?: boolean;
  cardImageUrl?: string | null;
  cardHoverImageUrl?: string | null;
  highlights: Record<string, string[]>;
  colors: ApiColor[];
}

export function adaptProduct(p: ApiProduct): Product {
  const colors = p.colors.map((c) => ({
    id: c.id,
    label: c.label,
    hex: c.hex,
    images: c.images.length > 0 ? c.images : [""],
    views: c.views,
    tryonImageUrl: c.tryonImageUrl ?? c.images[0] ?? null,
    tryonModelUrl: c.tryonModelUrl ?? null,
  }));
  const framePng = colors[0]?.images[0] ?? "";
  const heroImg = framePng;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categories: (p.categories ?? []).filter(
      (c): c is "presbyopia" | "myopia" => c === "presbyopia" || c === "myopia",
    ) as Product["categories"],
    fashion: true,
    styles: (p.styles ?? []).filter(
      (s): s is "minimal" | "business" | "character" | "classic" =>
        s === "minimal" ||
        s === "business" ||
        s === "character" ||
        s === "classic",
    ) as Product["styles"],
    material: (p.material ?? "acetate").toLowerCase() as Product["material"],
    shape: (p.shape ?? "round")
      .toLowerCase()
      .replace(/\s+/g, "") as Product["shape"],
    genders: (p.genders.length ? p.genders : ["unisex"]) as Product["genders"],
    priceUSD: Math.round(p.priceCents / 100),
    originalPriceUSD:
      p.originalPriceCents != null
        ? Math.round(p.originalPriceCents / 100)
        : undefined,
    weightG: p.weightG ?? undefined,
    colors,
    rating: p.rating,
    reviewCount: p.reviewCount,
    reviewQuality: p.reviewQuality,
    reviewFit: p.reviewFit,
    reviewDesign: p.reviewDesign,
    highlights: p.highlights,
    size: {
      lensWidth: p.size.lensWidth ?? 0,
      bridge: p.size.bridge ?? 0,
      temple: p.size.temple ?? 0,
    },
    framePng,
    hero: heroImg,
    cardImageUrl: p.cardImageUrl ?? null,
    cardHoverImageUrl: p.cardHoverImageUrl ?? null,
    isNew: p.isNew,
    bestseller: p.bestseller,
    supportsReader: p.supportsReader ?? true,
    supportsSingleVision: p.supportsSingleVision ?? true,
    supportsProgressive: p.supportsProgressive ?? false,
    supportsNonPrescription: p.supportsNonPrescription ?? true,
  };
}

export function useCatalogProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/catalog", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { products: ApiProduct[] }) => {
        if (alive) setProducts(d.products.map(adaptProduct));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return products;
}

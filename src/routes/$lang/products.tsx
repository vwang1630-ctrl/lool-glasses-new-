import { createFileRoute } from "@tanstack/react-router";
import {
  ProductListPage,
  type PreselectFilters,
} from "@/components/product/ProductListPage";

const SORT_VALUES = [
  "popular",
  "new",
  "priceAsc",
  "priceDesc",
  "fashion",
] as const;
type SortValue = (typeof SORT_VALUES)[number];

export const Route = createFileRoute("/$lang/products")({
  validateSearch: (s: Record<string, unknown>): PreselectFilters => ({
    shape: typeof s.shape === "string" ? s.shape : undefined,
    material: typeof s.material === "string" ? s.material : undefined,
    style: typeof s.style === "string" ? s.style : undefined,
    color: typeof s.color === "string" ? s.color : undefined,
    sort:
      typeof s.sort === "string" &&
      (SORT_VALUES as readonly string[]).includes(s.sort)
        ? (s.sort as SortValue)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "lool — All Products" },
      {
        name: "description",
        content:
          "Browse the full lool collection — modern fashion readers and everyday eyeglasses, professionally crafted with pro-grade lenses and free tracked shipping on orders over $69.",
      },
      { property: "og:title", content: "All Products — lool" },
      {
        property: "og:description",
        content:
          "Reading glasses & everyday eyewear, redesigned. Pro lenses, fair prices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "All Products — lool" },
      {
        name: "twitter:description",
        content:
          "Reading glasses & everyday eyewear, redesigned. Pro lenses, fair prices.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  return <ProductListPage category="all" preselect={search} />;
}

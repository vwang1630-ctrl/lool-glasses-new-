import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
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
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("products", params.lang) },
      {
        name: "description",
        content:
          pageDesc("products", params.lang),
      },
      { property: "og:title", content: pageTitle("products", params.lang) },
      {
        property: "og:description",
        content:
          pageOgDesc("products", params.lang),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: pageTitle("products", params.lang) },
      {
        name: "twitter:description",
        content:
          pageOgDesc("products", params.lang),
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  return <ProductListPage category="all" preselect={search} />;
}

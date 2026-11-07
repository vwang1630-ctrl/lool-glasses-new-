import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import {
  ProductListPage,
  type PreselectFilters,
} from "@/components/product/ProductListPage";

export const Route = createFileRoute("/$lang/myopia")({
  validateSearch: (s: Record<string, unknown>): PreselectFilters => ({
    shape: typeof s.shape === "string" ? s.shape : undefined,
    material: typeof s.material === "string" ? s.material : undefined,
    style: typeof s.style === "string" ? s.style : undefined,
    color: typeof s.color === "string" ? s.color : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("myopia", params.lang) },
      {
        name: "description",
        content:
          pageDesc("myopia", params.lang),
      },
      { property: "og:title", content: pageTitle("myopia", params.lang) },
      {
        property: "og:description",
        content:
          pageOgDesc("myopia", params.lang),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: pageTitle("myopia", params.lang) },
      {
        name: "twitter:description",
        content:
          pageOgDesc("myopia", params.lang),
      },
    ],
  }),
  component: MyopiaPage,
});

function MyopiaPage() {
  const search = Route.useSearch();
  return <ProductListPage category="myopia" preselect={search} />;
}

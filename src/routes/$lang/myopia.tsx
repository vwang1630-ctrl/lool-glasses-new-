import { createFileRoute } from "@tanstack/react-router";
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
  head: () => ({
    meta: [
      { title: "lool — Everyday Eyeglasses" },
      {
        name: "description",
        content:
          "lool everyday eyeglasses: blue-light protection, ultra-thin lenses, and teen myopia-control frames. Beautifully crafted, professionally fitted.",
      },
      { property: "og:title", content: "Everyday Eyeglasses — lool" },
      {
        property: "og:description",
        content:
          "Blue-light, ultra-thin and teen myopia-control glasses, beautifully made.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Everyday Eyeglasses — lool" },
      {
        name: "twitter:description",
        content:
          "Blue-light, ultra-thin and teen myopia-control glasses, beautifully made.",
      },
    ],
  }),
  component: MyopiaPage,
});

function MyopiaPage() {
  const search = Route.useSearch();
  return <ProductListPage category="myopia" preselect={search} />;
}

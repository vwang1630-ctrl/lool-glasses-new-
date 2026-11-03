import { createFileRoute } from "@tanstack/react-router";
import {
  ProductListPage,
  type PreselectFilters,
} from "@/components/product/ProductListPage";

export const Route = createFileRoute("/$lang/presbyopia")({
  validateSearch: (s: Record<string, unknown>): PreselectFilters => ({
    shape: typeof s.shape === "string" ? s.shape : undefined,
    material: typeof s.material === "string" ? s.material : undefined,
    style: typeof s.style === "string" ? s.style : undefined,
    color: typeof s.color === "string" ? s.color : undefined,
  }),
  head: () => ({
    meta: [
      { title: "lool — Modern Reading Glasses" },
      {
        name: "description",
        content:
          "lool modern reading glasses — ageless designs for the 45–60 generation. Lightweight frames in minimal, business, and statement styles. Pro-grade lenses, fair prices.",
      },
      { property: "og:title", content: "Modern Reading Glasses — lool" },
      {
        property: "og:description",
        content: "Ageless reading glasses for the modern 45–60 generation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Modern Reading Glasses — lool" },
      {
        name: "twitter:description",
        content: "Ageless reading glasses for the modern 45–60 generation.",
      },
    ],
  }),
  component: PresbyopiaPage,
});

function PresbyopiaPage() {
  const search = Route.useSearch();
  return <ProductListPage category="presbyopia" preselect={search} />;
}

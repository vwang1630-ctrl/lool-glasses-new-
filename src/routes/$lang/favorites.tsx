import { createFileRoute, Link } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { useI18n } from "@/lib/i18n";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/$lang/favorites")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("favorites", params.lang) },
      {
        name: "description",
        content: pageDesc("favorites", params.lang),
      },
      { name: "twitter:description", content: pageOgDesc("favorites", params.lang) },
      { property: "og:title", content: pageTitle("favorites", params.lang) },
      { property: "og:description", content: pageOgDesc("favorites", params.lang) },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useI18n();
  const { ids } = useFavorites();
  const products = useCatalogProducts();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div>
      <section className="page-hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-10 md:pt-14 md:pb-12">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary fill-primary/20" />
            <h1 className="section-title">{t("favorites.title")}</h1>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-6 py-20 text-center">
            <p className="text-muted-foreground">{t("favorites.empty")}</p>
            <Button asChild className="mt-6 rounded-full px-7 h-11 shadow-soft">
              <Link to="/products">{t("favorites.emptyCta")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

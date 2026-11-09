// SSR catalog for listing pages (/products, /presbyopia, /myopia).
// Route loaders call this so the initial HTML already contains every product
// card + its /product/<slug> link — search and AI crawlers (most of which do
// not run JS) can then discover PDPs. The handler body is server-only
// (createServerFn strips it from the client bundle).

import { createServerFn } from "@tanstack/react-start";

export const fetchCatalogList = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { loadAllProducts } = await import("@/server/catalog-loader");
      const all = await loadAllProducts();
      // Drop the heavy per-language PDP copy — listing cards don't need it and
      // it would bloat the dehydrated loader payload in every listing page.
      return all.map(
        ({ content: _c, intro: _i, description: _d, ...rest }) => rest,
      );
    } catch (err) {
      console.error("[catalog-ssr] load failed:", err);
      return [];
    }
  },
);

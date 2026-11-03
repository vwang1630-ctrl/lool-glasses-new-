// Wrapper around TanStack Link that auto-prefixes the current language to
// any unprefixed path. Drop-in replacement for shared components (Header,
// Footer, NavMegaMenu, ProductCard) so a Chinese user clicking "Products"
// from /zh/blog goes to /zh/products — not /en/products via the splat
// redirect (which would silently switch their language).
//
// Usage: <LangLink to="/products">All Products</LangLink>
//
// Internally rewrites to <Link to="/${lang}/products"> and bypasses the
// typed-route check via `as never`. TanStack's runtime handles the typed
// route correctly because /$lang/products exists in routeTree.gen.ts.

import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { langFromPath, type Lang } from "@/lib/i18n";
import { forwardRef, type ReactNode } from "react";

type LangLinkProps = Omit<LinkProps, "to" | "params"> & {
  to: string;
  children?: ReactNode;
  className?: string;
};

export const LangLink = forwardRef<HTMLAnchorElement, LangLinkProps>(
  function LangLink({ to, ...rest }, ref) {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const currentLang: Lang = langFromPath(pathname) ?? "en";

    let target = to;
    if (typeof to === "string" && to.startsWith("/")) {
      const alreadyPrefixed = /^\/[a-z]{2}(\/|$)/.test(to);
      if (!alreadyPrefixed) {
        target = to === "/" ? `/${currentLang}` : `/${currentLang}${to}`;
      }
    }

    return <Link ref={ref} to={target as never} {...rest} />;
  },
);

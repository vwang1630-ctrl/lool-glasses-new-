// Layout route for /$lang/* children. Validates the lang segment so URLs
// like /products (which superficially matches $lang=products) get redirected
// to /en/products with the correct prefix.
//
// Without this validation, $lang is a wildcard and would intercept ANY
// single-segment URL — /products would match $lang/index with lang="products".

import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { SUPPORTED_LANG_CODES } from "@/lib/i18n";

const SITE = "https://loollook.com";

function suffixFromLocation(location: { searchStr?: string; hash?: string }) {
  const search = location.searchStr
    ? location.searchStr.startsWith("?")
      ? location.searchStr
      : `?${location.searchStr}`
    : "";
  const hash = location.hash
    ? location.hash.startsWith("#")
      ? location.hash
      : `#${location.hash}`
    : "";
  return `${search}${hash}`;
}

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params, location }) => {
    // First segment is admin / api / static — these are not language-aware
    // routes. Don't redirect; the splat ($.tsx) will handle them or they'll
    // 404 cleanly. Without this guard, /admin/products would redirect to
    // /en/admin/products and loop forever.
    if (
      params.lang === "admin" ||
      params.lang === "api" ||
      params.lang === "sitemap.xml" ||
      params.lang === "robots.txt" ||
      params.lang === "llms.txt"
    ) {
      // Redirect /admin/* to /admin (the only existing admin route at the
      // moment); for api/static reaching here something else is wrong, send
      // them home so they don't loop.
      const target = params.lang === "admin" ? "/admin" : "/";
      throw redirect({
        href: `${target}${suffixFromLocation(location)}`,
        replace: true,
      });
    }
    if (!(SUPPORTED_LANG_CODES as readonly string[]).includes(params.lang)) {
      // The matched "$lang" segment is actually a content segment (e.g.
      // "products"). Re-route to /en/<full-path> so the real $lang/products
      // route can match. Replace so the bad URL doesn't pollute history.
      const target = `/en${location.pathname}`;
      throw redirect({
        href: `${target}${suffixFromLocation(location)}`,
        replace: true,
      });
    }
  },
  component: LangLayout,
});

/** Renders <link rel="canonical"> + <link rel="alternate"> for every
 * supported lang + <meta property="og:url"> for current page.
 *
 * Per-route head() functions don't need to set canonical or og:url — this
 * layout handles them uniformly using the current URL pathname. React 19
 * head hoisting moves these <link>/<meta> elements into <head> at SSR
 * regardless of where they render in the tree.
 *
 * Why this matters: without a self-canonical (and with the wrong canonical),
 * AI/search crawlers dedup the 10 language versions into one URL, defeating
 * the entire purpose of the multilingual URL structure. */
function LangLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Strip the lang prefix to get the suffix (e.g. /en/products → /products).
  const suffix = pathname.replace(/^\/[a-z]{2}/, "") || "/";
  const canonical = `${SITE}${pathname}`;
  return (
    <>
      {/* PWA manifest is only advertised on customer-facing pages so Chrome
          doesn't try to install /admin or /tracker tool pages as a PWA. */}
      <link rel="manifest" href="/manifest.webmanifest" />
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      {SUPPORTED_LANG_CODES.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${SITE}/${l}${suffix === "/" ? "/" : suffix}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE}/en${suffix === "/" ? "/" : suffix}`}
      />
      <Outlet />
    </>
  );
}

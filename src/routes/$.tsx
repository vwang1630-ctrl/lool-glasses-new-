// Catch-all splat route. Any unmatched URL (e.g. /products, /help, /blog —
// all the legacy unprefixed URLs from before Phase E) lands here and gets
// redirected to its language-prefixed equivalent.
//
// Language detection priority:
//   1. cookie "lool-lang" (if user previously picked a language)
//   2. Accept-Language header (best-match against our 10 supported langs)
//   3. fallback to "en"
//
// API routes (/api/*), admin (/admin/*), and crawler files (/sitemap.xml,
// /robots.txt, /llms.txt) have their own explicit routes and never reach here.

import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { SUPPORTED_LANG_CODES, type Lang } from "@/lib/i18n";

function pickLangFromAcceptLanguage(header: string | null | undefined): Lang {
  if (!header) return "en";
  const ranges = header
    .split(",")
    .map((s) => s.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);
  for (const range of ranges) {
    const primary = range.split("-")[0];
    if (
      primary &&
      (SUPPORTED_LANG_CODES as readonly string[]).includes(primary)
    ) {
      return primary as Lang;
    }
  }
  return "en";
}

function pickLangFromCookie(
  cookieHeader: string | null | undefined,
): Lang | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)lool-lang=([^;]+)/);
  if (!match) return null;
  const v = decodeURIComponent(match[1]);
  return (SUPPORTED_LANG_CODES as readonly string[]).includes(v)
    ? (v as Lang)
    : null;
}

// Server reads the incoming request's cookie + Accept-Language via TanStack
// Start's request context. Client falls back to navigator.languages.
// createIsomorphicFn lets the Start compiler strip the unused half per
// bundle so the server-only getRequestHeader import is tree-shaken from
// the client bundle (and import-protection passes).
const detectLang = createIsomorphicFn()
  .server((): Lang => {
    try {
      const cookieLang = pickLangFromCookie(getRequestHeader("cookie"));
      if (cookieLang) return cookieLang;
      return pickLangFromAcceptLanguage(getRequestHeader("accept-language"));
    } catch {
      return "en";
    }
  })
  .client((): Lang => {
    if (typeof navigator === "undefined") return "en";
    return pickLangFromAcceptLanguage(
      navigator.languages?.join(",") ?? navigator.language,
    );
  });

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

export const Route = createFileRoute("/$")({
  beforeLoad: ({ location }) => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const suffix = suffixFromLocation(location);

    // Guard 1: paths that should NEVER get a /$lang prefix (admin, API,
    // crawler files). If they reach the splat (because the matching route
    // file doesn't exist yet), redirect to the admin dashboard rather than
    // entering a lang-prefix loop.
    if (
      path === "/admin" ||
      path.startsWith("/admin/") ||
      path.startsWith("/api/") ||
      path === "/sitemap.xml" ||
      path === "/robots.txt" ||
      path === "/llms.txt"
    ) {
      throw redirect({ href: "/admin", replace: true });
    }

    // Guard 2: path already starts with a valid lang prefix (e.g. /en/foo).
    // Falling through to the splat means the expected $lang/foo route is
    // missing — don't recursively re-prefix (that's how /en/en/en/... was
    // produced). Render a real 404 (status 404) rather than bouncing to the
    // home page, which search engines flag as a "soft 404".
    const firstSeg = path.split("/").filter(Boolean)[0] ?? "";
    if ((SUPPORTED_LANG_CODES as readonly string[]).includes(firstSeg)) {
      throw notFound();
    }

    const lang = detectLang();
    const target = path === "/" ? `/${lang}/` : `/${lang}${path}`;
    throw redirect({ href: `${target}${suffix}`, replace: true });
  },
  component: () => null,
});

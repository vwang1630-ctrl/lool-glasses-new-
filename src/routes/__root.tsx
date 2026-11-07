import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { I18nProvider, LANGUAGES, langFromPath, useI18n } from "@/lib/i18n";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { I18nVerifier } from "@/components/dev/I18nVerifier";
import { JsonLd, ORGANIZATION_SCHEMA, websiteSchema } from "@/lib/jsonld";
import { GA4_TAG, OG_IMAGE } from "@/lib/operator";
import { useNoRubberBand } from "@/lib/use-no-rubber-band";
import { ChatWidget } from "@/components/chat/ChatWidget";
import {
  ensureCustomerClientId,
  getCustomerClientId,
  trackCustomerPageView,
} from "@/lib/customer-audit";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, interactive-widget=resizes-content",
      },
      { title: "lool — Ageless Fashion Readers & Eyeglasses" },
      {
        name: "description",
        content:
          "See clearly, agelessly. Fashion readers and everyday eyeglasses for the 45–60 generation — direct-to-consumer with pro-grade lenses, virtual try-on, free tracked shipping over $69.",
      },
      {
        name: "keywords",
        content:
          "fashion readers, ageless reading glasses, eyeglasses for 45+, TR90 readers, fashion cheaters",
      },
      { name: "author", content: "lool" },
      // PWA — Android status bar + Apple iOS standalone-mode chrome.
      { name: "theme-color", content: "#5C3A21" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "lool" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      {
        property: "og:title",
        content: "lool — Ageless Fashion Readers & Eyeglasses",
      },
      {
        property: "og:description",
        content:
          "See clearly, agelessly. Fashion readers and everyday eyeglasses for the 45–60 generation, direct from lool.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@lool" },
      {
        name: "twitter:title",
        content: "lool — Ageless Fashion Readers & Eyeglasses",
      },
      {
        name: "twitter:description",
        content:
          "See clearly, agelessly. Fashion readers and everyday eyeglasses for the 45–60 generation, direct from lool.",
      },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    scripts: [
      // GA4 — loollook's own property (GA4_TAG in src/lib/operator).
      // <head> snippet is the standard gtag bootstrap; the async loader keeps
      // first paint unblocked.
      {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${GA4_TAG}`,
      },
      {
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4_TAG}');`,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "sitemap",
        type: "application/xml",
        href: "https://loollook.com/sitemap.xml",
      },
      // PWA manifest is advertised only on customer-facing pages (see
      // $lang.tsx). Internal tools (/admin, /tracker) deliberately don't link
      // the manifest, so Chrome doesn't treat their pages as installable and
      // doesn't pop the install prompt when e.g. opening a print-in-new-tab
      // link from the tracker workbench.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // Set <html lang> + dir from the URL's $lang prefix so SSR'd HTML matches the
  // content language. Without this, the browser sees lang="en" while the page
  // is rendered in zh/ja/ar/etc and offers to auto-translate — which produces
  // garbage (e.g. "your next favorite pair" → "你下一条最爱的鞋子").
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const urlLang = langFromPath(pathname);
  const lang = urlLang ?? "en";
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
  return (
    <html lang={lang} dir={dir}>
      <head>
        {/* The site ships its own 10-language translations; tell browser
            translators to leave the page alone. */}
        <meta name="google" content="notranslate" />
        <meta name="google-site-verification" content="HMDcVCRC537k-h967yycmrGPYDX7-Png0eUXRpeIwwA" />
        <HeadContent />
        {/* Site-wide schema.org structured data for AI search engines */}
        <JsonLd schema={ORGANIZATION_SCHEMA} />
        <JsonLd schema={websiteSchema(lang)} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Affiliate attribution: when any URL on the site carries ?ref=<slug>, stash
// it in localStorage so the slug is recoverable at order-creation time even
// if the user navigates away (or comes back days later) before checking out.
// Encoded as `<slug>.<writtenMs>` so the order endpoint can record the actual
// click time for audit instead of the order timestamp.
//
// Why localStorage instead of a cookie: cookies are silently capped at ~400
// days by Chrome/Firefox, and the owner wants attribution to never expire.
// localStorage has no lifetime cap. At checkout, the client reads this value
// and passes it in the POST /api/orders body (server-side fallback to the
// old `lool_ref` cookie still exists for users whose attribution was set
// before this change).
//
// Last-click wins by design — each fresh ?ref= overwrites the prior value.
export const REF_STORAGE_KEY = "lool_ref";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RefInfo = {
  slug?: string;
  writtenAt?: number;
  discountPercent?: number;
};

function refStorageValue(slug: string, writtenAt = Date.now()) {
  return `${encodeURIComponent(slug.slice(0, 64))}.${writtenAt}`;
}

function removeRefFromCurrentUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("ref")) return;
  url.searchParams.delete("ref");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

function isHomePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === "/" ||
    LANGUAGES.some((lang) => normalized === `/${lang.code}`)
  );
}

function RefCodeWriter() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const [initialPath] = useState(pathname);
  const [discount, setDiscount] = useState<{
    slug: string;
    percent: number;
  } | null>(null);
  const [captureVisible, setCaptureVisible] = useState(false);
  const [captureStage, setCaptureStage] = useState<"email" | "code">("email");
  const [captureEmail, setCaptureEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [captureCode, setCaptureCode] = useState("");
  const [captureBusy, setCaptureBusy] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [naturalEmail, setNaturalEmail] = useState<string | null>(null);

  const applyRefInfo = (data: RefInfo) => {
    if (!data.slug || !data.discountPercent || data.discountPercent <= 0)
      return false;
    setDiscount({ slug: data.slug, percent: data.discountPercent });
    setCaptureVisible(false);
    setNaturalEmail(null);
    setCaptureError(null);
    return true;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const showAccountRefOrCapture = () => {
      fetch("/api/account/me")
        .then(async (res) => {
          if (res.status === 401) {
            setCaptureVisible(true);
            return;
          }
          if (!res.ok) return;
          const data = (await res.json()) as {
            email?: string;
            affiliateRef?: RefInfo | null;
          };
          if (data.affiliateRef?.slug) {
            try {
              window.localStorage.setItem(
                REF_STORAGE_KEY,
                refStorageValue(
                  data.affiliateRef.slug,
                  data.affiliateRef.writtenAt,
                ),
              );
            } catch {
              /* localStorage may be unavailable */
            }
            applyRefInfo(data.affiliateRef);
            return;
          }
          if (data.email) setNaturalEmail(data.email);
        })
        .catch(() => {});
    };
    const validateStoredRef = (value: string) => {
      fetch(`/api/affiliate/ref-info?ref=${encodeURIComponent(value)}`)
        .then(async (res) => {
          if (!res.ok) {
            window.localStorage.removeItem(REF_STORAGE_KEY);
            showAccountRefOrCapture();
            return;
          }
          showAccountRefOrCapture();
        })
        .catch(() => {});
    };
    const params = new URLSearchParams(searchStr || "");
    const ref = params.get("ref");
    try {
      if (!ref) {
        if (!isHomePath(initialPath)) return;
        const existing = window.localStorage.getItem(REF_STORAGE_KEY);
        if (existing) validateStoredRef(existing);
        else showAccountRefOrCapture();
        return;
      }
      const value = refStorageValue(ref);
      window.localStorage.setItem(REF_STORAGE_KEY, value);
      removeRefFromCurrentUrl();
      showAccountRefOrCapture();
    } catch {
      // Private mode / quota-full / disabled — silently skip; the user just
      // doesn't get attribution, which is the same as if they'd never clicked.
    }
  }, [initialPath, searchStr]);

  const requestCaptureCode = async (e: FormEvent) => {
    e.preventDefault();
    const email = captureEmail.trim().toLowerCase();
    setCaptureError(null);
    if (!EMAIL_RE.test(email)) {
      setCaptureError(t("refDiscount.capture.error.email"));
      return;
    }
    setCaptureBusy(true);
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "lookup_order" }),
      });
      if (!res.ok) {
        setCaptureError(t("refDiscount.capture.error.send"));
        return;
      }
      setSentEmail(email);
      setCaptureStage("code");
    } catch {
      setCaptureError(t("refDiscount.capture.error.network"));
    } finally {
      setCaptureBusy(false);
    }
  };

  const verifyCaptureCode = async (e: FormEvent) => {
    e.preventDefault();
    const code = captureCode.trim();
    setCaptureError(null);
    if (!/^\d{6}$/.test(code)) {
      setCaptureError(t("refDiscount.capture.error.code"));
      return;
    }
    setCaptureBusy(true);
    try {
      let ref: string | undefined;
      try {
        ref = window.localStorage.getItem(REF_STORAGE_KEY) ?? undefined;
      } catch {
        /* localStorage may be unavailable */
      }
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sentEmail,
          purpose: "lookup_order",
          code,
          ref,
          clientId: getCustomerClientId(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        affiliateRef?: RefInfo | null;
      };
      if (!res.ok || !data.ok) {
        setCaptureError(t("refDiscount.capture.error.code"));
        return;
      }
      if (data.affiliateRef?.slug) {
        try {
          window.localStorage.setItem(
            REF_STORAGE_KEY,
            refStorageValue(
              data.affiliateRef.slug,
              data.affiliateRef.writtenAt,
            ),
          );
        } catch {
          /* localStorage may be unavailable */
        }
      }
      if (!applyRefInfo(data.affiliateRef ?? {})) {
        setCaptureVisible(false);
        setNaturalEmail(sentEmail);
      }
    } catch {
      setCaptureError(t("refDiscount.capture.error.network"));
    } finally {
      setCaptureBusy(false);
    }
  };

  if (!discount && !captureVisible && !naturalEmail) return null;
  if (captureVisible && !discount) {
    // Mobile keyboard collapses the visual viewport — a corner toast then
    // competes with the hero/page content for that thin remaining strip and
    // looks cramped. So on mobile we render a backdrop + bottom sheet: the
    // page dims out, the sheet anchors above the keyboard, and the form gets
    // proper breathing room. On sm+ keep the centered floating card.
    return (
      <div className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4">
        <div className="w-full rounded-t-3xl border-x border-t border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card sm:max-w-md sm:rounded-2xl sm:border sm:p-4 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium sm:text-sm">
                {t("refDiscount.capture.title")}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("refDiscount.capture.body")}
              </p>
              {captureStage === "email" ? (
                <form
                  onSubmit={requestCaptureCode}
                  className="mt-4 flex flex-col gap-2.5 sm:mt-3 sm:flex-row sm:gap-2"
                >
                  <input
                    type="email"
                    value={captureEmail}
                    onChange={(e) => setCaptureEmail(e.target.value)}
                    placeholder={t("refDiscount.capture.emailPlaceholder")}
                    className="h-14 min-h-14 min-w-0 flex-1 appearance-none rounded-full border border-input bg-background px-5 py-3 text-lg outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 sm:h-10 sm:min-h-10 sm:px-3 sm:py-2 sm:text-sm"
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={captureBusy}
                    className="h-14 rounded-full bg-primary px-5 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:h-10 sm:px-4 sm:text-sm"
                  >
                    {captureBusy
                      ? t("refDiscount.capture.sending")
                      : t("refDiscount.capture.send")}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={verifyCaptureCode}
                  className="mt-4 flex flex-col gap-2.5 sm:mt-3 sm:flex-row sm:gap-2"
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={captureCode}
                    onChange={(e) =>
                      setCaptureCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="h-14 min-h-14 min-w-0 flex-1 appearance-none rounded-full border border-input bg-background px-5 py-3 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 sm:h-10 sm:min-h-10 sm:px-3 sm:py-2 sm:text-sm sm:tracking-[0.25em]"
                    autoComplete="one-time-code"
                  />
                  <button
                    type="submit"
                    disabled={captureBusy || captureCode.length !== 6}
                    className="h-14 rounded-full bg-primary px-5 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:h-10 sm:px-4 sm:text-sm"
                  >
                    {captureBusy
                      ? t("refDiscount.capture.verifying")
                      : t("refDiscount.capture.verify")}
                  </button>
                </form>
              )}
              {captureStage === "code" && (
                <p className="mt-3 text-xs text-muted-foreground sm:mt-2">
                  {t("refDiscount.capture.sent").replace("{email}", sentEmail)}
                </p>
              )}
              {captureError && (
                <p className="mt-2 text-xs text-destructive">{captureError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCaptureVisible(false)}
              className="-mr-1 -mt-1 rounded-full p-2 text-base text-muted-foreground hover:bg-secondary hover:text-foreground sm:p-1 sm:text-sm"
              aria-label={t("refDiscount.capture.dismiss")}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (naturalEmail && !discount) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{t("refDiscount.natural.title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("refDiscount.natural.body").replace("{email}", naturalEmail)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNaturalEmail(null)}
            className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={t("refDiscount.natural.dismiss")}
          >
            ×
          </button>
        </div>
      </div>
    );
  }
  const percent =
    discount?.percent.toFixed(discount.percent % 1 === 0 ? 0 : 1) ?? "";
  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{t("refDiscount.title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("refDiscount.body").replace("{percent}", percent)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDiscount(null)}
          className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={t("refDiscount.dismiss")}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function CustomerAuditTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    ensureCustomerClientId();
  }, []);

  useEffect(() => {
    trackCustomerPageView(pathname, searchStr || "");
  }, [pathname, searchStr]);

  return null;
}

function RootComponent() {
  useNoRubberBand();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isTracker = pathname === "/tracker" || pathname.startsWith("/tracker/");
  const isAffiliatePortal =
    pathname === "/affiliate" || pathname.startsWith("/affiliate/");
  // Internal tool pages (admin, tracker, affiliate portal) skip the customer Header/Footer.
  // Side-effect we rely on: the customer Footer is what calls usePwaInstall
  // (registers the SW + listens for beforeinstallprompt). Keeping it off
  // these pages — together with not linking the manifest from them — means
  // Chrome never decides the tracker/admin pages are installable, so opening
  // a /tracker/.../print/... link in a new tab doesn't pop the PWA install
  // prompt.
  if (isAdmin || isTracker || isAffiliatePortal) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }
  return (
    <I18nProvider>
      <FavoritesProvider>
        <CartProvider>
          <CustomerAuditTracker />
          <RefCodeWriter />
          <div className="min-h-screen flex flex-col">
            <Header />
            {/* Spacer reserves room for the fixed Header so page content
                doesn't render underneath it. Matches `h-16` from Header's
                inner row. */}
            <div className="h-16 shrink-0" aria-hidden />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster />
          <ChatWidget />
          {import.meta.env.DEV && <I18nVerifier />}
        </CartProvider>
      </FavoritesProvider>
    </I18nProvider>
  );
}

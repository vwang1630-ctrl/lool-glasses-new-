import { Link as TSLink } from "@tanstack/react-router";
import { LangLink } from "@/components/LangLink";
import { useState } from "react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { BUILD_GIT_SHA, BUILD_TIME } from "@/lib/build-info";
import { usePwaInstall } from "@/lib/use-pwa-install";
import { toast } from "sonner";
import {
  Smartphone,
  Mail,
  MessageCircle,
  Headphones,
  Check,
  Share,
  Phone,
} from "lucide-react";
import loolLogo from "@/assets/lool-logo.png";

/* Inline social icons (lucide-react v1 doesn't export brand glyphs) */
const Instagram = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const Facebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4v-2.2c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.9h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z" />
  </svg>
);
const Youtube = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
  </svg>
);
const Twitter = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.9 2H22l-7.4 8.5L23.3 22h-6.8l-5.3-7-6.1 7H2l8-9.1L1.7 2h7l4.8 6.4L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z" />
  </svg>
);

type Col = {
  title: string;
  links: {
    label: string;
    to?: string;
    href?: string;
    search?: Record<string, string>;
  }[];
};

export function Footer() {
  const { t, lang, setLang } = useI18n();
  const [email, setEmail] = useState("");
  const { state: pwaState, install: pwaInstall } = usePwaInstall();
  const showInstallButton =
    pwaState === "ready" ||
    pwaState === "loading" ||
    pwaState === "unsupported";

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // type="text" + inputMode="email" doesn't get the browser's built-in
    // email format check, so validate here.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    toast.success(t("footer.newsletter.success"));
    setEmail("");
  };

  const onInstallApp = () => {
    pwaInstall().then((outcome) => {
      if (outcome === "accepted") {
        toast.success(t("footer.app.installed"));
        return;
      }
      if (outcome === "unavailable") {
        toast.info(t("footer.app.unsupportedHint"));
      }
    });
  };

  // Link columns — point to existing routes (all/myopia/presbyopia/help/favorites/try-on/etc.)
  const cols: Col[] = [
    {
      title: t("footer.col.shopAll"),
      links: [
        { label: t("footer.link.allEyeglasses"), to: "/products" },
        { label: t("footer.link.readingGlasses"), to: "/presbyopia" },
        { label: t("footer.link.everydayEyeglasses"), to: "/myopia" },
        { label: t("footer.link.newArrivals"), to: "/products" },
        { label: t("footer.link.bestSellers"), to: "/products" },
      ],
    },
    {
      title: t("footer.col.category"),
      links: [
        { label: t("footer.link.bestForReaders"), to: "/presbyopia" },
        { label: t("footer.link.progressive"), to: "/presbyopia" },
        { label: t("footer.link.blueLight"), to: "/myopia" },
        { label: t("footer.link.singleVision"), to: "/myopia" },
      ],
    },
    // Material moved up to the top row (was previously row 2 col 1).
    {
      title: t("footer.col.material"),
      links: [
        {
          label: t("footer.link.material.acetate"),
          to: "/products",
          search: { material: "acetate" },
        },
        {
          label: t("footer.link.material.titanium"),
          to: "/products",
          search: { material: "titanium" },
        },
        {
          label: t("footer.link.material.tr90"),
          to: "/products",
          search: { material: "tr90" },
        },
        {
          label: t("footer.link.material.metal"),
          to: "/products",
          search: { material: "metal" },
        },
      ],
    },
    // Style column added in row 1 col 4 (replacing the empty placeholder).
    {
      title: t("footer.col.style"),
      links: [
        {
          label: t("footer.link.style.minimal"),
          to: "/products",
          search: { style: "minimal" },
        },
        {
          label: t("footer.link.style.business"),
          to: "/products",
          search: { style: "business" },
        },
        {
          label: t("footer.link.style.statement"),
          to: "/products",
          search: { style: "character" },
        },
        {
          label: t("footer.link.style.classic"),
          to: "/products",
          search: { style: "classic" },
        },
      ],
    },
    // Bottom row: about + howto occupy cols 5-6; cols 7-8 left empty
    // (会员计划 column hidden — none of rewards/refer/affiliate/education
    // are actually wired up yet. Restore when at least one program ships.)
    {
      title: t("footer.col.about"),
      links: [
        { label: t("footer.link.aboutUs"), to: "/about" },
        { label: t("footer.link.blog"), to: "/blog" },
        { label: t("footer.link.whyLool"), to: "/why-lool" },
        { label: t("footer.link.helpCenter"), to: "/help" },
        { label: t("footer.link.accessibility"), to: "/accessibility" },
      ],
    },
    {
      title: t("footer.col.howto"),
      links: [
        { label: t("footer.link.findFit"), to: "/find-your-fit" },
        { label: t("footer.link.chooseGlasses"), to: "/choose-eyeglasses" },
        { label: t("footer.link.measurePD"), to: "/measure-pd" },
        { label: t("footer.link.rxGuide"), to: "/prescription-guide" },
        { label: t("footer.link.tryOn"), to: "/try-on" },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-secondary/30 border-t border-border/60">
      {/* Top utility row: app · newsletter · contact · social */}
      <div className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-10 grid gap-10 grid-cols-[minmax(0,1fr)] md:grid-cols-4">
          {/* PWA install — drives the same affordance through browser states:
              - ready:       Chrome / Edge / Android → click to prompt install
              - installed:   already added to home screen → show a checkmark
              - ios-hint:    iOS Safari → show "tap Share → Add to Home Screen"
              - mac-safari-hint: macOS Safari → show "File → Add to Dock"
              - loading / unsupported: keep a visible action + fallback hint. */}
          <div>
            <h4 className="font-semibold mb-1.5 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />{" "}
              {t("footer.app.title")}
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              {t("footer.app.sub")}
            </p>
            {showInstallButton && (
              <button
                type="button"
                onClick={onInstallApp}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
              >
                <Smartphone className="w-4 h-4" />
                {t("footer.app.install")}
              </button>
            )}
            {pwaState === "unsupported" && (
              <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                {t("footer.app.unsupportedHint")}
              </p>
            )}
            {pwaState === "installed" && (
              <span className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-secondary text-foreground text-sm font-medium">
                <Check className="w-4 h-4 text-primary" />
                {t("footer.app.installed")}
              </span>
            )}
            {pwaState === "ios-hint" && (
              <p className="inline-flex items-start gap-2 text-xs text-muted-foreground max-w-xs">
                <Share className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>{t("footer.app.iosHint")}</span>
              </p>
            )}
            {pwaState === "mac-safari-hint" && (
              <p className="inline-flex items-start gap-2 text-xs text-muted-foreground max-w-xs">
                <Share className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>{t("footer.app.macHint")}</span>
              </p>
            )}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />{" "}
              {t("footer.newsletter.title")}
            </h4>
            <form
              onSubmit={onSubscribe}
              className="mt-3 flex gap-2"
              autoComplete="off"
            >
              <input
                // type="text" + inputMode="email" — Passwork (and friends)
                // hook into <input type="email"> as a "username field"
                // candidate even when autocomplete + data-*-ignore say
                // otherwise. Dropping the input type defeats the heuristic;
                // mobile users still get the email keyboard via inputMode,
                // and we keep client-side email validation via the regex
                // already in onSubscribe.
                type="text"
                inputMode="email"
                name="newsletter_email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.newsletter.placeholder")}
                autoComplete="off"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                className="flex-1 min-w-0 h-11 px-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="h-11 px-4 sm:px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft shrink-0 whitespace-nowrap"
              >
                {t("footer.newsletter.cta")}
              </button>
            </form>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-1.5 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-primary" />{" "}
              {t("footer.help.title")}
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3" />{" "}
                <LangLink to="/contact" className="hover:text-primary">
                  {t("footer.help.contact")}
                </LangLink>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3 h-3" />{" "}
                <a
                  href="mailto:business@loollook.com"
                  className="hover:text-primary"
                >
                  business@loollook.com
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3 h-3" />{" "}
                <a
                  href="tel:+85270204733"
                  aria-label={`${t("footer.help.phone")} +852 70204733`}
                  className="hover:text-primary"
                >
                  +852 70204733
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Big link grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 text-sm">
        {cols.map((col, i) => (
          <div key={i}>
            {col.title && (
              <h4 className="font-semibold mb-3 text-foreground/90 text-[13px]">
                {col.title}
              </h4>
            )}
            <ul className="space-y-2 text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <LangLink
                      to={l.to}
                      search={l.search as never}
                      className="hover:text-primary transition-smooth"
                    >
                      {l.label}
                    </LangLink>
                  ) : (
                    <a
                      href={l.href ?? "#"}
                      className="hover:text-primary transition-smooth"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Brand · social · region */}
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={loolLogo}
              alt="lool"
              className="h-6 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
            <p className="text-xs text-muted-foreground">
              {t("brand.tagline")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {t("footer.followUs")}
              </span>
              <div className="flex gap-1">
                {[
                  { icon: Instagram, label: "Instagram" },
                  { icon: Facebook, label: "Facebook" },
                  { icon: Youtube, label: "YouTube" },
                  { icon: Twitter, label: "Twitter" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-8 h-8 rounded-full border border-border hover:border-primary hover:text-primary text-muted-foreground flex items-center justify-center transition-smooth"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground shrink-0">
                {t("footer.region")}:
              </span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as never)}
                className="text-xs bg-transparent border border-border rounded-full px-3 py-1.5 hover:border-primary transition-smooth focus:outline-none max-w-[160px] truncate"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <LangLink to="/promise" className="hover:text-primary">
              {t("footer.legal.promise")}
            </LangLink>
            <LangLink to="/shipping-returns" className="hover:text-primary">
              {t("footer.legal.shipping")}
            </LangLink>
            <LangLink to="/privacy" className="hover:text-primary">
              {t("footer.legal.privacy")}
            </LangLink>
            <LangLink to="/terms" className="hover:text-primary">
              {t("footer.legal.terms")}
            </LangLink>
            <LangLink to="/accessibility" className="hover:text-primary">
              {t("footer.legal.accessibility")}
            </LangLink>
            <LangLink to="/cookies" className="hover:text-primary">
              {t("footer.legal.cookies")}
            </LangLink>
          </div>
          <div className="flex items-center gap-3">
            {/* Build identity for self-diagnosis — read this off the page and
                cross-reference with `git log` or with the Version Claude
                reports after deploy. */}
            <span
              className="font-mono text-[10px] opacity-60"
              title={`Built ${BUILD_TIME}`}
            >
              v{BUILD_GIT_SHA}
            </span>
            <p>
              {t("footer.copyright").replace(
                /© \d{4}/,
                `© ${new Date().getFullYear()}`,
              )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

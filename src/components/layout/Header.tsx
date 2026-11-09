import { useLocation, useNavigate } from "@tanstack/react-router";
import { LangLink } from "@/components/LangLink";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  User,
  Heart,
  Globe,
  Menu,
  X,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NavMegaMenu } from "./NavMegaMenu";
import { useGeoRecommend } from "@/hooks/use-geo-recommend";
import loolLogo from "@/assets/lool-logo.png";

export function Header() {
  const { t, lang, setLang, languages, userPicked } = useI18n();
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const [open, setOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const geo = useGeoRecommend();
  const [geoDismissed, setGeoDismissed] = useState(false);
  // App-style back affordance: only on product detail pages, mobile only.
  // history.back() restores where the shopper came from; direct-entry (e.g.
  // shared link) falls back to the full catalogue.
  const isProductPage = /\/product\//.test(pathname);
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: `/${lang}/products` });
    }
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  type NavItem = {
    to: "/" | "/products" | "/myopia" | "/presbyopia" | "/blog";
    label: string;
    tag?: string;
    menuType?: "all" | "scene" | "style" | "material";
  };
  const navItems: NavItem[] = [
    { to: "/", label: t("nav.home") },
    { to: "/products", label: t("nav.allProducts"), menuType: "all" },
    { to: "/myopia", label: t("nav.myopia") },
    {
      to: "/presbyopia",
      label: t("nav.presbyopia"),
      tag: t("nav.tag.fashion"),
    },
    { to: "/products", label: t("nav.style"), menuType: "style" },
    { to: "/products", label: t("nav.material"), menuType: "material" },
    { to: "/blog", label: t("nav.blog") },
  ];

  const currentLangMeta =
    languages.find((l) => l.code === lang) ?? languages[0];

  // Map detected region → suggested language. Only suggest when the user
  // hasn't manually picked one yet, the suggestion differs from current,
  // and they haven't dismissed the banner this session.
  const regionLangMap: Record<string, Lang> = {
    eu: "en", // generic EU default — could be refined with country data
  };
  const suggestedLang: Lang | null = (() => {
    if (userPicked || geoDismissed) return null;
    if (geo.region === "other" || geo.region === "na") return null;
    const sug = regionLangMap[geo.region];
    return sug && sug !== lang ? sug : null;
  })();
  const suggestedMeta = suggestedLang
    ? languages.find((l) => l.code === suggestedLang)
    : null;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Back arrow (mobile product pages) + Logo + nav */}
          <div className="flex items-center gap-8">
            {isProductPage && (
              <button
                onClick={goBack}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 -ml-1.5 rounded-full hover:bg-secondary transition-smooth"
                aria-label={t("nav.back")}
              >
                <ArrowLeft className="w-[18px] h-[18px]" />
              </button>
            )}
            <LangLink to="/" className="flex items-center" aria-label="loollook">
              <img
                src={loolLogo}
                alt="loollook"
                className="h-6 w-auto object-contain"
                loading="eager"
                decoding="async"
              />
            </LangLink>
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((it, idx) => {
                const active =
                  pathname === it.to ||
                  (it.to !== "/" && pathname.startsWith(it.to));
                if (it.menuType) {
                  return (
                    <NavMegaMenu
                      key={`${it.to}-${idx}`}
                      to={it.to}
                      label={it.label}
                      tag={it.tag}
                      active={active}
                      menuType={it.menuType}
                    />
                  );
                }
                return (
                  <LangLink
                    key={`${it.to}-${idx}`}
                    to={it.to}
                    className={`relative text-sm transition-smooth hover:text-primary ${active ? "text-primary font-medium" : "text-foreground/75"}`}
                  >
                    {it.label}
                    {it.tag && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/40 text-accent-foreground">
                        {it.tag}
                      </span>
                    )}
                  </LangLink>
                );
              })}
            </nav>
          </div>

          {/* Right: icons */}
          <div className="flex items-center gap-1">
            {/* Search icon -> opens slide-down search bar */}
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-smooth"
              aria-label="search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Language selector — 10 languages */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-full hover:bg-secondary transition-smooth"
                  aria-label={t("nav.language")}
                >
                  <Globe className="w-[18px] h-[18px]" />
                  <span className="hidden sm:inline text-xs font-medium uppercase">
                    {currentLangMeta.code}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("nav.language")}
                </DropdownMenuLabel>
                <div className="px-2 pb-1.5 text-[11px] text-muted-foreground">
                  {t("nav.currentLanguage")}:{" "}
                  <span className="text-foreground font-medium">
                    {currentLangMeta.label}
                  </span>
                </div>
                <DropdownMenuSeparator />
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code as Lang)}
                    className="cursor-pointer"
                    translate="no"
                  >
                    <span className="mr-2 text-base leading-none">
                      {l.flag}
                    </span>
                    <span className="flex-1" translate="no">
                      {l.label}
                    </span>
                    <span
                      className="text-xs text-muted-foreground mr-1"
                      translate="no"
                    >
                      {l.code.toUpperCase()}
                    </span>
                    {lang === l.code && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorites */}
            <LangLink
              to="/favorites"
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-smooth"
              aria-label={t("nav.favorites")}
            >
              <Heart className="w-[18px] h-[18px]" />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </LangLink>

            {/* Account */}
            <LangLink
              to="/account"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-smooth"
              aria-label={t("nav.account")}
            >
              <User className="w-[18px] h-[18px]" />
            </LangLink>

            {/* Cart */}
            <LangLink
              to="/cart"
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-smooth"
              aria-label={t("nav.cart")}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                  {count}
                </span>
              )}
            </LangLink>

            {/* Mobile menu */}
            <button
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary"
              onClick={() => setOpen((o) => !o)}
              aria-label="menu"
            >
              {open ? (
                <X className="w-[18px] h-[18px]" />
              ) : (
                <Menu className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* AI GEO soft suggestion — non-blocking, dismissible, respects manual pick */}
        {suggestedLang && suggestedMeta && (
          <div className="pb-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-3 rounded-full bg-secondary/70 border border-border/40 px-3 py-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="flex-1 text-foreground/80 truncate">
                {t("geo.suggest")
                  .replace("{region}", geo.label)
                  .replace("{lang}", suggestedMeta.label)}
              </span>
              <button
                onClick={() => setLang(suggestedLang)}
                className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-smooth"
              >
                {t("geo.use").replace("{lang}", suggestedMeta.label)}
              </button>
              <button
                onClick={() => setGeoDismissed(true)}
                className="px-2 py-1 rounded-full text-muted-foreground hover:bg-background text-[11px]"
              >
                {t("geo.dismiss")}
              </button>
            </div>
          </div>
        )}

        {/* Slide-down search */}
        {searchOpen && (
          <div className="pb-4 animate-in fade-in slide-in-from-top-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                placeholder={t("nav.search")}
                className="w-full h-11 pl-11 pr-10 rounded-full bg-secondary/70 border border-transparent focus:border-primary/40 focus:bg-background outline-none text-sm transition-smooth"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-secondary inline-flex items-center justify-center"
                aria-label="close search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden pb-4 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
            {navItems.map((it, idx) => {
              const hasSubmenu = !!it.menuType;
              const itemKey = `${it.to}-${idx}`;
              const isExpanded = expandedMenu === itemKey;
              const closeAll = () => {
                setOpen(false);
                setExpandedMenu(null);
              };
              return (
                <div key={itemKey}>
                  <div className="flex items-center">
                    <LangLink
                      to={it.to}
                      className="flex-1 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm"
                      onClick={closeAll}
                    >
                      {it.label}
                      {it.tag && (
                        <span className="ml-2 text-[10px] text-accent-foreground/80">
                          · {it.tag}
                        </span>
                      )}
                    </LangLink>
                    {hasSubmenu && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMenu(isExpanded ? null : itemKey)
                        }
                        aria-label={isExpanded ? "收起子菜单" : "展开子菜单"}
                        aria-expanded={isExpanded}
                        className="w-9 h-9 rounded-lg hover:bg-secondary inline-flex items-center justify-center"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {hasSubmenu && isExpanded && (
                    <div className="pl-3 pr-2 pb-2 space-y-3 animate-in fade-in slide-in-from-top-1">
                      <SubGroup
                        title={t("menu.shape")}
                        ids={[
                          "round",
                          "square",
                          "rectangle",
                          "aviator",
                          "cateye",
                          "butterfly",
                          "browline",
                          "geometric",
                          "oval",
                        ]}
                        keyPrefix="menu.shape."
                        searchKey="shape"
                        onClose={closeAll}
                      />
                      <SubGroup
                        title={t("menu.material")}
                        ids={["acetate", "metal", "tr90", "titanium"]}
                        keyPrefix="menu.material."
                        searchKey="material"
                        onClose={closeAll}
                      />
                      <SubGroup
                        title={t("menu.style")}
                        ids={["minimal", "business", "character", "classic"]}
                        keyPrefix="menu.style."
                        searchKey="style"
                        onClose={closeAll}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

function SubGroup({
  title,
  ids,
  keyPrefix,
  searchKey,
  onClose,
}: {
  title: string;
  ids: readonly string[];
  keyPrefix: string;
  searchKey: "shape" | "material" | "style";
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5 px-2">
        {ids.map((id) => (
          <LangLink
            key={id}
            to="/products"
            search={{ [searchKey]: id } as never}
            onClick={onClose}
            className="inline-block px-2.5 py-1 rounded-full bg-secondary/60 text-xs text-foreground/85 hover:bg-secondary hover:text-primary transition-smooth"
          >
            {t((keyPrefix + id) as never)}
          </LangLink>
        ))}
      </div>
    </div>
  );
}

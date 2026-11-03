import { LangLink } from "@/components/LangLink";
import { useI18n } from "@/lib/i18n";
import { useState, useRef, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { pickLang } from "@/lib/lang";

type To = "/" | "/products" | "/blog";

interface Props {
  to: To;
  label: string;
  active?: boolean;
  tag?: string;
  /** Which dropdown layout to render */
  menuType?: "all" | "scene" | "style" | "material";
}

/** Hover mega menu with scene / style / all variants + featured card */
export function NavMegaMenu({
  to,
  label,
  active,
  tag,
  menuType = "all",
}: Props) {
  const { t, contentLang } = useI18n();
  const products = useCatalogProducts();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const shapes = [
    "round",
    "square",
    "rectangle",
    "aviator",
    "cateye",
    "butterfly",
    "browline",
    "geometric",
    "oval",
  ] as const;
  const materials = ["acetate", "metal", "tr90", "titanium"] as const;
  const styles = ["minimal", "business", "character", "classic"] as const;
  const scenes = [
    "office",
    "outdoor",
    "daily",
    "driving",
    "reading",
    "travel",
  ] as const;

  const featured = products.find((p) => p.bestseller) ?? products[0];

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <LangLink
        to={to}
        onClick={() => setOpen(false)}
        className={`relative inline-flex items-center gap-1 text-sm transition-smooth hover:text-primary ${active ? "text-primary font-medium" : "text-foreground/75"}`}
      >
        {label}
        {tag && (
          <span className="ml-1.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/40 text-accent-foreground">
            {tag}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </LangLink>

      {open && (
        <>
          {/* invisible bridge so hover doesn't drop */}
          <div className="absolute left-0 right-0 top-full h-3" />
          <div
            className="fixed left-0 right-0 top-16 z-30 animate-in fade-in slide-in-from-top-2"
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-background border border-border/60 rounded-2xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-6 p-7">
                  {menuType === "scene" && (
                    <Column title={t("menu.scene.title")} span="md:col-span-9">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {scenes.map((s) => (
                          <MenuItem
                            key={s}
                            to={to}
                            onNavigate={() => setOpen(false)}
                          >
                            {t(`menu.scene.${s}` as never)}
                          </MenuItem>
                        ))}
                      </div>
                      <div className="pt-3">
                        <LangLink
                          to={to}
                          onClick={() => setOpen(false)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t("menu.cta.viewAll")}
                        </LangLink>
                      </div>
                    </Column>
                  )}

                  {menuType === "style" && (
                    <Column
                      title={t("menu.frameStyle.title")}
                      span="md:col-span-9"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {shapes.map((s) => (
                          <MenuItem
                            key={s}
                            to={to}
                            search={{ shape: s }}
                            onNavigate={() => setOpen(false)}
                          >
                            {t(`menu.shape.${s}` as never)}
                          </MenuItem>
                        ))}
                      </div>
                      <div className="pt-3">
                        <LangLink
                          to={to}
                          onClick={() => setOpen(false)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t("menu.cta.viewAll")}
                        </LangLink>
                      </div>
                    </Column>
                  )}

                  {menuType === "material" && (
                    <Column
                      title={t("menu.material.title")}
                      span="md:col-span-9"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {materials.map((m) => (
                          <MenuItem
                            key={m}
                            to={to}
                            search={{ material: m }}
                            onNavigate={() => setOpen(false)}
                          >
                            {t(`menu.material.${m}` as never)}
                          </MenuItem>
                        ))}
                      </div>
                      <div className="pt-3">
                        <LangLink
                          to={to}
                          onClick={() => setOpen(false)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t("menu.cta.viewAll")}
                        </LangLink>
                      </div>
                    </Column>
                  )}

                  {menuType === "all" && (
                    <>
                      <Column title={t("menu.shape")}>
                        {shapes.map((s) => (
                          <MenuItem
                            key={s}
                            to={to}
                            search={{ shape: s }}
                            onNavigate={() => setOpen(false)}
                          >
                            {t(`menu.shape.${s}` as never)}
                          </MenuItem>
                        ))}
                      </Column>
                      <Column title={t("menu.material")}>
                        {materials.map((m) => (
                          <MenuItem
                            key={m}
                            to={to}
                            search={{ material: m }}
                            onNavigate={() => setOpen(false)}
                          >
                            {t(`menu.material.${m}` as never)}
                          </MenuItem>
                        ))}
                      </Column>
                      <Column title={t("menu.style")}>
                        {styles.map((s) => (
                          <MenuItem
                            key={s}
                            to={to}
                            search={{ style: s }}
                            onNavigate={() => setOpen(false)}
                          >
                            {t(`menu.style.${s}` as never)}
                          </MenuItem>
                        ))}
                        <li className="pt-2">
                          <LangLink
                            to={to}
                            onClick={() => setOpen(false)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {t("menu.cta.viewAll")}
                          </LangLink>
                        </li>
                      </Column>
                    </>
                  )}

                  {/* Featured card */}
                  {featured && (
                    <div className="col-span-12 md:col-span-3 md:col-start-10">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                        {t("menu.featured")}
                      </div>
                      <LangLink
                        to="/product/$slug"
                        params={{ slug: featured.slug }}
                        onClick={() => setOpen(false)}
                        className="block group"
                      >
                        <div className="aspect-[4/3] rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center">
                          <img
                            src={featured.hero}
                            alt={
                              pickLang(featured.name, contentLang) ||
                              featured.name.en
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="mt-2.5">
                          <div className="text-sm font-medium line-clamp-1">
                            {pickLang(featured.name, contentLang) ||
                              featured.name.en}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${featured.priceUSD}
                          </div>
                        </div>
                      </LangLink>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Column({
  title,
  children,
  span = "md:col-span-3",
}: {
  title: string;
  children: ReactNode;
  span?: string;
}) {
  return (
    <div className={`col-span-12 sm:col-span-6 ${span}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </div>
      <ul className="space-y-2 list-none">{children}</ul>
    </div>
  );
}

function MenuItem({
  to,
  children,
  search,
  onNavigate,
}: {
  to: To;
  children: ReactNode;
  search?: Record<string, string>;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <LangLink
        to={to}
        search={search as never}
        onClick={onNavigate}
        className="text-sm text-foreground/80 hover:text-primary transition-smooth"
      >
        {children}
      </LangLink>
    </li>
  );
}

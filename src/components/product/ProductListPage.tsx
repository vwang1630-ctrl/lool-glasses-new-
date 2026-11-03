import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product, Material, Shape, Gender, Style } from "@/data/products";
import { pickLang } from "@/lib/lang";
import { COLOR_PALETTE, type ColorFamilyId } from "@/lib/color-palette";

interface ApiColor {
  id: string;
  label: Record<string, string>;
  hex: string;
  colorFamily?: string | null;
  images: string[];
  tryonImageUrl: string | null;
}
interface ApiProduct {
  id: string;
  slug: string;
  productKind: string;
  categories: string[];
  styles: string[];
  material: string | null;
  finish?: string | null;
  shape: string | null;
  genders: string[];
  name: Record<string, string>;
  priceCents: number;
  originalPriceCents: number | null;
  weightG: number | null;
  rating: number;
  reviewCount: number;
  reviewQuality: number;
  reviewFit: number;
  reviewDesign: number;
  size: {
    lensWidth: number | null;
    bridge: number | null;
    temple: number | null;
  };
  isNew: boolean;
  bestseller: boolean;
  supportsReader?: boolean;
  supportsSingleVision?: boolean;
  supportsProgressive?: boolean;
  supportsNonPrescription?: boolean;
  highlights: Record<string, string[]>;
  colors: ApiColor[];
}

function adaptProduct(p: ApiProduct): Product {
  const colors = p.colors.map((c) => ({
    id: c.id,
    label: c.label,
    hex: c.hex,
    colorFamily: c.colorFamily ?? null,
    images: c.images.length > 0 ? c.images : [""],
    tryonImageUrl: c.tryonImageUrl ?? c.images[0] ?? null,
  }));
  const framePng = colors[0]?.images[0] ?? "";
  const heroImg = framePng;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categories: (p.categories ?? []).filter(
      (c): c is "presbyopia" | "myopia" => c === "presbyopia" || c === "myopia",
    ) as Product["categories"],
    fashion: true,
    styles: (p.styles ?? []).filter(
      (s): s is "minimal" | "business" | "character" | "classic" =>
        s === "minimal" ||
        s === "business" ||
        s === "character" ||
        s === "classic",
    ) as Product["styles"],
    material: (p.material ?? "acetate").toLowerCase() as Product["material"],
    finish: (p.finish ?? null) as Product["finish"],
    shape: (p.shape ?? "round")
      .toLowerCase()
      .replace(/\s+/g, "") as Product["shape"],
    genders: (p.genders.length ? p.genders : ["unisex"]) as Product["genders"],
    priceUSD: Math.round(p.priceCents / 100),
    originalPriceUSD:
      p.originalPriceCents != null
        ? Math.round(p.originalPriceCents / 100)
        : undefined,
    weightG: p.weightG ?? undefined,
    colors,
    rating: p.rating,
    reviewCount: p.reviewCount,
    reviewQuality: p.reviewQuality,
    reviewFit: p.reviewFit,
    reviewDesign: p.reviewDesign,
    highlights: p.highlights,
    size: {
      lensWidth: p.size.lensWidth ?? 0,
      bridge: p.size.bridge ?? 0,
      temple: p.size.temple ?? 0,
    },
    framePng,
    hero: heroImg,
    isNew: p.isNew,
    bestseller: p.bestseller,
    supportsReader: p.supportsReader ?? true,
    supportsSingleVision: p.supportsSingleVision ?? true,
    supportsProgressive: p.supportsProgressive ?? false,
    supportsNonPrescription: p.supportsNonPrescription ?? true,
  };
}
import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n";
import {
  SlidersHorizontal,
  X,
  Minus,
  Plus,
  Check,
  Truck,
  Sparkles,
} from "lucide-react";
import { useGeoRecommend } from "@/hooks/use-geo-recommend";

type Sort = "popular" | "new" | "priceAsc" | "priceDesc" | "fashion";
type PriceBucket = "lt60" | "lt80" | "lt100" | "gte100" | "onSale";
type Lens = "single" | "reading" | "non" | "progressive";

// Localized labels live in i18n.tsx — these arrays only hold ids + visual bits.
// Option label = `t(<keyTemplate>.<id>)` where the dict already covers all 14
// languages. New per-list keys live under `list.{lens,price,gender}.*`; shape /
// material / style reuse the existing `menu.{shape,material,style}.*` keys
// shared with the header mega menu so we don't double-translate.
const MATERIAL_OPTIONS: { id: Material }[] = [
  { id: "acetate" },
  { id: "metal" },
  { id: "tr90" },
  { id: "titanium" },
];

const STYLE_OPTIONS: { id: Style }[] = [
  { id: "minimal" },
  { id: "business" },
  { id: "character" },
  { id: "classic" },
];

// Shape with mini SVG icon. 9 shapes matched to DB CHECK constraint
// ('Square','Rectangle','Cat eye','Butterfly','Round','Geometric','Aviator','Browline','Oval').
const SHAPE_OPTIONS: { id: Shape; icon: ReactNode }[] = [
  { id: "square", icon: <ShapeIcon d="M4 7h16v10H4z" /> },
  {
    id: "rectangle",
    icon: <ShapeIcon d="M3 9h7v6H3z M14 9h7v6h-7z M10 12h4" />,
  },
  {
    id: "cateye",
    icon: (
      <ShapeIcon d="M3 14c2-6 7-7 9-3 2-4 7-3 9 3-2 3-7 4-9 1-2 3-7 2-9-1z" />
    ),
  },
  {
    id: "butterfly",
    icon: (
      <ShapeIcon d="M3 8c0 8 4 9 6 7 1 1 1 1 2 1s1 0 2-1c2 2 6 1 6-7-2-1-5-1-6 1-1-2-1-2-2-2s-1 0-2 2c-1-2-4-2-6-1z" />
    ),
  },
  { id: "round", icon: <ShapeIcon circle /> },
  {
    id: "geometric",
    icon: <ShapeIcon d="M3 9l3-3h4l3 3-3 6H6z M14 9l3-3h4l3 3v6h-7z" />,
  },
  {
    id: "aviator",
    icon: (
      <ShapeIcon d="M3 9c1-2 8-2 9 0l0 5c0 2-8 2-9 0zm9 0c1-2 8-2 9 0l0 5c0 2-8 2-9 0z" />
    ),
  },
  {
    id: "browline",
    icon: (
      <ShapeIcon d="M2 8c3-2 8-2 10 0c0 4-3 7-5 7c-3 0-5-3-5-7zm10 0c2-2 7-2 10 0c0 4-2 7-5 7c-2 0-5-3-5-7z" />
    ),
  },
  { id: "oval", icon: <ShapeIcon d="M4 8c0-2 16-2 16 0v8c0 2-16 2-16 0z" /> },
];

const PRICE_OPTIONS: { id: PriceBucket; match: (p: Product) => boolean }[] = [
  { id: "lt60", match: (p) => p.priceUSD < 60 },
  { id: "lt80", match: (p) => p.priceUSD >= 60 && p.priceUSD < 80 },
  { id: "lt100", match: (p) => p.priceUSD >= 80 && p.priceUSD < 100 },
  { id: "gte100", match: (p) => p.priceUSD >= 100 },
  { id: "onSale", match: (p) => !!p.originalPriceUSD },
];

const LENS_OPTIONS: { id: Lens }[] = [
  { id: "single" },
  { id: "reading" },
  { id: "progressive" },
  { id: "non" },
];

// Soft-gender categorization — Unisex first, no harsh "Men/Women" headlines.
const GENDER_OPTIONS: { id: Gender; icon: ReactNode }[] = [
  {
    id: "unisex",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="10" r="4" />
        <path d="M12 14v7M8 18h8M16 4l3-3M19 1h-3M19 1v3" />
      </svg>
    ),
  },
  {
    id: "women",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v7M9 18h6" />
      </svg>
    ),
  },
  {
    id: "men",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="10" cy="14" r="5" />
        <path d="M14 10l5-5M19 5h-4M19 5v4" />
      </svg>
    ),
  },
];

export interface PreselectFilters {
  shape?: string;
  material?: string;
  style?: string;
  color?: string;
  sort?: Sort;
}

export function ProductListPage({
  category,
  preselect,
}: {
  category: "presbyopia" | "myopia" | "all";
  preselect?: PreselectFilters;
}) {
  const { t, contentLang } = useI18n();
  const geo = useGeoRecommend();

  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/catalog", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { products: ApiProduct[] }) => {
        if (alive) setProducts(d.products.map(adaptProduct));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const [materials, setMaterials] = useState<Material[]>(() =>
    preselect?.material ? [preselect.material as Material] : [],
  );
  const [shapes, setShapes] = useState<Shape[]>(() =>
    preselect?.shape ? [preselect.shape as Shape] : [],
  );
  const [styles, setStyles] = useState<Style[]>(() =>
    preselect?.style ? [preselect.style as Style] : [],
  );

  // When the user navigates to the same route with a different filter param
  // (e.g. mega menu Round → Square), the component instance is reused so the
  // useState lazy initializers above don't re-run. Sync URL → state on change.
  // Sets only the specific bucket that the URL specifies; leaves untouched
  // buckets alone so sidebar-only selections aren't clobbered.
  useEffect(() => {
    if (preselect?.shape) setShapes([preselect.shape as Shape]);
  }, [preselect?.shape]);
  useEffect(() => {
    if (preselect?.material) setMaterials([preselect.material as Material]);
  }, [preselect?.material]);
  useEffect(() => {
    if (preselect?.style) setStyles([preselect.style as Style]);
  }, [preselect?.style]);
  useEffect(() => {
    if (preselect?.color) setColors([preselect.color]);
  }, [preselect?.color]);
  const [colors, setColors] = useState<string[]>(() =>
    preselect?.color ? [preselect.color] : [],
  );
  const [prices, setPrices] = useState<PriceBucket[]>([]);
  // /myopia mega menu defaults to "Single Vision" prescription; /presbyopia
  // defaults to "Reading". /products has no default. Users can still toggle
  // freely after landing.
  const [lenses, setLenses] = useState<Lens[]>(() => {
    if (category === "myopia") return ["single"];
    if (category === "presbyopia") return ["reading"];
    return [];
  });
  // When the category route changes (e.g. Header click /myopia → /presbyopia
  // — TanStack remounts so this is mostly a safety net), reset the prescription
  // default to the new category's default.
  useEffect(() => {
    if (category === "myopia") setLenses(["single"]);
    else if (category === "presbyopia") setLenses(["reading"]);
    else setLenses([]);
  }, [category]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [sort, setSort] = useState<Sort>(preselect?.sort ?? "popular");
  useEffect(() => {
    if (preselect?.sort) setSort(preselect.sort);
  }, [preselect?.sort]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    // Route-level filter:
    //   /presbyopia → frames compatible with reader lenses
    //   /myopia     → frames compatible with single-vision lenses
    //   /products   → no route-level filter
    // A frame supporting both shows up in both sections — the lens-compat
    // flags on `products.supports_*` are independent toggles, not exclusive.
    let list: Product[] = [...products];
    if (category === "presbyopia")
      list = list.filter((p) => p.supportsReader !== false);
    else if (category === "myopia")
      list = list.filter((p) => p.supportsSingleVision !== false);
    if (genders.length)
      list = list.filter((p) => p.genders?.some((g) => genders.includes(g)));
    if (materials.length)
      list = list.filter((p) => materials.includes(p.material));
    if (shapes.length) list = list.filter((p) => shapes.includes(p.shape));
    if (styles.length)
      list = list.filter(
        (p) => p.styles?.some((s) => styles.includes(s)) ?? false,
      );
    if (colors.length)
      list = list.filter(
        (p) =>
          p.colors?.some(
            (c) => c.colorFamily && colors.includes(c.colorFamily),
          ) ?? false,
      );
    if (prices.length) {
      const matchers = PRICE_OPTIONS.filter((o) => prices.includes(o.id)).map(
        (o) => o.match,
      );
      list = list.filter((p) => matchers.some((m) => m(p)));
    }
    // Lens-type sidebar filter — uses the real per-product flags now.
    if (lenses.length) {
      list = list.filter((p) =>
        lenses.some((l) => {
          if (l === "reading") return p.supportsReader !== false;
          if (l === "single") return p.supportsSingleVision !== false;
          if (l === "progressive") return p.supportsProgressive === true;
          if (l === "non") return p.supportsNonPrescription !== false;
          return false;
        }),
      );
    }
    switch (sort) {
      case "priceAsc":
        list = [...list].sort((a, b) => a.priceUSD - b.priceUSD);
        break;
      case "priceDesc":
        list = [...list].sort((a, b) => b.priceUSD - a.priceUSD);
        break;
      case "new":
        list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        break;
      case "fashion": {
        // 「时尚款优先」= 极简 / 个性 风格的镜框排前（与首页"日常时尚穿搭系列"section 的筛选规则一致）。
        const isFashion = (p: Product) =>
          p.styles.includes("minimal") || p.styles.includes("character");
        list = [...list].sort(
          (a, b) => Number(isFashion(b)) - Number(isFashion(a)),
        );
        break;
      }
      default:
        list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return list;
  }, [
    products,
    category,
    materials,
    shapes,
    styles,
    colors,
    prices,
    lenses,
    genders,
    sort,
  ]);

  const toggle = <T,>(arr: T[], v: T, set: (n: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const reset = () => {
    setMaterials([]);
    setShapes([]);
    setStyles([]);
    setColors([]);
    setPrices([]);
    setLenses([]);
    setGenders([]);
  };
  const activeCount =
    materials.length +
    shapes.length +
    styles.length +
    colors.length +
    prices.length +
    lenses.length +
    genders.length;

  // Order chips by detected region (AI GEO).
  const orderedGenders = useMemo(() => {
    const map = new Map(GENDER_OPTIONS.map((o) => [o.id, o]));
    return geo.genderOrder.map((id) => map.get(id)!).filter(Boolean);
  }, [geo.genderOrder]);

  // Color filter swatches are rendered from the canonical 12-color palette,
  // restricted to families that actually appear in the current catalog. This
  // guarantees one swatch per family (no near-duplicate blacks/beiges) and
  // makes swatch ordering stable across catalogs.
  const colorOpts = useMemo(() => {
    const present = new Set<ColorFamilyId>();
    for (const p of products) {
      for (const c of p.colors ?? []) {
        if (c.colorFamily) present.add(c.colorFamily as ColorFamilyId);
      }
    }
    return COLOR_PALETTE.filter((c) => present.has(c.id)).map((c) => ({
      id: c.id,
      hex: c.hex ?? "transparent",
      label: c.label as Record<string, string>,
    }));
  }, [products]);

  const heading =
    category === "presbyopia"
      ? t("cat.presbyopia.title")
      : category === "myopia"
        ? t("cat.myopia.title")
        : t("cat.all.title");
  const sub =
    category === "presbyopia"
      ? t("cat.presbyopia.desc")
      : category === "myopia"
        ? t("cat.myopia.desc")
        : t("cat.all.desc");

  const Filters = (
    <div className="divide-y divide-border">
      <FilterGroup label={t("list.filter.price")} defaultOpen>
        <ul className="space-y-2.5">
          {PRICE_OPTIONS.map((o) => (
            <CheckRow
              key={o.id}
              active={prices.includes(o.id)}
              onClick={() => toggle(prices, o.id, setPrices)}
            >
              {t(`list.price.${o.id}` as never)}
            </CheckRow>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label={t("list.filter.prescription")} defaultOpen>
        <ul className="space-y-2.5">
          {LENS_OPTIONS.map((o) => (
            <CheckRow
              key={o.id}
              active={lenses.includes(o.id)}
              onClick={() => toggle(lenses, o.id, setLenses)}
            >
              {t(`list.lens.${o.id}` as never)}
            </CheckRow>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label={t("list.filter.shape")} defaultOpen>
        <ul className="space-y-2">
          {SHAPE_OPTIONS.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => toggle(shapes, o.id, setShapes)}
                className={`w-full flex items-center gap-3 py-1.5 text-sm transition-smooth ${shapes.includes(o.id) ? "text-primary font-medium" : "text-foreground/80 hover:text-primary"}`}
              >
                <span
                  className={`w-7 h-7 rounded-md border flex items-center justify-center transition-smooth ${shapes.includes(o.id) ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  {o.icon}
                </span>
                <span>{t(`menu.shape.${o.id}` as never)}</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label={t("list.filter.style")} defaultOpen>
        <ul className="space-y-1">
          {STYLE_OPTIONS.map((o) => (
            <CheckRow
              key={o.id}
              active={styles.includes(o.id)}
              onClick={() => toggle(styles, o.id, setStyles)}
            >
              {t(`menu.style.${o.id}` as never)}
            </CheckRow>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label={t("list.filter.color")} defaultOpen>
        <div className="grid grid-cols-6 gap-2.5 pt-1">
          {colorOpts.map((c) => {
            const active = colors.includes(c.id);
            const name = pickLang(c.label, contentLang) || c.id;
            const isClear = c.id === "clear";
            // Light/translucent swatches need a check overlay so the active
            // state is visible against the page background.
            const isLight = isClear || /^#(f|e[0-9a-f])/i.test(c.hex);
            return (
              <button
                key={c.id}
                onClick={() => toggle(colors, c.id, setColors)}
                title={name}
                aria-label={name}
                className={`relative w-7 h-7 rounded-full border transition-smooth ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent" : "border-border hover:border-primary/40"} ${isClear ? "border-dashed" : ""}`}
                style={{ backgroundColor: isClear ? "transparent" : c.hex }}
              >
                {active && isLight && (
                  <Check className="w-3.5 h-3.5 text-foreground absolute inset-0 m-auto" />
                )}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label={t("list.filter.styleFor")} defaultOpen>
        <ul className="space-y-2.5">
          {orderedGenders.map((g) => (
            <CheckRow
              key={g.id}
              active={genders.includes(g.id)}
              onClick={() => toggle(genders, g.id, setGenders)}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-muted-foreground">{g.icon}</span>
                {t(`list.gender.${g.id}` as never)}
              </span>
            </CheckRow>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label={t("list.filter.material")} defaultOpen>
        <ul className="space-y-2.5">
          {MATERIAL_OPTIONS.map((m) => (
            <CheckRow
              key={m.id}
              active={materials.includes(m.id)}
              onClick={() => toggle(materials, m.id, setMaterials)}
            >
              {t(`menu.material.${m.id}` as never)}
            </CheckRow>
          ))}
        </ul>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
      {/* breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-5">
        {t("nav.home")} <span className="mx-1.5">/</span>{" "}
        <span className="text-foreground">{heading}</span>
      </nav>

      {/* hero banner — hidden on All Products */}
      {category !== "all" && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero px-8 md:px-12 py-10 md:py-14 mb-10">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-display leading-tight">
              {heading}
            </h1>
            <p className="text-muted-foreground mt-3 text-base">{sub}</p>
          </div>
        </div>
      )}
      {category === "all" && (
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold font-display leading-tight">
            {heading}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{sub}</p>
        </div>
      )}

      {/* AI GEO recommend strip + soft-gender quick chips */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {orderedGenders.map((g) => {
            const active = genders.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggle(genders, g.id, setGenders)}
                className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-full border text-sm transition-smooth ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground/85 border-border hover:border-primary/40"
                }`}
              >
                <span
                  className={
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }
                >
                  {g.icon}
                </span>
                {t(`list.gender.${g.id}` as never)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setGenders([geo.genderOrder[0]])}
          className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 h-9 rounded-full border border-primary/20 bg-primary/5 text-xs text-foreground hover:bg-primary/10 transition-smooth"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-primary">
            {t("list.ai.recommend")}
          </span>
          <span className="text-muted-foreground">
            {t("list.ai.label")
              .replace(
                "{gender}",
                t(`list.gender.${orderedGenders[0].id}` as never),
              )
              .replace("{region}", geo.label)}
          </span>
        </button>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-10">
        {/* SIDEBAR */}
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{t("list.filter")}</h2>
              {activeCount > 0 && (
                <button
                  onClick={reset}
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
                >
                  {t("list.filter.reset")}
                </button>
              )}
            </div>
            {Filters}
          </div>
        </aside>

        {/* MAIN */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-y-3 mb-5 pb-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground shrink-0">
                {t("list.resultsCount").replace("{n}", String(filtered.length))}
              </p>
              {activeCount > 0 && (
                <>
                  {materials.map((m) => (
                    <FilterChip
                      key={`m-${m}`}
                      label={t(`menu.material.${m}` as never)}
                      onRemove={() =>
                        setMaterials(materials.filter((x) => x !== m))
                      }
                    />
                  ))}
                  {shapes.map((s) => (
                    <FilterChip
                      key={`s-${s}`}
                      label={t(`menu.shape.${s}` as never)}
                      onRemove={() => setShapes(shapes.filter((x) => x !== s))}
                    />
                  ))}
                  {styles.map((st) => (
                    <FilterChip
                      key={`st-${st}`}
                      label={t(`menu.style.${st}` as never)}
                      onRemove={() => setStyles(styles.filter((x) => x !== st))}
                    />
                  ))}
                  {colors.map((c) => {
                    const opt = colorOpts.find((o) => o.id === c);
                    return (
                      <FilterChip
                        key={`c-${c}`}
                        label={opt ? pickLang(opt.label, contentLang) || c : c}
                        onRemove={() =>
                          setColors(colors.filter((x) => x !== c))
                        }
                      />
                    );
                  })}
                  {prices.map((pr) => (
                    <FilterChip
                      key={`p-${pr}`}
                      label={t(`list.price.${pr}` as never)}
                      onRemove={() => setPrices(prices.filter((x) => x !== pr))}
                    />
                  ))}
                  {lenses.map((l) => (
                    <FilterChip
                      key={`l-${l}`}
                      label={t(`list.lens.${l}` as never)}
                      onRemove={() => setLenses(lenses.filter((x) => x !== l))}
                    />
                  ))}
                  {genders.map((g) => (
                    <FilterChip
                      key={`g-${g}`}
                      label={t(`list.gender.${g}` as never)}
                      onRemove={() =>
                        setGenders(genders.filter((x) => x !== g))
                      }
                    />
                  ))}
                  <button
                    onClick={reset}
                    className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 ml-1"
                  >
                    {t("list.filter.clearAll")}
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 text-sm px-3.5 h-9 rounded-full border border-border"
              >
                <SlidersHorizontal className="w-4 h-4" /> {t("list.filter")}
                {activeCount > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
              <label className="text-sm text-muted-foreground hidden sm:inline">
                {t("list.sort.label")}
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="text-sm h-9 px-3 rounded-full border border-border bg-background hover:border-primary/40 transition-smooth"
              >
                <option value="popular">{t("list.sort.popular")}</option>
                <option value="new">{t("list.sort.new")}</option>
                <option value="fashion">{t("list.sort.fashion")}</option>
                <option value="priceAsc">{t("list.sort.priceAsc")}</option>
                <option value="priceDesc">{t("list.sort.priceDesc")}</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center">
              {t("list.empty")}
            </p>
          ) : (
            <>
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </span>
                <div className="text-sm leading-relaxed">
                  <p className="font-medium text-foreground">
                    {t("list.shipping.title")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("list.shipping.desc")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {filterOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background p-6 overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{t("list.filter")}</h3>
              <button onClick={() => setFilterOpen(false)} aria-label="close">
                <X className="w-4 h-4" />
              </button>
            </div>
            {Filters}
            <div className="mt-6 flex gap-3">
              <button
                onClick={reset}
                className="flex-1 h-10 rounded-full border border-border text-sm"
              >
                {t("list.filter.reset")}
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-sm"
              >
                {t("list.viewN").replace("{n}", String(filtered.length))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-foreground"
      >
        <span>{label}</span>
        {open ? (
          <Minus className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Plus className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="mt-3.5">{children}</div>}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="hover:bg-primary/20 rounded-full w-4 h-4 inline-flex items-center justify-center -mr-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function CheckRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 py-1 text-sm text-left transition-smooth ${active ? "text-primary font-medium" : "text-foreground/85 hover:text-primary"}`}
      >
        <span
          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-smooth ${active ? "bg-primary border-primary" : "border-border"}`}
        >
          {active && <Check className="w-3 h-3 text-primary-foreground" />}
        </span>
        <span>{children}</span>
      </button>
    </li>
  );
}

function ShapeIcon({ d, circle }: { d?: string; circle?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {circle ? <circle cx="12" cy="12" r="7" /> : <path d={d} />}
    </svg>
  );
}

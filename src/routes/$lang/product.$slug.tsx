import { LangLink } from "@/components/LangLink";
import {
  createFileRoute,
  Link as TSLink,
  useNavigate,
  notFound,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { ColorViews, Product } from "@/data/products";
import { useI18n, shapeLabel, materialLabel } from "@/lib/i18n";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
  LensFlowWizard,
  selectionToRxSnapshot,
  type LensFlowMode,
} from "@/components/product/LensFlowWizard";
import {
  Camera,
  Star,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Upload,
  FileCheck2,
  Heart,
  Share2,
  Minus,
  Plus,
  ChevronRight,
  ChevronDown,
  Tag,
  Zap,
  Ruler,
  Eye,
  Sparkles,
  HeartPulse,
  BadgeCheck,
  Monitor,
  Sun,
  Layers,
  Car,
  Palette,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, X, MessageCircle, Mail, Link2 } from "lucide-react";
import { toast } from "sonner";
import { FrameMeasurementsDiagram } from "@/components/product/FrameMeasurementsDiagram";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { productSchema, breadcrumbSchema, faqSchema } from "@/lib/jsonld";
import { pickLang, pickLangArray } from "@/lib/lang";
import { pageTitle } from "@/lib/page-titles";
import { finishDef, type FinishId } from "@/lib/color-palette";
import type {
  ProductContentMap,
  ProductContent,
} from "@/server/catalog-loader";

function finishLabel(id: string, lang: string): string {
  return pickLang(finishDef(id as FinishId).label, lang);
}

// Per-color gallery (angle/side/folded) is now served from product_colors
// columns; no static asset table needed here.

interface ApiColor {
  id: string;
  label: Record<string, string>;
  hex: string;
  images: string[];
  views?: ColorViews;
  tryonImageUrl: string | null;
}
interface ApiProduct {
  id: string;
  slug: string;
  productKind: "eyeglasses" | "sunglasses" | "accessory";
  categories: string[];
  styles: string[];
  material: string | null;
  finish?: string | null;
  shape: string | null;
  genders: string[];
  name: Record<string, string>;
  intro?: Record<string, string>;
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
    images: c.images.length > 0 ? c.images : [""],
    views: c.views,
    tryonImageUrl: c.tryonImageUrl ?? c.images[0] ?? null,
  }));
  const framePng = colors[0]?.images[0] ?? "";
  const heroImg = framePng;
  const shape = (p.shape ?? "round")
    .toLowerCase()
    .replace(/\s+/g, "") as Product["shape"];
  const categories = (p.categories ?? []).filter(
    (c): c is "presbyopia" | "myopia" => c === "presbyopia" || c === "myopia",
  ) as Product["categories"];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    intro: p.intro ?? {},
    categories,
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
    shape,
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

// Server function: reads D1 directly. createServerFn isolates the body to the
// server bundle (handler is stripped from client) — necessary because the
// catalog loader pulls in `cloudflare:workers` (env binding).
const fetchProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    const { loadProductBySlug } = await import("@/server/catalog-loader");
    return loadProductBySlug(slug);
  });

export const Route = createFileRoute("/$lang/product/$slug")({
  // SSR loader reads D1 via server function. Provides head() with dynamic
  // per-product title/description/og:image so search & AI crawlers see real
  // metadata in initial HTML. Component still does its own /api/catalog
  // fetch on mount to populate the "recommended" list.
  loader: async ({ params }) => {
    const product = await fetchProductBySlug({ data: params.slug });
    // Unknown / archived slug → real 404 (not a 200 empty shell that search
    // engines would index). Same pattern as /$lang/blog/$slug.
    if (!product) throw notFound();
    return { slug: params.slug, lang: params.lang, ssrProduct: product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.ssrProduct;
    if (!p) return { meta: [{ title: pageTitle("product", loaderData?.lang) }] };
    const lang = loaderData?.lang ?? "en";
    const content = p.content?.[lang] ?? p.content?.en ?? null;
    const seo = content?.seo;
    const name = p.name.en ?? p.name.zh ?? p.slug;
    // <title>: this lang's own SEO title if the content has one; otherwise a
    // non-en page gets "lool — <name in this lang>" instead of borrowing the
    // English SEO title. en behavior is unchanged.
    const ownSeoTitle = p.content?.[lang]?.seo?.title;
    const localName = pickLang(p.name, lang) || name;
    // description: non-en pages prefer this lang's own SEO description /
    // description / intro; only when the content has none in this lang do they
    // fall back to the English chain below (en behavior is unchanged).
    const ownDesc =
      lang === "en"
        ? ""
        : p.content?.[lang]?.seo?.description ||
          p.description?.[lang] ||
          p.intro?.[lang] ||
          "";
    const desc =
      ownDesc ||
      seo?.description ||
      p.description?.en ||
      p.description?.zh ||
      p.intro?.en ||
      p.intro?.zh ||
      `${name} — modern eyewear from lool. ${p.shape ?? ""} ${p.material ?? ""} frame, $${(p.priceCents / 100).toFixed(0)}.`.trim();
    const title =
      lang === "en"
        ? seo?.title || `lool — ${name}`
        : ownSeoTitle || `lool — ${localName}`;
    const heroImg = p.colors[0]?.images[0];
    const ogImg = heroImg
      ? heroImg.startsWith("http")
        ? heroImg
        : `https://loollook.com${heroImg}`
      : undefined;
    // DB-driven structured data (WO-20261008-01 acceptance: head() injects
    // FAQPage + Product + Breadcrumb JSON-LD). head `scripts` render as real
    // <script> tags in <head>, so search & AI crawlers see them in initial HTML.
    const productJsonLd = {
      type: "application/ld+json" as const,
      children: JSON.stringify(
        productSchema(
          {
            slug: p.slug,
            name: p.name,
            description: p.description,
            intro: p.intro,
            priceCents: p.priceCents,
            originalPriceCents: p.originalPriceCents,
            rating: p.rating,
            reviewCount: p.reviewCount,
            categories: p.categories,
            shape: p.shape,
            material: p.material,
            colors: p.colors.map((c) => ({
              id: c.id,
              label: c.label,
              images: c.images,
            })),
            hero: p.colors[0]?.images[0] ?? null,
          },
          lang,
        ),
      ),
    };
    const breadcrumbJsonLd = {
      type: "application/ld+json" as const,
      children: JSON.stringify(
        breadcrumbSchema([
          { name: "Home", url: `https://loollook.com/${lang}/` },
          {
            name: p.categories.includes("presbyopia")
              ? "Fashion Readers"
              : "Everyday Eyeglasses",
            url: `https://loollook.com/${lang}/${p.categories.includes("presbyopia") ? "presbyopia" : "myopia"}`,
          },
          {
            name: p.name[lang] ?? p.name.en ?? p.name.zh ?? p.slug,
            url: `https://loollook.com/${lang}/product/${p.slug}`,
          },
        ]),
      ),
    };
    const dbFaq = content?.sections?.faq ?? [];
    const faqJsonLd =
      dbFaq.length > 0
        ? {
            type: "application/ld+json" as const,
            children: JSON.stringify(
              faqSchema(
                dbFaq.map((f) => ({
                  question: f.question ?? "",
                  answer: f.answer ?? "",
                })),
              ),
            ),
          }
        : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        ...(ogImg ? [{ property: "og:image", content: ogImg } as const] : []),
        ...(ogImg ? [{ name: "twitter:image", content: ogImg } as const] : []),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      scripts: [productJsonLd, breadcrumbJsonLd, faqJsonLd].filter(
        (s): s is { type: "application/ld+json"; children: string } =>
          Boolean(s),
      ),
    };
  },
  notFoundComponent: () => <NotFoundView />,
  component: ProductDetail,
});

function NotFoundView() {
  const { t } = useI18n();
  return (
    <div className="py-32 text-center">
      <p className="text-muted-foreground mb-4">{t("pdp.notFound")}</p>
      <LangLink to="/" className="text-primary underline">
        {t("pdp.goHome")}
      </LangLink>
    </div>
  );
}

const lensTypes = [
  {
    id: "single" as const,
    label: { zh: "单光", en: "Single vision" },
    extra: 0,
  },
  {
    id: "blue" as const,
    label: { zh: "蓝光防护", en: "Blue-light" },
    extra: 25,
  },
  {
    id: "progressive" as const,
    label: { zh: "渐进多焦", en: "Progressive" },
    extra: 89,
  },
];
const lensIndex = [
  { id: "1.56" as const, label: "1.56", extra: 0 },
  { id: "1.61" as const, label: "1.61 thin", extra: 20 },
  { id: "1.67" as const, label: "1.67 ultra-thin", extra: 45 },
];

type RxMode = "single" | "reading" | "frameOnly";
const COATINGS = [
  { id: "bluelight" as const, key: "rx.coating.bluelight", extra: 12 },
  { id: "uv" as const, key: "rx.coating.uv", extra: 8 },
  { id: "antiglare" as const, key: "rx.coating.antiglare", extra: 10 },
  { id: "scratch" as const, key: "rx.coating.scratch", extra: 6 },
] as const;

type ProductReview = {
  id: string;
  name: string;
  age?: string;
  rating: number;
  quality: number;
  fit: number;
  design: number;
  text: string;
  createdAt: string;
  verified?: boolean;
};

type ReviewStats = {
  average: number;
  count: number;
  distribution: { stars: number; count: number; pct: number }[];
  subRatings: { label: string; value: number }[];
};

type ReviewInput = Pick<
  ProductReview,
  "name" | "rating" | "quality" | "fit" | "design" | "text"
> & {
  age?: string;
};

type ReviewAggregates = {
  rating: number;
  reviewCount: number;
  reviewQuality: number;
  reviewFit: number;
  reviewDesign: number;
};

function clampReviewScore(value: number) {
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function buildReviewStats(
  aggregates: ReviewAggregates,
  reviews: ProductReview[],
  labels: { quality: string; fit: string; design: string },
): ReviewStats {
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of reviews) {
    distribution[clampReviewScore(review.rating)] += 1;
  }
  const distributionCount = reviews.length;

  return {
    average: aggregates.reviewCount > 0 ? aggregates.rating : 0,
    count: aggregates.reviewCount,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: distribution[stars],
      pct:
        distributionCount > 0
          ? Math.round((distribution[stars] / distributionCount) * 100)
          : 0,
    })),
    subRatings: [
      { label: labels.quality, value: aggregates.reviewQuality },
      { label: labels.fit, value: aggregates.reviewFit },
      { label: labels.design, value: aggregates.reviewDesign },
    ],
  };
}

function ProductDetail() {
  const { slug, ssrProduct } = Route.useLoaderData();
  // Route is DB-driven SSR (WO-20261008-01): when the loader has the product,
  // start from it so the server renders the FULL PDP body into initial HTML —
  // H1, color block, FAQ, shipping text are all visible in view-source. The
  // client /api/catalog fetch below only fills in the "recommended" rail.
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "loaded"; product: Product; recommended: Product[] }
    | { kind: "notfound" }
  >(
    ssrProduct
      ? { kind: "loaded", product: adaptProduct(ssrProduct), recommended: [] }
      : { kind: "loading" },
  );
  // DB content story stays with the SSR product (the API response deliberately
  // does not carry content_json — only the route loader needs it).
  const contentMap = ssrProduct?.content ?? null;

  useEffect(() => {
    let alive = true;
    fetch("/api/catalog", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { products: ApiProduct[] }) => {
        if (!alive) return;
        const api = d.products.find((p) => p.slug === slug);
        if (!api) {
          // SSR already rendered a valid product — keep it rather than
          // swapping to NotFound because the API misses the slug.
          if (!ssrProduct) setState({ kind: "notfound" });
          return;
        }
        const product = adaptProduct(api);
        const recommended = d.products
          .filter(
            (p) =>
              p.slug !== slug &&
              ((api.categories ?? []).length === 0 ||
                (p.categories ?? []).some((c) => api.categories.includes(c))),
          )
          .slice(0, 4)
          .map(adaptProduct);
        setState({ kind: "loaded", product, recommended });
      })
      .catch(() => {
        if (alive && !ssrProduct) setState({ kind: "notfound" });
      });
    return () => {
      alive = false;
    };
  }, [slug, ssrProduct]);

  const body =
    state.kind === "loading" ? (
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-secondary/40 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-secondary/50 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-secondary/40 rounded animate-pulse" />
            <div className="h-12 w-1/3 bg-secondary/40 rounded animate-pulse" />
            <div className="h-32 w-full bg-secondary/30 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ) : state.kind === "notfound" ? (
      <NotFoundView />
    ) : (
      <ProductDetailRendered
        product={state.product}
        recommended={state.recommended}
        content={contentMap}
      />
    );

  return <>{body}</>;
}

function ProductDetailRendered({
  product,
  recommended,
  content,
}: {
  product: Product;
  recommended: Product[];
  content: ProductContentMap | null;
}) {
  const { t, lang, contentLang, localizeProductName, localizeColorName } =
    useI18n();
  const { add } = useCart();
  const { has: isFav, toggle: toggleFav } = useFavorites();
  // DB content story for the active language (WO-20261008-01). Falls back to
  // en so an en-only patch still renders on non-en routes; null when the
  // product has no content_json yet → static UI carries the page.
  const dbContent: ProductContent | null =
    content?.[contentLang] ?? content?.en ?? null;
  const navigate = useNavigate();
  const [type, setType] = useState<(typeof lensTypes)[number]["id"]>(
    product.categories.includes("presbyopia") ? "single" : "single",
  );
  const [idx, setIdx] = useState<(typeof lensIndex)[number]["id"]>("1.61");
  const [rxMode, setRxMode] = useState<RxMode>(
    product.categories.includes("presbyopia") ? "reading" : "single",
  );
  const [coatings, setCoatings] = useState<string[]>(["bluelight", "uv"]);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  type ColorOpt = {
    id: string;
    label: { zh: string; en: string };
    hex: string;
    images: string[];
    views?: ColorViews;
    tryonImageUrl?: string | null;
  };
  const colors: ColorOpt[] = product.colors ?? [
    {
      id: "default",
      label: { zh: "默认", en: "Default" },
      hex: "#444",
      images: [product.framePng],
    },
  ];
  const [colorId, setColorId] = useState(colors[0].id);
  const activeColor = colors.find((c) => c.id === colorId) ?? colors[0];
  // Details-tab product photo: a dedicated view (views_json.detail) when the
  // owner uploaded one, else the first gallery image. Kept decoupled from the
  // carousel hero so restoring/reordering the top images never leaks into the
  // details pane.
  const detailImg = colors[0]?.views?.detail ?? colors[0]?.images?.[0] ?? "";
  // Localized display strings for the active product + color. PDP shows the
  // active language for every lang in LANGUAGES (not just zh/en), unlike the
  // raw product.name[contentLang] which only carries en+zh.
  const displayProductName = localizeProductName(
    product.slug,
    pickLang(product.name, contentLang),
  );
  // H1 can be DB-overridden (patch.seo.h1) so the headline carries the full
  // keyword sentence instead of the short product name.
  const headingText = dbContent?.seo?.h1 || displayProductName;
  // Details-tab summary header (Pdp-Exact-Clone): the intro's lead clause
  // before the em-dash becomes the bold hook, the remainder is the tagline.
  const detailsTagline = (() => {
    const intro = pickLang(product.intro, contentLang) || "";
    const dash = intro.search(/[—–]/);
    if (dash === -1) return { hook: "", rest: intro };
    return {
      hook: intro.slice(0, dash).trim(),
      rest: intro.slice(dash + 1).trim(),
    };
  })();
  const displayActiveColor = localizeColorName(
    activeColor.label.en,
    pickLang(activeColor.label, contentLang),
  );
  const [activeImg, setActiveImg] = useState(0);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  // Reset mobile carousel to the first frame whenever color changes — without
  // this the user lands on slide 3 of the new color's gallery after swiping
  // and changing the swatch.
  useEffect(() => {
    setActiveImg(0);
    const el = mobileGalleryRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
  }, [colorId]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<
    "details" | "description" | "lens" | "shipping" | "faq" | "reviews"
  >("details");
  // Fashion Readers positioning: reader-capable + non-prescription SKUs present
  // as magnification-only fashion eyewear, so the static spec rows must not
  // leak medical vocabulary (RX Range / Progressive) into AI-visible SSR HTML.
  const isFashionReader =
    product.supportsReader === true && product.supportsNonPrescription === true;
  const [showLensFlow, setShowLensFlow] = useState(false);
  const [wizardMode, setWizardMode] = useState<LensFlowMode | null>(null);
  const [guaranteesOpen, setGuaranteesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  // Mobile viewport-locks the PDP: image carousel + action panel always
  // visible. Detail tabs render inline in the page flow below the panel
  // (mockup: tabs rail + cream card), same data as the desktop tabs block.
  // Hero-image zoom (PC hover): origin = % position of cursor inside the
  // image container, null while not hovered. Touch devices never fire
  // mousemove so the image stays in its un-zoomed state — users on phones
  // still get the native pinch-to-zoom gesture.
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(
    null,
  );
  // Per-color gallery from DB. Ordered list, [0] is the hero.
  const gallery =
    activeColor.images.length > 0 ? activeColor.images : [product.framePng];
  const liked = isFav(product.id);
  const [backendReviews, setBackendReviews] = useState<ProductReview[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewAggregates, setReviewAggregates] = useState<ReviewAggregates>({
    rating: product.rating,
    reviewCount: product.reviewCount,
    reviewQuality: product.reviewQuality,
    reviewFit: product.reviewFit,
    reviewDesign: product.reviewDesign,
  });

  useEffect(() => {
    setReviewAggregates({
      rating: product.rating,
      reviewCount: product.reviewCount,
      reviewQuality: product.reviewQuality,
      reviewFit: product.reviewFit,
      reviewDesign: product.reviewDesign,
    });
  }, [
    product.id,
    product.rating,
    product.reviewCount,
    product.reviewQuality,
    product.reviewFit,
    product.reviewDesign,
  ]);

  useEffect(() => {
    let alive = true;
    setBackendReviews([]);
    setReviewError(null);
    fetch(`/api/products/${encodeURIComponent(product.id)}/reviews`, {
      credentials: "same-origin",
    })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((data: { reviews?: ProductReview[] }) => {
        if (!alive) return;
        setBackendReviews(Array.isArray(data.reviews) ? data.reviews : []);
      })
      .catch(() => {
        if (alive)
          setReviewError(
            lang === "zh" ? "评价加载失败。" : "Reviews failed to load.",
          );
      });
    return () => {
      alive = false;
    };
  }, [lang, product.id]);

  const reviewStats = useMemo(
    () =>
      buildReviewStats(reviewAggregates, backendReviews, {
        quality: t("pdp.reviews.quality"),
        fit: t("pdp.reviews.fit"),
        design: t("pdp.reviews.design"),
      }),
    [backendReviews, reviewAggregates, t],
  );
  const visibleReviews = backendReviews;
  const reviewAverageText = reviewStats.average.toFixed(1).replace(/\.0$/, "");

  /* FAQ items — DB-driven when the product has content_json (WO-20261008-01),
     else the static universal set. Framework-lock §11: max 8 rows, psych job
     = objection_clearing. 6 universal questions covering PD, fit, progressives,
     shipping, returns, lens tiers. */
  const faqItems = useMemo(() => {
    const dbFaq = dbContent?.sections?.faq;
    if (dbFaq && dbFaq.length > 0) {
      return dbFaq.map((f) => ({ q: f.question ?? "", a: f.answer ?? "" }));
    }
    const zh = contentLang === "zh";
    return [
      {
        q: zh
          ? "什么是瞳距（PD）？为什么它很重要？"
          : "What is PD (pupillary distance) and why does it matter?",
        a: zh
          ? "瞳距是两眼瞳孔中心之间的距离，以毫米为单位。它决定了镜片光学中心的位置。如果 PD 误差超过 2mm，渐进镜片会产生畸变，导致头痛和眼疲劳。我们的 /measure-pd 工具用摄像头 30 秒即可精确测量。"
          : "PD is the distance between your pupils, measured in millimeters. It determines where the optical center of your lenses should be. If your PD is off by 2mm or more, progressive lenses can cause distortion, headaches, and eye strain. Our /measure-pd tool measures it accurately in 30 seconds using your camera.",
      },
      {
        q: zh
          ? "渐进镜片需要多久适应？"
          : "How long does it take to adapt to progressive lenses?",
        a: zh
          ? "大多数人 3-7 天适应。我们提供 3 周适应保障——如果 3 周内无法适应，可免费更换或退款。选择高品质镜片（如 Essilor、ZEISS）可显著缩短适应期。"
          : "Most people adapt within 3–7 days. We offer a 3-week adaptation guarantee — if you can't adjust within 3 weeks, we'll exchange or refund. Premium lenses (Essilor, ZEISS) significantly reduce adaptation time.",
      },
      {
        q: zh
          ? "如何确认镜框尺寸适合我的脸？"
          : "How do I know if the frame size fits my face?",
        a: zh
          ? "查看产品规格中的镜框宽度（Frame Width），与你的脸部宽度对比。误差在 5mm 以内通常合适。产品页提供详细的尺寸图（镜片宽-鼻桥宽-镜腿长），也可使用虚拟试戴功能实时查看效果。"
          : "Check the Frame Width in the product specs and compare it to your face width. A difference within 5mm usually fits well. The product page provides detailed size diagrams (lens width – bridge – temple length). You can also use Virtual Try-On to see the frame on your face in real time.",
      },
      {
        q: zh
          ? "配送需要多久？运费多少？"
          : "How long does shipping take? Is it free?",
        a: zh
          ? "满 $69 全球免运费并附实时追踪，不满 $69 收取 $9.9 固定运费。根据所在国家/地区不同，送达时间约 7–30 天。"
          : "Free tracked shipping on orders over $69 — orders under $69 have a flat $9.9 shipping fee. Delivery takes 7–30 days depending on your country. Real-time tracking included.",
      },
      {
        q: zh ? "退货政策是什么？" : "What is the return policy?",
        a: zh
          ? "非处方眼镜（平光镜）30 天内免费退换。处方眼镜按您的度数定制，除非存在制造缺陷或我方配镜错误，否则不接受退换。退回商品须未经佩戴并保持原包装。"
          : "30-day free returns & exchanges for non-prescription glasses. Prescription glasses are custom-made to your prescription and PD, and cannot be returned or exchanged unless there is a manufacturing defect or prescription error on our part. All returned items must be unworn and in original packaging.",
      },
      {
        q: zh ? "镜片有哪些品牌层级？" : "What lens tiers are available?",
        a: zh
          ? "我们提供 4 层透明定价：lool House（自有品牌入门）→ 明月 Mingyue（国产高端）→ Essilor/ZEISS（国际一线光学）→ Transitions（变色镜片）。每层价格下单前可见，无隐藏费用。"
          : "We offer 4 transparent lens tiers: lool House (entry-level) → Mingyue (premium domestic) → Essilor/ZEISS (top international optics) → Transitions (photochromic). Prices for each tier are shown before checkout — no hidden fees.",
      },
    ];
  }, [contentLang, dbContent]);

  const submitReview = async (input: ReviewInput) => {
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(product.id)}/reviews`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        reviews?: ProductReview[];
        aggregates?: ReviewAggregates;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || String(response.status));
      }
      setBackendReviews(Array.isArray(data.reviews) ? data.reviews : []);
      if (data.aggregates) setReviewAggregates(data.aggregates);
      toast.success(lang === "zh" ? "评价已提交" : "Review submitted");
    } catch {
      setReviewError(
        lang === "zh"
          ? "评价提交失败，请稍后再试。"
          : "Review failed. Please try again.",
      );
      throw new Error("review_failed");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Frame Color block — single row of swatches. Rendered twice on the page:
  // once on mobile directly under the swipe carousel (so the user can swap
  // colors without scrolling past title/price), and once on desktop in its
  // normal info-column position. Same state, same JSX, different visibility.
  // Always rendered: a single-color product still shows the frame color label
  // + its swatch thumbnail — hiding the block on one color made the PDP look
  // like the color info was missing.
  const frameColorPicker = (
    <>
      <div className="text-sm mb-3">
        <span className="font-semibold">{t("pdp.frameColor")}: </span>
        <span className="text-foreground/80">{displayActiveColor}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {colors.map((c) => {
          const active = colorId === c.id;
          const colorLabel = localizeColorName(
            c.label.en,
            pickLang(c.label, contentLang),
          );
          return (
            <button
              key={c.id}
              onClick={() => setColorId(c.id)}
              title={colorLabel}
              aria-label={colorLabel}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 bg-secondary/40 transition-smooth ${active ? "border-primary shadow-soft" : "border-transparent hover:border-border"}`}
            >
              <img
                src={c.images[0] ?? ""}
                alt={colorLabel}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </>
  );

  // PDP header price = frame price only. Lens upgrades are picked + priced
  // inside LensFlowWizard from real /api/lens/skus data, not here. The
  // legacy lensTypes / lensIndex / COATINGS arrays at the top of this file
  // are pre-wizard mock and were inflating the headline number by ~+$40
  // (1.61 thin +$20 + bluelight +$12 + uv +$8 defaults).
  const isFrameOnly = rxMode === "frameOnly";
  const lensExtra = 0;
  const total = product.priceUSD * qty;

  const toggleCoating = (id: string) =>
    setCoatings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploaded(f.name);
      toast.success(t("rx.uploaded"));
    }
  };

  const onAdd = () => {
    for (let i = 0; i < qty; i++)
      add({
        product,
        qty: 1,
        colorId,
        lens: { type, index: idx, extraUSD: lensExtra },
      });
    toast.success(t("product.addedToCart"));
  };
  const onBuy = () => {
    add({
      product,
      qty: 1,
      colorId,
      lens: { type, index: idx, extraUSD: lensExtra },
    });
    navigate({ to: `/${lang}/checkout` });
  };

  // FAQ/Product/Breadcrumb JSON-LD is injected in head() (built from the SSR
  // loader's content_json) so structured data sits in initial <head> HTML.

  return (
    <>
      {/* MOBILE — normal document flow. The previous fixed viewport layer
          left a blank screen below the action panel on taller phones/tablets,
          because product details lived in a separate sheet. Keeping the
          mobile PDP in-flow lets the page end where the visible content ends. */}
      <div className="md:hidden bg-background pb-24">
        {/* Image carousel — square (width = height) */}
        <div className="relative w-full aspect-square bg-white overflow-hidden shrink-0">
          <div
            ref={mobileGalleryRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const next = Math.round(el.scrollLeft / el.clientWidth);
              if (next !== activeImg && next >= 0 && next < gallery.length) {
                setActiveImg(next);
              }
            }}
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {gallery.map((src, i) => (
              <div
                key={i}
                className="snap-center shrink-0 w-screen h-full bg-white"
              >
                {/* object-cover (not contain) so the photo fills the carousel
                    slot — otherwise tall portraits get letterboxed top/bottom
                    and the NEW / -8% badges, counter pill, and Try-on
                    overlays end up floating on white margin instead of on
                    the image itself. */}
                <img
                  src={src}
                  alt={`${displayProductName} ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
            {product.isNew && (
              <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                {t("pdp.badge.new")}
              </span>
            )}
            {product.originalPriceUSD &&
              product.originalPriceUSD > product.priceUSD && (
                <span className="bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                  -
                  {Math.round(
                    (1 - product.priceUSD / product.originalPriceUSD) * 100,
                  )}
                  %
                </span>
              )}
          </div>
          {/* Counter pill bottom-left */}
          {gallery.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/55 text-white text-[11px] font-medium px-2.5 py-1 rounded-full tabular-nums">
              {Math.min(activeImg, gallery.length - 1) + 1} / {gallery.length}
            </div>
          )}
          {/* AR Try-On bottom-right */}
          <LangLink
            to="/try-on"
            search={{ frame: product.slug } as never}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-card/95 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-medium shadow-soft"
          >
            <Camera className="w-3.5 h-3.5" /> {t("product.tryon")}
          </LangLink>
        </div>

        {/* Bottom action panel — always visible */}
        <div
          className="shrink-0 bg-background border-t border-border"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
          }}
        >
          {/* Title — full width, wraps naturally so the long Fashion Readers
              name reads cleanly and the price stands apart below (mobile
              app-style, mirrors the desktop heading hierarchy). */}
          <div className="px-4 pt-3">
            {/* Mobile-only duplicate of the desktop <h1> below — kept as a
                role=heading <p> so the page has a single <h1> for SEO while
                screen readers on mobile (desktop block is display:none) still
                get a level-1 heading. */}
            <p
              role="heading"
              aria-level={1}
              className="text-xl font-bold leading-snug"
            >
              {headingText}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-bold">${total}</span>
              {product.originalPriceUSD &&
                product.originalPriceUSD > product.priceUSD && (
                  <span className="text-xs line-through text-muted-foreground">
                    ${product.originalPriceUSD}
                  </span>
                )}
            </div>
          </div>

          {/* Color swatches (compact) */}
          {colors.length > 1 && (
            <div className="px-4 pt-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {colors.map((c) => {
                  const active = colorId === c.id;
                  const colorLabel = localizeColorName(
                    c.label.en,
                    pickLang(c.label, contentLang),
                  );
                  return (
                    <button
                      key={c.id}
                      onClick={() => setColorId(c.id)}
                      title={colorLabel}
                      aria-label={colorLabel}
                      className={`relative shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 bg-secondary/40 transition-smooth ${active ? "border-primary shadow-soft" : "border-transparent"}`}
                    >
                      <img
                        src={c.images[0] ?? ""}
                        alt={colorLabel}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA buttons — mobile's single reachable CTA is the sticky
              bottom bar at the end of this component (design intent, see the
              desktop block's comment), so the action panel stays compact.
              Desktop renders its own two-button row in the info column. */}
        </div>
        {/* Mobile detail tabs — inline in the page flow (mockup ≤768px:
            tabs become a horizontally scrolling rail, panes sit in a cream
            card inset 16px, 12px on very narrow screens). No popup sheet —
            the same data as the desktop tabs block renders inline. */}
        <div className="pb-4">
          <div className="px-4">
            {/* Mockup ≤768px: tabs become a horizontally scrolling rail
                  (gap 18, 13px, hidden scrollbar), panes sit in a cream card
                  inset 16px (12px on very narrow screens). */}
            <div
              className="flex gap-[18px] items-end h-[42px] border-b border-[#E9E1D8] overflow-x-auto whitespace-nowrap scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {(
                [
                  "details",
                  "description",
                  "lens",
                  "shipping",
                  "faq",
                  "reviews",
                ] as const
              ).map((id) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`pb-[11px] text-[13px] flex-shrink-0 border-b-2 -mb-px transition-smooth ${tab === id ? "border-foreground text-foreground font-bold" : "border-transparent text-[#8B7D76]"}`}
                >
                  {t(`pdp.tabs.${id}` as never)}
                  {id === "reviews" && (
                    <span className="ml-1 text-xs text-[#8B7D76]">
                      ({reviewStats.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-3 mt-3">
            <div className="bg-[#FAF6F1] rounded-[16px] p-4 [@media(max-width:380px)]:p-3">
              {tab === "details" && (
                <div>
                  {[
                    {
                      title: t("pdp.specs.group.dimensions"),
                      rows: [
                        [
                          t("product.lensWidth"),
                          `${product.size.lensWidth} mm`,
                        ],
                        [
                          t("pdp.specs.frameWidth"),
                          `${product.size.lensWidth * 2 + product.size.bridge + 5} mm`,
                        ],
                        [t("product.bridge"), `${product.size.bridge} mm`],
                        [t("product.temple"), `${product.size.temple} mm`],
                      ],
                    },
                    {
                      title: t("pdp.specs.group.fit"),
                      rows: [
                        [t("pdp.size.label"), t("pdp.size.medium")],
                        [
                          t("pdp.specs.weight"),
                          product.weightG ? `${product.weightG} g` : "19.1 g",
                        ],
                      ],
                    },
                    {
                      title: t("pdp.specs.group.material"),
                      rows: [
                        [t("pdp.sku"), product.id.toUpperCase()],
                        [t("pdp.specs.shape"), shapeLabel(product.shape, t)],
                        [
                          t("pdp.specs.frameMaterial"),
                          materialLabel(product.material, t),
                        ],
                        ...(product.finish
                          ? [
                              [
                                contentLang === "zh" ? "工艺" : "Finish",
                                finishLabel(product.finish, contentLang),
                              ],
                            ]
                          : []),
                      ],
                    },
                  ].map((group, gi) => (
                    <div key={group.title} className={gi > 0 ? "mt-5" : ""}>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A89A93] mb-3.5">
                        {group.title}
                      </h4>
                      <dl>
                        {group.rows.map(([k, v]) => (
                          <div key={k} className="flex items-baseline h-8">
                            <dt className="w-[102px] shrink-0 text-right pr-3.5 text-[11.5px] text-[#8B7D76]">
                              {k}
                            </dt>
                            <dd className="text-[13px] font-bold text-[#1E1510] first-letter:uppercase">
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {gi < 2 && <div className="h-px bg-[#EDE3DA] my-4" />}
                    </div>
                  ))}

                  {/* Right — tagline + chips + photo & measurement diagram
                      (mockup .right-header/.right-card, mobile: sits below
                      the spec groups in the single-column pd-grid). Same
                      data as the desktop details column. */}
                  {(detailsTagline.hook || detailsTagline.rest) && (
                    <p className="mt-5 text-[12.5px] leading-5 text-[#6B5E58] max-w-[340px]">
                      {detailsTagline.hook && (
                        <strong className="text-[#1E1510] font-bold">
                          {detailsTagline.hook}
                        </strong>
                      )}
                      {detailsTagline.hook && detailsTagline.rest ? " — " : ""}
                      {detailsTagline.rest}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      materialLabel(product.material, t),
                      shapeLabel(product.shape, t),
                      t("pdp.specs.rimFull"),
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="text-[11px] px-[11px] py-[5px] rounded-full bg-card border border-[#E9E1D8] text-[#8B7D76]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 bg-card rounded-[16px] p-2 shadow-[0_8px_24px_rgba(23,18,16,0.06)] flex flex-col gap-2">
                    {detailImg && (
                      <div className="rounded-[12px] px-[10px] pt-[14px] pb-[12px] leading-none">
                        <img
                          src={detailImg}
                          alt={displayProductName}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                          onError={(e) => {
                            // Broken R2 key (e.g. 8663's never-uploaded
                            // colors): hide instead of a broken-image glyph.
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="rounded-[12px] bg-[#F5EFE8] px-[16px] pt-[18px] pb-[16px] leading-none">
                      <FrameMeasurementsDiagram
                        lensWidth={product.size.lensWidth}
                        bridge={product.size.bridge}
                        temple={product.size.temple}
                        shape={product.shape}
                      />
                    </div>
                  </div>
                </div>
              )}
              {tab === "description" && (
                <div>
                  <div className="text-[13.5px] leading-[22px] text-[#6B5E58]">
                    <p className="mb-4">{t("pdp.details.body")}</p>
                    <p className="mb-4">{t("pdp.desc.body")}</p>
                  </div>
                  <div className="mt-1">
                    {pickLangArray(product.highlights, contentLang).map(
                      (h: string) => (
                        <div
                          key={h}
                          className="flex items-center gap-[10px] h-8 text-[14px] text-[#1E1510]"
                        >
                          <span className="text-[#5A3E2E] font-bold">✓</span>
                          <span>{h}</span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Photo cards (mockup .desc-imgs, mobile: 2-col, ≤380px
                      1-col). Same front/side views as the desktop
                      description column. */}
                  <div className="mt-4 grid grid-cols-2 gap-2 [@media(max-width:380px)]:grid-cols-1">
                    <figure className="bg-card rounded-[16px] p-2 shadow-[0_8px_24px_rgba(23,18,16,0.06)]">
                      <div className="rounded-[12px] overflow-hidden aspect-square bg-card flex items-center justify-center">
                        <img
                          src={
                            activeColor.views?.front ??
                            activeColor.views?.angle ??
                            gallery[0]
                          }
                          alt={t("pdp.gallery.front")}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <figcaption className="text-center text-xs text-[#8B7D76] mt-2 pb-0.5">
                        {t("pdp.gallery.front")}
                      </figcaption>
                    </figure>
                    <figure className="bg-card rounded-[16px] p-2 shadow-[0_8px_24px_rgba(23,18,16,0.06)]">
                      <div className="rounded-[12px] overflow-hidden aspect-square bg-card flex items-center justify-center">
                        <img
                          src={
                            activeColor.views?.side ?? gallery[1] ?? gallery[0]
                          }
                          alt={t("pdp.gallery.side")}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <figcaption className="text-center text-xs text-[#8B7D76] mt-2 pb-0.5">
                        {t("pdp.gallery.side")}
                      </figcaption>
                    </figure>
                  </div>
                </div>
              )}
              {tab === "lens" && (
                <div>
                  <div className="text-[13.5px] leading-[22px] text-[#6B5E58] mb-6">
                    {t("pdp.lens.body")}
                  </div>
                  <div className="grid gap-5">
                    {[
                      {
                        Icon: Monitor,
                        titleKey: "pdp.lens.feat.blue.title",
                        descKey: "pdp.lens.feat.blue.desc",
                      },
                      {
                        Icon: Sun,
                        titleKey: "pdp.lens.feat.photo.title",
                        descKey: "pdp.lens.feat.photo.desc",
                      },
                      {
                        Icon: Layers,
                        titleKey: "pdp.lens.feat.polar.title",
                        descKey: "pdp.lens.feat.polar.desc",
                      },
                      {
                        Icon: Car,
                        titleKey: "pdp.lens.feat.driving.title",
                        descKey: "pdp.lens.feat.driving.desc",
                      },
                      {
                        Icon: Palette,
                        titleKey: "pdp.lens.feat.tinted.title",
                        descKey: "pdp.lens.feat.tinted.desc",
                      },
                    ].map(({ Icon, titleKey, descKey }) => (
                      <div key={titleKey} className="flex gap-[14px]">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-[#F5EFE8] flex items-center justify-center">
                          <Icon
                            className="w-[22px] h-[22px] text-[#1E1510]"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-bold text-[#1E1510] leading-5 mb-1">
                            {t(titleKey as never)}
                          </h4>
                          <p className="text-[12.5px] leading-[18px] text-[#6B5E58]">
                            {t(descKey as never)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-[#EDE3DA]">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A89A93] mb-3.5">
                      {t("rx.coatings")}
                    </h4>
                    <ul>
                      {COATINGS.map((c) => (
                        <li key={c.id} className="flex items-baseline h-8">
                          <span className="w-[102px] shrink-0 text-right pr-3.5 text-[11.5px] text-[#8B7D76]">
                            ✓
                          </span>
                          <span className="text-[13px] text-[#1E1510]">
                            {t(c.key as never)} +${c.extra}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {tab === "shipping" && (
                <div>
                  <div className="text-[13.5px] leading-[22px] text-[#6B5E58] mb-6">
                    {t("pdp.shipping.body")}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-card border border-[#E9E1D8] rounded-[16px] p-[18px]">
                      <Truck
                        className="w-5 h-5 text-[#3D2B24] mb-3"
                        strokeWidth={1.5}
                      />
                      <p className="text-[14px] font-bold text-[#1E1510]">
                        {t("service.global")}
                      </p>
                    </div>
                    <div className="bg-card border border-[#E9E1D8] rounded-[16px] p-[18px]">
                      <RotateCcw
                        className="w-5 h-5 text-[#3D2B24] mb-3"
                        strokeWidth={1.5}
                      />
                      <p className="text-[14px] font-bold text-[#1E1510]">
                        {t("service.return")}
                      </p>
                    </div>
                    <div className="bg-card border border-[#E9E1D8] rounded-[16px] p-[18px]">
                      <ShieldCheck
                        className="w-5 h-5 text-[#3D2B24] mb-3"
                        strokeWidth={1.5}
                      />
                      <p className="text-[14px] font-bold text-[#1E1510]">
                        {t("service.warranty")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {tab === "faq" && (
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="border-[#EDE3DA]"
                    >
                      <AccordionTrigger className="h-[52px] py-0 text-[14px] font-semibold text-[#1E1510] [&>svg]:text-[#1E1510]">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[13px] leading-[22px] text-[#6B5E58]">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {tab === "reviews" && (
                <ProductReviews
                  compact
                  lang={contentLang}
                  reviews={visibleReviews}
                  stats={reviewStats}
                  starsLabel={t("pdp.reviews.stars")}
                  reviewsLabel={t("product.reviews")}
                  avgTitle={t("pdp.reviews.avgTitle")}
                  onSubmit={submitReview}
                  submitting={reviewSubmitting}
                  error={reviewError}
                />
              )}
            </div>
            {recommended.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-end justify-between mb-4">
                  <h3 className="text-base font-semibold font-display">
                    {t("pdp.recommend.title")}
                  </h3>
                  <LangLink
                    to={
                      product.categories.includes("presbyopia")
                        ? "/presbyopia"
                        : "/myopia"
                    }
                    className="text-xs text-primary inline-flex items-center gap-1"
                  >
                    {t("nav.viewAll")} <ChevronRight className="w-3 h-3" />
                  </LangLink>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recommended.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP layout — md+ keeps the existing two-column page unchanged.
          Mobile-only blocks inside (gallery, color picker) stay for code
          locality but are inert here because this wrapper is hidden on
          mobile. */}
      <div className="hidden md:block mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-10">
        <nav className="hidden md:block text-xs text-muted-foreground mb-6">
          <LangLink to="/" className="hover:text-primary">
            {t("nav.home")}
          </LangLink>{" "}
          /{" "}
          <LangLink
            to={
              product.categories.includes("presbyopia")
                ? "/presbyopia"
                : "/myopia"
            }
            className="hover:text-primary"
          >
            {product.categories.includes("presbyopia")
              ? t("nav.presbyopia")
              : t("nav.myopia")}
          </LangLink>{" "}
          / <span className="text-foreground">{displayProductName}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:items-start">
          {/* Gallery — sticky so it stays aligned while right column scrolls the page */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {/* Mobile gallery — full-bleed swipe carousel with counter pill +
              AR Try-On overlay. Matches the zeelool mobile PDP pattern so
              the hero frame gets the full screen width instead of being
              squeezed by the vertical thumb rail. */}
            <div className="md:hidden -mx-6">
              <div className="relative">
                <div
                  ref={mobileGalleryRef}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const next = Math.round(el.scrollLeft / el.clientWidth);
                    if (
                      next !== activeImg &&
                      next >= 0 &&
                      next < gallery.length
                    ) {
                      setActiveImg(next);
                    }
                  }}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                >
                  {gallery.map((src, i) => (
                    <div
                      key={i}
                      className="snap-center shrink-0 w-screen aspect-square bg-white"
                    >
                      <img
                        src={src}
                        alt={`${displayProductName} ${i + 1}`}
                        className="w-full h-full object-contain"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ))}
                </div>
                {/* Badges top-left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
                  {product.isNew && (
                    <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {t("pdp.badge.new")}
                    </span>
                  )}
                  {product.originalPriceUSD &&
                    product.originalPriceUSD > product.priceUSD && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                        -
                        {Math.round(
                          (1 - product.priceUSD / product.originalPriceUSD) *
                            100,
                        )}
                        %
                      </span>
                    )}
                </div>
                {/* Counter pill bottom-left (e.g. "2 / 6") */}
                {gallery.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-black/55 text-white text-[11px] font-medium px-2.5 py-1 rounded-full tabular-nums">
                    {Math.min(activeImg, gallery.length - 1) + 1} /{" "}
                    {gallery.length}
                  </div>
                )}
                {/* AR Try-On bottom-right */}
                <LangLink
                  to="/try-on"
                  search={{ frame: product.slug } as never}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-card/95 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-medium shadow-soft"
                >
                  <Camera className="w-3.5 h-3.5" /> {t("product.tryon")}
                </LangLink>
              </div>
            </div>

            {/* Mobile-only color picker — sits directly under the swipe
              carousel so the user can swap colors without scrolling past
              title/price. Desktop renders the same picker in the info column. */}
            {frameColorPicker && (
              <div className="md:hidden mt-5">{frameColorPicker}</div>
            )}

            {/* Desktop gallery — vertical thumb rail + zoomable main image */}
            <div className="hidden md:flex gap-3">
              {/* Vertical thumbnail strip on the left (zeelool-style) */}
              {gallery.length > 1 && (
                <div className="flex flex-col gap-2 w-16 shrink-0">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-smooth bg-secondary/40 ${
                        Math.min(activeImg, gallery.length - 1) === i
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                      aria-label={`${displayProductName} ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt={`${displayProductName} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              {/* Main image — hover anywhere on PC to zoom into that point
                (cursor-zoom-in). Touch devices skip the JS zoom and keep
                native pinch-to-zoom on the underlying image. */}
              <div
                className="relative aspect-square flex-1 rounded-3xl overflow-hidden cursor-zoom-in bg-white shadow-card"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setZoomOrigin({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onMouseLeave={() => setZoomOrigin(null)}
              >
                {product.isNew && (
                  <span className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full pointer-events-none">
                    {t("pdp.badge.new")}
                  </span>
                )}
                {product.originalPriceUSD &&
                  product.originalPriceUSD > product.priceUSD && (
                    <span
                      className="absolute top-4 left-4 z-10 mt-0 bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full pointer-events-none"
                      style={{ marginTop: product.isNew ? "32px" : 0 }}
                    >
                      -
                      {Math.round(
                        (1 - product.priceUSD / product.originalPriceUSD) * 100,
                      )}
                      %
                    </span>
                  )}
                <img
                  src={
                    gallery[Math.min(activeImg, gallery.length - 1)] ??
                    product.framePng
                  }
                  alt={displayProductName}
                  className="w-full h-full object-contain transition-transform duration-150 ease-out will-change-transform"
                  style={
                    zoomOrigin
                      ? {
                          transform: "scale(2.5)",
                          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        }
                      : undefined
                  }
                />
                <LangLink
                  to="/try-on"
                  search={{ frame: product.slug } as never}
                  className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-card/95 backdrop-blur px-4 py-2 rounded-full text-xs font-medium hover:bg-card transition-smooth shadow-soft"
                >
                  <Camera className="w-3.5 h-3.5" /> {t("product.tryon")}
                </LangLink>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Title row with rating immediately under (Zeelool-style) */}
            <div className="flex items-start justify-between gap-3">
              <div>
                {product.fashion && (
                  <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-primary mb-2">
                    {t("product.fashionTag")}
                  </span>
                )}
                <h1 className="text-xl md:text-3xl lg:text-[19px] xl:text-2xl font-semibold font-display leading-snug -mt-1">
                  {headingText}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 first-letter:uppercase">
                  {shapeLabel(product.shape, t)} ·{" "}
                  {materialLabel(product.material, t)}
                  {product.finish
                    ? ` · ${finishLabel(product.finish, contentLang)}`
                    : ""}{" "}
                  ·{" "}
                  {product.categories.includes("presbyopia")
                    ? t("nav.presbyopia")
                    : t("nav.myopia")}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => {
                    const wasLiked = liked;
                    toggleFav(product.id);
                    if (!wasLiked) {
                      setHeartBurst(true);
                      setTimeout(() => setHeartBurst(false), 700);
                    }
                    toast.success(
                      wasLiked ? t("favorites.removed") : t("favorites.added"),
                      {
                        action: !wasLiked
                          ? {
                              label: t("pdp.fav.viewAction"),
                              onClick: () =>
                                navigate({ to: `/${lang}/favorites` }),
                            }
                          : undefined,
                      },
                    );
                  }}
                  className="relative w-10 h-10 rounded-full border border-border hover:border-primary/50 flex items-center justify-center transition-smooth overflow-visible"
                  aria-label={liked ? t("pdp.unfav") : t("pdp.fav")}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${liked ? "fill-primary text-primary" : ""} ${heartBurst ? "animate-heart-pop" : ""}`}
                  />
                  {heartBurst && (
                    <>
                      <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <span
                          key={deg}
                          className="pointer-events-none absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-heart-particle"
                          style={{ ["--angle" as never]: `${deg}deg` }}
                        />
                      ))}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShareOpen(true)}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary/50 flex items-center justify-center transition-smooth"
                  aria-label={t("pdp.share")}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 mt-3 text-sm">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(reviewStats.average) ? "fill-amber-500" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-foreground font-medium">
                {reviewAverageText}
              </span>
              <span className="text-muted-foreground">
                ({reviewStats.count} {t("product.reviews")})
              </span>
            </div>

            {/* Price block — large, Zeelool-style */}
            <div className="mt-5">
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-foreground">${total}</p>
                {product.originalPriceUSD && (
                  <p className="text-base line-through text-muted-foreground">
                    ${product.originalPriceUSD}
                  </p>
                )}
                {product.originalPriceUSD &&
                  product.originalPriceUSD > product.priceUSD && (
                    <span className="text-xs font-semibold font-display bg-destructive/10 text-destructive px-2 py-1 rounded">
                      -
                      {Math.round(
                        (1 - product.priceUSD / product.originalPriceUSD) * 100,
                      )}
                      % {t("pdp.discount.off")}
                    </span>
                  )}
              </div>
            </div>

            {/* Size — Zeelool-style: label + dimension string + Size chart link */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold">{t("pdp.size.label")}: </span>
                  <span className="text-foreground/80">
                    {t("pdp.size.medium")} ({product.size.lensWidth}-
                    {product.size.bridge}-{product.size.temple} mm)
                  </span>
                </div>
                <button
                  onClick={() => setSizeChartOpen(true)}
                  className="text-xs text-foreground/70 inline-flex items-center gap-1 hover:text-primary transition-smooth"
                >
                  {t("pdp.size.chart")} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Frame Color (desktop) — mobile renders the same picker directly
              below the image carousel; this copy is hidden there. */}
            {frameColorPicker && (
              <div className="hidden md:block mt-6">{frameColorPicker}</div>
            )}

            {/* Primary CTAs — Select Lenses + Frame Only. Hidden on mobile
              because the same buttons live in a sticky bottom bar (see end
              of component) so the user always has a single, reachable CTA. */}
            <div className="mt-6 hidden md:grid grid-cols-2 gap-3">
              <Button
                size="lg"
                onClick={() => setWizardMode("lenses")}
                className="rounded-full h-14 text-base font-semibold shadow-soft"
              >
                {t("pdp.selectLens")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setWizardMode("frameOnly")}
                className="rounded-full h-14 text-base font-semibold border-2"
              >
                {t("rx.mode.frameOnly")}
              </Button>
            </div>
            {/* Trust row — in-stock / promo / services & guarantees. The
                guarantees content lives in a popup (see GuaranteesModal), not
                an inline dropdown, so the info column stays compact and no
                tall empty gap builds up below the hero image. */}
            <div className="mt-2 flex items-center justify-center gap-x-4 gap-y-1.5 flex-wrap text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> {t("pdp.inStock")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> {t("pdp.promo.line1")}
              </span>
              <button
                onClick={() => setGuaranteesOpen(true)}
                className="inline-flex items-center gap-1.5 hover:text-primary transition-smooth"
                aria-haspopup="dialog"
              >
                <ShieldCheck className="w-3 h-3" />
                {t("pdp.guarantees.title")}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail tabs */}
        <div className="mt-16 border-t border-border pt-10">
          <div className="flex flex-wrap items-end gap-7 border-b border-[#E9E1D8] mb-8">
            {(
              [
                "details",
                "description",
                "lens",
                "shipping",
                "faq",
                "reviews",
              ] as const
            ).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`pb-[11px] text-sm border-b-2 -mb-px transition-smooth ${tab === id ? "border-foreground text-foreground font-bold" : "border-transparent text-[#8B7D76] hover:text-foreground"}`}
              >
                {t(`pdp.tabs.${id}` as never)}
                {id === "reviews" && (
                  <span className="ml-1.5 text-xs text-[#8B7D76]">
                    ({reviewStats.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div>
            {tab === "details" && (
              <div className="rounded-2xl bg-secondary/60 p-6 md:p-10 grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-14">
                {/* Left — grouped spec rows (Pdp-Exact-Clone card layout) */}
                <div className="text-sm">
                  {[
                    {
                      title: t("pdp.specs.group.dimensions"),
                      rows: [
                        [
                          t("product.lensWidth"),
                          `${product.size.lensWidth} mm`,
                        ],
                        [
                          t("pdp.specs.lensHeight"),
                          `${Math.round(product.size.lensWidth * 0.78)} mm`,
                        ],
                        [
                          t("pdp.specs.frameWidth"),
                          `${product.size.lensWidth * 2 + product.size.bridge + 5} mm`,
                        ],
                        [t("product.bridge"), `${product.size.bridge} mm`],
                        [t("product.temple"), `${product.size.temple} mm`],
                      ],
                    },
                    {
                      title: t("pdp.specs.group.fit"),
                      rows: [
                        [t("pdp.size.label"), t("pdp.size.medium")],
                        [t("pdp.specs.bridgeFit"), t("pdp.specs.universalFit")],
                        [
                          t("pdp.specs.weight"),
                          product.weightG ? `${product.weightG} g` : "19.1 g",
                        ],
                        [t("pdp.specs.rim"), t("pdp.specs.rimFull")],
                        [t("pdp.specs.pdRange"), "54 ~ 78"],
                      ],
                    },
                    {
                      title: t("pdp.specs.group.material"),
                      rows: [
                        [t("pdp.specs.shape"), shapeLabel(product.shape, t)],
                        [
                          t("pdp.specs.frameMaterial"),
                          materialLabel(product.material, t),
                        ],
                        ...(isFashionReader
                          ? [
                              [
                                contentLang === "zh"
                                  ? "放大倍数"
                                  : "Magnification",
                                "+1.0 to +3.5",
                              ],
                            ]
                          : [
                              [
                                t("pdp.specs.progressive"),
                                product.categories.includes("presbyopia")
                                  ? t("pdp.specs.yes")
                                  : t("pdp.specs.no"),
                              ],
                            ]),
                        [t("pdp.specs.springHinge"), t("pdp.specs.no")],
                        [t("pdp.specs.adjustableNosepads"), t("pdp.specs.no")],
                        ...(isFashionReader
                          ? [
                              [
                                contentLang === "zh"
                                  ? "度数（仅放大）"
                                  : "Diopter",
                                "+1.00 ~ +3.50",
                                contentLang === "zh"
                                  ? "（仅放大）"
                                  : "(magnification only)",
                              ],
                            ]
                          : [[t("pdp.specs.rxRange"), "-20.00 ~ +10.00"]]),
                      ],
                    },
                  ].map((group, gi) => (
                    <div key={group.title} className={gi > 0 ? "mt-6" : ""}>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 mb-3.5">
                        {group.title}
                      </h4>
                      <dl>
                        {group.rows.map(([k, v, sub]) => (
                          <div key={k} className="flex items-baseline h-8">
                            <dt className="w-[138px] shrink-0 text-right pr-3.5 text-[12.5px] text-muted-foreground">
                              {k}
                            </dt>
                            <dd className="text-sm font-bold text-foreground">
                              {v}
                              {sub && (
                                <span className="font-normal text-muted-foreground text-[12.5px] ml-1.5">
                                  {sub}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {gi < 2 && <div className="h-px bg-[#EDE3DA] my-5" />}
                    </div>
                  ))}
                </div>

                {/* Right — product summary, photo + measurement diagram */}
                <div>
                  <h4 className="text-[17px] md:text-[18.5px] font-extrabold text-foreground leading-6 tracking-tight">
                    {displayProductName}
                    {product.finish
                      ? ` · ${finishLabel(product.finish, contentLang)}`
                      : ""}
                  </h4>
                  {(detailsTagline.hook || detailsTagline.rest) && (
                    <p className="mt-2 text-[13px] leading-5 text-muted-foreground max-w-[340px]">
                      {detailsTagline.hook && (
                        <strong className="text-foreground font-bold">
                          {detailsTagline.hook}
                        </strong>
                      )}
                      {detailsTagline.hook && detailsTagline.rest ? " — " : ""}
                      {detailsTagline.rest}
                    </p>
                  )}
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {[
                      materialLabel(product.material, t),
                      shapeLabel(product.shape, t),
                      t("pdp.specs.rimFull"),
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="text-[11px] px-[11px] py-[5px] rounded-full bg-card border border-border text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 bg-card rounded-[16px] p-2 shadow-card flex flex-col gap-2">
                    {detailImg && (
                      <div className="rounded-[12px] px-[10px] pt-[14px] pb-[12px] leading-none">
                        <img
                          src={detailImg}
                          alt={displayProductName}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                          onError={(e) => {
                            // Broken R2 key (e.g. 8663's never-uploaded colors):
                            // hide instead of showing a broken-image glyph.
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="rounded-[12px] bg-[#F5EFE8] px-[16px] pt-[18px] pb-[16px] leading-none">
                      <FrameMeasurementsDiagram
                        lensWidth={product.size.lensWidth}
                        bridge={product.size.bridge}
                        temple={product.size.temple}
                        shape={product.shape}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "description" && (
              <div className="bg-[#FAF6F1] rounded-[20px] p-7">
                <div className="grid md:grid-cols-[1fr_480px] gap-14 items-start">
                  <div>
                    <div className="text-[13.5px] leading-[22px] text-[#6B5E58]">
                      <p className="mb-4">{t("pdp.details.body")}</p>
                      <p className="mb-4">{t("pdp.desc.body")}</p>
                    </div>
                    <div className="mt-1">
                      {pickLangArray(product.highlights, contentLang).map(
                        (h: string) => (
                          <div
                            key={h}
                            className="flex items-center gap-[10px] h-8 text-[14px] text-[#1E1510]"
                          >
                            <span className="text-[#5A3E2E] font-bold">✓</span>
                            <span>{h}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <figure className="bg-card rounded-[16px] p-2 shadow-[0_8px_24px_rgba(23,18,16,0.06)]">
                      <div className="rounded-[12px] overflow-hidden aspect-square bg-card flex items-center justify-center">
                        <img
                          src={
                            activeColor.views?.front ??
                            activeColor.views?.angle ??
                            gallery[0]
                          }
                          alt={t("pdp.gallery.front")}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={1024}
                          height={1024}
                        />
                      </div>
                      <figcaption className="text-center text-xs text-[#8B7D76] mt-2 pb-0.5">
                        {t("pdp.gallery.front")}
                      </figcaption>
                    </figure>
                    <figure className="bg-card rounded-[16px] p-2 shadow-[0_8px_24px_rgba(23,18,16,0.06)]">
                      <div className="rounded-[12px] overflow-hidden aspect-square bg-card flex items-center justify-center">
                        <img
                          src={
                            activeColor.views?.side ?? gallery[1] ?? gallery[0]
                          }
                          alt={t("pdp.gallery.side")}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={1024}
                          height={1024}
                        />
                      </div>
                      <figcaption className="text-center text-xs text-[#8B7D76] mt-2 pb-0.5">
                        {t("pdp.gallery.side")}
                      </figcaption>
                    </figure>
                  </div>
                </div>
              </div>
            )}

            {tab === "lens" && (
              <div className="bg-[#FAF6F1] rounded-[20px] p-7">
                <div className="text-[13.5px] leading-[22px] text-[#6B5E58] mb-6">
                  {t("pdp.lens.body")}
                </div>
                <div className="grid sm:grid-cols-2 gap-x-14 gap-y-6">
                  {[
                    {
                      Icon: Monitor,
                      titleKey: "pdp.lens.feat.blue.title",
                      descKey: "pdp.lens.feat.blue.desc",
                    },
                    {
                      Icon: Sun,
                      titleKey: "pdp.lens.feat.photo.title",
                      descKey: "pdp.lens.feat.photo.desc",
                    },
                    {
                      Icon: Layers,
                      titleKey: "pdp.lens.feat.polar.title",
                      descKey: "pdp.lens.feat.polar.desc",
                    },
                    {
                      Icon: Car,
                      titleKey: "pdp.lens.feat.driving.title",
                      descKey: "pdp.lens.feat.driving.desc",
                    },
                    {
                      Icon: Palette,
                      titleKey: "pdp.lens.feat.tinted.title",
                      descKey: "pdp.lens.feat.tinted.desc",
                    },
                  ].map(({ Icon, titleKey, descKey }) => (
                    <div key={titleKey} className="flex gap-[14px]">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-[#F5EFE8] flex items-center justify-center">
                        <Icon
                          className="w-[22px] h-[22px] text-[#1E1510]"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[#1E1510] leading-5 mb-1">
                          {t(titleKey as never)}
                        </h4>
                        <p className="text-[12.5px] leading-[18px] text-[#6B5E58]">
                          {t(descKey as never)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 pt-5 border-t border-[#EDE3DA]">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A89A93] mb-3.5">
                    {t("rx.coatings")}
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-x-14">
                    {COATINGS.map((c) => (
                      <li key={c.id} className="flex items-baseline h-8">
                        <span className="w-[138px] shrink-0 text-right pr-3.5 text-[12.5px] text-[#8B7D76]">
                          ✓
                        </span>
                        <span className="text-[14px] text-[#1E1510]">
                          {t(c.key as never)} +${c.extra}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "shipping" && (
              <div className="bg-[#FAF6F1] rounded-[20px] p-7">
                <div className="text-[13.5px] leading-[22px] text-[#6B5E58] mb-6">
                  {t("pdp.shipping.body")}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-card border border-[#E9E1D8] rounded-[16px] p-[18px]">
                    <Truck
                      className="w-5 h-5 text-[#3D2B24] mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-[14px] font-bold text-[#1E1510]">
                      {t("service.global")}
                    </p>
                  </div>
                  <div className="bg-card border border-[#E9E1D8] rounded-[16px] p-[18px]">
                    <RotateCcw
                      className="w-5 h-5 text-[#3D2B24] mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-[14px] font-bold text-[#1E1510]">
                      {t("service.return")}
                    </p>
                  </div>
                  <div className="bg-card border border-[#E9E1D8] rounded-[16px] p-[18px]">
                    <ShieldCheck
                      className="w-5 h-5 text-[#3D2B24] mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-[14px] font-bold text-[#1E1510]">
                      {t("service.warranty")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === "faq" && (
              <div className="bg-[#FAF6F1] rounded-[20px] p-7">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="border-[#EDE3DA]"
                    >
                      <AccordionTrigger className="h-[52px] py-0 text-[14px] font-semibold text-[#1E1510] [&>svg]:text-[#1E1510]">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[13px] leading-[22px] text-[#6B5E58]">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {tab === "reviews" && (
              <div className="bg-[#FAF6F1] rounded-[20px] p-7">
                <ProductReviews
                  lang={contentLang}
                  reviews={visibleReviews}
                  stats={reviewStats}
                  starsLabel={t("pdp.reviews.stars")}
                  reviewsLabel={t("product.reviews")}
                  avgTitle={t("pdp.reviews.avgTitle")}
                  onSubmit={submitReview}
                  submitting={reviewSubmitting}
                  error={reviewError}
                />
              </div>
            )}
          </div>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-semibold font-display">
                {t("pdp.recommend.title")}
              </h2>
              <LangLink
                to={
                  product.categories.includes("presbyopia")
                    ? "/presbyopia"
                    : "/myopia"
                }
                className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
              >
                {t("nav.viewAll")} <ChevronRight className="w-3.5 h-3.5" />
              </LangLink>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* DB content story removed (2026-10-08, owner decision): the long
          "sections" block below the tabs duplicated every tab's content
          (overview / vto / frame spec / lens / shipping / FAQ / reviews /
          quote). The 6 tabs are now the single source of truth; FAQ & V1.1
          shipping copy survive via the faq/shipping tabs and the FAQPage
          JSON-LD in head. See decision-ledger. */}

      {/* Mobile sticky buy bar — app-style persistent CTA (Zeelool pattern).
          The mobile action panel's CTA row is intentionally removed above;
          this fixed bar is the single, always-reachable buy action on <md.
          The lens wizard (z-50) covers it when open.
          Trust mini-line mirrors the desktop trust row (framework-lock V1.1:
          free ship over $69, 30-day exchanges/returns). */}
      <div
        data-sticky-bottom-bar
        className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#E9E1D8] bg-background/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="px-4 pt-2 pb-2.5">
          <div className="text-[11px] text-[#8B7D76] text-center mb-2">
            {t("pdp.g.shipping")} · {t("pdp.g.returns")}
          </div>
          <div className="flex items-center gap-2.5">
            {/* Price */}
            <div className="shrink-0 flex flex-col items-start leading-tight">
              <span className="text-lg font-bold">${total}</span>
              {product.originalPriceUSD &&
                product.originalPriceUSD > product.priceUSD && (
                  <span className="text-xs line-through text-muted-foreground">
                    ${product.originalPriceUSD}
                  </span>
                )}
            </div>
            {/* Favorite — quick save without leaving the page */}
            <button
              onClick={() => {
                const wasLiked = liked;
                toggleFav(product.id);
                if (!wasLiked) {
                  setHeartBurst(true);
                  setTimeout(() => setHeartBurst(false), 700);
                }
                toast.success(
                  wasLiked ? t("favorites.removed") : t("favorites.added"),
                );
              }}
              className="w-11 h-11 shrink-0 rounded-full border border-[#E9E1D8] flex items-center justify-center transition-smooth"
              aria-label={liked ? t("pdp.unfav") : t("pdp.fav")}
            >
              <Heart
                className={`w-[18px] h-[18px] ${liked ? "fill-primary text-primary" : ""}`}
              />
            </button>
            {/* Frame only */}
            <Button
              onClick={() => setWizardMode("frameOnly")}
              variant="outline"
              className="h-11 shrink-0 px-4 rounded-full text-sm font-semibold border-2"
            >
              {t("rx.mode.frameOnly")}
            </Button>
            {/* Select lenses — primary */}
            <Button
              onClick={() => setWizardMode("lenses")}
              className="flex-1 h-11 rounded-full text-sm font-semibold shadow-soft"
            >
              {t("pdp.selectLens")}
            </Button>
          </div>
        </div>
      </div>

      {wizardMode && (
        <LensFlowWizard
          product={product}
          mode={wizardMode}
          initialColorId={colorId}
          onClose={() => setWizardMode(null)}
          onComplete={(sel, lensPriceUsd, lensSkuId) => {
            add({
              product,
              qty: 1,
              colorId: sel.colorId,
              lensSkuId: lensSkuId ?? undefined,
              lensColorId: sel.lensFunctionColorId,
              rxSnapshot: selectionToRxSnapshot(sel) ?? undefined,
              lens: {
                type: sel.category,
                index: sel.index,
                extraUSD: lensPriceUsd,
              },
            });
            toast.success(t("product.addedToCart"));
            setWizardMode(null);
            navigate({ to: `/${lang}/cart` });
          }}
        />
      )}

      {shareOpen && (
        <ShareModal
          product={product}
          onClose={() => setShareOpen(false)}
          copyState={copyState}
          setCopyState={setCopyState}
        />
      )}

      {sizeChartOpen && (
        <SizeChartModal
          product={product}
          onClose={() => setSizeChartOpen(false)}
        />
      )}
      {guaranteesOpen && (
        <GuaranteesModal onClose={() => setGuaranteesOpen(false)} />
      )}
    </>
  );
}

function ProductReviews({
  compact = false,
  lang,
  reviews,
  stats,
  starsLabel,
  reviewsLabel,
  avgTitle,
  onSubmit,
  submitting,
  error,
}: {
  compact?: boolean;
  lang: string;
  reviews: ProductReview[];
  stats: ReviewStats;
  starsLabel: string;
  reviewsLabel: string;
  avgTitle: string;
  onSubmit: (input: ReviewInput) => Promise<void>;
  submitting: boolean;
  error: string | null;
}) {
  const { t } = useI18n();
  void lang;
  const copy = {
    all: t("review.all"),
    sort: t("review.sort"),
    newest: t("review.newest"),
    highest: t("review.highest"),
    lowest: t("review.lowest"),
    verified: t("review.verified"),
    noReviews: t("review.noReviews"),
    write: t("review.write"),
    name: t("review.name"),
    age: t("review.age"),
    review: t("review.review"),
    overall: t("review.overall"),
    quality: t("review.quality"),
    fit: t("review.fit"),
    design: t("review.design"),
    submit: t("review.submit"),
    cancel: t("review.cancel"),
    required: t("review.required"),
    placeholder: t("review.placeholder"),
  };
  const [filter, setFilter] = useState<number | "all">("all");
  const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewInput>({
    name: "",
    age: "",
    rating: 5,
    quality: 5,
    fit: 5,
    design: 5,
    text: "",
  });

  const filteredReviews = useMemo(() => {
    const next = reviews.filter(
      (review) => filter === "all" || review.rating === filter,
    );
    return [...next].sort((a, b) => {
      if (sort === "highest") return b.rating - a.rating;
      if (sort === "lowest") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filter, reviews, sort]);

  const updateForm = <K extends keyof ReviewInput>(
    key: K,
    value: ReviewInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    if (!form.name.trim() || !form.text.trim()) {
      setLocalError(copy.required);
      return;
    }
    try {
      await onSubmit(form);
      setForm({
        name: "",
        age: "",
        rating: 5,
        quality: 5,
        fit: 5,
        design: 5,
        text: "",
      });
      setFormOpen(false);
    } catch {
      // Parent owns the visible async error message.
    }
  };

  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      <div
        className={
          compact
            ? "space-y-5 pb-5 border-b border-border"
            : "grid md:grid-cols-[120px_1fr_320px] gap-8 pb-6 border-b border-[#EDE3DA]"
        }
      >
        <div>
          <div
            className={
              compact
                ? "text-4xl font-bold"
                : "text-[56px] font-extrabold leading-none"
            }
          >
            {stats.average.toFixed(1).replace(/\.0$/, "")}
          </div>
          <StarRating
            value={stats.average}
            size={compact ? "sm" : "md"}
            className="mt-2"
          />
          <div className="text-xs text-[#8B7D76] mt-1.5">
            {stats.count} {reviewsLabel}
          </div>
        </div>

        <div className="space-y-1.5">
          {stats.distribution.map((row) => (
            <button
              type="button"
              key={row.stars}
              onClick={() =>
                setFilter(filter === row.stars ? "all" : row.stars)
              }
              className={`w-full flex items-center gap-3 h-6 text-xs rounded-md px-1 transition-smooth ${
                filter === row.stars ? "bg-secondary" : "hover:bg-secondary/60"
              }`}
            >
              <span className="w-[30px] text-left text-[#6B5E58]">
                {row.stars} {starsLabel}
              </span>
              <span className="flex-1 h-2 rounded-full bg-[#EDE6DC] overflow-hidden">
                <span
                  className="block h-full bg-[#F0A11A]"
                  style={{ width: `${row.pct}%` }}
                />
              </span>
              <span className="w-10 text-right text-[#6B5E58] tabular-nums">
                {row.pct}%
              </span>
            </button>
          ))}
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A89A93] mb-3.5">
            {avgTitle}
          </h4>
          <div className="space-y-1.5">
            {stats.subRatings.map((rating) => (
              <div
                key={rating.label}
                className="flex items-center gap-3 h-6 text-xs"
              >
                <span className="w-10 text-[#6B5E58]">{rating.label}</span>
                <div className="flex-1 h-2 rounded-full bg-[#EDE6DC] overflow-hidden">
                  <div
                    className="h-full bg-[#5C3E2E]"
                    style={{ width: `${(rating.value / 5) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[#6B5E58] tabular-nums">
                  {rating.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="bg-card border border-[#E9E1D8] rounded-full px-[18px] py-2 text-[13px] font-semibold text-[#3D2B24] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-secondary transition-smooth"
          >
            {formOpen ? copy.cancel : copy.write}
          </button>
        </div>
        {formOpen && (
          <form
            onSubmit={submitForm}
            className="space-y-4 rounded-[16px] border border-[#E9E1D8] bg-card p-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {copy.name}
                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                  maxLength={80}
                />
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {copy.age}
                <input
                  value={form.age ?? ""}
                  onChange={(event) => updateForm("age", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                  maxLength={20}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ReviewScoreInput
                label={copy.overall}
                value={form.rating}
                onChange={(value) => updateForm("rating", value)}
              />
              <ReviewScoreInput
                label={copy.quality}
                value={form.quality}
                onChange={(value) => updateForm("quality", value)}
              />
              <ReviewScoreInput
                label={copy.fit}
                value={form.fit}
                onChange={(value) => updateForm("fit", value)}
              />
              <ReviewScoreInput
                label={copy.design}
                value={form.design}
                onChange={(value) => updateForm("design", value)}
              />
            </div>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {copy.review}
              <textarea
                value={form.text}
                onChange={(event) => updateForm("text", event.target.value)}
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                maxLength={2000}
                placeholder={copy.placeholder}
              />
            </label>
            {(localError || error) && (
              <p className="text-xs text-destructive">{localError || error}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#3D2B24] text-white rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50 transition-smooth"
              >
                {copy.submit}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth ${
              filter === "all"
                ? "bg-[#3D2B24] text-white"
                : "bg-card border border-[#E9E1D8] text-[#1E1510] hover:bg-secondary"
            }`}
          >
            {copy.all}
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              type="button"
              key={stars}
              onClick={() => setFilter(stars)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-smooth ${
                filter === stars
                  ? "bg-[#3D2B24] text-white"
                  : "bg-card border border-[#E9E1D8] text-[#1E1510] hover:bg-secondary"
              }`}
            >
              {stars}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-[#8B7D76]">
          {copy.sort}
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as "newest" | "highest" | "lowest")
            }
            className="rounded-full border border-[#E9E1D8] bg-card px-3 py-1.5 text-xs text-[#1E1510] outline-none"
          >
            <option value="newest">{copy.newest}</option>
            <option value="highest">{copy.highest}</option>
            <option value="lowest">{copy.lowest}</option>
          </select>
        </label>
      </div>

      <div className="space-y-0">
        {filteredReviews.length === 0 ? (
          <p className="py-8 text-[13px] text-[#8B7D76]">{copy.noReviews}</p>
        ) : (
          filteredReviews.map((review) => (
            <article
              key={review.id}
              className="border-b border-[#EDE3DA] py-4 last:border-0"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-sm">
                  {review.name}
                  {review.age ? ` · ${review.age}` : ""}
                </span>
                <StarRating value={review.rating} size="sm" />
                {review.verified && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                    {copy.verified}
                  </span>
                )}
                <time className="text-[11px] text-muted-foreground">
                  {new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(review.createdAt))}
                </time>
              </div>
              <p
                className={
                  compact
                    ? "text-xs text-foreground/80 mt-1.5"
                    : "text-sm text-foreground/80 mt-2"
                }
              >
                {review.text}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function ReviewScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-1.5 text-xs text-muted-foreground">
      <span>{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((scoreValue) => (
          <button
            key={scoreValue}
            type="button"
            onClick={() => onChange(scoreValue)}
            className="h-8 w-8 rounded-md border border-border bg-background text-amber-500 hover:bg-secondary"
            aria-label={`${label} ${scoreValue}`}
          >
            <Star
              className={`mx-auto h-4 w-4 ${scoreValue <= value ? "fill-amber-500" : "fill-muted text-muted"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRating({
  value,
  size = "sm",
  className = "",
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className={`flex items-center gap-0.5 text-amber-500 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${iconSize} ${index < Math.round(value) ? "fill-amber-500" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );
}

/**
 * Services & Guarantees popup — opens from the trust row on the PDP info
 * column. Replaces the old inline accordion so the hero area stays compact
 * (no tall dropdown pushing a gap below the image).
 */
function GuaranteesModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const items = [
    { Icon: BadgeCheck, label: t("pdp.g.fsa") },
    { Icon: Truck, label: t("pdp.g.shipping") },
    { Icon: RotateCcw, label: t("pdp.g.returns") },
    { Icon: ShieldCheck, label: t("pdp.g.warranty") },
    { Icon: HeartPulse, label: t("pdp.g.delivery") },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-background shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-smooth"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg md:text-xl font-semibold font-display pr-8">
          {t("pdp.guarantees.title")}
        </h3>

        <div className="mt-4 grid gap-3">
          {items.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
            >
              <Icon
                className="w-4 h-4 text-primary shrink-0"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium text-foreground/90">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SizeChartModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const frameWidth = product.size.lensWidth * 2 + product.size.bridge + 5;
  const lensHeight = Math.round(product.size.lensWidth * 0.78);
  const rows: { label: string; value: string }[] = [
    {
      label: t("pdp.sizeModal.frameWidth"),
      value: `${frameWidth} mm`,
    },
    { label: t("product.lensWidth"), value: `${product.size.lensWidth} mm` },
    { label: t("product.bridge"), value: `${product.size.bridge} mm` },
    { label: t("pdp.sizeModal.lensHeight"), value: `${lensHeight} mm` },
    { label: t("product.temple"), value: `${product.size.temple} mm` },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-background shadow-2xl p-7 md:p-9 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-smooth"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pr-8">
          <h3 className="text-xl md:text-2xl font-semibold font-display">
            {t("pdp.size.chart")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t("pdp.sizeModal.subtitle")}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm">
          <Ruler className="w-4 h-4 text-primary" />
          <span className="font-medium">{t("pdp.sizeModal.thisSize")}:</span>
          <span className="text-foreground/80">
            {t("pdp.size.medium")} ({product.size.lensWidth}-
            {product.size.bridge}-{product.size.temple} mm)
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-secondary/40 p-4 md:p-6">
          <FrameMeasurementsDiagram
            lensWidth={product.size.lensWidth}
            bridge={product.size.bridge}
            temple={product.size.temple}
            shape={product.shape}
            className="max-w-md mx-auto"
          />
        </div>

        <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 border-b border-border/60 pb-2"
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="text-foreground font-semibold tabular-nums">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-foreground/75 leading-relaxed">
          {t("pdp.sizeModal.tip")}
        </div>
      </div>
    </div>
  );
}

function ShareModal({
  product,
  onClose,
  copyState,
  setCopyState,
}: {
  product: { name: Record<string, string>; framePng: string; priceUSD: number };
  onClose: () => void;
  copyState: "idle" | "copied";
  setCopyState: (s: "idle" | "copied") => void;
}) {
  const { t, contentLang } = useI18n();
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = pickLang(product.name, contentLang);
  const shareText = t("pdp.share.text")
    .replace("{title}", title)
    .replace("{url}", url);

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(url);
      setCopyState("copied");
      toast.success(t("pdp.share.linkCopied"));
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      toast.error(t("pdp.share.copyFailed"));
    }
  };

  const channels = [
    {
      id: "wechat",
      label: t("pdp.share.wechat"),
      Icon: MessageCircle,
      color: "bg-emerald-500",
      onClick: () => toast.info(t("pdp.share.wechatHint")),
    },
    {
      id: "x",
      label: "X / Twitter",
      Icon: Share2,
      color: "bg-foreground",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
          "_blank",
        ),
    },
    {
      id: "fb",
      label: "Facebook",
      Icon: Share2,
      color: "bg-blue-600",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        ),
    },
    {
      id: "mail",
      label: "Email",
      Icon: Mail,
      color: "bg-amber-500",
      onClick: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`,
        ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-background shadow-2xl p-7 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-smooth"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-semibold">{t("pdp.share.title")}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
            {title}
          </p>
        </div>

        {/* QR + product preview */}
        <div className="mt-6 flex items-center gap-5 p-4 rounded-2xl bg-secondary/50">
          <div className="bg-background p-2.5 rounded-xl border border-border shrink-0">
            <QRCodeSVG value={url} size={108} level="M" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="aspect-[4/3] rounded-lg bg-background border border-border flex items-center justify-center mb-2 overflow-hidden">
              <img
                src={product.framePng}
                alt={title}
                className="max-h-full object-contain mix-blend-multiply"
              />
            </div>
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-sm text-primary font-semibold">
              ${product.priceUSD}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          {t("pdp.share.scanHint")}
        </p>

        {/* Channels */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={c.onClick}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span
                className={`w-12 h-12 rounded-full ${c.color} text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-soft`}
              >
                <c.Icon className="w-5 h-5" />
              </span>
              <span className="text-[11px] text-muted-foreground">
                {c.label}
              </span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="mt-5 flex items-center gap-2 p-2 pl-4 rounded-full border border-border bg-secondary/30">
          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-foreground/80 outline-none truncate"
          />
          <button
            onClick={copyLink}
            className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-medium transition-smooth ${
              copyState === "copied"
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {copyState === "copied" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                {t("pdp.share.copied")}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {t("pdp.share.copy")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

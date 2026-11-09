import { LangLink } from "@/components/LangLink";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd, faqSchema } from "@/lib/jsonld";
import { pageName } from "@/lib/page-titles";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import {
  resolveHeadMeta,
  glossaryFaq,
  itemListSchema,
  knowledgeHubCards,
  homeShapeCards,
} from "@/lib/operator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Camera,
  Sparkles,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  Star,
  Flame,
  Glasses,
  BookOpen,
  Wrench,
  Award,
  Ruler,
} from "lucide-react";
import heroImg from "@/assets/hero-presbyopia.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import catPres from "@/assets/cat-presbyopia.jpg";
import catMyo from "@/assets/cat-myopia.jpg";
import reviewUser1 from "@/assets/review-user-1.jpg";
import reviewUser2 from "@/assets/review-user-2.jpg";
import reviewUser3 from "@/assets/review-user-3.jpg";
import reviewUser4 from "@/assets/review-user-4.jpg";
import reviewUser5 from "@/assets/review-user-5.jpg";
import reviewUser6 from "@/assets/review-user-6.jpg";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    // head 走操盘手系统：keyword-library 主词 + seo-meta 模式 + brand 口径
    // （resolveHeadMeta）。FAQPage JSON-LD 放在 body 内 <JsonLd> 输出
    // （与 __root 的 Organization/WebSite 同模式），不走 head() scripts。
    // en 用 keyword-library 生成的标题；其他语言用 page-titles 的译文。
    const meta = resolveHeadMeta("home");
    const isEn = !params.lang || params.lang === "en";
    const title = isEn ? meta.title : `${pageName("home", params.lang)} | loollook`;
    const description = isEn ? meta.description : pageDesc("home", params.lang);
    const ogDescription = isEn ? meta.ogDescription : pageOgDesc("home", params.lang);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: meta.keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: ogDescription },
        { name: "twitter:description", content: ogDescription },
        { property: "og:image", content: meta.ogImage },
      ],
    };
  },
  component: Index,
});

interface Banner {
  slot: number;
  bannerId: string;
  imageUrl: string;
  subtitle: Record<string, string>;
  eyebrow: Record<string, string>;
  title: Record<string, string>;
  sub: Record<string, string>;
  productId: string;
  productSlug: string;
  productName: Record<string, string>;
  priceCents: number;
  originalPriceCents: number | null;
  frontUrl: string | null;
}

interface UgcCardApi {
  id: string;
  slot: number;
  imageUrl: string | null;
  name: string;
  rating: number;
  text: Record<string, string>;
  linkHref: string | null;
}

interface PromoBannerApi {
  id: string;
  kind: "tryon" | "brand";
  imageUrl: string | null;
  eyebrow: Record<string, string>;
  title: Record<string, string>;
  sub: Record<string, string>;
  cta: Record<string, string>;
  linkHref: string;
}

function Index() {
  const { t, lang, contentLang } = useI18n();
  const products = useCatalogProducts();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ugcRows, setUgcRows] = useState<UgcCardApi[]>([]);
  const [promoRows, setPromoRows] = useState<PromoBannerApi[]>([]);
  const [audienceCfg, setAudienceCfg] = useState<{
    distance?: { image_url: string; href: string | null };
    reading?: { image_url: string; href: string | null };
  }>({});
  useEffect(() => {
    let alive = true;
    fetch("/api/home-banners", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { banners: Banner[] }) => {
        if (alive) setBanners(d.banners);
      })
      .catch(() => {});
    fetch("/api/home-ugc", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { cards: UgcCardApi[] }) => {
        if (alive) setUgcRows(d.cards ?? []);
      })
      .catch(() => {});
    fetch("/api/home-promo-banners", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { banners: PromoBannerApi[] }) => {
        if (alive) setPromoRows(d.banners ?? []);
      })
      .catch(() => {});
    fetch("/api/audience-banners", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then(
        (d: {
          banners: {
            audience: string;
            image_url: string;
            href: string | null;
          }[];
        }) => {
          if (!alive) return;
          const next: typeof audienceCfg = {};
          for (const b of d.banners) {
            if (b.audience === "distance" || b.audience === "reading") {
              next[b.audience] = { image_url: b.image_url, href: b.href };
            }
          }
          setAudienceCfg(next);
        },
      )
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const promoTryon = promoRows.find((p) => p.kind === "tryon") ?? null;
  const promoBrand = promoRows.find((p) => p.kind === "brand") ?? null;
  const pickPromoText = (
    field: Record<string, string> | undefined,
    fallback: string,
  ): string => {
    if (!field) return fallback;
    return (
      field[contentLang] ??
      field[lang] ??
      field.en ??
      Object.values(field).find((v) => typeof v === "string" && v.length > 0) ??
      fallback
    );
  };

  const fallbackSlides = [heroImg, hero2, hero3, hero4];
  const slideEntries: { src: string; slug: string | null }[] =
    banners.length > 0
      ? banners.map((b) => ({ src: b.imageUrl, slug: b.productSlug }))
      : fallbackSlides.map((src) => ({ src, slug: null }));
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroIdx((i) => (i + 1) % slideEntries.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slideEntries.length]);
  const activeBanner: Banner | null = banners[heroIdx] ?? null;

  const pickBannerText = (
    field: Record<string, string> | undefined,
  ): string | null => {
    if (!field) return null;
    const ordered = [
      contentLang,
      "en",
      "zh",
      "ja",
      "ko",
      "es",
      "fr",
      "de",
      "it",
      "pt",
      "ar",
    ];
    for (const k of ordered) {
      const v = field[k];
      if (typeof v === "string" && v.length > 0) return v;
    }
    return null;
  };
  const heroEyebrow =
    pickBannerText(activeBanner?.eyebrow) ?? t("hero.eyebrow");
  const heroTitle = pickBannerText(activeBanner?.title) ?? t("hero.title");
  const heroSub = pickBannerText(activeBanner?.sub) ?? t("hero.sub");

  // ── Product picks (DB-driven, with sensible fallbacks) ──────────────────
  // Each section dedupes so a single product won't dominate multiple rails.
  const take4 = (list: typeof products) =>
    [
      ...list,
      ...products.filter((p) => !list.some((x) => x.id === p.id)),
    ].slice(0, 4);

  const bestsellers = take4(products.filter((p) => p.bestseller));
  const fashionPicks = take4(
    products.filter(
      (p) => p.styles.includes("minimal") || p.styles.includes("character"),
    ),
  );
  // Section 7 is the "New Arrivals" rail — show isNew frames first, then fall
  // back to the broader catalog via take4()'s built-in padding so the rail
  // always renders four cards even when isNew is empty.
  const distancePicks = take4(products.filter((p) => p.isNew));

  // ── Frame shapes (9, with localized labels) ─────────────────────────────
  const shapes = [
    {
      key: "aviator",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 18 L46 50 Q52 52 56 46 L66 22 Q67 18 63 18 Z" />
          <path d="M132 18 L94 50 Q88 52 84 46 L74 22 Q73 18 77 18 Z" />
          <path d="M66 24 Q70 22 74 24" />
          <path d="M4 18 L8 18" />
          <path d="M132 18 L136 18" />
        </svg>
      ),
    },
    {
      key: "cateye",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 22 Q12 48 36 48 Q62 48 64 18 Q60 14 36 16 Q14 18 6 22 Z" />
          <path d="M134 22 Q128 48 104 48 Q78 48 76 18 Q80 14 104 16 Q126 18 134 22 Z" />
          <path d="M64 22 Q70 20 76 22" />
        </svg>
      ),
    },
    {
      key: "round",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="36" cy="32" r="22" />
          <circle cx="104" cy="32" r="22" />
          <path d="M58 30 Q70 26 82 30" />
        </svg>
      ),
    },
    {
      key: "oval",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse cx="36" cy="32" rx="28" ry="18" />
          <ellipse cx="104" cy="32" rx="28" ry="18" />
          <path d="M64 30 Q70 26 76 30" />
        </svg>
      ),
    },
    {
      key: "browline",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 18 Q34 8 62 18 Q58 50 36 50 Q12 50 6 18 Z" />
          <path d="M78 18 Q106 8 134 18 Q128 50 104 50 Q82 50 78 18 Z" />
          <path d="M62 22 Q70 20 78 22" />
          <path d="M6 18 Q34 14 62 18" strokeWidth="3.2" />
          <path d="M78 18 Q106 14 134 18" strokeWidth="3.2" />
        </svg>
      ),
    },
    {
      key: "butterfly",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14 Q8 50 38 50 Q66 50 64 22 Q60 16 36 14 Q14 14 4 14 Z" />
          <path d="M136 14 Q132 50 102 50 Q74 50 76 22 Q80 16 104 14 Q126 14 136 14 Z" />
          <path d="M64 26 Q70 22 76 26" />
        </svg>
      ),
    },
    {
      key: "geometric",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 22 L24 12 L52 12 L64 26 L52 48 L24 48 Z" />
          <path d="M76 26 L88 12 L116 12 L126 22 L116 48 L88 48 Z" />
          <path d="M64 26 L76 26" />
        </svg>
      ),
    },
    {
      key: "rectangle",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="20" width="56" height="24" rx="5" />
          <rect x="76" y="20" width="56" height="24" rx="5" />
          <path d="M64 32 L76 32" />
        </svg>
      ),
    },
    {
      key: "square",
      svg: (
        <svg
          viewBox="0 0 140 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="10" width="54" height="40" rx="5" />
          <rect x="78" y="10" width="54" height="40" rx="5" />
          <path d="M62 30 L78 30" />
        </svg>
      ),
    },
  ] as const;

  // Glossary-driven shape cards — 图标留在本地，话术/趋势/链接取 glossary 库
  // （homeShapeCards）：带 active SKU 的形状（oval→lool-8663, square→
  // lool-tr90-square）直链 PDP，其余进 /products?shape=。
  const glossaryShapes = homeShapeCards();
  const shapeCards = shapes.map((s) => ({
    ...s,
    ...(glossaryShapes.find((c) => c.key === s.key) ?? {}),
  }));

  // FAQ 区文案 = glossary 教育词（与 head() 的 FAQPage JSON-LD 同源，EN 先行）。
  const faqItems = glossaryFaq();

  // ── Trust & service badges ──────────────────────────────────────────────
  // 对齐 framework-lock trust_kit：包邮 / 退换 / 真人试戴 / 量瞳距 / 真人客服。
  // 展示文案走 i18n（数值口径与 trustTokens() 库值一致），图标语义对齐 trust_kit。
  const trustItems = [
    {
      icon: Truck,
      titleKey: "home.trust.shipping.title",
      descKey: "home.trust.shipping.desc",
    },
    {
      icon: ShieldCheck,
      titleKey: "home.trust.returns.title",
      descKey: "home.trust.returns.desc",
    },
    {
      icon: Camera,
      titleKey: "home.trust.tryon.title",
      descKey: "home.trust.tryon.desc",
    },
    {
      icon: Ruler,
      titleKey: "home.trust.measure.title",
      descKey: "home.trust.measure.desc",
    },
    {
      icon: HeadphonesIcon,
      titleKey: "home.trust.support.title",
      descKey: "home.trust.support.desc",
    },
  ] as const;

  // ── UGC reviewer cards (6, lang-keyed objects inline) ───────────────────
  const ugcCards = [
    {
      img: reviewUser1,
      name: "Sarah M.",
      text: {
        en: "Love these frames! So lightweight and comfortable for all-day wear, perfect for my commute and office days.",
        zh: "太喜欢了！整天戴着完全无负担，通勤和办公都很搭。",
        es: "¡Me encantan estas monturas! Súper ligeras y cómodas todo el día, perfectas para el día a día.",
        fr: "J'adore ces montures ! Légères et confortables toute la journée, parfaites pour le quotidien.",
        de: "Ich liebe diese Fassungen! Federleicht und bequem für den ganzen Tag.",
        it: "Adoro queste montature! Leggerissime e comode tutto il giorno.",
        pt: "Amo essas armações! Leves e confortáveis para usar o dia todo.",
        ja: "本当に気に入っています！軽くて一日中快適、通勤やオフィスにぴったり。",
        ko: "정말 마음에 들어요! 가볍고 종일 편하게 쓰기 좋아요.",
        ar: "أحب هذه الإطارات! خفيفة ومريحة طوال اليوم.",
        vi: "Mê gọng kính này luôn! Siêu nhẹ và thoải mái cả ngày, hoàn hảo cho việc đi làm và văn phòng.",
        th: "ชอบกรอบนี้มาก! เบาและสบายใส่ได้ทั้งวัน เหมาะสำหรับเดินทางและทำงานออฟฟิศ",
        id: "Suka banget sama frame ini! Super ringan dan nyaman dipakai seharian, pas untuk komuter dan kerja kantoran.",
        ms: "Sukakan bingkai ini! Sangat ringan dan selesa dipakai sepanjang hari, sesuai untuk pergi kerja dan di pejabat.",
      },
    },
    {
      img: reviewUser2,
      name: "James R.",
      text: {
        en: "Beautifully made and the fit is spot on. Got tons of compliments at work.",
        zh: "做工精致，戴着特别合适，办公室收获一堆称赞。",
        es: "Acabado precioso y el ajuste es perfecto. Muchos cumplidos en la oficina.",
        fr: "Magnifique finition et ajustement parfait. Plein de compliments au travail.",
        de: "Wunderschön verarbeitet und passt perfekt. Viele Komplimente im Büro.",
        it: "Bellissima fattura e calzata perfetta. Tanti complimenti in ufficio.",
        pt: "Acabamento lindo e ajuste perfeito. Recebi muitos elogios no trabalho.",
        ja: "美しい作りでフィット感も完璧。職場でたくさん褒められました。",
        ko: "마감이 좋고 핏이 딱 맞아요. 회사에서 칭찬 많이 받았어요.",
        ar: "صناعة جميلة ومقاس مثالي. تلقيت إطراءً كثيرًا في العمل.",
        vi: "Hoàn thiện đẹp và vừa vặn hoàn hảo. Được khen tới tấp ở chỗ làm.",
        th: "งานประณีตและเข้ารูปพอดี ที่ทำงานชมเยอะมาก",
        id: "Pengerjaannya bagus dan pas banget di wajah. Dapat banyak pujian di kantor.",
        ms: "Buatan cantik dan padan sempurna. Dapat banyak pujian di pejabat.",
      },
    },
    {
      img: reviewUser3,
      name: "Yuki T.",
      text: {
        en: "Chic, modern and feels weightless. My new everyday pair.",
        zh: "时髦又轻盈，已经成为我的日常标配。",
        es: "Chic, modernas y se sienten sin peso. Mis nuevas gafas diarias.",
        fr: "Chic, modernes et légères comme une plume. Ma nouvelle paire quotidienne.",
        de: "Schick, modern und federleicht. Meine neue Alltagsbrille.",
        it: "Chic, moderne e leggerissime. Le mie nuove preferite per ogni giorno.",
        pt: "Chic, modernas e sem peso. Meu novo par diário.",
        ja: "シックでモダン、まるで何も掛けていないみたい。新しい毎日の相棒です。",
        ko: "세련되고 모던하면서 가벼워요. 매일 쓰는 데일리 안경이 됐어요.",
        ar: "أنيقة، عصرية وخفيفة جدًا. أصبحت نظارتي اليومية الجديدة.",
        vi: "Sang trọng, hiện đại và nhẹ như không. Cặp kính hằng ngày mới của tôi.",
        th: "ดูเก๋ ทันสมัย และเบามาก กลายเป็นแว่นใส่ทุกวันคู่ใหม่ของฉัน",
        id: "Chic, modern, dan terasa tanpa beban. Kacamata harian baru saya.",
        ms: "Bergaya, moden dan terasa ringan. Cermin mata harian baharu saya.",
      },
    },
    {
      img: "/images/misc/jOMQue6Nciwod6b9pWJtt.jpg",
      name: "Emma W.",
      slug: "lool-tr90-square",
      text: {
        en: "Oversized squares with a tortoise twist — the easiest sunny-day pair I own.",
        zh: "玳瑁色大方框，太阳天最好搭的一副。",
        es: "Cuadradas oversize con un toque carey — las gafas más fáciles de combinar en días soleados.",
        fr: "De grandes carrées effet écaille — la paire la plus facile à porter sous le soleil.",
        de: "Übergroße Eckige im Schildpatt-Look — meine entspannteste Brille für sonnige Tage.",
        it: "Quadrate oversize effetto tartaruga — il paio più easy nei giorni di sole.",
        pt: "Quadradas oversize com toque tartaruga — o par mais fácil em dias de sol.",
        ja: "オーバーサイズのスクエアにべっ甲のニュアンス。晴れた日にいちばん掛けやすい一本。",
        ko: "토터스 무드의 오버사이즈 스퀘어 — 햇살 좋은 날 가장 손이 가는 안경.",
        ar: "إطار مربع كبير بلمسة سلحفاة — أسهل نظارة أرتديها في الأيام المشمسة.",
        vi: "Gọng vuông oversize phối hoa văn đồi mồi — cặp kính dễ phối nhất cho ngày nắng.",
        th: "ทรงสี่เหลี่ยมโอเวอร์ไซส์โทนกระดองเต่า — แว่นที่หยิบใส่ง่ายที่สุดในวันแดด",
        id: "Kotak oversize dengan sentuhan tortoise — kacamata paling gampang dipakai di hari cerah.",
        ms: "Bingkai segi empat oversize dengan motif tortoise — paling mudah dipadan pada hari cerah.",
      },
    },
    {
      img: "/images/misc/e7XSmmHgetQ2rknyVKI2V.jpg",
      name: "Daniel K.",
      slug: "lool-8663",
      text: {
        en: "Solid build, smooth hinges and clean lines — exactly what I wanted.",
        zh: "做工扎实、线条干净，正合我意。",
        es: "Construcción sólida, bisagras suaves y líneas limpias — justo lo que quería.",
        fr: "Construction solide, charnières fluides et lignes nettes — exactement ce que je voulais.",
        de: "Solide verarbeitet, weiche Scharniere und klare Linien — genau, was ich wollte.",
        it: "Costruzione solida, cerniere morbide e linee pulite — proprio quello che volevo.",
        pt: "Construção sólida, dobradiças suaves e linhas limpas — exatamente o que eu queria.",
        ja: "頑丈な作り、なめらかなヒンジ、すっきりしたライン。まさに理想です。",
        ko: "탄탄한 마감, 부드러운 힌지, 깔끔한 라인 — 딱 원하던 그대로예요.",
        ar: "بنية متينة، مفصلات سلسة وخطوط نظيفة — تمامًا كما أردت.",
        vi: "Chắc tay, bản lề mượt và đường nét tinh tươm — đúng ý tôi.",
        th: "งานแน่น บานพับลื่น เส้นสายเรียบ — ตรงตามที่ต้องการเลย",
        id: "Konstruksi solid, engsel halus, dan garis yang bersih — persis seperti yang saya mau.",
        ms: "Binaan kukuh, engsel lancar dan garis yang kemas — tepat seperti yang saya mahu.",
      },
    },
    {
      img: reviewUser6,
      name: "Olivia P.",
      text: {
        en: "Travel-ready and seriously comfortable. Worn them on three trips already.",
        zh: "出行神器，舒服到爆，已经陪我跑了三趟旅行。",
        es: "Listas para viajar y muy cómodas. Ya las he llevado en tres viajes.",
        fr: "Parfaites pour voyager et vraiment confortables. Déjà trois voyages avec elles.",
        de: "Reisetauglich und unglaublich bequem. Schon auf drei Reisen getragen.",
        it: "Perfette in viaggio e comodissime. Già fatto tre viaggi con loro.",
        pt: "Prontas para viagem e muito confortáveis. Já fui em três viagens com elas.",
        ja: "旅行にぴったりで本当に快適。もう3回の旅行で使いました。",
        ko: "여행에 딱이고 정말 편해요. 벌써 세 번의 여행에 함께했어요.",
        ar: "مثالية للسفر ومريحة جدًا. سافرت بها ثلاث مرات بالفعل.",
        vi: "Hợp đi du lịch và cực kỳ thoải mái. Đã đi cùng tôi qua ba chuyến đi rồi.",
        th: "เหมาะกับการเดินทาง สบายสุด ๆ ใส่ไปแล้วสามทริป",
        id: "Siap dibawa traveling dan super nyaman. Sudah dipakai dalam tiga perjalanan.",
        ms: "Sesuai untuk pengembaraan dan sangat selesa. Sudah dipakai dalam tiga perjalanan.",
      },
    },
  ] as const;

  // ── Knowledge hub tiles — content_matrix 5 簇（operator 桥接）───────────
  // 内容/链接来自 operator-library content_matrix（knowledgeHubCards），
  // 图标本地映射（lucide）。展示文案 EN 先行（首页字典无逐语键时直接显示英文）。
  const insightIcons: Record<
    string,
    ComponentType<{ className?: string; strokeWidth?: number }>
  > = {
    glasses: Glasses,
    book: BookOpen,
    sparkles: Sparkles,
    wrench: Wrench,
    award: Award,
  };
  const insights = knowledgeHubCards().map((k) => ({
    icon: insightIcons[k.icon] ?? Glasses,
    to: k.href,
    title: k.title,
    desc: k.desc,
  }));

  return (
    <div>
      {/* ItemList JSON-LD — catalog 客户端加载后注入（SSR 时 products 为空） */}
      {products.length > 0 && (
        <JsonLd
          schema={itemListSchema(
            products
              .slice(0, 8)
              .map((p) => ({ slug: p.slug, name: p.name.en ?? p.slug })),
          )}
        />
      )}

      {/* FAQPage JSON-LD — glossary 教育词，SSR 输出（GEO 目标语言 EN 先行） */}
      <JsonLd schema={faqSchema(faqItems)} />

      {/* 1 — HERO (4-slide DB-driven carousel) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 lg:items-stretch section-y">
          <div className="flex flex-col max-w-xl lg:pt-10 lg:pb-4">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/80">
                <Sparkles className="w-3.5 h-3.5" /> {heroEyebrow}
              </span>
              <h1 className="display-title text-foreground">{heroTitle}</h1>
              <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                {heroSub}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 lg:mt-auto lg:pt-10">
              <Button
                asChild
                className="rounded-full px-6 h-11 shadow-soft transition-none"
              >
                <LangLink to="/products">
                  {t("home.hero.cta.shopAll")}{" "}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </LangLink>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 h-11 border-foreground/20 bg-background/60 backdrop-blur transition-none"
              >
                <LangLink
                  to="/try-on"
                  search={
                    activeBanner
                      ? ({ frame: activeBanner.productSlug } as never)
                      : undefined
                  }
                >
                  <Camera className="w-4 h-4 mr-1" /> {t("hero.cta.tryon")}
                </LangLink>
              </Button>
            </div>
            <div className="mt-5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-500 text-amber-500"
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                4.9 · 12,400+ {t("hero.reviews")}
              </span>
            </div>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 lg:-inset-10 rounded-[3rem] bg-gradient-to-br from-[oklch(0.92_0.035_25/0.55)] via-[oklch(0.94_0.02_60/0.35)] to-[oklch(0.88_0.04_240/0.45)] blur-2xl"
            />
            <div className="card-media relative aspect-[4/5] lg:aspect-[5/4] overflow-hidden max-h-[460px] mx-auto w-full rounded-[2rem] shadow-[0_30px_80px_-40px_oklch(0.32_0.04_55/0.35)] ring-1 ring-foreground/5">
              {slideEntries.map((s, i) => {
                const imgEl = (
                  <img
                    src={s.src}
                    alt={heroTitle}
                    width={1280}
                    height={1600}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${
                      i === heroIdx ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );
                if (s.slug) {
                  return (
                    <LangLink
                      key={`${s.src}-${i}`}
                      to="/product/$slug"
                      params={{ slug: s.slug }}
                      aria-label={heroTitle}
                      className={`absolute inset-0 block ${
                        i === heroIdx ? "" : "pointer-events-none"
                      }`}
                    >
                      {imgEl}
                    </LangLink>
                  );
                }
                return <span key={`${s.src}-${i}`}>{imgEl}</span>;
              })}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/15 via-transparent to-background/30 mix-blend-soft-light" />
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 z-10 flex items-center justify-end">
                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-background/70 backdrop-blur-md px-2.5 py-1.5 border border-border/40">
                  {slideEntries.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === heroIdx
                          ? "w-5 bg-foreground/80"
                          : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — SHOP BY FRAME SHAPE */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y-tight">
        <div className="flex items-end justify-between mb-5">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="eyebrow">
              <Glasses className="w-3.5 h-3.5" /> {t("home.shape.eyebrow")}
            </span>
            <h2 className="subsection-title">{t("home.shape.title")}</h2>
          </div>
          <LangLink
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-smooth"
          >
            {t("nav.viewAll")} <ArrowRight className="w-4 h-4" />
          </LangLink>
        </div>
        <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
          {t("home.shape.sub")}
        </p>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-1.5 md:gap-2">
          {shapeCards.map((s) => {
            const label = t(`menu.shape.${s.key}` as never);
            const inner = (
              <>
                <div className="w-12 h-6 text-foreground/80 transition-all duration-300 group-hover:text-primary group-hover:scale-110">
                  {s.svg}
                </div>
                <span className="text-[11px] font-medium text-foreground/70 group-hover:text-foreground transition-smooth tracking-wide">
                  {label}
                </span>
                {typeof s.term === "string" &&
                  s.term.toLowerCase() !== label.toLowerCase() && (
                    <span className="text-[9px] uppercase tracking-wider text-primary/70">
                      {s.term}
                    </span>
                  )}
              </>
            );
            return s.skuSlug ? (
              // 具体路径字符串 → LangLink 自动加语言前缀（/en/product/lool-8663）。
              <LangLink
                key={s.key}
                to={`/product/${s.skuSlug}`}
                className="group flex flex-col items-center text-center gap-1.5 py-3 rounded-xl transition-all duration-300 hover:bg-secondary/40"
              >
                {inner}
              </LangLink>
            ) : (
              <LangLink
                key={s.key}
                to="/products"
                search={{ shape: s.key } as never}
                className="group flex flex-col items-center text-center gap-1.5 py-3 rounded-xl transition-all duration-300 hover:bg-secondary/40"
              >
                {inner}
              </LangLink>
            );
          })}
        </div>
      </section>

      {/* 3 — THIS WEEK'S BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="eyebrow mb-3">
              <Flame className="w-3.5 h-3.5" /> {t("home.bestseller.eyebrow")}
            </span>
            <h2 className="section-title">{t("home.bestseller.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              {t("home.bestseller.sub")}
            </p>
          </div>
          <LangLink
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-smooth"
          >
            {t("home.bestseller.viewAll")} <ArrowRight className="w-4 h-4" />
          </LangLink>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-full px-6 h-11">
            <LangLink to="/products">
              {t("home.bestseller.viewAll")}{" "}
              <ArrowRight className="w-4 h-4 ml-1" />
            </LangLink>
          </Button>
        </div>
      </section>

      {/* 4 — TRUST & SERVICE */}
      <section className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
          <div className="text-center mb-10">
            <span className="eyebrow mb-3 justify-center">
              <ShieldCheck className="w-3.5 h-3.5" /> {t("home.trust.eyebrow")}
            </span>
            <h2 className="section-title">{t("home.trust.title")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trustItems.map((it) => (
              <div
                key={it.titleKey}
                className="card-surface card-padded text-center flex flex-col items-center"
              >
                <span className="card-icon-chip mb-3">
                  <it.icon className="w-5 h-5" strokeWidth={2.4} />
                </span>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {t(it.titleKey as never)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(it.descKey as never)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — AUDIENCE DUAL BANNER (replaces CATEGORY DUO, 去医疗化 framing) */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y grid md:grid-cols-2 gap-6">
        {[
          {
            defaultHref: "/myopia",
            href: audienceCfg.distance?.href?.trim() || "/myopia",
            img: audienceCfg.distance?.image_url ?? catMyo,
            titleKey: "home.audienceDuo.distance.title",
            descKey: "home.audienceDuo.distance.desc",
          },
          {
            defaultHref: "/presbyopia",
            href: audienceCfg.reading?.href?.trim() || "/presbyopia",
            img: audienceCfg.reading?.image_url ?? catPres,
            titleKey: "home.audienceDuo.reading.title",
            descKey: "home.audienceDuo.reading.desc",
          },
        ].map((c) => {
          const isExternal = /^https?:\/\//i.test(c.href);
          const className =
            "group card-media relative aspect-[5/6] md:aspect-[5/4]";
          const inner = (
            <>
              <img
                src={c.img}
                alt={t(c.titleKey as never)}
                loading="lazy"
                width={1200}
                height={1400}
                className="absolute inset-0 w-full h-full object-cover transition-smooth group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute inset-0 p-7 flex flex-col justify-end text-white">
                <h3 className="text-2xl md:text-3xl font-semibold font-display mb-1">
                  {t(c.titleKey as never)}
                </h3>
                <p className="text-sm text-white/85 max-w-sm">
                  {t(c.descKey as never)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  {t("home.audienceDuo.explore")}{" "}
                  <ArrowRight className="w-4 h-4 transition-smooth group-hover:translate-x-1" />
                </span>
              </div>
            </>
          );
          return isExternal ? (
            <a
              key={c.defaultHref}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <LangLink key={c.defaultHref} to={c.href} className={className}>
              {inner}
            </LangLink>
          );
        })}
      </section>

      {/* 6 — EVERYDAY FASHION & STYLE */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="eyebrow mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {t("home.fashion.eyebrow")}
            </span>
            <h2 className="section-title">{t("home.fashion.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              {t("home.fashion.sub")}
            </p>
          </div>
          <LangLink
            to="/products"
            search={{ sort: "fashion" } as never}
            className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-smooth"
          >
            {t("home.fashion.viewAll")} <ArrowRight className="w-4 h-4" />
          </LangLink>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {fashionPicks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 7 — DISTANCE EYEWEAR BEST SELLERS */}
      <section className="relative bg-gradient-to-b from-secondary/40 via-secondary/25 to-background/0">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="eyebrow mb-3">
                <Sparkles className="w-3.5 h-3.5" />{" "}
                {t("home.distance.eyebrow")}
              </span>
              <h2 className="section-title">{t("home.distance.title")}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                {t("home.distance.sub")}
              </p>
            </div>
            <LangLink
              to="/products"
              search={{ sort: "new" }}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-smooth"
            >
              {t("nav.viewAll")} <ArrowRight className="w-4 h-4" />
            </LangLink>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {distancePicks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 8 — AI VIRTUAL TRY-ON */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
        <LangLink
          to={promoTryon?.linkHref ?? "/try-on"}
          className="group relative block overflow-hidden rounded-3xl shadow-card hover:shadow-soft transition-smooth"
        >
          <img
            src={promoTryon?.imageUrl || hero3}
            alt={pickPromoText(promoTryon?.title, t("home.tryon.title"))}
            loading="lazy"
            className="w-full h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px] object-cover transition-smooth group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 md:px-12 lg:px-16 max-w-xl">
              <span className="eyebrow mb-3">
                <Camera className="w-3.5 h-3.5" />{" "}
                {pickPromoText(promoTryon?.eyebrow, t("home.tryon.eyebrow"))}
              </span>
              <h3 className="font-display text-2xl md:text-3xl lg:text-[2.25rem] font-semibold text-foreground leading-tight mb-3">
                {pickPromoText(promoTryon?.title, t("home.tryon.title"))}
              </h3>
              <p className="text-sm md:text-[15px] text-muted-foreground mb-5 leading-relaxed">
                {pickPromoText(promoTryon?.sub, t("home.tryon.sub"))}
              </p>
              <span className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 bg-primary text-primary-foreground text-sm font-medium shadow-soft transition-smooth group-hover:gap-3">
                <Camera className="w-4 h-4" />{" "}
                {pickPromoText(promoTryon?.cta, t("home.tryon.cta"))}
              </span>
            </div>
          </div>
        </LangLink>
      </section>

      {/* 9 — FAQ（glossary 教育词，与 head() FAQPage JSON-LD 同源，EN 先行） */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="eyebrow mb-3 justify-center">
              <Glasses className="w-3.5 h-3.5" /> {t("home.faq.eyebrow")}
            </span>
            <h2 className="section-title">{t("home.faq.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              {t("home.faq.sub")}
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((it, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{it.question}</AccordionTrigger>
                <AccordionContent>{it.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 10 — CUSTOMER LOOKS / UGC */}
      <section className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow mb-3">
                <Star className="w-3.5 h-3.5 fill-current" />{" "}
                {t("home.ugc.eyebrow")}
              </span>
              <h2 className="section-title">{t("home.ugc.title")}</h2>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  4.9 · 12,400+ {t("hero.reviews")}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {(() => {
              const fallbackImages = [
                reviewUser1,
                reviewUser2,
                reviewUser3,
                reviewUser4,
                reviewUser5,
                reviewUser6,
              ];
              const displayUgc =
                ugcRows.length > 0
                  ? ugcRows.map((r, idx) => ({
                      key: r.id,
                      img:
                        r.imageUrl ||
                        fallbackImages[idx % fallbackImages.length],
                      name: r.name,
                      rating: r.rating,
                      text:
                        r.text[contentLang] ??
                        r.text[lang] ??
                        r.text.en ??
                        Object.values(r.text).find((v) => v) ??
                        "",
                      href: r.linkHref ?? null,
                    }))
                  : ugcCards.map((r, idx) => {
                      const slug =
                        "slug" in r ? (r as { slug?: string }).slug : undefined;
                      return {
                        key: `static-${idx}`,
                        img: r.img,
                        name: r.name,
                        rating: 5,
                        text: r.text[lang] ?? r.text.en,
                        href: slug ? `/product/${slug}` : null,
                      };
                    });
              return displayUgc.map((r) => {
                const cardInner = (
                  <>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={r.img}
                        alt={`${r.name} wearing loollook`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-smooth group-hover:scale-[1.04]"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[11px] font-medium">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                        {r.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs md:text-sm leading-relaxed text-foreground/85">
                        "{r.text}"
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        — {r.name}
                      </p>
                    </div>
                  </>
                );
                return r.href ? (
                  <LangLink
                    key={r.key}
                    to={r.href}
                    className="group card-surface overflow-hidden flex flex-col block"
                  >
                    {cardInner}
                  </LangLink>
                ) : (
                  <article
                    key={r.key}
                    className="group card-surface overflow-hidden flex flex-col"
                  >
                    {cardInner}
                  </article>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* 11 — KNOWLEDGE HUB */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 section-y">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow mb-3">
                <BookOpen className="w-3.5 h-3.5" />{" "}
                {t("home.knowledge.eyebrow")}
              </span>
              <h2 className="section-title">{t("home.knowledge.title")}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                {t("home.knowledge.sub")}
              </p>
            </div>
            <LangLink
              to="/blog"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-smooth"
            >
              {t("home.knowledge.viewAll")} <ArrowRight className="w-4 h-4" />
            </LangLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {insights.map((it, idx) => (
              <LangLink
                key={it.title}
                to={it.to}
                className="group card-surface card-padded flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="card-icon-chip">
                    <it.icon className="w-5 h-5" strokeWidth={2.4} />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-2 leading-snug">
                  {it.title}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {it.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary group-hover:gap-2 transition-smooth mt-auto">
                  {t("home.knowledge.learnMore")}{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </LangLink>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND ATMOSPHERE — moved to bottom */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 section-y-tight">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={promoBrand?.imageUrl || hero4}
            alt={pickPromoText(promoBrand?.title, t("home.brand.title"))}
            loading="lazy"
            className="w-full h-[300px] md:h-[420px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-foreground/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-background p-8 md:p-12">
            <span className="text-xs uppercase tracking-[0.25em] mb-3 opacity-80">
              {pickPromoText(promoBrand?.eyebrow, t("home.brand.eyebrow"))}
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-semibold max-w-2xl leading-tight">
              {pickPromoText(promoBrand?.title, t("home.brand.title"))}
            </h2>
            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-full px-6 h-11 bg-background/95 text-foreground border-transparent hover:bg-background"
            >
              <LangLink to={promoBrand?.linkHref ?? "/products"}>
                {pickPromoText(promoBrand?.cta, t("home.brand.cta"))}{" "}
                <ArrowRight className="w-4 h-4 ml-1" />
              </LangLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

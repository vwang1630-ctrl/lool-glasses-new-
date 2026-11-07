import { createFileRoute, Link } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { useI18n, type Lang } from "@/lib/i18n";
import {
  ChevronRight,
  Eye,
  MonitorSmartphone,
  Sun,
  Lightbulb,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Award,
  Check,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$lang/choose-eyeglasses")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("chooseEyeglasses", params.lang) },
      {
        name: "description",
        content:
          pageDesc("chooseEyeglasses", params.lang),
      },
      { name: "twitter:description", content: pageOgDesc("chooseEyeglasses", params.lang) },
      {
        property: "og:title",
        content: "Lens Guide — Daily Eye Care & Lens Science | lool",
      },
      {
        property: "og:description",
        content:
          pageOgDesc("chooseEyeglasses", params.lang),
      },
    ],
  }),
  component: LensGuidePage,
});

/* ================================================================
 * Non-translated per-item metadata. Icons / accent classes / numeric
 * values / featured flag live here so each language block only carries
 * the translatable strings — adding a new lang doesn't duplicate icons.
 * Index alignment is the contract: DISCOMFORT_ICONS[i] pairs with
 * each T[lang].discomforts[i], and so on.
 * ================================================================*/

const DISCOMFORT_ICONS = [
  MonitorSmartphone,
  Eye,
  Lightbulb,
  Sun,
  Stethoscope,
] as const;
const CARE_ICONS = [MonitorSmartphone, Lightbulb, Sun, Stethoscope] as const;

const BRAND_META = [
  { id: "ordinary", accent: "border-border bg-card", featured: false },
  {
    id: "mingyue",
    accent: "border-primary/30 bg-primary/[0.03]",
    featured: true,
  },
  {
    id: "zeiss",
    accent: "border-foreground/20 bg-foreground/[0.03]",
    featured: false,
  },
] as const;

// Same numeric strings everywhere — only the brand label + note are translated.
const DURABILITY_VALUES = ["92–95%", "98.6%", "99%"] as const;

/* ================================================================
 * Translated content, all 10 supported UI languages. Each entry has
 * the identical shape (Content). pickLang collapses to en if a lang
 * is missing for some reason; T already covers all 10 so that path
 * never triggers in practice.
 * ================================================================*/

type Content = {
  eyebrow: string;
  title: string;
  intro: string;
  crumbHome: string;
  crumbHere: string;
  discomfortTitle: string;
  discomfortLead: string;
  discomfortFootnote: string;
  discomforts: Array<{ title: string; body: string }>;
  careTitle: string;
  care: Array<{ title: string; body: string }>;
  brandsEyebrow: string;
  brandsTitle: string;
  brandsLead: string;
  brands: Array<{
    tag: string;
    name: string;
    sub: string;
    body: string;
    bullets: string[];
  }>;
  highIndexTitle: string;
  highIndexBody: string;
  durabilityTitle: string;
  durability: Array<{ brand: string; note: string }>;
  scenarioTitle: string;
  scenarios: Array<{ scene: string; rec: string }>;
  promiseEyebrow: string;
  promiseTitle: string;
  promiseBody: string;
  promiseTag: string;
  ctaShop: string;
  ctaTryon: string;
};

const en: Content = {
  eyebrow: "Lens Science · Daily Eye Care",
  title: "Healthy eyes start with the right lens",
  intro:
    "Good vision powers your day — at the screen, on the road, and outside. We offer three lens tiers — Ordinary, Mingyue and Zeiss — so every prescription, scene and budget gets a lens that simply feels right.",
  crumbHome: "Home",
  crumbHere: "Lens guide",

  discomfortTitle: "Common daily eye discomfort",
  discomfortLead:
    "Most modern eye troubles aren't disease — they come from screen-heavy habits and the wrong lens. Choosing a lens that matches your day is the first relief.",
  discomforts: [
    {
      title: "Tired eyes after long screen time",
      body: "Often caused by low-quality blue-light or anti-glare lenses. Mingyue and Zeiss blue-light filtering technology meaningfully reduces fatigue.",
    },
    {
      title: "Dryness, redness or itching",
      body: "Linked to low transmittance and heavy frames. High-purity Mingyue and Zeiss materials deliver clearer, more comfortable wear.",
    },
    {
      title: "Glare and reflections indoors",
      body: "Caused by simple single-layer coatings. Zeiss multi-layer AR and Mingyue A-series coatings dramatically cut reflections.",
    },
    {
      title: "UV irritation outdoors",
      body: "Ordinary lenses give basic UV; Mingyue and Zeiss block 99.9% of UVA/UVB with full UV400 protection.",
    },
    {
      title: "Blurry distance or near vision",
      body: "Wrong prescription or rough grinding. Zeiss precision optics and Mingyue's strict QC are far ahead of generic lenses.",
    },
  ],
  discomfortFootnote:
    "Most of this is daily-habit related, not pathology. We pair a mature manufacturing system with three lens tiers so every customer finds a fit.",

  careTitle: "How to protect your eyes every day",
  care: [
    {
      title: "Manage screen time",
      body: "Every 30–40 minutes look at something 5+ meters away for 5 minutes, or close your eyes. Mingyue dual blue-light or Zeiss blue-light filtering lenses reduce strain further.",
    },
    {
      title: "Balance indoor lighting",
      body: "Avoid harsh direct light. Anti-glare lenses (ordinary, Mingyue or Zeiss) make reflections gentler — Zeiss leads, Mingyue follows close behind.",
    },
    {
      title: "Strong UV protection",
      body: "All our lenses ship with UV400. Mingyue and Zeiss block 99.9% of UVA/UVB; ordinary lenses still block 90%+.",
    },
    {
      title: "Examine & match precisely",
      body: "Optometry every 6–12 months. We grind every lens to your data — ordinary for budget, Mingyue for value, Zeiss for the very best optics.",
    },
  ],

  brandsEyebrow: "Lens tiers",
  brandsTitle: "Three lenses, one obsession with clarity",
  brandsLead:
    "We don't claim medical treatment — but lenses made well genuinely change how a day feels. Pick the tier that matches your eyes and your budget.",
  brands: [
    {
      tag: "Cost-effective",
      name: "Ordinary lenses",
      sub: "Reliable basics for everyday wear",
      body: "Standard resin with anti-scratch and UV400 protection, single-layer coating. Great for prescriptions under 300° and budget-conscious daily use. Transmittance 92–95%.",
      bullets: [
        "Single-layer coating",
        "UV400 basics",
        "Transmittance 92–95%",
        "Best for low Rx",
      ],
    },
    {
      tag: "Domestic premium",
      name: "Mingyue lenses",
      sub: "China's leading optical brand since 2002",
      body: "A-share listed, China Aerospace partner. KR resin & PMC ultra-bright materials reach 98.6% transmittance. The 1.71 high-index series stays thin with an Abbe number of 37. Dual blue-light filtering certified by TÜV Rheinland.",
      bullets: [
        "Transmittance up to 98.6%",
        "1.71 thin high-index",
        "TÜV-certified blue-light filter",
        "A8 wear-resistant coating",
      ],
    },
    {
      tag: "Global benchmark",
      name: "Zeiss lenses",
      sub: "A century of optics, engineered for you",
      body: "Free-form surface technology cuts edge aberration by 80% and triples field-of-view clarity. i.Scription® reads 12 biological parameters for personalized correction. Multi-layer AR removes 95% of reflections; precision blue-light filter blocks 415–455nm.",
      bullets: [
        "Transmittance up to 99%",
        "Free-form surface optics",
        "i.Scription® personalization",
        "Diamond-cube ultra wear-resistant",
      ],
    },
  ],

  highIndexTitle: "Thin & light high-index — three brands compared",
  highIndexBody:
    "For 300°+ prescriptions: ordinary lenses come in 1.61 / 1.67 (thicker, heavier); Mingyue offers 1.61 / 1.67 / 1.71 with the 1.71 series as the cost-performance winner; Zeiss adds 1.74 ultra-thin for the lightest, sleekest look on high prescriptions.",

  durabilityTitle: "Transmittance & durability",
  durability: [
    { brand: "Ordinary", note: "Basic single-layer coating" },
    { brand: "Mingyue", note: "A8 wear-resistant & anti-fouling" },
    { brand: "Zeiss", note: "Diamond-cube ultra wear-resistant" },
  ],

  scenarioTitle: "Pick the right lens for your scenario",
  scenarios: [
    {
      scene: "Daily commute · low budget",
      rec: "Lightweight frame + ordinary anti-glare lens — covers the basics affordably.",
    },
    {
      scene: "Daily commute · best value",
      rec: "Lightweight frame + Mingyue standard anti-glare lens — durable, comfortable, great price.",
    },
    {
      scene: "Office & screens",
      rec: "Mingyue high-clarity blue-light filter (value) or Zeiss blue-light filter (premium clarity).",
    },
    {
      scene: "Outdoor & travel",
      rec: "Mingyue UV400 photochromic (value) or Zeiss photochromic (fast, even color shift).",
    },
    {
      scene: "High prescription · prefers thin",
      rec: "Mingyue 1.71 (value) or Zeiss 1.74 (premium ultra-thin); ordinary 1.67 if budget is tight.",
    },
    {
      scene: "Premium visual experience",
      rec: "Zeiss 1.71/1.74 + AR coating for extreme clarity; Mingyue 天玑 (Tianji) is a strong domestic premium alternative.",
    },
  ],

  promiseEyebrow: "Our promise",
  promiseTitle: "Reasonable optics, made accessible",
  promiseBody:
    "Backed by a mature eyewear manufacturing chain, we hold every pair to strict quality standards — ordinary for value, Mingyue for the sweet spot, Zeiss for the very best. Each lens is hand-finished to your prescription so you wear vision that's clearer, safer and more comfortable.",
  promiseTag:
    "Science-based eye care · clearer vision starts with the right lens.",
  ctaShop: "Shop eyeglasses",
  ctaTryon: "Try on virtually",
};

const zh: Content = {
  eyebrow: "镜片科学 · 日常护眼",
  title: "健康双眼，从一片合适的镜片开始",
  intro:
    "看手机、看屏幕、出门通勤，每一刻都依赖清晰的视觉。我们提供普通镜片、明月镜片、蔡司镜片三档选择，让不同度数、不同场景与不同预算的你，都能找到那片刚刚好的镜片。",
  crumbHome: "首页",
  crumbHere: "了解镜片",

  discomfortTitle: "你是否也有这些用眼不适？",
  discomfortLead:
    "现代生活中的多数眼部不适，并非疾病，而是与用眼习惯和镜片搭配有关。挑对镜片，是缓解不适的第一步。",
  discomforts: [
    {
      title: "长时间看屏幕后眼睛酸胀",
      body: "多由抗反光、防蓝光性能不达标的低端镜片造成。明月与蔡司专业级防蓝光技术能显著缓解疲劳。",
    },
    {
      title: "眼睛干涩、发红、发痒",
      body: "与镜片透光率和镜架重量有关。明月与蔡司采用高纯度材料，佩戴更通透舒适。",
    },
    {
      title: "室内工作出现眩光与反射",
      body: "源于普通镜片的单层镀膜。蔡司多层减反射镀膜与明月 A 系列镀膜可大幅减少反射。",
    },
    {
      title: "户外强紫外线刺眼",
      body: "普通镜片仅有基础 UV 防护；明月与蔡司全系标配 UV400，可阻挡 99.9% 的有害紫外线。",
    },
    {
      title: "看远或看近模糊（验光不准/加工误差）",
      body: "蔡司精密研磨与明月严苛的品控，远超普通镜片的加工精度。",
    },
  ],
  discomfortFootnote:
    "多数不适来自用眼习惯与不合适的镜片，并非严重眼病。依托成熟的制造体系，我们提供三档镜片，覆盖不同需求与预算。",

  careTitle: "日常护眼的四个关键",
  care: [
    {
      title: "控制用屏时长",
      body: "每 30–40 分钟远眺 5 米外景物 5 分钟，或闭目休息。搭配明月双效防蓝光或蔡司防蓝光镜片，长时间用屏幕也更轻松。",
    },
    {
      title: "合理的室内照明",
      body: "避免强光直射，选择柔和均匀的灯光。普通、明月、蔡司的防眩光镜片都能软化反射光，蔡司效果最佳，明月紧随其后。",
    },
    {
      title: "强力 UV 防护",
      body: "我们的镜片均标配 UV400 防护。明月与蔡司可阻挡 99.9% 的 UVA/UVB；普通镜片亦能阻挡 90% 以上的有害紫外线。",
    },
    {
      title: "定期验光，精准配镜",
      body: "建议每 6–12 个月做一次专业验光。我们严格依照你的验光数据为三档镜片定制加工，确保每一片都精准匹配。",
    },
  ],

  brandsEyebrow: "镜片档位",
  brandsTitle: "三档镜片，同一份对清晰的执着",
  brandsLead:
    "我们不做任何医疗承诺，但优质的镜片确实能改变你一天的舒适度。按你的眼睛与预算，挑一档刚刚好的。",
  brands: [
    {
      tag: "高性价比",
      name: "普通镜片",
      sub: "经济实惠的基础之选",
      body: "标准树脂材料，具备基础防刮与 UV400 防护，单层镀膜。适合 300° 以下及预算有限的日常用户，透光率约 92–95%。",
      bullets: ["单层镀膜", "基础 UV400", "透光率 92–95%", "适合低度数"],
    },
    {
      tag: "国货高品质",
      name: "明月镜片",
      sub: "中国领军光学品牌，2002 年创立",
      body: "A 股上市企业，中国航天合作伙伴。KR 树脂与 PMC 超亮材料，透光率高达 98.6%。1.71 高折射率系列突破行业壁垒，阿贝数高达 37，更薄更轻。双效防蓝光经 TÜV 莱茵认证。",
      bullets: [
        "透光率高达 98.6%",
        "1.71 超薄高折",
        "TÜV 认证防蓝光",
        "A8 耐磨易洁膜",
      ],
    },
    {
      tag: "全球高端标杆",
      name: "蔡司镜片",
      sub: "百年光学，极致清晰",
      body: "采用自由曲面技术，边缘像差降低 80%，视野清晰度提升 3 倍。i.Scription® 采集 12 项生物参数实现个性化定制；多层减反射镀膜消减 95% 反射；精准过滤 415–455nm 有害蓝光。",
      bullets: [
        "透光率高达 99%",
        "自由曲面光学",
        "i.Scription® 个性化",
        "钻立方超耐磨",
      ],
    },
  ],

  highIndexTitle: "高折射率超薄设计 —— 三档对比",
  highIndexBody:
    "300°+ 高度数：普通镜片有 1.61 / 1.67 规格，相对较厚重；明月提供 1.61 / 1.67 / 1.71，1.71 系列最具性价比；蔡司另有 1.74 超薄，适合追求最薄最轻的高度数用户。",

  durabilityTitle: "透光率与耐久度对比",
  durability: [
    { brand: "普通镜片", note: "基础单层镀膜" },
    { brand: "明月镜片", note: "A8 耐磨抗污膜系" },
    { brand: "蔡司镜片", note: "钻立方超耐磨膜" },
  ],

  scenarioTitle: "按场景选镜片",
  scenarios: [
    {
      scene: "日常通勤 · 低预算",
      rec: "轻量镜架 + 普通防眩光镜片，性价比满足基础需求。",
    },
    {
      scene: "日常通勤 · 兼顾品质与预算",
      rec: "轻量镜架 + 明月标准防眩光镜片，耐用、舒适、性价比高。",
    },
    {
      scene: "办公与屏幕作业",
      rec: "明月高透防蓝光镜片（高性价比）或蔡司防蓝光过滤镜片（高清舒适）。",
    },
    {
      scene: "户外与出行",
      rec: "明月 UV400 + 变色镜片（高性价比）或蔡司变色镜片（变色快、色彩均匀）。",
    },
    {
      scene: "高度数（300°+）追求轻薄",
      rec: "明月 1.71 高折（高性价比）或蔡司 1.74 超薄（高端首选）；预算紧张可选普通 1.67。",
    },
    {
      scene: "追求极致视觉体验",
      rec: "蔡司 1.71/1.74 高折 + 减反射镀膜，极致清晰；明月天玑系列是国货高端的优秀替代。",
    },
  ],

  promiseEyebrow: "我们的承诺",
  promiseTitle: "合理的光学，普惠到每个人",
  promiseBody:
    "依托成熟的眼镜制造产业链，我们坚持严格的品质标准——普通镜片让你买得起，明月镜片让你买得值，蔡司镜片让你看得最清。每一片都按你的处方手工加工，让佩戴更清晰、更安全、更舒适。",
  promiseTag: "科学护眼 · 清晰视觉，从一片合适的镜片开始。",
  ctaShop: "选购眼镜",
  ctaTryon: "虚拟试戴",
};

const es: Content = {
  eyebrow: "Ciencia de las lentes · Cuidado diario",
  title: "Ojos sanos comienzan con la lente adecuada",
  intro:
    "Una buena visión impulsa tu día — frente a la pantalla, en la carretera y al aire libre. Ofrecemos tres niveles de lente — Estándar, Mingyue y Zeiss — para que cada graduación, escena y presupuesto tenga la lente que mejor le siente.",
  crumbHome: "Inicio",
  crumbHere: "Guía de lentes",

  discomfortTitle: "Molestias oculares más comunes",
  discomfortLead:
    "Casi siempre no es enfermedad: son hábitos de pantalla y la lente equivocada. Elegir la lente que acompaña tu día es el primer alivio.",
  discomforts: [
    {
      title: "Ojos cansados tras horas de pantalla",
      body: "A menudo provocado por lentes anti-reflejo o anti-luz azul de mala calidad. La tecnología profesional de Mingyue y Zeiss reduce notablemente la fatiga.",
    },
    {
      title: "Sequedad, enrojecimiento o picor",
      body: "Asociado a baja transmitancia y monturas pesadas. Mingyue y Zeiss usan materiales de alta pureza para una visión más cómoda.",
    },
    {
      title: "Reflejos y deslumbramiento en interiores",
      body: "Causado por capas anti-reflejo simples. El AR multicapa de Zeiss y la serie A de Mingyue reducen drásticamente los reflejos.",
    },
    {
      title: "Irritación por UV al aire libre",
      body: "Las lentes comunes ofrecen UV básico; Mingyue y Zeiss bloquean el 99,9 % de UVA/UVB con protección UV400 completa.",
    },
    {
      title: "Visión borrosa de lejos o de cerca",
      body: "Graduación incorrecta o tallado tosco. La óptica de precisión de Zeiss y el control de calidad de Mingyue superan con creces a las genéricas.",
    },
  ],
  discomfortFootnote:
    "La mayoría de estas molestias dependen de los hábitos diarios, no de una patología. Combinamos una manufactura madura con tres niveles de lente para que cada cliente encuentre su ajuste.",

  careTitle: "Cómo cuidar tus ojos cada día",
  care: [
    {
      title: "Controla el tiempo de pantalla",
      body: "Cada 30–40 minutos, mira algo a más de 5 metros durante 5 minutos o cierra los ojos. Las lentes de doble filtro azul Mingyue o el filtro azul Zeiss reducen aún más la fatiga.",
    },
    {
      title: "Equilibra la iluminación interior",
      body: "Evita la luz directa fuerte. Las lentes anti-reflejo (comunes, Mingyue o Zeiss) suavizan los reflejos — Zeiss lidera, Mingyue le sigue de cerca.",
    },
    {
      title: "Protección UV potente",
      body: "Todas nuestras lentes incluyen UV400. Mingyue y Zeiss bloquean 99,9 % de UVA/UVB; las comunes alcanzan el 90 %.",
    },
    {
      title: "Examina y ajusta con precisión",
      body: "Examen visual cada 6–12 meses. Tallamos cada lente con tu graduación — común para presupuesto, Mingyue para mejor relación, Zeiss para la máxima óptica.",
    },
  ],

  brandsEyebrow: "Niveles de lente",
  brandsTitle: "Tres lentes, una misma obsesión por la claridad",
  brandsLead:
    "No prometemos tratamiento médico — pero una buena lente cambia de verdad cómo se siente el día. Elige el nivel que encaja con tus ojos y tu presupuesto.",
  brands: [
    {
      tag: "Buen precio",
      name: "Lentes comunes",
      sub: "Lo básico fiable para cada día",
      body: "Resina estándar con anti-arañazos y UV400, capa antirreflejo simple. Buenas para graduaciones bajo 300° y uso diario con presupuesto ajustado. Transmitancia 92–95 %.",
      bullets: [
        "Capa antirreflejo simple",
        "UV400 básico",
        "Transmitancia 92–95 %",
        "Ideal para baja graduación",
      ],
    },
    {
      tag: "Premium nacional",
      name: "Lentes Mingyue",
      sub: "Marca óptica líder en China desde 2002",
      body: "Empresa cotizada y socio de la industria aeroespacial china. Resina KR y materiales PMC ultra-luminosos alcanzan 98,6 % de transmitancia. La serie de alto índice 1.71 mantiene grosor mínimo con número de Abbe 37. Filtro azul certificado por TÜV Rheinland.",
      bullets: [
        "Transmitancia hasta 98,6 %",
        "Alto índice 1.71 ultrafino",
        "Filtro azul TÜV",
        "Capa A8 antidesgaste",
      ],
    },
    {
      tag: "Referente mundial",
      name: "Lentes Zeiss",
      sub: "Un siglo de óptica, pensado para ti",
      body: "Tecnología de superficie libre reduce 80 % la aberración del borde y triplica la claridad del campo visual. i.Scription® toma 12 parámetros biológicos para una corrección personalizada. AR multicapa elimina 95 % de los reflejos; filtro azul preciso bloquea 415–455 nm.",
      bullets: [
        "Transmitancia hasta 99 %",
        "Superficie libre de precisión",
        "i.Scription® personalizado",
        "DuraVision ultra-resistente",
      ],
    },
  ],

  highIndexTitle: "Alto índice fino y ligero — tres marcas comparadas",
  highIndexBody:
    "Para graduaciones de 300° o más: las comunes vienen en 1.61 / 1.67 (más gruesas y pesadas); Mingyue ofrece 1.61 / 1.67 / 1.71 con la 1.71 como la ganadora en relación calidad-precio; Zeiss añade 1.74 ultrafino para la apariencia más fina en graduaciones altas.",

  durabilityTitle: "Transmitancia y durabilidad",
  durability: [
    { brand: "Común", note: "Capa antirreflejo simple" },
    { brand: "Mingyue", note: "A8 anti-desgaste y anti-suciedad" },
    { brand: "Zeiss", note: "DuraVision ultra-resistente" },
  ],

  scenarioTitle: "Elige la lente según tu escenario",
  scenarios: [
    {
      scene: "Trayecto diario · presupuesto ajustado",
      rec: "Montura ligera + lente común antirreflejo, cubre lo básico a buen precio.",
    },
    {
      scene: "Trayecto diario · mejor relación",
      rec: "Montura ligera + lente Mingyue antirreflejo estándar, duradera, cómoda y a buen precio.",
    },
    {
      scene: "Oficina y pantallas",
      rec: "Filtro azul de alta claridad Mingyue (relación) o filtro azul Zeiss (premium claridad).",
    },
    {
      scene: "Aire libre y viajes",
      rec: "Mingyue UV400 fotocromática (relación) o Zeiss fotocromática (cambio rápido y color uniforme).",
    },
    {
      scene: "Graduación alta · prefieres fina",
      rec: "Mingyue 1.71 (relación) o Zeiss 1.74 (ultrafino premium); común 1.67 si el presupuesto aprieta.",
    },
    {
      scene: "Experiencia visual premium",
      rec: "Zeiss 1.71/1.74 + AR para máxima claridad; Mingyue 天玑 (Tianji) es una alternativa premium nacional sólida.",
    },
  ],

  promiseEyebrow: "Nuestra promesa",
  promiseTitle: "Óptica razonable, accesible para todos",
  promiseBody:
    "Sobre una cadena de fabricación madura, mantenemos estándares estrictos en cada par — común para que puedas comprarla, Mingyue para que sea el mejor valor, Zeiss para que veas lo mejor. Cada lente se acaba a mano según tu prescripción para una visión más clara, más segura y más cómoda.",
  promiseTag:
    "Cuidado ocular con base científica · la visión clara comienza por la lente adecuada.",
  ctaShop: "Comprar gafas",
  ctaTryon: "Probar virtualmente",
};

const fr: Content = {
  eyebrow: "Science des verres · Soin quotidien des yeux",
  title: "Des yeux sains commencent par le bon verre",
  intro:
    "Une vision nette rythme votre journée — devant l'écran, sur la route, en extérieur. Nous proposons trois gammes de verres — Standard, Mingyue et Zeiss — pour qu'à chaque correction, situation et budget corresponde un verre qui s'oublie.",
  crumbHome: "Accueil",
  crumbHere: "Guide des verres",

  discomfortTitle: "Inconforts oculaires courants",
  discomfortLead:
    "La plupart des troubles modernes ne sont pas des maladies — ils viennent des écrans et de la mauvaise lentille. Choisir le verre adapté à votre journée est le premier soulagement.",
  discomforts: [
    {
      title: "Yeux fatigués après l'écran",
      body: "Souvent dû à des verres anti-reflets ou anti-lumière bleue bas de gamme. La technologie professionnelle de Mingyue et Zeiss réduit nettement la fatigue.",
    },
    {
      title: "Sécheresse, rougeurs, démangeaisons",
      body: "Liée à une faible transmission lumineuse et à des montures lourdes. Les matériaux haute pureté de Mingyue et Zeiss offrent un port plus confortable.",
    },
    {
      title: "Éblouissement et reflets en intérieur",
      body: "Causés par les traitements anti-reflets monocouches. L'AR multicouche Zeiss et la série A Mingyue réduisent fortement les reflets.",
    },
    {
      title: "Irritation par les UV en extérieur",
      body: "Les verres standards n'offrent qu'une protection UV de base ; Mingyue et Zeiss bloquent 99,9 % des UVA/UVB avec une protection UV400 complète.",
    },
    {
      title: "Vision floue de loin ou de près",
      body: "Mauvaise correction ou taillage approximatif. L'optique de précision Zeiss et le contrôle qualité Mingyue dépassent largement les verres génériques.",
    },
  ],
  discomfortFootnote:
    "La majorité de ces gênes vient des habitudes du quotidien, pas d'une pathologie. Une fabrication mature et trois gammes de verres permettent à chacun de trouver chaussure à son pied.",

  careTitle: "Comment protéger ses yeux au quotidien",
  care: [
    {
      title: "Gérer le temps d'écran",
      body: "Toutes les 30–40 minutes, regardez à plus de 5 mètres pendant 5 minutes ou fermez les yeux. Les verres anti-lumière bleue Mingyue ou Zeiss soulagent davantage.",
    },
    {
      title: "Équilibrer l'éclairage intérieur",
      body: "Évitez la lumière directe trop forte. Les verres anti-reflets (standards, Mingyue ou Zeiss) adoucissent les reflets — Zeiss en tête, Mingyue juste derrière.",
    },
    {
      title: "Protection UV forte",
      body: "Tous nos verres intègrent l'UV400. Mingyue et Zeiss bloquent 99,9 % des UVA/UVB ; les standards plus de 90 %.",
    },
    {
      title: "Examiner et ajuster avec précision",
      body: "Examen tous les 6–12 mois. Nous taillons chaque verre à vos données — standard pour le budget, Mingyue pour le juste prix, Zeiss pour l'optique haut de gamme.",
    },
  ],

  brandsEyebrow: "Gammes de verres",
  brandsTitle: "Trois verres, une seule obsession : la clarté",
  brandsLead:
    "Nous ne promettons aucun traitement médical — mais un bon verre change vraiment l'expérience d'une journée. Choisissez la gamme qui convient à vos yeux et à votre budget.",
  brands: [
    {
      tag: "Bon rapport qualité-prix",
      name: "Verres standards",
      sub: "L'essentiel fiable au quotidien",
      body: "Résine standard avec anti-rayures et protection UV400, traitement antireflet simple. Idéal en dessous de 3,00 dioptries et pour les budgets serrés. Transmission 92–95 %.",
      bullets: [
        "Antireflet simple",
        "UV400 de base",
        "Transmission 92–95 %",
        "Faible correction",
      ],
    },
    {
      tag: "Premium chinois",
      name: "Verres Mingyue",
      sub: "Leader optique chinois depuis 2002",
      body: "Coté en bourse, partenaire du programme spatial chinois. Résine KR et matériaux PMC ultra-lumineux atteignent 98,6 % de transmission. La gamme haute indice 1,71 garde une finesse exceptionnelle avec un nombre d'Abbe de 37. Anti-lumière bleue certifié TÜV Rheinland.",
      bullets: [
        "Transmission jusqu'à 98,6 %",
        "Haut indice 1,71 ultrafin",
        "Anti-lumière bleue TÜV",
        "Couche A8 anti-usure",
      ],
    },
    {
      tag: "Référence mondiale",
      name: "Verres Zeiss",
      sub: "Un siècle d'optique, conçu pour vous",
      body: "Technologie surfacique en forme libre : aberration de bord réduite de 80 % et clarté du champ visuel triplée. i.Scription® analyse 12 paramètres biologiques pour une correction personnalisée. AR multicouche : 95 % des reflets supprimés ; filtre lumière bleue précis 415–455 nm.",
      bullets: [
        "Transmission jusqu'à 99 %",
        "Surface libre de précision",
        "i.Scription® personnalisé",
        "DuraVision ultra-résistant",
      ],
    },
  ],

  highIndexTitle: "Indice élevé fin et léger — trois marques comparées",
  highIndexBody:
    "Pour 3,00 dioptries et plus : les standards existent en 1,61 / 1,67 (plus épais, plus lourds) ; Mingyue propose 1,61 / 1,67 / 1,71 — la série 1,71 offre le meilleur rapport qualité-prix ; Zeiss ajoute le 1,74 ultrafin pour le rendu le plus discret sur les fortes corrections.",

  durabilityTitle: "Transmission et durabilité",
  durability: [
    { brand: "Standard", note: "Antireflet simple" },
    { brand: "Mingyue", note: "A8 anti-usure & anti-salissure" },
    { brand: "Zeiss", note: "DuraVision ultra-résistant" },
  ],

  scenarioTitle: "Choisissez le verre selon votre usage",
  scenarios: [
    {
      scene: "Trajets quotidiens · petit budget",
      rec: "Monture légère + verre antireflet standard — l'essentiel à prix doux.",
    },
    {
      scene: "Trajets quotidiens · meilleur rapport",
      rec: "Monture légère + verre antireflet standard Mingyue — durable, confortable, bon prix.",
    },
    {
      scene: "Bureau et écrans",
      rec: "Filtre lumière bleue Mingyue haute clarté (rapport) ou filtre Zeiss (premium netteté).",
    },
    {
      scene: "Plein air et voyage",
      rec: "Mingyue UV400 photochromique (rapport) ou Zeiss photochromique (changement rapide, teinte uniforme).",
    },
    {
      scene: "Forte correction · préfère le fin",
      rec: "Mingyue 1,71 (rapport) ou Zeiss 1,74 (ultrafin premium) ; standard 1,67 si le budget est serré.",
    },
    {
      scene: "Expérience visuelle premium",
      rec: "Zeiss 1,71/1,74 + AR pour une clarté absolue ; Mingyue 天玑 (Tianji) est une excellente alternative premium chinoise.",
    },
  ],

  promiseEyebrow: "Notre promesse",
  promiseTitle: "Une optique raisonnable, à la portée de tous",
  promiseBody:
    "Adossés à une chaîne de fabrication mature, nous appliquons à chaque paire des standards qualité stricts — standard pour la portabilité, Mingyue pour le meilleur rapport, Zeiss pour la meilleure optique. Chaque verre est taillé à la main selon votre prescription, pour une vision plus claire, plus sûre, plus confortable.",
  promiseTag:
    "Soin des yeux fondé sur la science · la clarté commence par le bon verre.",
  ctaShop: "Voir les lunettes",
  ctaTryon: "Essai virtuel",
};

const de: Content = {
  eyebrow: "Glas-Wissenschaft · Tägliche Augenpflege",
  title: "Gesunde Augen beginnen mit dem richtigen Glas",
  intro:
    "Klares Sehen treibt deinen Tag voran — am Bildschirm, unterwegs und draußen. Drei Glas-Stufen — Standard, Mingyue und Zeiss — damit jede Sehstärke, jede Situation und jedes Budget das passende Glas findet.",
  crumbHome: "Startseite",
  crumbHere: "Glas-Guide",

  discomfortTitle: "Häufige Beschwerden im Alltag",
  discomfortLead:
    "Die meisten modernen Augenprobleme sind keine Krankheit — sie kommen vom vielen Bildschirm und dem falschen Glas. Das passende Glas zu wählen, ist die erste Erleichterung.",
  discomforts: [
    {
      title: "Müde Augen nach langer Bildschirmzeit",
      body: "Oft Folge minderwertiger Entspiegelungen oder Blaulichtfilter. Mingyue und Zeiss reduzieren die Ermüdung mit Profi-Blaulichtschutz spürbar.",
    },
    {
      title: "Trockenheit, Rötung oder Juckreiz",
      body: "Hängt mit niedriger Lichttransmission und schweren Fassungen zusammen. Mingyue und Zeiss verwenden hochreine Materialien für klareres Sehen.",
    },
    {
      title: "Blendung und Reflexe drinnen",
      body: "Verursacht durch einfache Einschichtbeschichtung. Die Multi-Layer-AR von Zeiss und die A-Serie von Mingyue reduzieren Reflexe deutlich.",
    },
    {
      title: "UV-Reizung im Freien",
      body: "Standardgläser bieten nur Basis-UV-Schutz; Mingyue und Zeiss blockieren 99,9 % der UVA/UVB mit vollem UV400-Schutz.",
    },
    {
      title: "Verschwommene Sicht in Ferne oder Nähe",
      body: "Falsche Sehstärke oder grobes Schleifen. Zeiss-Präzisionsoptik und die strenge Qualitätskontrolle von Mingyue übertreffen Standardgläser deutlich.",
    },
  ],
  discomfortFootnote:
    "Vieles davon hängt mit Alltagsgewohnheiten zusammen, nicht mit Pathologie. Mit ausgereifter Fertigung und drei Glas-Stufen findet jeder Kunde das passende Glas.",

  careTitle: "Augenpflege im Alltag",
  care: [
    {
      title: "Bildschirmzeit steuern",
      body: "Alle 30–40 Minuten 5 Minuten in mehr als 5 Meter Entfernung schauen oder die Augen schließen. Mingyue Doppel-Blaulichtschutz oder Zeiss Blaulichtfilter helfen zusätzlich.",
    },
    {
      title: "Innenbeleuchtung ausgleichen",
      body: "Hartes Direktlicht vermeiden. Entspiegelte Gläser (Standard, Mingyue oder Zeiss) machen Reflexe sanfter — Zeiss führt, Mingyue folgt dicht dahinter.",
    },
    {
      title: "Starker UV-Schutz",
      body: "Alle unsere Gläser haben UV400. Mingyue und Zeiss blockieren 99,9 % UVA/UVB; Standardgläser kommen auf über 90 %.",
    },
    {
      title: "Sehtest und präzise Anpassung",
      body: "Alle 6–12 Monate Sehtest. Wir schleifen jedes Glas nach deinen Daten — Standard fürs Budget, Mingyue fürs beste Verhältnis, Zeiss für Premium-Optik.",
    },
  ],

  brandsEyebrow: "Glas-Stufen",
  brandsTitle: "Drei Gläser, eine Obsession: Klarheit",
  brandsLead:
    "Wir versprechen keine medizinische Behandlung — aber ein gut gemachtes Glas verändert wirklich, wie sich ein Tag anfühlt. Wähle die Stufe, die zu Augen und Budget passt.",
  brands: [
    {
      tag: "Preiswert",
      name: "Standardgläser",
      sub: "Solide Grundlagen für jeden Tag",
      body: "Standardharz mit Kratzschutz und UV400, einfache Vergütung. Geeignet bis 3,00 dpt und für preisbewusste Alltagsnutzer. Transmission 92–95 %.",
      bullets: [
        "Einlagige Vergütung",
        "UV400 Basis",
        "Transmission 92–95 %",
        "Für geringe Sehstärke",
      ],
    },
    {
      tag: "Heimat-Premium",
      name: "Mingyue Gläser",
      sub: "Chinas führende Optik-Marke seit 2002",
      body: "Börsennotiert, Partner der chinesischen Raumfahrt. KR-Harz und PMC-Ultrabright erreichen 98,6 % Transmission. Die 1.71-Hochindex-Serie bleibt dünn mit Abbe-Zahl 37. Doppel-Blaulichtfilter TÜV-Rheinland-zertifiziert.",
      bullets: [
        "Transmission bis 98,6 %",
        "1.71 dünner Hochindex",
        "TÜV-Blaulichtfilter",
        "A8 abriebfeste Beschichtung",
      ],
    },
    {
      tag: "Weltweite Referenz",
      name: "Zeiss Gläser",
      sub: "Ein Jahrhundert Optik, für dich gemacht",
      body: "Freiformflächentechnologie senkt die Randabbildung um 80 % und verdreifacht die Schärfentiefe. i.Scription® erfasst 12 biologische Parameter für persönliche Korrektur. Multi-Layer-AR eliminiert 95 % der Reflexe; präziser Blaulichtfilter blockt 415–455 nm.",
      bullets: [
        "Transmission bis 99 %",
        "Freiformflächen-Optik",
        "i.Scription® persönlich",
        "DuraVision ultra-abriebfest",
      ],
    },
  ],

  highIndexTitle: "Dünner Hochindex — drei Marken im Vergleich",
  highIndexBody:
    "Ab 3,00 dpt: Standardgläser gibt es in 1.61 / 1.67 (dicker, schwerer); Mingyue bietet 1.61 / 1.67 / 1.71 — die 1.71-Serie gewinnt im Preis-Leistungs-Vergleich; Zeiss ergänzt mit 1.74 für die dünnste, eleganteste Optik bei hoher Sehstärke.",

  durabilityTitle: "Transmission und Beständigkeit",
  durability: [
    { brand: "Standard", note: "Einlagige Vergütung" },
    { brand: "Mingyue", note: "A8 abriebfest & schmutzabweisend" },
    { brand: "Zeiss", note: "DuraVision ultra-abriebfest" },
  ],

  scenarioTitle: "Das richtige Glas für deinen Alltag",
  scenarios: [
    {
      scene: "Tägliches Pendeln · kleines Budget",
      rec: "Leichte Fassung + Standard-Entspiegelung — das Wesentliche zum guten Preis.",
    },
    {
      scene: "Tägliches Pendeln · bestes Verhältnis",
      rec: "Leichte Fassung + Mingyue Standard-Entspiegelung — langlebig, bequem, gutes Preis-Leistungs-Verhältnis.",
    },
    {
      scene: "Büro und Bildschirm",
      rec: "Mingyue High-Clarity Blaulichtfilter (Verhältnis) oder Zeiss Blaulichtfilter (Premium-Klarheit).",
    },
    {
      scene: "Outdoor und Reisen",
      rec: "Mingyue UV400 selbsttönend (Verhältnis) oder Zeiss phototrop (schnelle, gleichmäßige Tönung).",
    },
    {
      scene: "Hohe Sehstärke · gewünscht dünn",
      rec: "Mingyue 1.71 (Verhältnis) oder Zeiss 1.74 (Premium ultradünn); Standard 1.67, wenn das Budget knapp ist.",
    },
    {
      scene: "Premium-Sehgenuss",
      rec: "Zeiss 1.71/1.74 + AR-Beschichtung für maximale Klarheit; Mingyue 天玑 (Tianji) ist eine starke Premium-Alternative aus China.",
    },
  ],

  promiseEyebrow: "Unser Versprechen",
  promiseTitle: "Vernünftige Optik — für alle zugänglich",
  promiseBody:
    "Auf einer ausgereiften Fertigungskette aufgebaut, halten wir an strengen Qualitätsstandards fest — Standardgläser machen es bezahlbar, Mingyue bringt den besten Wert, Zeiss bietet die feinste Optik. Jedes Glas wird nach deiner Sehstärke handgeschliffen — für klareres, sichereres, bequemeres Sehen.",
  promiseTag:
    "Wissenschaftliche Augenpflege · klares Sehen beginnt mit dem richtigen Glas.",
  ctaShop: "Brillen ansehen",
  ctaTryon: "Virtuell anprobieren",
};

const it: Content = {
  eyebrow: "Scienza delle lenti · Cura quotidiana degli occhi",
  title: "Occhi sani iniziano dalla lente giusta",
  intro:
    "Una visione nitida sostiene la tua giornata — davanti allo schermo, in strada, all'aperto. Tre fasce di lenti — Standard, Mingyue e Zeiss — perché ogni gradazione, scenario e budget trovi la lente più adatta.",
  crumbHome: "Home",
  crumbHere: "Guida alle lenti",

  discomfortTitle: "Disturbi oculari più comuni",
  discomfortLead:
    "La maggior parte dei disturbi moderni non è una malattia — dipende dalle ore davanti agli schermi e dalla lente sbagliata. Scegliere la lente giusta è il primo sollievo.",
  discomforts: [
    {
      title: "Occhi affaticati dopo lo schermo",
      body: "Spesso causato da lenti anti-riflesso o anti-luce blu di bassa qualità. La tecnologia professionale di Mingyue e Zeiss riduce nettamente la fatica.",
    },
    {
      title: "Secchezza, arrossamento o prurito",
      body: "Legati a bassa trasmittanza e montature pesanti. Mingyue e Zeiss usano materiali ad alta purezza per una visione più comoda.",
    },
    {
      title: "Riflessi e abbagliamento al chiuso",
      body: "Provocati da trattamenti antiriflesso a strato singolo. L'AR multistrato Zeiss e la serie A Mingyue li riducono drasticamente.",
    },
    {
      title: "Irritazione da UV all'aperto",
      body: "Le lenti comuni offrono solo UV di base; Mingyue e Zeiss bloccano il 99,9 % di UVA/UVB con protezione UV400 completa.",
    },
    {
      title: "Visione sfocata da lontano o da vicino",
      body: "Gradazione sbagliata o molatura imprecisa. L'ottica di precisione Zeiss e il controllo qualità Mingyue superano nettamente le lenti generiche.",
    },
  ],
  discomfortFootnote:
    "La maggior parte di questi fastidi è legata alle abitudini quotidiane, non a patologie. Una produzione matura e tre fasce di lenti permettono a ciascuno di trovare la propria.",

  careTitle: "Come proteggere gli occhi ogni giorno",
  care: [
    {
      title: "Gestire il tempo davanti agli schermi",
      body: "Ogni 30–40 minuti guarda qualcosa a oltre 5 metri per 5 minuti o chiudi gli occhi. Mingyue doppia barriera blu o Zeiss anti-luce blu riducono ulteriormente la fatica.",
    },
    {
      title: "Bilanciare la luce interna",
      body: "Evita la luce diretta troppo forte. Le lenti anti-riflesso (standard, Mingyue o Zeiss) attenuano i riflessi — Zeiss in testa, Mingyue subito dietro.",
    },
    {
      title: "Protezione UV forte",
      body: "Tutte le nostre lenti includono UV400. Mingyue e Zeiss bloccano il 99,9 % di UVA/UVB; le standard superano il 90 %.",
    },
    {
      title: "Esame e adattamento precisi",
      body: "Esame visivo ogni 6–12 mesi. Lavoriamo ogni lente sui tuoi dati — standard per il budget, Mingyue per il giusto rapporto, Zeiss per l'ottica top.",
    },
  ],

  brandsEyebrow: "Fasce di lenti",
  brandsTitle: "Tre lenti, una sola ossessione: la nitidezza",
  brandsLead:
    "Non promettiamo cure mediche — ma una lente fatta bene cambia davvero la giornata. Scegli la fascia che si adatta ai tuoi occhi e al tuo budget.",
  brands: [
    {
      tag: "Buon rapporto",
      name: "Lenti standard",
      sub: "Affidabili per l'uso quotidiano",
      body: "Resina standard con anti-graffio e UV400, trattamento singolo strato. Indicate sotto le 3,00 diottrie e per budget contenuti. Trasmittanza 92–95 %.",
      bullets: [
        "Anti-riflesso singolo strato",
        "UV400 base",
        "Trasmittanza 92–95 %",
        "Per basse diottrie",
      ],
    },
    {
      tag: "Premium nazionale",
      name: "Lenti Mingyue",
      sub: "Brand ottico cinese leader dal 2002",
      body: "Quotata in borsa, partner dell'aerospaziale cinese. Resina KR e materiali PMC ultraluminosi raggiungono 98,6 % di trasmittanza. La serie indice 1.71 resta sottile con numero di Abbe 37. Doppio filtro luce blu certificato TÜV Rheinland.",
      bullets: [
        "Trasmittanza fino al 98,6 %",
        "1.71 sottile alto indice",
        "Filtro luce blu TÜV",
        "Rivestimento A8 resistente all'usura",
      ],
    },
    {
      tag: "Riferimento mondiale",
      name: "Lenti Zeiss",
      sub: "Un secolo di ottica, pensato per te",
      body: "Tecnologia a superficie libera riduce l'aberrazione di bordo dell'80 % e triplica la chiarezza del campo visivo. i.Scription® rileva 12 parametri biologici per una correzione personalizzata. AR multistrato: 95 % dei riflessi rimossi; filtro luce blu di precisione 415–455 nm.",
      bullets: [
        "Trasmittanza fino al 99 %",
        "Superficie libera di precisione",
        "i.Scription® personalizzato",
        "DuraVision ultra-resistente",
      ],
    },
  ],

  highIndexTitle: "Alto indice sottile e leggero — tre marche a confronto",
  highIndexBody:
    "Per gradazioni 3,00 diottrie e oltre: le standard arrivano in 1.61 / 1.67 (più spesse e pesanti); Mingyue offre 1.61 / 1.67 / 1.71 — la serie 1.71 vince in rapporto qualità-prezzo; Zeiss aggiunge 1.74 ultrafine per la massima discrezione.",

  durabilityTitle: "Trasmittanza e resistenza",
  durability: [
    { brand: "Standard", note: "Anti-riflesso singolo strato" },
    { brand: "Mingyue", note: "A8 anti-usura e anti-sporco" },
    { brand: "Zeiss", note: "DuraVision ultra-resistente" },
  ],

  scenarioTitle: "Scegli la lente per il tuo scenario",
  scenarios: [
    {
      scene: "Pendolarismo quotidiano · budget contenuto",
      rec: "Montatura leggera + lente standard anti-riflesso, l'essenziale a buon prezzo.",
    },
    {
      scene: "Pendolarismo quotidiano · miglior rapporto",
      rec: "Montatura leggera + lente Mingyue anti-riflesso standard — durevole, comoda, ottimo rapporto.",
    },
    {
      scene: "Ufficio e schermo",
      rec: "Mingyue alta nitidezza anti-luce blu (rapporto) o Zeiss anti-luce blu (premium nitidezza).",
    },
    {
      scene: "Outdoor e viaggio",
      rec: "Mingyue UV400 fotocromatica (rapporto) o Zeiss fotocromatica (cambio rapido, colore uniforme).",
    },
    {
      scene: "Gradazione alta · si preferisce sottile",
      rec: "Mingyue 1.71 (rapporto) o Zeiss 1.74 (ultrafine premium); standard 1.67 se il budget è ridotto.",
    },
    {
      scene: "Esperienza visiva premium",
      rec: "Zeiss 1.71/1.74 + AR per la massima nitidezza; Mingyue 天玑 (Tianji) è un'ottima alternativa premium cinese.",
    },
  ],

  promiseEyebrow: "La nostra promessa",
  promiseTitle: "Ottica ragionevole, accessibile a tutti",
  promiseBody:
    "Forti di una filiera produttiva matura, applichiamo standard qualitativi rigorosi a ogni paio — standard per l'accessibilità, Mingyue per il miglior rapporto, Zeiss per la massima ottica. Ogni lente è rifinita a mano sulla tua prescrizione, per una visione più nitida, sicura e confortevole.",
  promiseTag:
    "Cura degli occhi basata sulla scienza · la nitidezza inizia dalla lente giusta.",
  ctaShop: "Acquista occhiali",
  ctaTryon: "Prova virtualmente",
};

const pt: Content = {
  eyebrow: "Ciência das lentes · Cuidado diário",
  title: "Olhos saudáveis começam pela lente certa",
  intro:
    "Uma boa visão impulsiona o seu dia — na tela, na estrada, ao ar livre. Oferecemos três níveis de lente — Comum, Mingyue e Zeiss — para que cada grau, cenário e orçamento encontre a lente certa.",
  crumbHome: "Início",
  crumbHere: "Guia de lentes",

  discomfortTitle: "Desconfortos oculares mais comuns",
  discomfortLead:
    "A maior parte dos incômodos modernos não é doença — vem de hábitos de tela e da lente errada. Escolher a lente certa é o primeiro alívio.",
  discomforts: [
    {
      title: "Olhos cansados após muito tempo de tela",
      body: "Geralmente causado por lentes antirreflexo ou antiluz azul de baixa qualidade. A tecnologia profissional da Mingyue e da Zeiss reduz a fadiga de forma significativa.",
    },
    {
      title: "Secura, vermelhidão ou coceira",
      body: "Associado a baixa transmitância e armações pesadas. Mingyue e Zeiss usam materiais de alta pureza para um uso mais confortável.",
    },
    {
      title: "Reflexos e ofuscamento em ambientes internos",
      body: "Provocados por tratamentos antirreflexo de camada única. O AR multicamadas da Zeiss e a série A da Mingyue reduzem os reflexos drasticamente.",
    },
    {
      title: "Irritação por UV ao ar livre",
      body: "As lentes comuns oferecem proteção UV básica; Mingyue e Zeiss bloqueiam 99,9 % dos UVA/UVB com proteção UV400 completa.",
    },
    {
      title: "Visão borrada de longe ou de perto",
      body: "Receita incorreta ou polimento impreciso. A óptica de precisão da Zeiss e o controle de qualidade da Mingyue superam de longe as lentes genéricas.",
    },
  ],
  discomfortFootnote:
    "A maioria desses desconfortos está ligada a hábitos diários, não a doenças. Com uma manufatura madura e três níveis de lente, cada cliente encontra a sua.",

  careTitle: "Como cuidar dos olhos todos os dias",
  care: [
    {
      title: "Controle o tempo de tela",
      body: "A cada 30–40 minutos, olhe para algo a mais de 5 metros por 5 minutos ou feche os olhos. Lentes Mingyue de duplo filtro azul ou Zeiss antiluz azul reduzem ainda mais a fadiga.",
    },
    {
      title: "Equilibre a iluminação interna",
      body: "Evite luz direta forte. Lentes antirreflexo (comuns, Mingyue ou Zeiss) suavizam os reflexos — Zeiss lidera, Mingyue logo atrás.",
    },
    {
      title: "Proteção UV forte",
      body: "Todas as nossas lentes vêm com UV400. Mingyue e Zeiss bloqueiam 99,9 % dos UVA/UVB; as comuns ultrapassam 90 %.",
    },
    {
      title: "Exame e ajuste precisos",
      body: "Exame de vista a cada 6–12 meses. Polimos cada lente conforme seu grau — comum para orçamento, Mingyue para custo-benefício, Zeiss para óptica de ponta.",
    },
  ],

  brandsEyebrow: "Níveis de lente",
  brandsTitle: "Três lentes, uma só obsessão: clareza",
  brandsLead:
    "Não prometemos tratamento médico — mas uma lente bem feita muda mesmo a sensação do dia. Escolha o nível que combina com seus olhos e seu orçamento.",
  brands: [
    {
      tag: "Custo-benefício",
      name: "Lentes comuns",
      sub: "O básico confiável para o dia a dia",
      body: "Resina padrão com proteção contra arranhões e UV400, tratamento de camada única. Ideais até 3,00 graus e para uso diário com orçamento limitado. Transmitância 92–95 %.",
      bullets: [
        "Camada antirreflexo única",
        "UV400 básico",
        "Transmitância 92–95 %",
        "Para baixo grau",
      ],
    },
    {
      tag: "Premium nacional",
      name: "Lentes Mingyue",
      sub: "Marca óptica líder na China desde 2002",
      body: "Listada em bolsa, parceira do programa espacial chinês. Resina KR e materiais PMC ultra-brilhantes atingem 98,6 % de transmitância. A série de alto índice 1,71 mantém finura excepcional com número de Abbe 37. Duplo filtro de luz azul certificado pela TÜV Rheinland.",
      bullets: [
        "Transmitância até 98,6 %",
        "1,71 alto índice fino",
        "Filtro de luz azul TÜV",
        "Revestimento A8 resistente",
      ],
    },
    {
      tag: "Referência mundial",
      name: "Lentes Zeiss",
      sub: "Um século de óptica, feita para você",
      body: "Tecnologia de superfície livre reduz 80 % da aberração de borda e triplica a clareza do campo visual. i.Scription® analisa 12 parâmetros biológicos para correção personalizada. AR multicamadas elimina 95 % dos reflexos; filtro de luz azul preciso bloqueia 415–455 nm.",
      bullets: [
        "Transmitância até 99 %",
        "Óptica de superfície livre",
        "i.Scription® personalizado",
        "DuraVision ultra-resistente",
      ],
    },
  ],

  highIndexTitle: "Alto índice fino e leve — três marcas comparadas",
  highIndexBody:
    "Para 3,00 graus ou mais: as comuns vêm em 1,61 / 1,67 (mais grossas e pesadas); Mingyue oferece 1,61 / 1,67 / 1,71 — a série 1,71 é a campeã em custo-benefício; Zeiss adiciona 1,74 ultrafino para o visual mais discreto em grau alto.",

  durabilityTitle: "Transmitância e durabilidade",
  durability: [
    { brand: "Comum", note: "Camada antirreflexo única" },
    { brand: "Mingyue", note: "A8 resistente a desgaste e sujeira" },
    { brand: "Zeiss", note: "DuraVision ultra-resistente" },
  ],

  scenarioTitle: "Escolha a lente para o seu cenário",
  scenarios: [
    {
      scene: "Deslocamento diário · orçamento baixo",
      rec: "Armação leve + lente comum antirreflexo — o básico a bom preço.",
    },
    {
      scene: "Deslocamento diário · melhor custo-benefício",
      rec: "Armação leve + lente Mingyue antirreflexo padrão — durável, confortável e bem precificada.",
    },
    {
      scene: "Escritório e telas",
      rec: "Mingyue alta clareza com filtro azul (custo-benefício) ou Zeiss filtro azul (premium clareza).",
    },
    {
      scene: "Ar livre e viagem",
      rec: "Mingyue UV400 fotossensível (custo-benefício) ou Zeiss fotossensível (mudança rápida e cor uniforme).",
    },
    {
      scene: "Grau alto · prefere fino",
      rec: "Mingyue 1,71 (custo-benefício) ou Zeiss 1,74 (ultrafino premium); comum 1,67 se o orçamento apertar.",
    },
    {
      scene: "Experiência visual premium",
      rec: "Zeiss 1,71/1,74 + AR para a máxima clareza; Mingyue 天玑 (Tianji) é uma ótima alternativa premium chinesa.",
    },
  ],

  promiseEyebrow: "Nossa promessa",
  promiseTitle: "Óptica razoável, ao alcance de todos",
  promiseBody:
    "Apoiados em uma cadeia de produção madura, mantemos padrões de qualidade rigorosos em cada par — comum para o preço acessível, Mingyue para o melhor custo-benefício, Zeiss para a melhor óptica. Cada lente é polida à mão conforme sua receita, para visão mais clara, segura e confortável.",
  promiseTag:
    "Cuidado ocular com base científica · a visão clara começa com a lente certa.",
  ctaShop: "Comprar óculos",
  ctaTryon: "Provar virtualmente",
};

const ja: Content = {
  eyebrow: "レンズの科学 · 毎日のアイケア",
  title: "健康な目は、合うレンズから始まる",
  intro:
    "スマホ、画面、通勤、外出——一日の質はクリアな視界に支えられている。普通レンズ・Mingyue・ZEISS の 3 ランクで、度数・シーン・予算にぴったり合う「ちょうどいい一枚」を。",
  crumbHome: "ホーム",
  crumbHere: "レンズガイド",

  discomfortTitle: "あなたも、こんな目の不調？",
  discomfortLead:
    "現代の目の不調の多くは病気ではなく、スマホ・PC を見すぎる習慣と合わないレンズが原因。一日のリズムに合うレンズを選ぶことが、最初の救いになる。",
  discomforts: [
    {
      title: "長時間の画面で目が重い・痛い",
      body: "性能の低い反射防止や防ブルーライトのレンズが原因のことが多い。Mingyue と ZEISS のプロ仕様ブルーライトカットは疲労を大きく軽減します。",
    },
    {
      title: "目の乾燥・充血・かゆみ",
      body: "レンズの透過率の低さやフレームの重さに起因。Mingyue と ZEISS は高純度素材でクリアな掛け心地に。",
    },
    {
      title: "室内で眩しさや反射が気になる",
      body: "単層コーティングの普通レンズに多い症状。ZEISS の多層 AR と Mingyue の A シリーズコーティングは反射を大幅に削減。",
    },
    {
      title: "屋外で UV にやられる",
      body: "普通レンズは基本的な UV のみ。Mingyue と ZEISS は UV400 で UVA/UVB を 99.9% カット。",
    },
    {
      title: "遠くや近くがぼやける",
      body: "度数の不適合や粗い研磨が原因。ZEISS の精密光学と Mingyue の厳しい品質管理は、ジェネリックを大きく上回ります。",
    },
  ],
  discomfortFootnote:
    "多くは生活習慣と合わないレンズによるもので、深刻な眼病ではありません。成熟した製造体制と 3 段階のレンズで、誰もが「合う一枚」に出会えるよう設計しています。",

  careTitle: "毎日の目を守る 4 つのポイント",
  care: [
    {
      title: "画面時間をコントロール",
      body: "30–40 分ごとに 5 メートル先を 5 分眺める、または目を閉じる。Mingyue 双効防ブルーライトまたは ZEISS 防ブルーライトレンズで負担をさらに軽減。",
    },
    {
      title: "室内照明を整える",
      body: "強い直射光を避ける。反射防止レンズ（普通・Mingyue・ZEISS）はどれも反射を柔らかくする——ZEISS が一番、Mingyue がすぐ後を追う。",
    },
    {
      title: "強力な UV 防護",
      body: "当店のレンズはすべて UV400 標準装備。Mingyue と ZEISS は UVA/UVB を 99.9% カット、普通レンズも 90%+ をブロック。",
    },
    {
      title: "視力測定と精密な合わせ",
      body: "6–12 ヶ月ごとに視力検査を。あなたの度数データに合わせて 1 枚ずつ加工——普通レンズは予算重視、Mingyue は価値、ZEISS は最上の光学。",
    },
  ],

  brandsEyebrow: "レンズランク",
  brandsTitle: "3 段階のレンズ、同じクリアさへのこだわり",
  brandsLead:
    "医療的な治療効果は約束しないが、良いレンズは間違いなく一日の感覚を変える。あなたの目と予算に合うランクを。",
  brands: [
    {
      tag: "コスパ重視",
      name: "普通レンズ",
      sub: "日常使いの信頼できるベース",
      body: "標準樹脂に基本の傷防止と UV400、単層コーティング。300° 以下や予算を抑えたい日常用途に最適、透過率 92–95%。",
      bullets: [
        "単層コーティング",
        "UV400 基本",
        "透過率 92–95%",
        "低度数向け",
      ],
    },
    {
      tag: "国産プレミアム",
      name: "Mingyue（明月）レンズ",
      sub: "2002 年創業の中国トップ光学ブランド",
      body: "A 株上場、中国宇宙開発の協力企業。KR 樹脂と PMC 超高輝度素材で透過率 98.6%。1.71 高屈折率シリーズはアッベ数 37 で薄さも両立。デュアル防ブルーライトは TÜV Rheinland 認証取得。",
      bullets: [
        "透過率 98.6%",
        "1.71 高屈折で薄型",
        "TÜV 認証防ブルーライト",
        "A8 耐摩耗コート",
      ],
    },
    {
      tag: "グローバル基準",
      name: "ZEISS（ツァイス）レンズ",
      sub: "一世紀の光学、あなたのために",
      body: "フリーフォーム面技術で周辺収差を 80% 削減、視野のクリアさを 3 倍に。i.Scription® は 12 の生体パラメータを取得し個別最適化。多層 AR で反射を 95% 除去、415–455nm の有害ブルーライトを精密カット。",
      bullets: [
        "透過率 99%",
        "フリーフォーム光学",
        "i.Scription® 個別最適化",
        "DuraVision 超耐摩耗",
      ],
    },
  ],

  highIndexTitle: "高屈折で薄型 — 3 ブランド比較",
  highIndexBody:
    "300°+ の高度数：普通レンズは 1.61 / 1.67（厚く重め）、Mingyue は 1.61 / 1.67 / 1.71 を提供し 1.71 が最もコスパに優れる；ZEISS はさらに 1.74 を加え、強度数で最も薄く軽い仕上がりに。",

  durabilityTitle: "透過率と耐久性",
  durability: [
    { brand: "普通", note: "単層コーティング" },
    { brand: "Mingyue", note: "A8 耐摩耗・防汚膜" },
    { brand: "ZEISS", note: "DuraVision 超耐摩耗" },
  ],

  scenarioTitle: "シーン別レンズの選び方",
  scenarios: [
    {
      scene: "毎日の通勤 · 低予算",
      rec: "軽量フレーム + 普通レンズの反射防止、基本性能をリーズナブルに。",
    },
    {
      scene: "毎日の通勤 · コスパ重視",
      rec: "軽量フレーム + Mingyue 標準反射防止、丈夫で快適、コスパ良し。",
    },
    {
      scene: "オフィスと画面作業",
      rec: "Mingyue 高透防ブルーライト（コスパ）または ZEISS 防ブルーライト（プレミアム）。",
    },
    {
      scene: "屋外・旅行",
      rec: "Mingyue UV400 調光（コスパ）または ZEISS 調光（変化が速く色味が均一）。",
    },
    {
      scene: "高度数 · 薄さ重視",
      rec: "Mingyue 1.71（コスパ）または ZEISS 1.74（プレミアム超薄型）、予算が厳しければ普通 1.67。",
    },
    {
      scene: "究極の視覚体験",
      rec: "ZEISS 1.71/1.74 + AR コーティングで圧倒的なクリアさ。Mingyue 天玑（Tianji）は国産プレミアムの優れた代替。",
    },
  ],

  promiseEyebrow: "私たちの約束",
  promiseTitle: "理にかなった光学を、誰にでも手の届く形で",
  promiseBody:
    "成熟したメガネ製造のサプライチェーンに支えられ、すべての一本に厳しい品質基準を適用——普通レンズは買いやすさ、Mingyue は価値、ZEISS は最上の光学。あなたの処方どおりに一枚ずつ手仕上げし、よりクリアで安全、快適な視界を届けます。",
  promiseTag: "科学に基づくアイケア · クリアな視界は、合うレンズから始まる。",
  ctaShop: "メガネを買う",
  ctaTryon: "バーチャル試着",
};

const ko: Content = {
  eyebrow: "렌즈의 과학 · 매일의 눈 케어",
  title: "건강한 눈은 알맞은 렌즈에서 시작됩니다",
  intro:
    "화면 앞, 출근길, 야외 — 하루의 질은 또렷한 시야에서 시작됩니다. 일반 렌즈 · 밍위에 · 자이스 3가지 등급으로, 도수와 상황, 예산에 가장 잘 맞는 한 장의 렌즈를 제안합니다.",
  crumbHome: "홈",
  crumbHere: "렌즈 가이드",

  discomfortTitle: "혹시 이런 눈의 불편함이 있나요?",
  discomfortLead:
    "현대인의 눈 불편 대부분은 질병이 아니라, 화면 위주의 습관과 잘못된 렌즈에서 옵니다. 하루에 어울리는 렌즈를 고르는 것이 첫 번째 처방.",
  discomforts: [
    {
      title: "오래 화면을 본 뒤 눈이 무거움",
      body: "성능이 떨어지는 반사 방지·블루라이트 차단 렌즈가 원인인 경우가 많습니다. 밍위에·자이스의 전문 블루라이트 차단 기술은 피로를 크게 줄여줍니다.",
    },
    {
      title: "건조함·충혈·가려움",
      body: "낮은 광 투과율과 무거운 프레임이 원인입니다. 밍위에·자이스는 고순도 소재로 더 또렷하고 편안하게 사용할 수 있습니다.",
    },
    {
      title: "실내에서 눈부심과 반사",
      body: "단층 코팅 일반 렌즈에서 흔히 발생합니다. 자이스 멀티 레이어 AR과 밍위에 A 시리즈 코팅이 반사를 대폭 줄여줍니다.",
    },
    {
      title: "야외 UV 자극",
      body: "일반 렌즈는 기본 UV 차단만 제공합니다. 밍위에·자이스는 UV400으로 UVA/UVB 99.9% 차단합니다.",
    },
    {
      title: "원·근거리 시야가 흐림",
      body: "잘못된 도수나 거친 가공이 원인입니다. 자이스 정밀 광학과 밍위에 엄격한 품질 관리는 일반 렌즈를 크게 앞섭니다.",
    },
  ],
  discomfortFootnote:
    "대부분의 불편함은 일상 습관과 맞지 않는 렌즈에서 옵니다 — 심각한 안 질환이 아닌 한. 성숙한 제조 체계와 3가지 등급의 렌즈로, 누구든 자신에게 맞는 한 장을 찾을 수 있도록 설계했습니다.",

  careTitle: "매일 눈을 지키는 4가지 포인트",
  care: [
    {
      title: "화면 시간 관리",
      body: "30–40분마다 5미터 이상 거리의 사물을 5분간 바라보거나 눈을 감으세요. 밍위에 듀얼 블루라이트 또는 자이스 블루라이트 차단 렌즈가 더해지면 부담이 훨씬 줄어듭니다.",
    },
    {
      title: "실내 조명 균형",
      body: "강한 직사광을 피하세요. 반사 방지 렌즈(일반·밍위에·자이스)는 모두 반사를 부드럽게 만듭니다 — 자이스가 가장 뛰어나고 밍위에가 바로 그 뒤를 잇습니다.",
    },
    {
      title: "강한 UV 차단",
      body: "모든 렌즈에 UV400이 기본 적용됩니다. 밍위에·자이스는 UVA/UVB 99.9% 차단, 일반 렌즈도 90% 이상 차단합니다.",
    },
    {
      title: "정기 검안과 정밀 가공",
      body: "6–12개월마다 시력 검사를 권합니다. 처방 데이터에 맞춰 한 장씩 가공합니다 — 일반은 예산, 밍위에는 가성비, 자이스는 최상의 광학.",
    },
  ],

  brandsEyebrow: "렌즈 등급",
  brandsTitle: "세 가지 렌즈, 같은 명료함에 대한 집착",
  brandsLead:
    "의료적인 치료를 보장하지는 않지만, 잘 만든 렌즈는 분명히 하루의 감각을 바꿉니다. 당신의 눈과 예산에 맞는 등급을 고르세요.",
  brands: [
    {
      tag: "가성비",
      name: "일반 렌즈",
      sub: "매일 쓰기 좋은 든든한 기본",
      body: "표준 수지에 기본 스크래치 방지와 UV400, 단층 코팅. 300° 이하와 가성비를 중시하는 일상 사용에 적합. 광 투과율 92–95%.",
      bullets: ["단층 코팅", "UV400 기본", "광 투과율 92–95%", "저도수에 적합"],
    },
    {
      tag: "국산 프리미엄",
      name: "밍위에(明月) 렌즈",
      sub: "2002년 설립된 중국 대표 광학 브랜드",
      body: "A주 상장사, 중국 항공우주 협력 파트너. KR 수지와 PMC 초투명 소재로 광 투과율 98.6%. 1.71 고굴절률 시리즈는 아베수 37로 얇음을 함께 잡았습니다. 듀얼 블루라이트 차단은 TÜV Rheinland 인증.",
      bullets: [
        "광 투과율 98.6%",
        "1.71 고굴절 얇은 렌즈",
        "TÜV 인증 블루라이트 차단",
        "A8 내마모 코팅",
      ],
    },
    {
      tag: "글로벌 기준",
      name: "자이스(ZEISS) 렌즈",
      sub: "100년의 광학, 당신을 위한 설계",
      body: "자유 곡면 기술로 가장자리 수차를 80% 줄이고 시야 선명도를 3배로. i.Scription®은 12가지 생체 파라미터를 측정해 개인 맞춤 보정. 멀티 레이어 AR로 반사 95% 제거, 정밀 블루라이트 필터로 415–455nm 차단.",
      bullets: [
        "광 투과율 99%",
        "자유 곡면 광학",
        "i.Scription® 맞춤",
        "DuraVision 초내마모",
      ],
    },
  ],

  highIndexTitle: "고굴절 얇은 렌즈 — 세 브랜드 비교",
  highIndexBody:
    "300°+ 고도수: 일반 렌즈는 1.61 / 1.67(두껍고 무거움); 밍위에는 1.61 / 1.67 / 1.71을 제공, 1.71 시리즈가 가성비 최강; 자이스는 1.74 초박형까지 더해 고도수에서 가장 얇고 깔끔한 인상.",

  durabilityTitle: "광 투과율과 내구성",
  durability: [
    { brand: "일반", note: "단층 코팅 기본" },
    { brand: "밍위에", note: "A8 내마모·방오" },
    { brand: "자이스", note: "DuraVision 초내마모" },
  ],

  scenarioTitle: "상황별 렌즈 선택",
  scenarios: [
    {
      scene: "일상 출퇴근 · 저예산",
      rec: "경량 프레임 + 일반 반사 방지 렌즈 — 기본을 합리적으로.",
    },
    {
      scene: "일상 출퇴근 · 가성비",
      rec: "경량 프레임 + 밍위에 표준 반사 방지 — 내구성·편안함·가격 모두 균형.",
    },
    {
      scene: "사무실·화면 작업",
      rec: "밍위에 고투명 블루라이트 차단(가성비) 또는 자이스 블루라이트 차단(프리미엄 선명도).",
    },
    {
      scene: "야외·여행",
      rec: "밍위에 UV400 변색(가성비) 또는 자이스 변색(빠른 변색·고른 색감).",
    },
    {
      scene: "고도수 · 얇기를 우선",
      rec: "밍위에 1.71(가성비) 또는 자이스 1.74(프리미엄 초박형); 예산이 빠듯하면 일반 1.67.",
    },
    {
      scene: "최고의 시각 경험",
      rec: "자이스 1.71/1.74 + AR로 극한의 선명도; 밍위에 天玑(Tianji)는 국산 프리미엄의 강력한 대안.",
    },
  ],

  promiseEyebrow: "우리의 약속",
  promiseTitle: "합리적인 광학을, 누구에게나",
  promiseBody:
    "성숙한 안경 제조 공급망을 기반으로, 모든 한 짝에 엄격한 품질 기준을 적용합니다 — 일반 렌즈로는 누구나 살 수 있게, 밍위에로는 가성비를, 자이스로는 최고의 광학을. 한 장 한 장 처방에 맞춰 손으로 가공해, 더 또렷하고 안전하며 편안한 시야를 전합니다.",
  promiseTag:
    "과학에 기반한 눈 관리 · 또렷한 시야는 알맞은 렌즈에서 시작됩니다.",
  ctaShop: "안경 쇼핑",
  ctaTryon: "가상 착용",
};

const ar: Content = {
  eyebrow: "علم العدسات · العناية اليومية بالعينين",
  title: "العين الصحية تبدأ من العدسة المناسبة",
  intro:
    "الرؤية الواضحة تقود يومك — أمام الشاشة، في الطريق، وفي الخارج. نقدّم ثلاث فئات من العدسات — العادية وMingyue وZeiss — لتجد كل وصفة وكل مشهد وكل ميزانية عدسةً تشعرك بالراحة الكاملة.",
  crumbHome: "الرئيسية",
  crumbHere: "دليل العدسات",

  discomfortTitle: "هل تشعر بهذه الأعراض اليومية للعين؟",
  discomfortLead:
    "أغلب مشاكل العين الحديثة ليست مرضية — بل ناتجة عن قضاء وقت طويل أمام الشاشات واختيار العدسة الخاطئة. اختيار العدسة المناسبة هو أول راحة.",
  discomforts: [
    {
      title: "إجهاد العين بعد ساعات أمام الشاشة",
      body: "غالبًا بسبب عدسات منخفضة الجودة في مقاومة الانعكاس أو الضوء الأزرق. تقنيات Mingyue وZeiss الاحترافية تخفّض الإرهاق بشكل واضح.",
    },
    {
      title: "جفاف العين أو احمرارها أو حكّتها",
      body: "مرتبط بانخفاض الشفافية ووزن الإطار. تستخدم Mingyue وZeiss مواد عالية النقاء لارتداء أكثر راحة.",
    },
    {
      title: "وهج وانعكاسات داخل المباني",
      body: "ناتج عن طبقات مضادة للانعكاس أحادية. الطبقات المتعددة من Zeiss وسلسلة A من Mingyue تقلل الانعكاسات بشكل كبير.",
    },
    {
      title: "تهيّج من الأشعة فوق البنفسجية في الخارج",
      body: "العدسات العادية توفّر حماية أساسية فقط؛ بينما Mingyue وZeiss تحجبان 99.9٪ من UVA/UVB بحماية UV400 كاملة.",
    },
    {
      title: "ضبابية في الرؤية القريبة أو البعيدة",
      body: "وصفة غير دقيقة أو صقل سيّء. الدقة البصرية لـ Zeiss وضبط الجودة الصارم في Mingyue يتفوقان كثيرًا على العدسات العامة.",
    },
  ],
  discomfortFootnote:
    "أغلب هذه المضايقات سببها عادات يومية وعدسات غير مناسبة، وليست أمراضًا خطيرة. منظومة تصنيع ناضجة وثلاث فئات من العدسات تجعل كل عميل يجد عدسته المناسبة.",

  careTitle: "أربع نصائح يومية لحماية عينيك",
  care: [
    {
      title: "تحكّم في وقت الشاشة",
      body: "كل 30–40 دقيقة انظر إلى ما بُعده أكثر من 5 أمتار لمدة 5 دقائق أو أغمض عينيك. عدسات Mingyue الثنائية ضد الضوء الأزرق أو فلتر Zeiss يخفّضان الإرهاق أكثر.",
    },
    {
      title: "وازِن الإضاءة الداخلية",
      body: "تجنّب الضوء المباشر القوي. عدسات مقاومة الانعكاس (العادية وMingyue وZeiss) تليّن الانعكاسات — Zeiss أولًا وMingyue قريبة جدًا.",
    },
    {
      title: "حماية قوية من الأشعة فوق البنفسجية",
      body: "جميع عدساتنا تأتي بحماية UV400. Mingyue وZeiss تحجبان 99.9٪ من UVA/UVB؛ العادية تحجب أكثر من 90٪.",
    },
    {
      title: "فحص دقيق ومطابقة محكمة",
      body: "افحص بصرك كل 6–12 شهرًا. نصقل كل عدسة وفق بياناتك — العادية للميزانية، Mingyue للقيمة، Zeiss لأعلى أداء بصري.",
    },
  ],

  brandsEyebrow: "فئات العدسات",
  brandsTitle: "ثلاث عدسات، هوس واحد بالوضوح",
  brandsLead:
    "لا نعد بأي علاج طبي — لكن العدسة المصنوعة جيدًا تغيّر فعلًا إحساس اليوم بأكمله. اختر الفئة التي تناسب عينيك وميزانيتك.",
  brands: [
    {
      tag: "اقتصادية",
      name: "عدسات عادية",
      sub: "أساسيات موثوقة للاستخدام اليومي",
      body: "راتنج قياسي مع مقاومة الخدش وحماية UV400 وطبقة أحادية. مناسبة لمقاسات دون 3.00 ديوبتر وللاستخدام اليومي بميزانية محدودة. شفافية 92–95٪.",
      bullets: [
        "طبقة أحادية",
        "UV400 الأساسي",
        "شفافية 92–95٪",
        "لمقاسات منخفضة",
      ],
    },
    {
      tag: "بريميوم محلية",
      name: "عدسات Mingyue",
      sub: "العلامة البصرية الرائدة في الصين منذ 2002",
      body: "مدرجة في البورصة وشريكة لبرنامج الفضاء الصيني. تصل راتنجات KR ومواد PMC فائقة الإضاءة إلى شفافية 98.6٪. سلسلة 1.71 عالية الانكسار تبقى رقيقة برقم Abbe 37. مرشّح ضوء أزرق مزدوج معتمد من TÜV Rheinland.",
      bullets: [
        "شفافية تصل إلى 98.6٪",
        "1.71 رقيقة عالية الانكسار",
        "مرشّح ضوء أزرق TÜV",
        "طبقة A8 مقاومة للتآكل",
      ],
    },
    {
      tag: "معيار عالمي",
      name: "عدسات Zeiss",
      sub: "قرن من البصريات، صُمّم من أجلك",
      body: "تقنية السطح الحر تخفّض الزيغ على الأطراف بنسبة 80٪ وتضاعف وضوح مجال الرؤية ثلاث مرات. تقرأ i.Scription® اثني عشر مقياسًا حيويًا لتصحيح شخصي. طبقات AR متعددة تزيل 95٪ من الانعكاسات؛ مرشّح ضوء أزرق دقيق يحجب 415–455 نانومتر.",
      bullets: [
        "شفافية تصل إلى 99٪",
        "بصريات بسطح حر",
        "i.Scription® مخصّص",
        "DuraVision فائق المقاومة",
      ],
    },
  ],

  highIndexTitle: "ارتفاع معامل الانكسار — مقارنة بين ثلاث علامات",
  highIndexBody:
    "للمقاسات 3.00 ديوبتر فأعلى: العادية تتوفر بمعامل 1.61 / 1.67 (أكثر سُمكًا ووزنًا)؛ Mingyue تقدم 1.61 / 1.67 / 1.71 وسلسلة 1.71 هي الأفضل سعرًا وأداءً؛ Zeiss تضيف 1.74 الفائقة الرقّة لأخف وأنحف مظهر مع المقاسات العالية.",

  durabilityTitle: "الشفافية والمتانة",
  durability: [
    { brand: "عادية", note: "طبقة أحادية أساسية" },
    { brand: "Mingyue", note: "A8 مقاوم للتآكل والاتساخ" },
    { brand: "Zeiss", note: "DuraVision فائق المقاومة" },
  ],

  scenarioTitle: "اختر العدسة المناسبة لسياقك",
  scenarios: [
    {
      scene: "تنقّل يومي · ميزانية محدودة",
      rec: "إطار خفيف + عدسة عادية مضادة للوهج — الأساسيات بسعر معقول.",
    },
    {
      scene: "تنقّل يومي · أفضل قيمة",
      rec: "إطار خفيف + عدسة Mingyue قياسية مضادة للوهج — متينة ومريحة بسعر جيد.",
    },
    {
      scene: "المكتب والشاشات",
      rec: "Mingyue عالية الشفافية بمرشّح ضوء أزرق (قيمة) أو Zeiss بمرشّح ضوء أزرق (وضوح متميّز).",
    },
    {
      scene: "الهواء الطلق والسفر",
      rec: "Mingyue UV400 متغيّرة اللون (قيمة) أو Zeiss متغيّرة اللون (تغيير سريع وألوان متّسقة).",
    },
    {
      scene: "مقاس عالٍ · يفضّل الرفيع",
      rec: "Mingyue 1.71 (قيمة) أو Zeiss 1.74 (فاخرة فائقة الرقّة)؛ العادية 1.67 إن كانت الميزانية ضيّقة.",
    },
    {
      scene: "تجربة بصرية فاخرة",
      rec: "Zeiss 1.71/1.74 + طبقة AR لوضوح استثنائي؛ Mingyue 天玑 (Tianji) بديل صيني فاخر ممتاز.",
    },
  ],

  promiseEyebrow: "وعدنا",
  promiseTitle: "بصريات منطقية، في متناول الجميع",
  promiseBody:
    "بدعم من سلسلة تصنيع نظارات ناضجة، نحافظ على معايير جودة صارمة لكل زوج — العادية ليكون السعر في متناولك، Mingyue لتحصل على أفضل قيمة، Zeiss لتحظى بأرقى أداء بصري. كل عدسة تُصقل يدويًا وفق وصفتك، لرؤية أكثر وضوحًا وأمانًا وراحة.",
  promiseTag:
    "عناية بصرية قائمة على العلم · الرؤية الواضحة تبدأ من العدسة المناسبة.",
  ctaShop: "تسوّق النظارات",
  ctaTryon: "جربها افتراضيًا",
};

const vi: Content = {
  eyebrow: "Khoa học tròng kính · Chăm sóc mắt mỗi ngày",
  title: "Đôi mắt khỏe bắt đầu từ chiếc tròng kính phù hợp",
  intro:
    "Thị lực tốt đồng hành cùng bạn cả ngày — trước màn hình, trên đường và ngoài trời. Chúng tôi cung cấp ba cấp tròng kính — Phổ thông, Mingyue và Zeiss — để mọi độ cận, mọi tình huống và mọi ngân sách đều tìm được tròng kính ưng ý.",
  crumbHome: "Trang chủ",
  crumbHere: "Hướng dẫn tròng kính",

  discomfortTitle: "Những khó chịu thường gặp của mắt",
  discomfortLead:
    "Hầu hết vấn đề mắt hiện đại không phải bệnh lý — chúng đến từ thói quen nhìn màn hình và tròng kính không phù hợp. Chọn đúng tròng kính theo nhịp sống là cách giảm khó chịu đầu tiên.",
  discomforts: [
    {
      title: "Mỏi mắt sau thời gian dài nhìn màn hình",
      body: "Thường do tròng kính chống chói hoặc lọc ánh sáng xanh kém chất lượng. Công nghệ lọc ánh sáng xanh chuyên nghiệp của Mingyue và Zeiss giúp giảm mỏi rõ rệt.",
    },
    {
      title: "Khô, đỏ hoặc ngứa mắt",
      body: "Liên quan đến độ truyền sáng thấp và gọng nặng. Mingyue và Zeiss sử dụng vật liệu tinh khiết cao, đem lại cảm giác đeo thoải mái, trong trẻo hơn.",
    },
    {
      title: "Chói và phản xạ trong nhà",
      body: "Do lớp phủ chống phản xạ đơn giản. AR đa lớp của Zeiss và lớp phủ A-series của Mingyue giảm phản xạ đáng kể.",
    },
    {
      title: "Mắt bị kích ứng UV khi ra ngoài",
      body: "Tròng kính phổ thông chỉ chống UV cơ bản; Mingyue và Zeiss chặn 99,9% UVA/UVB với bảo vệ UV400 đầy đủ.",
    },
    {
      title: "Mờ ở khoảng cách xa hoặc gần",
      body: "Sai độ hoặc gia công thô. Quang học chính xác Zeiss và kiểm soát chất lượng nghiêm ngặt của Mingyue vượt xa tròng kính phổ thông.",
    },
  ],
  discomfortFootnote:
    "Phần lớn các khó chịu này liên quan đến thói quen hằng ngày, không phải bệnh lý. Chúng tôi kết hợp hệ thống sản xuất trưởng thành với ba cấp tròng kính để mỗi khách hàng đều tìm được lựa chọn vừa vặn.",

  careTitle: "Cách bảo vệ mắt mỗi ngày",
  care: [
    {
      title: "Quản lý thời gian nhìn màn hình",
      body: "Cứ 30–40 phút hãy nhìn vật cách xa hơn 5 mét trong 5 phút, hoặc nhắm mắt nghỉ. Tròng kính lọc kép ánh sáng xanh Mingyue hoặc Zeiss giúp giảm căng thẳng thêm.",
    },
    {
      title: "Cân bằng ánh sáng trong nhà",
      body: "Tránh ánh sáng trực tiếp gay gắt. Tròng kính chống chói (phổ thông, Mingyue hay Zeiss) làm dịu phản xạ — Zeiss dẫn đầu, Mingyue bám sát phía sau.",
    },
    {
      title: "Bảo vệ UV mạnh mẽ",
      body: "Tất cả tròng kính của chúng tôi đều đi kèm UV400. Mingyue và Zeiss chặn 99,9% UVA/UVB; tròng kính phổ thông vẫn chặn được trên 90%.",
    },
    {
      title: "Khám và lắp đúng độ",
      body: "Đo mắt mỗi 6–12 tháng. Chúng tôi mài từng tròng theo dữ liệu của bạn — phổ thông cho ngân sách, Mingyue cho giá trị, Zeiss cho quang học tốt nhất.",
    },
  ],

  brandsEyebrow: "Cấp tròng kính",
  brandsTitle: "Ba tròng kính, một sự ám ảnh về độ trong",
  brandsLead:
    "Chúng tôi không hứa hẹn điều trị y tế — nhưng tròng kính làm tốt thực sự thay đổi cảm giác cả ngày. Hãy chọn cấp phù hợp với mắt và ngân sách của bạn.",
  brands: [
    {
      tag: "Tiết kiệm",
      name: "Tròng kính phổ thông",
      sub: "Nền tảng đáng tin cậy cho sử dụng hằng ngày",
      body: "Nhựa tiêu chuẩn với chống xước và UV400, lớp phủ đơn lớp. Tuyệt vời cho độ dưới 300° và sử dụng hằng ngày tiết kiệm. Độ truyền sáng 92–95%.",
      bullets: [
        "Lớp phủ đơn lớp",
        "UV400 cơ bản",
        "Độ truyền sáng 92–95%",
        "Phù hợp độ thấp",
      ],
    },
    {
      tag: "Cao cấp nội địa",
      name: "Tròng kính Mingyue",
      sub: "Thương hiệu quang học hàng đầu Trung Quốc từ 2002",
      body: "Niêm yết A-share, đối tác Hàng không Vũ trụ Trung Quốc. Nhựa KR và vật liệu siêu sáng PMC đạt độ truyền sáng 98,6%. Dòng chiết suất cao 1.71 giữ độ mỏng với số Abbe 37. Lọc kép ánh sáng xanh được TÜV Rheinland chứng nhận.",
      bullets: [
        "Độ truyền sáng đến 98,6%",
        "1.71 mỏng chiết suất cao",
        "Lọc ánh sáng xanh đạt chuẩn TÜV",
        "Lớp phủ chống mài mòn A8",
      ],
    },
    {
      tag: "Chuẩn mực toàn cầu",
      name: "Tròng kính Zeiss",
      sub: "Một thế kỷ quang học, thiết kế cho bạn",
      body: "Công nghệ bề mặt tự do giảm 80% quang sai rìa và tăng độ rõ trường nhìn gấp 3 lần. i.Scription® đọc 12 thông số sinh học cho hiệu chỉnh cá nhân hoá. AR đa lớp loại bỏ 95% phản xạ; lọc ánh sáng xanh chính xác chặn 415–455nm.",
      bullets: [
        "Độ truyền sáng đến 99%",
        "Quang học bề mặt tự do",
        "Cá nhân hoá i.Scription®",
        "Diamond-cube siêu chống mài mòn",
      ],
    },
  ],

  highIndexTitle: "Chiết suất cao mỏng nhẹ — so sánh ba thương hiệu",
  highIndexBody:
    "Với độ 300°+: tròng kính phổ thông có 1.56 / 1.61 / 1.67 (dày hơn, nặng hơn); Mingyue cung cấp 1.61 / 1.67 / 1.71 với dòng 1.71 là quán quân tỉ lệ giá/chất lượng; Zeiss bổ sung 1.74 siêu mỏng cho diện mạo mảnh nhẹ nhất ở độ cao.",

  durabilityTitle: "Độ truyền sáng & độ bền",
  durability: [
    { brand: "Phổ thông", note: "Lớp phủ đơn cơ bản" },
    { brand: "Mingyue", note: "A8 chống mài mòn & chống bám" },
    { brand: "Zeiss", note: "Diamond-cube siêu chống mài mòn" },
  ],

  scenarioTitle: "Chọn tròng kính cho từng tình huống",
  scenarios: [
    {
      scene: "Đi lại hằng ngày · ngân sách thấp",
      rec: "Gọng nhẹ + tròng kính phổ thông chống chói — đáp ứng cơ bản với giá hợp lý.",
    },
    {
      scene: "Đi lại hằng ngày · giá trị tốt nhất",
      rec: "Gọng nhẹ + tròng kính chống chói tiêu chuẩn Mingyue — bền, thoải mái, giá tốt.",
    },
    {
      scene: "Văn phòng & màn hình",
      rec: "Lọc ánh sáng xanh độ trong cao Mingyue (giá trị) hoặc Zeiss (độ trong cao cấp).",
    },
    {
      scene: "Ngoài trời & du lịch",
      rec: "Mingyue UV400 đổi màu (giá trị) hoặc Zeiss đổi màu (đổi nhanh, màu đều).",
    },
    {
      scene: "Độ cao · ưu tiên mỏng",
      rec: "Mingyue 1.71 (giá trị) hoặc Zeiss 1.74 (siêu mỏng cao cấp); phổ thông 1.67 nếu ngân sách eo hẹp.",
    },
    {
      scene: "Trải nghiệm thị giác cao cấp",
      rec: "Zeiss 1.71/1.74 + lớp AR cho độ trong tột đỉnh; Mingyue 天玑 (Tianji) là lựa chọn cao cấp nội địa rất mạnh.",
    },
  ],

  promiseEyebrow: "Lời hứa của chúng tôi",
  promiseTitle: "Quang học hợp lý, đến tay mọi người",
  promiseBody:
    "Dựa trên chuỗi sản xuất mắt kính trưởng thành, chúng tôi áp tiêu chuẩn chất lượng nghiêm ngặt cho từng cặp — phổ thông cho giá trị, Mingyue cho điểm ngọt ngào, Zeiss cho quang học tốt nhất. Mỗi tròng kính được hoàn thiện thủ công theo đơn của bạn để bạn đeo một thị lực trong hơn, an toàn hơn và thoải mái hơn.",
  promiseTag:
    "Chăm sóc mắt dựa trên khoa học · thị lực rõ ràng bắt đầu từ tròng kính phù hợp.",
  ctaShop: "Mua kính mắt",
  ctaTryon: "Thử kính ảo",
};

const th: Content = {
  eyebrow: "วิทยาศาสตร์เลนส์ · การดูแลดวงตาประจำวัน",
  title: "ดวงตาที่แข็งแรงเริ่มต้นจากเลนส์ที่เหมาะสม",
  intro:
    "การมองเห็นที่ดีขับเคลื่อนทั้งวันของคุณ — หน้าจอ บนถนน และนอกบ้าน เรามีเลนส์ 3 ระดับ — ทั่วไป Mingyue และ Zeiss — เพื่อให้ทุกค่าสายตา ทุกสถานการณ์ และทุกงบประมาณได้เลนส์ที่ลงตัว",
  crumbHome: "หน้าแรก",
  crumbHere: "คู่มือเลนส์",

  discomfortTitle: "ความไม่สบายตาที่พบบ่อยในชีวิตประจำวัน",
  discomfortLead:
    "อาการตาส่วนใหญ่ในยุคนี้ไม่ใช่โรค — มาจากนิสัยจ้องหน้าจอและเลนส์ที่ไม่เหมาะ การเลือกเลนส์ให้เข้ากับวันของคุณคือการบรรเทาขั้นแรก",
  discomforts: [
    {
      title: "ตาล้าหลังใช้หน้าจอนาน",
      body: "มักเกิดจากเลนส์ตัดแสงสะท้อนหรือกรองแสงสีฟ้าคุณภาพต่ำ เทคโนโลยีกรองแสงสีฟ้าของ Mingyue และ Zeiss ช่วยลดความล้าได้ชัดเจน",
    },
    {
      title: "ตาแห้ง แดง หรือคัน",
      body: "เกี่ยวข้องกับการส่งผ่านแสงต่ำและกรอบที่หนัก วัสดุบริสุทธิ์สูงของ Mingyue และ Zeiss ให้การใส่ที่ใสและสบายกว่า",
    },
    {
      title: "แสงจ้าและแสงสะท้อนในร่ม",
      body: "เกิดจากสารเคลือบชั้นเดียวเรียบง่าย AR หลายชั้นของ Zeiss และเคลือบ A-series ของ Mingyue ลดแสงสะท้อนได้มาก",
    },
    {
      title: "ระคายเคืองจาก UV เมื่ออยู่นอกบ้าน",
      body: "เลนส์ทั่วไปให้การกันยูวีพื้นฐาน; Mingyue และ Zeiss กันได้ 99.9% ของ UVA/UVB ด้วยการปกป้อง UV400 เต็มรูปแบบ",
    },
    {
      title: "มองไกลหรือใกล้พร่ามัว",
      body: "ค่าสายตาคลาดเคลื่อนหรือการขัดที่หยาบ ออปติกความแม่นยำของ Zeiss และ QC เข้มงวดของ Mingyue เหนือกว่าเลนส์ทั่วไปมาก",
    },
  ],
  discomfortFootnote:
    "ส่วนใหญ่เกิดจากนิสัยประจำวัน ไม่ใช่พยาธิสภาพ เราจับคู่ระบบการผลิตที่สมบูรณ์กับเลนส์ 3 ระดับ เพื่อให้ลูกค้าทุกคนได้สิ่งที่เหมาะกับตัวเอง",

  careTitle: "ดูแลดวงตาทุกวันอย่างไร",
  care: [
    {
      title: "จัดการเวลาหน้าจอ",
      body: "ทุก 30–40 นาที มองสิ่งที่อยู่ห่างเกิน 5 เมตร เป็นเวลา 5 นาที หรือหลับตา เลนส์กรองแสงสีฟ้าคู่ของ Mingyue หรือ Zeiss ช่วยลดความเครียดได้ยิ่งขึ้น",
    },
    {
      title: "สมดุลแสงในร่ม",
      body: "เลี่ยงแสงตรงที่จ้า เลนส์ตัดแสงสะท้อน (ทั่วไป Mingyue หรือ Zeiss) ทำให้แสงสะท้อนนุ่มขึ้น — Zeiss นำหน้า Mingyue ตามมาติด ๆ",
    },
    {
      title: "ปกป้อง UV เต็มที่",
      body: "เลนส์ทุกตัวของเรามาพร้อม UV400 Mingyue และ Zeiss กัน 99.9% ของ UVA/UVB; เลนส์ทั่วไปยังกันได้ 90%+",
    },
    {
      title: "ตรวจวัดและจัดให้ตรง",
      body: "วัดสายตาทุก 6–12 เดือน เราขัดเลนส์ทุกอันตามข้อมูลของคุณ — ทั่วไปสำหรับงบประมาณ Mingyue สำหรับความคุ้มค่า Zeiss สำหรับออปติกขั้นสุด",
    },
  ],

  brandsEyebrow: "ระดับเลนส์",
  brandsTitle: "สามเลนส์ ความหมกมุ่นเดียวกันต่อความคมชัด",
  brandsLead:
    "เราไม่ได้อ้างการรักษาทางการแพทย์ — แต่เลนส์ที่ทำมาดีเปลี่ยนความรู้สึกของวันได้จริง เลือกระดับที่เข้ากับดวงตาและงบของคุณ",
  brands: [
    {
      tag: "คุ้มค่า",
      name: "เลนส์ทั่วไป",
      sub: "พื้นฐานที่เชื่อถือได้สำหรับใช้ทุกวัน",
      body: "เรซิ่นมาตรฐานพร้อมกันรอยและ UV400 เคลือบชั้นเดียว เหมาะกับสายตาต่ำกว่า 300° และใช้ในชีวิตประจำวันที่คุมงบ การส่งผ่านแสง 92–95%",
      bullets: [
        "เคลือบชั้นเดียว",
        "UV400 พื้นฐาน",
        "การส่งผ่านแสง 92–95%",
        "เหมาะกับค่าสายตาต่ำ",
      ],
    },
    {
      tag: "พรีเมียมจีน",
      name: "เลนส์ Mingyue",
      sub: "แบรนด์ออปติกชั้นนำของจีนตั้งแต่ปี 2002",
      body: "บริษัทจดทะเบียน A-share พันธมิตรของจีนด้านอวกาศ เรซิ่น KR และวัสดุ PMC ใสพิเศษให้การส่งผ่านแสง 98.6% ซีรีส์ดัชนีหักเหสูง 1.71 ยังคงบางด้วย Abbe 37 กรองแสงสีฟ้าคู่รับรองโดย TÜV Rheinland",
      bullets: [
        "การส่งผ่านแสงสูงถึง 98.6%",
        "1.71 บางดัชนีหักเหสูง",
        "กรองแสงสีฟ้ารับรอง TÜV",
        "เคลือบกันรอย A8",
      ],
    },
    {
      tag: "มาตรฐานระดับโลก",
      name: "เลนส์ Zeiss",
      sub: "ออปติกครบศตวรรษ ออกแบบเพื่อคุณ",
      body: "เทคโนโลยีพื้นผิวอิสระลดความคลาดที่ขอบลง 80% และเพิ่มความคมชัดของพื้นที่การมองเห็น 3 เท่า i.Scription® อ่านพารามิเตอร์ชีวภาพ 12 ค่าเพื่อการแก้ไขเฉพาะบุคคล AR หลายชั้นลดการสะท้อน 95%; กรองแสงสีฟ้าแม่นยำที่ 415–455nm",
      bullets: [
        "การส่งผ่านแสงสูงถึง 99%",
        "ออปติกพื้นผิวอิสระ",
        "i.Scription® เฉพาะบุคคล",
        "Diamond-cube กันรอยขั้นสุด",
      ],
    },
  ],

  highIndexTitle: "ดัชนีหักเหสูง บางและเบา — เปรียบเทียบสามแบรนด์",
  highIndexBody:
    "สำหรับสายตา 300°+: เลนส์ทั่วไปมี 1.61 / 1.67 (หนาและหนักกว่า); Mingyue มี 1.61 / 1.67 / 1.71 โดยซีรีส์ 1.71 ชนะด้านความคุ้มค่า; Zeiss เพิ่ม 1.74 บางพิเศษเพื่อรูปทรงเบาบางที่สุดสำหรับค่าสายตาสูง",

  durabilityTitle: "การส่งผ่านแสงและความทนทาน",
  durability: [
    { brand: "ทั่วไป", note: "เคลือบชั้นเดียวพื้นฐาน" },
    { brand: "Mingyue", note: "A8 กันรอยและกันสกปรก" },
    { brand: "Zeiss", note: "Diamond-cube กันรอยขั้นสุด" },
  ],

  scenarioTitle: "เลือกเลนส์ให้เหมาะกับสถานการณ์",
  scenarios: [
    {
      scene: "เดินทางประจำ · งบต่ำ",
      rec: "กรอบเบา + เลนส์ทั่วไปตัดแสงสะท้อน — ครอบคลุมพื้นฐานในราคาเอื้อมถึง",
    },
    {
      scene: "เดินทางประจำ · ความคุ้มค่าสูงสุด",
      rec: "กรอบเบา + เลนส์ Mingyue ตัดแสงสะท้อนมาตรฐาน — ทน สบาย ราคาดี",
    },
    {
      scene: "ออฟฟิศและหน้าจอ",
      rec: "Mingyue กรองแสงสีฟ้าใสสูง (คุ้มค่า) หรือ Zeiss กรองแสงสีฟ้า (คมชัดระดับพรีเมียม)",
    },
    {
      scene: "กลางแจ้งและเดินทาง",
      rec: "Mingyue UV400 เลนส์เปลี่ยนสี (คุ้มค่า) หรือ Zeiss เปลี่ยนสี (เปลี่ยนเร็ว สีสม่ำเสมอ)",
    },
    {
      scene: "ค่าสายตาสูง · ต้องการบาง",
      rec: "Mingyue 1.71 (คุ้มค่า) หรือ Zeiss 1.74 (พรีเมียมบางพิเศษ); ทั่วไป 1.67 หากงบจำกัด",
    },
    {
      scene: "ประสบการณ์การมองเห็นพรีเมียม",
      rec: "Zeiss 1.71/1.74 + เคลือบ AR เพื่อความคมชัดสุดขั้ว; Mingyue 天玑 (Tianji) เป็นทางเลือกพรีเมียมจีนที่แข็งแกร่ง",
    },
  ],

  promiseEyebrow: "คำสัญญาของเรา",
  promiseTitle: "ออปติกที่สมเหตุสมผล เข้าถึงได้สำหรับทุกคน",
  promiseBody:
    "ด้วยห่วงโซ่การผลิตแว่นที่สมบูรณ์ เรายึดมาตรฐานคุณภาพอย่างเข้มงวดกับทุกคู่ — ทั่วไปเพื่อความคุ้ม Mingyue เพื่อจุดที่ลงตัว Zeiss เพื่อสิ่งที่ดีที่สุด เลนส์ทุกตัวขัดด้วยมือตามใบสั่งของคุณเพื่อการมองเห็นที่ใสกว่า ปลอดภัยกว่า และสบายกว่า",
  promiseTag:
    "การดูแลดวงตาตามหลักวิทยาศาสตร์ · การมองเห็นที่คมชัดเริ่มจากเลนส์ที่เหมาะสม",
  ctaShop: "ซื้อแว่นตา",
  ctaTryon: "ลองสวมเสมือนจริง",
};

const id: Content = {
  eyebrow: "Sains lensa · Perawatan mata harian",
  title: "Mata sehat dimulai dari lensa yang tepat",
  intro:
    "Penglihatan yang baik menemani harimu — di depan layar, di jalan, dan di luar ruangan. Kami menyediakan tiga tingkat lensa — Standar, Mingyue, dan Zeiss — agar setiap ukuran, situasi, dan anggaran mendapat lensa yang terasa pas.",
  crumbHome: "Beranda",
  crumbHere: "Panduan lensa",

  discomfortTitle: "Ketidaknyamanan mata harian yang umum",
  discomfortLead:
    "Mayoritas masalah mata modern bukan penyakit — berasal dari kebiasaan menatap layar dan lensa yang salah. Memilih lensa yang sesuai dengan harimu adalah kelegaan pertama.",
  discomforts: [
    {
      title: "Mata lelah setelah lama menatap layar",
      body: "Sering disebabkan lensa anti-silau atau anti-blue light berkualitas rendah. Teknologi filter blue light profesional Mingyue dan Zeiss mengurangi kelelahan secara nyata.",
    },
    {
      title: "Mata kering, merah, atau gatal",
      body: "Berkaitan dengan transmitansi rendah dan bingkai berat. Material kemurnian tinggi Mingyue dan Zeiss memberi pengalaman lebih jernih dan nyaman.",
    },
    {
      title: "Silau dan pantulan di dalam ruangan",
      body: "Akibat lapisan anti-silau lapisan tunggal. AR multilapis Zeiss dan lapisan A-series Mingyue memangkas pantulan secara signifikan.",
    },
    {
      title: "Iritasi UV di luar ruangan",
      body: "Lensa standar hanya memberi perlindungan UV dasar; Mingyue dan Zeiss memblokir 99,9% UVA/UVB dengan perlindungan UV400 penuh.",
    },
    {
      title: "Penglihatan jauh atau dekat buram",
      body: "Resep salah atau penggerindaan kasar. Optik presisi Zeiss dan QC ketat Mingyue jauh di atas lensa generik.",
    },
  ],
  discomfortFootnote:
    "Sebagian besar berasal dari kebiasaan harian, bukan patologi. Kami memadukan sistem manufaktur yang matang dengan tiga tingkat lensa agar setiap pelanggan menemukan yang pas.",

  careTitle: "Cara merawat mata setiap hari",
  care: [
    {
      title: "Atur waktu di depan layar",
      body: "Setiap 30–40 menit, lihat objek berjarak lebih dari 5 meter selama 5 menit, atau pejamkan mata. Lensa filter blue light ganda Mingyue atau filter blue light Zeiss menambah kenyamanan.",
    },
    {
      title: "Seimbangkan pencahayaan dalam ruangan",
      body: "Hindari cahaya langsung yang keras. Lensa anti-silau (standar, Mingyue, atau Zeiss) melembutkan pantulan — Zeiss memimpin, Mingyue di belakangnya.",
    },
    {
      title: "Perlindungan UV yang kuat",
      body: "Semua lensa kami dilengkapi UV400. Mingyue dan Zeiss memblokir 99,9% UVA/UVB; lensa standar tetap memblokir 90%+.",
    },
    {
      title: "Periksa & sesuaikan dengan presisi",
      body: "Periksa mata setiap 6–12 bulan. Kami menggerinda setiap lensa sesuai data Anda — standar untuk anggaran, Mingyue untuk nilai, Zeiss untuk optik terbaik.",
    },
  ],

  brandsEyebrow: "Tingkat lensa",
  brandsTitle: "Tiga lensa, satu obsesi terhadap kejernihan",
  brandsLead:
    "Kami tidak mengklaim pengobatan medis — tetapi lensa yang dibuat baik benar-benar mengubah rasa sehari-hari. Pilih tingkat yang cocok dengan mata dan anggaranmu.",
  brands: [
    {
      tag: "Hemat",
      name: "Lensa standar",
      sub: "Dasar yang andal untuk pemakaian harian",
      body: "Resin standar dengan anti-gores dan UV400, lapisan tunggal. Cocok untuk ukuran di bawah 300° dan pemakaian harian hemat. Transmitansi 92–95%.",
      bullets: [
        "Lapisan tunggal",
        "UV400 dasar",
        "Transmitansi 92–95%",
        "Cocok untuk ukuran rendah",
      ],
    },
    {
      tag: "Premium domestik",
      name: "Lensa Mingyue",
      sub: "Merek optik terkemuka Tiongkok sejak 2002",
      body: "Tercatat A-share, mitra Kedirgantaraan Tiongkok. Resin KR & material PMC ultra-cerah mencapai transmitansi 98,6%. Seri indeks tinggi 1.71 tetap tipis dengan angka Abbe 37. Filter blue light ganda bersertifikat TÜV Rheinland.",
      bullets: [
        "Transmitansi hingga 98,6%",
        "1.71 indeks tinggi tipis",
        "Filter blue light bersertifikat TÜV",
        "Lapisan tahan aus A8",
      ],
    },
    {
      tag: "Tolok ukur global",
      name: "Lensa Zeiss",
      sub: "Satu abad optik, dirancang untukmu",
      body: "Teknologi permukaan bebas memangkas aberasi tepi 80% dan melipatgandakan kejernihan bidang pandang tiga kali. i.Scription® membaca 12 parameter biologis untuk koreksi personal. AR multilapis menghilangkan 95% pantulan; filter blue light presisi memblokir 415–455nm.",
      bullets: [
        "Transmitansi hingga 99%",
        "Optik permukaan bebas",
        "Personalisasi i.Scription®",
        "Diamond-cube ultra tahan aus",
      ],
    },
  ],

  highIndexTitle: "Indeks tinggi tipis & ringan — perbandingan tiga merek",
  highIndexBody:
    "Untuk resep 300°+: lensa standar tersedia 1.61 / 1.67 (lebih tebal dan berat); Mingyue menawarkan 1.61 / 1.67 / 1.71 dengan seri 1.71 sebagai juara nilai-kinerja; Zeiss menambah 1.74 ultra-tipis untuk tampilan paling ramping pada resep tinggi.",

  durabilityTitle: "Transmitansi & daya tahan",
  durability: [
    { brand: "Standar", note: "Lapisan tunggal dasar" },
    { brand: "Mingyue", note: "A8 tahan aus & anti-noda" },
    { brand: "Zeiss", note: "Diamond-cube ultra tahan aus" },
  ],

  scenarioTitle: "Pilih lensa untuk skenariomu",
  scenarios: [
    {
      scene: "Perjalanan harian · anggaran rendah",
      rec: "Bingkai ringan + lensa standar anti-silau — cakup yang dasar dengan harga terjangkau.",
    },
    {
      scene: "Perjalanan harian · nilai terbaik",
      rec: "Bingkai ringan + lensa standar anti-silau Mingyue — awet, nyaman, harga bagus.",
    },
    {
      scene: "Kantor & layar",
      rec: "Filter blue light high-clarity Mingyue (nilai) atau filter blue light Zeiss (kejernihan premium).",
    },
    {
      scene: "Luar ruangan & perjalanan",
      rec: "Mingyue UV400 fotokromik (nilai) atau Zeiss fotokromik (perubahan warna cepat dan merata).",
    },
    {
      scene: "Resep tinggi · suka tipis",
      rec: "Mingyue 1.71 (nilai) atau Zeiss 1.74 (premium ultra-tipis); standar 1.67 jika anggaran terbatas.",
    },
    {
      scene: "Pengalaman visual premium",
      rec: "Zeiss 1.71/1.74 + lapisan AR untuk kejernihan ekstrem; Mingyue 天玑 (Tianji) adalah alternatif premium domestik yang kuat.",
    },
  ],

  promiseEyebrow: "Janji kami",
  promiseTitle: "Optik yang wajar, terjangkau untuk semua",
  promiseBody:
    "Didukung rantai produksi kacamata yang matang, kami menerapkan standar kualitas ketat pada setiap pasang — standar untuk nilai, Mingyue untuk titik manis, Zeiss untuk yang terbaik. Setiap lensa diselesaikan dengan tangan sesuai resep Anda agar penglihatan Anda lebih jernih, lebih aman, dan lebih nyaman.",
  promiseTag:
    "Perawatan mata berbasis sains · penglihatan yang jernih dimulai dari lensa yang tepat.",
  ctaShop: "Belanja kacamata",
  ctaTryon: "Coba secara virtual",
};

const ms: Content = {
  eyebrow: "Sains kanta · Penjagaan mata harian",
  title: "Mata yang sihat bermula dengan kanta yang tepat",
  intro:
    "Penglihatan yang jelas menggerakkan hari anda — di hadapan skrin, di atas jalan, dan di luar rumah. Kami menawarkan tiga peringkat kanta — Biasa, Mingyue dan Zeiss — supaya setiap preskripsi, situasi dan bajet mendapat kanta yang benar-benar sesuai.",
  crumbHome: "Laman utama",
  crumbHere: "Panduan kanta",

  discomfortTitle: "Ketidakselesaan mata harian yang biasa",
  discomfortLead:
    "Kebanyakan masalah mata moden bukanlah penyakit — ia berpunca daripada tabiat menatap skrin dan kanta yang salah. Memilih kanta yang sepadan dengan hari anda adalah pelegaan pertama.",
  discomforts: [
    {
      title: "Mata letih selepas lama di skrin",
      body: "Selalunya disebabkan kanta anti-silau atau penapis cahaya biru berkualiti rendah. Teknologi penapis cahaya biru profesional Mingyue dan Zeiss mengurangkan keletihan dengan ketara.",
    },
    {
      title: "Mata kering, merah atau gatal",
      body: "Berkait dengan transmitansi rendah dan bingkai berat. Bahan ketulenan tinggi Mingyue dan Zeiss memberikan pemakaian yang lebih jernih dan selesa.",
    },
    {
      title: "Silau dan pantulan di dalam bangunan",
      body: "Disebabkan salutan anti-silau satu lapisan. AR berbilang lapisan Zeiss dan salutan A-series Mingyue mengurangkan pantulan dengan ketara.",
    },
    {
      title: "Kerengsaan UV di luar rumah",
      body: "Kanta biasa hanya memberi perlindungan UV asas; Mingyue dan Zeiss menyekat 99.9% UVA/UVB dengan perlindungan UV400 penuh.",
    },
    {
      title: "Penglihatan jauh atau dekat kabur",
      body: "Preskripsi salah atau pengisaran kasar. Optik kepersisan Zeiss dan kawalan kualiti ketat Mingyue jauh mengatasi kanta generik.",
    },
  ],
  discomfortFootnote:
    "Kebanyakan ini berkait dengan tabiat harian, bukan patologi. Kami menggabungkan sistem pengeluaran yang matang dengan tiga peringkat kanta supaya setiap pelanggan menemui yang sesuai.",

  careTitle: "Cara melindungi mata anda setiap hari",
  care: [
    {
      title: "Urus masa skrin",
      body: "Setiap 30–40 minit, lihat sesuatu lebih 5 meter selama 5 minit, atau tutup mata. Kanta penapis cahaya biru dua kali Mingyue atau Zeiss mengurangkan tekanan dengan lebih banyak.",
    },
    {
      title: "Seimbangkan pencahayaan dalaman",
      body: "Elakkan cahaya langsung yang keras. Kanta anti-silau (biasa, Mingyue atau Zeiss) menjadikan pantulan lebih lembut — Zeiss mendahului, Mingyue rapat di belakang.",
    },
    {
      title: "Perlindungan UV yang kuat",
      body: "Semua kanta kami dilengkapi UV400. Mingyue dan Zeiss menyekat 99.9% UVA/UVB; kanta biasa masih menyekat 90%+.",
    },
    {
      title: "Periksa & padankan dengan tepat",
      body: "Pemeriksaan mata setiap 6–12 bulan. Kami mengisar setiap kanta mengikut data anda — biasa untuk bajet, Mingyue untuk nilai, Zeiss untuk optik terbaik.",
    },
  ],

  brandsEyebrow: "Peringkat kanta",
  brandsTitle: "Tiga kanta, satu obsesi terhadap kejelasan",
  brandsLead:
    "Kami tidak mendakwa rawatan perubatan — tetapi kanta yang dibuat dengan baik benar-benar mengubah perasaan sepanjang hari. Pilih peringkat yang sesuai dengan mata dan bajet anda.",
  brands: [
    {
      tag: "Berbaloi",
      name: "Kanta biasa",
      sub: "Asas yang boleh dipercayai untuk pemakaian harian",
      body: "Resin standard dengan tahan calar dan UV400, salutan satu lapisan. Sesuai untuk preskripsi di bawah 300° dan kegunaan harian berjimat. Transmitansi 92–95%.",
      bullets: [
        "Salutan satu lapisan",
        "UV400 asas",
        "Transmitansi 92–95%",
        "Sesuai untuk preskripsi rendah",
      ],
    },
    {
      tag: "Premium tempatan",
      name: "Kanta Mingyue",
      sub: "Jenama optik terkemuka China sejak 2002",
      body: "Tersenarai A-share, rakan kongsi Aeroangkasa China. Resin KR & bahan PMC ultra-cerah mencapai transmitansi 98.6%. Siri indeks tinggi 1.71 kekal nipis dengan nombor Abbe 37. Penapis cahaya biru dua kali diperakui TÜV Rheinland.",
      bullets: [
        "Transmitansi sehingga 98.6%",
        "1.71 nipis indeks tinggi",
        "Penapis cahaya biru diperakui TÜV",
        "Salutan tahan haus A8",
      ],
    },
    {
      tag: "Penanda aras global",
      name: "Kanta Zeiss",
      sub: "Satu abad optik, dibina untuk anda",
      body: "Teknologi permukaan bebas mengurangkan aberasi tepi sebanyak 80% dan menggandakan tiga kali kejelasan medan penglihatan. i.Scription® membaca 12 parameter biologi untuk pembetulan peribadi. AR berbilang lapisan menghapuskan 95% pantulan; penapis cahaya biru tepat menyekat 415–455nm.",
      bullets: [
        "Transmitansi sehingga 99%",
        "Optik permukaan bebas",
        "Pemperibadian i.Scription®",
        "Diamond-cube ultra tahan haus",
      ],
    },
  ],

  highIndexTitle: "Indeks tinggi nipis & ringan — tiga jenama dibandingkan",
  highIndexBody:
    "Untuk preskripsi 300°+: kanta biasa hadir dalam 1.61 / 1.67 (lebih tebal, lebih berat); Mingyue menawarkan 1.61 / 1.67 / 1.71 dengan siri 1.71 sebagai juara nilai-prestasi; Zeiss menambah 1.74 ultra-nipis untuk rupa paling halus pada preskripsi tinggi.",

  durabilityTitle: "Transmitansi & ketahanan",
  durability: [
    { brand: "Biasa", note: "Salutan satu lapisan asas" },
    { brand: "Mingyue", note: "A8 tahan haus & anti-kotor" },
    { brand: "Zeiss", note: "Diamond-cube ultra tahan haus" },
  ],

  scenarioTitle: "Pilih kanta yang sesuai dengan situasi anda",
  scenarios: [
    {
      scene: "Pulang-pergi harian · bajet rendah",
      rec: "Bingkai ringan + kanta biasa anti-silau — meliputi keperluan asas dengan harga berpatutan.",
    },
    {
      scene: "Pulang-pergi harian · nilai terbaik",
      rec: "Bingkai ringan + kanta Mingyue anti-silau standard — tahan lama, selesa, harga baik.",
    },
    {
      scene: "Pejabat & skrin",
      rec: "Penapis cahaya biru kejelasan tinggi Mingyue (nilai) atau penapis cahaya biru Zeiss (kejelasan premium).",
    },
    {
      scene: "Luar rumah & perjalanan",
      rec: "Mingyue UV400 fotokromik (nilai) atau Zeiss fotokromik (perubahan warna cepat dan sekata).",
    },
    {
      scene: "Preskripsi tinggi · mahukan nipis",
      rec: "Mingyue 1.71 (nilai) atau Zeiss 1.74 (premium ultra-nipis); biasa 1.67 jika bajet terhad.",
    },
    {
      scene: "Pengalaman visual premium",
      rec: "Zeiss 1.71/1.74 + salutan AR untuk kejelasan melampau; Mingyue 天玑 (Tianji) adalah alternatif premium tempatan yang kuat.",
    },
  ],

  promiseEyebrow: "Janji kami",
  promiseTitle: "Optik yang munasabah, mudah dicapai",
  promiseBody:
    "Disokong rantaian pembuatan cermin mata yang matang, kami mengekalkan piawaian kualiti yang ketat untuk setiap pasang — biasa untuk nilai, Mingyue untuk titik manis, Zeiss untuk yang terbaik. Setiap kanta disiapkan tangan mengikut preskripsi anda supaya anda memakai penglihatan yang lebih jelas, selamat dan selesa.",
  promiseTag:
    "Penjagaan mata berasaskan sains · penglihatan yang lebih jelas bermula dengan kanta yang tepat.",
  ctaShop: "Beli cermin mata",
  ctaTryon: "Cuba secara maya",
};

const T: Record<Lang, Content> = {
  en,
  zh,
  es,
  fr,
  de,
  it,
  pt,
  ja,
  ko,
  ar,
  vi,
  th,
  id,
  ms,
};

/* ================================================================
 * Page
 * ================================================================*/

function LensGuidePage() {
  const { lang } = useI18n();
  const t = T[lang] ?? en;

  return (
    <div>
      {/* HERO */}
      <section className="page-hero">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-20">
          <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
            <Link to="/" className="hover:text-primary transition-smooth">
              {t.crumbHome}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">{t.crumbHere}</span>
          </nav>
          <header className="text-center max-w-3xl mx-auto">
            <span className="eyebrow eyebrow-line mb-5">{t.eyebrow}</span>
            <h1 className="section-title text-4xl md:text-5xl">{t.title}</h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.intro}
            </p>
          </header>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 md:py-20 space-y-20 md:space-y-28">
        {/* COMMON DISCOMFORTS */}
        <section>
          <SectionHeader
            eyebrow={<Eye className="w-3.5 h-3.5" />}
            title={t.discomfortTitle}
            lead={t.discomfortLead}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-10">
            {t.discomforts.map((d, i) => (
              <FeatureCard
                key={i}
                icon={DISCOMFORT_ICONS[i]}
                title={d.title}
                body={d.body}
              />
            ))}
          </div>
          <p className="mt-8 text-xs md:text-sm text-muted-foreground italic text-center max-w-3xl mx-auto leading-relaxed">
            {t.discomfortFootnote}
          </p>
        </section>

        {/* DAILY CARE */}
        <section>
          <SectionHeader
            eyebrow={<ShieldCheck className="w-3.5 h-3.5" />}
            title={t.careTitle}
          />
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5 mt-10">
            {t.care.map((c, i) => (
              <FeatureCard
                key={i}
                icon={CARE_ICONS[i]}
                title={c.title}
                body={c.body}
              />
            ))}
          </div>
        </section>

        {/* BRAND TIERS */}
        <section>
          <SectionHeader
            eyebrow={<Sparkles className="w-3.5 h-3.5" />}
            eyebrowText={t.brandsEyebrow}
            title={t.brandsTitle}
            lead={t.brandsLead}
          />
          <div className="grid md:grid-cols-3 gap-5 md:gap-6 mt-10">
            {t.brands.map((b, i) => {
              const meta = BRAND_META[i];
              return (
                <article
                  key={meta.id}
                  className={cn(
                    "relative rounded-3xl border p-7 md:p-8 transition-smooth hover:shadow-card",
                    meta.accent,
                    meta.featured && "shadow-soft md:scale-[1.02]",
                  )}
                >
                  {meta.featured ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] font-medium px-3 py-1 tracking-wide uppercase">
                      {b.tag}
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] uppercase tracking-wide font-medium text-muted-foreground border border-border rounded-full px-2.5 py-0.5 mb-4">
                      {b.tag}
                    </span>
                  )}
                  <h3 className="font-display text-xl md:text-2xl font-semibold mt-1">
                    {b.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {b.sub}
                  </p>
                  <p className="text-sm leading-relaxed mt-4 text-foreground/80">
                    {b.body}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {b.bullets.map((bu) => (
                      <li
                        key={bu}
                        className="flex items-start gap-2 text-sm text-foreground/85"
                      >
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{bu}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          {/* High index */}
          <div className="mt-10 rounded-3xl border border-border/60 bg-card p-7 md:p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 text-primary p-2 flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg md:text-xl">
                  {t.highIndexTitle}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-2">
                  {t.highIndexBody}
                </p>
              </div>
            </div>
          </div>

          {/* Transmittance comparison */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg md:text-xl mb-4">
              {t.durabilityTitle}
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {t.durability.map((d, i) => (
                <div
                  key={d.brand}
                  className="rounded-2xl border border-border/60 bg-card p-5 text-center transition-smooth hover:shadow-card"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {d.brand}
                  </p>
                  <p className="font-display text-3xl md:text-4xl font-semibold text-primary mt-2">
                    {DURABILITY_VALUES[i]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {d.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCENARIOS */}
        <section>
          <SectionHeader
            eyebrow={<Award className="w-3.5 h-3.5" />}
            title={t.scenarioTitle}
          />
          <div className="mt-10 rounded-3xl border border-border/60 bg-card overflow-hidden">
            {t.scenarios.map((s, i) => (
              <div
                key={s.scene}
                className={cn(
                  "grid md:grid-cols-[1fr_2fr] gap-2 md:gap-6 px-6 md:px-8 py-5 md:py-6",
                  i !== 0 && "border-t border-border/60",
                )}
              >
                <div className="font-medium text-sm md:text-base">
                  {s.scene}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {s.rec}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BRAND PROMISE */}
        <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/[0.05] to-transparent p-8 md:p-12 text-center">
          <span className="eyebrow eyebrow-line mb-4">{t.promiseEyebrow}</span>
          <h2 className="section-title text-2xl md:text-3xl">
            {t.promiseTitle}
          </h2>
          <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.promiseBody}
          </p>
          <p className="mt-6 text-xs md:text-sm text-primary font-medium">
            {t.promiseTag}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
            >
              {t.ctaShop}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/try-on"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-smooth"
            >
              {t.ctaTryon}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================================================================
 * Helpers
 * ================================================================*/

function SectionHeader({
  eyebrow,
  eyebrowText,
  title,
  lead,
}: {
  eyebrow?: React.ReactNode;
  eyebrowText?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      {eyebrowText && (
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-primary font-medium mb-3">
          {eyebrow}
          {eyebrowText}
        </span>
      )}
      <h2 className="section-title text-2xl md:text-3xl">{title}</h2>
      {lead && (
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          {lead}
        </p>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 transition-smooth hover:shadow-card hover:-translate-y-0.5">
      <div className="rounded-full bg-primary/10 text-primary w-10 h-10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-base md:text-lg mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

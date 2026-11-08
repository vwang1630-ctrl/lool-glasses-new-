import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Upload,
  FileCheck2,
  Loader2,
  ShoppingBag,
  Eye,
  BookOpen,
  Layers3,
  Sparkles,
  Glasses,
  FileText,
  Pencil,
  Sun,
  Shield,
  Palette,
  Car,
  CircleDot,
  Droplets,
  ShieldCheck,
  CloudFog,
  SunMedium,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, shapeLabel, materialLabel, type Lang } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { getCustomerClientId, trackCustomerEvent } from "@/lib/customer-audit";

export type LensFlowMode = "lenses" | "frameOnly";
// Aligned with Zeelool prescription_type field
export type LensCategory =
  | "single"
  | "progressive"
  | "readingReady"
  | "readingCustom"
  | "plano";
export type LensIndexId = "1.56" | "1.61" | "1.67" | "1.74";
export type RxInputMode = "manual" | "upload";
export type VisionType = "distance" | "near";
export type ProgressiveDesign = "standard" | "short";
export type ViewAreaId = "standard" | "broader";

interface RxData {
  odSph: string;
  osSph: string;
  odCyl: string;
  osCyl: string;
  odAxis: string;
  osAxis: string;
  addOd: string;
  addOs: string; // Progressive ADD
  readingOd: string;
  readingOs: string; // Reading Power
  pd: string;
  pdRight: string;
  pdLeft: string;
  dualPd: boolean;
  uploadedName: string | null;
  inputMode: RxInputMode;
}

interface Selection {
  category: LensCategory;
  visionType: VisionType; // Single Vision only
  progressiveDesign: ProgressiveDesign; // Progressive only
  index: LensIndexId;
  lensFunctionId: string;
  lensFunctionVariantId?: string; // photochromic variant
  lensFunctionColorId?: string; // tint / photochromic color
  viewAreaId: ViewAreaId; // Progressive only — view area choice
  rx: RxData;
  colorId: string;
}

interface Props {
  product: Product;
  mode: LensFlowMode;
  initialColorId?: string;
  onClose: () => void;
  // `lensSkuId` is the wizard's internally resolved match against
  // /api/lens/skus (cheapest exact match for the chosen axes). `lensPriceUsd`
  // is the full selected SKU retail price, not the per-step delta. May be
  // null / 0 in frame-only mode.
  onComplete: (
    sel: Selection,
    lensPriceUsd: number,
    lensSkuId: string | null,
  ) => void;
}

// ── Static data (1:1 Zeelool spec) ─────────────────────────────
//
// All translatable copy is stored as Record<Lang, string> so the wizard
// reads via pickLang() and falls back gracefully when a lang is missing.
// Adding a new UI lang only means dropping new entries here — no other
// component code needs to change.

type T10 = Record<Lang, string>;

const CATEGORIES: {
  id: LensCategory | "reading";
  label: T10;
  desc: T10;
  Icon: React.ComponentType<{ className?: string }>;
  badge?: T10;
}[] = [
  {
    id: "single",
    label: {
      en: "Single Vision",
      zh: "单光",
      es: "Visión sencilla",
      fr: "Vision simple",
      de: "Einstärken",
      it: "Visione singola",
      pt: "Visão simples",
      ja: "単焦点",
      ko: "단초점",
      ar: "رؤية أحادية",
      vi: "Đơn tròng",
      th: "เลนส์ชั้นเดียว",
      id: "Lensa tunggal",
      ms: "Lensa tunggal",
    },
    desc: {
      en: "For nearsighted or farsighted — clear single-focus vision.",
      zh: "适配近视 / 远视,单焦点清晰视觉",
      es: "Para miopía o hipermetropía — visión nítida de un solo foco.",
      fr: "Pour myope ou hypermétrope — vision nette à focale unique.",
      de: "Für Kurz- oder Weitsichtige — klare Einstärkensicht.",
      it: "Per miopia o ipermetropia — visione nitida a fuoco singolo.",
      pt: "Para miopia ou hipermetropia — visão nítida de foco único.",
      ja: "近視・遠視向け——クリアな単焦点視界。",
      ko: "근시·원시용 — 또렷한 단초점 시야.",
      ar: "للقصر أو طول النظر — رؤية أحادية البؤرة وواضحة.",
      vi: "Dành cho cận hoặc viễn — tầm nhìn đơn tiêu rõ nét.",
      th: "สำหรับสายตาสั้นหรือยาว — มองชัดด้วยโฟกัสเดียว",
      id: "Untuk rabun jauh atau dekat — penglihatan fokus tunggal yang jernih.",
      ms: "Untuk rabun jauh atau dekat — penglihatan fokus tunggal yang jelas.",
    },
    Icon: Eye,
  },
  {
    id: "progressive",
    label: {
      en: "Progressive",
      zh: "渐进多焦点",
      es: "Progresivas",
      fr: "Progressifs",
      de: "Gleitsicht",
      it: "Progressive",
      pt: "Progressivas",
      ja: "累進多焦点",
      ko: "누진다초점",
      ar: "متعدد البؤر",
      vi: "Đa tròng",
      th: "เลนส์โปรเกรสซีฟ",
      id: "Progresif",
      ms: "Progresif",
    },
    desc: {
      en: "Distance, intermediate & near in one — seamless all-day vision.",
      zh: "远中近一副搞定,全场景无缝视觉",
      es: "Lejos, intermedio y cerca en un solo par — visión sin costuras todo el día.",
      fr: "Vision de loin, intermédiaire et près en un seul verre — toute la journée.",
      de: "Fern, mittel & nah in einer Brille — nahtloses Sehen den ganzen Tag.",
      it: "Lontano, intermedio e vicino in un'unica lente — visione fluida tutto il giorno.",
      pt: "Longe, intermediário e perto em uma só lente — visão fluida o dia todo.",
      ja: "遠く・中間・近くを 1 本で——一日中シームレスな視界。",
      ko: "멀리·중간·가까이를 한 렌즈로 — 하루 종일 끊김 없는 시야.",
      ar: "بُعد ومسافة متوسطة وقُرب في عدسة واحدة — رؤية متواصلة طوال اليوم.",
      vi: "Nhìn xa, trung gian và gần trên một cặp — tầm nhìn liền mạch cả ngày.",
      th: "ระยะไกล กลาง และใกล้ในเลนส์เดียว — มองคมชัดได้ตลอดวัน",
      id: "Jauh, menengah & dekat dalam satu lensa — penglihatan mulus sepanjang hari.",
      ms: "Jauh, sederhana & dekat dalam satu kanta — penglihatan lancar sepanjang hari.",
    },
    Icon: Layers3,
  },
  {
    id: "reading",
    label: {
      en: "Reading Glasses",
      zh: "老花镜",
      es: "Gafas de lectura",
      fr: "Lunettes de lecture",
      de: "Lesebrille",
      it: "Occhiali da lettura",
      pt: "Óculos de leitura",
      ja: "老眼鏡",
      ko: "돋보기",
      ar: "نظارات قراءة",
      vi: "Kính đọc sách",
      th: "แว่นสายตายาว",
      id: "Kacamata baca",
      ms: "Cermin mata bacaan",
    },
    desc: {
      en: "Choose Ready-made or Custom in the next step.",
      zh: "下一步可选成品或定制老花",
      es: "Elige Listas o A medida en el siguiente paso.",
      fr: "Choisissez Prêt-à-porter ou Sur-mesure à l'étape suivante.",
      de: "Im nächsten Schritt Standard oder Maßanfertigung wählen.",
      it: "Scegli Pronte o Su misura nel passaggio successivo.",
      pt: "Escolha Pronto ou Sob medida no próximo passo.",
      ja: "次のステップで既製・カスタムを選択。",
      ko: "다음 단계에서 기성품 또는 맞춤형을 선택.",
      ar: "اختر جاهزة أو مخصصة في الخطوة التالية.",
      vi: "Chọn loại có sẵn hoặc tùy chỉnh ở bước tiếp theo.",
      th: "เลือกแบบสำเร็จรูปหรือสั่งตัดในขั้นตอนถัดไป",
      id: "Pilih siap pakai atau kustom di langkah berikutnya.",
      ms: "Pilih siap pakai atau tempahan dalam langkah seterusnya.",
    },
    Icon: BookOpen,
  },
  {
    id: "plano",
    label: {
      en: "Non-prescription",
      zh: "平光装饰",
      es: "Sin graduación",
      fr: "Sans correction",
      de: "Ohne Sehstärke",
      it: "Senza gradazione",
      pt: "Sem grau",
      ja: "度なし",
      ko: "무도수",
      ar: "بدون مقاس",
      vi: "Không độ",
      th: "ไม่มีค่าสายตา",
      id: "Tanpa resep",
      ms: "Tanpa preskripsi",
    },
    desc: {
      en: "No prescription — daily styling & basic eye care.",
      zh: "无度数,日常穿搭与基础护眼",
      es: "Sin graduación — estilo diario y cuidado básico.",
      fr: "Aucune correction — style quotidien et soin basique.",
      de: "Ohne Sehstärke — Alltagsstyling und Grundpflege.",
      it: "Senza gradazione — stile quotidiano e cura base.",
      pt: "Sem grau — estilo do dia a dia e cuidado básico.",
      ja: "度数なし——日常スタイリングと基本のアイケア。",
      ko: "도수 없이 — 데일리 스타일링과 기본 눈 케어.",
      ar: "بلا مقاس — تنسيق يومي وعناية أساسية بالعين.",
      vi: "Không độ — phối đồ hằng ngày và chăm sóc mắt cơ bản.",
      th: "ไม่มีค่าสายตา — สำหรับแต่งสไตล์และดูแลดวงตาเบื้องต้น",
      id: "Tanpa resep — gaya harian & perawatan mata dasar.",
      ms: "Tanpa preskripsi — gaya harian & penjagaan mata asas.",
    },
    Icon: Sparkles,
  },
];

const READING_MODES: {
  id: LensCategory;
  label: T10;
  desc: T10;
}[] = [
  {
    id: "readingReady",
    label: {
      en: "Ready-made Reading",
      zh: "成品老花",
      es: "Lectura lista",
      fr: "Lecture prête à porter",
      de: "Lesebrille Standard",
      it: "Lettura pronta",
      pt: "Leitura pronta",
      ja: "既製老眼鏡",
      ko: "기성 돋보기",
      ar: "قراءة جاهزة",
      vi: "Kính đọc sẵn",
      th: "แว่นอ่านสำเร็จรูป",
      id: "Kacamata baca siap pakai",
      ms: "Cermin mata bacaan siap pakai",
    },
    desc: {
      en: "Fixed-power readers — no PD, ready to wear.",
      zh: "出厂固定度数,即拿即戴,无需 PD",
      es: "Lectura con grado fijo — sin DP, listas para usar.",
      fr: "Lecture à correction fixe — sans EP, prêtes à porter.",
      de: "Festes Lesegrad — kein PD, sofort tragbar.",
      it: "Lettura a gradazione fissa — senza DP, pronte all'uso.",
      pt: "Leitura com grau fixo — sem DP, prontas para usar.",
      ja: "度数固定の既製品——PD 不要、すぐかけられる。",
      ko: "도수가 정해진 기성품 — PD 없이 바로 착용.",
      ar: "قراءة بمقاس ثابت — بلا حاجة لمقاس البؤبؤين، جاهزة للارتداء.",
      vi: "Kính đọc độ cố định — không cần PD, sẵn sàng đeo.",
      th: "ค่าสายตาคงที่ — ไม่ต้องวัด PD พร้อมใช้งานทันที",
      id: "Kacamata baca dengan kekuatan tetap — tanpa PD, langsung pakai.",
      ms: "Cermin mata bacaan kuasa tetap — tanpa PD, sedia dipakai.",
    },
  },
  {
    id: "readingCustom",
    label: {
      en: "Custom Reading",
      zh: "定制老花",
      es: "Lectura a medida",
      fr: "Lecture sur-mesure",
      de: "Lese-Maßanfertigung",
      it: "Lettura su misura",
      pt: "Leitura sob medida",
      ja: "カスタム老眼鏡",
      ko: "맞춤 돋보기",
      ar: "قراءة مخصصة",
      vi: "Kính đọc tùy chỉnh",
      th: "แว่นอ่านสั่งตัด",
      id: "Kacamata baca kustom",
      ms: "Cermin mata bacaan tempahan",
    },
    desc: {
      en: "Set your PD and pick premium lenses.",
      zh: "可填写 PD,选高级镜片",
      es: "Define tu DP y elige lentes premium.",
      fr: "Indiquez votre EP et choisissez des verres haut de gamme.",
      de: "Eigene PD eingeben, Premium-Glas wählen.",
      it: "Imposta il tuo DP e scegli lenti premium.",
      pt: "Defina seu DP e escolha lentes premium.",
      ja: "PD を入力してプレミアムレンズを選択。",
      ko: "PD를 입력하고 프리미엄 렌즈를 선택.",
      ar: "حدّد المسافة بين البؤبؤين واختر عدسات بريميوم.",
      vi: "Nhập PD của bạn và chọn tròng kính cao cấp.",
      th: "ระบุค่า PD และเลือกเลนส์ระดับพรีเมียม",
      id: "Tentukan PD Anda dan pilih lensa premium.",
      ms: "Tetapkan PD anda dan pilih kanta premium.",
    },
  },
];

const VISION_TYPES: { id: VisionType; label: T10 }[] = [
  {
    id: "distance",
    label: {
      en: "Distance (For nearsighted/farsighted)",
      zh: "看远 (近视/远视)",
      es: "Lejos (miopía/hipermetropía)",
      fr: "Loin (myope/hypermétrope)",
      de: "Ferne (kurz-/weitsichtig)",
      it: "Lontano (miopia/ipermetropia)",
      pt: "Longe (míope/hipermétrope)",
      ja: "遠用 (近視/遠視)",
      ko: "원거리 (근시/원시)",
      ar: "للبعيد (قصر/طول النظر)",
      vi: "Nhìn xa (cận/viễn)",
      th: "มองไกล (สายตาสั้น/ยาว)",
      id: "Jarak jauh (rabun jauh/dekat)",
      ms: "Jarak jauh (rabun jauh/dekat)",
    },
  },
  {
    id: "near",
    label: {
      en: "Near (For reading only)",
      zh: "看近 (仅阅读)",
      es: "Cerca (solo lectura)",
      fr: "Près (lecture uniquement)",
      de: "Nähe (nur Lesen)",
      it: "Vicino (solo lettura)",
      pt: "Perto (apenas leitura)",
      ja: "近用 (読書専用)",
      ko: "근거리 (독서 전용)",
      ar: "للقريب (للقراءة فقط)",
      vi: "Nhìn gần (chỉ để đọc)",
      th: "มองใกล้ (สำหรับอ่านเท่านั้น)",
      id: "Jarak dekat (hanya untuk membaca)",
      ms: "Jarak dekat (untuk membaca sahaja)",
    },
  },
];

const PROGRESSIVE_DESIGNS: {
  id: ProgressiveDesign;
  label: T10;
  desc: T10;
}[] = [
  {
    id: "standard",
    label: {
      en: "Standard Progressive",
      zh: "标准渐进",
      es: "Progresivas estándar",
      fr: "Progressifs standards",
      de: "Standard-Gleitsicht",
      it: "Progressive standard",
      pt: "Progressivas padrão",
      ja: "標準累進",
      ko: "표준 누진",
      ar: "متعدد البؤر القياسي",
      vi: "Đa tròng tiêu chuẩn",
      th: "โปรเกรสซีฟมาตรฐาน",
      id: "Progresif standar",
      ms: "Progresif standard",
    },
    desc: {
      en: "Comfortable mid-near zone for daily wear.",
      zh: "宽广中近视野,适合日常佩戴",
      es: "Zona media-cerca cómoda para uso diario.",
      fr: "Zone intermédiaire-près confortable pour tous les jours.",
      de: "Komfortabler Mittel-Nahbereich für den Alltag.",
      it: "Zona media-vicino confortevole per l'uso quotidiano.",
      pt: "Zona média-perto confortável para o dia a dia.",
      ja: "中近距離が快適、日常使いに最適。",
      ko: "중·근거리가 편안해 일상에 적합.",
      ar: "مجال متوسط-قريب مريح للاستخدام اليومي.",
      vi: "Vùng trung-gần thoải mái cho đeo hằng ngày.",
      th: "พื้นที่กลาง-ใกล้สบายตา เหมาะกับการใช้งานประจำวัน",
      id: "Zona menengah-dekat yang nyaman untuk pemakaian harian.",
      ms: "Zon pertengahan-dekat yang selesa untuk pemakaian harian.",
    },
  },
  {
    id: "short",
    label: {
      en: "Short Corridor Progressive",
      zh: "短走廊渐进",
      es: "Progresivas de corredor corto",
      fr: "Progressifs à couloir court",
      de: "Kurzer Korridor",
      it: "Progressive a corridoio corto",
      pt: "Progressivas de corredor curto",
      ja: "短い累進帯",
      ko: "짧은 누진",
      ar: "متعدد البؤر بممر قصير",
      vi: "Đa tròng hành lang ngắn",
      th: "โปรเกรสซีฟทางเดินสั้น",
      id: "Progresif koridor pendek",
      ms: "Progresif koridor pendek",
    },
    desc: {
      en: "Shorter adaptation, fits compact frames.",
      zh: "更短适应期,适合较小镜框",
      es: "Menor adaptación, ideales para monturas compactas.",
      fr: "Adaptation plus rapide, pour montures compactes.",
      de: "Schnellere Eingewöhnung, passt zu kleinen Fassungen.",
      it: "Adattamento più rapido, per montature compatte.",
      pt: "Adaptação mais rápida, para armações compactas.",
      ja: "慣れが早く、コンパクトなフレームに最適。",
      ko: "적응이 빠르고, 작은 프레임에 적합.",
      ar: "تأقلم أسرع، يناسب الإطارات الصغيرة.",
      vi: "Thích nghi nhanh hơn, phù hợp gọng nhỏ gọn.",
      th: "ปรับตัวง่ายขึ้น เหมาะกับกรอบขนาดเล็ก",
      id: "Adaptasi lebih cepat, cocok untuk bingkai kompak.",
      ms: "Adaptasi lebih cepat, sesuai untuk bingkai padat.",
    },
  },
];

const INDEX_OPTIONS: {
  id: LensIndexId;
  extra: number;
  label: T10;
  thinness: T10;
  range: [number, number];
}[] = [
  {
    id: "1.56",
    extra: 0,
    label: {
      en: "1.56 Index",
      zh: "1.56 标准",
      es: "Índice 1.56",
      fr: "Indice 1,56",
      de: "Index 1.56",
      it: "Indice 1.56",
      pt: "Índice 1,56",
      ja: "1.56 標準",
      ko: "1.56 표준",
      ar: "مؤشر 1.56",
      vi: "Chiết suất 1.56",
      th: "ดัชนี 1.56",
      id: "Indeks 1.56",
      ms: "Indeks 1.56",
    },
    thinness: {
      en: "For 0 to -4.00",
      zh: "适合 0–400 度",
      es: "Para 0 a -4.00",
      fr: "Pour 0 à -4,00",
      de: "Für 0 bis -4,00",
      it: "Per 0 a -4.00",
      pt: "Para 0 a -4,00",
      ja: "0–400 度向け",
      ko: "0–400도 적합",
      ar: "يناسب 0 إلى -4.00",
      vi: "Cho độ 0 đến -4.00",
      th: "สำหรับค่า 0 ถึง -4.00",
      id: "Untuk 0 hingga -4.00",
      ms: "Untuk 0 hingga -4.00",
    },
    range: [0, 400],
  },
  {
    id: "1.61",
    extra: 30,
    label: {
      en: "1.61 Index",
      zh: "1.61 轻薄",
      es: "Índice 1.61",
      fr: "Indice 1,61",
      de: "Index 1.61",
      it: "Indice 1.61",
      pt: "Índice 1,61",
      ja: "1.61 薄型",
      ko: "1.61 슬림",
      ar: "مؤشر 1.61",
      vi: "Chiết suất 1.61",
      th: "ดัชนี 1.61",
      id: "Indeks 1.61",
      ms: "Indeks 1.61",
    },
    thinness: {
      en: "For -4.00 to -6.00",
      zh: "适合 400–600 度",
      es: "Para -4.00 a -6.00",
      fr: "Pour -4,00 à -6,00",
      de: "Für -4,00 bis -6,00",
      it: "Per -4.00 a -6.00",
      pt: "Para -4,00 a -6,00",
      ja: "400–600 度向け",
      ko: "400–600도 적합",
      ar: "يناسب -4.00 إلى -6.00",
      vi: "Cho độ -4.00 đến -6.00",
      th: "สำหรับค่า -4.00 ถึง -6.00",
      id: "Untuk -4.00 hingga -6.00",
      ms: "Untuk -4.00 hingga -6.00",
    },
    range: [401, 600],
  },
  {
    id: "1.67",
    extra: 60,
    label: {
      en: "1.67 Index",
      zh: "1.67 超薄",
      es: "Índice 1.67",
      fr: "Indice 1,67",
      de: "Index 1.67",
      it: "Indice 1.67",
      pt: "Índice 1,67",
      ja: "1.67 超薄型",
      ko: "1.67 초슬림",
      ar: "مؤشر 1.67",
      vi: "Chiết suất 1.67",
      th: "ดัชนี 1.67",
      id: "Indeks 1.67",
      ms: "Indeks 1.67",
    },
    thinness: {
      en: "For -6.00 to -8.00",
      zh: "适合 600–800 度",
      es: "Para -6.00 a -8.00",
      fr: "Pour -6,00 à -8,00",
      de: "Für -6,00 bis -8,00",
      it: "Per -6.00 a -8.00",
      pt: "Para -6,00 a -8,00",
      ja: "600–800 度向け",
      ko: "600–800도 적합",
      ar: "يناسب -6.00 إلى -8.00",
      vi: "Cho độ -6.00 đến -8.00",
      th: "สำหรับค่า -6.00 ถึง -8.00",
      id: "Untuk -6.00 hingga -8.00",
      ms: "Untuk -6.00 hingga -8.00",
    },
    range: [601, 800],
  },
  {
    id: "1.74",
    extra: 100,
    label: {
      en: "1.74 Index",
      zh: "1.74 极致超薄",
      es: "Índice 1.74",
      fr: "Indice 1,74",
      de: "Index 1.74",
      it: "Indice 1.74",
      pt: "Índice 1,74",
      ja: "1.74 極薄",
      ko: "1.74 극초슬림",
      ar: "مؤشر 1.74",
      vi: "Chiết suất 1.74",
      th: "ดัชนี 1.74",
      id: "Indeks 1.74",
      ms: "Indeks 1.74",
    },
    thinness: {
      en: "For -8.00 and above",
      zh: "适合 800 度以上",
      es: "Para -8.00 o más",
      fr: "Pour -8,00 et plus",
      de: "Für -8,00 und mehr",
      it: "Per -8.00 e oltre",
      pt: "Para -8,00 e acima",
      ja: "800 度以上",
      ko: "800도 이상",
      ar: "من -8.00 وأعلى",
      vi: "Từ -8.00 trở lên",
      th: "สำหรับค่า -8.00 ขึ้นไป",
      id: "Untuk -8.00 ke atas",
      ms: "Untuk -8.00 dan ke atas",
    },
    range: [801, 9999],
  },
];

// Lens function color swatch type
type LensColor = { id: string; label: T10; hex: string };

// Photochromic variants (sub-options under the photochromic card)
type LensVariant = {
  id: string;
  label: T10;
  desc: T10;
  extra: number;
  colors: LensColor[];
};

// Shared color-label dict so we don't duplicate 10-lang translations
// across the various lens-function color arrays. Lookup by id.
const COLOR_LABELS: Record<string, T10> = {
  black: {
    en: "Black",
    zh: "黑色",
    es: "Negro",
    fr: "Noir",
    de: "Schwarz",
    it: "Nero",
    pt: "Preto",
    ja: "ブラック",
    ko: "블랙",
    ar: "أسود",
    vi: "Đen",
    th: "ดำ",
    id: "Hitam",
    ms: "Hitam",
  },
  lightGray: {
    en: "Light Gray",
    zh: "浅灰",
    es: "Gris claro",
    fr: "Gris clair",
    de: "Hellgrau",
    it: "Grigio chiaro",
    pt: "Cinza claro",
    ja: "ライトグレー",
    ko: "라이트 그레이",
    ar: "رمادي فاتح",
    vi: "Xám nhạt",
    th: "เทาอ่อน",
    id: "Abu-abu muda",
    ms: "Kelabu cair",
  },
  lightBrown: {
    en: "Light Brown",
    zh: "浅棕",
    es: "Marrón claro",
    fr: "Brun clair",
    de: "Hellbraun",
    it: "Marrone chiaro",
    pt: "Marrom claro",
    ja: "ライトブラウン",
    ko: "라이트 브라운",
    ar: "بني فاتح",
    vi: "Nâu nhạt",
    th: "น้ำตาลอ่อน",
    id: "Coklat muda",
    ms: "Coklat cair",
  },
  darkGray: {
    en: "Dark Gray",
    zh: "深灰",
    es: "Gris oscuro",
    fr: "Gris foncé",
    de: "Dunkelgrau",
    it: "Grigio scuro",
    pt: "Cinza escuro",
    ja: "ダークグレー",
    ko: "다크 그레이",
    ar: "رمادي داكن",
    vi: "Xám đậm",
    th: "เทาเข้ม",
    id: "Abu-abu tua",
    ms: "Kelabu gelap",
  },
  olive: {
    en: "Olive",
    zh: "橄榄绿",
    es: "Oliva",
    fr: "Olive",
    de: "Oliv",
    it: "Oliva",
    pt: "Oliva",
    ja: "オリーブ",
    ko: "올리브",
    ar: "زيتي",
    vi: "Xanh ô-liu",
    th: "เขียวมะกอก",
    id: "Zaitun",
    ms: "Zaitun",
  },
  pink: {
    en: "Light Pink",
    zh: "浅粉",
    es: "Rosa claro",
    fr: "Rose clair",
    de: "Hellrosa",
    it: "Rosa chiaro",
    pt: "Rosa claro",
    ja: "ライトピンク",
    ko: "라이트 핑크",
    ar: "وردي فاتح",
    vi: "Hồng nhạt",
    th: "ชมพูอ่อน",
    id: "Merah muda muda",
    ms: "Merah jambu cair",
  },
  yellow: {
    en: "Soft Yellow",
    zh: "鹅黄",
    es: "Amarillo suave",
    fr: "Jaune doux",
    de: "Sanftgelb",
    it: "Giallo tenue",
    pt: "Amarelo suave",
    ja: "ソフトイエロー",
    ko: "소프트 옐로우",
    ar: "أصفر هادئ",
    vi: "Vàng dịu",
    th: "เหลืองนวล",
    id: "Kuning lembut",
    ms: "Kuning lembut",
  },
  darkGreen: {
    en: "Dark Green",
    zh: "深绿",
    es: "Verde oscuro",
    fr: "Vert foncé",
    de: "Dunkelgrün",
    it: "Verde scuro",
    pt: "Verde escuro",
    ja: "ダークグリーン",
    ko: "다크 그린",
    ar: "أخضر داكن",
    vi: "Xanh lá đậm",
    th: "เขียวเข้ม",
    id: "Hijau tua",
    ms: "Hijau gelap",
  },
  cream: {
    en: "Cream",
    zh: "奶白",
    es: "Crema",
    fr: "Crème",
    de: "Creme",
    it: "Crema",
    pt: "Creme",
    ja: "クリーム",
    ko: "크림",
    ar: "كريمي",
    vi: "Kem",
    th: "ครีม",
    id: "Krem",
    ms: "Krim",
  },
  brown: {
    en: "Brown",
    zh: "棕色",
    es: "Marrón",
    fr: "Brun",
    de: "Braun",
    it: "Marrone",
    pt: "Marrom",
    ja: "ブラウン",
    ko: "브라운",
    ar: "بني",
    vi: "Nâu",
    th: "น้ำตาล",
    id: "Coklat",
    ms: "Coklat",
  },
};

const lensColor = (id: string, hex: string): LensColor => ({
  id,
  hex,
  label: COLOR_LABELS[id],
});

// Lens functions (per spec). All scenes — `cats` includes every category.
const ALL_CATS: LensCategory[] = [
  "single",
  "progressive",
  "readingReady",
  "readingCustom",
  "plano",
];
const NON_READING_CATS: LensCategory[] = ["single", "progressive", "plano"];

const LENS_FUNCTIONS: {
  id: string;
  group: "standard" | "premium";
  label: T10;
  desc: T10;
  extra: number;
  cats: LensCategory[];
  icon: LucideIcon;
  colors?: LensColor[];
  variants?: LensVariant[];
}[] = [
  {
    id: "clear",
    group: "standard",
    label: {
      en: "Standard Clear Lens",
      zh: "标准透明镜片",
      es: "Lente transparente estándar",
      fr: "Verre transparent standard",
      de: "Klares Standardglas",
      it: "Lente trasparente standard",
      pt: "Lente transparente padrão",
      ja: "標準クリアレンズ",
      ko: "표준 클리어 렌즈",
      ar: "عدسة شفافة قياسية",
      vi: "Tròng trong tiêu chuẩn",
      th: "เลนส์ใสมาตรฐาน",
      id: "Lensa bening standar",
      ms: "Kanta jernih standard",
    },
    desc: {
      en: "Traditional clear lenses with stable optics — perfect for everyday wear.",
      zh: "传统透明镜片,光学性能稳定,适配日常全场景佩戴。",
      es: "Lentes transparentes con óptica estable, ideales para uso diario.",
      fr: "Verres transparents avec optique stable — parfaits au quotidien.",
      de: "Klassische Klargläser mit stabiler Optik — ideal für jeden Tag.",
      it: "Lenti trasparenti con ottica stabile, perfette per l'uso quotidiano.",
      pt: "Lentes transparentes com óptica estável, ideais para o dia a dia.",
      ja: "安定した光学性能のクラシッククリアレンズ——日常使いに最適。",
      ko: "안정적인 광학 성능의 클래식 클리어 렌즈 — 매일 사용하기 좋음.",
      ar: "عدسات شفافة كلاسيكية بأداء بصري ثابت — مثالية للاستخدام اليومي.",
      vi: "Tròng kính trong truyền thống với quang học ổn định — hoàn hảo cho dùng hằng ngày.",
      th: "เลนส์ใสคลาสสิกพร้อมประสิทธิภาพเชิงทัศนศาสตร์ที่เสถียร — เหมาะกับการใส่ทุกวัน",
      id: "Lensa bening klasik dengan optik stabil — sempurna untuk pemakaian harian.",
      ms: "Kanta jernih klasik dengan optik stabil — sesuai untuk pemakaian harian.",
    },
    extra: 0,
    cats: ALL_CATS,
    icon: CircleDot,
  },
  {
    id: "blue",
    group: "standard",
    label: {
      en: "Blue-Light Blocking",
      zh: "蓝光阻隔",
      es: "Filtro de luz azul",
      fr: "Anti-lumière bleue",
      de: "Blaulichtfilter",
      it: "Anti-luce blu",
      pt: "Filtro de luz azul",
      ja: "ブルーライトカット",
      ko: "블루라이트 차단",
      ar: "حاجب الضوء الأزرق",
      vi: "Chống ánh sáng xanh",
      th: "กรองแสงสีฟ้า",
      id: "Anti sinar biru",
      ms: "Penghalang cahaya biru",
    },
    desc: {
      en: "Protects your eyes from screen blue-light — ideal for long screen sessions.",
      zh: "保护双眼免受电脑、手机屏幕蓝光的负面影响,适配长时间屏幕场景。",
      es: "Protege tus ojos del azul de las pantallas — ideal para sesiones largas.",
      fr: "Protège vos yeux de la lumière bleue des écrans — idéal en usage prolongé.",
      de: "Schützt die Augen vor Bildschirm-Blaulicht — ideal für lange Bildschirmzeit.",
      it: "Protegge gli occhi dalla luce blu degli schermi — ideale per sessioni lunghe.",
      pt: "Protege os olhos da luz azul das telas — ideal para uso prolongado.",
      ja: "画面のブルーライトから目を保護——長時間の作業に最適。",
      ko: "화면의 블루라이트로부터 눈을 보호 — 장시간 작업에 최적.",
      ar: "يحمي عينيك من الضوء الأزرق للشاشات — مثالي للاستخدام الطويل.",
      vi: "Bảo vệ mắt khỏi ánh sáng xanh từ màn hình — lý tưởng cho phiên làm việc dài.",
      th: "ปกป้องดวงตาจากแสงสีฟ้าของหน้าจอ — เหมาะกับการใช้งานหน้าจอเป็นเวลานาน",
      id: "Lindungi mata dari sinar biru layar — ideal untuk sesi layar yang panjang.",
      ms: "Lindungi mata anda daripada cahaya biru skrin — sesuai untuk sesi skrin yang lama.",
    },
    extra: 19,
    cats: ALL_CATS,
    icon: Shield,
  },
  {
    id: "photo",
    group: "standard",
    label: {
      en: "Photochromic",
      zh: "光致变色",
      es: "Fotocromáticas",
      fr: "Photochromiques",
      de: "Phototrop",
      it: "Fotocromatiche",
      pt: "Fotocromáticas",
      ja: "調光レンズ",
      ko: "변색 렌즈",
      ar: "عدسات متغيّرة اللون",
      vi: "Đổi màu (photochromic)",
      th: "เลนส์ออโต้ (โฟโตโครมิก)",
      id: "Fotokromik",
      ms: "Fotokromik",
    },
    desc: {
      en: "Seamlessly clear indoors, darkens automatically outdoors in sunlight.",
      zh: "室内清晰透亮,室外阳光下自动变暗,一镜两用。",
      es: "Transparentes en interiores, se oscurecen al sol — un par para todo.",
      fr: "Transparents en intérieur, se foncent automatiquement au soleil.",
      de: "Innen klar, draußen automatisch dunkler im Sonnenlicht.",
      it: "Trasparenti al chiuso, si scuriscono al sole — una lente per tutto.",
      pt: "Transparentes em interiores, escurecem automaticamente ao sol.",
      ja: "室内ではクリア、屋外の太陽光で自動的に暗くなる。",
      ko: "실내에서는 투명, 야외 햇빛에서 자동으로 어두워짐.",
      ar: "شفافة في الداخل، تغمق تلقائيًا في الشمس بالخارج.",
      vi: "Trong suốt trong nhà, tự động sậm màu khi ra nắng.",
      th: "ใสในร่ม เข้มอัตโนมัติเมื่อโดนแดดกลางแจ้ง",
      id: "Bening di dalam ruangan, otomatis gelap di bawah sinar matahari.",
      ms: "Jernih di dalam, gelap secara automatik di bawah cahaya matahari.",
    },
    extra: 39,
    cats: ALL_CATS,
    icon: Sun,
    variants: [
      {
        id: "base",
        label: {
          en: "Photochromic (Base)",
          zh: "光致变色（基础款）",
          es: "Fotocromáticas (Básica)",
          fr: "Photochromiques (Base)",
          de: "Phototrop (Basis)",
          it: "Fotocromatiche (Base)",
          pt: "Fotocromáticas (Básica)",
          ja: "調光（ベーシック）",
          ko: "변색 (베이직)",
          ar: "متغيّرة (الأساسية)",
          vi: "Đổi màu (Cơ bản)",
          th: "โฟโตโครมิก (รุ่นพื้นฐาน)",
          id: "Fotokromik (Dasar)",
          ms: "Fotokromik (Asas)",
        },
        desc: {
          en: "Affordable photochromic lenses — clear to dark and back.",
          zh: "经济型变色镜片,室外变深、室内回清。",
          es: "Fotocromáticas económicas — claras a oscuras y de vuelta.",
          fr: "Photochromiques économiques — du clair au foncé et inversement.",
          de: "Erschwingliche phototrope Gläser — von klar zu dunkel und zurück.",
          it: "Fotocromatiche economiche — da chiare a scure e ritorno.",
          pt: "Fotocromáticas econômicas — do claro ao escuro e de volta.",
          ja: "手頃な調光レンズ——クリアから濃色へ、また戻る。",
          ko: "합리적인 변색 렌즈 — 투명에서 어두움으로, 다시 투명.",
          ar: "متغيّرة اقتصادية — من الشفاف إلى الداكن والعكس.",
          vi: "Tròng đổi màu giá hợp lý — chuyển từ trong sang sậm và ngược lại.",
          th: "เลนส์ออโต้ราคาประหยัด — เปลี่ยนจากใสเป็นเข้มแล้วกลับมาใส",
          id: "Lensa fotokromik terjangkau — dari bening ke gelap dan kembali.",
          ms: "Kanta fotokromik mampu milik — daripada jernih ke gelap dan kembali.",
        },
        extra: 39,
        colors: [
          lensColor("black", "#1f1f1f"),
          lensColor("lightGray", "#bcbcbc"),
        ],
      },
      {
        id: "blueUpgrade",
        label: {
          en: "Photochromic (Blue-Light Upgrade)",
          zh: "光致变色（蓝光升级款）",
          es: "Fotocromáticas (Anti-azul)",
          fr: "Photochromiques (Filtre bleu)",
          de: "Phototrop (Blaulicht-Upgrade)",
          it: "Fotocromatiche (Upgrade luce blu)",
          pt: "Fotocromáticas (Filtro azul)",
          ja: "調光（ブルーライト強化）",
          ko: "변색 (블루라이트 업그레이드)",
          ar: "متغيّرة (ترقية ضد الأزرق)",
          vi: "Đổi màu (Nâng cấp chống ánh sáng xanh)",
          th: "โฟโตโครมิก (อัปเกรดกรองแสงสีฟ้า)",
          id: "Fotokromik (Upgrade Anti Sinar Biru)",
          ms: "Fotokromik (Naik Taraf Cahaya Biru)",
        },
        desc: {
          en: "Photochromic with blue-light filtering — adaptive UV + screen protection.",
          zh: "变色 + 防蓝光,户外防紫外线、室内护屏幕。",
          es: "Fotocromática con filtro azul — UV adaptable + protección de pantalla.",
          fr: "Photochromique avec filtre lumière bleue — UV adaptatif + protection écran.",
          de: "Phototrop mit Blaulichtfilter — adaptiver UV- + Bildschirmschutz.",
          it: "Fotocromatica con filtro luce blu — UV adattivo + protezione schermo.",
          pt: "Fotocromática com filtro azul — UV adaptável + proteção de tela.",
          ja: "調光 + ブルーライトカット——適応 UV + 画面保護。",
          ko: "변색 + 블루라이트 차단 — 적응형 UV + 화면 보호.",
          ar: "متغيّرة مع فلتر الضوء الأزرق — حماية UV تكيّفية + حماية الشاشة.",
          vi: "Đổi màu kèm lọc ánh sáng xanh — bảo vệ UV thích ứng + bảo vệ khi nhìn màn hình.",
          th: "เลนส์ออโต้พร้อมกรองแสงสีฟ้า — ป้องกัน UV แบบปรับตัว + ปกป้องดวงตาจากหน้าจอ",
          id: "Fotokromik dengan filter sinar biru — perlindungan UV adaptif + proteksi layar.",
          ms: "Fotokromik dengan penapis cahaya biru — perlindungan UV adaptif + perlindungan skrin.",
        },
        extra: 59,
        colors: [
          lensColor("black", "#1f1f1f"),
          lensColor("lightBrown", "#b08968"),
        ],
      },
    ],
  },
  {
    id: "driving",
    group: "standard",
    label: {
      en: "Driving Lenses",
      zh: "驾驶镜头",
      es: "Lentes para conducción",
      fr: "Verres conduite",
      de: "Autofahrer-Brillenglas",
      it: "Lenti per guida",
      pt: "Lentes para direção",
      ja: "運転用レンズ",
      ko: "운전 렌즈",
      ar: "عدسات قيادة",
      vi: "Tròng kính lái xe",
      th: "เลนส์สำหรับขับรถ",
      id: "Lensa berkendara",
      ms: "Kanta memandu",
    },
    desc: {
      en: "Glare-reducing lenses with water-repellent coating for sharp day & night vision.",
      zh: "防眩光镜片 + 防水涂层,白天夜晚均提供清晰高清视觉体验。",
      es: "Lentes anti-deslumbramiento con capa hidrofóbica — visión nítida día y noche.",
      fr: "Verres anti-éblouissement avec traitement hydrophobe — vision nette jour et nuit.",
      de: "Blendreduzierende Gläser mit wasserabweisender Beschichtung — klare Sicht Tag und Nacht.",
      it: "Lenti anti-abbagliamento con trattamento idrofobo — visione nitida giorno e notte.",
      pt: "Lentes antirreflexo com camada hidrofóbica — visão nítida dia e noite.",
      ja: "防眩 + 撥水コーティングで昼夜ともにクリアな視界。",
      ko: "눈부심 방지 + 발수 코팅으로 낮·밤 모두 또렷한 시야.",
      ar: "عدسات مضادة للوهج مع طبقة طاردة للماء — رؤية حادة نهارًا وليلًا.",
      vi: "Tròng giảm chói với lớp phủ chống nước — nhìn rõ cả ngày lẫn đêm.",
      th: "เลนส์ลดแสงสะท้อนเคลือบกันน้ำ — มองคมชัดทั้งกลางวันและกลางคืน",
      id: "Lensa anti-silau dengan lapisan tahan air — penglihatan tajam siang & malam.",
      ms: "Kanta pengurang silau dengan salutan kalis air — penglihatan tajam siang & malam.",
    },
    extra: 49,
    cats: ALL_CATS,
    icon: Car,
  },
  {
    id: "tinted",
    group: "standard",
    label: {
      en: "Color-Tinted",
      zh: "有色镜片",
      es: "Lentes tintadas",
      fr: "Verres teintés",
      de: "Tönung",
      it: "Lenti colorate",
      pt: "Lentes coloridas",
      ja: "カラーレンズ",
      ko: "컬러 렌즈",
      ar: "عدسات ملوّنة",
      vi: "Tròng nhuộm màu",
      th: "เลนส์ย้อมสี",
      id: "Lensa berwarna",
      ms: "Kanta berwarna",
    },
    desc: {
      en: "Tint or coat your lenses for a custom color — style and all-day UV protection.",
      zh: "镜片染色或镀膜,打造个性化颜色,兼具时尚感与全天候紫外线防护。",
      es: "Tintado o capa para color personalizado — estilo y protección UV todo el día.",
      fr: "Teinte ou traitement coloré sur mesure — style et protection UV toute la journée.",
      de: "Tönung oder farbige Beschichtung nach Wahl — Stil und UV-Schutz den ganzen Tag.",
      it: "Tinta o trattamento colorato personalizzato — stile e protezione UV tutto il giorno.",
      pt: "Tingimento ou tratamento colorido personalizado — estilo e proteção UV o dia todo.",
      ja: "染色やコーティングでお好みのカラー——スタイルと一日中の UV 防護。",
      ko: "원하는 컬러로 염색·코팅 — 스타일과 하루 종일 UV 차단.",
      ar: "صبغة أو طبقة بألوان حسب الذوق — أناقة وحماية UV طوال اليوم.",
      vi: "Nhuộm hoặc phủ tròng theo màu riêng — phong cách và chống UV cả ngày.",
      th: "ย้อมหรือเคลือบเลนส์ตามสีที่คุณเลือก — ทั้งสไตล์และป้องกัน UV ตลอดวัน",
      id: "Beri warna atau lapisan lensa sesuai selera — gaya & proteksi UV sepanjang hari.",
      ms: "Warnakan atau salut kanta mengikut warna pilihan — gaya & perlindungan UV sepanjang hari.",
    },
    extra: 29,
    cats: ALL_CATS,
    icon: Palette,
    colors: [
      lensColor("black", "#1f1f1f"),
      lensColor("darkGray", "#4a4a4a"),
      lensColor("olive", "#5e6b3a"),
      lensColor("pink", "#f0c4cf"),
      lensColor("yellow", "#f0d878"),
      lensColor("lightBrown", "#b08968"),
      lensColor("darkGreen", "#1f4a35"),
      lensColor("cream", "#f3e9d2"),
    ],
  },
  {
    id: "polarized",
    group: "standard",
    label: {
      en: "Polarized Sunglass Lenses",
      zh: "偏光太阳镜镜片",
      es: "Lentes polarizadas",
      fr: "Verres polarisés",
      de: "Polarisierte Sonnengläser",
      it: "Lenti polarizzate",
      pt: "Lentes polarizadas",
      ja: "偏光サングラスレンズ",
      ko: "편광 선글라스 렌즈",
      ar: "عدسات نظارات شمسية مستقطبة",
      vi: "Tròng kính râm phân cực",
      th: "เลนส์แว่นกันแดดโพลาไรซ์",
      id: "Lensa kacamata hitam terpolarisasi",
      ms: "Kanta cermin mata hitam terkutub",
    },
    desc: {
      en: "Glare-reducing tinted lenses for sunglasses — great for driving, water and snow.",
      zh: "防眩光有色太阳镜镜片,适配驾驶、水上和雪上运动。",
      es: "Lentes tintadas anti-reflejos para sol — ideales para coche, agua y nieve.",
      fr: "Verres teintés anti-reflets pour solaires — parfaits en conduite, eau et neige.",
      de: "Getönte Anti-Blend-Sonnengläser — perfekt für Auto, Wasser und Schnee.",
      it: "Lenti colorate anti-riflesso per occhiali da sole — ideali per auto, acqua e neve.",
      pt: "Lentes coloridas antirreflexo para sol — ideais para carro, água e neve.",
      ja: "防眩カラーサングラスレンズ——運転・水辺・雪面に最適。",
      ko: "눈부심 방지 컬러 선글라스 렌즈 — 운전·물·눈에 최적.",
      ar: "عدسات ملوّنة مضادة للوهج للنظارات الشمسية — مثالية للقيادة والماء والثلج.",
      vi: "Tròng nhuộm chống chói cho kính râm — tuyệt cho lái xe, mặt nước và tuyết.",
      th: "เลนส์สีลดแสงสะท้อนสำหรับแว่นกันแดด — เหมาะกับการขับรถ น้ำ และหิมะ",
      id: "Lensa berwarna anti-silau untuk kacamata hitam — bagus untuk berkendara, di air, dan salju.",
      ms: "Kanta berwarna pengurang silau untuk cermin mata hitam — sesuai untuk memandu, di air, dan salji.",
    },
    extra: 49,
    cats: ALL_CATS,
    icon: Glasses,
    colors: [
      lensColor("darkGray", "#4a4a4a"),
      lensColor("brown", "#6b3a2a"),
      lensColor("darkGreen", "#1f4a35"),
    ],
  },
];

// ── View Area (Progressive only) ───────────────────────────────
const VIEW_AREAS: {
  id: ViewAreaId;
  label: T10;
  desc: T10;
  extra: number;
}[] = [
  {
    id: "standard",
    label: {
      en: "Standard View Area",
      zh: "标准视野",
      es: "Campo de visión estándar",
      fr: "Champ de vision standard",
      de: "Standard-Sichtfeld",
      it: "Campo visivo standard",
      pt: "Campo de visão padrão",
      ja: "標準視野",
      ko: "표준 시야",
      ar: "مجال رؤية قياسي",
      vi: "Vùng nhìn tiêu chuẩn",
      th: "พื้นที่มองภาพมาตรฐาน",
      id: "Bidang pandang standar",
      ms: "Bidang pandang standard",
    },
    desc: {
      en: "Comfortable and balanced view.",
      zh: "舒适均衡的视野,适合日常佩戴。",
      es: "Visión equilibrada y cómoda.",
      fr: "Vision équilibrée et confortable.",
      de: "Ausgewogene und komfortable Sicht.",
      it: "Visione equilibrata e confortevole.",
      pt: "Visão equilibrada e confortável.",
      ja: "快適でバランスの良い視界。",
      ko: "균형 있고 편안한 시야.",
      ar: "رؤية مريحة ومتوازنة.",
      vi: "Tầm nhìn cân bằng và thoải mái.",
      th: "มองภาพได้สมดุลและสบายตา",
      id: "Pandangan nyaman dan seimbang.",
      ms: "Penglihatan selesa dan seimbang.",
    },
    extra: 0,
  },
  {
    id: "broader",
    label: {
      en: "40% Broader View Area",
      zh: "40% 更宽视野",
      es: "40 % más amplio",
      fr: "40 % de champ en plus",
      de: "40 % weiteres Sichtfeld",
      it: "40 % di campo in più",
      pt: "40 % mais amplo",
      ja: "40% ワイド視野",
      ko: "40% 더 넓은 시야",
      ar: "مجال أوسع بنسبة 40٪",
      vi: "Vùng nhìn rộng hơn 40%",
      th: "พื้นที่มองภาพกว้างขึ้น 40%",
      id: "Bidang pandang 40% lebih luas",
      ms: "Bidang pandang 40% lebih luas",
    },
    desc: {
      en: "Maximum comfort and balanced fields of vision. Easier adaptation between zones.",
      zh: "最大舒适度与均衡视野,各视区切换更轻松。",
      es: "Máxima comodidad y campos visuales equilibrados. Adaptación más fácil entre zonas.",
      fr: "Confort maximum et champs équilibrés. Adaptation plus facile entre les zones.",
      de: "Maximaler Komfort und ausgewogene Sichtfelder. Leichterer Wechsel zwischen den Zonen.",
      it: "Massimo comfort e campi visivi equilibrati. Adattamento più facile tra le zone.",
      pt: "Conforto máximo e campos visuais equilibrados. Adaptação mais fácil entre as zonas.",
      ja: "最大の快適さとバランスの取れた視野——視区切り替えがより楽。",
      ko: "최고의 편안함과 균형 잡힌 시야 — 영역 전환이 더 쉬움.",
      ar: "أقصى راحة ومجالات رؤية متوازنة — انتقال أسهل بين المناطق.",
      vi: "Thoải mái tối đa và vùng nhìn cân bằng — chuyển vùng dễ dàng hơn.",
      th: "ใส่สบายสูงสุดและพื้นที่มองภาพสมดุล — เปลี่ยนระยะระหว่างโซนได้ง่ายขึ้น",
      id: "Kenyamanan maksimum dan bidang pandang seimbang — adaptasi antar zona lebih mudah.",
      ms: "Keselesaan maksimum dan bidang pandang seimbang — peralihan antara zon lebih mudah.",
    },
    extra: 9.41,
  },
];

// ── Value lists ────────────────────────────────────────────────
// Format helpers for diopter values
const fmtSph = (v: number) => {
  if (Math.abs(v) < 1e-9) return "0.00";
  return v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
};
const fmtCyl = (v: number) => (Math.abs(v) < 1e-9 ? "0.00" : v.toFixed(2));
// Always prints a leading sign for ADD (server stores ≥ 0 reals, but the
// dropdown values for ADD are "+0.75".."+3.50").
const fmtAdd = (v: number) => `+${v.toFixed(2)}`;

// Parse a rx string field like "+0.75" / "-1.25" / "PL" / "" into a real
// number, or null when nothing usable was entered.
function parseRxNumber(v: string): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

// Each saved prescription belongs to one of three kinds — the user's
// /account page slots them into exactly three cards. Plano has no Rx; both
// ready-made and custom readers are reading prescriptions.
type RxKind = "single" | "reading" | "progressive";
function rxKindForCategory(c: LensCategory): RxKind | null {
  if (c === "single") return "single";
  if (c === "progressive") return "progressive";
  if (c === "readingReady" || c === "readingCustom") return "reading";
  return null;
}

// Freeze the wizard's working rx into the same numeric shape the order_items
// snapshot columns use. Carried through cart → checkout so the tracker UI
// doesn't fall into the "missing prescription" branch on completed orders.
import type { RxSnapshot } from "@/lib/rx-snapshot";
export function selectionToRxSnapshot(sel: Selection): RxSnapshot | null {
  if (rxKindForCategory(sel.category) == null) return null;
  const rx = sel.rx;
  const readingAdd = parseRxNumber(rx.readingOd);
  const wantsAdd =
    sel.category === "progressive" || sel.category === "readingCustom";
  const source: RxSnapshot["source"] =
    rx.inputMode === "upload" ? "upload" : "manual";

  if (sel.category === "readingReady") {
    return {
      source,
      sphOd: 0,
      sphOs: 0,
      cylOd: 0,
      cylOs: 0,
      axisOd: null,
      axisOs: null,
      addOd: readingAdd,
      addOs: readingAdd,
      pdTotal: null,
      pdOdHalf: null,
      pdOsHalf: null,
    };
  }

  const defaultZero = sel.category === "readingCustom";
  return {
    source,
    sphOd: parseRxNumber(rx.odSph) ?? (defaultZero ? 0 : null),
    sphOs: parseRxNumber(rx.osSph) ?? (defaultZero ? 0 : null),
    cylOd: parseRxNumber(rx.odCyl) ?? (defaultZero ? 0 : null),
    cylOs: parseRxNumber(rx.osCyl) ?? (defaultZero ? 0 : null),
    axisOd: rx.odAxis ? parseInt(rx.odAxis, 10) : null,
    axisOs: rx.osAxis ? parseInt(rx.osAxis, 10) : null,
    addOd: wantsAdd ? parseRxNumber(rx.addOd) : null,
    addOs: wantsAdd ? parseRxNumber(rx.addOs) : null,
    pdTotal: rx.dualPd ? null : parseRxNumber(rx.pd),
    pdOdHalf: rx.dualPd ? parseRxNumber(rx.pdRight) : null,
    pdOsHalf: rx.dualPd ? parseRxNumber(rx.pdLeft) : null,
  };
}

// POST the current rx selection to /api/prescriptions. The cookie sent by the
// browser proves email ownership; the server rejects email mismatches with 403.
// Returns false when there is no saveable kind for the current category, so
// the caller can skip the side-effects (fingerprint update, toast on failure).
async function saveRxToServer(sel: Selection, email: string): Promise<boolean> {
  const kind = rxKindForCategory(sel.category);
  if (!kind) return false;
  const rx = sel.rx;
  const readingAdd = parseRxNumber(rx.readingOd);
  const defaultZero =
    sel.category === "readingReady" || sel.category === "readingCustom";
  const wantsAdd = kind === "reading" || kind === "progressive";
  const body = {
    email,
    kind,
    source: "manual" as const,
    sph: {
      od:
        sel.category === "readingReady"
          ? 0
          : (parseRxNumber(rx.odSph) ?? (defaultZero ? 0 : null)),
      os:
        sel.category === "readingReady"
          ? 0
          : (parseRxNumber(rx.osSph) ?? (defaultZero ? 0 : null)),
    },
    cyl: {
      od:
        sel.category === "readingReady"
          ? 0
          : (parseRxNumber(rx.odCyl) ?? (defaultZero ? 0 : null)),
      os:
        sel.category === "readingReady"
          ? 0
          : (parseRxNumber(rx.osCyl) ?? (defaultZero ? 0 : null)),
    },
    axis: {
      od: rx.odAxis ? parseInt(rx.odAxis, 10) : null,
      os: rx.osAxis ? parseInt(rx.osAxis, 10) : null,
    },
    add:
      sel.category === "readingReady"
        ? { od: readingAdd, os: readingAdd }
        : wantsAdd
          ? { od: parseRxNumber(rx.addOd), os: parseRxNumber(rx.addOs) }
          : { od: null, os: null },
    pd:
      sel.category === "readingReady"
        ? { total: null, odHalf: null, osHalf: null }
        : rx.dualPd
          ? {
              total: null,
              odHalf: parseRxNumber(rx.pdRight),
              osHalf: parseRxNumber(rx.pdLeft),
            }
          : { total: parseRxNumber(rx.pd), odHalf: null, osHalf: null },
    clientId: getCustomerClientId(),
  };
  const res = await fetch("/api/prescriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    // Cookie's gone — the localStorage UI hint is lying. Drop it so the next
    // render hides the Save checkbox and stops promising what we can't deliver.
    try {
      localStorage.removeItem(ACCOUNT_SESSION_KEY);
    } catch {
      /* ignore */
    }
    throw new Error("session_expired");
  }
  if (!res.ok) {
    const j = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(j?.error ?? `HTTP ${res.status}`);
  }
  return true;
}

// Fingerprint of the user-editable rx fields. Used to decide whether to skip
// re-saving an auto-filled prescription that the user didn't touch.
function rxFingerprint(rx: {
  odSph: string;
  osSph: string;
  odCyl: string;
  osCyl: string;
  odAxis: string;
  osAxis: string;
  addOd: string;
  addOs: string;
  pd: string;
  pdRight: string;
  pdLeft: string;
  dualPd: boolean;
}): string {
  return [
    rx.odSph,
    rx.osSph,
    rx.odCyl,
    rx.osCyl,
    rx.odAxis,
    rx.osAxis,
    rx.addOd,
    rx.addOs,
    rx.dualPd ? `H:${rx.pdRight}/${rx.pdLeft}` : `S:${rx.pd}`,
  ].join("|");
}

// Fingerprint of an untouched rx form — matches the defaults in the useState
// initializer below. Used as the "pristine" baseline when deciding whether
// auto-fill is safe to apply on category change (no risk of clobbering user
// edits when the form still looks like the day it opened).
const PRISTINE_RX_FINGERPRINT = rxFingerprint({
  odSph: "",
  osSph: "",
  odCyl: "0.00",
  osCyl: "0.00",
  odAxis: "",
  osAxis: "",
  addOd: "",
  addOs: "",
  pd: "63",
  pdRight: "31.5",
  pdLeft: "31.5",
  dualPd: false,
});

// Shape of one entry returned by GET /api/prescriptions — server returns up
// to three (one per kind). Kept loose (string for kind/source) since the
// wizard only cares about kind matching and the upload-source filter.
type SavedRx = {
  kind: string;
  source: string;
  sph: { od: number | null; os: number | null };
  cyl: { od: number | null; os: number | null };
  axis: { od: number | null; os: number | null };
  add: { od: number | null; os: number | null };
  pd: { total: number | null; odHalf: number | null; osHalf: number | null };
};

// Convert a saved-rx row into the string-typed form fields the wizard renders.
// Missing CYL/PD fall back to the same defaults the form opens with so the
// resulting fingerprint stays comparable to a pristine form.
function buildFilledRxFrom(usable: SavedRx) {
  const hasHalves = usable.pd?.odHalf != null && usable.pd?.osHalf != null;
  return {
    odSph: usable.sph.od != null ? fmtSph(usable.sph.od) : "",
    osSph: usable.sph.os != null ? fmtSph(usable.sph.os) : "",
    odCyl: usable.cyl.od != null ? fmtCyl(usable.cyl.od) : "0.00",
    osCyl: usable.cyl.os != null ? fmtCyl(usable.cyl.os) : "0.00",
    odAxis: usable.axis.od != null ? String(usable.axis.od) : "",
    osAxis: usable.axis.os != null ? String(usable.axis.os) : "",
    addOd: usable.add.od != null ? fmtAdd(usable.add.od) : "",
    addOs: usable.add.os != null ? fmtAdd(usable.add.os) : "",
    pd: usable.pd.total != null ? usable.pd.total.toFixed(2) : "63",
    pdRight: usable.pd.odHalf != null ? usable.pd.odHalf.toFixed(1) : "31.5",
    pdLeft: usable.pd.osHalf != null ? usable.pd.osHalf.toFixed(1) : "31.5",
    dualPd: hasHalves && usable.pd.total == null,
  };
}

// Find the saved row that should auto-fill this category's rx form. Upload-
// sourced rows are skipped because their numeric fields are blank until staff
// transcribe them; rows without any SPH are skipped because they carry no
// usable values.
function pickSavedRxFor(
  list: SavedRx[],
  category: LensCategory,
): SavedRx | null {
  const wantKind = rxKindForCategory(category);
  if (!wantKind) return null;
  return (
    list.find(
      (rx) =>
        rx.kind === wantKind &&
        rx.source !== "upload" &&
        (rx.sph?.od != null || rx.sph?.os != null),
    ) ?? null
  );
}

// SPH: -20.00 → 0.00 → +20.00 (ascending)
const SPH_VALUES: string[] = (() => {
  const arr: string[] = [];
  for (let i = 80; i >= 1; i--) arr.push(fmtSph(-0.25 * i));
  arr.push("0.00");
  for (let i = 1; i <= 80; i++) arr.push(fmtSph(0.25 * i));
  return arr;
})();

// CYL: -6.00 → 0.00 → +6.00 (ascending)
const CYL_VALUES: string[] = (() => {
  const arr: string[] = [];
  for (let i = 24; i >= 1; i--) arr.push(fmtCyl(-0.25 * i));
  arr.push("0.00");
  for (let i = 1; i <= 24; i++) arr.push(`+${(0.25 * i).toFixed(2)}`);
  return arr;
})();

// AXIS is a free-form integer input (1–180), not a dropdown — no values list needed.

// Progressive ADD: +0.75 to +3.50 step 0.25
const ADD_VALUES_PROG = (() => {
  const arr: string[] = [];
  for (let v = 0.75; v <= 3.5 + 1e-9; v += 0.25) arr.push(`+${v.toFixed(2)}`);
  return arr;
})();
// Reading Power: +1.00 to +4.00 step 0.25
const READING_VALUES = (() => {
  const arr: string[] = [];
  for (let v = 1.0; v <= 4.0 + 1e-9; v += 0.25) arr.push(`+${v.toFixed(2)}`);
  return arr;
})();
// Ready-made Reading magnification strength: +0.25 to +6.00 step 0.25
const READING_STRENGTH_VALUES = (() => {
  const arr: string[] = [];
  for (let v = 0.25; v <= 6.0 + 1e-9; v += 0.25) arr.push(`+${v.toFixed(2)}`);
  return arr;
})();
// PD: 48.00–78.00 mm, step 0.5 — covers small adults (~48) and large adults (~78);
// 50–70 missed real outliers and forced wrong picks at the tails.
const PD_VALUES = (() => {
  const arr: string[] = [];
  for (let v = 48; v <= 78 + 1e-9; v += 0.5) arr.push(v.toFixed(2));
  return arr;
})();
// Half PD (Right/Left): 24–39 mm in 0.5 steps — mirrors the single-PD range.
const HALF_PD_VALUES = (() => {
  const arr: string[] = [];
  for (let v = 24; v <= 39 + 1e-9; v += 0.5) arr.push(v.toFixed(1));
  return arr;
})();

// ── Helpers ────────────────────────────────────────────────────
function diopterToDegree(v: string): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[^\d.\-+]/g, ""));
  return isNaN(n) ? 0 : Math.round(Math.abs(n) * 100);
}

function availableIndexes(category: LensCategory): typeof INDEX_OPTIONS {
  if (category === "plano") return INDEX_OPTIONS.filter((o) => o.id !== "1.74");
  return INDEX_OPTIONS;
}

function recommendIndex(rx: RxData, category: LensCategory): LensIndexId {
  const allowed = availableIndexes(category);
  if (category === "plano") return "1.56";
  if (category === "readingReady") return "1.56";
  const odPower = diopterToDegree(rx.odSph) + diopterToDegree(rx.odCyl);
  const osPower = diopterToDegree(rx.osSph) + diopterToDegree(rx.osCyl);
  const power = Math.max(odPower, osPower);
  const match = allowed.find((o) => power >= o.range[0] && power <= o.range[1]);
  return (match?.id ?? "1.56") as LensIndexId;
}

// ── Lens SKU API layer ─────────────────────────────────────────
// The wizard's visual metadata (labels / descriptions / icons / colors) is the
// 1:1 design-spec content and stays static. The /api/lens/skus payload only
// drives two things: (1) which options are in stock (≥1 matching active SKU)
// and (2) the price delta for each option / the selected lens.

type ApiSku = {
  id: string;
  brandId: string;
  brandLine: string | null;
  prescriptionType:
    | "single-vision"
    | "progressive"
    | "reading"
    | "non-prescription";
  baseFunction: "clear" | "blue" | "photo" | "driving" | "tinted" | "polarized";
  functionVariant: "base" | "blueUpgrade" | null;
  refractiveIndex: number;
  progressiveDesign: "standard" | "short" | null;
  progressiveViewArea: "standard" | "broader" | null;
  lensColors:
    | { id: string; label: Record<string, string>; hex: string }[]
    | null;
  retailCents: number;
  displayName: Record<string, string>;
  description: Record<string, string>;
  heroImgUrl: string | null;
  recommended: boolean;
  sortOrder: number;
};
type LensCatalog = { skus: ApiSku[] };

// The ordered, possibly-trimmed set of wizard steps. Steps whose underlying
// SKU axis has ≤1 in-stock option are dropped (and auto-selected).
type StepKind = "type" | "rx" | "function" | "index" | "viewArea" | "review";

// wizard LensCategory → API prescription_type
function categoryToPrescriptionType(
  cat: LensCategory,
): ApiSku["prescriptionType"] {
  switch (cat) {
    case "single":
      return "single-vision";
    case "progressive":
      return "progressive";
    case "readingReady":
    case "readingCustom":
      return "reading";
    case "plano":
      return "non-prescription";
  }
}

// wizard refractive-index id ("1.56") → API numeric refractive_index
function indexIdToNumber(id: LensIndexId): number {
  return parseFloat(id);
}

// A partial selection used to filter SKUs as the user advances through steps.
type SkuFilter = {
  prescriptionType?: ApiSku["prescriptionType"];
  baseFunction?: ApiSku["baseFunction"];
  functionVariant?: ApiSku["functionVariant"];
  refractiveIndex?: number;
  progressiveDesign?: ApiSku["progressiveDesign"];
  progressiveViewArea?: ApiSku["progressiveViewArea"];
};

// SKUs that match every *specified* axis of the filter (unspecified axes are wildcards).
function matchSkus(skus: ApiSku[], f: SkuFilter): ApiSku[] {
  return skus.filter((s) => {
    if (
      f.prescriptionType !== undefined &&
      s.prescriptionType !== f.prescriptionType
    )
      return false;
    if (f.baseFunction !== undefined && s.baseFunction !== f.baseFunction)
      return false;
    if (
      f.functionVariant !== undefined &&
      s.functionVariant !== f.functionVariant
    )
      return false;
    if (
      f.refractiveIndex !== undefined &&
      s.refractiveIndex !== f.refractiveIndex
    )
      return false;
    if (
      f.progressiveDesign !== undefined &&
      s.progressiveDesign !== f.progressiveDesign
    )
      return false;
    if (
      f.progressiveViewArea !== undefined &&
      s.progressiveViewArea !== f.progressiveViewArea
    )
      return false;
    return true;
  });
}

function minRetailCents(skus: ApiSku[]): number | null {
  if (skus.length === 0) return null;
  return skus.reduce((m, s) => Math.min(m, s.retailCents), Infinity);
}

// USD-cents → dollars, rounded to 2 dp.
function centsToUsd(cents: number): number {
  return Math.round(cents) / 100;
}

// Whether a lens-function id carries photochromic-style variant sub-cards.
function activeFnHasVariants(fnId: string): boolean {
  return !!LENS_FUNCTIONS.find((f) => f.id === fnId)?.variants;
}

function isProgressiveCategory(cat: LensCategory): boolean {
  return cat === "progressive";
}

// Mirror of the OTP-verified account snapshot that /account writes to
// localStorage. Kept in sync with src/routes/$lang/account.tsx (ACCOUNT_KEY,
// ACCOUNT_TTL_MS). "Logged in" on this site means: the visitor proved
// ownership of an email via OTP, and the server cookie (also 30-day rolling)
// is still alive. The localStorage entry here is just a fast UI hint — the
// actual auth happens server-side via the HttpOnly cookie.
const ACCOUNT_SESSION_KEY = "lool_account_data_v2";
const ACCOUNT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface AccountSessionState {
  loggedIn: boolean;
  email: string | null;
}

function useAccountSession(): AccountSessionState {
  const [state, setState] = useState<AccountSessionState>({
    loggedIn: false,
    email: null,
  });
  useEffect(() => {
    const check = () => {
      try {
        const raw = localStorage.getItem(ACCOUNT_SESSION_KEY);
        if (!raw) {
          setState({ loggedIn: false, email: null });
          return;
        }
        const parsed = JSON.parse(raw) as { ts?: number; email?: string };
        const fresh =
          typeof parsed.ts === "number" &&
          Date.now() - parsed.ts < ACCOUNT_SESSION_TTL_MS;
        if (fresh && parsed.email) {
          setState({ loggedIn: true, email: parsed.email });
        } else {
          setState({ loggedIn: false, email: null });
        }
      } catch (err) {
        console.error(
          "[wizard] useAccountSession: localStorage parse failed",
          err,
        );
        setState({ loggedIn: false, email: null });
      }
    };
    check();
    // Sessions can change in other tabs (sign-in / sign-out on /account).
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);
  return state;
}

// ── Component ───────────────────────────────────────────────────

export function LensFlowWizard({
  product,
  mode,
  initialColorId,
  onClose,
  onComplete,
}: Props) {
  const { contentLang, t, localizeProductName, localizeColorName } = useI18n();
  const isFrameOnly = mode === "frameOnly";

  // Data-layer adaptation: this repo's Product.colors carry an images[] array
  // (ColorImages); the wizard's design expects a single framePng per color.
  // Map images[0] → framePng — display is unchanged.
  const productColors = product.colors ?? [];
  const colorOptions =
    productColors.length > 0
      ? productColors.map((c) => ({
          id: c.id,
          label: c.label,
          hex: c.hex,
          framePng: c.images[0] ?? product.framePng,
        }))
      : [
          {
            id: "default",
            label: { zh: "默认", en: "Default" },
            hex: "#444",
            framePng: product.framePng,
          },
        ];
  const [step, setStep] = useState(1);
  const [readingDropdownOpen, setReadingDropdownOpen] = useState(false);
  // Inline red marks on missing rx fields after a failed Continue (replaces toast).
  const [showRxErrors, setShowRxErrors] = useState(false);
  // Whether the visitor has a verified-email session (see src/routes/$lang/account.tsx).
  // Drives visibility of "Save my prescription" — saving requires an email to bind to.
  const { loggedIn: isLoggedIn, email: sessionEmail } = useAccountSession();
  // "Save my prescription" checkbox state. Defaults to true on the first
  // render where the visitor is logged in, so edits get persisted by default
  // (prevents the silent-data-loss case where someone tweaks values, forgets
  // to tick the box, and loses the change). User can still uncheck.
  const [saveRx, setSaveRx] = useState(false);
  // Fingerprint of the rx values at the time we auto-filled from a saved
  // prescription. Used to skip the POST on Continue when the user didn't
  // change anything (so we don't pile up duplicate rows on /account).
  const [loadedRxFingerprint, setLoadedRxFingerprint] = useState<string | null>(
    null,
  );
  // Guard so the saved-rx fetch only runs once per wizard mount, even if
  // the login state flips multiple times in quick succession.
  // Ref, NOT useState — flipping a state inside the effect would trigger a
  // re-render, which runs the effect's cleanup, which sets cancelled=true
  // and silently throws away the in-flight fetch's response. The ref
  // doesn't trigger re-renders.
  const savedRxFetchedRef = useRef(false);
  // Cached prescriptions list returned by GET /api/prescriptions, kept in
  // state so the apply-on-category-change effect re-runs once the fetch
  // resolves. `null` = not yet fetched / not logged in; `[]` = fetched but
  // user has no saved Rx yet (still pin to a stable value to short-circuit).
  const [savedRxList, setSavedRxList] = useState<SavedRx[] | null>(null);
  // Object URL of the uploaded prescription image — purely transient (kept in
  // component state, not in `sel`). The image itself is never persisted.
  // We extract values via /api/prescriptions/extract and save only the params.
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  // Lens SKU catalog — drives in-stock options + pricing. Visual metadata is static.
  const [catalog, setCatalog] = useState<LensCatalog | null>(null);
  const [catalogState, setCatalogState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [sel, setSel] = useState<Selection>({
    category: "single",
    visionType: "distance",
    progressiveDesign: "standard",
    index: "1.56",
    lensFunctionId: "clear",
    viewAreaId: "standard",
    rx: {
      odSph: "",
      osSph: "",
      // Default CYL to SPH/DS (0.00) so visitors without astigmatism — the
      // common case — don't have to touch the column to continue. Validation
      // still accepts any explicit pick, and the AXIS column auto-disables
      // when CYL is 0.
      odCyl: "0.00",
      osCyl: "0.00",
      odAxis: "",
      osAxis: "",
      addOd: "",
      addOs: "",
      readingOd: "",
      readingOs: "",
      pd: "63",
      pdRight: "31.5",
      pdLeft: "31.5",
      dualPd: false,
      uploadedName: null,
      inputMode: "manual",
    },
    colorId: initialColorId ?? colorOptions[0].id,
  });

  const activeColor =
    colorOptions.find((c) => c.id === sel.colorId) ?? colorOptions[0];
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Fetch the real lens SKU catalog on open.
  useEffect(() => {
    if (isFrameOnly) {
      setCatalogState("ready");
      return;
    }
    let cancelled = false;
    setCatalogState("loading");
    fetch("/api/lens/skus")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { skus?: ApiSku[] }) => {
        if (cancelled) return;
        setCatalog({ skus: data.skus ?? [] });
        setCatalogState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setCatalogState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [isFrameOnly]);

  // ── SKU-driven availability + pricing ──────────────────────────
  // Every option's visual metadata stays static; the catalog only tells us
  // which option values have ≥1 matching active SKU and what they cost.
  const skus = useMemo(() => catalog?.skus ?? [], [catalog]);

  // SKUs for the chosen optical type. Until the catalog loads this is empty,
  // which the rendering treats as "fall back to static options".
  const skusForCategory = useMemo(
    () =>
      matchSkus(skus, {
        prescriptionType: categoryToPrescriptionType(sel.category),
      }),
    [skus, sel.category],
  );

  // Cheapest SKU in the current category — the pricing baseline ("Included").
  const baseRetailCents = useMemo(
    () => minRetailCents(skusForCategory),
    [skusForCategory],
  );

  // Which optical types have ≥1 in-stock SKU (drives the type step's disabling).
  // Before the catalog loads every type is treated as available.
  const categoryAvailable = useMemo(() => {
    const present = new Set(skus.map((s) => s.prescriptionType));
    const test = (cat: LensCategory) =>
      catalogState !== "ready" ||
      skus.length === 0 ||
      present.has(categoryToPrescriptionType(cat));
    return {
      single: test("single"),
      progressive: test("progressive"),
      reading: test("readingReady"),
      plano: test("plano"),
    };
  }, [skus, catalogState]);

  // Lens-function cards (flattened to parentId:variantId) → in stock + min price.
  // Keyed exactly like the flattened cards in the function step.
  const functionAvailability = useMemo(() => {
    const m = new Map<
      string,
      { available: boolean; minCents: number | null }
    >();
    for (const f of LENS_FUNCTIONS) {
      if (!f.cats.includes(sel.category)) continue;
      const cards = f.variants
        ? f.variants.map((v) => ({ key: `${f.id}:${v.id}`, variantId: v.id }))
        : [{ key: f.id, variantId: undefined as string | undefined }];
      for (const card of cards) {
        const matched = matchSkus(skusForCategory, {
          baseFunction: f.id as ApiSku["baseFunction"],
          // function_variant is only meaningful for photo; otherwise wildcard.
          functionVariant: f.variants
            ? (card.variantId as ApiSku["functionVariant"])
            : undefined,
        });
        m.set(card.key, {
          available: matched.length > 0,
          minCents: minRetailCents(matched),
        });
      }
    }
    return m;
  }, [skusForCategory, sel.category]);

  // SKUs further narrowed by the chosen lens function (used by index / viewArea).
  const skusForFunction = useMemo(
    () =>
      matchSkus(skusForCategory, {
        baseFunction: sel.lensFunctionId as ApiSku["baseFunction"],
        functionVariant: activeFnHasVariants(sel.lensFunctionId)
          ? (sel.lensFunctionVariantId as ApiSku["functionVariant"])
          : undefined,
      }),
    [skusForCategory, sel.lensFunctionId, sel.lensFunctionVariantId],
  );

  // Refractive-index options → in stock + min price.
  const indexAvailability = useMemo(() => {
    const m = new Map<
      LensIndexId,
      { available: boolean; minCents: number | null }
    >();
    for (const o of INDEX_OPTIONS) {
      const matched = matchSkus(skusForFunction, {
        refractiveIndex: indexIdToNumber(o.id),
      });
      m.set(o.id, {
        available: matched.length > 0,
        minCents: minRetailCents(matched),
      });
    }
    return m;
  }, [skusForFunction]);

  // Progressive view-area options → in stock + min price.
  const viewAreaAvailability = useMemo(() => {
    const m = new Map<
      ViewAreaId,
      { available: boolean; minCents: number | null }
    >();
    for (const v of VIEW_AREAS) {
      const matched = matchSkus(skusForFunction, {
        refractiveIndex: indexIdToNumber(sel.index),
        progressiveViewArea: v.id,
      });
      m.set(v.id, {
        available: matched.length > 0,
        minCents: minRetailCents(matched),
      });
    }
    return m;
  }, [skusForFunction, sel.index]);

  // The single SKU that fully matches the current selection (final lens price).
  // Axes whose step was dropped (e.g. plano skips index) are left as wildcards
  // so the cheapest SKU on that axis is picked.
  const indexInPlan = sel.category !== "plano";
  const selectedSku = useMemo(() => {
    if (skusForCategory.length === 0) return null;
    const matched = matchSkus(skusForCategory, {
      baseFunction: sel.lensFunctionId as ApiSku["baseFunction"],
      functionVariant: activeFnHasVariants(sel.lensFunctionId)
        ? (sel.lensFunctionVariantId as ApiSku["functionVariant"])
        : undefined,
      ...(indexInPlan ? { refractiveIndex: indexIdToNumber(sel.index) } : {}),
      ...(isProgressiveCategory(sel.category)
        ? { progressiveViewArea: sel.viewAreaId }
        : {}),
    });
    // Cheapest exact match wins.
    return matched.reduce<ApiSku | null>(
      (best, s) =>
        best === null || s.retailCents < best.retailCents ? s : best,
      null,
    );
  }, [
    skusForCategory,
    sel.lensFunctionId,
    sel.lensFunctionVariantId,
    sel.index,
    sel.viewAreaId,
    sel.category,
    indexInPlan,
  ]);

  // Colors for the chosen lens function come from the matching SKU's lens_colors_json.
  const skuLensColors = useMemo(() => {
    const withColors = skusForFunction.find(
      (s) => s.lensColors && s.lensColors.length > 0,
    );
    return withColors?.lensColors ?? null;
  }, [skusForFunction]);

  // Lens-function colors per card come from the matching SKUs' lens_colors_json.
  // Returns null when there are no SKU-defined colors → fall back to static.
  const colorsForFunctionCard = useCallback(
    (parentId: string, variantId: string | undefined): LensColor[] | null => {
      const matched = matchSkus(skusForCategory, {
        baseFunction: parentId as ApiSku["baseFunction"],
        functionVariant: activeFnHasVariants(parentId)
          ? (variantId as ApiSku["functionVariant"])
          : undefined,
      });
      const seen = new Map<string, LensColor>();
      for (const s of matched) {
        for (const c of s.lensColors ?? []) {
          if (!seen.has(c.id)) {
            seen.set(c.id, {
              id: c.id,
              // Same pass-through as the addon labels — pickLang() handles
              // missing langs at the render site.
              label: c.label as T10,
              hex: c.hex,
            });
          }
        }
      }
      return seen.size > 0 ? [...seen.values()] : null;
    },
    [skusForCategory],
  );

  // Keep a valid lens-function color selected: auto-pick the first available
  // color (SKU-defined when the catalog is ready, else the static swatch set).
  useEffect(() => {
    const parent = LENS_FUNCTIONS.find((f) => f.id === sel.lensFunctionId);
    if (!parent) return;
    const variant = parent.variants?.find(
      (v) => v.id === sel.lensFunctionVariantId,
    );
    const skuColors =
      catalogState === "ready" && skusForCategory.length > 0
        ? colorsForFunctionCard(sel.lensFunctionId, sel.lensFunctionVariantId)
        : null;
    const colors = skuColors ?? variant?.colors ?? parent.colors;
    if (!colors || colors.length === 0) {
      if (sel.lensFunctionColorId !== undefined)
        setSel((s) => ({ ...s, lensFunctionColorId: undefined }));
      return;
    }
    if (!colors.some((c) => c.id === sel.lensFunctionColorId)) {
      setSel((s) => ({ ...s, lensFunctionColorId: colors[0].id }));
    }
  }, [
    catalogState,
    skusForCategory,
    sel.lensFunctionId,
    sel.lensFunctionVariantId,
    sel.lensFunctionColorId,
    colorsForFunctionCard,
  ]);

  // Backend rule: higher prescription → higher index (thinner lens).
  const recommended = useMemo(
    () => recommendIndex(sel.rx, sel.category),
    [sel.rx, sel.category],
  );

  // Reset lens function when the category change makes the current pick invalid
  // (design-level: each function declares which categories it applies to). The
  // SKU-availability snap effect below further narrows this to in-stock cards.
  useEffect(() => {
    setSel((s) => {
      const allowed = LENS_FUNCTIONS.filter((f) => f.cats.includes(s.category));
      if (allowed.find((f) => f.id === s.lensFunctionId)) return s;
      const f = allowed[0];
      return {
        ...s,
        lensFunctionId: f.id,
        lensFunctionVariantId: f.variants ? f.variants[0].id : undefined,
        lensFunctionColorId: f.variants
          ? f.variants[0].colors[0].id
          : f.colors
            ? f.colors[0].id
            : undefined,
      };
    });
  }, [sel.category]);

  // Step plan:
  //   frameOnly:   [1] Confirm
  //   plano:       [1] Type → [2] Index → [3] Function → [4] Review
  //   reading:     [1] Type → [2] Rx → [3] Index → [4] Function → [5] Review
  //   single/prog: [1] Type → [2] Rx → [3] Index → [4] Function → [5] Review
  const isReading =
    sel.category === "readingReady" || sel.category === "readingCustom";
  const isProgressive = sel.category === "progressive";

  // ── Pricing ────────────────────────────────────────────────────
  // A lens SKU has one retail price for the whole lens (function × index ×
  // view-area). The first paid axis (lens function) shows the full minimum
  // retail price for that function. Later axes show marginal deltas inside
  // the chosen function.
  const haveCatalog = catalogState === "ready" && skusForCategory.length > 0;
  const activeFn = LENS_FUNCTIONS.find((f) => f.id === sel.lensFunctionId);
  const activeVariant = activeFn?.variants?.find(
    (v) => v.id === sel.lensFunctionVariantId,
  );

  // Per-axis display deltas. Function is measured against the cheapest SKU in
  // the category; index/view-area are measured against the user's prior-step
  // choices so upgrades are not re-counted on later steps.
  const functionExtra = (() => {
    if (isFrameOnly) return 0;
    if (haveCatalog) {
      const key = activeFnHasVariants(sel.lensFunctionId)
        ? `${sel.lensFunctionId}:${sel.lensFunctionVariantId}`
        : sel.lensFunctionId;
      const cents = functionAvailability.get(key)?.minCents;
      if (cents != null && baseRetailCents != null)
        return Math.max(0, centsToUsd(cents - baseRetailCents));
    }
    return activeVariant?.extra ?? activeFn?.extra ?? 0;
  })();
  const indexExtra = (() => {
    if (isFrameOnly) return 0;
    if (haveCatalog) {
      const cents = indexAvailability.get(sel.index)?.minCents;
      const fnBaseCents = minRetailCents(skusForFunction);
      if (cents != null && fnBaseCents != null)
        return Math.max(0, centsToUsd(cents - fnBaseCents));
    }
    return INDEX_OPTIONS.find((i) => i.id === sel.index)?.extra ?? 0;
  })();
  const viewAreaExtra = (() => {
    if (isFrameOnly || !isProgressive) return 0;
    if (haveCatalog) {
      const cents = viewAreaAvailability.get(sel.viewAreaId)?.minCents;
      const idxBaseCents = minRetailCents(
        matchSkus(skusForFunction, {
          refractiveIndex: indexIdToNumber(sel.index),
        }),
      );
      if (cents != null && idxBaseCents != null)
        return Math.max(0, centsToUsd(cents - idxBaseCents));
    }
    return VIEW_AREAS.find((v) => v.id === sel.viewAreaId)?.extra ?? 0;
  })();

  // Per-step delta = selected SKU retail - cheapest SKU retail. This is only
  // used to preserve the design's "Included / +$N" upgrade language.
  const lensExtra = (() => {
    if (isFrameOnly) return 0;
    if (haveCatalog && selectedSku && baseRetailCents != null)
      return Math.max(0, centsToUsd(selectedSku.retailCents - baseRetailCents));
    // Catalog not ready → fall back to the static per-axis sum.
    return indexExtra + functionExtra + viewAreaExtra;
  })();
  // The payable lens amount is the full SKU retail price. The cheapest lens
  // can have every step marked "Included" while still costing money.
  // The wizard pre-seeds defaults (single / Clear / 1.56) so a SKU is
  // matched immediately, but on the type step (always step 1) and the rx
  // step (step 2 unless category is plano) the user hasn't made any
  // lens-affecting choice yet — they're picking the vision category or
  // entering their own prescription. Surfacing the default SKU's price
  // there reads as a bug. Show the lens price starting from the first
  // real lens-selection step (function / index / viewArea / review).
  const preLensSteps = sel.category === "plano" ? 1 : 2;
  const lensPriceUsd = (() => {
    if (isFrameOnly) return 0;
    if (step <= preLensSteps) return 0;
    if (haveCatalog && selectedSku) return centsToUsd(selectedSku.retailCents);
    return lensExtra;
  })();
  const total = Math.round((product.priceUSD + lensPriceUsd) * 100) / 100;

  // ── In-stock option sets (drive both rendering and step-skipping) ──────────
  // Flattened lens-function cards (parentId / variantId) available for the
  // chosen category. Catalog not ready → fall back to every design card.
  const visibleFunctionCards = useMemo(() => {
    const flat: {
      parentId: string;
      variantId: string | undefined;
      key: string;
    }[] = [];
    for (const f of LENS_FUNCTIONS) {
      if (!f.cats.includes(sel.category)) continue;
      if (f.variants) {
        for (const v of f.variants)
          flat.push({
            parentId: f.id,
            variantId: v.id,
            key: `${f.id}:${v.id}`,
          });
      } else {
        flat.push({ parentId: f.id, variantId: undefined, key: f.id });
      }
    }
    if (!haveCatalog) return flat;
    return flat.filter((c) => functionAvailability.get(c.key)?.available);
  }, [sel.category, haveCatalog, functionAvailability]);

  // Refractive-index options available for the chosen function.
  const visibleIndexes = useMemo(() => {
    const base = availableIndexes(sel.category);
    if (!haveCatalog) return base;
    return base.filter((o) => indexAvailability.get(o.id)?.available);
  }, [sel.category, haveCatalog, indexAvailability]);

  // Progressive view-area options available for the chosen function + index.
  const visibleViewAreas = useMemo(() => {
    if (!haveCatalog) return VIEW_AREAS;
    return VIEW_AREAS.filter((v) => viewAreaAvailability.get(v.id)?.available);
  }, [haveCatalog, viewAreaAvailability]);

  // ── Dynamic step plan ──────────────────────────────────────────
  // Fixed order; a step is dropped when its SKU axis has ≤1 in-stock option
  // (single option is auto-selected — see the auto-select effects below).
  const stepKinds = useMemo<StepKind[]>(() => {
    if (isFrameOnly) return ["review"];
    const kinds: StepKind[] = ["type"];
    if (sel.category !== "plano") kinds.push("rx");
    if (visibleFunctionCards.length > 1) kinds.push("function");
    // Non-prescription lenses skip the index step entirely (design spec).
    if (sel.category !== "plano" && visibleIndexes.length > 1)
      kinds.push("index");
    if (isProgressive && visibleViewAreas.length > 1) kinds.push("viewArea");
    kinds.push("review");
    return kinds;
  }, [
    isFrameOnly,
    sel.category,
    isProgressive,
    visibleFunctionCards.length,
    visibleIndexes.length,
    visibleViewAreas.length,
  ]);
  const totalSteps = stepKinds.length;
  // Current step kind (1-indexed `step` → kind). Clamped for safety.
  const currentKind: StepKind =
    stepKinds[Math.min(step, totalSteps) - 1] ?? "type";

  // Keep `step` in range when the plan shrinks (e.g. a step gets auto-skipped).
  useEffect(() => {
    setStep((s) => Math.min(s, totalSteps));
  }, [totalSteps]);

  // Snap the chosen lens function to an in-stock card when the current pick
  // is unavailable (covers catalog load + category switch + auto-skip).
  useEffect(() => {
    if (visibleFunctionCards.length === 0) return;
    const cur = activeFnHasVariants(sel.lensFunctionId)
      ? `${sel.lensFunctionId}:${sel.lensFunctionVariantId}`
      : sel.lensFunctionId;
    if (visibleFunctionCards.some((c) => c.key === cur)) return;
    const first = visibleFunctionCards[0];
    setSel((s) => ({
      ...s,
      lensFunctionId: first.parentId,
      lensFunctionVariantId: first.variantId,
      lensFunctionColorId: undefined,
    }));
  }, [visibleFunctionCards, sel.lensFunctionId, sel.lensFunctionVariantId]);

  // Snap index to the Rx-driven recommendation whenever the recommendation
  // itself changes (user edits Rx, switches category). Splitting this from
  // the out-of-stock fallback matters: an earlier version also fired on
  // `sel.index` changes, which silently undid manual user clicks.
  useEffect(() => {
    if (visibleIndexes.length === 0) return;
    const recAvail = visibleIndexes.find((o) => o.id === recommended);
    if (recAvail) {
      setSel((s) =>
        s.index === recAvail.id ? s : { ...s, index: recAvail.id },
      );
    }
  }, [recommended, visibleIndexes]);

  // Fallback when the user's current pick is no longer in stock (catalog
  // reload, category switch, or the recommendation isn't available).
  useEffect(() => {
    if (visibleIndexes.length === 0) return;
    if (!visibleIndexes.some((o) => o.id === sel.index)) {
      setSel((s) => ({ ...s, index: visibleIndexes[0].id }));
    }
  }, [visibleIndexes, sel.index]);

  // Snap the chosen progressive view area to an in-stock option.
  useEffect(() => {
    if (!isProgressive || visibleViewAreas.length === 0) return;
    if (visibleViewAreas.some((v) => v.id === sel.viewAreaId)) return;
    setSel((s) => ({ ...s, viewAreaId: visibleViewAreas[0].id }));
  }, [isProgressive, visibleViewAreas, sel.viewAreaId]);

  // Clear red marks once the user fills the required rx fields.
  useEffect(() => {
    if (showRxErrors && rxComplete()) setShowRxErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRxErrors, sel.rx, sel.category]);

  // Fetch the visitor's saved prescriptions once they sign in, then cache the
  // list in state. The actual auto-fill happens in the next effect so it can
  // re-apply when the user switches lens category (e.g. landing on "single"
  // by default and later picking "reading custom").
  //
  // 401 handling: the localStorage signal is just a UI hint — the cookie is
  // authoritative. If the GET 401s the cookie is gone (expired or cleared)
  // and the localStorage signal is lying. Clear it so the Save checkbox
  // disappears on the next render.
  useEffect(() => {
    if (!isLoggedIn || savedRxFetchedRef.current || isFrameOnly) return;
    savedRxFetchedRef.current = true;
    let cancelled = false;
    fetch("/api/prescriptions", { cache: "no-store" })
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) {
          try {
            localStorage.removeItem(ACCOUNT_SESSION_KEY);
          } catch {
            /* ignore */
          }
          console.warn(
            "[wizard] cookie missing/expired — cleared stale localStorage signal",
          );
          return;
        }
        if (!r.ok) {
          console.error(
            `[wizard] /api/prescriptions ${r.status} ${r.statusText}`,
          );
          return;
        }
        const data = (await r.json()) as { prescriptions?: SavedRx[] };
        setSavedRxList(data.prescriptions ?? []);
      })
      .catch((err) => {
        console.error("[wizard] /api/prescriptions fetch failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isFrameOnly]);

  // Apply the saved Rx that matches the current lens category. Re-runs on
  // category change so a user who lands on the default "single" category and
  // then picks "reading custom" still gets their saved reading Rx — without
  // this, the autofill only fires for whatever category happened to be
  // selected when the fetch resolved. "Save my prescription" flips on only
  // when we actually restored values, so a returning visitor with no prior
  // save still opts in explicitly the first time.
  //
  // Only overwrites when the form is pristine OR still equal to the last
  // auto-fill — once the user types anything custom we leave it alone.
  useEffect(() => {
    if (!isLoggedIn || isFrameOnly || !savedRxList) return;
    const usable = pickSavedRxFor(savedRxList, sel.category);
    if (!usable) return;
    const currentFp = rxFingerprint(sel.rx);
    const baseline = loadedRxFingerprint ?? PRISTINE_RX_FINGERPRINT;
    if (currentFp !== baseline) return;
    const filled = buildFilledRxFrom(usable);
    const filledFp = rxFingerprint(filled);
    if (filledFp === currentFp) return;
    setSel((s) => ({ ...s, rx: { ...s.rx, ...filled, inputMode: "manual" } }));
    setLoadedRxFingerprint(filledFp);
    setSaveRx(true);
  }, [
    isLoggedIn,
    isFrameOnly,
    savedRxList,
    sel.category,
    sel.rx,
    loadedRxFingerprint,
  ]);

  const missingMessage = (): string | null => {
    if (isFrameOnly) return null;
    if (currentKind === "function" && !sel.lensFunctionId)
      return t("wiz.error.pickFunction");
    if (currentKind === "index" && !sel.index) return t("wiz.error.pickIndex");
    if (currentKind === "viewArea" && !sel.viewAreaId)
      return t("wiz.error.pickViewArea");
    return null;
  };

  const next = () => {
    // RX step: mark missing fields inline instead of showing a generic toast.
    if (currentKind === "rx" && !isFrameOnly && !rxComplete()) {
      setShowRxErrors(true);
      return;
    }
    // Save the prescription on Continue from the rx step, when the user has
    // ticked Save (default on for logged-in users) AND something actually
    // differs from the auto-fill source (skip-if-clean avoids piling up
    // duplicate rows on /account). Fire-and-forget — don't block navigation,
    // but surface failures so the user knows their copy didn't land.
    if (
      currentKind === "rx" &&
      !isFrameOnly &&
      saveRx &&
      isLoggedIn &&
      sessionEmail &&
      // Both input modes converge on the same per-field state; the upload
      // path is just a "pre-fill values from an image" smart variant.
      (sel.rx.inputMode === "manual" || sel.rx.inputMode === "upload")
    ) {
      const fp = rxFingerprint(sel.rx);
      if (fp !== loadedRxFingerprint) {
        saveRxToServer(sel, sessionEmail).catch((err) => {
          toast.error(
            `${t("wiz.rx.savePrescription")}: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
        // Optimistically update fingerprint so a back-then-forward in the
        // wizard doesn't immediately re-POST the same data.
        setLoadedRxFingerprint(fp);
      }
    }
    const msg = missingMessage();
    if (msg) {
      toast(t("wiz.toast.headsUp"), { description: msg });
      return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const finish = () => onComplete(sel, lensPriceUsd, selectedSku?.id ?? null);

  // Upload flow: preview the image immediately, ship it to /extract for OCR,
  // populate the rx form with whatever the model recognized. The image is
  // never saved; only the (user-editable) extracted values are persisted on
  // Continue via /api/prescriptions (when Save my prescription is checked).
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Free any prior blob URL to avoid leaks if the user re-uploads.
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    const blobUrl = URL.createObjectURL(f);
    setUploadPreviewUrl(blobUrl);
    setSel((s) => ({ ...s, rx: { ...s.rx, uploadedName: f.name } }));
    trackCustomerEvent({
      action: "PRESCRIPTION_UPLOAD",
      resourceType: "prescription",
      meta: { fileType: f.type, size: f.size },
    });
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/prescriptions/extract", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        toast.error(t("wiz.rx.extractFailed"));
        return;
      }
      const j = (await res.json()) as {
        ok?: boolean;
        extracted?: {
          od: {
            sph: number | null;
            cyl: number | null;
            axis: number | null;
            add: number | null;
          };
          os: {
            sph: number | null;
            cyl: number | null;
            axis: number | null;
            add: number | null;
          };
          pd: {
            total: number | null;
            odHalf: number | null;
            osHalf: number | null;
          };
        };
      };
      if (!j.ok || !j.extracted) {
        toast.error(t("wiz.rx.extractFailed"));
        return;
      }
      const ex = j.extracted;
      const hasHalves = ex.pd.odHalf != null && ex.pd.osHalf != null;
      const filled = {
        odSph: ex.od.sph != null ? fmtSph(ex.od.sph) : "",
        osSph: ex.os.sph != null ? fmtSph(ex.os.sph) : "",
        odCyl: ex.od.cyl != null ? fmtCyl(ex.od.cyl) : "0.00",
        osCyl: ex.os.cyl != null ? fmtCyl(ex.os.cyl) : "0.00",
        odAxis: ex.od.axis != null ? String(ex.od.axis) : "",
        osAxis: ex.os.axis != null ? String(ex.os.axis) : "",
        addOd: ex.od.add != null ? fmtAdd(ex.od.add) : "",
        addOs: ex.os.add != null ? fmtAdd(ex.os.add) : "",
        pd: ex.pd.total != null ? ex.pd.total.toFixed(2) : "63",
        pdRight: ex.pd.odHalf != null ? ex.pd.odHalf.toFixed(1) : "31.5",
        pdLeft: ex.pd.osHalf != null ? ex.pd.osHalf.toFixed(1) : "31.5",
        dualPd: hasHalves && ex.pd.total == null,
      };
      setSel((s) => ({ ...s, rx: { ...s.rx, ...filled } }));
      // Default Save on after a successful upload — the visitor took the
      // trouble to upload, they almost certainly want it kept.
      if (isLoggedIn) setSaveRx(true);
      toast.success(t("wiz.rx.extractedReview"));
    } catch {
      toast.error(t("wiz.rx.extractFailed"));
    } finally {
      setExtracting(false);
    }
  };

  // Release blob URL on unmount.
  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  // Validation. Upload mode no longer special-cases on "did they pick a file"
  // — by the time Continue is enabled we've extracted values into the same
  // fields the manual form uses, and they're editable, so the same per-field
  // checks apply. Pre-extraction the dropzone takes the whole panel anyway.
  function rxComplete(): boolean {
    if (sel.category === "plano") return true;
    const pdOk = sel.rx.dualPd
      ? !!sel.rx.pdRight && !!sel.rx.pdLeft
      : !!sel.rx.pd;
    // CYL 非 0 时必须填轴位（整数 1–180）
    const cylAxisOk = (["od", "os"] as const).every((eye) => {
      const c = sel.rx[`${eye}Cyl`];
      const hasCyl = !!c && parseFloat(c) !== 0;
      if (!hasCyl) return true;
      const a = sel.rx[`${eye}Axis`];
      if (!a) return false;
      const n = parseInt(a, 10);
      return !isNaN(n) && n >= 1 && n <= 180;
    });
    // SPH/CYL must be explicitly picked (including PL/SPH-DS for zero) —
    // empty placeholder doesn't count as "filled in".
    const sphOk = !!sel.rx.odSph && !!sel.rx.osSph;
    const cylOk = !!sel.rx.odCyl && !!sel.rx.osCyl;
    if (sel.category === "single") return sphOk && cylOk && pdOk && cylAxisOk;
    if (sel.category === "readingReady") return !!sel.rx.readingOd;
    if (sel.category === "readingCustom")
      return !!sel.rx.addOd && !!sel.rx.addOs && pdOk && cylAxisOk;
    // progressive
    return (
      sphOk && cylOk && !!sel.rx.addOd && !!sel.rx.addOs && pdOk && cylAxisOk
    );
  }

  // A step is shown when it's the current kind in the (trimmed) step plan.
  // While the lens catalog is loading / errored, all steps are suppressed in
  // favour of the loading / error panel (frame-only needs no catalog).
  const showStep = (kind: StepKind) =>
    currentKind === kind && (isFrameOnly || catalogState === "ready");

  // Step title + subtitle for the page-level header. Rendered above the
  // sidebar/content grid so the heading is centered across the full panel
  // (not just the right column) and the sidebar card naturally aligns
  // with the first option card on the right.
  // Step title + subtitle for the page-level header. All 10 languages drive
  // off the central i18n dictionary (wiz.head.*), so a user switching to ja /
  // ko / ar etc. sees a fully localized wizard header instead of the English
  // fallback that the old inline tx(zh, en) produced.
  const stepHeaderContent: { title: string; subtitle: string } | null = (() => {
    if (isFrameOnly || catalogState !== "ready") return null;
    switch (currentKind) {
      case "type":
        return {
          title: t("wiz.head.type.title"),
          subtitle: t("wiz.head.type.subtitle"),
        };
      case "rx":
        return sel.category === "readingReady"
          ? {
              title: t("wiz.head.rxReady.title"),
              subtitle: t("wiz.head.rxReady.subtitle"),
            }
          : {
              title: t("wiz.head.rx.title"),
              subtitle: t("wiz.head.rx.subtitle"),
            };
      case "function":
        return {
          title: t("wiz.head.function.title"),
          subtitle: t("wiz.head.function.subtitle"),
        };
      case "index":
        return {
          title: t("wiz.head.index.title"),
          subtitle: t("wiz.head.index.subtitle"),
        };
      case "viewArea":
        return {
          title: t("wiz.head.viewArea.title"),
          subtitle: t("wiz.head.viewArea.subtitle"),
        };
      case "review":
        return {
          title: t("wiz.head.review.title"),
          subtitle: t("wiz.head.review.subtitle"),
        };
      default:
        return null;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto overscroll-contain scrollbar-hide animate-in fade-in">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-secondary flex items-center justify-center transition-smooth shadow-soft"
        aria-label={t("wiz.btn.close")}
      >
        <X className="w-5 h-5" />
      </button>
      <div className="min-h-full flex flex-col">
        {/* Body */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
          {stepHeaderContent && (
            <div className="mb-6 pb-4 border-b border-border">
              <StepHeader
                title={stepHeaderContent.title}
                subtitle={stepHeaderContent.subtitle}
              />
            </div>
          )}
          <div
            className={
              isFrameOnly
                ? ""
                : "grid lg:grid-cols-[340px_1fr] gap-8 items-start"
            }
          >
            {!isFrameOnly && (
              <aside className="lg:sticky lg:top-6">
                <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
                  {/* Frame preview image — hidden on mobile so the
                      SELECTED FRAME info + the lens-type option cards
                      below it can sit right under the step header
                      without forcing the user to scroll past the photo
                      (the same image is already on the PDP behind the
                      wizard). */}
                  <div className="hidden md:block p-4 pb-0">
                    <div className="aspect-[4/3] bg-secondary/40 rounded-2xl overflow-hidden">
                      <img
                        src={activeColor.framePng}
                        alt=""
                        className="w-full h-full object-contain scale-[1.5]"
                      />
                    </div>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">
                        {t("wiz.label.selectedFrame")}
                      </p>
                      <h4 className="text-base font-semibold font-display leading-tight">
                        {localizeProductName(
                          product.slug,
                          pickLang(product.name, contentLang),
                        )}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[11px] bg-secondary/70 px-2.5 py-1 rounded-md text-foreground/70 capitalize">
                          {localizeColorName(
                            activeColor.label.en,
                            pickLang(activeColor.label, contentLang),
                          )}
                        </span>
                        <span className="text-[11px] bg-secondary/70 px-2.5 py-1 rounded-md text-foreground/70 capitalize">
                          {shapeLabel(product.shape, t)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border flex items-baseline justify-between">
                      <span className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                        {t("wiz.label.framePrice")}
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        ${product.priceUSD}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            )}
            <div className="min-w-0 flex flex-col">
              {/* ============ FRAME ONLY ============ */}
              {isFrameOnly && (
                <section className="text-center max-w-xl mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
                    <Glasses className="w-9 h-9 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-semibold font-display mb-3">
                    {t("wiz.label.frameOnly")}
                  </h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {t("wiz.frameOnly.note")}
                  </p>
                  <div className="rounded-2xl border border-border bg-card/60 p-6 text-left space-y-3">
                    <Row
                      label={t("wiz.label.frame")}
                      value={localizeProductName(
                        product.slug,
                        pickLang(product.name, contentLang),
                      )}
                    />
                    <Row
                      label={t("wiz.label.color")}
                      value={localizeColorName(
                        activeColor.label.en,
                        pickLang(activeColor.label, contentLang),
                      )}
                    />
                    <Row
                      label={t("wiz.label.demoLenses")}
                      value={t("wiz.label.free")}
                      muted
                    />
                    <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                      <span>{t("wiz.label.total")}</span>
                      <span>${product.priceUSD}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* ============ CATALOG LOADING ============ */}
              {!isFrameOnly && catalogState === "loading" && (
                <section className="flex justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                </section>
              )}

              {/* ============ CATALOG ERROR ============ */}
              {!isFrameOnly && catalogState === "error" && (
                <section className="text-center max-w-md mx-auto py-20 animate-in fade-in">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-secondary flex items-center justify-center">
                    <X className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold font-display mb-2">
                    {t("wiz.error.loadFailed")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t("wiz.catalog.error.body")}
                  </p>
                  <Button
                    onClick={() => {
                      setCatalogState("loading");
                      fetch("/api/lens/skus")
                        .then((r) => {
                          if (!r.ok) throw new Error(`HTTP ${r.status}`);
                          return r.json();
                        })
                        .then((data: { skus?: ApiSku[] }) => {
                          setCatalog({ skus: data.skus ?? [] });
                          setCatalogState("ready");
                        })
                        .catch(() => setCatalogState("error"));
                    }}
                    className="rounded-full h-11 px-6"
                  >
                    {t("wiz.btn.retry")}
                  </Button>
                </section>
              )}

              {/* ============ STEP — TYPE ============ */}
              {showStep("type") && (
                <section>
                  <div className="grid grid-cols-1 gap-3">
                    {CATEGORIES.map((c) => {
                      const Icon = c.Icon;
                      const active =
                        c.id === "reading" ? isReading : sel.category === c.id;
                      // A category with no in-stock SKU is shown but not selectable.
                      const catDisabled =
                        c.id === "reading"
                          ? !categoryAvailable.reading
                          : !categoryAvailable[
                              c.id as "single" | "progressive" | "plano"
                            ];
                      if (c.id === "reading") {
                        return (
                          <div key={c.id}>
                            <button
                              disabled={catDisabled}
                              onClick={() => {
                                if (catDisabled) return;
                                setSel((s) => ({
                                  ...s,
                                  category: isReading
                                    ? s.category
                                    : "readingReady",
                                }));
                                setReadingDropdownOpen(true);
                              }}
                              className={`relative w-full text-left rounded-2xl border p-4 transition-colors duration-300 ${catDisabled ? "opacity-45 cursor-not-allowed border-border bg-card" : active ? "border-primary border-2 bg-primary/[0.04] shadow-elegant" : "border-border bg-card hover:border-primary/50"}`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary/60 text-foreground"}`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-base tracking-tight mb-0.5">
                                    {pickLang(c.label, contentLang)}
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {pickLang(c.desc, contentLang)}
                                  </p>
                                </div>
                                {active && (
                                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                              {active && (
                                <div
                                  className="mt-5 pt-5 border-t border-border/60 animate-in fade-in slide-in-from-top-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                      {t("wiz.label.chooseReadingType")}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground">
                                      {
                                        READING_MODES.find(
                                          (m) => m.id === sel.category,
                                        )?.label[contentLang]
                                      }
                                    </span>
                                  </div>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {READING_MODES.map((m) => {
                                      const on = sel.category === m.id;
                                      return (
                                        <div
                                          key={m.id}
                                          role="button"
                                          tabIndex={0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSel((s) => ({
                                              ...s,
                                              category: m.id,
                                            }));
                                          }}
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" ||
                                              e.key === " "
                                            ) {
                                              e.preventDefault();
                                              setSel((s) => ({
                                                ...s,
                                                category: m.id,
                                              }));
                                            }
                                          }}
                                          className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${on ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"}`}
                                        >
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="font-semibold text-sm">
                                              {pickLang(m.label, contentLang)}
                                            </p>
                                            <div
                                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
                                            >
                                              {on && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground leading-relaxed">
                                            {pickLang(m.desc, contentLang)}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={c.id}
                          disabled={catDisabled}
                          onClick={() => {
                            if (catDisabled) return;
                            setSel((s) => ({
                              ...s,
                              category:
                                c.id === "reading"
                                  ? "readingReady"
                                  : (c.id as LensCategory),
                            }));
                          }}
                          className={`relative text-left rounded-2xl border p-4 transition-colors duration-300 ${catDisabled ? "opacity-45 cursor-not-allowed border-border bg-card" : active ? "border-primary border-2 bg-primary/[0.04] shadow-elegant" : "border-border bg-card hover:border-primary/50"}`}
                        >
                          {c.badge && (
                            <span className="absolute -top-2.5 right-6 text-[10px] uppercase tracking-[0.18em] font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-soft">
                              {pickLang(c.badge, contentLang)}
                            </span>
                          )}
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary/60 text-foreground"}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base tracking-tight mb-0.5">
                                {pickLang(c.label, contentLang)}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {pickLang(c.desc, contentLang)}
                              </p>
                            </div>
                            {active && (
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ============ STEP — RX ============ */}
              {showStep("rx") && (
                <section>
                  {/* Ready-made Reading: pure magnification strength picker */}
                  {sel.category === "readingReady" ? (
                    <div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {READING_STRENGTH_VALUES.map((v) => {
                          const on = sel.rx.readingOd === v;
                          const markRed = showRxErrors && !sel.rx.readingOd;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                setSel((s) => ({
                                  ...s,
                                  rx: { ...s.rx, readingOd: v, readingOs: v },
                                }))
                              }
                              className={`rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-smooth ${
                                on
                                  ? "border-primary bg-primary/5 text-primary shadow-soft"
                                  : markRed
                                    ? "border-destructive bg-card hover:border-destructive text-foreground/80"
                                    : "border-border bg-card hover:border-primary/40 text-foreground/80"
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-5 text-[11px] text-muted-foreground text-center">
                        {t("wiz.rx.readingTip")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mode tabs */}
                      <div className="flex justify-center">
                        <div className="inline-flex p-1 rounded-full border border-border bg-card/50">
                          {[
                            {
                              id: "manual" as RxInputMode,
                              label: t("wiz.rx.manualEntry"),
                              Icon: Pencil,
                            },
                            {
                              id: "upload" as RxInputMode,
                              label: t("wiz.rx.uploadRx"),
                              Icon: Upload,
                            },
                          ].map((m) => {
                            const active = sel.rx.inputMode === m.id;
                            const Icon = m.Icon;
                            return (
                              <button
                                key={m.id}
                                onClick={() =>
                                  setSel((s) => ({
                                    ...s,
                                    rx: { ...s.rx, inputMode: m.id },
                                  }))
                                }
                                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-smooth ${active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
                              >
                                <Icon className="w-4 h-4" /> {m.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Upload — sits ABOVE the form so the original image
                          stays in view while the user reviews / corrects the
                          extracted values. Pre-extraction: full dropzone.
                          Post-extraction: image preview + spinner overlay
                          while OCR is in flight. */}
                      {sel.rx.inputMode === "upload" && (
                        <div className="mt-6 max-w-xl mx-auto">
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={onUpload}
                          />
                          {!uploadPreviewUrl ? (
                            <button
                              onClick={() => fileRef.current?.click()}
                              disabled={extracting}
                              className="w-full rounded-2xl border-2 border-dashed bg-secondary/30 hover:bg-secondary/50 transition-smooth p-10 text-center border-border hover:border-primary/50 disabled:opacity-60"
                            >
                              <div className="w-14 h-14 mx-auto rounded-full bg-card flex items-center justify-center shadow-soft mb-4">
                                <Upload className="w-6 h-6" />
                              </div>
                              <p className="font-medium">
                                {t("wiz.rx.uploadCta")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {t("wiz.rx.uploadHint")}
                              </p>
                            </button>
                          ) : (
                            <div className="relative rounded-2xl border border-border bg-card/60 p-3 sm:p-4">
                              <img
                                src={uploadPreviewUrl}
                                alt={sel.rx.uploadedName ?? "prescription"}
                                className="w-full max-h-72 object-contain rounded-lg bg-muted/40"
                              />
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground truncate">
                                  {sel.rx.uploadedName}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => fileRef.current?.click()}
                                  disabled={extracting}
                                  className="text-sm text-primary underline underline-offset-2 hover:no-underline disabled:opacity-60"
                                >
                                  {t("wiz.rx.replaceImage")}
                                </button>
                              </div>
                              {extracting && (
                                <div className="absolute inset-0 rounded-2xl bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                  <p className="text-sm text-foreground">
                                    {t("wiz.rx.extracting")}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual — also reused by the upload flow once an
                          image is being previewed (extracted values land in
                          the same fields and remain user-editable). */}
                      {(sel.rx.inputMode === "manual" ||
                        (sel.rx.inputMode === "upload" &&
                          uploadPreviewUrl)) && (
                        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
                          {/* Custom Reading uses the same SPH/CYL/AXIS + ADD layout as Progressive. */}
                          <>
                            <div className="overflow-x-auto hidden sm:block">
                              <table className="w-full text-sm border border-border rounded-md overflow-hidden">
                                <thead className="bg-muted/50">
                                  <tr className="text-xs text-muted-foreground">
                                    <th className="text-left font-medium px-3 py-2 w-24 border-b border-border"></th>
                                    <th className="text-center font-semibold px-3 py-2 border-b border-l border-border">
                                      SPH
                                    </th>
                                    <th className="text-center font-semibold px-3 py-2 border-b border-l border-border">
                                      CYL
                                    </th>
                                    <th className="text-center font-semibold px-3 py-2 border-b border-l border-border">
                                      AXIS
                                    </th>
                                    {(sel.category === "progressive" ||
                                      sel.category === "readingCustom") && (
                                      <th className="text-center font-semibold px-3 py-2 border-b border-l border-border">
                                        ADD
                                      </th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(["od", "os"] as const).map((eye) => (
                                    <tr
                                      key={eye}
                                      className="border-t border-border"
                                    >
                                      <td className="px-3 py-2.5 font-medium text-foreground/80 bg-muted/30 align-middle">
                                        <div className="text-sm font-semibold">
                                          {eye === "od" ? "OD" : "OS"}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                          {eye === "od"
                                            ? t("wiz.rx.right")
                                            : t("wiz.rx.left")}
                                        </div>
                                      </td>
                                      <td className="px-2 py-2 align-middle border-l border-border">
                                        <RxField
                                          values={SPH_VALUES}
                                          divider="SPH(+/-)"
                                          value={sel.rx[`${eye}Sph`]}
                                          onChange={(v) => {
                                            // SPH → PL linkage: when SPH is plano (0.00), reset CYL to 0 and clear AXIS
                                            const isPlano =
                                              !!v && parseFloat(v) === 0;
                                            setSel((s) => ({
                                              ...s,
                                              rx: {
                                                ...s.rx,
                                                [`${eye}Sph`]: v,
                                                ...(isPlano
                                                  ? {
                                                      [`${eye}Cyl`]: "0.00",
                                                      [`${eye}Axis`]: "",
                                                    }
                                                  : {}),
                                              },
                                            }));
                                          }}
                                          placeholder={t("wiz.rx.select")}
                                          searchPlaceholder={t(
                                            "wiz.rx.searchSph",
                                          )}
                                          contentLang={contentLang}
                                          zeroLabel="PL"
                                          invalid={
                                            showRxErrors && !sel.rx[`${eye}Sph`]
                                          }
                                        />
                                      </td>
                                      <td className="px-2 py-2 align-middle border-l border-border">
                                        <RxField
                                          values={CYL_VALUES}
                                          value={sel.rx[`${eye}Cyl`]}
                                          onChange={(v) => {
                                            // CYL → AXIS linkage: clear axis when CYL becomes 0/empty
                                            const cleared =
                                              !v || parseFloat(v) === 0;
                                            setSel((s) => ({
                                              ...s,
                                              rx: {
                                                ...s.rx,
                                                [`${eye}Cyl`]: v,
                                                ...(cleared
                                                  ? { [`${eye}Axis`]: "" }
                                                  : {}),
                                              },
                                            }));
                                          }}
                                          placeholder={t("wiz.rx.select")}
                                          searchPlaceholder={t(
                                            "wiz.rx.searchCyl",
                                          )}
                                          contentLang={contentLang}
                                          zeroLabel="DS"
                                          invalid={
                                            showRxErrors && !sel.rx[`${eye}Cyl`]
                                          }
                                        />
                                      </td>
                                      <td className="px-2 py-2 align-middle border-l border-border">
                                        {(() => {
                                          const cylVal = sel.rx[`${eye}Cyl`];
                                          const axisDisabled =
                                            !cylVal || parseFloat(cylVal) === 0;
                                          const axisVal = sel.rx[`${eye}Axis`];
                                          const axisNum = axisVal
                                            ? parseInt(axisVal, 10)
                                            : NaN;
                                          const axisOutOfRange =
                                            !!axisVal &&
                                            (isNaN(axisNum) ||
                                              axisNum < 1 ||
                                              axisNum > 180);
                                          const axisInvalid =
                                            !axisDisabled &&
                                            (axisOutOfRange ||
                                              (showRxErrors && !axisVal));
                                          return (
                                            <input
                                              type="number"
                                              inputMode="numeric"
                                              min={1}
                                              max={180}
                                              step={1}
                                              disabled={axisDisabled}
                                              value={axisVal}
                                              placeholder={
                                                axisDisabled ? "—" : "1–180"
                                              }
                                              onChange={(e) => {
                                                const raw =
                                                  e.target.value.replace(
                                                    /[^\d]/g,
                                                    "",
                                                  );
                                                setSel((s) => ({
                                                  ...s,
                                                  rx: {
                                                    ...s.rx,
                                                    [`${eye}Axis`]: raw,
                                                  },
                                                }));
                                              }}
                                              className={`w-full h-10 px-2.5 rounded-lg border-2 bg-background text-sm text-center tabular-nums transition-colors outline-none ${
                                                axisDisabled
                                                  ? "opacity-50 bg-muted/40 cursor-not-allowed border-border"
                                                  : axisInvalid
                                                    ? "border-destructive hover:border-destructive focus:border-destructive"
                                                    : "border-border hover:border-primary/60 focus:border-primary"
                                              }`}
                                            />
                                          );
                                        })()}
                                      </td>
                                      {(sel.category === "progressive" ||
                                        sel.category === "readingCustom") && (
                                        <td className="px-2 py-2 align-middle border-l border-border">
                                          <RxField
                                            values={ADD_VALUES_PROG}
                                            value={
                                              eye === "od"
                                                ? sel.rx.addOd
                                                : sel.rx.addOs
                                            }
                                            onChange={(v) =>
                                              setSel((s) => ({
                                                ...s,
                                                rx: {
                                                  ...s.rx,
                                                  [eye === "od"
                                                    ? "addOd"
                                                    : "addOs"]: v,
                                                },
                                              }))
                                            }
                                            placeholder={t("wiz.rx.select")}
                                            searchPlaceholder={t(
                                              "wiz.rx.searchAdd",
                                            )}
                                            contentLang={contentLang}
                                            invalid={
                                              showRxErrors &&
                                              !(eye === "od"
                                                ? sel.rx.addOd
                                                : sel.rx.addOs)
                                            }
                                          />
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                  {/* PD row inside the table */}
                                  <tr className="border-t border-border">
                                    <td className="px-3 py-2.5 font-medium text-foreground/80 bg-muted/30 align-middle">
                                      <div className="text-sm font-semibold">
                                        PD
                                      </div>
                                      <div className="text-[11px] text-muted-foreground">
                                        {t("wiz.rx.pupillary")}
                                      </div>
                                    </td>
                                    <td
                                      colSpan={
                                        sel.category === "progressive" ||
                                        sel.category === "readingCustom"
                                          ? 4
                                          : 3
                                      }
                                      className="px-2 py-2 align-middle border-l border-border"
                                    >
                                      <div className="flex flex-wrap items-center gap-3">
                                        {!sel.rx.dualPd ? (
                                          <div className="w-[140px]">
                                            <RxField
                                              values={PD_VALUES}
                                              value={sel.rx.pd}
                                              onChange={(v) =>
                                                setSel((s) => ({
                                                  ...s,
                                                  rx: { ...s.rx, pd: v },
                                                }))
                                              }
                                              placeholder="63"
                                              searchPlaceholder={t(
                                                "wiz.rx.searchPd",
                                              )}
                                              contentLang={contentLang}
                                              invalid={
                                                showRxErrors && !sel.rx.pd
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <>
                                            <div className="w-[140px]">
                                              <RxField
                                                values={HALF_PD_VALUES}
                                                value={sel.rx.pdRight}
                                                onChange={(v) =>
                                                  setSel((s) => ({
                                                    ...s,
                                                    rx: { ...s.rx, pdRight: v },
                                                  }))
                                                }
                                                placeholder={t(
                                                  "wiz.rx.rightPd",
                                                )}
                                                searchPlaceholder={t(
                                                  "wiz.rx.searchPd",
                                                )}
                                                contentLang={contentLang}
                                                invalid={
                                                  showRxErrors &&
                                                  !sel.rx.pdRight
                                                }
                                              />
                                            </div>
                                            <div className="w-[140px]">
                                              <RxField
                                                values={HALF_PD_VALUES}
                                                value={sel.rx.pdLeft}
                                                onChange={(v) =>
                                                  setSel((s) => ({
                                                    ...s,
                                                    rx: { ...s.rx, pdLeft: v },
                                                  }))
                                                }
                                                placeholder={t("wiz.rx.leftPd")}
                                                searchPlaceholder={t(
                                                  "wiz.rx.searchPd",
                                                )}
                                                contentLang={contentLang}
                                                invalid={
                                                  showRxErrors && !sel.rx.pdLeft
                                                }
                                              />
                                            </div>
                                          </>
                                        )}
                                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={sel.rx.dualPd}
                                            onChange={(e) =>
                                              setSel((s) => ({
                                                ...s,
                                                rx: {
                                                  ...s.rx,
                                                  dualPd: e.target.checked,
                                                },
                                              }))
                                            }
                                            className="w-4 h-4 accent-primary"
                                          />
                                          {t("wiz.rx.twoPdNumbers")}
                                        </label>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile-only stacked layout — same data, friendlier on narrow screens */}
                            <div className="sm:hidden space-y-3">
                              {(["od", "os"] as const).map((eye) => {
                                const cylVal = sel.rx[`${eye}Cyl`];
                                const axisDisabled =
                                  !cylVal || parseFloat(cylVal) === 0;
                                const axisVal = sel.rx[`${eye}Axis`];
                                const axisNum = axisVal
                                  ? parseInt(axisVal, 10)
                                  : NaN;
                                const axisOutOfRange =
                                  !!axisVal &&
                                  (isNaN(axisNum) ||
                                    axisNum < 1 ||
                                    axisNum > 180);
                                const axisInvalid =
                                  !axisDisabled &&
                                  (axisOutOfRange ||
                                    (showRxErrors && !axisVal));
                                return (
                                  <div
                                    key={eye}
                                    className="rounded-xl border border-border bg-background overflow-hidden"
                                  >
                                    <div className="bg-muted/40 px-3 py-2 flex items-baseline gap-2 border-b border-border">
                                      <span className="text-sm font-semibold text-foreground">
                                        {eye === "od" ? "OD" : "OS"}
                                      </span>
                                      <span className="text-[11px] text-muted-foreground">
                                        {eye === "od"
                                          ? t("wiz.rx.right")
                                          : t("wiz.rx.left")}
                                      </span>
                                    </div>
                                    <div className="p-3 space-y-2.5">
                                      <div className="grid grid-cols-[56px_1fr] items-center gap-3">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                          SPH
                                        </span>
                                        <RxField
                                          values={SPH_VALUES}
                                          divider="SPH(+/-)"
                                          value={sel.rx[`${eye}Sph`]}
                                          onChange={(v) => {
                                            const isPlano =
                                              !!v && parseFloat(v) === 0;
                                            setSel((s) => ({
                                              ...s,
                                              rx: {
                                                ...s.rx,
                                                [`${eye}Sph`]: v,
                                                ...(isPlano
                                                  ? {
                                                      [`${eye}Cyl`]: "0.00",
                                                      [`${eye}Axis`]: "",
                                                    }
                                                  : {}),
                                              },
                                            }));
                                          }}
                                          placeholder={t("wiz.rx.select")}
                                          searchPlaceholder={t(
                                            "wiz.rx.searchSph",
                                          )}
                                          contentLang={contentLang}
                                          zeroLabel="PL"
                                          invalid={
                                            showRxErrors && !sel.rx[`${eye}Sph`]
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-[56px_1fr] items-center gap-3">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                          CYL
                                        </span>
                                        <RxField
                                          values={CYL_VALUES}
                                          value={sel.rx[`${eye}Cyl`]}
                                          onChange={(v) => {
                                            const cleared =
                                              !v || parseFloat(v) === 0;
                                            setSel((s) => ({
                                              ...s,
                                              rx: {
                                                ...s.rx,
                                                [`${eye}Cyl`]: v,
                                                ...(cleared
                                                  ? { [`${eye}Axis`]: "" }
                                                  : {}),
                                              },
                                            }));
                                          }}
                                          placeholder={t("wiz.rx.select")}
                                          searchPlaceholder={t(
                                            "wiz.rx.searchCyl",
                                          )}
                                          contentLang={contentLang}
                                          zeroLabel="DS"
                                          invalid={
                                            showRxErrors && !sel.rx[`${eye}Cyl`]
                                          }
                                        />
                                      </div>
                                      <div className="grid grid-cols-[56px_1fr] items-center gap-3">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                          AXIS
                                        </span>
                                        <input
                                          type="number"
                                          inputMode="numeric"
                                          min={1}
                                          max={180}
                                          step={1}
                                          disabled={axisDisabled}
                                          value={axisVal}
                                          placeholder={
                                            axisDisabled ? "—" : "1–180"
                                          }
                                          onChange={(e) => {
                                            const raw = e.target.value.replace(
                                              /[^\d]/g,
                                              "",
                                            );
                                            setSel((s) => ({
                                              ...s,
                                              rx: {
                                                ...s.rx,
                                                [`${eye}Axis`]: raw,
                                              },
                                            }));
                                          }}
                                          className={`w-full h-10 px-2.5 rounded-lg border-2 bg-background text-sm text-center tabular-nums transition-colors outline-none ${
                                            axisDisabled
                                              ? "opacity-50 bg-muted/40 cursor-not-allowed border-border"
                                              : axisInvalid
                                                ? "border-destructive hover:border-destructive focus:border-destructive"
                                                : "border-border hover:border-primary/60 focus:border-primary"
                                          }`}
                                        />
                                      </div>
                                      {(sel.category === "progressive" ||
                                        sel.category === "readingCustom") && (
                                        <div className="grid grid-cols-[56px_1fr] items-center gap-3">
                                          <span className="text-xs font-semibold text-muted-foreground">
                                            ADD
                                          </span>
                                          <RxField
                                            values={ADD_VALUES_PROG}
                                            value={
                                              eye === "od"
                                                ? sel.rx.addOd
                                                : sel.rx.addOs
                                            }
                                            onChange={(v) =>
                                              setSel((s) => ({
                                                ...s,
                                                rx: {
                                                  ...s.rx,
                                                  [eye === "od"
                                                    ? "addOd"
                                                    : "addOs"]: v,
                                                },
                                              }))
                                            }
                                            placeholder={t("wiz.rx.select")}
                                            searchPlaceholder={t(
                                              "wiz.rx.searchAdd",
                                            )}
                                            contentLang={contentLang}
                                            invalid={
                                              showRxErrors &&
                                              !(eye === "od"
                                                ? sel.rx.addOd
                                                : sel.rx.addOs)
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* PD card */}
                              <div className="rounded-xl border border-border bg-background overflow-hidden">
                                <div className="bg-muted/40 px-3 py-2 flex items-baseline gap-2 border-b border-border">
                                  <span className="text-sm font-semibold text-foreground">
                                    PD
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {t("wiz.rx.pupillary")}
                                  </span>
                                </div>
                                <div className="p-3 space-y-3">
                                  {!sel.rx.dualPd ? (
                                    <RxField
                                      values={PD_VALUES}
                                      value={sel.rx.pd}
                                      onChange={(v) =>
                                        setSel((s) => ({
                                          ...s,
                                          rx: { ...s.rx, pd: v },
                                        }))
                                      }
                                      placeholder="63"
                                      searchPlaceholder={t("wiz.rx.searchPd")}
                                      contentLang={contentLang}
                                      invalid={showRxErrors && !sel.rx.pd}
                                    />
                                  ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                      <RxField
                                        values={HALF_PD_VALUES}
                                        value={sel.rx.pdRight}
                                        onChange={(v) =>
                                          setSel((s) => ({
                                            ...s,
                                            rx: { ...s.rx, pdRight: v },
                                          }))
                                        }
                                        placeholder={t("wiz.rx.rightPd")}
                                        searchPlaceholder={t("wiz.rx.searchPd")}
                                        contentLang={contentLang}
                                        invalid={
                                          showRxErrors && !sel.rx.pdRight
                                        }
                                      />
                                      <RxField
                                        values={HALF_PD_VALUES}
                                        value={sel.rx.pdLeft}
                                        onChange={(v) =>
                                          setSel((s) => ({
                                            ...s,
                                            rx: { ...s.rx, pdLeft: v },
                                          }))
                                        }
                                        placeholder={t("wiz.rx.leftPd")}
                                        searchPlaceholder={t("wiz.rx.searchPd")}
                                        contentLang={contentLang}
                                        invalid={showRxErrors && !sel.rx.pdLeft}
                                      />
                                    </div>
                                  )}
                                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={sel.rx.dualPd}
                                      onChange={(e) =>
                                        setSel((s) => ({
                                          ...s,
                                          rx: {
                                            ...s.rx,
                                            dualPd: e.target.checked,
                                          },
                                        }))
                                      }
                                      className="w-4 h-4 accent-primary shrink-0"
                                    />
                                    <span>{t("wiz.rx.twoPdNumbers")}</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </>

                          {/* Extra options */}
                          {isLoggedIn && (
                            <div className="mt-5 flex flex-col gap-2.5">
                              <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-foreground">
                                <input
                                  type="checkbox"
                                  checked={saveRx}
                                  onChange={(e) => setSaveRx(e.target.checked)}
                                  className="w-4 h-4 accent-primary"
                                />
                                {t("wiz.rx.savePrescription")}
                              </label>
                            </div>
                          )}

                          <p className="mt-4 text-[11px] text-muted-foreground">
                            {t("wiz.rx.responsibility")}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* ============ STEP — INDEX ============ */}
              {showStep("index") && (
                <section>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visibleIndexes.map((oBase) => {
                      const active = sel.index === oBase.id;
                      // Marginal cost of upgrading the index axis, holding
                      // function (already chosen) fixed. Base = cheapest SKU
                      // with the chosen function — so the function step's
                      // upcharge isn't re-counted here. The cheapest index for
                      // the chosen function comes out as "Included".
                      const o = haveCatalog
                        ? (() => {
                            const cents = indexAvailability.get(
                              oBase.id,
                            )?.minCents;
                            const fnBaseCents = minRetailCents(skusForFunction);
                            const delta =
                              cents != null && fnBaseCents != null
                                ? Math.max(0, centsToUsd(cents - fnBaseCents))
                                : 0;
                            return { ...oBase, extra: delta };
                          })()
                        : oBase;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setSel((s) => ({ ...s, index: o.id }))}
                          className={`relative text-left rounded-2xl border-2 p-5 transition-smooth ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"}`}
                        >
                          <div className="flex items-baseline justify-between mb-2">
                            <h4 className="font-semibold text-lg">
                              {o.id} {t("wiz.label.indexWord")}
                            </h4>
                            <span className="text-sm font-semibold text-primary">
                              {o.extra === 0
                                ? t("wiz.label.included")
                                : `+$${o.extra}`}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {pickLang(o.label, contentLang)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pickLang(o.thinness, contentLang)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ============ STEP — FUNCTION ============ */}
              {showStep("function") && (
                <section>
                  <div className="flex flex-col gap-3">
                    {visibleFunctionCards
                      .map((card) => {
                        // Resolve the design metadata for each in-stock card.
                        // Variant-bearing functions (Photochromic) flatten into
                        // one sibling card per variant. Price + colors come from
                        // SKUs when the catalog is ready, else static design data.
                        const parent = LENS_FUNCTIONS.find(
                          (f) => f.id === card.parentId,
                        )!;
                        const variant = card.variantId
                          ? parent.variants?.find(
                              (v) => v.id === card.variantId,
                            )
                          : undefined;
                        const skuColors = haveCatalog
                          ? colorsForFunctionCard(card.parentId, card.variantId)
                          : null;
                        const fnMinCents = haveCatalog
                          ? (functionAvailability.get(card.key)?.minCents ??
                            null)
                          : null;
                        const fnExtra =
                          haveCatalog &&
                          fnMinCents != null &&
                          baseRetailCents != null
                            ? Math.max(
                                0,
                                centsToUsd(fnMinCents - baseRetailCents),
                              )
                            : (variant?.extra ?? parent.extra);
                        const priceLabel =
                          haveCatalog && fnMinCents != null
                            ? fnMinCents === 0
                              ? t("wiz.label.included")
                              : `$${centsToUsd(fnMinCents)}`
                            : fnExtra === 0
                              ? t("wiz.label.included")
                              : `+$${fnExtra}`;
                        return {
                          key: card.key,
                          parentId: card.parentId,
                          variantId: card.variantId,
                          label: variant ? variant.label : parent.label,
                          desc: variant ? variant.desc : parent.desc,
                          extra: fnExtra,
                          priceLabel,
                          colors: skuColors ?? variant?.colors ?? parent.colors,
                          icon: parent.icon,
                        };
                      })
                      .map((f) => {
                        const active =
                          sel.lensFunctionId === f.parentId &&
                          (f.variantId
                            ? sel.lensFunctionVariantId === f.variantId
                            : !sel.lensFunctionVariantId);
                        const Icon = f.icon;
                        const pickFn = () =>
                          setSel((s) => ({
                            ...s,
                            lensFunctionId: f.parentId,
                            lensFunctionVariantId: f.variantId,
                            lensFunctionColorId: f.colors
                              ? f.colors[0].id
                              : undefined,
                          }));
                        return (
                          <div
                            key={f.key}
                            className={`rounded-2xl border-2 transition-smooth ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"}`}
                          >
                            <button
                              type="button"
                              onClick={pickFn}
                              className="w-full text-left p-5"
                            >
                              <div className="flex items-start gap-4">
                                <span
                                  className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl ${active ? "bg-primary/15 text-primary" : "bg-secondary text-foreground/70"}`}
                                >
                                  <Icon size={20} />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold mb-1">
                                    {pickLang(f.label, contentLang)}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {pickLang(f.desc, contentLang)}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-primary shrink-0">
                                  {f.priceLabel}
                                </span>
                              </div>

                              {/* Direct color swatches (non-variant functions) — always visible */}
                              {f.colors && (
                                <div className="mt-4 pl-[60px] flex flex-wrap items-center gap-2">
                                  {f.colors.map((c) => {
                                    const on =
                                      active &&
                                      sel.lensFunctionColorId === c.id;
                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        title={pickLang(c.label, contentLang)}
                                        aria-label={pickLang(
                                          c.label,
                                          contentLang,
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSel((s) => ({
                                            ...s,
                                            lensFunctionId: f.parentId,
                                            lensFunctionVariantId: f.variantId,
                                            lensFunctionColorId: c.id,
                                          }));
                                        }}
                                        className={`w-7 h-7 rounded-full border-2 transition-smooth ${on ? "border-primary scale-110 shadow-soft" : "border-border hover:border-primary/50"}`}
                                        style={{ backgroundColor: c.hex }}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* ============ STEP — REVIEW ============ */}
              {showStep("viewArea") && (
                <section>
                  <div className="flex flex-col gap-3">
                    {visibleViewAreas.map((vBase) => {
                      const active = sel.viewAreaId === vBase.id;
                      // Marginal cost on the view-area axis, holding the
                      // user's already-chosen function + index fixed. Base =
                      // cheapest SKU at (function, index); the cheapest view
                      // area at that point comes out as "Included".
                      const v = haveCatalog
                        ? (() => {
                            const cents = viewAreaAvailability.get(
                              vBase.id,
                            )?.minCents;
                            const idxBaseCents = minRetailCents(
                              matchSkus(skusForFunction, {
                                refractiveIndex: indexIdToNumber(sel.index),
                              }),
                            );
                            const delta =
                              cents != null && idxBaseCents != null
                                ? Math.max(0, centsToUsd(cents - idxBaseCents))
                                : 0;
                            return { ...vBase, extra: delta };
                          })()
                        : vBase;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            setSel((s) => ({ ...s, viewAreaId: v.id }))
                          }
                          className={`text-left rounded-2xl border-2 p-5 transition-smooth ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"}`}
                        >
                          <div className="flex items-start gap-4">
                            <span
                              className={`shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-full border-2 ${active ? "border-primary text-primary" : "border-border text-foreground/60"}`}
                            >
                              <Eye className="w-6 h-6" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold mb-1">
                                {pickLang(v.label, contentLang)}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {pickLang(v.desc, contentLang)}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-sm font-semibold text-primary">
                                {v.extra === 0
                                  ? t("wiz.label.free")
                                  : `+$${v.extra.toFixed(2)}`}
                              </div>
                            </div>
                            <div
                              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-smooth ${active ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                            >
                              {active && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ============ STEP — REVIEW ============ */}
              {!isFrameOnly && showStep("review") && (
                <section>
                  <div className="rounded-2xl border border-border overflow-hidden bg-card/60">
                    <div className="p-5 flex items-center gap-4 border-b border-border">
                      <div className="w-20 h-20 rounded-xl bg-secondary/50 shrink-0 overflow-hidden">
                        <img
                          src={activeColor.framePng}
                          alt=""
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {pickLang(product.name, contentLang)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {shapeLabel(product.shape, t)} ·{" "}
                          {materialLabel(product.material, t)}
                        </p>
                      </div>
                      <span className="font-semibold">${product.priceUSD}</span>
                    </div>

                    <div className="divide-y divide-border">
                      <SummaryLine
                        label={t("wiz.review.frameColor")}
                        value={localizeColorName(
                          activeColor.label.en,
                          pickLang(activeColor.label, contentLang),
                        )}
                      />
                      <SummaryLine
                        label={t("wiz.review.lensType")}
                        value={
                          isReading
                            ? `${t("wiz.review.readingGlasses")} · ${pickLang(READING_MODES.find((m) => m.id === sel.category)!.label, contentLang)}`
                            : pickLang(
                                CATEGORIES.find((c) => c.id === sel.category)!
                                  .label,
                                contentLang,
                              )
                        }
                      />
                      <SummaryLine
                        label={t("wiz.review.lensPrice")}
                        value={`$${lensPriceUsd}`}
                      />
                      {/* Only show per-axis rows for axes the wizard actually
                          asked about. Auto-skipped axes (≤1 in-stock option)
                          are hidden — showing them is misleading because (a)
                          the user never chose, and (b) per-axis deltas all
                          measure the same lensExtra and triple-count. */}
                      {stepKinds.includes("index") && (
                        <SummaryLine
                          label={t("wiz.review.lensIndex")}
                          value={`${sel.index} ${t("wiz.label.indexWord")}`}
                          extra={indexExtra}
                        />
                      )}
                      {stepKinds.includes("function") && (
                        <SummaryLine
                          label={t("wiz.review.lensFunction")}
                          value={(() => {
                            const f = LENS_FUNCTIONS.find(
                              (x) => x.id === sel.lensFunctionId,
                            )!;
                            const v = f.variants?.find(
                              (x) => x.id === sel.lensFunctionVariantId,
                            );
                            // Colors: SKU lens_colors_json when the catalog is ready,
                            // otherwise the design's static swatches.
                            const skuColors = haveCatalog
                              ? colorsForFunctionCard(
                                  sel.lensFunctionId,
                                  sel.lensFunctionVariantId,
                                )
                              : null;
                            const colorList =
                              skuColors ?? v?.colors ?? f.colors;
                            const c = colorList?.find(
                              (x) => x.id === sel.lensFunctionColorId,
                            );
                            const parts = [
                              v
                                ? pickLang(v.label, contentLang)
                                : pickLang(f.label, contentLang),
                            ];
                            if (c) parts.push(pickLang(c.label, contentLang));
                            return parts.join(" · ");
                          })()}
                          extra={functionExtra}
                        />
                      )}
                      {isProgressive && stepKinds.includes("viewArea") && (
                        <SummaryLine
                          label={t("wiz.review.viewArea")}
                          value={pickLang(
                            VIEW_AREAS.find((v) => v.id === sel.viewAreaId)!
                              .label,
                            contentLang,
                          )}
                          extra={viewAreaExtra}
                        />
                      )}
                      {sel.category !== "plano" && (
                        // Same prescription summary regardless of how the user
                        // got there (manual entry vs upload-then-OCR). Upload
                        // no longer persists the file, only the values.
                        <SummaryLine
                          label={t("wiz.review.prescription")}
                          value={(() => {
                            const pdStr = sel.rx.dualPd
                              ? `R ${sel.rx.pdRight || "—"}/L ${sel.rx.pdLeft || "—"}`
                              : sel.rx.pd;
                            return sel.category === "readingReady"
                              ? `${t("wiz.review.ou")} ${sel.rx.readingOd || "—"}`
                              : sel.category === "readingCustom"
                                ? `OD ${sel.rx.odSph || "0"}/${sel.rx.odCyl || "—"}/${sel.rx.odAxis || "—"} · OS ${sel.rx.osSph || "0"}/${sel.rx.osCyl || "—"}/${sel.rx.osAxis || "—"} · ADD OD ${sel.rx.addOd || "—"}/OS ${sel.rx.addOs || "—"} · PD ${pdStr}`
                                : `OD ${sel.rx.odSph || "0"}/${sel.rx.odCyl || "—"}/${sel.rx.odAxis || "—"} · OS ${sel.rx.osSph || "0"}/${sel.rx.osCyl || "—"}/${sel.rx.osAxis || "—"}${sel.category === "progressive" ? ` · ADD OD ${sel.rx.addOd || "—"}/OS ${sel.rx.addOs || "—"}` : ""} · PD ${pdStr}`;
                          })()}
                        />
                      )}
                    </div>

                    <div className="p-5 bg-secondary/30 flex items-baseline justify-between">
                      <span className="text-base font-semibold">
                        {t("wiz.label.total")}
                      </span>
                      <span className="text-2xl font-bold">${total}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-dashed border-border p-4 flex items-start gap-3 text-xs text-muted-foreground">
                    <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p>{t("wiz.review.nextToCart")}</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-border shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-0.5">
                {t("wiz.label.subtotal")}
              </p>
              <p className="text-xl sm:text-3xl font-bold tracking-tight">
                ${total}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {step === 1 ? (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full h-11 sm:h-12 px-3 sm:px-5 shrink-0"
                  aria-label={t("wiz.btn.close")}
                >
                  <X className="w-4 h-4 sm:mr-1" />{" "}
                  <span className="hidden sm:inline">{t("wiz.btn.close")}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={back}
                  className="rounded-full h-11 sm:h-12 px-3 sm:px-5 shrink-0"
                  aria-label={t("wiz.btn.back")}
                >
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />{" "}
                  <span className="hidden sm:inline">{t("wiz.btn.back")}</span>
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  onClick={next}
                  disabled={!isFrameOnly && catalogState !== "ready"}
                  className="rounded-full h-11 sm:h-12 px-4 sm:px-6 shadow-soft shrink-0 whitespace-nowrap"
                >
                  {t("wiz.btn.continue")}{" "}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={finish}
                  disabled={!isFrameOnly && catalogState !== "ready"}
                  className="rounded-full h-11 sm:h-12 px-4 sm:px-6 shadow-soft shrink-0 whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4 mr-2 shrink-0" />{" "}
                  {t("wiz.btn.addToCart")} · ${total}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <h3 className="font-semibold font-display">{title}</h3>
      <p className="text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          muted ? "text-muted-foreground" : "text-foreground font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  extra,
}: {
  label: string;
  value: string;
  extra?: number;
}) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right break-words">
        {value}
        {extra !== undefined && extra > 0 && (
          <span className="text-primary ml-2">+${extra}</span>
        )}
      </span>
    </div>
  );
}

// Max width of the RxField dropdown panel. The rx table column can be wide on
// desktop; a number picker ("-0.75" / "搜索 SPH") never needs more than this,
// so the panel is capped instead of stretching to the trigger's full width.
const RX_DROPDOWN_MAX_W = 260;

// Searchable, grouped prescription field — used for SPH/CYL/AXIS/ADD/PD.
function RxField({
  values,
  divider,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  disabled,
  contentLang,
  pinnedValues,
  pinnedLabel,
  zeroLabel,
  invalid,
}: {
  values: string[];
  divider?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  contentLang: "zh" | "en";
  pinnedValues?: string[];
  pinnedLabel?: string;
  zeroLabel?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    width: number;
    placement: "down" | "up";
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Anchor the dropdown to the trigger via fixed positioning: it escapes the
  // prescription table's overflow clipping without covering the whole screen.
  useEffect(() => {
    if (!open) return;
    const position = () => {
      const trigger = wrapRef.current;
      if (!trigger) return;
      const r = trigger.getBoundingClientRect();
      const PANEL_MAX_H = 320; // header + search + max-h-56 list
      const minW = Math.min(Math.max(r.width, 176), RX_DROPDOWN_MAX_W);
      const spaceBelow = window.innerHeight - r.bottom;
      const placement =
        spaceBelow < PANEL_MAX_H && r.top > spaceBelow ? "up" : "down";
      setCoords({
        left: Math.min(Math.max(8, r.left), window.innerWidth - minW - 8),
        top: placement === "down" ? r.bottom + 6 : r.top - 6,
        width: r.width,
        placement,
      });
    };
    position();
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    // Close on genuine page scroll / resize, but ignore scroll events that
    // bubble up (capture phase) from the dropdown's own list — notably the
    // programmatic `scrollTop` that centers the selected item on open, which
    // would otherwise slam the panel shut the instant it appears.
    const onReflow = (e: Event) => {
      if (e.type === "scroll" && panelRef.current?.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setHovered(null);
    setQuery("");
    // Center the selected item (or 0.00 fallback) in the dropdown viewport.
    const id = requestAnimationFrame(() => {
      const list = listRef.current;
      const item = activeRef.current;
      if (!list || !item) return;
      const target =
        item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
      list.scrollTop = Math.max(0, target);
    });
    return () => cancelAnimationFrame(id);
  }, [open, coords]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const q = query.trim().toLowerCase();
  const zeroAltLabel = zeroLabel === "DS" ? "SPH/DS" : zeroLabel;
  const matches = (v: string) => {
    if (!q) return true;
    if (v.toLowerCase().includes(q)) return true;
    // Zero value also matches its alternative label (e.g. "PL" finds 0.00 in SPH,
    // "SPH/DS" or "DS" finds 0.00 in CYL).
    if (
      zeroAltLabel &&
      Math.abs(parseFloat(v)) < 1e-9 &&
      (v === "0.00" || v === "0")
    ) {
      if (zeroAltLabel.toLowerCase().includes(q)) return true;
    }
    return false;
  };
  const filteredPinned = (pinnedValues ?? []).filter(matches);
  const pinnedSet = new Set(pinnedValues ?? []);
  const filteredValues = values.filter((v) => matches(v) && !pinnedSet.has(v));

  return (
    <div ref={wrapRef} className="relative w-full min-w-[120px]">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className={`flex items-center justify-between w-full h-10 px-2.5 rounded-lg border-2 bg-background text-sm transition-colors ${
          open
            ? "border-primary"
            : invalid && !disabled
              ? "border-destructive"
              : "border-border"
        } ${
          disabled
            ? "opacity-50 bg-muted/40 cursor-not-allowed"
            : invalid
              ? "hover:border-destructive"
              : "hover:border-primary/60"
        }`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value
            ? zeroAltLabel && parseFloat(value) === 0
              ? `${zeroAltLabel} (${value})`
              : value
            : (placeholder ?? "—")}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {open &&
        !disabled &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              left: coords.left,
              top: coords.top,
              minWidth: Math.min(
                Math.max(coords.width, 176),
                RX_DROPDOWN_MAX_W,
              ),
              maxWidth: RX_DROPDOWN_MAX_W,
              transform:
                coords.placement === "up" ? "translateY(-100%)" : undefined,
            }}
            className="fixed z-[100] max-w-[90vw] rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95"
          >
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {(() => {
                  const shown = hovered || value || "";
                  if (shown && zeroAltLabel && parseFloat(shown) === 0) {
                    return `${zeroAltLabel} (${shown})`;
                  }
                  return shown || placeholder || t("wiz.select.placeholder");
                })()}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground text-base leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="px-2 py-1.5 border-b border-border">
              {/* No autoFocus: on mobile it raises the soft keyboard the
                  instant the panel opens, which scrolls the wizard's
                  overflow container, which fires the capture-phase scroll
                  listener and slams the panel shut. Users tap the box to
                  filter when they want. */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder ?? t("wiz.select.search")}
                className="w-full h-8 px-2 text-sm rounded-md border border-border bg-background outline-none focus:border-primary"
              />
            </div>
            <div ref={listRef} className="max-h-56 overflow-auto py-1">
              {filteredPinned.length > 0 && (
                <>
                  {pinnedLabel && (
                    <div className="px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                      {pinnedLabel}
                    </div>
                  )}
                  {filteredPinned.map((v) => {
                    const selected = v === value;
                    return (
                      <button
                        type="button"
                        key={`pin-${v}`}
                        onMouseEnter={() => setHovered(v)}
                        onMouseLeave={() =>
                          setHovered((h) => (h === v ? null : h))
                        }
                        onClick={() => {
                          onChange(v);
                          setOpen(false);
                        }}
                        className={`w-full text-center px-[3px] py-1.5 text-sm tabular-nums transition-colors hover:bg-accent bg-muted/40 ${
                          selected
                            ? "bg-[#F0F7FF] text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                  <div className="h-px bg-border my-1" />
                </>
              )}
              {filteredValues.map((v, idx) => {
                const num = parseFloat(v);
                const prevNum =
                  idx > 0 ? parseFloat(filteredValues[idx - 1]) : null;
                const showDivider =
                  !!divider && prevNum !== null && prevNum <= 0 && num > 0;
                const selected = v === value;
                const isZero =
                  Math.abs(num) < 1e-9 && (v === "0.00" || v === "0");
                const isActive = value ? selected : isZero;
                const isMergedZero = isZero && !!zeroAltLabel;
                const label = isMergedZero ? `${zeroAltLabel} (${v})` : v;
                return (
                  <React.Fragment key={v}>
                    {showDivider && (
                      <div className="px-2 py-1">
                        <div className="h-px bg-border" />
                      </div>
                    )}
                    <button
                      type="button"
                      ref={isActive ? activeRef : undefined}
                      onMouseEnter={() => setHovered(v)}
                      onMouseLeave={() =>
                        setHovered((h) => (h === v ? null : h))
                      }
                      onClick={() => {
                        onChange(v);
                        setOpen(false);
                      }}
                      className={`w-full text-center px-[3px] py-1.5 text-sm tabular-nums transition-colors hover:bg-accent ${
                        selected
                          ? "bg-[#F0F7FF] text-primary font-semibold"
                          : isMergedZero
                            ? "bg-muted/50 font-medium text-foreground"
                            : "text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  </React.Fragment>
                );
              })}
              {filteredValues.length === 0 && filteredPinned.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {t("wiz.select.noMatches")}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

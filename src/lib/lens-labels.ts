// Display labels for the wizard's LensCategory ids stored on cart rows
// (`CartItem.lens.type`). Kept in a tiny module so cart / checkout don't pull
// the whole LensFlowWizard bundle just to render a label. Strings mirror the
// CATEGORIES / READING_MODES labels in LensFlowWizard.tsx — keep in sync.
import type { Lang } from "@/lib/i18n";

type T = Record<Lang, string>;

const LENS_CATEGORY_LABELS: Record<string, T> = {
  single: {
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
  progressive: {
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
  readingReady: {
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
  readingCustom: {
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
  plano: {
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
};

/** Localized label for a cart row's lens type; unknown values pass through. */
export function lensCategoryLabel(type: string, lang: Lang): string {
  const row = LENS_CATEGORY_LABELS[type];
  return row ? (row[lang] ?? row.en) : type;
}

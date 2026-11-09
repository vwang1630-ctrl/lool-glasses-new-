// /$lang/blog/ — blog index (SSR ItemList JSON-LD + D1-first post list).
// Reads from D1 blog_posts first; falls back to src/data/blog-posts.ts when
// the table is empty or unbound.

import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { createServerFn } from "@tanstack/react-start";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { pickLang, parseLangJson } from "@/lib/lang";
import { JsonLd } from "@/lib/jsonld";
import { LangLink } from "@/components/LangLink";
import { pageTitle } from "@/lib/page-titles";
import imgAurora from "@/assets/gallery/tortoise-angle.jpg";
import imgHalo from "@/assets/gallery/gold-side.jpg";
import imgStyle1 from "@/assets/hero-2.jpg";
import imgIris from "@/assets/gallery/tortoise-folded.jpg";
import imgFaceShape from "@/assets/cat-myopia.jpg";
import imgBrand from "@/assets/banner-bestsellers.jpg";
import imgNoir from "@/assets/gallery/black-angle.jpg";
import imgStyle2 from "@/assets/hero-3.jpg";
import imgCare from "@/assets/frame-side-view.jpg";
import imgLumen from "@/assets/gallery/gold-folded.jpg";
import { STATIC_BLOG_POSTS } from "@/data/blog-posts";

const SITE = "https://loollook.com";

type DbRow = {
  id: string;
  slug: string;
  cover_image_url: string;
  title_json: string | null;
  content_json: string | null;
  published_at: number;
};

/** Extract the first <p>...</p> from an HTML string for use as a listing excerpt.
 *  Falls back to a 200-char plain-text snippet when no <p> tag is found. */
function extractFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (match) return match[0];
  // Fallback: strip all tags and truncate
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text.length > 200 ? text.slice(0, 200) + "…" : text;
}

const fetchBlogIndex = createServerFn({ method: "GET" }).handler(async () => {
  // 1) Try D1 first.
  try {
    const { getDB } = await import("@/server/db");
    const db = getDB();
    const res = await db
      .prepare(
        `SELECT id, slug, cover_image_url, title_json, content_json, published_at
           FROM blog_posts
          WHERE active = 1
          ORDER BY sort_order, published_at DESC, id`,
      )
      .all<DbRow>();
    const dbPosts = (res.results ?? []).map((r) => {
      const content = parseLangJson(r.content_json);
      const excerpt: Record<string, string> = {};
      for (const [lang, body] of Object.entries(content)) {
        if (typeof body === "string" && body) {
          excerpt[lang] = extractFirstParagraph(body);
        }
      }
      return {
        image: r.cover_image_url,
        date: formatApiDate(r.published_at),
        tag: null,
        title: parseLangJson(r.title_json),
        excerpt,
        content,
        slug: r.slug,
      };
    });
    if (dbPosts.length > 0) return { db: true, posts: dbPosts };
  } catch {
    // D1 unavailable locally or unbound — fall through to static registry.
  }

  // 2) Static fallback: priority-1 article + hardcoded examples.
  const staticArticle =
    STATIC_BLOG_POSTS["best-reading-glasses-45-professionals-2026"];
  const articlePost: Post | null = staticArticle
    ? {
        image: staticArticle.coverImageUrl,
        date: formatApiDate(staticArticle.publishedAt),
        tag: TAGS.styleGuide,
        title: staticArticle.title as Record<Lang, string>,
        excerpt: staticArticle.excerpt as Record<Lang, string>,
        content: staticArticle.excerpt as Record<Lang, string>,
        slug: staticArticle.slug,
      }
    : null;
  return { db: false, posts: articlePost ? [articlePost, ...POSTS] : POSTS };
});

export const Route = createFileRoute("/$lang/blog/")({
  loader: async () => fetchBlogIndex(),
  head: ({ loaderData, params }) => {
    const posts = loaderData?.posts ?? [];
    return {
      meta: [
        { title: pageTitle("blog", params.lang) },
        {
          name: "description",
          content:
            pageDesc("blog", params.lang),
        },
        { property: "og:description", content: pageOgDesc("blog", params.lang) },
        { name: "twitter:description", content: pageOgDesc("blog", params.lang) },
      ],
    };
  },
  component: BlogPage,
});

// ---------- post tag translations ----------
// Six reusable tags. Defined once and referenced by posts below so a single
// tag rename propagates everywhere.
const TAGS = {
  newLaunch: {
    en: "New Launch",
    zh: "新品发布",
    es: "Estreno",
    fr: "Nouveauté",
    de: "Neuheit",
    it: "Novità",
    pt: "Lançamento",
    ja: "新作",
    ko: "신제품",
    ar: "إصدار جديد",
    vi: "Ra mắt mới",
    th: "เปิดตัวใหม่",
    id: "Peluncuran Baru",
    ms: "Pelancaran Baharu",
  },
  designNotes: {
    en: "Design Notes",
    zh: "新品设计",
    es: "Notas de diseño",
    fr: "Notes de design",
    de: "Design-Notizen",
    it: "Note di design",
    pt: "Notas de design",
    ja: "デザインノート",
    ko: "디자인 노트",
    ar: "ملاحظات التصميم",
    vi: "Ghi chú thiết kế",
    th: "บันทึกดีไซน์",
    id: "Catatan Desain",
    ms: "Nota Reka Bentuk",
  },
  styleGuide: {
    en: "Style Guide",
    zh: "穿搭灵感",
    es: "Estilo",
    fr: "Style",
    de: "Style-Guide",
    it: "Stile",
    pt: "Estilo",
    ja: "スタイル",
    ko: "스타일",
    ar: "دليل الستايل",
    vi: "Gợi ý phong cách",
    th: "ไกด์สไตล์",
    id: "Panduan Gaya",
    ms: "Panduan Gaya",
  },
  faceShape: {
    en: "Face Shape",
    zh: "脸型指南",
    es: "Tipo de rostro",
    fr: "Forme du visage",
    de: "Gesichtsform",
    it: "Forma del viso",
    pt: "Tipo de rosto",
    ja: "顔型",
    ko: "얼굴형",
    ar: "شكل الوجه",
    vi: "Dáng mặt",
    th: "รูปหน้า",
    id: "Bentuk Wajah",
    ms: "Bentuk Muka",
  },
  brandStory: {
    en: "Brand Story",
    zh: "品牌故事",
    es: "Historia de marca",
    fr: "Histoire de marque",
    de: "Markengeschichte",
    it: "Storia del brand",
    pt: "História da marca",
    ja: "ブランドストーリー",
    ko: "브랜드 스토리",
    ar: "قصة العلامة",
    vi: "Câu chuyện thương hiệu",
    th: "เรื่องราวแบรนด์",
    id: "Cerita Brand",
    ms: "Kisah Jenama",
  },
  careTips: {
    en: "Care Tips",
    zh: "护理贴士",
    es: "Cuidados",
    fr: "Entretien",
    de: "Pflege-Tipps",
    it: "Cura",
    pt: "Cuidados",
    ja: "お手入れ",
    ko: "관리 팁",
    ar: "نصائح للعناية",
    vi: "Mẹo bảo quản",
    th: "เคล็ดลับดูแล",
    id: "Tips Perawatan",
    ms: "Tip Penjagaan",
  },
} as const satisfies Record<string, Record<Lang, string>>;

type Post = {
  image: string;
  date: string;
  /** null when the post comes from admin/D1 (tag system only applies to legacy静态示例). */
  tag: Record<Lang, string> | null;
  title: Record<Lang, string>;
  /** Short HTML excerpt (first paragraph) for listing preview. */
  excerpt: Record<Lang, string>;
  content: Record<Lang, string>;
  /** Optional slug for linking to the dedicated /blog/$slug article page. */
  slug?: string;
};

const POSTS: Post[] = [
  {
    image: imgAurora,
    date: "2026.05.12",
    tag: TAGS.newLaunch,
    title: {
      en: "Aurora Tortoise: 18g of Everyday Lightness",
      zh: "Aurora 玳瑁圆框：18g 的日常轻盈",
      es: "Aurora carey: 18 g de ligereza diaria",
      fr: "Aurora écaille : 18 g de légèreté au quotidien",
      de: "Aurora Schildpatt: 18 g Alltagsleichtigkeit",
      it: "Aurora tartaruga: 18 g di leggerezza quotidiana",
      pt: "Aurora tartaruga: 18 g de leveza no dia a dia",
      ja: "Aurora べっ甲：日常を軽くする 18g",
      ko: "Aurora 호크스빌: 일상을 가볍게, 단 18g",
      ar: "Aurora السلحفاة: 18 جرامًا من خفة كل يوم",
      vi: "Aurora đồi mồi: 18g nhẹ tênh mỗi ngày",
      th: "Aurora ลายกระ: เบาเพียง 18 กรัมในทุกวัน",
      id: "Aurora Tortoise: 18g Ringan Setiap Hari",
      ms: "Aurora Tortoise: 18g Ringan untuk Setiap Hari",
    },
    content: {
      en: "Our new acetate Aurora series launches today at just 18g. Vintage round meets modern silhouette, with β-titanium spring hinges that stay comfortable all day and grippy silicone nose pads that don't slide in summer. Available in classic tortoise, smoke clear and champagne gold — online and in stores now.",
      zh: "全新醋酸纤维系列 Aurora 正式上市，整副重量仅 18g，复古圆框搭配现代廓形。镜腿采用 β-钛弹簧铰链，长时间佩戴不夹太阳穴；鼻托内嵌防滑硅胶，夏天出汗也不下滑。配色提供经典玳瑁、烟灰透明与香槟金三款，通勤、约会、咖啡馆都合适。即日起在全部线上线下门店开售。",
      es: "Estrenamos hoy la nueva serie de acetato Aurora con solo 18 g. Forma redonda vintage con silueta moderna, bisagras de muelle en titanio β cómodas todo el día y plaquetas de silicona antideslizantes que no resbalan en verano. Disponible en carey clásico, transparente humo y dorado champán — online y en tienda.",
      fr: "Nouvelle collection en acétate Aurora, seulement 18 g. La rondeur vintage rencontre une silhouette moderne, avec des charnières à ressort en titane β confortables toute la journée et des plaquettes en silicone antidérapantes même en été. Disponible en écaille classique, transparent fumé et doré champagne — en ligne et en magasin.",
      de: "Unsere neue Acetat-Serie Aurora startet heute mit nur 18 g. Vintage-Rundform trifft auf moderne Silhouette, β-Titan-Federscharniere für ganztägigen Komfort und rutschfeste Silikon-Nasenpads, die auch im Sommer halten. Erhältlich in klassischem Schildpatt, Rauch-Transparent und Champagner-Gold — online und im Store.",
      it: "La nuova serie in acetato Aurora debutta a soli 18 g. Forma rotonda vintage e silhouette moderna, cerniere a molla in titanio β confortevoli tutto il giorno e nasellini in silicone antiscivolo che tengono anche d'estate. Disponibile in tartaruga classica, fumo trasparente e oro champagne — online e in negozio.",
      pt: "A nova série em acetato Aurora chega hoje com apenas 18 g. Formato redondo vintage com silhueta moderna, dobradiças com mola em titânio β confortáveis o dia todo e plaquetas de silicone antiderrapantes que não escorregam no verão. Disponível em tartaruga clássico, fumê transparente e dourado champanhe — online e nas lojas.",
      ja: "新しいアセテートシリーズ Aurora 本日発売、わずか 18g。クラシックなラウンド形に現代的なシルエット、β チタン製スプリングヒンジで一日中快適、夏でもズレないシリコン製鼻パッド付き。クラシックべっ甲・スモーククリア・シャンパンゴールドの 3 色、オンライン＆店舗で発売中。",
      ko: "새로운 아세테이트 시리즈 Aurora가 단 18g으로 출시되었습니다. 빈티지 라운드 실루엣에 현대적 라인, β-티타늄 스프링 힌지로 하루 종일 편안하고 여름에도 미끄러지지 않는 실리콘 코받침까지. 클래식 호크스빌, 스모크 클리어, 샴페인 골드 3가지 컬러로 온라인과 매장에서 판매 중.",
      ar: "تنطلق اليوم سلسلة الأسيتات الجديدة Aurora بوزن 18 جرامًا فقط. شكل دائري كلاسيكي مع تصميم عصري، ومفصلات زنبركية من التيتانيوم β للراحة طوال اليوم، ووسائد أنف سيليكونية لا تنزلق في الصيف. متوفرة بألوان السلحفاة الكلاسيكي، الدخاني الشفاف والذهبي الشمبانيا — أونلاين وفي المتاجر.",
      vi: "Bộ sưu tập acetate Aurora mới ra mắt hôm nay, chỉ nặng 18g. Form tròn cổ điển hòa quyện cùng đường nét hiện đại, bản lề lò xo titan β êm ái cả ngày và đệm mũi silicone chống trượt không bị tuột vào mùa hè. Có sẵn các màu đồi mồi cổ điển, khói trong suốt và vàng sâm panh — đã có tại web và cửa hàng.",
      th: "คอลเลกชันอะซิเทตใหม่ Aurora เปิดตัววันนี้ น้ำหนักเพียง 18 กรัม ทรงกลมวินเทจผสานเส้นสายโมเดิร์น บานพับสปริงไทเทเนียม β สบายตลอดวัน และที่รองจมูกซิลิโคนกันลื่นไม่หลุดในหน้าร้อน มีให้เลือกสีกระคลาสสิก สโมกใส และทองแชมเปญ — สั่งซื้อออนไลน์และที่ร้านได้แล้ววันนี้",
      id: "Seri asetat baru Aurora hadir hari ini dengan berat hanya 18 g. Bentuk bulat vintage berpadu dengan siluet modern, engsel pegas titanium β yang nyaman seharian, dan bantalan hidung silikon anti-selip yang tidak melorot di musim panas. Tersedia dalam warna tortoise klasik, asap bening, dan emas sampanye — online dan di toko sekarang.",
      ms: "Siri asetat baharu Aurora kini di pasaran, hanya 18g. Bentuk bulat vintaj berpadu siluet moden, dengan engsel spring titanium β yang selesa sepanjang hari dan pad hidung silikon anti-gelincir yang tidak terlucut walau musim panas. Tersedia dalam warna tortoise klasik, asap jernih dan emas champagne — dalam talian dan di kedai sekarang.",
    },
  },
  {
    image: imgHalo,
    date: "2026.05.04",
    tag: TAGS.designNotes,
    title: {
      en: "Halo Titanium Aviator: Designer's Notebook",
      zh: "Halo 钛金属飞行员：设计师手记",
      es: "Halo Aviator de titanio: cuaderno del diseñador",
      fr: "Halo Aviator en titane : carnet du designer",
      de: "Halo Titan-Aviator: Notizen des Designers",
      it: "Halo Aviator in titanio: il quaderno del designer",
      pt: "Halo Aviator de titânio: caderno do designer",
      ja: "Halo チタン・アビエーター：デザイナーズノート",
      ko: "Halo 티타늄 에이비에이터: 디자이너 노트",
      ar: "Halo أفياتور التيتانيوم: دفتر المصمم",
      vi: "Halo Aviator titan: Sổ tay nhà thiết kế",
      th: "Halo Aviator ไทเทเนียม: สมุดบันทึกของดีไซเนอร์",
      id: "Halo Aviator Titanium: Buku Catatan Desainer",
      ms: "Halo Aviator Titanium: Buku Nota Pereka",
    },
    content: {
      en: "From 47 prototypes to the final shape — eight months in pursuit of one perfect aviator. A 0.8mm curve at the rim decides whether it looks iconic or cheap; the bridge moved from 18 to 16 and back to 17 for Asian nose fit. A designer's note on restraint.",
      zh: "从 47 版打样到最终成型——为什么我们花了 8 个月只为做对一副飞行员。镜框边缘 0.8mm 的弧度差，决定了它戴上去是经典还是廉价；鼻梁桥的宽度从 18 调到 16 再回到 17，只为亚洲鼻型贴合。这是一篇关于「克制」的设计手记。",
      es: "De 47 prototipos a la forma final — ocho meses tras un aviador perfecto. Una curva de 0,8 mm en el borde decide si parece icónico o barato; el puente pasó de 18 a 16 y volvió a 17 para ajustar al rostro asiático. Notas de un diseñador sobre la contención.",
      fr: "De 47 prototypes à la forme finale — huit mois pour un seul aviator parfait. Une courbe de 0,8 mm au cerclage décide entre l'iconique et le bas de gamme ; le pont est passé de 18 à 16 puis à 17 pour épouser le visage asiatique. Notes d'un designer sur la retenue.",
      de: "Von 47 Prototypen bis zur finalen Form — acht Monate für eine einzige perfekte Aviator. Eine Wölbung von 0,8 mm am Rand entscheidet zwischen Ikone und Billigware; der Steg wanderte von 18 zu 16 und zurück auf 17 für asiatische Gesichtsform. Notizen eines Designers über Zurückhaltung.",
      it: "Da 47 prototipi alla forma definitiva — otto mesi per un solo aviator perfetto. Una curvatura di 0,8 mm sul bordo decide tra iconico e dozzinale; il ponte è passato da 18 a 16 e poi a 17 per adattarsi al volto asiatico. Note di un designer sulla misura.",
      pt: "De 47 protótipos à forma final — oito meses em busca de um aviator perfeito. Uma curva de 0,8 mm na borda decide entre icônico e barato; a ponte passou de 18 para 16 e voltou para 17 para se ajustar ao nariz asiático. Notas de um designer sobre contenção.",
      ja: "47 版の試作から最終形まで——たった一本のアビエーターのために 8 ヶ月。リム端の 0.8mm のカーブが「クラシック」か「安っぽい」かを分ける。ブリッジ幅は 18 から 16、再び 17 へ、アジア人の鼻型にフィットさせるため。「引き算」についてのデザインノート。",
      ko: "47번의 시제품을 거쳐 최종 형태에 도달하기까지 — 단 하나의 완벽한 에이비에이터를 위해 8개월. 림 가장자리의 0.8mm 곡선이 클래식과 싸구려를 가른다. 브리지는 18에서 16으로, 다시 17로 — 아시아 코에 맞추기 위해. 절제에 대한 디자이너의 노트.",
      ar: "من 47 نموذجًا أوليًا حتى الشكل النهائي — ثمانية أشهر سعيًا لأفياتور واحد مثالي. انحناءة 0.8 ملم عند الحافة تقرر إن كان كلاسيكيًا أم رخيصًا؛ تحرّك الجسر من 18 إلى 16 ثم عاد إلى 17 ليناسب الأنف الآسيوي. ملاحظات مصمم عن الانضباط.",
      vi: "Từ 47 nguyên mẫu đến dáng cuối cùng — tám tháng cho một chiếc aviator hoàn hảo. Độ cong 0,8mm ở viền quyết định trông biểu tượng hay rẻ tiền; cầu mũi đi từ 18 xuống 16 rồi quay lại 17 để vừa với khuôn mặt châu Á. Một ghi chú của nhà thiết kế về sự tiết chế.",
      th: "จาก 47 ต้นแบบสู่รูปทรงสุดท้าย — แปดเดือนเพื่อตามหาทรงนักบินที่สมบูรณ์แบบ ความโค้ง 0.8 มม. ที่ขอบกรอบเป็นตัวตัดสินว่าจะดูคลาสสิกหรือราคาถูก สะพานจมูกขยับจาก 18 ไป 16 และกลับมาเป็น 17 เพื่อให้พอดีกับโครงหน้าเอเชีย บันทึกของดีไซเนอร์ว่าด้วยการรู้จักยับยั้ง",
      id: "Dari 47 prototipe ke bentuk akhir — delapan bulan demi satu aviator sempurna. Lengkungan 0,8 mm di tepi menentukan apakah terlihat ikonik atau murahan; jembatan hidung digeser dari 18 ke 16 dan kembali ke 17 agar pas dengan wajah Asia. Catatan desainer tentang menahan diri.",
      ms: "Dari 47 prototaip ke bentuk akhir — lapan bulan mengejar satu aviator yang sempurna. Lengkungan 0.8mm di tepi menentukan sama ada ia kelihatan ikonik atau murahan; jejambat hidung berubah dari 18 ke 16 dan kembali ke 17 demi muka Asia. Nota pereka tentang sikap berhati-hati.",
    },
  },
  {
    image: imgStyle1,
    date: "2026.04.28",
    tag: TAGS.styleGuide,
    title: {
      en: "5 Summer Commute Looks: Frames × Shirts",
      zh: "夏日通勤 5 套搭配：眼镜 × 衬衫",
      es: "5 looks para el verano: monturas × camisas",
      fr: "5 looks d'été : montures × chemises",
      de: "5 Sommer-Outfits: Brille × Hemd",
      it: "5 look estivi: montature × camicie",
      pt: "5 looks de verão: armações × camisas",
      ja: "夏の通勤 5 コーデ：メガネ × シャツ",
      ko: "여름 출근 5룩: 안경 × 셔츠",
      ar: "5 إطلالات صيفية: نظارات × قمصان",
      vi: "5 set đồ đi làm mùa hè: gọng × áo sơ mi",
      th: "5 ลุคเดินทางหน้าร้อน: กรอบแว่น × เสื้อเชิ้ต",
      id: "5 Look Komuter Musim Panas: Frame × Kemeja",
      ms: "5 Gaya Berulang-alik Musim Panas: Bingkai × Kemeja",
    },
    content: {
      en: "Linen shirt with tortoise rounds — gentle but never stuffy. White polo with matte black squares — clean and sharp. Silk shirt with thin gold wire — instant polish. Five copy-ready commute looks for Monday through Friday.",
      zh: "亚麻衬衫配玳瑁圆框，斯文不古板；白色 Polo 配哑光黑方框，干净利落；丝质衬衫配金丝细框，把整套造型完成度直接拉满。本文给你 5 套从周一到周五都能直接抄的通勤搭配。",
      es: "Camisa de lino con monturas redondas de carey — elegante sin parecer rígido. Polo blanco con cuadradas negras mate — limpio y definido. Camisa de seda con varilla dorada fina — pulido al instante. Cinco looks listos para copiar, de lunes a viernes.",
      fr: "Chemise en lin et rondes écaille — élégant sans être guindé. Polo blanc et carrées noires mates — net et tranchant. Chemise en soie et fil d'or fin — sophistication immédiate. Cinq looks de la semaine à copier-coller.",
      de: "Leinenhemd mit Schildpatt-Rundbrille — sanft, nie steif. Weißes Polo mit matt-schwarzem Quadrat — klar und scharf. Seidenhemd mit feiner Goldlinie — sofortiger Schliff. Fünf direkt kopierbare Looks für Montag bis Freitag.",
      it: "Camicia di lino con rotonde tartaruga — elegante senza essere rigido. Polo bianca con quadrate nere opache — pulito e netto. Camicia di seta con filo d'oro sottile — eleganza immediata. Cinque look pronti da copiare, da lunedì a venerdì.",
      pt: "Camisa de linho com redondas em tartaruga — elegante sem ser duro. Polo branca com quadradas em preto fosco — limpa e marcante. Camisa de seda com fio dourado fino — sofisticação imediata. Cinco looks prontos para copiar, de segunda a sexta.",
      ja: "リネンシャツにべっ甲ラウンド——きちんとしているのに堅くない。白ポロにマットブラックのスクエア——シンプルでシャープ。シルクシャツに細いゴールド——一気に格上げ。月曜から金曜までそのまま使える 5 コーデ。",
      ko: "린넨 셔츠에 호크스빌 라운드 — 단정하지만 답답하지 않게. 화이트 폴로에 매트 블랙 스퀘어 — 깔끔하고 또렷하게. 실크 셔츠에 얇은 골드 와이어 — 완성도 단숨에. 월요일부터 금요일까지 그대로 따라 할 수 있는 5가지 룩.",
      ar: "قميص كتاني مع إطار دائري لون السلحفاة — أنيق دون تكلف. بولو أبيض مع إطار مربع أسود مطفي — نظيف وحاد. قميص حرير مع سلك ذهبي رفيع — لمسة فاخرة فورية. خمس إطلالات جاهزة للتقليد من الإثنين إلى الجمعة.",
      vi: "Áo lanh với gọng tròn đồi mồi — nhẹ nhàng mà không cứng nhắc. Polo trắng với gọng vuông đen mờ — sạch và sắc. Áo lụa với khung kim loại vàng mảnh — sang trọng tức thì. Năm bộ đi làm sẵn sàng cho cả tuần.",
      th: "เสื้อลินินกับกรอบกลมลายกระ — ดูสุภาพแต่ไม่อึดอัด เสื้อโปโลขาวกับกรอบเหลี่ยมดำด้าน — สะอาดและคม เสื้อเชิ้ตผ้าไหมกับเส้นทองบาง — เพิ่มความเนี้ยบทันที ห้าลุคทำงานพร้อมเลียนแบบตั้งแต่จันทร์ถึงศุกร์",
      id: "Kemeja linen dengan frame bulat tortoise — kalem tapi tidak kaku. Polo putih dengan kotak hitam doff — bersih dan tegas. Kemeja sutra dengan kawat emas tipis — langsung tampil rapi. Lima look komuter siap pakai untuk Senin sampai Jumat.",
      ms: "Kemeja linen dengan bingkai bulat tortoise — lembut tetapi tidak kaku. Polo putih dengan bingkai segi empat hitam matte — bersih dan tajam. Kemeja sutera dengan wayar emas halus — terus kemas. Lima gaya berulang-alik untuk Isnin hingga Jumaat.",
    },
  },
  {
    image: imgIris,
    date: "2026.04.20",
    tag: TAGS.newLaunch,
    title: {
      en: "Iris Tortoise Round: The Vintage Return",
      zh: "Iris 玳瑁圆框：复古回归",
      es: "Iris carey redonda: el regreso vintage",
      fr: "Iris ronde écaille : le retour vintage",
      de: "Iris Schildpatt rund: das Vintage-Comeback",
      it: "Iris tartaruga tonda: il ritorno vintage",
      pt: "Iris tartaruga redonda: o regresso vintage",
      ja: "Iris べっ甲ラウンド：ヴィンテージの再来",
      ko: "Iris 호크스빌 라운드: 빈티지의 귀환",
      ar: "Iris دائري لون السلحفاة: عودة الفنتاج",
      vi: "Iris đồi mồi tròn: Sự trở lại của phong cách cổ điển",
      th: "Iris ทรงกลมลายกระ: การกลับมาของวินเทจ",
      id: "Iris Tortoise Round: Kembalinya Vintage",
      ms: "Iris Tortoise Round: Kepulangan Vintaj",
    },
    content: {
      en: "Classic tortoise pattern meets modern lightweight build — a tribute to '70s round-frame elegance. Hand-polished acetate with one-of-a-kind grain on every pair.",
      zh: "经典玳瑁纹路 × 现代轻量结构，致敬 70 年代的圆框美学。手工抛光的醋酸板材，每一副的纹理都独一无二。",
      es: "Patrón clásico de carey con construcción ligera moderna — un homenaje a las redondas de los 70. Acetato pulido a mano, con vetas únicas en cada par.",
      fr: "Motif écaille classique et construction légère moderne — hommage aux rondes des années 70. Acétate poli à la main, avec un grain unique sur chaque paire.",
      de: "Klassisches Schildpatt-Muster trifft auf moderne Leichtbauweise — eine Hommage an die Rundbrillen der 70er. Handpoliertes Acetat mit einzigartiger Maserung an jeder Brille.",
      it: "Pattern tartaruga classico con costruzione leggera moderna — un omaggio alle rotonde degli anni '70. Acetato lucidato a mano, venature uniche su ogni paio.",
      pt: "Padrão clássico de tartaruga com construção leve e moderna — uma homenagem às redondas dos anos 70. Acetato polido à mão, com veios únicos em cada par.",
      ja: "クラシックなべっ甲柄 × 現代の軽量設計——70 年代ラウンドフレームへのオマージュ。手磨きアセテートで、一本一本の柄が唯一無二。",
      ko: "클래식 호크스빌 패턴과 현대적 경량 구조 — 70년대 라운드 프레임에 바치는 헌사. 손으로 광택을 낸 아세테이트, 한 점 한 점 다른 결.",
      ar: "نقش السلحفاة الكلاسيكي مع بنية حديثة خفيفة — تحية للإطارات الدائرية في السبعينيات. أسيتات مصقول يدويًا، بنقش فريد لكل نظارة.",
      vi: "Họa tiết đồi mồi cổ điển kết hợp cấu trúc nhẹ hiện đại — một lờὶ tri ân với gọng tròn thập niên 70. Acetate đánh bóng thủ công, vân nâu độc nhất trên mỗi cặp.",
      th: "ลายกระคลาสสิกผสานโครงสร้างน้ำหนักเบาแบบโมเดิร์น — เป็นการคารวะกรอบกลมยุค 70s อะซิเทตขัดมือ ลายไม่ซ้ำกันในแต่ละคู่",
      id: "Pola tortoise klasik bertemu konstruksi ringan modern — penghormatan untuk bingkai bulat era 70-an. Asetat poles tangan, dengan serat unik di setiap pasangnya.",
      ms: "Corak tortoise klasik bertemu binaan ringan moden — penghormatan kepada bingkai bulat era 70-an. Asetat digilap tangan, dengan ira unik pada setiap pasang.",
    },
  },
  {
    image: imgFaceShape,
    date: "2026.04.12",
    tag: TAGS.faceShape,
    title: {
      en: "Round, Square, Heart: How to Choose Your Frame",
      zh: "圆脸、方脸、心形脸：镜框怎么选",
      es: "Cara redonda, cuadrada, en corazón: cómo elegir la montura",
      fr: "Visage rond, carré, en cœur : comment choisir sa monture",
      de: "Rund, eckig, herzförmig: So findest du die richtige Fassung",
      it: "Viso tondo, squadrato, a cuore: come scegliere la montatura",
      pt: "Rosto redondo, quadrado, em coração: como escolher a armação",
      ja: "丸顔・四角顔・ハート顔：あなたに合うフレーム選び",
      ko: "둥근 얼굴, 각진 얼굴, 하트형: 프레임 고르는 법",
      ar: "وجه دائري ومربع وقلبي: كيف تختار إطارك",
      vi: "Mặt tròn, vuông, trái tim: chọn gọng kính thế nào?",
      th: "หน้ากลม หน้าเหลี่ยม หน้ารูปหัวใจ: เลือกกรอบแว่นยังไง",
      id: "Wajah Bulat, Kotak, Hati: Cara Memilih Frame",
      ms: "Muka Bulat, Persegi, Hati: Cara Memilih Bingkai",
    },
    content: {
      en: "Round faces look best in square frames that elongate; square faces in rounds that soften angles; heart faces in aviators or cat-eyes with a wider lower edge. One article to dodge 90% of frame-picking mistakes.",
      zh: "圆脸适合方框拉长线条；方脸适合圆框柔化轮廓；心形脸适合底部稍宽的飞行员或猫眼。一篇文章看懂脸型与镜框的搭配逻辑，避开 90% 的选镜雷区。",
      es: "Los rostros redondos quedan mejor con monturas cuadradas que alargan; los cuadrados con redondas que suavizan; los corazón con aviadoras o cat-eyes de borde inferior amplio. Un artículo para evitar el 90 % de los errores al elegir.",
      fr: "Les visages ronds gagnent à porter du carré qui allonge ; les visages carrés du rond qui adoucit ; les visages en cœur des aviators ou cat-eyes au bord bas plus large. Un article pour éviter 90 % des erreurs.",
      de: "Runde Gesichter wirken in eckigen Fassungen länger; eckige Gesichter werden durch Rundbrillen weicher; herzförmige Gesichter passen zu Aviator oder Cat-Eye mit breiterem Unterrand. Ein Artikel, der 90 % der Fehlgriffe verhindert.",
      it: "Il viso tondo sta meglio con montature squadrate che allungano; il quadrato con rotonde che ammorbidiscono; il viso a cuore con aviator o cat-eye dal bordo inferiore più largo. Un articolo per evitare il 90 % degli errori.",
      pt: "Rostos redondos pedem armações quadradas que alongam; rostos quadrados, redondas que suavizam; rostos em coração, aviador ou cat-eye com borda inferior mais larga. Um artigo para evitar 90 % dos erros.",
      ja: "丸顔は縦のラインを伸ばすスクエアが似合う。四角顔は輪郭を和らげるラウンドが◎。ハート顔は下辺がやや広いアビエーターやキャットアイがしっくりくる。フレーム選びで失敗する 90% を回避する一本。",
      ko: "둥근 얼굴은 라인을 늘려주는 스퀘어가 좋고, 각진 얼굴은 곡선을 풀어주는 라운드가 어울리며, 하트형은 아래쪽이 넓은 에이비에이터나 캣아이가 맞다. 프레임 고르기 실수의 90%를 피하는 한 편.",
      ar: "الوجه الدائري يبدو أفضل مع إطارات مربعة تطيل الملامح؛ الوجه المربع مع دوائر تليّن الزوايا؛ الوجه القلبي مع أفياتور أو كات-آي بحافة سفلية أعرض. مقال واحد يجنّبك 90% من أخطاء الاختيار.",
      vi: "Mặt tròn hợp gọng vuông để kéo dài; mặt vuông hợp gọng tròn để làm mềm góc cạnh; mặt trái tim hợp aviator hoặc cat-eye có viền dưới rộng. Một bài để tránh 90% lỗi chọn gọng.",
      th: "หน้ากลมเข้ากับกรอบเหลี่ยมที่ช่วยยืดเส้นใบหน้า หน้าเหลี่ยมเข้ากับกรอบกลมที่ช่วยลดมุม หน้ารูปหัวใจเข้ากับทรงนักบินหรือคิตตี้ที่ขอบล่างกว้างกว่า อ่านบทความเดียวเลี่ยงพลาดถึง 90% ตอนเลือกแว่น",
      id: "Wajah bulat paling cocok dengan frame kotak yang memanjangkan; wajah kotak dengan frame bulat yang melembutkan sudut; wajah hati dengan aviator atau cat-eye yang tepi bawahnya lebih lebar. Satu artikel untuk menghindari 90% kesalahan memilih frame.",
      ms: "Muka bulat paling sesuai dengan bingkai segi empat yang memanjangkan; muka segi empat dengan bingkai bulat yang melembutkan sudut; muka hati dengan aviator atau cat-eye yang tepi bawah lebih lebar. Satu artikel untuk elak 90% kesilapan memilih bingkai.",
    },
  },
  {
    image: imgBrand,
    date: "2026.04.05",
    tag: TAGS.brandStory,
    title: {
      en: "Why We Built loollook",
      zh: "为什么我们做 loollook",
      es: "Por qué creamos loollook",
      fr: "Pourquoi nous avons créé loollook",
      de: "Warum wir loollook gegründet haben",
      it: "Perché abbiamo creato loollook",
      pt: "Por que criamos a loollook",
      ja: "なぜ loollook を作ったか",
      ko: "우리가 loollook을 만든 이유",
      ar: "لماذا أنشأنا loollook",
      vi: "Vì sao chúng tôi tạo ra loollook",
      th: "ทำไมเราจึงสร้าง loollook",
      id: "Mengapa Kami Membuat loollook",
      ms: "Mengapa Kami Membina loollook",
    },
    content: {
      en: "Great eyewear shouldn't be a luxury. We want designer frames at the price of a good coffee. From factory-direct supply to in-house logistics, loollook cuts every middleman that doesn't add value.",
      zh: "好看的眼镜不该是奢侈品。我们想让每个人都能用一杯咖啡的钱戴上设计师款。从工厂直供到自营物流，loollook 砍掉了每一个不必要的中间环节。",
      es: "Las buenas gafas no deberían ser un lujo. Queremos diseño al precio de un buen café. De la fábrica al cliente directo y logística propia: loollook elimina cualquier intermediario que no aporte valor.",
      fr: "Les belles lunettes ne devraient pas être un luxe. Du design au prix d'un bon café. De l'usine au client en direct et logistique en interne : loollook supprime tout intermédiaire qui n'apporte rien.",
      de: "Gute Brillen sollten kein Luxus sein. Designer-Fassungen zum Preis eines guten Kaffees. Vom Werk direkt zum Kunden und eigene Logistik — loollook streicht jeden Zwischenhändler, der keinen Mehrwert bringt.",
      it: "Gli occhiali belli non dovrebbero essere un lusso. Design al prezzo di un buon caffè. Direttamente dalla fabbrica e logistica interna: loollook elimina ogni intermediario che non aggiunge valore.",
      pt: "Bons óculos não deveriam ser luxo. Design ao preço de um bom café. Da fábrica direto ao cliente, com logística própria — a loollook corta todo intermediário que não agrega valor.",
      ja: "良いメガネは贅沢品であってはいけない。デザイナーズフレームを、コーヒー 1 杯の値段で。工場直送と自社物流で、価値を生まない中間業者を全部取り除いた——それが loollook。",
      ko: "좋은 안경이 사치품일 필요는 없다. 디자이너 프레임을 커피 한 잔 값으로. 공장 직배송과 자체 물류로, 가치를 더하지 않는 중간 단계는 모두 빼버렸다 — 그게 loollook.",
      ar: "النظارات الجيدة لا يجب أن تكون رفاهية. نريد إطارات بتصميم راقٍ بسعر فنجان قهوة جيد. من المصنع مباشرة إلى العميل ومع لوجستيات داخلية — loollook تحذف أي وسيط لا يضيف قيمة.",
      vi: "Một chiếc kính đẹp không nên là thứ xa xỉ. Chúng tôi muốn gọng thiết kế ở giá một tách cà phê ngon. Từ nguồn trực tiếp nhà máy đến vận hành nội bộ, loollook cắt mọi khâu trung gian không tạo ra giá trị.",
      th: "แว่นดีๆ ไม่ควรเป็นของหรูหรา เราอยากให้กรอบดีไซเนอร์อยู่ในราคากาแฟดีๆ หนึ่งแก้ว ตั้งแต่ซัพพลายตรงจากโรงงานจนถึงโลจิสติกส์ภายใน loollook ตัดทุกคนกลางที่ไม่สร้างมูลค่าทิ้ง",
      id: "Kacamata bagus tidak seharusnya jadi barang mewah. Kami ingin frame desainer di harga secangkir kopi yang baik. Dari pasokan langsung pabrik hingga logistik internal, loollook memotong setiap perantara yang tidak menambah nilai.",
      ms: "Cermin mata yang baik tidak sepatutnya menjadi barang mewah. Kami mahu bingkai pereka pada harga secawan kopi yang elok. Dari pembekal langsung kilang hingga logistik dalaman, loollook memotong setiap orang tengah yang tidak menambah nilai.",
    },
  },
  {
    image: imgNoir,
    date: "2026.03.28",
    tag: TAGS.designNotes,
    title: {
      en: "Noir Matte Black: The Power of Restraint",
      zh: "Noir 哑光黑：克制的力量",
      es: "Noir negro mate: la fuerza de la contención",
      fr: "Noir noir mat : la force de la retenue",
      de: "Noir Mattschwarz: die Kraft der Zurückhaltung",
      it: "Noir nero opaco: la forza della misura",
      pt: "Noir preto fosco: a força da contenção",
      ja: "Noir マットブラック：引き算の力",
      ko: "Noir 매트 블랙: 절제의 힘",
      ar: "Noir الأسود المطفي: قوة الانضباط",
      vi: "Noir đen mờ: Sức mạnh của sự tiết chế",
      th: "Noir ดำด้าน: พลังของการรู้จักยับยั้ง",
      id: "Noir Matte Black: Kekuatan Penahan Diri",
      ms: "Noir Matte Black: Kekuatan Sikap Berhati-hati",
    },
    content: {
      en: "No logo, no ornament, no excess lines — every gram of effort went into silhouette and balance. Noir is for those who don't need the brand to be seen.",
      zh: "无 logo、无装饰、无多余线条——把所有功夫都花在轮廓与重量上。Noir 是给那些不需要被认出品牌的人。",
      es: "Sin logo, sin adornos, sin líneas de más — cada gramo de esfuerzo fue para la silueta y el equilibrio. Noir es para quien no necesita que se vea la marca.",
      fr: "Pas de logo, pas d'ornement, pas de ligne en trop — chaque gramme d'effort a été investi dans la silhouette et l'équilibre. Noir est pour ceux qui n'ont pas besoin que la marque se voie.",
      de: "Kein Logo, kein Schmuck, keine überflüssigen Linien — jeder Aufwand floss in Silhouette und Balance. Noir ist für alle, die die Marke nicht zeigen müssen.",
      it: "Niente logo, niente decori, niente linee in più — ogni grammo di lavoro è andato nella silhouette e nell'equilibrio. Noir è per chi non ha bisogno che il brand si veda.",
      pt: "Sem logo, sem ornamento, sem linhas a mais — cada grama de esforço foi para a silhueta e o equilíbrio. Noir é para quem não precisa que a marca apareça.",
      ja: "ロゴなし、装飾なし、余計なラインなし——労力はすべて輪郭と重量バランスに費やした。Noir は、ブランドを見せる必要がない人のためのフレーム。",
      ko: "로고도, 장식도, 군더더기 라인도 없다 — 모든 공은 실루엣과 균형에 들어갔다. Noir는 브랜드를 굳이 드러낼 필요 없는 사람들을 위한 프레임.",
      ar: "بلا شعار، بلا زخارف، بلا خطوط زائدة — كل غرام من الجهد ذهب إلى الشكل والتوازن. Noir لمن لا يحتاج أن يُرى اسم العلامة.",
      vi: "Không logo, không trang trí, không đường thừa — toàn bộ công sức dồn vào đường nét và sự cân bằng. Noir dành cho ngườ̀i không cần thương hiệu phải lộ ra.",
      th: "ไม่มีโลโก้ ไม่มีของประดับ ไม่มีเส้นเกินจำเป็น — ทุ่มทุกแรงงานไปกับโครงและสมดุล Noir สำหรับคนที่ไม่จำเป็นต้องโชว์แบรนด์",
      id: "Tanpa logo, tanpa ornamen, tanpa garis berlebih — setiap gram usaha pergi ke siluet dan keseimbangan. Noir untuk mereka yang tidak butuh brand-nya kelihatan.",
      ms: "Tiada logo, tiada hiasan, tiada garisan berlebihan — setiap gram usaha dicurahkan ke siluet dan keseimbangan. Noir untuk mereka yang tidak perlu jenama mereka kelihatan.",
    },
  },
  {
    image: imgStyle2,
    date: "2026.03.20",
    tag: TAGS.styleGuide,
    title: {
      en: "Campus to Commute: One Frame, Two Worlds",
      zh: "校园风 × 通勤风：一镜两戴",
      es: "Del campus a la oficina: una sola montura, dos mundos",
      fr: "Du campus au bureau : une seule monture, deux mondes",
      de: "Von Campus zu Office: eine Fassung, zwei Welten",
      it: "Dal campus all'ufficio: una sola montatura, due mondi",
      pt: "Do campus ao escritório: uma armação, dois mundos",
      ja: "キャンパスからオフィスまで：1 本のフレームで二役",
      ko: "캠퍼스에서 사무실까지: 한 프레임, 두 세계",
      ar: "من الحرم الجامعي إلى العمل: إطار واحد بعالمين",
      vi: "Từ giảng đường đến công sở: một gọng kính, hai thế giới",
      th: "จากแคมปัสสู่ออฟฟิศ: กรอบเดียวสองโลก",
      id: "Kampus ke Kantor: Satu Frame, Dua Dunia",
      ms: "Kampus ke Pejabat: Satu Bingkai, Dua Dunia",
    },
    content: {
      en: "Switch seamlessly between weekend campus vibe and weekday office mode with the same pair. The trick is neutrality — not too vintage, not too edgy, just versatile enough to cross contexts.",
      zh: "周末校园穿搭与平日通勤造型，如何用同一副镜框无缝切换。关键在镜框的「中性度」——不太复古、不太前卫，才能跨场景。",
      es: "El mismo par para el rollo campus del fin de semana y el modo oficina entre semana. El truco es la neutralidad — ni demasiado vintage, ni demasiado atrevido, sino versátil para cruzar contextos.",
      fr: "La même paire pour l'ambiance campus du week-end et le mode bureau en semaine. L'astuce, c'est la neutralité — ni trop vintage, ni trop pointu, juste assez polyvalent.",
      de: "Mit ein und derselben Brille vom Wochenend-Campus zum Büromodus. Der Trick ist Neutralität — nicht zu vintage, nicht zu kantig, einfach vielseitig genug für beide Welten.",
      it: "Stesso paio per il vibe campus del weekend e il mood ufficio in settimana. Il segreto è la neutralità — non troppo vintage, non troppo audace, solo abbastanza versatile.",
      pt: "O mesmo par para o clima campus do fim de semana e o modo escritório durante a semana. O segredo é a neutralidade — nem muito vintage, nem muito ousada, só versátil o bastante.",
      ja: "週末のキャンパスコーデと平日のオフィスモード、同じ 1 本でシームレスに切り替える。ポイントは「中庸」——古すぎず、尖りすぎず、シーンを跨げる絶妙のバランス。",
      ko: "주말 캠퍼스 분위기와 평일 사무실 모드를 같은 프레임으로 매끄럽게 오간다. 핵심은 중립감 — 너무 빈티지하지도, 너무 모험적이지도 않게, 어느 자리에든 어울리게.",
      ar: "نفس النظارة من أجواء الحرم الجامعي في عطلة الأسبوع إلى وضع العمل في الأسبوع. السر في الحياد — ليست فنتاج زيادة، ولا جريئة زيادة، فقط مرنة بما يكفي لتنتقل بين السياقات.",
      vi: "Chuyển mượt mà giữa vibe giảng đường cuối tuần và chế độ công sở giữa tuần chỉ với một cặp gọng. Bí quyết là sự trung tính — không quá cổ điển, không quá phá cách, đủ linh hoạt để băng qua mọi bối cảnh.",
      th: "สลับลื่นไหลระหว่างวันหยุดในแคมปัสกับโหมดออฟฟิศวันธรรมดาในกรอบเดียวกัน เคล็ดลับคือความเป็นกลาง — ไม่วินเทจเกินไป ไม่จัดจ้านเกินไป แค่ครอบคลุมพอที่จะเปลี่ยนสถานการณ์ได้",
      id: "Beralih mulus antara vibe kampus akhir pekan dan mode kantor hari kerja dengan satu kacamata. Triknya adalah netralitas — tidak terlalu vintage, tidak terlalu edgy, cukup serbaguna untuk lintas konteks.",
      ms: "Tukar lancar antara vibe kampus hujung minggu dan mod pejabat hari biasa dengan satu pasang. Rahsianya adalah neutraliti — tidak terlalu vintaj, tidak terlalu tajam, hanya cukup serba boleh.",
    },
  },
  {
    image: imgCare,
    date: "2026.03.14",
    tag: TAGS.careTips,
    title: {
      en: "5 Common Mistakes When Cleaning Lenses",
      zh: "镜片清洁的 5 个常见错误",
      es: "5 errores comunes al limpiar las lentes",
      fr: "5 erreurs courantes pour nettoyer ses verres",
      de: "5 typische Fehler beim Reinigen der Brillengläser",
      it: "5 errori comuni nella pulizia delle lenti",
      pt: "5 erros comuns ao limpar as lentes",
      ja: "レンズ掃除のよくある 5 つの間違い",
      ko: "렌즈 닦을 때 흔히 하는 5가지 실수",
      ar: "5 أخطاء شائعة عند تنظيف العدسات",
      vi: "5 lỗi thường gặp khi lau kính",
      th: "5 ข้อผิดพลาดที่พบบ่อยตอนเช็ดเลนส์",
      id: "5 Kesalahan Umum Saat Membersihkan Lensa",
      ms: "5 Kesilapan Biasa Semasa Membersih Lensa",
    },
    content: {
      en: "Wiping with your shirt? Rinsing with hot water? Dry-wiping with tissues? These habits kill your lens coating. The right way: lukewarm water, a drop of mild dish soap, microfiber cloth.",
      zh: "用衣角擦镜片?热水冲一冲?用纸巾干擦?这些习惯正在毁掉你的镜片镀膜。正确做法:温水 + 一滴中性洗洁精 + 超细纤维布。",
      es: "¿Limpiar con la camisa? ¿Enjuagar con agua caliente? ¿Frotar en seco con pañuelos? Estos hábitos arruinan el tratamiento de las lentes. Lo correcto: agua tibia, una gota de jabón neutro y paño de microfibra.",
      fr: "Essuyer avec son t-shirt ? Rincer à l'eau chaude ? Frotter à sec avec un mouchoir ? Ces habitudes tuent le traitement des verres. Le bon geste : eau tiède, une goutte de liquide vaisselle doux, chiffon microfibre.",
      de: "Mit dem Hemd abwischen? Mit heißem Wasser abspülen? Trocken mit Taschentuch reiben? Diese Gewohnheiten zerstören die Glasbeschichtung. Richtig: lauwarmes Wasser, ein Tropfen mildes Spülmittel, Mikrofasertuch.",
      it: "Pulire con la camicia? Sciacquare con acqua calda? Strofinare a secco con i fazzoletti? Queste abitudini distruggono il trattamento delle lenti. Modo giusto: acqua tiepida, una goccia di detersivo neutro, panno in microfibra.",
      pt: "Limpar com a camisa? Enxaguar com água quente? Esfregar com lenço de papel? Esses hábitos destroem o tratamento das lentes. O jeito certo: água morna, uma gota de detergente neutro e flanela de microfibra.",
      ja: "シャツの裾で拭く？お湯ですすぐ？ティッシュで乾拭き？これらの習慣がコーティングを壊しています。正解は、ぬるま湯 + 中性洗剤一滴 + マイクロファイバークロス。",
      ko: "셔츠 자락으로 닦기? 뜨거운 물로 헹구기? 휴지로 마른 닦기? 이런 습관이 렌즈 코팅을 망친다. 올바른 방법: 미온수 + 중성세제 한 방울 + 극세사 천.",
      ar: "تمسحها بقميصك؟ تشطفها بماء ساخن؟ تمسحها بالمحارم وهي جافة؟ هذه العادات تقتل طبقة العدسة. الطريقة الصحيحة: ماء فاتر، قطرة من سائل غسيل لطيف، وقطعة قماش ميكروفايبر.",
      vi: "Lau bằng vạt áo? Tráng nước nóng? Chùi khô bằng giấy ăn? Những thói quen này phá lớp phủ tròng kính. Cách đúng: nước ấm vừa, một giọt nước rửa chén dịu nhẹ, khăn microfiber.",
      th: "เช็ดด้วยชายเสื้อ? ล้างน้ำร้อน? เช็ดแห้งด้วยทิชชู่? นิสัยเหล่านี้ทำลายชั้นเคลือบเลนส์ของคุณ วิธีที่ถูก: น้ำอุ่น น้ำยาล้างจานอ่อนหยดเดียว และผ้าไมโครไฟเบอร์",
      id: "Mengelap dengan baju? Membilas dengan air panas? Menggosok kering dengan tisu? Kebiasaan ini merusak coating lensa Anda. Cara yang benar: air hangat, satu tetes sabun cuci piring lembut, kain microfiber.",
      ms: "Lap dengan baju? Bilas dengan air panas? Sapu kering dengan tisu? Tabiat ini merosakkan lapisan lensa anda. Cara yang betul: air suam, setitik cecair pencuci pinggan yang lembut, kain microfiber.",
    },
  },
  {
    image: imgLumen,
    date: "2026.03.06",
    tag: TAGS.newLaunch,
    title: {
      en: "Lumen Clear Square: Office-Friendly",
      zh: "Lumen 透明方框:办公室友好",
      es: "Lumen cuadrada transparente: amiga de la oficina",
      fr: "Lumen carrée transparente : adaptée au bureau",
      de: "Lumen Quadrat Transparent: bürofreundlich",
      it: "Lumen squadrata trasparente: amica dell'ufficio",
      pt: "Lumen quadrada transparente: amiga do escritório",
      ja: "Lumen クリアスクエア：オフィス向け",
      ko: "Lumen 클리어 스퀘어: 사무실 친화적",
      ar: "Lumen المربع الشفاف: مناسبة للمكتب",
      vi: "Lumen vuông trong suốt: thân thiện với văn phòng",
      th: "Lumen ทรงเหลี่ยมใส: เป็นมิตรกับออฟฟิศ",
      id: "Lumen Clear Square: Ramah Kantor",
      ms: "Lumen Clear Square: Mesra Pejabat",
    },
    content: {
      en: "TR90 lightweight build plus blue-light filter — long screen days, zero fatigue. The clear frame pairs with any skin tone and hair color.",
      zh: "TR90 轻量结构 + 蓝光防护,长时间面对屏幕也不再疲惫。透明镜框百搭任何肤色与发色。",
      es: "Construcción ligera en TR90 con filtro de luz azul — jornadas largas frente a la pantalla sin fatiga. La montura transparente combina con cualquier tono de piel y de pelo.",
      fr: "Construction légère en TR90 et filtre lumière bleue — longues journées devant l'écran, zéro fatigue. La monture transparente s'accorde à toutes les carnations et toutes les couleurs de cheveux.",
      de: "Leichtbau aus TR90 plus Blaulichtfilter — lange Bildschirmtage, null Ermüdung. Die transparente Fassung passt zu jedem Hauttyp und jeder Haarfarbe.",
      it: "Costruzione leggera in TR90 con filtro luce blu — lunghe giornate davanti allo schermo senza fatica. La montatura trasparente si abbina a qualsiasi incarnato e colore di capelli.",
      pt: "Construção leve em TR90 com filtro de luz azul — longos dias de tela sem cansaço. A armação transparente combina com qualquer tom de pele e cor de cabelo.",
      ja: "TR90 軽量設計 + ブルーライトカット——長時間の画面作業でも疲れにくい。透明フレームは肌色・髪色を問わず合わせやすい。",
      ko: "TR90 경량 구조에 블루라이트 차단 — 긴 화면 작업에도 피로감 없이. 투명 프레임은 어떤 피부톤·머리색에도 잘 어울린다.",
      ar: "بنية خفيفة من TR90 مع فلتر للضوء الأزرق — أيام طويلة أمام الشاشة دون إرهاق. الإطار الشفاف يتناسب مع أي لون بشرة وشعر.",
      vi: "Cấu trúc TR90 nhẹ cùng kính lọc ánh sáng xanh — cả ngày trước màn hình mà không mỏi. Gọng trong suốt hợp với mọi tông da và màu tóc.",
      th: "โครงสร้าง TR90 น้ำหนักเบาพร้อมเลนส์กรองแสงสีฟ้า — ทำงานหน้าจอทั้งวันก็ไม่ล้า กรอบใสเข้ากับทุกสีผิวและทุกสีผม",
      id: "Konstruksi ringan TR90 plus filter cahaya biru — hari panjang di depan layar, tanpa lelah. Frame bening cocok untuk semua warna kulit dan rambut.",
      ms: "Binaan ringan TR90 dengan penapis cahaya biru — hari panjang di hadapan skrin, tanpa rasa lelah. Bingkai jernih sesuai dengan semua warna kulit dan rambut.",
    },
  },
];

function formatApiDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function BlogPage() {
  const { lang, t } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { posts: displayPosts } = Route.useLoaderData();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: displayPosts
      .filter((p) => p.slug)
      .map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: pickLang(p.title, "en"),
        url: `${SITE}/${lang}/blog/${p.slug}`,
      })),
  };

  const title = t("blog.title");

  return (
    <div>
      <JsonLd schema={itemListSchema} />
      <section className="page-hero">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-10 pb-10 md:pt-14 md:pb-12">
          <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
            <LangLink to="/" className="hover:text-primary transition-smooth">
              {t("nav.home")}
            </LangLink>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">{title}</span>
          </nav>
          <header>
            <span className="eyebrow eyebrow-line mb-5">
              {t("blog.eyebrow")}
            </span>
            <h1 className="section-title text-4xl md:text-5xl">{title}</h1>
            <p className="mt-5 text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t("blog.intro")}
            </p>
          </header>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 pb-16 md:pb-24">
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {displayPosts.map((p, i) => {
            const open = openIdx === i;
            const postTitle = pickLang(p.title, lang);
            const postTag = p.tag ? pickLang(p.tag, lang) : null;
            const postExcerpt = pickLang(p.excerpt, lang);
            return (
              <li key={`${p.title.en ?? p.title.zh ?? "post"}-${i}`}>
                <div className="flex items-center gap-4 py-4 px-2">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : i)}
                    aria-label={postTitle}
                    className="shrink-0 w-20 h-14 sm:w-24 sm:h-16 overflow-hidden rounded-md bg-muted"
                  >
                    <img
                      src={p.image}
                      alt={postTitle}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </button>
                  <span className="hidden sm:inline-block w-24 shrink-0 text-xs text-muted-foreground tabular-nums">
                    {p.date}
                  </span>
                  {postTag && (
                    <span className="hidden md:inline-flex shrink-0 items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-medium">
                      {postTag}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : i)}
                    aria-expanded={open}
                    className="flex-1 text-left font-display text-base md:text-lg font-medium leading-snug hover:text-primary transition-smooth cursor-pointer"
                  >
                    {postTitle}
                  </button>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </div>
                {/* Always in the DOM (hidden when collapsed) so the excerpt and
                    the /blog/<slug> link are in the SSR HTML for crawlers. */}
                {(
                  <div className="px-2 pb-6 -mt-1" hidden={!open}>
                    <div className="sm:hidden mb-3 flex items-center gap-2 text-xs">
                      {postTag && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                          {postTag}
                        </span>
                      )}
                      <span className="text-muted-foreground">{p.date}</span>
                    </div>
                    <div className="sm:pl-[7.5rem]">
                      <img
                        src={p.image}
                        alt={postTitle}
                        loading="lazy"
                        className="w-full max-h-80 object-cover rounded-lg mb-4"
                      />
                      <style>{`
                        .blog-excerpt p { margin: 0; line-height: 1.7; }
                      `}</style>
                      <div
                        className="blog-excerpt text-sm md:text-base text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: postExcerpt }}
                      />
                      {p.slug && (
                        <div className="mt-4">
                          <LangLink
                            to={`/blog/${p.slug}`}
                            className="inline-flex items-center text-sm font-medium text-primary hover:opacity-80 transition-smooth"
                          >
                            Read full article
                            <ChevronRight className="w-4 h-4 ml-0.5" />
                          </LangLink>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

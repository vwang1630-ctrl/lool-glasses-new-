import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { LangLink } from "@/components/LangLink";
import { useI18n, type Lang } from "@/lib/i18n";
import {
  Camera,
  Star,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Glasses,
  Infinity as InfinityIcon,
  Tag,
  Brain,
  CheckCircle2,
  Smartphone,
  ShoppingBag,
} from "lucide-react";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import reviewUser1 from "@/assets/review-user-1.jpg";
import reviewUser2 from "@/assets/review-user-2.jpg";
import reviewUser3 from "@/assets/review-user-3.jpg";
import reviewUser4 from "@/assets/review-user-4.jpg";
import reviewUser5 from "@/assets/review-user-5.jpg";
import reviewUser6 from "@/assets/review-user-6.jpg";

export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("about", params.lang) },
      {
        name: "description",
        content:
          pageDesc("about", params.lang),
      },
      { property: "og:description", content: pageOgDesc("about", params.lang) },
      { name: "twitter:description", content: pageOgDesc("about", params.lang) },
    ],
  }),
  component: AboutPage,
});

type L<T> = Partial<Record<Lang, T>>;
function pickL<T>(map: L<T>, lang: Lang): T | undefined {
  return map[lang] ?? map.en;
}

const COPY = {
  hero: {
    headline: {
      en: ["Style belongs to", "everyone."] as [string, string],
      zh: ["风格属于", "每一个人。"] as [string, string],
      es: ["El estilo es para", "todos."] as [string, string],
      fr: ["Le style est à", "tout le monde."] as [string, string],
      de: ["Stil gehört", "allen."] as [string, string],
      it: ["Lo stile è di", "tutti."] as [string, string],
      pt: ["O estilo é de", "todos."] as [string, string],
      ja: ["スタイルは", "誰のものでもある。"] as [string, string],
      ko: ["스타일은", "모두의 것."] as [string, string],
      ar: ["الأناقة لـ", "كل شخص."] as [string, string],
      vi: ["Phong cách dành cho", "tất cả mọi người."] as [string, string],
      th: ["สไตล์เป็นของ", "ทุกคน"] as [string, string],
      id: ["Gaya milik", "semua orang."] as [string, string],
      ms: ["Gaya milik", "semua orang."] as [string, string],
    } satisfies L<[string, string]>,
    rating: {
      en: "4.9 · 12k+ reviews",
      zh: "4.9 · 12k+ 好评",
      es: "4.9 · más de 12k reseñas",
      fr: "4,9 · 12k+ avis",
      de: "4,9 · 12k+ Bewertungen",
      it: "4,9 · oltre 12k recensioni",
      pt: "4,9 · 12k+ avaliações",
      ja: "4.9 · 12,000件以上のレビュー",
      ko: "4.9 · 12,000+ 리뷰",
      ar: "4.9 · أكثر من 12 ألف تقييم",
      vi: "4.9 · hơn 12 nghìn đánh giá",
      th: "4.9 · รีวิวมากกว่า 12k",
      id: "4.9 · 12k+ ulasan",
      ms: "4.9 · 12k+ ulasan",
    } satisfies L<string>,
    intro: {
      en: "lool puts good-looking eyewear within reach. Fresh on-trend drops every month, real AI try-on, fair prices. No middlemen — just your style.",
      zh: "lool 让高颜值眼镜不再遥远。每月上新众多潮流款式，AI 虚拟试戴，亲民价格。没有中间商，只有你的风格。",
      es: "lool acerca las gafas que querrás llevar. Nuevos diseños cada mes, prueba virtual con IA, precios justos. Sin intermediarios, solo tu estilo.",
      fr: "lool met à votre portée des lunettes qui ont du style. De nouveaux modèles chaque mois, un essayage IA réel, des prix justes. Sans intermédiaires, juste votre style.",
      de: "lool macht stylische Brillen erschwinglich. Jeden Monat neue Modelle, echte KI-Anprobe, faire Preise. Keine Zwischenhändler — nur dein Stil.",
      it: "lool rende accessibili gli occhiali che ti piacciono davvero. Drop mensili, prova virtuale AI, prezzi onesti. Niente intermediari, solo il tuo stile.",
      pt: "lool aproxima óculos com estilo do seu bolso. Novidades todo mês, prova com IA de verdade, preços justos. Sem intermediários — só seu estilo.",
      ja: "lool はおしゃれな眼鏡を身近にします。毎月のニューアライバル、リアルな AI 試着、納得の価格。中間業者は不要、あなたのスタイルだけ。",
      ko: "lool은 멋진 안경을 가까이에 둡니다. 매달 새로운 디자인, 진짜 AI 가상 착용, 합리적인 가격. 중간 단계 없이, 당신의 스타일만.",
      ar: "lool يجعل النظارات الأنيقة في متناولك. تشكيلات جديدة كل شهر، تجربة افتراضية حقيقية بالذكاء الاصطناعي، أسعار عادلة. بلا وسطاء — فقط أناقتك.",
      vi: "lool đưa những chiếc kính đẹp đến gần hơn với bạn. Mẫu mới hợp xu hướng mỗi tháng, thử kính AI thực sự, giá hợp lý. Không qua trung gian — chỉ có phong cách của bạn.",
      th: "lool ทำให้แว่นสวยอยู่ใกล้แค่เอื้อม คอลเลกชันใหม่ทุกเดือน ลองสวมด้วย AI จริง ราคายุติธรรม ไม่มีคนกลาง — มีแค่สไตล์ของคุณ",
      id: "lool mendekatkan kacamata bergaya ke jangkauan Anda. Koleksi baru mengikuti tren tiap bulan, coba pakai AI sungguhan, harga adil. Tanpa perantara — hanya gaya Anda.",
      ms: "lool mendekatkan cermin mata bergaya kepada anda. Koleksi baharu mengikut tren setiap bulan, cuba pakai AI sebenar, harga berpatutan. Tanpa orang tengah — hanya gaya anda.",
    } satisfies L<string>,
    ctaTryon: {
      en: "AI Try-On",
      zh: "AI 试戴",
      es: "Prueba con IA",
      fr: "Essai IA",
      de: "KI-Anprobe",
      it: "Prova con IA",
      pt: "Provar com IA",
      ja: "AI 試着",
      ko: "AI 가상 착용",
      ar: "تجربة بالذكاء الاصطناعي",
      vi: "Thử kính AI",
      th: "ลองสวมด้วย AI",
      id: "Coba dengan AI",
      ms: "Cuba dengan AI",
    } satisfies L<string>,
    ctaShop: {
      en: "Browse the collection",
      zh: "浏览全系列",
      es: "Ver toda la colección",
      fr: "Toute la collection",
      de: "Kollektion ansehen",
      it: "Vedi la collezione",
      pt: "Ver a coleção",
      ja: "コレクションを見る",
      ko: "전체 컬렉션 보기",
      ar: "تصفح المجموعة",
      vi: "Xem toàn bộ bộ sưu tập",
      th: "ดูคอลเลกชันทั้งหมด",
      id: "Jelajahi koleksi",
      ms: "Layari koleksi",
    } satisfies L<string>,
    stats: {
      en: [
        ["Monthly drops", "Fresh designs"],
        ["Honest pricing", "Easy to own"],
        ["Free over $69", "Worldwide shipping"],
      ],
      zh: [
        ["每月更新", "新鲜款式"],
        ["亲民定价", "轻松入手"],
        ["满 $69 免邮", "全球免运费"],
      ],
      es: [
        ["Lanzamientos mensuales", "Diseños frescos"],
        ["Precios honestos", "Fácil de tener"],
        ["Gratis desde $69", "Envío mundial"],
      ],
      fr: [
        ["Sorties mensuelles", "Designs frais"],
        ["Tarifs justes", "À portée de main"],
        ["Gratuit dès 69 $", "Livraison mondiale"],
      ],
      de: [
        ["Monatliche Drops", "Frische Designs"],
        ["Faire Preise", "Leicht zugänglich"],
        ["Gratis ab 69 $", "Weltweiter Versand"],
      ],
      it: [
        ["Drop mensili", "Design freschi"],
        ["Prezzi onesti", "Facile averli"],
        ["Gratis da 69 $", "Spedizione mondiale"],
      ],
      pt: [
        ["Lançamentos mensais", "Designs frescos"],
        ["Preço honesto", "Fácil de ter"],
        ["Grátis acima de US$ 69", "Envio mundial"],
      ],
      ja: [
        ["毎月新作", "フレッシュなデザイン"],
        ["公正な価格", "手に入れやすい"],
        ["$69 以上で送料無料", "世界中に配送"],
      ],
      ko: [
        ["매달 신상", "신선한 디자인"],
        ["정직한 가격", "부담 없이"],
        ["$69 이상 무료배송", "전 세계 배송"],
      ],
      ar: [
        ["إصدارات شهرية", "تصاميم جديدة"],
        ["أسعار عادلة", "في متناول الجميع"],
        ["شحن مجاني فوق 69$", "شحن لجميع الدول"],
      ],
      vi: [
        ["Ra mắt hàng tháng", "Thiết kế tươi mới"],
        ["Giá trung thực", "Dễ dàng sở hữu"],
        ["Miễn phí trên $69", "Giao toàn cầu"],
      ],
      th: [
        ["ออกใหม่ทุกเดือน", "ดีไซน์สดใหม่"],
        ["ราคายุติธรรม", "เป็นเจ้าของง่าย"],
        ["ส่งฟรีเมื่อซื้อเกิน $69", "ส่งทั่วโลก"],
      ],
      id: [
        ["Rilis tiap bulan", "Desain segar"],
        ["Harga jujur", "Mudah dimiliki"],
        ["Gratis di atas $69", "Kirim ke seluruh dunia"],
      ],
      ms: [
        ["Keluaran setiap bulan", "Reka bentuk segar"],
        ["Harga jujur", "Mudah dimiliki"],
        ["Percuma melebihi $69", "Penghantaran seluruh dunia"],
      ],
    } satisfies L<[string, string][]>,
    aiCardCaption: {
      en: "Real-time AI try-on · 100+ face landmarks",
      zh: "实时 AI 试戴 · 100+ 面部点位",
      es: "Prueba con IA en tiempo real · 100+ puntos faciales",
      fr: "Essayage IA en temps réel · 100+ points du visage",
      de: "Echtzeit-KI-Anprobe · 100+ Gesichtspunkte",
      it: "Prova AI in tempo reale · 100+ punti facciali",
      pt: "Prova AI em tempo real · 100+ pontos faciais",
      ja: "リアルタイム AI 試着 · 100+ の顔ランドマーク",
      ko: "실시간 AI 가상 착용 · 100+ 안면 포인트",
      ar: "تجربة AI فورية · أكثر من 100 نقطة في الوجه",
      vi: "Thử kính AI thời gian thực · hơn 100 điểm trên khuôn mặt",
      th: "ลองสวมด้วย AI แบบเรียลไทม์ · จุดสังเกตบนใบหน้ามากกว่า 100 จุด",
      id: "Coba AI real-time · 100+ titik wajah",
      ms: "Cuba AI masa nyata · 100+ titik wajah",
    } satisfies L<string>,
    aiCardSub: {
      en: "Upload a selfie or open the camera — see the fit instantly.",
      zh: "上传自拍或打开相机，立刻看到佩戴效果。",
      es: "Sube una selfie o abre la cámara — mira el ajuste al instante.",
      fr: "Téléchargez un selfie ou ouvrez la caméra — voyez le rendu instantanément.",
      de: "Lade ein Selfie hoch oder öffne die Kamera — sieh die Passform sofort.",
      it: "Carica un selfie o apri la fotocamera — vedi subito come stanno.",
      pt: "Envie uma selfie ou abra a câmera — veja o resultado na hora.",
      ja: "セルフィーをアップロードするか、カメラを開くだけで、すぐに装着感を確認できます。",
      ko: "셀카를 올리거나 카메라를 켜면, 바로 착용 결과를 확인할 수 있어요.",
      ar: "ارفع صورة سيلفي أو افتح الكاميرا — وشاهد النتيجة فورًا.",
      vi: "Tải ảnh selfie hoặc bật camera — xem ngay kính hợp đến đâu.",
      th: "อัปโหลดเซลฟี่หรือเปิดกล้อง — เห็นว่าเข้ากันได้ทันที",
      id: "Unggah selfie atau buka kamera — lihat hasilnya seketika.",
      ms: "Muat naik selfie atau buka kamera — lihat hasilnya serta-merta.",
    } satisfies L<string>,
    aiBadges: {
      en: ["Retro cat-eye", "Square tortoise"],
      zh: ["复古猫眼", "方形玳瑁"],
      es: ["Cat-eye retro", "Cuadrado tortuga"],
      fr: ["Œil-de-chat rétro", "Carré écaille"],
      de: ["Retro Cat-Eye", "Eckig Schildpatt"],
      it: ["Cat-eye retrò", "Quadrato tartaruga"],
      pt: ["Cat-eye retrô", "Quadrado tartaruga"],
      ja: ["レトロ キャットアイ", "スクエア べっ甲"],
      ko: ["레트로 캣아이", "스퀘어 토터스"],
      ar: ["كات آي ريترو", "مربع سلحفاة"],
      vi: ["Cat-eye retro", "Vuông đồi mồi"],
      th: ["แคทอายเรโทร", "สี่เหลี่ยมลายกระ"],
      id: ["Cat-eye retro", "Kotak motif kura"],
      ms: ["Cat-eye retro", "Segi empat corak kura"],
    } satisfies L<[string, string]>,
  },
  storyA: {
    eyebrow: {
      en: "What we stand for",
      zh: "我们的坚持",
      es: "Lo que defendemos",
      fr: "Notre engagement",
      de: "Wofür wir stehen",
      it: "Ciò in cui crediamo",
      pt: "No que acreditamos",
      ja: "私たちの信念",
      ko: "우리의 다짐",
      ar: "ما نؤمن به",
      vi: "Điều chúng tôi theo đuổi",
      th: "สิ่งที่เรายึดมั่น",
      id: "Yang kami perjuangkan",
      ms: "Apa yang kami pertahankan",
    } satisfies L<string>,
    title: {
      en: "Good design shouldn’t be priced out of reach.",
      zh: "好设计不该被高价格阻拦。",
      es: "El buen diseño no debería costar una fortuna.",
      fr: "Le bon design ne devrait pas coûter une fortune.",
      de: "Gutes Design darf nicht unbezahlbar sein.",
      it: "Il buon design non dovrebbe essere fuori portata.",
      pt: "Bom design não deveria custar caro demais.",
      ja: "良いデザインに、高すぎる価格はいらない。",
      ko: "좋은 디자인이 비싸야 할 이유는 없습니다.",
      ar: "التصميم الجيد لا يجب أن يكون باهظ الثمن.",
      vi: "Thiết kế đẹp không nên có giá xa tầm với.",
      th: "ดีไซน์ดีไม่ควรมีราคาเอื้อมไม่ถึง",
      id: "Desain bagus tak seharusnya berharga di luar jangkauan.",
      ms: "Reka bentuk yang baik tidak sepatutnya berharga di luar kemampuan.",
    } satisfies L<string>,
    body: {
      en: "For too long, fashionable eyewear meant either luxury price tags or yesterday’s shapes. We broke that rule: lool ships fresh, opinionated designs — light, durable, fairly priced — so anyone can wear a frame they actually love.",
      zh: "长久以来，时尚眼镜要么贵得离谱，要么毫无新意。我们打破规则：lool 不断带来新鲜、有态度的设计，轻巧耐用，价格友好，让每个人都能轻松拥有心仪的眼镜。",
      es: "Durante demasiado tiempo, la moda en gafas significó precios desorbitados o diseños anticuados. Rompemos la regla: lool ofrece diseños frescos y con carácter, ligeros, duraderos y a precio justo — para que cualquiera pueda llevar las gafas que de verdad le gustan.",
      fr: "Pendant trop longtemps, les lunettes à la mode étaient soit hors de prix, soit dépassées. On change la donne : lool propose des modèles frais et affirmés — légers, résistants, à prix juste — pour porter enfin une monture qu’on aime vraiment.",
      de: "Modische Brillen waren lange entweder zu teuer oder altmodisch. Damit Schluss: lool bringt frische, ausdrucksstarke Designs — leicht, robust, fair bepreist — damit du eine Brille trägst, die dir wirklich gefällt.",
      it: "Per troppo tempo gli occhiali di tendenza sono stati o troppo cari o noiosi. Cambiamo le regole: lool propone design freschi e decisi — leggeri, durevoli, a prezzo onesto — per indossare una montatura che ami davvero.",
      pt: "Por muito tempo, óculos da moda significaram preços absurdos ou formas ultrapassadas. A gente quebra essa regra: a lool entrega designs frescos e com atitude — leves, duradouros, a preço justo — para você usar uma armação que realmente ame.",
      ja: "長い間、ファッショナブルな眼鏡は高すぎるか、時代遅れか、どちらかでした。私たちはそのルールを変えます。lool は新鮮で個性のあるデザインを、軽く・丈夫に・手が届く価格で。誰もが本当に気に入る一本に出会えるように。",
      ko: "오랫동안 트렌디한 안경은 너무 비싸거나, 너무 낡은 디자인 중 하나였습니다. lool은 그 룰을 깹니다. 가볍고 튼튼하며 합리적인 가격의 신선한 디자인 — 누구나 정말로 좋아하는 안경을 쓸 수 있도록.",
      ar: "لسنوات طويلة، كانت النظارات العصرية إما باهظة الثمن وإما قديمة الطراز. نحن نكسر هذه القاعدة: lool تقدّم تصاميم جديدة وذات شخصية — خفيفة، متينة، وبأسعار عادلة — كي يرتدي الجميع نظارة يحبّونها فعلًا.",
      vi: "Suốt một thời gian dài, kính thời trang hoặc là quá đắt, hoặc là lỗi mốt. Chúng tôi phá vỡ quy tắc đó: lool mang đến những thiết kế mới mẻ, có cá tính — nhẹ, bền, giá hợp lý — để ai cũng có thể đeo một gọng kính mình thực sự yêu thích.",
      th: "เป็นเวลานานเกินไปที่แว่นแฟชั่นแปลว่าราคาหรูหรือทรงล้าสมัย เราหักล้างกฎนั้น: lool ส่งดีไซน์สดใหม่และมีจุดยืน — เบา ทนทาน ราคายุติธรรม — เพื่อให้ทุกคนได้สวมแว่นที่ตัวเองรักจริง ๆ",
      id: "Sudah terlalu lama kacamata bergaya berarti label harga mewah atau bentuk yang ketinggalan zaman. Kami mematahkan aturan itu: lool menghadirkan desain segar dan berkarakter — ringan, awet, berharga adil — agar siapa pun bisa memakai bingkai yang benar-benar disukai.",
      ms: "Sudah terlalu lama cermin mata bergaya bermaksud harga mewah atau bentuk lapuk. Kami patahkan peraturan itu: lool menampilkan reka bentuk segar dan berkarakter — ringan, tahan lama, berharga adil — agar sesiapa pun boleh memakai bingkai yang benar-benar disukai.",
    } satisfies L<string>,
    pill: {
      en: "Monthly drops · ideas that never repeat",
      zh: "每月上新 · 从不重复的灵感",
      es: "Lanzamientos mensuales · ideas que no se repiten",
      fr: "Sorties mensuelles · des idées qui ne se répètent jamais",
      de: "Monatliche Drops · Ideen, die sich nie wiederholen",
      it: "Drop mensili · idee che non si ripetono",
      pt: "Lançamentos mensais · ideias que nunca se repetem",
      ja: "毎月新作 · 二度と同じデザインは出ない",
      ko: "매달 신상 · 반복되지 않는 아이디어",
      ar: "إصدارات شهرية · أفكار لا تتكرر",
      vi: "Ra mắt hàng tháng · ý tưởng không lặp lại",
      th: "ออกใหม่ทุกเดือน · ไอเดียที่ไม่ซ้ำ",
      id: "Rilis tiap bulan · ide yang tak pernah berulang",
      ms: "Keluaran setiap bulan · idea yang tidak pernah berulang",
    } satisfies L<string>,
    badge: {
      en: "Fresh designs every month",
      zh: "每月海量新设计",
      es: "Diseños frescos cada mes",
      fr: "Des designs frais chaque mois",
      de: "Jeden Monat frische Designs",
      it: "Design freschi ogni mese",
      pt: "Designs frescos todo mês",
      ja: "毎月、新鮮なデザインを",
      ko: "매달 새로운 디자인",
      ar: "تصاميم جديدة كل شهر",
      vi: "Thiết kế mới mỗi tháng",
      th: "ดีไซน์สดใหม่ทุกเดือน",
      id: "Desain segar tiap bulan",
      ms: "Reka bentuk segar setiap bulan",
    } satisfies L<string>,
  },
  storyB: {
    title: {
      en: ["Hundreds of styles.", "One AI mirror."] as [string, string],
      zh: ["上百种风格。", "一面 AI 魔镜。"] as [string, string],
      es: ["Cientos de estilos.", "Un espejo con IA."] as [string, string],
      fr: ["Des centaines de styles.", "Un miroir IA."] as [string, string],
      de: ["Hunderte Stile.", "Ein KI-Spiegel."] as [string, string],
      it: ["Centinaia di stili.", "Uno specchio AI."] as [string, string],
      pt: ["Centenas de estilos.", "Um espelho com IA."] as [string, string],
      ja: ["数百のスタイル。", "一つの AI ミラー。"] as [string, string],
      ko: ["수백 가지 스타일.", "하나의 AI 미러."] as [string, string],
      ar: ["مئات الأنماط.", "مرآة واحدة بالذكاء الاصطناعي."] as [
        string,
        string,
      ],
      vi: ["Hàng trăm phong cách.", "Một chiếc gương AI."] as [string, string],
      th: ["สไตล์นับร้อย", "กระจก AI หนึ่งบาน"] as [string, string],
      id: ["Ratusan gaya.", "Satu cermin AI."] as [string, string],
      ms: ["Ratusan gaya.", "Satu cermin AI."] as [string, string],
    } satisfies L<[string, string]>,
    body: {
      en: "Our design team tracks trends across Tokyo, Milan, and Seoul and turns them into everyday wear. The hardest part of shopping eyewear online — not knowing if a frame fits your face — gets solved with our AI try-on: upload a photo, swap shapes live, see the fit more clearly than in any store.",
      zh: "我们的设计团队持续追踪全球流行趋势，把多元灵感变成你的日常。而在线选眼镜最大的痛点——不知道是否适合——我们用 AI 试戴解决。上传照片，实时切换款式，比实体店更直观。",
      es: "Nuestro equipo sigue las tendencias en Tokio, Milán y Seúl y las traduce a piezas de uso diario. El mayor reto de comprar gafas online — saber si te quedan bien — lo resolvemos con la prueba virtual con IA: sube una foto, cambia formas en vivo y mira el ajuste mejor que en una tienda.",
      fr: "Notre équipe design suit les tendances de Tokyo à Milan en passant par Séoul et les transforme en pièces du quotidien. La difficulté principale en ligne — savoir si une monture vous va — est résolue par notre essayage IA : photo, changement de formes en direct, rendu plus clair qu’en boutique.",
      de: "Unser Designteam beobachtet Trends zwischen Tokio, Mailand und Seoul und macht daraus Alltagsbrillen. Das größte Problem beim Online-Kauf — passt die Brille zu meinem Gesicht? — lösen wir mit KI-Anprobe: Foto hochladen, Formen live wechseln, Passform klarer sehen als im Laden.",
      it: "Il nostro team segue i trend tra Tokyo, Milano e Seoul e li trasforma in occhiali da tutti i giorni. La parte più difficile online — capire se una montatura ti sta bene — la risolviamo con la prova AI: foto, cambio di forma in tempo reale, resa più chiara che in negozio.",
      pt: "Nossa equipe acompanha tendências de Tóquio a Milão e Seul e transforma tudo em peças do dia a dia. O maior desafio de comprar óculos online — saber se a armação combina com você — a gente resolve com prova AI: envie uma foto, troque modelos ao vivo, veja o resultado melhor do que em loja física.",
      ja: "東京・ミラノ・ソウルのトレンドを追い、デザインチームが日常着けたい一本に仕立てます。オンラインで最も難しい「似合うかどうか」は、AI 試着で解決。写真をアップして形を切り替え、店頭以上にはっきり確認できます。",
      ko: "디자인 팀은 도쿄·밀라노·서울의 트렌드를 데일리 아이웨어로 풀어냅니다. 온라인 안경 쇼핑의 가장 큰 어려움인 “어울리는지 모르겠다”는 문제, AI 가상 착용으로 해결합니다. 사진을 올리고 모양을 실시간으로 바꿔보면, 매장에서보다 더 또렷이 확인할 수 있어요.",
      ar: "يتابع فريق التصميم لدينا الاتجاهات بين طوكيو وميلانو وسيول ويترجمها إلى نظارات للاستخدام اليومي. أصعب جزء في الشراء عبر الإنترنت — معرفة ما يناسب وجهك — نحلّه بتجربة الذكاء الاصطناعي: ارفع صورتك، بدّل الأشكال مباشرة، وشاهد النتيجة بوضوح أكبر من المتاجر.",
      vi: "Đội ngũ thiết kế của chúng tôi theo dõi xu hướng từ Tokyo, Milan đến Seoul và biến chúng thành những chiếc kính bạn có thể đeo mỗi ngày. Phần khó nhất khi mua kính online — không biết gọng có hợp mặt mình không — được giải quyết bằng AI thử kính: tải ảnh lên, đổi dáng trực tiếp, xem độ vừa vặn còn rõ hơn cả khi đứng trước gương ở cửa hàng.",
      th: "ทีมออกแบบของเราเกาะติดเทรนด์ทั้งโตเกียว มิลาน และโซล แล้วนำมาทำเป็นแว่นสำหรับใช้ทุกวัน ส่วนที่ยากที่สุดของการซื้อแว่นออนไลน์ — ไม่รู้ว่ากรอบเข้ากับหน้าหรือไม่ — เราแก้ด้วย AI ลองสวม: อัปโหลดรูป สลับทรงสด ๆ เห็นความเข้ากันชัดยิ่งกว่าที่หน้าร้าน",
      id: "Tim desain kami memantau tren dari Tokyo, Milan, hingga Seoul dan menerjemahkannya jadi kacamata sehari-hari. Bagian tersulit belanja kacamata online — tak tahu apakah bingkainya cocok di wajah — kami atasi dengan AI try-on: unggah foto, ganti bentuk secara langsung, lihat kecocokan lebih jelas daripada di toko.",
      ms: "Pasukan reka bentuk kami menjejaki tren di Tokyo, Milan dan Seoul dan menjadikannya cermin mata harian. Bahagian paling sukar membeli cermin mata dalam talian — tidak tahu sama ada bingkai sesuai dengan wajah anda — kami selesaikan dengan AI try-on: muat naik foto, tukar bentuk secara langsung, lihat kesesuaian lebih jelas berbanding di kedai.",
    } satisfies L<string>,
    chips: {
      en: ["98% try-on satisfaction", "Works on mobile and desktop"],
      zh: ["98% 试戴满意度", "手机电脑通用"],
      es: ["98% de satisfacción al probar", "Funciona en móvil y escritorio"],
      fr: [
        "98% de satisfaction à l’essayage",
        "Fonctionne sur mobile et ordinateur",
      ],
      de: ["98% Anprobe-Zufriedenheit", "Funktioniert auf Handy & Desktop"],
      it: ["98% di soddisfazione nella prova", "Funziona su mobile e desktop"],
      pt: ["98% de satisfação na prova", "Funciona em mobile e desktop"],
      ja: ["98% の試着満足度", "スマホ・PC 両対応"],
      ko: ["98% 가상 착용 만족도", "모바일·데스크톱 모두 지원"],
      ar: ["رضا 98% عن التجربة", "يعمل على الجوال والكمبيوتر"],
      vi: [
        "98% hài lòng khi thử kính",
        "Hoạt động trên điện thoại và máy tính",
      ],
      th: ["ความพึงพอใจในการลองสวม 98%", "ใช้ได้ทั้งมือถือและเดสก์ท็อป"],
      id: ["Kepuasan try-on 98%", "Berfungsi di ponsel dan desktop"],
      ms: ["Kepuasan cuba pakai 98%", "Berfungsi pada mudah alih dan desktop"],
    } satisfies L<[string, string]>,
  },
  features: {
    f1: {
      title: {
        en: "Endlessly different shapes",
        zh: "无尽可能的款式",
        es: "Formas siempre diferentes",
        fr: "Des formes toujours nouvelles",
        de: "Endlos verschiedene Formen",
        it: "Forme sempre diverse",
        pt: "Formas sempre diferentes",
        ja: "尽きないフォルムの選択肢",
        ko: "끝없이 다채로운 형태",
        ar: "أشكال متنوّعة بلا حدود",
        vi: "Vô vàn dáng kính khác nhau",
        th: "ทรงไม่รู้จบ",
        id: "Bentuk tanpa habis-habisnya",
        ms: "Bentuk tanpa kesudahan",
      } satisfies L<string>,
      body: {
        en: "From retro cat-eye to futurist shields, clear acetate to tortoise. New shapes drop every month — there’s always something to discover.",
        zh: "从复古猫眼到未来感护目镜，透明色到玳瑁色。每月定期上新，总有新惊喜。",
        es: "Desde cat-eye retro hasta escudos futuristas, de acetato transparente a tortuga. Cada mes llegan formas nuevas — siempre hay algo por descubrir.",
        fr: "Du cat-eye rétro aux visières futuristes, de l’acétate transparent à l’écaille. De nouvelles formes chaque mois — il y a toujours à découvrir.",
        de: "Von Retro-Cat-Eye bis futuristischem Shield, von klarem Acetat bis Schildpatt. Jeden Monat neue Formen — es gibt immer Neues zu entdecken.",
        it: "Dal cat-eye retrò agli shield futuristici, dall’acetato trasparente al tartaruga. Ogni mese nuove forme — c’è sempre qualcosa da scoprire.",
        pt: "Do cat-eye retrô a shields futuristas, do acetato transparente ao tartaruga. Toda mês chegam formas novas — sempre há algo para descobrir.",
        ja: "レトロなキャットアイから未来的なシールドまで、クリアアセテートからべっ甲まで。毎月新しい形が登場し、いつも発見があります。",
        ko: "레트로 캣아이부터 미래적인 실드, 투명 아세테이트부터 토터스까지. 매달 새로운 모양이 출시되어 늘 새로움이 있습니다.",
        ar: "من الكات آي الكلاسيكي إلى الأشكال المستقبلية، ومن الأسيتات الشفّاف إلى السلحفاة. أشكال جديدة كل شهر — دائمًا ثمة ما يُكتشف.",
        vi: "Từ cat-eye retro đến shield tương lai, từ acetate trong suốt đến đồi mồi. Dáng kính mới ra mắt mỗi tháng — luôn có điều mới để khám phá.",
        th: "ตั้งแต่แคทอายเรโทรไปจนถึงชีลด์ล้ำสมัย จากอะซิเตทใสไปจนถึงลายกระ ทรงใหม่ออกทุกเดือน — มีอะไรให้ค้นพบเสมอ",
        id: "Dari cat-eye retro hingga shield futuristik, dari asetat bening hingga motif kura. Bentuk baru rilis tiap bulan — selalu ada yang bisa ditemukan.",
        ms: "Daripada cat-eye retro hingga shield futuristik, daripada asetat lutsinar hingga corak kura. Bentuk baharu setiap bulan — sentiasa ada sesuatu untuk diterokai.",
      } satisfies L<string>,
    },
    f2: {
      title: {
        en: "Fair pricing, no compromise",
        zh: "价格友好，不妥协",
        es: "Precios justos, sin compromisos",
        fr: "Tarifs justes, sans compromis",
        de: "Faire Preise, ohne Kompromisse",
        it: "Prezzi onesti, senza compromessi",
        pt: "Preço justo, sem abrir mão",
        ja: "公正な価格、妥協なし",
        ko: "정직한 가격, 타협 없음",
        ar: "أسعار عادلة دون مساومة",
        vi: "Giá hợp lý, không thoả hiệp",
        th: "ราคายุติธรรม ไม่มีลดทอน",
        id: "Harga adil, tanpa kompromi",
        ms: "Harga adil, tanpa kompromi",
      } satisfies L<string>,
      body: {
        en: "Honest pricing with nothing hidden. Free tracked shipping on orders over $69, a 365-day quality warranty, and 30-day free returns & exchanges for non-prescription glasses.",
        zh: "亲民定价，透明无隐藏费用。满 $69 即享全球免邮并附实时追踪，365 天质量保修，非处方眼镜（平光镜）30 天内免费退换。",
        es: "Precios honestos, sin sorpresas. Envío gratis y con seguimiento desde $69, garantía de calidad de 365 días y devoluciones y cambios gratuitos a 30 días para gafas sin graduación.",
        fr: "Tarifs transparents, rien de caché. Livraison gratuite et suivie dès 69 $, garantie qualité de 365 jours et retours et échanges gratuits à 30 jours pour les lunettes sans prescription.",
        de: "Ehrliche Preise, nichts versteckt. Kostenloser, nachverfolgbarer Versand ab 69 $, 365-tägige Qualitätsgarantie und 30-tägige kostenlose Rücksendungen und Umtausch für Brillen ohne Sehstärke.",
        it: "Prezzi onesti, niente di nascosto. Spedizione gratuita e tracciabile oltre 69 $, garanzia di qualità di 365 giorni e resi e cambi gratuiti entro 30 giorni per occhiali senza prescrizione.",
        pt: "Preços honestos, nada escondido. Frete grátis e rastreável acima de US$ 69, garantia de qualidade de 365 dias e devoluções e trocas gratuitas em até 30 dias para óculos sem grau.",
        ja: "正直な価格、隠れた費用はゼロ。$69 以上で送料無料（追跡付き）、365 日品質保証、度なしメガネは 30 日間無料返品・交換。",
        ko: "투명한 가격, 숨김 없음. $69 이상 무료 추적 배송, 365일 품질 보증, 도수 없는 안경 30일 내 무료 반품·교환.",
        ar: "أسعار صريحة، لا رسوم خفيّة. شحن مجاني مع تتبع فوق 69$، ضمان جودة 365 يومًا وإرجاع واستبدال مجاني خلال 30 يومًا للنظارات غير الطبية.",
        vi: "Giá minh bạch, không gì bị giấu. Miễn phí vận chuyển có theo dõi từ $69, bảo hành chất lượng 365 ngày và đổi trả miễn phí trong 30 ngày đối với kính không toa.",
        th: "ราคาตรงไปตรงมา ไม่มีค่าใช้จ่ายแอบแฝง ส่งฟรีพร้อมติดตามพัสดุเมื่อซื้อเกิน $69 รับประกันคุณภาพ 365 วัน และเปลี่ยนหรือคืนสินค้าได้ฟรีภายใน 30 วันสำหรับแว่นไร้แว่นสายตา",
        id: "Harga jujur, tanpa biaya tersembunyi. Gratis ongkir dengan pelacakan di atas $69, garansi kualitas 365 hari, dan pengembalian serta penukaran gratis 30 hari untuk kacamata non-resep.",
        ms: "Harga jujur, tiada caj tersembunyi. Penghantaran percuma dengan penjejakan melebihi $69, waranti kualiti 365 hari, dan pemulangan serta pertukaran percuma 30 hari untuk cermin mata tanpa preskripsi.",
      } satisfies L<string>,
    },
    f3: {
      title: {
        en: "AI try-on that actually works",
        zh: "AI 试戴 真实可用",
        es: "Prueba con IA que de verdad funciona",
        fr: "Un essayage IA qui marche vraiment",
        de: "KI-Anprobe, die wirklich funktioniert",
        it: "Prova AI che funziona davvero",
        pt: "Prova com IA que funciona de verdade",
        ja: "本当に使える AI 試着",
        ko: "진짜 쓸 만한 AI 가상 착용",
        ar: "تجربة AI تعمل فعلًا",
        vi: "AI thử kính dùng được thật sự",
        th: "AI ลองสวมที่ใช้ได้จริง",
        id: "Try-on AI yang benar-benar berfungsi",
        ms: "Cuba pakai AI yang benar-benar berfungsi",
      } satisfies L<string>,
      body: {
        en: "100+ facial landmarks place each frame on your real face. See how it sits before you ever pay.",
        zh: "100+ 面部特征点智能贴合，下单前就能看到「真脸效果」。告别翻车。",
        es: "Más de 100 puntos faciales colocan cada montura en tu rostro real. Mira cómo te queda antes de pagar.",
        fr: "Plus de 100 points du visage placent chaque monture sur votre vrai visage. Voyez le rendu avant même de payer.",
        de: "Über 100 Gesichtspunkte platzieren jede Brille auf deinem echten Gesicht. Sieh die Passform, bevor du bezahlst.",
        it: "Oltre 100 punti facciali posizionano ogni montatura sul tuo viso reale. Vedi come sta prima ancora di pagare.",
        pt: "Mais de 100 pontos faciais posicionam cada armação no seu rosto real. Veja como fica antes de pagar.",
        ja: "100+ の顔ランドマークで、本物の顔にフレームを精密に配置。買う前に装着感が分かります。",
        ko: "100개 이상의 안면 포인트로 실제 얼굴에 프레임을 정확히 배치. 결제 전에 어울리는 모습을 확인할 수 있습니다.",
        ar: "أكثر من 100 نقطة في الوجه تضع كل إطار على وجهك الحقيقي. شاهد النتيجة قبل أن تدفع.",
        vi: "Hơn 100 điểm trên khuôn mặt đặt mỗi gọng kính lên gương mặt thật của bạn. Xem độ vừa vặn trước khi quyết định mua.",
        th: "จุดสังเกตบนใบหน้ามากกว่า 100 จุดวางกรอบแว่นบนใบหน้าจริงของคุณ ดูความเข้ากันก่อนจ่ายเงิน",
        id: "Lebih dari 100 titik wajah menempatkan setiap bingkai di wajah asli Anda. Lihat kecocokannya sebelum membayar.",
        ms: "Lebih 100 titik wajah meletakkan setiap bingkai pada wajah sebenar anda. Lihat kesesuaiannya sebelum membayar.",
      } satisfies L<string>,
    },
  },
  diversity: {
    title: {
      en: "Every face shape. Every attitude.",
      zh: "每一种脸型，每一种态度",
      es: "Cada rostro. Cada actitud.",
      fr: "Tous les visages. Toutes les attitudes.",
      de: "Jede Gesichtsform. Jede Haltung.",
      it: "Ogni viso. Ogni attitudine.",
      pt: "Cada rosto. Cada atitude.",
      ja: "あらゆる顔立ち、あらゆる態度。",
      ko: "모든 얼굴형, 모든 무드.",
      ar: "كل شكل وجه. كل أسلوب.",
      vi: "Mọi dáng mặt. Mọi cá tính.",
      th: "ทุกรูปหน้า ทุกทัศนคติ",
      id: "Setiap bentuk wajah. Setiap karakter.",
      ms: "Setiap bentuk wajah. Setiap perwatakan.",
    } satisfies L<string>,
    sub: {
      en: "We don’t segment by age — we go by style. Students, creatives, professionals, parents — if you love a good outfit, this is your shop.",
      zh: "我们不划年龄段，只看风格。学生、创意人、职场精英、长辈 —— 只要热爱穿搭，这里就是你的主场。",
      es: "No segmentamos por edad — vamos por estilo. Estudiantes, creativos, profesionales, mayores — si te encanta vestirte bien, esta es tu tienda.",
      fr: "On ne segmente pas par âge — on suit le style. Étudiants, créatifs, pros, parents — si vous aimez vous habiller, c’est chez vous.",
      de: "Wir sortieren nicht nach Alter — sondern nach Stil. Studierende, Kreative, Berufstätige, Eltern — wer Stil liebt, ist hier richtig.",
      it: "Niente segmentazione per età — solo per stile. Studenti, creativi, professionisti, genitori — se ami vestirti bene, sei nel posto giusto.",
      pt: "Não segmentamos por idade — vamos pelo estilo. Estudantes, criativos, profissionais, mães e pais — se você ama se vestir bem, este é seu lugar.",
      ja: "年齢で区切らず、スタイルで選ぶ。学生、クリエイター、ビジネスパーソン、親世代 — おしゃれを楽しむなら、ここがあなたの場所。",
      ko: "나이가 아니라 스타일로 봅니다. 학생, 크리에이터, 직장인, 부모님 — 스타일을 즐긴다면, 여기가 당신의 자리.",
      ar: "لا نصنّفك حسب العمر — بل حسب أسلوبك. الطلاب، المبدعون، المحترفون، الأمهات والآباء — إن كنت تحب الأناقة، فهذا مكانك.",
      vi: "Chúng tôi không phân chia theo tuổi — mà theo phong cách. Sinh viên, người sáng tạo, dân văn phòng, các bậc phụ huynh — nếu bạn yêu thích phối đồ, đây là cửa hàng của bạn.",
      th: "เราไม่ได้แบ่งกลุ่มด้วยอายุ — แต่แบ่งด้วยสไตล์ นักเรียน นักสร้างสรรค์ คนทำงาน คุณพ่อคุณแม่ — ถ้าคุณรักการแต่งตัว ที่นี่คือที่ของคุณ",
      id: "Kami tak membagi berdasarkan usia — kami melihat gaya. Pelajar, kreator, profesional, orang tua — jika Anda suka berbusana, di sinilah tempat Anda.",
      ms: "Kami tidak membahagikan ikut umur — kami melihat gaya. Pelajar, kreatif, profesional, ibu bapa — jika anda gemar berpakaian, di sinilah tempat anda.",
    } satisfies L<string>,
  },
  cta: {
    title: {
      en: "Your next favorite pair",
      zh: "你的下一副最爱眼镜",
      es: "Tu próximo par favorito",
      fr: "Votre prochaine monture préférée",
      de: "Deine nächste Lieblingsbrille",
      it: "Il tuo prossimo paio preferito",
      pt: "Seu próximo par favorito",
      ja: "次のお気に入りの一本",
      ko: "다음 ‘최애’ 안경",
      ar: "نظارتك المفضلة التالية",
      vi: "Chiếc kính yêu thích tiếp theo của bạn",
      th: "แว่นคู่โปรดคู่ถัดไปของคุณ",
      id: "Kacamata favorit Anda berikutnya",
      ms: "Cermin mata kegemaran anda yang seterusnya",
    } satisfies L<string>,
    sub: {
      en: "One tap, one selfie — and the AI finds the pair that fits you best.",
      zh: "点击一下，再用 AI 自拍 —— 找到完美适合你的那一款。",
      es: "Un toque, una selfie — y la IA encuentra el par que mejor te queda.",
      fr: "Un clic, un selfie — et l’IA trouve la monture qui vous va le mieux.",
      de: "Ein Tipp, ein Selfie — und die KI findet die perfekte Brille für dich.",
      it: "Un tocco, un selfie — e l’AI trova la montatura perfetta per te.",
      pt: "Um toque, uma selfie — e a IA encontra o par perfeito para você.",
      ja: "ワンタップ、セルフィー一枚 — AI があなたに最も似合う一本を見つけます。",
      ko: "한 번의 클릭, 셀카 한 장 — AI가 가장 잘 어울리는 안경을 찾아드립니다.",
      ar: "نقرة واحدة وصورة سيلفي — والذكاء الاصطناعي يجد لك أنسب نظارة.",
      vi: "Một chạm, một bức selfie — AI sẽ tìm ra chiếc kính hợp với bạn nhất.",
      th: "แค่แตะครั้งเดียว เซลฟี่หนึ่งภาพ — AI หาคู่ที่เข้ากับคุณที่สุดให้",
      id: "Satu ketukan, satu selfie — dan AI menemukan pasangan kacamata terbaik untuk Anda.",
      ms: "Satu ketikan, satu selfie — dan AI menemukan pasangan cermin mata terbaik untuk anda.",
    } satisfies L<string>,
    footnote: {
      en: "Worldwide shipping · 365-day returns · AI try-on on every device",
      zh: "全球配送 · 365 天安心保障 · AI 试戴支持所有设备",
      es: "Envío mundial · Devoluciones de 365 días · Prueba con IA en cualquier dispositivo",
      fr: "Livraison mondiale · Retours sous 365 jours · Essayage IA sur tous les appareils",
      de: "Weltweiter Versand · 365 Tage Rückgabe · KI-Anprobe auf jedem Gerät",
      it: "Spedizione mondiale · Reso entro 365 giorni · Prova AI su qualsiasi dispositivo",
      pt: "Envio mundial · Devolução em 365 dias · Prova com IA em qualquer dispositivo",
      ja: "世界中に配送 · 365 日返品 · 全デバイス対応の AI 試着",
      ko: "전 세계 배송 · 365일 반품 · 모든 기기에서 AI 가상 착용",
      ar: "شحن لجميع الدول · إرجاع لمدة 365 يومًا · تجربة AI على كل الأجهزة",
      vi: "Giao hàng toàn cầu · Đổi trả 365 ngày · Thử kính AI trên mọi thiết bị",
      th: "ส่งทั่วโลก · คืนสินค้าได้ 365 วัน · ลองสวมด้วย AI บนทุกอุปกรณ์",
      id: "Pengiriman ke seluruh dunia · Retur 365 hari · Try-on AI di setiap perangkat",
      ms: "Penghantaran ke seluruh dunia · Pemulangan 365 hari · Cuba pakai AI pada setiap peranti",
    } satisfies L<string>,
    tryon: {
      en: "Try on with AI",
      zh: "立即 AI 试穿",
      es: "Probar con IA",
      fr: "Essayer avec l’IA",
      de: "Mit KI anprobieren",
      it: "Prova con AI",
      pt: "Provar com IA",
      ja: "AI で試着する",
      ko: "AI로 가상 착용",
      ar: "جرّب بالذكاء الاصطناعي",
      vi: "Thử với AI",
      th: "ลองด้วย AI",
      id: "Coba dengan AI",
      ms: "Cuba dengan AI",
    } satisfies L<string>,
    shop: {
      en: "Explore all styles",
      zh: "探索所有款式",
      es: "Ver todos los estilos",
      fr: "Voir tous les modèles",
      de: "Alle Modelle ansehen",
      it: "Esplora tutti gli stili",
      pt: "Ver todos os estilos",
      ja: "すべてのスタイルを見る",
      ko: "모든 스타일 보기",
      ar: "تصفح كل الأنماط",
      vi: "Khám phá mọi phong cách",
      th: "สำรวจทุกสไตล์",
      id: "Jelajahi semua gaya",
      ms: "Terokai semua gaya",
    } satisfies L<string>,
  },
};

const DIVERSITY = [
  { img: reviewUser2, name: "Chen", styleEn: "Square", styleZh: "方框" },
  { img: reviewUser4, name: "Mia", styleEn: "Cat-eye", styleZh: "猫眼" },
  { img: reviewUser5, name: "Rahul", styleEn: "Clear", styleZh: "透明款" },
  { img: reviewUser1, name: "Clara", styleEn: "Aviator", styleZh: "飞行员" },
  { img: reviewUser6, name: "Matsumoto", styleEn: "Browline", styleZh: "眉线" },
  { img: reviewUser3, name: "Zara", styleEn: "Butterfly", styleZh: "蝴蝶型" },
] as const;

function AboutPage() {
  const { lang, contentLang } = useI18n();
  const heroHead = pickL(COPY.hero.headline, lang)!;
  const aiBadges = pickL(COPY.hero.aiBadges, lang)!;
  const stats = pickL(COPY.hero.stats, lang)!;
  const storyBTitle = pickL(COPY.storyB.title, lang)!;
  const storyBChips = pickL(COPY.storyB.chips, lang)!;

  return (
    <div className="bg-background">
      {/* ============================= HERO ============================= */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <h1 className="display-title text-foreground">
              {heroHead[0]}
              <br />
              {heroHead[1]}
            </h1>

            <div className="mt-5 flex items-center gap-2 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">
                {pickL(COPY.hero.rating, lang)}
              </span>
            </div>

            <p className="mt-5 text-base md:text-lg text-foreground/75 max-w-xl leading-relaxed">
              {pickL(COPY.hero.intro, lang)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <LangLink
                to="/try-on"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
              >
                <Camera className="w-4 h-4" />
                {pickL(COPY.hero.ctaTryon, lang)}
              </LangLink>
              <LangLink
                to="/products"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-border text-sm font-medium hover:border-primary/40 transition-smooth"
              >
                {pickL(COPY.hero.ctaShop, lang)}
                <ArrowRight className="w-4 h-4" />
              </LangLink>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {stats.map(([label, sub], i) => (
                <div key={i} className="text-sm">
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="text-muted-foreground mt-0.5 text-xs">
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI try-on preview card */}
          <div>
            <div className="rounded-3xl border border-border bg-card shadow-soft p-6 text-center">
              <div className="rounded-2xl bg-secondary/60 p-6 mb-5">
                <div className="relative mx-auto w-36 h-36 rounded-full overflow-hidden border-4 border-background shadow-card">
                  <img
                    src={reviewUser4}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex justify-center gap-2 -mt-3">
                  <span className="inline-flex items-center gap-1 bg-background border border-border rounded-full px-2.5 py-1 text-[11px] font-medium shadow-soft">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {aiBadges[0]}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-background border border-border rounded-full px-2.5 py-1 text-[11px] font-medium shadow-soft">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {aiBadges[1]}
                  </span>
                </div>
              </div>
              <p className="inline-flex items-center gap-2 text-sm font-medium">
                <RefreshCw className="w-4 h-4 text-primary" />
                {pickL(COPY.hero.aiCardCaption, lang)}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {pickL(COPY.hero.aiCardSub, lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STORY A ============================ */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-center">
          <div>
            <span className="eyebrow">{pickL(COPY.storyA.eyebrow, lang)}</span>
            <h2 className="section-title mt-3">
              {pickL(COPY.storyA.title, lang)}
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              {pickL(COPY.storyA.body, lang)}
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80">
              <Glasses className="w-4 h-4 text-primary" />
              {pickL(COPY.storyA.pill, lang)}
            </p>
          </div>
          <div className="relative aspect-[5/4] rounded-3xl overflow-hidden border border-border bg-secondary">
            <img
              src={hero2}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/15" />
            <span className="absolute left-1/2 bottom-6 -translate-x-1/2 inline-flex items-center gap-2 bg-background/95 backdrop-blur rounded-full px-4 py-2 text-sm font-medium shadow-soft">
              <Sparkles className="w-4 h-4 text-primary" />
              {pickL(COPY.storyA.badge, lang)}
            </span>
          </div>
        </div>
      </section>

      {/* ============================ STORY B ============================ */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-center">
          <div className="relative aspect-[5/4] rounded-3xl overflow-hidden border border-border bg-secondary lg:order-2">
            <img
              src={hero3}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/10" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center w-16 h-16 rounded-full bg-background/95 backdrop-blur shadow-card">
              <Brain className="w-7 h-7 text-primary" />
            </span>
          </div>
          <div className="lg:order-1">
            <h2 className="section-title">
              {storyBTitle[0]}
              <br />
              {storyBTitle[1]}
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              {pickL(COPY.storyB.body, lang)}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {storyBChips[0]}
              </span>
              <span className="inline-flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                {storyBChips[1]}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {(
            [
              { icon: InfinityIcon, copy: COPY.features.f1 },
              { icon: Tag, copy: COPY.features.f2 },
              { icon: Brain, copy: COPY.features.f3 },
            ] as const
          ).map(({ icon: Icon, copy }, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-card p-7 shadow-soft hover:shadow-card transition-smooth"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="subsection-title">{pickL(copy.title, lang)}</h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                {pickL(copy.body, lang)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ DIVERSITY ============================ */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="section-title">{pickL(COPY.diversity.title, lang)}</h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            {pickL(COPY.diversity.sub, lang)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DIVERSITY.map((p, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-2xl overflow-hidden border border-border"
            >
              <img
                src={p.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-3 text-center text-background text-sm font-semibold drop-shadow">
                {p.name} · {contentLang === "zh" ? p.styleZh : p.styleEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="rounded-[40px] border border-border bg-card px-8 py-14 md:py-16 text-center shadow-soft">
          <h2 className="section-title">{pickL(COPY.cta.title, lang)}</h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {pickL(COPY.cta.sub, lang)}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LangLink
              to="/try-on"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
            >
              <Camera className="w-4 h-4" />
              {pickL(COPY.cta.tryon, lang)}
            </LangLink>
            <LangLink
              to="/products"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-border text-sm font-medium hover:border-primary/40 transition-smooth"
            >
              <ShoppingBag className="w-4 h-4" />
              {pickL(COPY.cta.shop, lang)}
            </LangLink>
          </div>
          <p className="mt-10 text-xs text-muted-foreground inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {pickL(COPY.cta.footnote, lang)}
          </p>
        </div>
      </section>
    </div>
  );
}

// Static blog post registry — fallback when D1 blog_posts table is empty.
// Content here mirrors the priority-1 article from docs/system-kit/library/content-master.md.
// When a post is also inserted into D1, the D1 row becomes the source of truth
// for both /$lang/blog and /$lang/blog/$slug routes.

export type BlogPost = {
  slug: string;
  coverImageUrl: string;
  publishedAt: number; // ms
  title: Record<string, string>;
  excerpt: Record<string, string>;
  body: Record<string, string>; // HTML string for the full article page
  author: string;
};

const SITE = "https://loollook.com";

export const STATIC_BLOG_POSTS: Record<string, BlogPost> = {
  "best-reading-glasses-45-professionals-2026": {
    slug: "best-reading-glasses-45-professionals-2026",
    coverImageUrl: `${SITE}/images/product/tr90-square-reading-glasses-1.jpg`,
    publishedAt: new Date("2026-11-02T00:00:00Z").getTime(),
    author: "loollook editorial",
    title: {
      en: "Best Reading Glasses for 45-Year-Old Professionals — 2026 Guide",
      zh: "45 岁职场人士最佳阅读眼镜——2026 选购指南",
      es: "Las mejores gafas de lectura para profesionales de 45 años — Guía 2026",
      fr: "Meilleures lunettes de lecture pour les professionnels de 45 ans — Guide 2026",
      de: "Die besten Lesebrillen für 45-jährige Berufstätige — Guide 2026",
      it: "Le migliori occhiali da lettura per professionisti di 45 anni — Guida 2026",
      pt: "Melhores óculos de leitura para profissionais de 45 anos — Guia 2026",
      ja: "45 歳のプロフェッショナル向け おすすめリーディンググラス——2026 ガイド",
      ko: "45세 전문가를 위한 최고의 돋보기 안경 — 2026 가이드",
      ar: "أفضل نظارات القراءة لمحترفي سن 45 — دليل 2026",
      vi: "Kính đọc sách tốt nhất cho chuyên gia 45 tuổi — Hướng dẫn 2026",
      th: "แว่นอ่านหนังสือที่ดีที่สุดสำหรับมืออาชีพวัย 45 — คู่มือ 2026",
      id: "Kacamata Baca Terbaik untuk Profesional Usia 45 — Panduan 2026",
      ms: "Cermin Mata Baca Terbaik untuk Profesional Berumur 45 — Panduan 2026",
    },
    excerpt: {
      en: "The right reading glasses should look like a deliberate style choice, not a compromise. Here's how 45-year-old professionals pick frames that stay sharp from the first video call to the last email.",
      zh: "选对阅读眼镜应该像一次刻意的风格选择，而不是妥协。本文告诉你 45 岁职场人士如何从第一场视频会议到最后一份邮件都保持利落。",
      es: "Las gafas de lectura adecuadas deben parecer una elección de estilo deliberada, no una concesión. Así eligen los profesionales de 45 años.",
      fr: "Les bonnes lunettes de lecture doivent ressembler à un choix de style assumé, pas à un compromis. Voici comment les professionnels de 45 ans choisissent.",
      de: "Die richtige Lesebrille sollte wie eine bewusste Stilentscheidung wirken, nicht wie ein Kompromiss. So wählen 45-jährige Berufstätige.",
      it: "Le giuste occhiali da lettura devono sembrare una scelta di stile deliberata, non un compromesso. Ecco come scelgono i professionisti di 45 anni.",
      pt: "Os óculos de leitura certos devem parecer uma escolha de estilo deliberada, não uma concessão. Veja como escolhem os profissionais de 45 anos.",
      ja: "良いリーディンググラスは、妥協品ではなく意図的なスタイル選択に見えるはず。45 歳のプロがどう選ぶかを解説。",
      ko: "올바른 돋보기 안경은 타협이 아닌 의도된 스타일 선택처럼 보여야 합니다. 45세 전문가들이 고르는 법을 알아보세요.",
      ar: "يجب أن تبدو نظارات القراءة المناسبة كاختيار أسلوب متعمد، وليس كحل وسط. إليك كيف يختار محترفو سن 45.",
      vi: "Kính đọc sách đúng phải trông như một lựa chọn phong cách chủ đích, không phải sự thỏa hiệp. Đây là cách chuyên gia 45 tuổi chọn gọng.",
      th: "แว่นอ่านหนังสือที่เหมาะสมควรดูเหมือนทางเลือกสไตล์ที่ตั้งใจ ไม่ใช่การประนีประนอม นี่คือวิธีที่มืออาชีพวัย 45 เลือกกรอบ",
      id: "Kacamata baca yang tepat harus terlihat seperti pilihan gaya yang disengaja, bukan kompromi. Berikut cara profesional usia 45 memilihnya.",
      ms: "Cermin mata baca yang betul harus kelihatan seperti pilihan gaya yang disengajakan, bukan kompromi. Inilah cara profesional berumur 45 memilihnya.",
    },
    body: {
      en: `<p class="lead">At 45, the first sign is usually subtle: you hold a menu a little farther away, or you tilt the phone to catch the light. It is not a medical emergency—it is a near-vision change that happens to most professionals who spend their days switching between screens, documents, and video calls.</p>

<p>The right response is not to avoid reading glasses. It is to choose a pair that looks like a deliberate style decision, not a compromise. This guide is for professionals who want clarity without giving up their visual identity.</p>

<h2>What 45-year-old eyes actually need</h2>
<p>Most professionals at this stage need <strong>magnification lenses</strong> for close-up work, not a full prescription. The goal is simple: reduce eye strain during long reading or screen sessions.</p>
<p>Look for these practical features:</p>
<ul>
<li><strong>Clear magnification</strong> in +1.0 to +3.5 strengths, so you can match the lens to your actual need.</li>
<li><strong>Blue-light filtering</strong> if you spend more than four hours a day in front of screens.</li>
<li><strong>UV400 protection</strong> and scratch-resistant coatings as baseline quality.</li>
<li><strong>Lightweight frames</strong>—under 20 g is ideal for all-day wear.</li>
</ul>

<h2>Why some reading glasses look dated</h2>
<p>Thin wire rims, oversized generic shapes, and clinical color palettes send a signal you may not intend. The fix is not to hide the glasses. It is to treat them like any other accessory: shape, material, and color should match your face and wardrobe.</p>
<p>For oval and round faces, a square frame adds structure. For sharper jawlines, a round or Boston-oval frame softens angles. Tortoise and matte black are the safest professional neutrals; clear frames read modern and understated.</p>

<h2>Two loollook frames that fit the brief</h2>
<h3><a href="/en/product/lool-tr90-square">TR90 Square Fashion Readers</a></h3>
<p>At 19.1 g, this oversized square frame is light enough to forget during a full day of calls. The TR90 material is flexible and durable, and the 53-19-150 mm medium fit works for most face widths. It is a clean, architectural choice that reads “intentional” rather than “apologetic.”</p>
<h3><a href="/en/product/lool-8663">Vintage Round Boston Oval Fashion Readers</a></h3>
<p>For professionals who prefer a softer, more classic line, this acetate round frame delivers a warm, intellectual look. It carries the same magnification range (+1.0 to +3.5) and blue-light filtering, with a shape that pairs well with blazers and knitwear.</p>

<h2>Use the real-camera try-on before you decide</h2>
<p>Frame shape is personal. The fastest way to remove doubt is to <a href="/en/try-on">try the frames on your own face</a> with your real camera. loollook’s virtual try-on shows how the glasses sit on your actual features—not a rendered model—so you can buy with confidence.</p>

<h2>How to choose your magnification</h2>
<ul>
<li><strong>+1.0 to +1.5:</strong> Early near-vision changes, mainly for phone and tablet use.</li>
<li><strong>+2.0 to +2.5:</strong> Standard reading and computer work at arm’s length.</li>
<li><strong>+3.0 to +3.5:</strong> Detailed close work or smaller text.</li>
</ul>
<p>If you are unsure, start with the lowest strength that makes text comfortable. You can always exchange non-prescription readers within 30 days.</p>

<h2>The bottom line</h2>
<p>Reading glasses at 45 do not have to mean surrendering your style. Choose lightweight, well-shaped frames with the right magnification and modern lens protection, and they become part of your professional uniform.</p>

<p><a href="/en/products" class="inline-block mt-4">Shop all fashion readers →</a></p>

<hr/>

<h2>Frequently asked questions</h2>
<h3>Can I wear reading glasses all day?</h3>
<p>Reading glasses are designed for close-up tasks. If you need help at multiple distances, consider progressive lenses or keep separate pairs for screen and reading.</p>
<h3>Are these reading glasses a medical device?</h3>
<p>No. loollook fashion readers are magnification-only and are not a substitute for professional eye care. For persistent vision concerns, consult an eye care professional.</p>
<h3>What if the frames do not fit?</h3>
<p>loollook offers free tracked shipping on orders over $69 and 30-day free returns and exchanges on non-prescription glasses, so you can try the fit risk-free.</p>`,
    },
  },
};

export const DEFAULT_BLOG_SLUGS = Object.keys(STATIC_BLOG_POSTS);

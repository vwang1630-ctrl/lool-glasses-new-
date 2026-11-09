// AUTO-GENERATED. Localized info-page content.
// To edit, regenerate via /tmp/genwork/gen.py.

import type { Lang } from "./i18n";

export interface InfoSectionContent {
  heading: string;
  body: string;
}
export interface InfoPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSectionContent[];
  cta?: { label: string; to: string };
}

export type InfoSlug =
  | "about"
  | "why-lool"
  | "blog"
  | "accessibility"
  | "find-your-fit"
  | "choose-eyeglasses"
  | "measure-pd"
  | "prescription-guide"
  | "rewards"
  | "refer"
  | "affiliate"
  | "education-discount"
  | "promise"
  | "shipping-returns"
  | "privacy"
  | "terms"
  | "cookies"
  | "contact";

type Registry = Record<InfoSlug, Record<Lang, InfoPageContent>>;

const REGISTRY: Registry = {
  about: {
    en: {
      eyebrow: "Our Story",
      title: "About loollook",
      intro:
        "We started loollook because eyewear for the 45+ generation deserved better — lighter frames, sharper lenses, and prices that didn’t insult your intelligence.",
      sections: [
        {
          heading: "A new lens on aging eyes",
          body: "After 40, eyes change. We refused to accept clunky 'reader' frames as the only option. loollook designs eyewear engineered specifically for the modern 45–60 wearer — discreet progressive optics, weightless titanium, and silhouettes that read 'editor', not 'pharmacy'.",
        },
        {
          heading: "Direct, on purpose",
          body: "By skipping the wholesale middle layer and selling directly to you, we deliver studio-grade frames at one-third of luxury-brand pricing. No markup theatre — just craft, lenses, and shipping built into one fair price.",
        },
        {
          heading: "Designed in studio, made to last",
          body: "Every loollook frame begins as a sketch in our Milan and Tokyo studios. Hinges are tested to 20,000 cycles. Lenses are cut in ISO-certified labs. We back it all with a 365-day warranty and free lifetime adjustments.",
        },
      ],
      cta: { label: "Shop the collection", to: "/products" },
    },
    zh: {
      eyebrow: "品牌故事",
      title: "关于 loollook",
      intro:
        "loollook 为 45+ 一代而生——更轻盈的镜架、更清晰的镜片、不再侮辱智商的价格。",
      sections: [
        {
          heading: "为成熟双眼重新设计",
          body: "40 岁后，眼睛在变。我们拒绝把笨重的“老花镜”当作唯一选择。loollook 专为 45–60 岁的现代佩戴者打造——隐形渐进光学、无重感钛金属，以及读起来像“主编”而非“药店”的轮廓。",
        },
        {
          heading: "D2C，有目的的直营",
          body: "我们跳过传统批发层，直营到家——把工作室级镜架的价格做到奢侈品的三分之一。没有溢价戏法，只有工艺、镜片和运费整合在一份公道的售价里。",
        },
        {
          heading: "工作室设计，经久耐用",
          body: "每一副 loollook 都从米兰与东京工作室的草图开始。铰链经过 20,000 次开合测试，镜片在 ISO 认证实验室切割。我们以 365 天质保和终身免费调整为它背书。",
        },
      ],
      cta: { label: "浏览全系列", to: "/products" },
    },
    es: {
      eyebrow: "Nuestra historia",
      title: "Sobre loollook",
      intro:
        "Creamos loollook porque las gafas para la generación 45+ merecían algo mejor: monturas más ligeras, lentes más nítidas y precios que no insulten tu inteligencia.",
      sections: [
        {
          heading: "Una nueva lente para ojos que maduran",
          body: "Después de los 40, los ojos cambian. Nos negamos a aceptar las toscas monturas de 'lectura' como única opción. loollook diseña gafas pensadas específicamente para quienes tienen entre 45 y 60 años: óptica progresiva discreta, titanio sin peso y siluetas que dicen 'editor', no 'farmacia'.",
        },
        {
          heading: "Directos, a propósito",
          body: "Al saltarnos la capa mayorista y venderte directamente, entregamos monturas de calidad de estudio a un tercio del precio de las marcas de lujo. Sin teatro de márgenes: solo artesanía, lentes y envío incluidos en un precio justo.",
        },
        {
          heading: "Diseñadas en estudio, hechas para durar",
          body: "Cada montura loollook comienza como un boceto en nuestros estudios de Milan y Tokyo. Las bisagras se prueban con 20.000 ciclos. Las lentes se cortan en laboratorios certificados ISO. Lo respaldamos todo con una garantía de 365 días y ajustes gratuitos de por vida.",
        },
      ],
      cta: { label: "Explorar la colección", to: "/products" },
    },
    fr: {
      eyebrow: "Notre histoire",
      title: "À propos de loollook",
      intro:
        "Nous avons fondé loollook parce que les lunettes pour la génération 45+ méritaient mieux — des montures plus légères, des verres plus nets, et des prix qui n’insultent pas votre intelligence.",
      sections: [
        {
          heading: "Un nouveau regard sur les yeux qui changent",
          body: "Après 40 ans, les yeux changent. Nous avons refusé d’accepter les montures « loupes » encombrantes comme seule option. loollook dessine des lunettes pensées spécifiquement pour celles et ceux de 45 à 60 ans — optique progressive discrète, titane sans poids, et silhouettes qui évoquent « rédacteur en chef », pas « pharmacie ».",
        },
        {
          heading: "Direct, en toute conscience",
          body: "En supprimant l’intermédiaire de gros pour vendre directement, nous proposons des montures de qualité atelier à un tiers du prix des marques de luxe. Pas de théâtre tarifaire — juste l’artisanat, les verres et la livraison réunis dans un seul prix juste.",
        },
        {
          heading: "Dessinées en studio, conçues pour durer",
          body: "Chaque monture loollook naît d’un croquis dans nos studios de Milan et de Tokyo. Les charnières sont testées sur 20 000 cycles. Les verres sont taillés dans des laboratoires certifiés ISO. Le tout est garanti 365 jours, avec ajustements à vie offerts.",
        },
      ],
      cta: { label: "Voir la collection", to: "/products" },
    },
    de: {
      eyebrow: "Unsere Geschichte",
      title: "Über loollook",
      intro:
        "Wir haben loollook gegründet, weil Brillen für die Generation 45+ Besseres verdient haben — leichtere Fassungen, schärfere Gläser und Preise, die deine Intelligenz nicht beleidigen.",
      sections: [
        {
          heading: "Ein neuer Blick auf reife Augen",
          body: "Ab 40 verändern sich die Augen. Wir wollten klobige „Lesebrillen“ nicht als einzige Option akzeptieren. loollook entwirft Brillen speziell für moderne Trägerinnen und Träger zwischen 45 und 60 — unauffällige Gleitsichtoptik, federleichtes Titan und Silhouetten, die nach „Redakteur“ aussehen, nicht nach „Apotheke“.",
        },
        {
          heading: "Direkt, mit Absicht",
          body: "Indem wir den Großhandel überspringen und direkt an dich verkaufen, liefern wir Fassungen in Studioqualität zu einem Drittel des Preises von Luxusmarken. Kein Aufschlagstheater — nur Handwerk, Gläser und Versand in einem fairen Preis vereint.",
        },
        {
          heading: "Im Studio entworfen, gemacht zum Tragen",
          body: "Jede loollook-Fassung beginnt als Skizze in unseren Studios in Mailand und Tokio. Scharniere werden 20.000 Zyklen lang getestet. Gläser werden in ISO-zertifizierten Laboren geschliffen. Wir stehen für alles ein — mit 365 Tagen Garantie und lebenslangen kostenlosen Anpassungen.",
        },
      ],
      cta: { label: "Zur Kollektion", to: "/products" },
    },
    it: {
      eyebrow: "La nostra storia",
      title: "Chi è loollook",
      intro:
        "Abbiamo creato loollook perché gli occhiali per la generazione 45+ meritavano di meglio — montature più leggere, lenti più nitide e prezzi che non insultano la tua intelligenza.",
      sections: [
        {
          heading: "Una nuova lente per occhi che cambiano",
          body: "Dopo i 40, gli occhi cambiano. Ci siamo rifiutati di accettare le ingombranti montature da “lettura” come unica opzione. loollook progetta occhiali pensati specificamente per chi ha tra i 45 e i 60 anni — ottica progressiva discreta, titanio impalpabile e linee che dicono “editor”, non “farmacia”.",
        },
        {
          heading: "Diretti, per scelta",
          body: "Saltando il livello intermedio del wholesale e vendendoti direttamente, consegniamo montature di livello studio a un terzo del prezzo dei brand di lusso. Niente teatrini sui ricarichi — solo manifattura, lenti e spedizione integrate in un unico prezzo equo.",
        },
        {
          heading: "Disegnati in studio, fatti per durare",
          body: "Ogni montatura loollook nasce come schizzo nei nostri studi di Milano e Tokyo. Le cerniere sono testate per 20.000 cicli. Le lenti vengono tagliate in laboratori certificati ISO. Garantiamo tutto con una garanzia di 365 giorni e regolazioni gratuite a vita.",
        },
      ],
      cta: { label: "Esplora la collezione", to: "/products" },
    },
    pt: {
      eyebrow: "Nossa história",
      title: "Sobre a loollook",
      intro:
        "A loollook nasceu porque os óculos para a geração 45+ mereciam algo melhor — armações mais leves, lentes mais nítidas e preços que não insultem a sua inteligência.",
      sections: [
        {
          heading: "Uma nova lente para olhos que amadurecem",
          body: "Depois dos 40, os olhos mudam. Nos recusamos a aceitar armações desajeitadas de “leitura” como única opção. A loollook desenha óculos pensados especificamente para quem tem entre 45 e 60 anos — óptica progressiva discreta, titânio sem peso e silhuetas que parecem de “editor”, não de “farmácia”.",
        },
        {
          heading: "Direto, por propósito",
          body: "Ao pular a camada atacadista e vender diretamente para você, entregamos armações de qualidade de estúdio por um terço do preço das marcas de luxo. Sem teatro de margens — apenas trabalho, lentes e frete embutidos em um preço justo.",
        },
        {
          heading: "Desenhadas em estúdio, feitas para durar",
          body: "Cada armação loollook começa como um esboço em nossos estúdios em Milan e Tokyo. As dobradiças são testadas em 20.000 ciclos. As lentes são cortadas em laboratórios certificados ISO. Tudo isso vem com garantia de 365 dias e ajustes vitalícios gratuitos.",
        },
      ],
      cta: { label: "Ver a coleção", to: "/products" },
    },
    ja: {
      eyebrow: "私たちの物語",
      title: "loollook について",
      intro:
        "loollook を始めたのは、45 歳以上の世代にふさわしいアイウェアがあるはずだと考えたからです。より軽いフレーム、よりクリアなレンズ、そして知性を侮らない価格を。",
      sections: [
        {
          heading: "年齢を重ねた瞳に新しい視点を",
          body: "40 歳を過ぎると、目は変化します。私たちは野暮ったい「リーディンググラス」が唯一の選択肢であることを拒みました。loollook は 45〜60 歳の現代の装着者のために設計されたアイウェアです。目立たないプログレッシブ光学、重さを感じないチタン、そして「薬局」ではなく「エディター」を思わせるシルエットを実現しました。",
        },
        {
          heading: "あえて、ダイレクトに",
          body: "卸売の中間層を省き、お客様へ直接お届けすることで、スタジオ品質のフレームを高級ブランドの 3 分の 1 の価格でご提供します。価格のからくりはありません。クラフト、レンズ、送料をすべて含めた一つのフェアな価格だけです。",
        },
        {
          heading: "スタジオでデザイン、長く使える品質",
          body: "すべての loollook フレームは、ミラノと東京のスタジオでのスケッチから始まります。ヒンジは 20,000 回の開閉試験をクリア。レンズは ISO 認証ラボでカットされます。これらすべてに 365 日保証と生涯無料の調整サービスをお付けしています。",
        },
      ],
      cta: { label: "コレクションを見る", to: "/products" },
    },
    ko: {
      eyebrow: "우리의 이야기",
      title: "loollook 소개",
      intro:
        "loollook을 시작한 이유는 단순합니다. 45세 이상 세대의 안경은 더 나아져야 했습니다. 더 가벼운 프레임, 더 또렷한 렌즈, 그리고 소비자의 안목을 무시하지 않는 가격으로요.",
      sections: [
        {
          heading: "성숙한 눈을 위한 새로운 렌즈",
          body: "40세가 넘으면 눈은 변합니다. 우리는 투박한 '돋보기' 프레임이 유일한 선택지라는 것을 거부했습니다. loollook은 현대적인 45–60세 착용자만을 위해 설계된 안경을 만듭니다. 눈에 띄지 않는 누진 광학, 무게가 느껴지지 않는 티타늄, 그리고 '약국'이 아닌 '에디터'를 떠올리게 하는 실루엣을 갖춥니다.",
        },
        {
          heading: "의도된 D2C",
          body: "도매 중간 단계를 건너뛰고 고객에게 직접 판매함으로써, 럭셔리 브랜드 가격의 3분의 1로 스튜디오급 프레임을 제공합니다. 가격 부풀리기 쇼는 없습니다. 오직 장인의 손길, 렌즈, 그리고 배송까지 모두 포함된 하나의 공정한 가격뿐입니다.",
        },
        {
          heading: "스튜디오 디자인, 오래도록 사용",
          body: "모든 loollook 프레임은 밀라노와 도쿄 스튜디오의 스케치에서 출발합니다. 힌지는 20,000회의 개폐 테스트를 거치고, 렌즈는 ISO 인증 실험실에서 가공됩니다. 우리는 365일 품질 보증과 평생 무료 조정으로 이 모든 것을 뒷받침합니다.",
        },
      ],
      cta: { label: "컬렉션 보기", to: "/products" },
    },
    ar: {
      eyebrow: "قصتنا",
      title: "عن loollook",
      intro:
        "أطلقنا loollook لأن النظارات لجيل الـ 45+ تستحق ما هو أفضل — إطارات أخف، عدسات أوضح، وأسعار لا تستخفّ بذكائك.",
      sections: [
        {
          heading: "رؤية جديدة للعيون الناضجة",
          body: "بعد سن الأربعين تتغيّر العيون. رفضنا أن نقبل إطارات «القراءة» الثقيلة كخيار وحيد. تُصمَّم نظارات loollook خصيصًا لمن يرتديها بين عمر 45 و60 — بصريات تقدّمية خفيّة، تيتانيوم بلا وزن يُحَسّ، وأشكال توحي بـ«محرّر مجلة» لا بـ«صيدلية».",
        },
        {
          heading: "مباشر، بقصد",
          body: "بتجاوزنا طبقة الجملة الوسيطة وبيعنا المباشر إليك، نوصل لك إطارات بمستوى الاستوديو بثلث سعر العلامات الفاخرة. لا مسرحيات هوامش — فقط حرفة وعدسات وشحن مدمَجة في سعر عادل واحد.",
        },
        {
          heading: "مصممة في الاستوديو، صُنعت لتدوم",
          body: "كل إطار loollook يبدأ كرسمة في استوديوهاتنا في Milan وTokyo. تُختبَر المفاصل على 20,000 دورة فتح وإغلاق. وتُقطَع العدسات في مختبرات معتمدة من ISO. ندعم ذلك كله بضمان 365 يومًا وتعديلات مجانية مدى الحياة.",
        },
      ],
      cta: { label: "تسوق المجموعة", to: "/products" },
    },
    vi: {
      eyebrow: "Câu chuyện của chúng tôi",
      title: "Về loollook",
      intro:
        "Chúng tôi tạo ra loollook vì kính mắt cho thế hệ 45+ xứng đáng có một lựa chọn tốt hơn — gọng nhẹ hơn, tròng sắc nét hơn, và mức giá không xem thường trí thông minh của bạn.",
      sections: [
        {
          heading: "Một góc nhìn mới cho đôi mắt trưởng thành",
          body: "Sau tuổi 40, đôi mắt thay đổi. Chúng tôi từ chối chấp nhận những chiếc gọng 'đọc sách' nặng nề như lựa chọn duy nhất. loollook thiết kế kính dành riêng cho người đeo hiện đại trong độ tuổi 45–60 — quang học đa tròng kín đáo, titanium nhẹ tênh, và những đường nét trông giống 'tổng biên tập' chứ không phải 'tiệm thuốc'.",
        },
        {
          heading: "Trực tiếp, có chủ đích",
          body: "Bằng cách loại bỏ tầng trung gian bán buôn và bán thẳng đến bạn, chúng tôi mang đến gọng chuẩn studio với một phần ba giá của các thương hiệu xa xỉ. Không có màn kịch về biên lợi nhuận — chỉ có thủ công, tròng kính và phí vận chuyển gộp trong một mức giá công bằng.",
        },
        {
          heading: "Thiết kế tại studio, làm để bền lâu",
          body: "Mỗi gọng loollook bắt đầu từ một bản phác ở studio của chúng tôi tại Milan và Tokyo. Bản lề được kiểm tra qua 20,000 chu kỳ. Tròng kính được cắt tại các phòng lab đạt chuẩn ISO. Chúng tôi đứng sau tất cả với bảo hành 365 ngày và điều chỉnh miễn phí trọn đời.",
        },
      ],
      cta: { label: "Khám phá bộ sưu tập", to: "/products" },
    },
    th: {
      eyebrow: "เรื่องราวของเรา",
      title: "เกี่ยวกับ loollook",
      intro:
        "เราเริ่ม loollook เพราะแว่นตาสำหรับคนวัย 45+ สมควรได้รับสิ่งที่ดีกว่า — กรอบที่เบากว่า เลนส์ที่คมชัดกว่า และราคาที่ไม่ดูถูกสติปัญญาของคุณ",
      sections: [
        {
          heading: "มุมมองใหม่สำหรับดวงตาที่เปลี่ยนไปตามวัย",
          body: "หลังอายุ 40 ดวงตาจะเปลี่ยนแปลง เราปฏิเสธที่จะยอมรับว่ากรอบ 'แว่นอ่าน' ที่เทอะทะคือทางเลือกเดียว loollook ออกแบบแว่นสำหรับผู้สวมใส่ยุคใหม่วัย 45–60 โดยเฉพาะ — เลนส์โปรเกรสซีฟที่ดูไม่ออก ไทเทเนียมที่เบาราวกับไร้น้ำหนัก และทรงที่ดูเหมือน 'บรรณาธิการ' ไม่ใช่ 'ร้านขายยา'",
        },
        {
          heading: "ตรงถึงคุณอย่างตั้งใจ",
          body: "ด้วยการตัดชั้นค้าส่งออกและขายตรงถึงคุณ เราส่งมอบกรอบระดับสตูดิโอในราคาเพียงหนึ่งในสามของแบรนด์หรู ไม่มีการแสดงเรื่องส่วนต่างราคา — มีเพียงงานฝีมือ เลนส์ และค่าจัดส่ง รวมอยู่ในราคาเดียวที่เป็นธรรม",
        },
        {
          heading: "ออกแบบในสตูดิโอ ทำมาให้ใช้ทน",
          body: "ทุกกรอบ loollook เริ่มต้นจากภาพร่างในสตูดิโอของเราที่ Milan และ Tokyo บานพับผ่านการทดสอบ 20,000 รอบ เลนส์ถูกตัดในห้องแล็บที่ได้รับการรับรอง ISO เรารับประกันทุกอย่างด้วยการรับประกัน 365 วันและบริการปรับฟิตฟรีตลอดอายุการใช้งาน",
        },
      ],
      cta: { label: "เลือกซื้อคอลเลกชัน", to: "/products" },
    },
    id: {
      eyebrow: "Kisah Kami",
      title: "Tentang loollook",
      intro:
        "Kami memulai loollook karena kacamata untuk generasi 45+ pantas mendapat yang lebih baik — bingkai lebih ringan, lensa lebih tajam, dan harga yang tidak meremehkan kecerdasan Anda.",
      sections: [
        {
          heading: "Pandangan baru untuk mata yang menua",
          body: "Setelah usia 40, mata mengalami perubahan. Kami menolak menerima bingkai 'baca' yang kaku sebagai satu-satunya pilihan. loollook merancang kacamata khusus untuk pemakai modern usia 45–60 — optik progresif yang halus, titanium tanpa beban, dan siluet yang berkesan 'editor', bukan 'apotek'.",
        },
        {
          heading: "Langsung, dengan tujuan",
          body: "Dengan memangkas lapisan grosir dan menjual langsung kepada Anda, kami menghadirkan bingkai berkualitas studio dengan harga sepertiga dari merek mewah. Tidak ada drama markup — hanya kerajinan, lensa, dan pengiriman dalam satu harga yang adil.",
        },
        {
          heading: "Dirancang di studio, dibuat untuk tahan lama",
          body: "Setiap bingkai loollook dimulai sebagai sketsa di studio kami di Milan dan Tokyo. Engsel diuji hingga 20.000 siklus. Lensa dipotong di laboratorium bersertifikasi ISO. Kami menjamin semuanya dengan garansi 365 hari dan penyetelan gratis seumur hidup.",
        },
      ],
      cta: { label: "Lihat koleksi", to: "/products" },
    },
    ms: {
      eyebrow: "Kisah Kami",
      title: "Tentang loollook",
      intro:
        "Kami memulakan loollook kerana cermin mata untuk generasi 45+ berhak mendapat yang lebih baik — bingkai lebih ringan, kanta lebih tajam, dan harga yang tidak menghina kebijaksanaan anda.",
      sections: [
        {
          heading: "Pandangan baharu untuk mata yang menua",
          body: "Selepas usia 40, mata berubah. Kami enggan menerima bingkai 'baca' yang kekok sebagai satu-satunya pilihan. loollook mereka cermin mata khusus untuk pemakai moden berusia 45–60 — optik progresif yang halus, titanium yang seringan bulu, dan bentuk yang kelihatan seperti 'editor', bukan 'farmasi'.",
        },
        {
          heading: "Terus kepada anda, dengan tujuan",
          body: "Dengan melangkau lapisan borong dan menjual terus kepada anda, kami menyampaikan bingkai bertaraf studio pada satu pertiga harga jenama mewah. Tiada drama mark-up — hanya hasil kerja tangan, kanta, dan penghantaran dalam satu harga yang adil.",
        },
        {
          heading: "Direka di studio, dibuat untuk tahan lama",
          body: "Setiap bingkai loollook bermula sebagai lakaran di studio kami di Milan dan Tokyo. Engsel diuji sehingga 20,000 kitaran. Kanta dipotong di makmal yang diperakui ISO. Kami menyokong semuanya dengan jaminan 365 hari dan pelarasan percuma seumur hidup.",
        },
      ],
      cta: { label: "Lihat koleksi", to: "/products" },
    },
  },
  "why-lool": {
    en: {
      eyebrow: "The loollook Difference",
      title: "Why choose loollook",
      intro:
        "Five reasons we’re becoming the eyewear of choice for designers, doctors, and discerning readers.",
      sections: [
        {
          heading: "Featherlight frames",
          body: "Most loollook frames weigh under 12 grams — about half a standard pair. You’ll forget you’re wearing them.",
        },
        {
          heading: "Lenses included, always",
          body: "Anti-reflective, anti-scratch, UV-blocking, and blue-light coatings come standard at no extra charge. No checkout surprises.",
        },
        {
          heading: "One fair price",
          body: "From $95 with prescription lenses. Compare that to $400 at the optician for the same optical quality.",
        },
        {
          heading: "Free tracked shipping over $69",
          body: "Free tracked shipping on orders over $69; orders under $69 have a flat $9.9 shipping fee. Import duties are pre-paid for most destinations. Delivery takes 7–30 days depending on your country.",
        },
        {
          heading: "365-day warranty",
          body: "If anything fails because of how we made it, we replace it free for a full year — including the lenses.",
        },
      ],
      cta: { label: "Browse all frames", to: "/products" },
    },
    zh: {
      eyebrow: "loollook 的不同",
      title: "为什么选择 loollook",
      intro: "我们成为设计师、医生与挑剔读者首选眼镜的五个理由。",
      sections: [
        {
          heading: "羽轻镜架",
          body: "大多数 loollook 镜架重量低于 12 克——约为标准眼镜的一半。戴上去就像没有戴。",
        },
        {
          heading: "镜片标配",
          body: "防眩光、防刮、UV 防护、防蓝光涂层全部标配，不加价。结账时没有任何意外。",
        },
        {
          heading: "公道价",
          body: "含处方镜片起售价 95 美元。同等光学质量在线下视光店通常需要 400 美元。",
        },
        {
          heading: "满 $69 免运费（可追踪）",
          body: "订单满 $69 免运费并附实时追踪；不满 $69 收取 $9.9 固定运费。大多数目的地的进口关税由我们预付。根据所在国家/地区不同，送达时间为 7–30 天。",
        },
        {
          heading: "365 天质保",
          body: "因制造问题导致的任何故障，整一年内（包括镜片）我们免费更换。",
        },
      ],
      cta: { label: "浏览所有镜架", to: "/products" },
    },
    es: {
      eyebrow: "La diferencia loollook",
      title: "Por qué elegir loollook",
      intro:
        "Cinco razones por las que nos estamos convirtiendo en las gafas favoritas de diseñadores, médicos y lectores exigentes.",
      sections: [
        {
          heading: "Monturas ligeras como una pluma",
          body: "La mayoría de las monturas loollook pesan menos de 12 gramos, aproximadamente la mitad de un par estándar. Olvidarás que las llevas puestas.",
        },
        {
          heading: "Cristales incluidos, siempre",
          body: "Los tratamientos antirreflejante, antirrayadura, anti-UV y filtro de luz azul vienen de serie sin coste adicional. Sin sorpresas al pagar.",
        },
        {
          heading: "Un precio justo",
          body: "Desde $95 con lentes graduadas. Compáralo con los $400 de la óptica por la misma calidad óptica.",
        },
        {
          heading: "Envío gratis y con seguimiento desde $69",
          body: "Envío gratis y con seguimiento en pedidos superiores a $69; los pedidos inferiores a $69 tienen una tarifa plana de $9.9. Los aranceles están prepagados para la mayoría de destinos. La entrega tarda de 7 a 30 días según tu país.",
        },
        {
          heading: "Garantía de 365 días",
          body: "Si algo falla por nuestra fabricación, lo reemplazamos gratis durante un año completo, incluidas las lentes.",
        },
      ],
      cta: { label: "Ver todas las monturas", to: "/products" },
    },
    fr: {
      eyebrow: "La différence loollook",
      title: "Pourquoi choisir loollook",
      intro:
        "Cinq raisons pour lesquelles nous devenons les lunettes préférées des designers, des médecins et des lecteurs exigeants.",
      sections: [
        {
          heading: "Montures plumes",
          body: "La plupart des montures loollook pèsent moins de 12 grammes — environ la moitié d’une paire standard. Vous oublierez que vous les portez.",
        },
        {
          heading: "Verres toujours inclus",
          body: "Traitements antireflet, antirayure, anti-UV et anti-lumière bleue inclus de série, sans surcoût. Aucune mauvaise surprise au paiement.",
        },
        {
          heading: "Un prix juste",
          body: "À partir de $95 avec verres correcteurs. À comparer aux $400 chez l’opticien pour la même qualité optique.",
        },
        {
          heading: "Livraison gratuite et suivie dès $69",
          body: "Livraison gratuite et suivie dès 69 $ d'achat ; en dessous de 69 $, frais de port fixes de 9,9 $. Les droits de douane sont prépayés pour la plupart des destinations. Délai de livraison : 7 à 30 jours selon votre pays.",
        },
        {
          heading: "Garantie 365 jours",
          body: "Si quoi que ce soit défaille à cause d’un défaut de fabrication, nous le remplaçons gratuitement pendant une année entière — verres compris.",
        },
      ],
      cta: { label: "Voir toutes les montures", to: "/products" },
    },
    de: {
      eyebrow: "Der loollook-Unterschied",
      title: "Warum loollook",
      intro:
        "Fünf Gründe, warum wir die Brille der Wahl für Designerinnen, Ärzte und anspruchsvolle Leser werden.",
      sections: [
        {
          heading: "Federleichte Fassungen",
          body: "Die meisten loollook-Fassungen wiegen unter 12 Gramm — etwa die Hälfte einer Standardbrille. Du vergisst, dass du sie trägst.",
        },
        {
          heading: "Gläser immer inklusive",
          body: "Entspiegelung, Kratzschutz, UV-Schutz und Blaulichtfilter sind ohne Aufpreis Standard. Keine Überraschungen an der Kasse.",
        },
        {
          heading: "Ein fairer Preis",
          body: "Ab $95 mit Korrektionsgläsern. Vergleiche das mit $400 beim Optiker für die gleiche optische Qualität.",
        },
        {
          heading: "Kostenloser, nachverfolgbarer Versand ab $69",
          body: "Kostenloser, nachverfolgbarer Versand ab 69 $; unter 69 $ fällt eine Versandpauschale von 9,9 $ an. Einfuhrzölle sind für die meisten Länder vorausbezahlt. Die Lieferung dauert je nach Land 7–30 Tage.",
        },
        {
          heading: "365 Tage Garantie",
          body: "Wenn etwas wegen unserer Verarbeitung versagt, ersetzen wir es ein ganzes Jahr lang kostenlos — Gläser inklusive.",
        },
      ],
      cta: { label: "Alle Fassungen ansehen", to: "/products" },
    },
    it: {
      eyebrow: "La differenza loollook",
      title: "Perché scegliere loollook",
      intro:
        "Cinque ragioni per cui stiamo diventando gli occhiali preferiti di designer, medici e lettori esigenti.",
      sections: [
        {
          heading: "Montature leggerissime",
          body: "La maggior parte delle montature loollook pesa meno di 12 grammi — circa la metà di un paio standard. Ti dimenticherai di indossarle.",
        },
        {
          heading: "Lenti sempre incluse",
          body: "Trattamenti antiriflesso, antigraffio, anti-UV e anti luce blu sono di serie senza costi aggiuntivi. Nessuna sorpresa al checkout.",
        },
        {
          heading: "Un prezzo giusto",
          body: "Da $95 con lenti graduate. Confrontalo con i $400 dall’ottico per la stessa qualità ottica.",
        },
        {
          heading: "Spedizione gratuita e tracciabile sopra $69",
          body: "Spedizione gratuita e tracciata per ordini superiori a 69 $; sotto i 69 $ si applica una tariffa fissa di 9,9 $. I dazi sono prepagati per la maggior parte delle destinazioni. La consegna richiede 7–30 giorni a seconda del paese.",
        },
        {
          heading: "Garanzia 365 giorni",
          body: "Se qualcosa cede a causa di come l’abbiamo realizzato, lo sostituiamo gratis per un anno intero — lenti comprese.",
        },
      ],
      cta: { label: "Tutte le montature", to: "/products" },
    },
    pt: {
      eyebrow: "A diferença loollook",
      title: "Por que escolher a loollook",
      intro:
        "Cinco razões pelas quais estamos nos tornando os óculos preferidos de designers, médicos e leitores exigentes.",
      sections: [
        {
          heading: "Armações leves como uma pena",
          body: "A maior parte das armações loollook pesa menos de 12 gramas — cerca da metade de um par padrão. Você vai esquecer que está usando.",
        },
        {
          heading: "Lentes sempre incluídas",
          body: "Tratamentos antirreflexo, antirrisco, anti-UV e contra luz azul vêm de série, sem custo adicional. Sem surpresas no checkout.",
        },
        {
          heading: "Um preço justo",
          body: "A partir de $95 com lentes de grau. Compare com $400 na ótica para a mesma qualidade óptica.",
        },
        {
          heading: "Frete grátis e rastreável acima de $69",
          body: "Frete grátis e rastreado em pedidos acima de 69 $; abaixo de 69 $ há uma taxa fixa de 9,9 $. Os impostos de importação são pré-pagos para a maioria dos destinos. A entrega leva de 7 a 30 dias, conforme o seu país.",
        },
        {
          heading: "Garantia de 365 dias",
          body: "Se algo falhar por causa de como produzimos, substituímos gratuitamente por um ano inteiro — incluindo as lentes.",
        },
      ],
      cta: { label: "Ver todas as armações", to: "/products" },
    },
    ja: {
      eyebrow: "loollook の違い",
      title: "loollook が選ばれる理由",
      intro:
        "デザイナー、医師、目の肥えた読者から loollook が選ばれている 5 つの理由をご紹介します。",
      sections: [
        {
          heading: "羽のような軽さのフレーム",
          body: "loollook のフレームのほとんどは 12 グラム未満。標準的なメガネの約半分の重さです。かけていることを忘れてしまうほどの軽さです。",
        },
        {
          heading: "レンズは常に標準装備",
          body: "反射防止、傷防止、UV カット、ブルーライトカットの各コーティングを追加料金なしで標準装備。会計時に驚かされることはありません。",
        },
        {
          heading: "フェアな一律価格",
          body: "度付きレンズ込みで $95 から。同じ光学品質を眼鏡店で求めると $400 する場合と比較してみてください。",
        },
        {
          heading: "$69以上で送料無料（追跡付き）",
          body: "69ドル以上のご注文は送料無料・追跡付き、69ドル未満は送料一律9.9ドルです。ほとんどの配送先で輸入関税は当社が前払いします。お届けまでの日数は国により異なり、7〜30日です。",
        },
        {
          heading: "365 日保証",
          body: "製造上の不具合があれば、丸 1 年間、レンズを含めて無料で交換いたします。",
        },
      ],
      cta: { label: "すべてのフレームを見る", to: "/products" },
    },
    ko: {
      eyebrow: "loollook의 차이",
      title: "왜 loollook인가",
      intro:
        "디자이너, 의사, 그리고 까다로운 안목의 독자들이 loollook을 선택하는 다섯 가지 이유입니다.",
      sections: [
        {
          heading: "깃털처럼 가벼운 프레임",
          body: "대부분의 loollook 프레임은 12g 미만으로, 일반 안경의 약 절반 수준입니다. 쓰고 있다는 사실조차 잊게 됩니다.",
        },
        {
          heading: "렌즈는 언제나 포함",
          body: "반사 방지, 긁힘 방지, 자외선 차단, 블루라이트 차단 코팅이 모두 추가 비용 없이 기본 제공됩니다. 결제 단계에서 깜짝 추가 요금은 없습니다.",
        },
        {
          heading: "공정한 단일 가격",
          body: "처방 렌즈 포함 $95부터 시작합니다. 같은 광학 품질의 안경원 가격 $400과 비교해 보세요.",
        },
        {
          heading: "$69 이상 무료 추적 배송",
          body: "$69 이상 주문은 무료 추적 배송, $69 미만은 고정 배송비 $9.9입니다. 대부분의 배송지에 대해 수입 관세를 선납합니다. 배송 기간은 국가에 따라 7–30일입니다.",
        },
        {
          heading: "365일 보증",
          body: "제조상의 결함으로 인한 문제가 발생하면, 렌즈를 포함해 1년 동안 무상으로 교체해 드립니다.",
        },
      ],
      cta: { label: "모든 프레임 보기", to: "/products" },
    },
    ar: {
      eyebrow: "الفرق مع loollook",
      title: "لماذا تختار loollook",
      intro:
        "خمسة أسباب جعلتنا الاختيار الأول للمصمّمين والأطباء والقرّاء أصحاب الذوق الدقيق.",
      sections: [
        {
          heading: "إطارات بخفّة الريشة",
          body: "معظم إطارات loollook يقلّ وزنها عن 12 غرامًا — أي نحو نصف وزن نظارة عادية. ستنسى أنك ترتديها.",
        },
        {
          heading: "العدسات مشمولة دائمًا",
          body: "طلاءات مضادة للانعكاس، مقاومة للخدش، حاجبة للأشعة فوق البنفسجية، وفلتر للضوء الأزرق — كلها قياسية دون أي رسوم إضافية. لا مفاجآت عند الدفع.",
        },
        {
          heading: "سعر عادل واحد",
          body: "تبدأ من $95 شاملة العدسات الطبية. قارن ذلك بـ $400 لدى أخصائي البصريات لجودة بصرية مكافئة.",
        },
        {
          heading: "شحن مجاني مع تتبع للطلبات فوق 69$",
          body: "شحن مجاني مع تتبع للطلبات التي تزيد عن 69 دولارًا، ورسوم شحن ثابتة بقيمة 9.9 دولار للطلبات الأقل من ذلك. الرسوم الجمركية مدفوعة مسبقًا لمعظم الوجهات. يستغرق التوصيل من 7 إلى 30 يومًا حسب بلدك.",
        },
        {
          heading: "ضمان 365 يومًا",
          body: "إذا تعطّل أي شيء بسبب طريقة تصنيعنا، نستبدله مجانًا لعام كامل — بما في ذلك العدسات.",
        },
      ],
      cta: { label: "تصفح كل الإطارات", to: "/products" },
    },
    vi: {
      eyebrow: "Sự khác biệt của loollook",
      title: "Vì sao chọn loollook",
      intro:
        "Năm lý do khiến chúng tôi trở thành lựa chọn kính mắt của các nhà thiết kế, bác sĩ và những độc giả khó tính.",
      sections: [
        {
          heading: "Gọng nhẹ như lông vũ",
          body: "Hầu hết gọng loollook nặng dưới 12 gram — khoảng nửa trọng lượng của một cặp tiêu chuẩn. Bạn sẽ quên rằng mình đang đeo kính.",
        },
        {
          heading: "Tròng luôn được bao gồm",
          body: "Lớp phủ chống chói, chống xước, chống tia UV và chống ánh sáng xanh là tiêu chuẩn, không tính thêm phí. Không có bất ngờ khi thanh toán.",
        },
        {
          heading: "Một mức giá công bằng",
          body: "Từ $95 đã bao gồm tròng có độ. So với $400 tại tiệm kính cho cùng chất lượng quang học.",
        },
        {
          heading: "Miễn phí vận chuyển có theo dõi từ $69",
          body: "Miễn phí vận chuyển có theo dõi cho đơn trên $69; đơn dưới $69 có phí cố định $9.9. Thuế nhập khẩu được trả trước cho hầu hết điểm đến. Thời gian giao hàng 7–30 ngày tùy quốc gia.",
        },
        {
          heading: "Bảo hành 365 ngày",
          body: "Nếu có bất kỳ hư hỏng nào do lỗi sản xuất, chúng tôi thay miễn phí trong cả một năm — bao gồm cả tròng kính.",
        },
      ],
      cta: { label: "Xem tất cả gọng", to: "/products" },
    },
    th: {
      eyebrow: "ความแตกต่างของ loollook",
      title: "ทำไมต้องเลือก loollook",
      intro:
        "ห้าเหตุผลที่ทำให้เรากลายเป็นแว่นตาที่นักออกแบบ แพทย์ และนักอ่านผู้พิถีพิถันเลือกใช้",
      sections: [
        {
          heading: "กรอบเบาเหมือนขนนก",
          body: "กรอบ loollook ส่วนใหญ่หนักไม่ถึง 12 กรัม — ประมาณครึ่งหนึ่งของแว่นมาตรฐานทั่วไป คุณจะลืมไปว่ากำลังสวมมันอยู่",
        },
        {
          heading: "เลนส์รวมอยู่แล้วเสมอ",
          body: "การเคลือบป้องกันแสงสะท้อน กันรอยขีดข่วน กัน UV และกันแสงสีฟ้าเป็นมาตรฐานโดยไม่มีค่าใช้จ่ายเพิ่ม ไม่มีเรื่องน่าประหลาดใจตอนชำระเงิน",
        },
        {
          heading: "ราคาที่เป็นธรรมเดียว",
          body: "เริ่มต้นที่ $95 พร้อมเลนส์สายตา เทียบกับ $400 ที่ร้านแว่นตาสำหรับคุณภาพเลนส์ระดับเดียวกัน",
        },
        {
          heading: "จัดส่งฟรีพร้อมติดตามพัสดุตั้งแต่ $69",
          body: "จัดส่งฟรีพร้อมติดตามพัสดุเมื่อสั่งซื้อเกิน $69 ต่ำกว่า $69 มีค่าจัดส่งคงที่ $9.9 ภาษีนำเข้าชำระล่วงหน้าสำหรับปลายทางส่วนใหญ่ ระยะเวลาจัดส่ง 7–30 วัน ขึ้นอยู่กับประเทศของคุณ",
        },
        {
          heading: "รับประกัน 365 วัน",
          body: "หากมีปัญหาใดเกิดจากการผลิตของเรา เราจะเปลี่ยนใหม่ให้ฟรีตลอดหนึ่งปีเต็ม — รวมถึงเลนส์ด้วย",
        },
      ],
      cta: { label: "ดูกรอบแว่นทั้งหมด", to: "/products" },
    },
    id: {
      eyebrow: "Perbedaan loollook",
      title: "Mengapa memilih loollook",
      intro:
        "Lima alasan kami menjadi kacamata pilihan para desainer, dokter, dan pembaca yang selektif.",
      sections: [
        {
          heading: "Bingkai seringan bulu",
          body: "Kebanyakan bingkai loollook beratnya di bawah 12 gram — sekitar separuh dari kacamata standar. Anda akan lupa sedang mengenakannya.",
        },
        {
          heading: "Lensa selalu termasuk",
          body: "Lapisan anti-pantul, anti-gores, anti-UV, dan filter cahaya biru sudah standar tanpa biaya tambahan. Tidak ada kejutan saat checkout.",
        },
        {
          heading: "Satu harga yang adil",
          body: "Mulai dari $95 sudah termasuk lensa resep. Bandingkan dengan $400 di optisi untuk kualitas optik yang sama.",
        },
        {
          heading: "Gratis ongkir dengan pelacakan di atas $69",
          body: "Gratis ongkir dengan pelacakan untuk pesanan di atas $69; di bawah $69 dikenakan biaya tetap $9,9. Bea masuk dibayar di muka untuk sebagian besar tujuan. Pengiriman memakan waktu 7–30 hari tergantung negara Anda.",
        },
        {
          heading: "Garansi 365 hari",
          body: "Jika ada yang gagal karena cara kami membuatnya, kami menggantinya gratis selama setahun penuh — termasuk lensanya.",
        },
      ],
      cta: { label: "Jelajahi semua bingkai", to: "/products" },
    },
    ms: {
      eyebrow: "Perbezaan loollook",
      title: "Mengapa pilih loollook",
      intro:
        "Lima sebab kami menjadi pilihan cermin mata para pereka, doktor, dan pembaca yang teliti.",
      sections: [
        {
          heading: "Bingkai seringan bulu",
          body: "Kebanyakan bingkai loollook beratnya kurang daripada 12 gram — kira-kira separuh berat cermin mata standard. Anda akan terlupa bahawa anda sedang memakainya.",
        },
        {
          heading: "Kanta sentiasa disertakan",
          body: "Salutan anti-pantulan, anti-calar, anti-UV, dan penapis cahaya biru adalah standard tanpa caj tambahan. Tiada kejutan semasa pembayaran.",
        },
        {
          heading: "Satu harga yang adil",
          body: "Bermula dari $95 termasuk kanta preskripsi. Bandingkan dengan $400 di kedai optik untuk kualiti optik yang sama.",
        },
        {
          heading: "Penghantaran percuma dengan penjejakan melebihi $69",
          body: "Penghantaran percuma dengan penjejakan untuk pesanan melebihi $69; bawah $69 dikenakan yuran tetap $9.9. Duti import dibayar awal untuk kebanyakan destinasi. Penghantaran mengambil masa 7–30 hari bergantung pada negara anda.",
        },
        {
          heading: "Jaminan 365 hari",
          body: "Jika ada yang rosak kerana cara kami membuatnya, kami menggantinya secara percuma untuk setahun penuh — termasuk kanta.",
        },
      ],
      cta: { label: "Layari semua bingkai", to: "/products" },
    },
  },
  blog: {
    en: {
      eyebrow: "Stories",
      title: "The loollook Journal",
      intro:
        "Notes on style, science, and seeing well — written by our optometrists, designers, and editors.",
      sections: [
        {
          heading: "Featured this month",
          body: "‘How progressive lenses actually work — and why most people get them wrong.’ A 6-minute read by Dr. Lin, our chief optometrist.",
        },
        {
          heading: "Style guides",
          body: "Frame shapes for every face. Reading-glass styling that doesn’t age you. Travel-ready titanium for the long-haul commuter.",
        },
        {
          heading: "The science of seeing",
          body: "Blue-light evidence, presbyopia at 45, and the case for annual eye exams. Plain-language deep dives.",
        },
      ],
    },
    zh: {
      eyebrow: "故事专栏",
      title: "loollook 专栏",
      intro:
        "关于风格、科学与“看清楚”的思考——由我们的视光师、设计师与编辑撰写。",
      sections: [
        {
          heading: "本月精选",
          body: "本月推荐：《渐进镜片到底是怎么工作的——以及为什么大多数人都误解了》。我们的首席视光师 Lin 医生，6 分钟阅读。",
        },
        {
          heading: "风格指南",
          body: "适合每张脸的镜架形状。不让你显老的老花镜搭配。长途通勤者的轻量钛金属。",
        },
        {
          heading: "视觉科学",
          body: "蓝光的科学证据、45 岁开始的老花、为什么每年要做一次眼检——通俗易懂的深度解读。",
        },
      ],
    },
    es: {
      eyebrow: "Historias",
      title: "El Diario loollook",
      intro:
        "Notas sobre estilo, ciencia y ver bien, escritas por nuestros optometristas, diseñadores y editores.",
      sections: [
        {
          heading: "Destacado este mes",
          body: "‘Cómo funcionan realmente las lentes progresivas y por qué la mayoría las usa mal.’ Una lectura de 6 minutos por la Dra. Lin, nuestra optometrista jefe.",
        },
        {
          heading: "Guías de estilo",
          body: "Formas de montura para cada rostro. Gafas de lectura con estilo que no te envejecen. Titanio listo para viajar para quienes recorren grandes distancias.",
        },
        {
          heading: "La ciencia de ver",
          body: "Evidencia sobre la luz azul, presbicia a los 45 y los motivos para hacerse un examen ocular anual. Análisis a fondo en lenguaje claro.",
        },
      ],
    },
    fr: {
      eyebrow: "Histoires",
      title: "Le Journal loollook",
      intro:
        "Notes sur le style, la science et le bien-voir — écrites par nos optométristes, designers et rédacteurs.",
      sections: [
        {
          heading: "À la une ce mois-ci",
          body: "« Comment fonctionnent réellement les verres progressifs — et pourquoi la plupart des gens s’y prennent mal. » Une lecture de 6 minutes par le Dr Lin, notre optométriste en chef.",
        },
        {
          heading: "Guides de style",
          body: "Des formes de monture pour chaque visage. Le style « lunettes de lecture » qui ne vous vieillit pas. Le titane prêt à voyager pour les grands trajets.",
        },
        {
          heading: "La science de la vue",
          body: "Les preuves sur la lumière bleue, la presbytie à 45 ans, et pourquoi faire un examen de la vue chaque année. Des analyses approfondies en langage clair.",
        },
      ],
    },
    de: {
      eyebrow: "Geschichten",
      title: "Das loollook-Journal",
      intro:
        "Notizen zu Stil, Wissenschaft und gutem Sehen — geschrieben von unseren Augenoptikerinnen, Designern und Redakteuren.",
      sections: [
        {
          heading: "Diesen Monat im Fokus",
          body: "„Wie Gleitsichtgläser wirklich funktionieren — und warum die meisten sie falsch tragen.“ 6 Minuten Lesezeit von Dr. Lin, unserer leitenden Augenoptikerin.",
        },
        {
          heading: "Style-Guides",
          body: "Fassungsformen für jedes Gesicht. Lesebrillen-Styling, das dich nicht altert. Reisetaugliches Titan für Langstreckenpendler.",
        },
        {
          heading: "Die Wissenschaft des Sehens",
          body: "Belege rund um Blaulicht, Alterssichtigkeit ab 45 und warum sich ein jährlicher Sehtest lohnt. Tiefgehend, in verständlicher Sprache.",
        },
      ],
    },
    it: {
      eyebrow: "Storie",
      title: "Il Giornale loollook",
      intro:
        "Note su stile, scienza e visione — scritte dai nostri optometristi, designer ed editor.",
      sections: [
        {
          heading: "In primo piano questo mese",
          body: "“Come funzionano davvero le lenti progressive — e perché la maggior parte delle persone le sceglie nel modo sbagliato.” Una lettura di 6 minuti a cura della Dr.ssa Lin, la nostra optometrista capo.",
        },
        {
          heading: "Guide di stile",
          body: "Forme di montatura per ogni viso. Lo styling degli occhiali da lettura che non ti invecchia. Titanio pronto al viaggio per chi si sposta su lunghe distanze.",
        },
        {
          heading: "La scienza del vedere",
          body: "Evidenze sulla luce blu, presbiopia a 45 anni e perché vale la pena fare un controllo oculistico ogni anno. Approfondimenti in linguaggio semplice.",
        },
      ],
    },
    pt: {
      eyebrow: "Histórias",
      title: "O Diário loollook",
      intro:
        "Reflexões sobre estilo, ciência e enxergar bem — escritas por nossos optometristas, designers e editores.",
      sections: [
        {
          heading: "Em destaque neste mês",
          body: "“Como as lentes progressivas realmente funcionam — e por que a maioria das pessoas entende errado.” Uma leitura de 6 minutos pela Dra. Lin, nossa optometrista-chefe.",
        },
        {
          heading: "Guias de estilo",
          body: "Formatos de armação para cada rosto. Estilos de óculos de leitura que não envelhecem você. Titânio pronto para viagem para quem encara longos trajetos.",
        },
        {
          heading: "A ciência de enxergar",
          body: "Evidências sobre luz azul, presbiopia aos 45 anos e os motivos para fazer exames de vista anuais. Mergulhos profundos em linguagem simples.",
        },
      ],
    },
    ja: {
      eyebrow: "ストーリー",
      title: "loollook ジャーナル",
      intro:
        "スタイル、サイエンス、そして「よく見る」ことについての記録。当社のオプトメトリスト、デザイナー、エディターが執筆しています。",
      sections: [
        {
          heading: "今月の注目記事",
          body: "「プログレッシブレンズの本当の仕組み、そしてなぜ多くの人が誤解しているのか」。当社のチーフ・オプトメトリスト Dr. Lin による 6 分の記事です。",
        },
        {
          heading: "スタイルガイド",
          body: "あらゆる顔立ちに合うフレームの形。年齢を感じさせないリーディンググラスのスタイリング。長距離通勤者のためのトラベル仕様チタン。",
        },
        {
          heading: "見ることの科学",
          body: "ブルーライトのエビデンス、45 歳からの老眼、毎年の眼科検診の意義。わかりやすい言葉で深掘りします。",
        },
      ],
    },
    ko: {
      eyebrow: "스토리",
      title: "loollook 저널",
      intro:
        "스타일, 과학, 그리고 잘 보는 것에 관한 이야기 — 저희 검안의, 디자이너, 에디터가 직접 씁니다.",
      sections: [
        {
          heading: "이번 달 추천",
          body: "'누진 렌즈는 실제로 어떻게 작동하는가 — 그리고 대부분의 사람들이 왜 잘못 알고 있는가.' 수석 검안의 Dr. Lin이 쓴 6분 분량의 글입니다.",
        },
        {
          heading: "스타일 가이드",
          body: "얼굴형마다 어울리는 프레임. 나이 들어 보이지 않는 돋보기 스타일링. 장거리 출퇴근족을 위한 여행 친화적 티타늄.",
        },
        {
          heading: "보는 것의 과학",
          body: "블루라이트에 관한 과학적 근거, 45세부터 시작되는 노안, 그리고 매년 시력 검사가 필요한 이유까지. 쉬운 언어로 풀어낸 심층 분석입니다.",
        },
      ],
    },
    ar: {
      eyebrow: "قصص",
      title: "مجلة loollook",
      intro:
        "ملاحظات حول الأناقة والعلم والرؤية الجيدة — يكتبها أخصائيو البصريات والمصمّمون والمحرّرون لدينا.",
      sections: [
        {
          heading: "المميّز هذا الشهر",
          body: "«كيف تعمل العدسات التقدّمية فعلًا — ولماذا يخطئ معظم الناس في فهمها». مقال بقراءة 6 دقائق بقلم Dr. Lin، كبيرة أخصائيي البصريات لدينا.",
        },
        {
          heading: "أدلة الأسلوب",
          body: "أشكال إطارات لكل وجه. تنسيق نظارات قراءة لا يضيف إلى عمرك سنوات. تيتانيوم جاهز للسفر للمتنقّلين في الرحلات الطويلة.",
        },
        {
          heading: "علم الرؤية",
          body: "الأدلة العلمية حول الضوء الأزرق، طول النظر الشيخوخي في الـ 45، ولماذا يجب إجراء فحص بصر سنوي. تحليلات معمّقة بلغة بسيطة.",
        },
      ],
    },
    vi: {
      eyebrow: "Câu chuyện",
      title: "Tạp chí loollook",
      intro:
        "Những ghi chú về phong cách, khoa học và cách nhìn rõ — viết bởi các bác sĩ đo mắt, nhà thiết kế và biên tập viên của chúng tôi.",
      sections: [
        {
          heading: "Nổi bật tháng này",
          body: "'Cách tròng đa tròng thực sự hoạt động — và vì sao đa số mọi người dùng sai cách.' Bài đọc 6 phút từ Dr. Lin, trưởng bộ phận đo mắt của chúng tôi.",
        },
        {
          heading: "Hướng dẫn phong cách",
          body: "Dáng gọng cho mọi khuôn mặt. Cách phối kính lão không khiến bạn trông già đi. Titanium sẵn sàng cho người đi lại đường dài.",
        },
        {
          heading: "Khoa học của cái nhìn",
          body: "Bằng chứng về ánh sáng xanh, lão thị ở tuổi 45, và lý do vì sao nên khám mắt mỗi năm. Phân tích sâu bằng ngôn ngữ dễ hiểu.",
        },
      ],
    },
    th: {
      eyebrow: "เรื่องราว",
      title: "loollook Journal",
      intro:
        "บันทึกเรื่องสไตล์ วิทยาศาสตร์ และการมองเห็นที่ดี — เขียนโดยนักทัศนมาตร นักออกแบบ และบรรณาธิการของเรา",
      sections: [
        {
          heading: "แนะนำประจำเดือนนี้",
          body: "'เลนส์โปรเกรสซีฟทำงานอย่างไรจริง ๆ — และทำไมคนส่วนใหญ่ใช้มันผิด' บทความ 6 นาทีโดย Dr. Lin หัวหน้านักทัศนมาตรของเรา",
        },
        {
          heading: "คู่มือสไตล์",
          body: "ทรงกรอบสำหรับทุกใบหน้า การจัดสไตล์แว่นอ่านที่ไม่ทำให้คุณดูแก่ ไทเทเนียมพร้อมเดินทางสำหรับคนเดินทางระยะไกล",
        },
        {
          heading: "วิทยาศาสตร์ของการมองเห็น",
          body: "หลักฐานเรื่องแสงสีฟ้า สายตายาวตามวัยที่อายุ 45 และเหตุผลที่ควรตรวจตาทุกปี วิเคราะห์เชิงลึกด้วยภาษาที่เข้าใจง่าย",
        },
      ],
    },
    id: {
      eyebrow: "Cerita",
      title: "Jurnal loollook",
      intro:
        "Catatan tentang gaya, sains, dan melihat dengan baik — ditulis oleh para optometris, desainer, dan editor kami.",
      sections: [
        {
          heading: "Sorotan bulan ini",
          body: "'Cara kerja sebenarnya lensa progresif — dan mengapa kebanyakan orang salah memakainya.' Bacaan 6 menit oleh Dr. Lin, kepala optometris kami.",
        },
        {
          heading: "Panduan gaya",
          body: "Bentuk bingkai untuk setiap wajah. Cara memadukan kacamata baca yang tidak menuakan Anda. Titanium siap bepergian untuk para komuter jarak jauh.",
        },
        {
          heading: "Sains melihat",
          body: "Bukti tentang cahaya biru, presbiopia di usia 45, dan alasan untuk pemeriksaan mata tahunan. Telaah mendalam dengan bahasa sederhana.",
        },
      ],
    },
    ms: {
      eyebrow: "Cerita",
      title: "Jurnal loollook",
      intro:
        "Nota tentang gaya, sains, dan melihat dengan jelas — ditulis oleh ahli optometri, pereka, dan editor kami.",
      sections: [
        {
          heading: "Sorotan bulan ini",
          body: "'Bagaimana sebenarnya kanta progresif berfungsi — dan mengapa kebanyakan orang salah menggunakannya.' Bacaan 6 minit oleh Dr. Lin, ketua optometri kami.",
        },
        {
          heading: "Panduan gaya",
          body: "Bentuk bingkai untuk setiap wajah. Gaya cermin mata baca yang tidak menuakan anda. Titanium mesra perjalanan untuk yang bergerak jarak jauh.",
        },
        {
          heading: "Sains penglihatan",
          body: "Bukti tentang cahaya biru, presbiopia pada usia 45, dan sebab untuk pemeriksaan mata tahunan. Penelitian mendalam dalam bahasa yang mudah difahami.",
        },
      ],
    },
  },
  accessibility: {
    en: {
      eyebrow: "Accessibility",
      title: "Accessibility statement",
      intro:
        "loollook is committed to ensuring loollook.com is usable by everyone, including people with disabilities.",
      sections: [
        {
          heading: "Our standard",
          body: "We use WCAG 2.1, level AA as our accessibility target. Our team reviews the site against these guidelines and ships improvements as issues are found.",
        },
        {
          heading: "What we do",
          body: "We work on alt text for imagery, semantic HTML, keyboard-accessible interactions, sufficient color contrast, ARIA labels for interactive controls, and layouts that respect user font-size and zoom. Checkout, virtual try-on, and prescription tools are part of our ongoing keyboard and screen-reader review.",
        },
        {
          heading: "Need help?",
          body: "Email accessibility@loollook.com if you encounter any barrier. We respond within 2 business days and will work with you to resolve it.",
        },
      ],
    },
    zh: {
      eyebrow: "无障碍",
      title: "无障碍声明",
      intro: "loollook 致力于让 loollook.com 对每一位用户都可用，包括残障人士。",
      sections: [
        {
          heading: "我们的标准",
          body: "我们以 WCAG 2.1 AA 级标准作为无障碍目标。团队会按这些指南检查网站，并在发现问题时持续改进。",
        },
        {
          heading: "我们做了什么",
          body: "我们持续改进图像 alt 文本、语义化 HTML、可通过键盘操作的交互、足够的颜色对比、交互控件的 ARIA 标签，以及尊重用户字号与缩放的布局。结账、虚拟试戴和处方工具正在纳入键盘与读屏器检查。",
        },
        {
          heading: "需要帮助？",
          body: "如遇任何无障碍问题，请发邮件至 accessibility@loollook.com。我们会在 2 个工作日内回复并协助解决。",
        },
      ],
    },
    es: {
      eyebrow: "Accesibilidad",
      title: "Declaración de accesibilidad",
      intro:
        "loollook se compromete a garantizar que loollook.com sea usable por todas las personas, incluidas aquellas con discapacidad.",
      sections: [
        {
          heading: "Nuestro estándar",
          body: "Usamos WCAG 2.1, nivel AA, como objetivo de accesibilidad. Nuestro equipo revisa el sitio con estas directrices y publica mejoras cuando detecta problemas.",
        },
        {
          heading: "Lo que hacemos",
          body: "Trabajamos en texto alternativo para imágenes, HTML semántico, interacciones accesibles con teclado, contraste de color suficiente, etiquetas ARIA para controles interactivos y diseños que respetan el tamaño de fuente y el zoom del usuario. El checkout, la prueba virtual y las herramientas de receta forman parte de nuestra revisión continua con teclado y lectores de pantalla.",
        },
        {
          heading: "¿Necesitas ayuda?",
          body: "Escribe a accessibility@loollook.com si encuentras alguna barrera. Respondemos en un plazo de 2 días hábiles y trabajaremos contigo para resolverlo.",
        },
      ],
    },
    fr: {
      eyebrow: "Accessibilité",
      title: "Déclaration d’accessibilité",
      intro:
        "loollook s’engage à rendre loollook.com utilisable par toutes et tous, y compris les personnes en situation de handicap.",
      sections: [
        {
          heading: "Notre standard",
          body: "Nous utilisons le WCAG 2.1, niveau AA, comme objectif d’accessibilité. Notre équipe vérifie le site selon ces directives et déploie des améliorations lorsque des problèmes sont identifiés.",
        },
        {
          heading: "Ce que nous faisons",
          body: "Nous travaillons sur les textes alternatifs des images, le HTML sémantique, les interactions accessibles au clavier, un contraste de couleurs suffisant, les labels ARIA des contrôles interactifs et des mises en page qui respectent la taille de police et le zoom de l’utilisateur. Le paiement, l’essayage virtuel et les outils d’ordonnance font partie de notre revue continue au clavier et avec lecteurs d’écran.",
        },
        {
          heading: "Besoin d’aide ?",
          body: "Écrivez à accessibility@loollook.com si vous rencontrez un obstacle. Nous répondons sous 2 jours ouvrés et travaillerons avec vous pour le résoudre.",
        },
      ],
    },
    de: {
      eyebrow: "Barrierefreiheit",
      title: "Erklärung zur Barrierefreiheit",
      intro:
        "loollook setzt sich dafür ein, dass loollook.com für alle nutzbar ist — auch für Menschen mit Behinderungen.",
      sections: [
        {
          heading: "Unser Standard",
          body: "Wir verwenden WCAG 2.1 auf Stufe AA als Ziel für Barrierefreiheit. Unser Team prüft die Website anhand dieser Richtlinien und liefert Verbesserungen aus, wenn Probleme gefunden werden.",
        },
        {
          heading: "Was wir tun",
          body: "Wir arbeiten an Alt-Texten für Bilder, semantischem HTML, per Tastatur bedienbaren Interaktionen, ausreichenden Farbkontrasten, ARIA-Labels für interaktive Elemente und Layouts, die Schriftgröße und Zoom respektieren. Kasse, virtuelle Anprobe und Rezept-Tools sind Teil unserer laufenden Prüfung mit Tastatur und Screenreadern.",
        },
        {
          heading: "Brauchst du Hilfe?",
          body: "Schreib uns an accessibility@loollook.com, wenn du auf eine Barriere stößt. Wir antworten innerhalb von 2 Werktagen und arbeiten gemeinsam mit dir an einer Lösung.",
        },
      ],
    },
    it: {
      eyebrow: "Accessibilità",
      title: "Dichiarazione di accessibilità",
      intro:
        "loollook si impegna a rendere loollook.com utilizzabile da chiunque, comprese le persone con disabilità.",
      sections: [
        {
          heading: "Il nostro standard",
          body: "Usiamo le WCAG 2.1, livello AA, come obiettivo di accessibilità. Il nostro team verifica il sito rispetto a queste linee guida e rilascia miglioramenti quando vengono individuati problemi.",
        },
        {
          heading: "Cosa facciamo",
          body: "Lavoriamo su testo alternativo per le immagini, HTML semantico, interazioni accessibili da tastiera, contrasto cromatico adeguato, etichette ARIA per i controlli interattivi e layout che rispettano dimensione del carattere e zoom dell’utente. Checkout, prova virtuale e strumenti per la ricetta fanno parte della nostra revisione continua con tastiera e screen reader.",
        },
        {
          heading: "Hai bisogno di aiuto?",
          body: "Scrivi a accessibility@loollook.com se incontri un ostacolo. Rispondiamo entro 2 giorni lavorativi e lavoreremo insieme a te per risolverlo.",
        },
      ],
    },
    pt: {
      eyebrow: "Acessibilidade",
      title: "Declaração de acessibilidade",
      intro:
        "A loollook tem o compromisso de garantir que o loollook.com seja utilizável por todas as pessoas, incluindo pessoas com deficiência.",
      sections: [
        {
          heading: "Nosso padrão",
          body: "Usamos o WCAG 2.1, nível AA, como objetivo de acessibilidade. Nossa equipe revisa o site segundo essas diretrizes e entrega melhorias quando problemas são encontrados.",
        },
        {
          heading: "O que fazemos",
          body: "Trabalhamos em texto alternativo para imagens, HTML semântico, interações acessíveis por teclado, contraste de cores adequado, rótulos ARIA para controles interativos e layouts que respeitam o tamanho de fonte e o zoom do usuário. Checkout, prova virtual e ferramentas de receita fazem parte da nossa revisão contínua com teclado e leitores de tela.",
        },
        {
          heading: "Precisa de ajuda?",
          body: "Envie um e-mail para accessibility@loollook.com se encontrar qualquer barreira. Respondemos em até 2 dias úteis e trabalharemos junto com você para resolver.",
        },
      ],
    },
    ja: {
      eyebrow: "アクセシビリティ",
      title: "アクセシビリティに関する声明",
      intro:
        "loollook は、障がいのある方を含むすべての方が loollook.com をご利用いただけるよう取り組んでいます。",
      sections: [
        {
          heading: "基準",
          body: "WCAG 2.1 レベル AA をアクセシビリティの目標として使用しています。当社のチームはこのガイドラインに沿ってサイトを確認し、問題が見つかった場合に改善を行います。",
        },
        {
          heading: "取り組み",
          body: "画像への代替テキスト、セマンティック HTML、キーボードで操作できるインタラクション、十分な色のコントラスト、インタラクティブ要素への ARIA ラベル、そしてユーザーの文字サイズやズームを尊重するレイアウトに取り組んでいます。チェックアウト、バーチャル試着、処方ツールは、キーボードとスクリーンリーダーによる継続的な確認の対象です。",
        },
        {
          heading: "お困りですか？",
          body: "何らかのバリアに遭遇された場合は accessibility@loollook.com までご連絡ください。2 営業日以内に返信し、解決に向けて対応いたします。",
        },
      ],
    },
    ko: {
      eyebrow: "접근성",
      title: "접근성 선언문",
      intro:
        "loollook은 장애가 있는 분들을 포함해 모든 사용자가 loollook.com을 이용할 수 있도록 노력하고 있습니다.",
      sections: [
        {
          heading: "기준",
          body: "WCAG 2.1 AA 등급을 접근성 목표로 삼고 있습니다. 저희 팀은 이 가이드라인에 따라 사이트를 검토하고, 문제가 발견되면 개선 사항을 반영합니다.",
        },
        {
          heading: "우리가 하는 일",
          body: "이미지 대체 텍스트, 시맨틱 HTML, 키보드로 사용할 수 있는 상호작용, 충분한 색상 대비, 인터랙티브 컨트롤의 ARIA 라벨, 사용자의 글꼴 크기와 확대 설정을 존중하는 레이아웃을 지속적으로 개선합니다. 결제, 가상 피팅, 처방전 도구는 키보드와 스크린 리더 검토 대상에 포함됩니다.",
        },
        {
          heading: "도움이 필요하신가요?",
          body: "이용에 불편이 있다면 accessibility@loollook.com으로 메일을 보내 주세요. 영업일 기준 2일 이내에 답변드리며 해결을 도와드리겠습니다.",
        },
      ],
    },
    ar: {
      eyebrow: "إمكانية الوصول",
      title: "بيان إمكانية الوصول",
      intro:
        "تلتزم loollook بضمان أن يكون loollook.com قابلًا للاستخدام من قِبل الجميع، بمن فيهم الأشخاص ذوو الإعاقة.",
      sections: [
        {
          heading: "معاييرنا",
          body: "نستخدم معايير WCAG 2.1 من المستوى AA كهدف لإمكانية الوصول. يراجع فريقنا الموقع وفق هذه الإرشادات ويُطلق تحسينات عند العثور على مشكلات.",
        },
        {
          heading: "ما نقوم به",
          body: "نعمل على النصوص البديلة للصور، وHTML الدلالي، والتفاعلات القابلة للاستخدام بلوحة المفاتيح، وتباين الألوان الكافي، وتسميات ARIA للعناصر التفاعلية، والتخطيطات التي تحترم حجم خط المستخدم ومستوى التكبير. أدوات الدفع والتجربة الافتراضية والوصفات الطبية جزء من مراجعتنا المستمرة بلوحة المفاتيح وقارئات الشاشة.",
        },
        {
          heading: "تحتاج مساعدة؟",
          body: "راسلنا على accessibility@loollook.com إذا واجهت أي عائق. سنردّ خلال يومَي عمل وسنعمل معك على حلّه.",
        },
      ],
    },
    vi: {
      eyebrow: "Khả năng tiếp cận",
      title: "Tuyên bố về khả năng tiếp cận",
      intro:
        "loollook cam kết đảm bảo loollook.com sử dụng được cho mọi người, bao gồm cả người khuyết tật.",
      sections: [
        {
          heading: "Tiêu chuẩn của chúng tôi",
          body: "Chúng tôi dùng WCAG 2.1, mức AA làm mục tiêu về khả năng tiếp cận. Đội ngũ của chúng tôi rà soát trang web theo các hướng dẫn này và triển khai cải tiến khi phát hiện vấn đề.",
        },
        {
          heading: "Những gì chúng tôi làm",
          body: "Chúng tôi cải thiện văn bản thay thế cho hình ảnh, HTML ngữ nghĩa, tương tác dùng được bằng bàn phím, độ tương phản màu phù hợp, nhãn ARIA cho các điều khiển tương tác, và bố cục tôn trọng kích thước phông chữ cũng như mức zoom của người dùng. Thanh toán, thử kính ảo và công cụ đơn thuốc nằm trong quy trình rà soát liên tục bằng bàn phím và trình đọc màn hình.",
        },
        {
          heading: "Cần trợ giúp?",
          body: "Gửi email tới accessibility@loollook.com nếu bạn gặp bất kỳ rào cản nào. Chúng tôi phản hồi trong vòng 2 ngày làm việc và sẽ phối hợp với bạn để giải quyết.",
        },
      ],
    },
    th: {
      eyebrow: "การเข้าถึง",
      title: "ข้อความว่าด้วยการเข้าถึง",
      intro:
        "loollook มุ่งมั่นที่จะทำให้ loollook.com ใช้งานได้สำหรับทุกคน รวมถึงผู้พิการ",
      sections: [
        {
          heading: "มาตรฐานของเรา",
          body: "เราใช้ WCAG 2.1 ระดับ AA เป็นเป้าหมายด้านการเข้าถึง ทีมของเราตรวจสอบเว็บไซต์ตามแนวทางเหล่านี้และเผยแพร่การปรับปรุงเมื่อพบปัญหา",
        },
        {
          heading: "สิ่งที่เราทำ",
          body: "เราปรับปรุงข้อความทดแทนสำหรับรูปภาพ, HTML เชิงความหมาย, การโต้ตอบที่ใช้งานได้ด้วยคีย์บอร์ด, ความต่างของสีที่เพียงพอ, ป้าย ARIA สำหรับองค์ประกอบเชิงโต้ตอบ และเลย์เอาต์ที่เคารพขนาดตัวอักษรและการซูมของผู้ใช้ ระบบชำระเงิน การลองแว่นเสมือนจริง และเครื่องมือใบสั่งยาอยู่ในการตรวจสอบต่อเนื่องด้วยคีย์บอร์ดและโปรแกรมอ่านหน้าจอ",
        },
        {
          heading: "ต้องการความช่วยเหลือ?",
          body: "ส่งอีเมลถึง accessibility@loollook.com หากพบอุปสรรคใด ๆ เราจะตอบกลับภายใน 2 วันทำการและร่วมแก้ปัญหากับคุณ",
        },
      ],
    },
    id: {
      eyebrow: "Aksesibilitas",
      title: "Pernyataan aksesibilitas",
      intro:
        "loollook berkomitmen memastikan loollook.com dapat digunakan oleh semua orang, termasuk penyandang disabilitas.",
      sections: [
        {
          heading: "Standar kami",
          body: "Kami menggunakan WCAG 2.1, level AA, sebagai target aksesibilitas. Tim kami meninjau situs sesuai pedoman ini dan menerapkan peningkatan ketika masalah ditemukan.",
        },
        {
          heading: "Yang kami lakukan",
          body: "Kami mengerjakan teks alternatif pada gambar, HTML semantik, interaksi yang dapat digunakan dengan keyboard, kontras warna yang memadai, label ARIA untuk kontrol interaktif, serta tata letak yang menghormati ukuran font dan zoom pengguna. Checkout, coba virtual, dan alat resep menjadi bagian dari peninjauan berkelanjutan dengan keyboard dan pembaca layar.",
        },
        {
          heading: "Butuh bantuan?",
          body: "Kirim email ke accessibility@loollook.com jika Anda menemukan hambatan apa pun. Kami merespons dalam 2 hari kerja dan akan bekerja sama untuk menyelesaikannya.",
        },
      ],
    },
    ms: {
      eyebrow: "Kebolehcapaian",
      title: "Kenyataan kebolehcapaian",
      intro:
        "loollook komited memastikan loollook.com boleh digunakan oleh semua orang, termasuk orang kurang upaya.",
      sections: [
        {
          heading: "Standard kami",
          body: "Kami menggunakan WCAG 2.1, tahap AA, sebagai sasaran kebolehcapaian. Pasukan kami menyemak laman web mengikut garis panduan ini dan menghantar penambahbaikan apabila isu ditemui.",
        },
        {
          heading: "Apa yang kami lakukan",
          body: "Kami mengusahakan teks alternatif pada imej, HTML semantik, interaksi yang boleh digunakan dengan papan kekunci, kontras warna yang mencukupi, label ARIA untuk kawalan interaktif, dan susun atur yang menghormati saiz fon serta zum pengguna. Pembayaran, percubaan maya dan alat preskripsi merupakan sebahagian daripada semakan berterusan dengan papan kekunci dan pembaca skrin.",
        },
        {
          heading: "Perlukan bantuan?",
          body: "E-melkan accessibility@loollook.com jika anda menghadapi sebarang halangan. Kami akan membalas dalam 2 hari bekerja dan akan bekerjasama dengan anda untuk menyelesaikannya.",
        },
      ],
    },
  },
  "find-your-fit": {
    en: {
      eyebrow: "Sizing Guide",
      title: "Three Key Frame Dimensions",
      intro:
        "Three printed numbers on the inner temple define frame fit, marked in format: Lens Width □ Bridge Width - Temple Length.",
      sections: [
        {
          heading: "1. Lens Width",
          body: "Horizontal width of single lens. Standard adult: 48–55mm; oversized fashion frames: 56–60mm.",
        },
        {
          heading: "2. Bridge Width",
          body: "Distance between two lenses over nose, standard 16–20mm. Wider bridge for high nose, narrow bridge for low nose.",
        },
        {
          heading: "3. Temple Length",
          body: "Full length from frame hinge to ear tip, common adult range: 140–150mm.",
        },
        {
          heading: "How to get your accurate size",
          body: "Check the inner arm of your existing comfy glasses. New frames with lens/bridge within ±2mm error & temple within ±3mm will fit well.",
        },
        {
          heading: "Frame Selection by Face Shape",
          body: "- Round Face (soft curves, equal length & width): Go for rectangular/slim square frames to lengthen facial proportion; avoid full round frames.\n- Square Face (sharp jawline, prominent angular cheek): Pick rounded/oval frames to soften hard facial lines; skip heavy sharp-square frames.\n- Heart Face (wide forehead, narrow pointed chin): Choose aviator & cat-eye frames with wider bottom rim to balance slim jaw; avoid extra-wide top-heavy oversized frames.\n- Oval Face (balanced proportional features): All frame shapes work freely based on your styling preference.",
        },
      ],
      cta: { label: "Try frames on virtually", to: "/try-on" },
    },
    zh: {
      eyebrow: "Sizing Guide",
      title: "Three Key Frame Dimensions",
      intro:
        "Three printed numbers on the inner temple define frame fit, marked in format: Lens Width □ Bridge Width - Temple Length.",
      sections: [
        {
          heading: "1. Lens Width",
          body: "Horizontal width of single lens. Standard adult: 48–55mm; oversized fashion frames: 56–60mm.",
        },
        {
          heading: "2. Bridge Width",
          body: "Distance between two lenses over nose, standard 16–20mm. Wider bridge for high nose, narrow bridge for low nose.",
        },
        {
          heading: "3. Temple Length",
          body: "Full length from frame hinge to ear tip, common adult range: 140–150mm.",
        },
        {
          heading: "How to get your accurate size",
          body: "Check the inner arm of your existing comfy glasses. New frames with lens/bridge within ±2mm error & temple within ±3mm will fit well.",
        },
        {
          heading: "Frame Selection by Face Shape",
          body: "- Round Face (soft curves, equal length & width): Go for rectangular/slim square frames to lengthen facial proportion; avoid full round frames.\n- Square Face (sharp jawline, prominent angular cheek): Pick rounded/oval frames to soften hard facial lines; skip heavy sharp-square frames.\n- Heart Face (wide forehead, narrow pointed chin): Choose aviator & cat-eye frames with wider bottom rim to balance slim jaw; avoid extra-wide top-heavy oversized frames.\n- Oval Face (balanced proportional features): All frame shapes work freely based on your styling preference.",
        },
      ],
      cta: { label: "Try frames on virtually", to: "/try-on" },
    },
    es: {
      eyebrow: "Guía de tallas",
      title: "Cómo encontrar tu talla",
      intro:
        "Tres números determinan si una montura te queda bien. Te explicamos cómo leerlos y qué tener en cuenta.",
      sections: [
        {
          heading: "Las tres medidas",
          body: "Ancho de lente (la medida horizontal de una lente), puente (el espacio entre lentes) y longitud de varilla (la patilla que llega a tu oreja). La mayoría de monturas para adultos se mueven entre lente 48–55, puente 16–20, varilla 140–150.",
        },
        {
          heading: "Encuentra la tuya rápido",
          body: "Mira el interior de unas gafas que ya te encanten: esos números están impresos en la varilla. Si los igualas con un margen de 2mm, listo.",
        },
        {
          heading: "Trucos por forma de cara",
          body: "Rostros redondos: prueba cuadradas o rectangulares. Rostros cuadrados: prueba redondas u ovaladas. Rostros con forma de corazón: prueba cat-eye o aviador. Ovalados: casi todo funciona.",
        },
      ],
      cta: { label: "Pruébatelas virtualmente", to: "/try-on" },
    },
    fr: {
      eyebrow: "Guide des tailles",
      title: "Comment trouver votre taille",
      intro:
        "Trois chiffres déterminent si une monture vous va. Voici comment les lire — et ce qu’il faut regarder.",
      sections: [
        {
          heading: "Les trois mesures",
          body: "La largeur du verre (largeur horizontale d’un verre), le pont (l’écart entre les verres) et la longueur de branche (la tige qui va jusqu’à l’oreille). La plupart des montures adultes se situent entre 48–55 pour le verre, 16–20 pour le pont, 140–150 pour la branche.",
        },
        {
          heading: "Trouvez la vôtre vite",
          body: "Regardez à l’intérieur d’une paire que vous aimez déjà — ces chiffres sont imprimés sur la branche. Restez à 2 mm près et c’est gagné.",
        },
        {
          heading: "Astuces par forme de visage",
          body: "Visages ronds — essayez carré ou rectangle. Visages carrés — essayez rond ou ovale. En cœur — essayez cat-eye ou aviateur. Ovale — presque tout fonctionne.",
        },
      ],
      cta: { label: "Essayer virtuellement", to: "/try-on" },
    },
    de: {
      eyebrow: "Größenratgeber",
      title: "So findest du deine Passform",
      intro:
        "Drei Zahlen entscheiden, ob eine Fassung zu deinem Gesicht passt. So liest du sie — und worauf du achten solltest.",
      sections: [
        {
          heading: "Die drei Maße",
          body: "Glasbreite (die horizontale Breite eines Glases), Stegbreite (der Abstand zwischen den Gläsern) und Bügellänge (der Bügel bis zum Ohr). Die meisten Erwachsenenfassungen liegen bei Glas 48–55, Steg 16–20, Bügel 140–150.",
        },
        {
          heading: "Finde deine schnell",
          body: "Schau auf die Innenseite einer Brille, die dir bereits gefällt — die Zahlen sind auf dem Bügel aufgedruckt. Bleib innerhalb von 2 mm und du liegst richtig.",
        },
        {
          heading: "Gesichtsform-Tipps",
          body: "Runde Gesichter — probiere eckige oder rechteckige Formen. Eckige Gesichter — probiere runde oder ovale. Herzförmig — probiere Cat-Eye oder Aviator. Oval — fast alles funktioniert.",
        },
      ],
      cta: { label: "Virtuell anprobieren", to: "/try-on" },
    },
    it: {
      eyebrow: "Guida alle taglie",
      title: "Come trovare la tua misura",
      intro:
        "Tre numeri determinano se una montatura funziona sul tuo viso. Ecco come leggerli — e cosa cercare.",
      sections: [
        {
          heading: "Le tre misure",
          body: "Larghezza della lente (la dimensione orizzontale di una singola lente), ponte (lo spazio tra le lenti) e lunghezza dell’asta (la stanghetta che arriva all’orecchio). La maggior parte delle montature da adulto va da lente 48–55, ponte 16–20, asta 140–150.",
        },
        {
          heading: "Trova la tua in fretta",
          body: "Guarda all’interno di un paio che già ami — quei numeri sono stampati sull’asta. Trovane corrispondenza entro 2 mm e sei a posto.",
        },
        {
          heading: "Trucchi per forma del viso",
          body: "Viso tondo — prova squadrate o rettangolari. Viso squadrato — prova tonde o ovali. A forma di cuore — prova cat-eye o aviator. Ovale — funziona quasi tutto.",
        },
      ],
      cta: { label: "Prova virtualmente", to: "/try-on" },
    },
    pt: {
      eyebrow: "Guia de tamanhos",
      title: "Como encontrar seu tamanho",
      intro:
        "Três números determinam se uma armação funciona no seu rosto. Veja como lê-los — e o que observar.",
      sections: [
        {
          heading: "As três medidas",
          body: "Largura da lente (a largura horizontal de uma lente), ponte (o espaço entre as lentes) e comprimento da haste (o braço que vai até a orelha). A maioria das armações adultas fica entre lente 48–55, ponte 16–20 e haste 140–150.",
        },
        {
          heading: "Encontre o seu rápido",
          body: "Olhe a parte interna de uns óculos que você já adora — esses números estão impressos na haste. Combine-os com diferença de até 2 mm e está resolvido.",
        },
        {
          heading: "Dicas por formato de rosto",
          body: "Rostos redondos — experimente quadrado ou retangular. Rostos quadrados — experimente redondo ou oval. Rostos em formato de coração — experimente gatinho ou aviador. Rostos ovais — quase tudo combina.",
        },
      ],
      cta: { label: "Provar virtualmente", to: "/try-on" },
    },
    ja: {
      eyebrow: "サイズガイド",
      title: "自分に合うサイズの見つけ方",
      intro:
        "フレームが顔に合うかどうかは、3 つの数字で決まります。その読み方と、見るべきポイントをご紹介します。",
      sections: [
        {
          heading: "3 つの寸法",
          body: "レンズ幅（レンズ 1 枚の横幅）、ブリッジ（左右のレンズの間隔）、テンプル長（耳までのアーム部分）。成人用フレームの多くは、レンズ 48〜55、ブリッジ 16〜20、テンプル 140〜150 の範囲に収まります。",
        },
        {
          heading: "あなたのサイズをすぐに",
          body: "今お気に入りのメガネの内側を見てみてください。テンプルにこれらの数字が刻印されています。2mm 以内の差で合わせれば問題ありません。",
        },
        {
          heading: "顔型別ヒント",
          body: "丸顔の方はスクエアまたはレクタングルを。四角顔の方はラウンドまたはオーバルを。ハート型の方はキャットアイまたはアビエーターを。卵型の方はほぼどんな形でも似合います。",
        },
      ],
      cta: { label: "バーチャル試着する", to: "/try-on" },
    },
    ko: {
      eyebrow: "사이즈 가이드",
      title: "내게 맞는 사이즈 찾기",
      intro:
        "프레임이 얼굴에 어울리는지 결정하는 것은 세 개의 숫자입니다. 이 숫자를 어떻게 읽는지, 그리고 무엇을 봐야 하는지 알려드립니다.",
      sections: [
        {
          heading: "세 가지 측정값",
          body: "렌즈 너비(렌즈 한쪽의 가로 폭), 브릿지(두 렌즈 사이의 간격), 그리고 템플 길이(귀까지 이어지는 다리 부분)입니다. 대부분의 성인용 프레임은 렌즈 48–55mm, 브릿지 16–20mm, 템플 140–150mm 범위에 속합니다.",
        },
        {
          heading: "빠르게 내 사이즈 찾기",
          body: "이미 잘 맞는다고 느끼는 안경의 안쪽을 보세요. 템플에 숫자가 인쇄되어 있습니다. 이 수치와 2mm 이내로 맞추면 충분합니다.",
        },
        {
          heading: "얼굴형별 팁",
          body: "둥근 얼굴 — 스퀘어나 직사각형을 시도해 보세요. 각진 얼굴 — 라운드나 오벌이 잘 어울립니다. 하트형 — 캣아이나 에비에이터를 추천합니다. 오벌형 — 거의 모든 스타일이 잘 어울립니다.",
        },
      ],
      cta: { label: "가상으로 착용", to: "/try-on" },
    },
    ar: {
      eyebrow: "دليل المقاسات",
      title: "كيف تجد مقاسك المثالي",
      intro:
        "ثلاثة أرقام تحدّد ما إذا كان الإطار يناسب وجهك. إليك كيفية قراءتها — وما الذي ينبغي البحث عنه.",
      sections: [
        {
          heading: "المقاسات الثلاثة",
          body: "عرض العدسة (العرض الأفقي للعدسة الواحدة)، وجسر الأنف (المسافة بين العدستين)، وطول الذراع (الجزء الذي يمتد إلى أذنك). تتراوح معظم إطارات البالغين بين عدسة 48–55، وجسر 16–20، وذراع 140–150.",
        },
        {
          heading: "اعرف مقاسك بسرعة",
          body: "انظر إلى الجانب الداخلي لنظارة ترتديها وتحبّها — تلك الأرقام مطبوعة على الذراع. اختر مقاسًا قريبًا منها في حدود 2mm وستكون جاهزًا.",
        },
        {
          heading: "حيل حسب شكل الوجه",
          body: "الوجه المستدير — جرّب المربع أو المستطيل. الوجه المربع — جرّب المستدير أو البيضاوي. الوجه القلبي — جرّب عين القطة أو الـ aviator. الوجه البيضاوي — يناسبه كل شيء تقريبًا.",
        },
      ],
      cta: { label: "جربها افتراضيًا", to: "/try-on" },
    },
    vi: {
      eyebrow: "Hướng dẫn kích cỡ",
      title: "Cách tìm size kính phù hợp",
      intro:
        "Ba con số quyết định một chiếc gọng có hợp với khuôn mặt bạn không. Đây là cách đọc — và những gì cần lưu ý.",
      sections: [
        {
          heading: "Ba thông số cơ bản",
          body: "Chiều rộng tròng (chiều ngang của một mắt kính), cầu mũi (khoảng cách giữa hai tròng), và chiều dài càng (phần kéo đến tai). Hầu hết gọng người lớn dao động tròng 48–55, cầu 16–20, càng 140–150.",
        },
        {
          heading: "Tìm thông số của bạn thật nhanh",
          body: "Nhìn vào mặt trong của chiếc kính bạn đang yêu thích — những con số được in trên càng kính. Khớp trong khoảng 2mm là ổn.",
        },
        {
          heading: "Mẹo theo dáng khuôn mặt",
          body: "Mặt tròn — thử dáng vuông hoặc chữ nhật. Mặt vuông — thử dáng tròn hoặc oval. Mặt trái tim — thử cat-eye hoặc aviator. Mặt oval — gần như mọi dáng đều hợp.",
        },
      ],
      cta: { label: "Thử kính ảo ngay", to: "/try-on" },
    },
    th: {
      eyebrow: "คู่มือขนาด",
      title: "วิธีหาขนาดที่ใช่",
      intro:
        "ตัวเลขสามตัวจะตัดสินว่ากรอบใดเหมาะกับใบหน้าของคุณ มาดูวิธีอ่าน — และสิ่งที่ต้องสังเกต",
      sections: [
        {
          heading: "สามค่าวัดหลัก",
          body: "ความกว้างของเลนส์ (ความกว้างแนวนอนของเลนส์หนึ่งข้าง), สะพานจมูก (ระยะระหว่างเลนส์), และความยาวขาแว่น (ขาที่ทอดไปยังหู) กรอบผู้ใหญ่ส่วนใหญ่อยู่ในช่วงเลนส์ 48–55 สะพาน 16–20 ขาแว่น 140–150",
        },
        {
          heading: "หาขนาดของคุณได้เร็ว",
          body: "ลองดูด้านในของแว่นที่คุณใส่สบายอยู่แล้ว — ตัวเลขจะพิมพ์อยู่บนขาแว่น เลือกที่ใกล้กันในระยะ 2mm ก็พอ",
        },
        {
          heading: "เคล็ดลับตามรูปหน้า",
          body: "หน้ากลม — ลองทรงเหลี่ยมหรือสี่เหลี่ยมผืนผ้า หน้าเหลี่ยม — ลองทรงกลมหรือวงรี หน้าหัวใจ — ลอง cat-eye หรือ aviator หน้าวงรี — เกือบทุกทรงเข้ากันได้",
        },
      ],
      cta: { label: "ลองแว่นเสมือนจริง", to: "/try-on" },
    },
    id: {
      eyebrow: "Panduan ukuran",
      title: "Cara menemukan ukuran yang pas",
      intro:
        "Tiga angka menentukan apakah sebuah bingkai cocok di wajah Anda. Berikut cara membacanya — dan apa yang harus diperhatikan.",
      sections: [
        {
          heading: "Tiga ukuran utama",
          body: "Lebar lensa (lebar horizontal satu lensa), jembatan (jarak antar lensa), dan panjang tangkai (lengan yang mencapai telinga). Kebanyakan bingkai dewasa berkisar lensa 48–55, jembatan 16–20, tangkai 140–150.",
        },
        {
          heading: "Temukan ukuran Anda dengan cepat",
          body: "Lihat sisi dalam kacamata yang sudah Anda sukai — angka-angka itu tercetak di tangkai. Cocokkan dalam selisih 2mm dan Anda siap.",
        },
        {
          heading: "Tips bentuk wajah",
          body: "Wajah bulat — coba kotak atau persegi panjang. Wajah kotak — coba bulat atau oval. Wajah hati — coba cat-eye atau aviator. Wajah oval — hampir semua bentuk cocok.",
        },
      ],
      cta: { label: "Coba bingkai secara virtual", to: "/try-on" },
    },
    ms: {
      eyebrow: "Panduan saiz",
      title: "Cara mencari saiz yang sesuai",
      intro:
        "Tiga nombor menentukan sama ada bingkai sesuai pada wajah anda. Inilah cara membacanya — dan apa yang perlu diperhatikan.",
      sections: [
        {
          heading: "Tiga ukuran utama",
          body: "Lebar kanta (lebar mendatar satu kanta), jambatan (jarak antara dua kanta), dan panjang tangkai (lengan ke telinga). Kebanyakan bingkai dewasa berkisar kanta 48–55, jambatan 16–20, tangkai 140–150.",
        },
        {
          heading: "Cari saiz anda dengan pantas",
          body: "Lihat bahagian dalam cermin mata yang sedia anda gemari — nombor-nombor itu tercetak pada tangkai. Padankan dalam julat 2mm dan anda sudah bersedia.",
        },
        {
          heading: "Tip mengikut bentuk wajah",
          body: "Wajah bulat — cuba bingkai segi empat atau panjang. Wajah segi empat — cuba bulat atau bujur. Bentuk hati — cuba cat-eye atau aviator. Bujur — hampir semua bentuk sesuai.",
        },
      ],
      cta: { label: "Cuba bingkai secara maya", to: "/try-on" },
    },
  },
  "choose-eyeglasses": {
    en: {
      eyebrow: "Buying Guide",
      title: "How to choose eyeglasses",
      intro:
        "Four decisions get you from browsing to buying — frame shape, lens type, coatings, and color.",
      sections: [
        {
          heading: "Frame shape",
          body: "Pick a shape that contrasts your face. Angular frames flatter softer faces; rounded frames soften angular ones. When in doubt, oval is universally flattering.",
        },
        {
          heading: "Lens type",
          body: "Single-vision lenses correct one distance — typically near (reading) or far (driving). Progressive lenses combine near, intermediate, and far in one lens, with no visible line.",
        },
        {
          heading: "Coatings worth paying for",
          body: "Anti-reflective, anti-scratch, and UV-blocking coatings come standard at loollook. Add blue-light filtering if you spend more than 4 hours per day on screens.",
        },
        {
          heading: "Color & material",
          body: "Acetate offers richer color and warmth; titanium is lighter and more minimal. Tortoise and crystal acetate are timeless; matte black and gunmetal titanium read most modern.",
        },
      ],
      cta: { label: "Shop everyday eyeglasses", to: "/myopia" },
    },
    zh: {
      eyebrow: "选购指南",
      title: "如何挑选眼镜",
      intro: "四个决定，让你从浏览到下单——镜架形状、镜片类型、镀膜与颜色。",
      sections: [
        {
          heading: "镜架形状",
          body: "选一个与你的脸型形成对比的形状。棱角分明的镜架修饰柔和的脸；圆润的镜架柔化棱角的脸。拿不定主意时，椭圆是普适之选。",
        },
        {
          heading: "镜片类型",
          body: "单光镜片只矫正一个距离——通常是近用（阅读）或远用（驾驶）。渐进镜片把近、中、远三个视区融合在一片中，无可见过渡线。",
        },
        {
          heading: "值得加配的镀膜",
          body: "防眩光、防刮、UV 防护是 loollook 的标配。如果你每天使用屏幕超过 4 小时，再加一层防蓝光。",
        },
        {
          heading: "颜色与材质",
          body: "板材色彩更丰富、质感更温润；钛金属更轻、更极简。玳瑁与水晶板材永不过时；哑黑与枪灰钛金属最具现代感。",
        },
      ],
      cta: { label: "选购日常眼镜", to: "/myopia" },
    },
    es: {
      eyebrow: "Guía de compra",
      title: "Cómo elegir gafas",
      intro:
        "Cuatro decisiones te llevan de mirar a comprar: forma de la montura, tipo de lente, tratamientos y color.",
      sections: [
        {
          heading: "Forma de la montura",
          body: "Elige una forma que contraste con tu rostro. Las monturas angulares favorecen a rostros suaves; las redondeadas suavizan los rostros angulosos. En caso de duda, la oval favorece a casi todo el mundo.",
        },
        {
          heading: "Tipo de lente",
          body: "Las lentes monofocales corrigen una sola distancia: normalmente cerca (lectura) o lejos (conducción). Las lentes progresivas combinan cerca, intermedia y lejos en una sola lente, sin línea visible.",
        },
        {
          heading: "Tratamientos que valen la pena",
          body: "Los tratamientos antirreflejante, antirrayadura y anti-UV vienen de serie en loollook. Añade el filtro de luz azul si pasas más de 4 horas diarias frente a pantallas.",
        },
        {
          heading: "Color y material",
          body: "El acetato ofrece colores más ricos y calidez; el titanio es más ligero y minimalista. El acetato tortoise y cristal son atemporales; el titanio negro mate y gunmetal lucen más modernos.",
        },
      ],
      cta: { label: "Comprar gafas diarias", to: "/myopia" },
    },
    fr: {
      eyebrow: "Guide d’achat",
      title: "Comment choisir vos lunettes",
      intro:
        "Quatre décisions vous mènent du repérage à l’achat — forme de la monture, type de verre, traitements et couleur.",
      sections: [
        {
          heading: "Forme de la monture",
          body: "Choisissez une forme qui contraste avec votre visage. Les montures anguleuses flattent les visages doux ; les formes arrondies adoucissent les traits anguleux. En cas de doute, l’ovale flatte tout le monde.",
        },
        {
          heading: "Type de verre",
          body: "Les verres unifocaux corrigent une seule distance — généralement vision de près (lecture) ou de loin (conduite). Les verres progressifs combinent vision de près, intermédiaire et de loin dans un même verre, sans trait visible.",
        },
        {
          heading: "Traitements qui valent leur prix",
          body: "Les traitements antireflet, antirayure et anti-UV sont inclus de série chez loollook. Ajoutez un filtre lumière bleue si vous passez plus de 4 heures par jour devant un écran.",
        },
        {
          heading: "Couleur & matière",
          body: "L’acétate offre des couleurs plus riches et plus chaleureuses ; le titane est plus léger et plus minimaliste. L’acétate écaille et cristal sont indémodables ; le titane noir mat et gris gunmetal sont les plus modernes.",
        },
      ],
      cta: { label: "Voir les lunettes du quotidien", to: "/myopia" },
    },
    de: {
      eyebrow: "Kaufberatung",
      title: "So wählst du die richtige Brille",
      intro:
        "Vier Entscheidungen bringen dich vom Stöbern zum Kauf — Fassungsform, Glasart, Veredelungen und Farbe.",
      sections: [
        {
          heading: "Fassungsform",
          body: "Wähle eine Form, die einen Kontrast zu deinem Gesicht setzt. Kantige Fassungen schmeicheln weichen Gesichtern; runde Fassungen glätten kantige. Im Zweifel ist Oval universell schmeichelhaft.",
        },
        {
          heading: "Glasart",
          body: "Einstärkengläser korrigieren eine Entfernung — meist Nähe (Lesen) oder Ferne (Autofahren). Gleitsichtgläser kombinieren Nähe, Zwischenbereich und Ferne in einem Glas, ohne sichtbare Trennlinie.",
        },
        {
          heading: "Beschichtungen, die sich lohnen",
          body: "Entspiegelung, Kratzschutz und UV-Schutz sind bei loollook Standard. Ergänze einen Blaulichtfilter, wenn du mehr als 4 Stunden pro Tag am Bildschirm verbringst.",
        },
        {
          heading: "Farbe & Material",
          body: "Acetat bietet sattere Farben und Wärme; Titan ist leichter und minimalistischer. Havanna und Kristall-Acetat sind zeitlos; mattschwarzes und gunmetal-farbenes Titan wirken am modernsten.",
        },
      ],
      cta: { label: "Alltagsbrillen ansehen", to: "/myopia" },
    },
    it: {
      eyebrow: "Guida all’acquisto",
      title: "Come scegliere gli occhiali",
      intro:
        "Quattro decisioni ti portano dal browsing all’acquisto — forma della montatura, tipo di lente, trattamenti e colore.",
      sections: [
        {
          heading: "Forma della montatura",
          body: "Scegli una forma che contrasti il tuo viso. Le montature spigolose valorizzano i tratti morbidi; quelle arrotondate ammorbidiscono i tratti angolari. In caso di dubbio, l’ovale sta bene praticamente a tutti.",
        },
        {
          heading: "Tipo di lente",
          body: "Le lenti monofocali correggono una sola distanza — tipicamente vicino (lettura) o lontano (guida). Le lenti progressive uniscono vicino, intermedio e lontano in un’unica lente, senza linea visibile.",
        },
        {
          heading: "Trattamenti che valgono il prezzo",
          body: "I trattamenti antiriflesso, antigraffio e anti-UV sono di serie su loollook. Aggiungi il filtro anti luce blu se passi più di 4 ore al giorno davanti agli schermi.",
        },
        {
          heading: "Colore e materiale",
          body: "L’acetato offre colori più ricchi e calore; il titanio è più leggero e minimale. Tartaruga e acetato cristallo sono senza tempo; nero opaco e titanio canna di fucile risultano i più moderni.",
        },
      ],
      cta: { label: "Occhiali da tutti i giorni", to: "/myopia" },
    },
    pt: {
      eyebrow: "Guia de compra",
      title: "Como escolher seus óculos",
      intro:
        "Quatro decisões levam você da navegação à compra — formato da armação, tipo de lente, tratamentos e cor.",
      sections: [
        {
          heading: "Formato da armação",
          body: "Escolha um formato que contraste com seu rosto. Armações angulares valorizam rostos mais suaves; armações arredondadas suavizam traços angulares. Na dúvida, o oval favorece praticamente todo mundo.",
        },
        {
          heading: "Tipo de lente",
          body: "Lentes monofocais corrigem uma distância — geralmente perto (leitura) ou longe (direção). Lentes progressivas combinam perto, intermediário e longe em uma única lente, sem linha visível.",
        },
        {
          heading: "Tratamentos que valem o investimento",
          body: "Tratamentos antirreflexo, antirrisco e anti-UV vêm de série na loollook. Adicione filtro de luz azul se você passa mais de 4 horas por dia em telas.",
        },
        {
          heading: "Cor e material",
          body: "O acetato oferece cores mais ricas e calor; o titânio é mais leve e minimalista. Acetato tartaruga e cristal são atemporais; titânio preto fosco e gunmetal são os mais modernos.",
        },
      ],
      cta: { label: "Comprar óculos do dia a dia", to: "/myopia" },
    },
    ja: {
      eyebrow: "購入ガイド",
      title: "メガネの選び方",
      intro:
        "閲覧から購入までの 4 つの選択。フレームの形、レンズの種類、コーティング、色をどう決めるかをご案内します。",
      sections: [
        {
          heading: "フレームの形",
          body: "顔立ちと対照的な形を選ぶのがコツです。シャープな角のあるフレームは柔らかな顔立ちを引き立て、丸みのあるフレームは角ばった顔立ちを和らげます。迷ったらオーバルが万人に似合います。",
        },
        {
          heading: "レンズの種類",
          body: "単焦点レンズは 1 つの距離（一般的には近用（読書用）または遠用（運転用））を補正します。プログレッシブレンズは近・中・遠を 1 枚に組み合わせ、境目の線は見えません。",
        },
        {
          heading: "価値あるコーティング",
          body: "反射防止、傷防止、UV カットの各コーティングは loollook の標準仕様です。1 日 4 時間以上画面を見る方はブルーライトカットを追加することをおすすめします。",
        },
        {
          heading: "色と素材",
          body: "アセテートは豊かな色合いと温かみを、チタンは軽量でミニマルな印象を演出します。トータスとクリスタルのアセテートは時代を超えて愛され、マットブラックとガンメタルのチタンは最もモダンな印象を与えます。",
        },
      ],
      cta: { label: "デイリーメガネを見る", to: "/myopia" },
    },
    ko: {
      eyebrow: "구매 가이드",
      title: "안경 고르는 법",
      intro:
        "네 가지 결정만 내리면 둘러보기에서 구매까지 이어집니다 — 프레임 모양, 렌즈 종류, 코팅, 그리고 색상입니다.",
      sections: [
        {
          heading: "프레임 모양",
          body: "얼굴형과 대비되는 모양을 고르세요. 각진 프레임은 부드러운 얼굴을 살리고, 둥근 프레임은 각진 얼굴을 부드럽게 만듭니다. 망설여진다면 오벌이 가장 무난하게 잘 어울립니다.",
        },
        {
          heading: "렌즈 종류",
          body: "단초점 렌즈는 한 거리만 교정합니다 — 보통 근거리(독서) 또는 원거리(운전)용입니다. 누진 렌즈는 근거리, 중간 거리, 원거리를 한 렌즈에 결합하며, 경계선이 보이지 않습니다.",
        },
        {
          heading: "투자할 만한 코팅",
          body: "반사 방지, 긁힘 방지, 자외선 차단 코팅은 loollook의 기본 사양입니다. 하루 4시간 이상 화면을 본다면 블루라이트 필터링도 추가하세요.",
        },
        {
          heading: "색상 & 소재",
          body: "아세테이트는 더 풍부한 색감과 따뜻함을 제공하고, 티타늄은 더 가볍고 미니멀합니다. 토터스와 크리스털 아세테이트는 시간이 지나도 변치 않는 클래식이며, 매트 블랙과 건메탈 티타늄은 가장 모던한 인상을 줍니다.",
        },
      ],
      cta: { label: "데일리 안경 보기", to: "/myopia" },
    },
    ar: {
      eyebrow: "دليل الشراء",
      title: "كيف تختار النظارات",
      intro:
        "أربعة قرارات تنقلك من التصفّح إلى الشراء — شكل الإطار، ونوع العدسة، والطلاءات، واللون.",
      sections: [
        {
          heading: "شكل الإطار",
          body: "اختر شكلًا يتباين مع وجهك. الإطارات الزاويّة تُكمل الوجوه الناعمة الملامح؛ والإطارات المستديرة تخفّف من حدّة الوجوه الزاويّة. وعند الشك، الإطار البيضاوي خيار يليق بالجميع.",
        },
        {
          heading: "نوع العدسة",
          body: "عدسات الرؤية المفردة تصحّح مسافة واحدة — عادةً قريبة (للقراءة) أو بعيدة (للقيادة). أما العدسات التقدّمية فتجمع القريب والمتوسط والبعيد في عدسة واحدة بدون خط فاصل ظاهر.",
        },
        {
          heading: "الطلاءات التي تستحق الدفع",
          body: "الطلاءات المضادة للانعكاس والمقاومة للخدش والحاجبة للأشعة فوق البنفسجية قياسية لدى loollook. أضِف فلتر الضوء الأزرق إذا كنت تقضي أكثر من 4 ساعات يوميًا أمام الشاشات.",
        },
        {
          heading: "اللون والخامة",
          body: "الأسيتات يقدّم ألوانًا أغنى ودفئًا أكبر؛ والتيتانيوم أخف وأكثر بساطة. الأسيتات بنقشة السلحفاة والكريستال خيارات لا تخرج من الموضة؛ أما التيتانيوم الأسود المطفأ ولون الـ gunmetal فيمنحان أكثر طابع عصري.",
        },
      ],
      cta: { label: "تسوق نظارات يومية", to: "/myopia" },
    },
    vi: {
      eyebrow: "Hướng dẫn mua sắm",
      title: "Cách chọn kính mắt",
      intro:
        "Bốn quyết định giúp bạn từ xem hàng đến mua hàng — dáng gọng, loại tròng, lớp phủ, và màu sắc.",
      sections: [
        {
          heading: "Dáng gọng",
          body: "Chọn một dáng tương phản với khuôn mặt bạn. Gọng góc cạnh tôn lên khuôn mặt mềm mại; gọng bo tròn làm dịu các góc cạnh. Khi phân vân, dáng oval phù hợp với hầu hết mọi người.",
        },
        {
          heading: "Loại tròng",
          body: "Tròng đơn tròng chỉnh thị một khoảng cách — thường là gần (đọc) hoặc xa (lái xe). Tròng đa tròng kết hợp gần, trung gian và xa trong một tròng, không có đường ngăn cách.",
        },
        {
          heading: "Lớp phủ đáng để chi",
          body: "Chống chói, chống xước và chống UV là tiêu chuẩn ở loollook. Thêm lớp lọc ánh sáng xanh nếu bạn dùng màn hình hơn 4 tiếng mỗi ngày.",
        },
        {
          heading: "Màu sắc & chất liệu",
          body: "Acetate cho màu sắc phong phú và ấm áp hơn; titanium nhẹ hơn và tối giản hơn. Acetate đồi mồi và crystal là kinh điển; titanium đen mờ và gunmetal mang vẻ hiện đại nhất.",
        },
      ],
      cta: { label: "Mua kính hằng ngày", to: "/myopia" },
    },
    th: {
      eyebrow: "คู่มือการซื้อ",
      title: "วิธีเลือกแว่นตา",
      intro:
        "สี่การตัดสินใจที่พาคุณจากการดูสินค้าไปสู่การซื้อ — ทรงกรอบ ชนิดเลนส์ การเคลือบ และสี",
      sections: [
        {
          heading: "ทรงกรอบ",
          body: "เลือกทรงที่ตัดกับใบหน้าของคุณ กรอบเหลี่ยมเสริมใบหน้าที่นุ่มนวล; กรอบโค้งมนทำให้ใบหน้าที่เหลี่ยมดูอ่อนลง หากไม่แน่ใจ ทรงวงรีเหมาะกับเกือบทุกคน",
        },
        {
          heading: "ชนิดเลนส์",
          body: "เลนส์ชั้นเดียวแก้สายตาที่ระยะเดียว — มักเป็นใกล้ (อ่าน) หรือไกล (ขับรถ) เลนส์โปรเกรสซีฟรวมระยะใกล้ กลาง และไกลในเลนส์เดียวโดยไม่มีเส้นแบ่งให้เห็น",
        },
        {
          heading: "การเคลือบที่คุ้มค่า",
          body: "การเคลือบป้องกันแสงสะท้อน กันรอย และกัน UV เป็นมาตรฐานของ loollook เพิ่มฟิลเตอร์กันแสงสีฟ้าหากคุณใช้หน้าจอเกิน 4 ชั่วโมงต่อวัน",
        },
        {
          heading: "สี & วัสดุ",
          body: "อะซิเตทให้สีสันที่เข้มและอบอุ่นกว่า; ไทเทเนียมเบากว่าและดูเรียบง่ายกว่า ลายกระดองเต่าและคริสตัลอะซิเตทเป็นคลาสสิกตลอดกาล; ไทเทเนียมสีดำด้านและสีกันเมทัลให้ความรู้สึกโมเดิร์นที่สุด",
        },
      ],
      cta: { label: "ซื้อแว่นใส่ทุกวัน", to: "/myopia" },
    },
    id: {
      eyebrow: "Panduan pembelian",
      title: "Cara memilih kacamata",
      intro:
        "Empat keputusan membawa Anda dari melihat-lihat ke pembelian — bentuk bingkai, jenis lensa, pelapis, dan warna.",
      sections: [
        {
          heading: "Bentuk bingkai",
          body: "Pilih bentuk yang kontras dengan wajah Anda. Bingkai bersudut cocok untuk wajah yang lebih lembut; bingkai membulat melembutkan wajah bersudut. Bila ragu, oval cocok untuk hampir semua orang.",
        },
        {
          heading: "Jenis lensa",
          body: "Lensa single-vision mengoreksi satu jarak — biasanya dekat (membaca) atau jauh (mengemudi). Lensa progresif menggabungkan dekat, menengah, dan jauh dalam satu lensa tanpa garis terlihat.",
        },
        {
          heading: "Pelapis yang sebanding dengan biayanya",
          body: "Lapisan anti-pantul, anti-gores, dan anti-UV sudah standar di loollook. Tambahkan filter cahaya biru jika Anda menatap layar lebih dari 4 jam per hari.",
        },
        {
          heading: "Warna & material",
          body: "Asetat memberikan warna yang lebih kaya dan hangat; titanium lebih ringan dan minimalis. Asetat tortoise dan crystal abadi; titanium hitam matte dan gunmetal terkesan paling modern.",
        },
      ],
      cta: { label: "Belanja kacamata sehari-hari", to: "/myopia" },
    },
    ms: {
      eyebrow: "Panduan pembelian",
      title: "Cara memilih cermin mata",
      intro:
        "Empat keputusan membawa anda dari melihat-lihat kepada pembelian — bentuk bingkai, jenis kanta, salutan, dan warna.",
      sections: [
        {
          heading: "Bentuk bingkai",
          body: "Pilih bentuk yang berkontras dengan wajah anda. Bingkai bersudut menonjolkan wajah yang lembut; bingkai membulat melembutkan wajah bersudut. Jika ragu, bujur sesuai untuk hampir semua orang.",
        },
        {
          heading: "Jenis kanta",
          body: "Kanta single-vision membetulkan satu jarak — biasanya dekat (membaca) atau jauh (memandu). Kanta progresif menggabungkan dekat, pertengahan dan jauh dalam satu kanta tanpa garisan kelihatan.",
        },
        {
          heading: "Salutan yang berbaloi",
          body: "Salutan anti-pantulan, anti-calar dan anti-UV adalah standard di loollook. Tambah penapis cahaya biru jika anda menggunakan skrin lebih daripada 4 jam sehari.",
        },
        {
          heading: "Warna & bahan",
          body: "Asetat menawarkan warna yang lebih kaya dan hangat; titanium lebih ringan dan minimalis. Asetat tortoise dan crystal kekal klasik; titanium hitam matte dan gunmetal kelihatan paling moden.",
        },
      ],
      cta: { label: "Beli cermin mata harian", to: "/myopia" },
    },
  },
  "measure-pd": {
    en: {
      eyebrow: "Prescription Tools",
      title: "How to measure your PD",
      intro:
        "Your pupillary distance (PD) is the millimeter gap between your pupils. It centers your prescription correctly in each lens.",
      sections: [
        {
          heading: "Method 1 — with a friend",
          body: "Hold a millimeter ruler flat against your brow. Look straight ahead at a wall 3 meters away. Have your friend measure from the center of your left pupil to the center of your right pupil. Repeat 3 times and average.",
        },
        {
          heading: "Method 2 — solo with a mirror",
          body: "Hold the ruler against your brow, look at your own reflection from arm’s length, and align 0mm with the center of your right pupil. Read across to the center of your left pupil.",
        },
        {
          heading: "Typical ranges",
          body: "Adults: 54–74mm. Children: 41–55mm. Don’t worry about being off by 1mm — most prescriptions tolerate it.",
        },
      ],
      cta: { label: "Use the digital PD tool", to: "/measure-pd" },
    },
    zh: {
      eyebrow: "配镜工具",
      title: "如何测量瞳距 (PD)",
      intro:
        "瞳距（PD）是两眼瞳孔中心之间的毫米距离。它确保你的处方在每片镜片上正确居中。",
      sections: [
        {
          heading: "方法 1 — 请朋友帮忙",
          body: "把毫米尺平贴在眉骨上，目视 3 米外的墙面。请朋友测量左瞳孔中心到右瞳孔中心的距离。重复 3 次取平均值。",
        },
        {
          heading: "方法 2 — 对镜独自测量",
          body: "将尺子贴在眉骨上，对着镜子伸臂距离观察自己。把 0mm 对准右瞳孔中心，读取左瞳孔中心对应的刻度。",
        },
        {
          heading: "常见范围",
          body: "成人 54–74mm，儿童 41–55mm。1mm 的偏差大多数处方都可以容忍，无需紧张。",
        },
      ],
      cta: { label: "使用在线瞳距测量", to: "/measure-pd" },
    },
    es: {
      eyebrow: "Herramientas de receta",
      title: "Cómo medir tu DP",
      intro:
        "Tu distancia pupilar (PD) es la separación en milímetros entre tus pupilas. Sirve para centrar correctamente la graduación en cada lente.",
      sections: [
        {
          heading: "Método 1 — con un amigo",
          body: "Apoya una regla milimetrada plana contra tu ceja. Mira al frente a una pared a 3 metros. Pide a tu amigo que mida desde el centro de tu pupila izquierda hasta el centro de la derecha. Repite 3 veces y haz el promedio.",
        },
        {
          heading: "Método 2 — solo con un espejo",
          body: "Sujeta la regla contra tu ceja, mira tu propio reflejo desde la distancia del brazo y alinea el 0mm con el centro de tu pupila derecha. Lee la medida hasta el centro de tu pupila izquierda.",
        },
        {
          heading: "Rangos habituales",
          body: "Adultos: 54–74mm. Niños: 41–55mm. No te preocupes si te desvías 1mm: la mayoría de las recetas lo toleran.",
        },
      ],
      cta: { label: "Usar la herramienta DP", to: "/measure-pd" },
    },
    fr: {
      eyebrow: "Outils de prescription",
      title: "Comment mesurer votre EP",
      intro:
        "Votre écart pupillaire (EP / PD) est la distance en millimètres entre vos pupilles. Il permet de centrer correctement votre correction dans chaque verre.",
      sections: [
        {
          heading: "Méthode 1 — avec un ami",
          body: "Tenez une règle millimétrée à plat contre votre sourcil. Regardez droit devant vous un mur situé à 3 mètres. Demandez à votre ami de mesurer du centre de votre pupille gauche au centre de votre pupille droite. Répétez 3 fois et faites la moyenne.",
        },
        {
          heading: "Méthode 2 — seul, avec un miroir",
          body: "Placez la règle contre votre sourcil, regardez votre reflet à bout de bras et alignez le 0 mm avec le centre de votre pupille droite. Lisez la valeur jusqu’au centre de votre pupille gauche.",
        },
        {
          heading: "Plages typiques",
          body: "Adultes : 54–74 mm. Enfants : 41–55 mm. Ne vous inquiétez pas d’une erreur de 1 mm — la plupart des prescriptions le tolèrent.",
        },
      ],
      cta: { label: "Outil EP en ligne", to: "/measure-pd" },
    },
    de: {
      eyebrow: "Rezept-Tools",
      title: "So misst du deine PD",
      intro:
        "Deine Pupillendistanz (PD) ist der Abstand in Millimetern zwischen deinen Pupillen. Sie sorgt dafür, dass dein Rezept in jedem Glas korrekt zentriert ist.",
      sections: [
        {
          heading: "Methode 1 — mit Hilfe",
          body: "Halte ein Millimeterlineal flach an deine Stirn. Blicke gerade auf eine Wand in 3 Metern Entfernung. Lass eine Freundin oder einen Freund den Abstand vom Zentrum deiner linken Pupille zum Zentrum deiner rechten Pupille messen. Wiederhole das 3 Mal und nimm den Durchschnitt.",
        },
        {
          heading: "Methode 2 — allein mit Spiegel",
          body: "Halte das Lineal an deine Stirn, betrachte dein Spiegelbild aus einer Armlänge Entfernung und richte 0 mm am Zentrum deiner rechten Pupille aus. Lies dann den Wert am Zentrum deiner linken Pupille ab.",
        },
        {
          heading: "Typische Bereiche",
          body: "Erwachsene: 54–74 mm. Kinder: 41–55 mm. Mach dir wegen einer Abweichung von 1 mm keine Sorgen — die meisten Rezepte tolerieren das.",
        },
      ],
      cta: { label: "Digitales PD-Tool", to: "/measure-pd" },
    },
    it: {
      eyebrow: "Strumenti per la ricetta",
      title: "Come misurare la tua DP",
      intro:
        "La distanza pupillare (PD) è la distanza in millimetri tra le tue pupille. Serve a centrare correttamente la ricetta in ciascuna lente.",
      sections: [
        {
          heading: "Metodo 1 — con un amico",
          body: "Tieni un righello millimetrato in piano contro la fronte. Guarda dritto davanti a te verso una parete a 3 metri di distanza. Chiedi al tuo amico di misurare dal centro della pupilla sinistra al centro della pupilla destra. Ripeti 3 volte e fai la media.",
        },
        {
          heading: "Metodo 2 — da soli con uno specchio",
          body: "Tieni il righello contro la fronte, guarda il tuo riflesso a distanza di un braccio e allinea lo 0 mm con il centro della pupilla destra. Leggi il valore in corrispondenza del centro della pupilla sinistra.",
        },
        {
          heading: "Intervalli tipici",
          body: "Adulti: 54–74 mm. Bambini: 41–55 mm. Non preoccuparti di sbagliare di 1 mm — la maggior parte delle ricette lo tollera.",
        },
      ],
      cta: { label: "Strumento DP digitale", to: "/measure-pd" },
    },
    pt: {
      eyebrow: "Ferramentas de receita",
      title: "Como medir sua DP",
      intro:
        "Sua distância pupilar (PD) é a distância em milímetros entre as pupilas. Ela centraliza corretamente sua receita em cada lente.",
      sections: [
        {
          heading: "Método 1 — com um amigo",
          body: "Encoste uma régua em milímetros contra a sobrancelha. Olhe para frente, para uma parede a 3 metros de distância. Peça ao seu amigo para medir do centro da pupila esquerda ao centro da pupila direita. Repita 3 vezes e tire a média.",
        },
        {
          heading: "Método 2 — sozinho com espelho",
          body: "Encoste a régua na sobrancelha, olhe o próprio reflexo a uma distância de um braço e alinhe o 0 mm com o centro da pupila direita. Leia até o centro da pupila esquerda.",
        },
        {
          heading: "Faixas típicas",
          body: "Adultos: 54–74 mm. Crianças: 41–55 mm. Não se preocupe com 1 mm de diferença — a maioria das receitas tolera.",
        },
      ],
      cta: { label: "Usar ferramenta DP", to: "/measure-pd" },
    },
    ja: {
      eyebrow: "処方ツール",
      title: "瞳孔間距離 (PD) の測り方",
      intro:
        "瞳孔間距離 (PD) とは、左右の瞳孔の中心間の距離をミリメートルで表したものです。これにより、レンズごとに処方が正しい位置に合わせられます。",
      sections: [
        {
          heading: "方法 1 — 友人に手伝ってもらう",
          body: "ミリ単位の定規を眉の上に水平に当てます。3 メートル先の壁をまっすぐに見つめてください。友人に、左の瞳孔の中心から右の瞳孔の中心までを測ってもらいます。3 回繰り返し、平均値を取ります。",
        },
        {
          heading: "方法 2 — 鏡を使って一人で",
          body: "定規を眉の上に当て、腕を伸ばした距離で鏡に映る自分を見ます。0mm を右の瞳孔の中心に合わせ、左の瞳孔の中心の位置を読み取ってください。",
        },
        {
          heading: "標準的な範囲",
          body: "成人：54〜74mm。子ども：41〜55mm。1mm のズレは多くの処方で許容範囲ですので、心配はいりません。",
        },
      ],
      cta: { label: "デジタル PD ツールを使う", to: "/measure-pd" },
    },
    ko: {
      eyebrow: "처방 도구",
      title: "동공 간 거리 (PD) 측정법",
      intro:
        "동공 간 거리(PD)는 두 동공 사이의 밀리미터 단위 간격입니다. 각 렌즈에 처방을 정확하게 중심 맞추는 데 사용됩니다.",
      sections: [
        {
          heading: "방법 1 — 친구의 도움",
          body: "밀리미터 자를 눈썹 위에 평평하게 댑니다. 3미터 떨어진 벽을 정면으로 응시하세요. 친구에게 왼쪽 동공 중심에서 오른쪽 동공 중심까지의 거리를 측정해 달라고 부탁합니다. 3회 반복해 평균을 냅니다.",
        },
        {
          heading: "방법 2 — 거울로 혼자",
          body: "자를 눈썹에 대고, 팔 길이만큼 떨어진 거울을 봅니다. 0mm를 오른쪽 동공 중심에 맞춘 뒤, 왼쪽 동공 중심에 해당하는 눈금을 읽으세요.",
        },
        {
          heading: "일반 범위",
          body: "성인은 54–74mm, 어린이는 41–55mm입니다. 1mm 정도 오차는 걱정하지 않으셔도 됩니다 — 대부분의 처방은 이 범위를 허용합니다.",
        },
      ],
      cta: { label: "디지털 PD 도구", to: "/measure-pd" },
    },
    ar: {
      eyebrow: "أدوات الوصفة",
      title: "كيف تقيس المسافة بين الحدقتين",
      intro:
        "المسافة بين الحدقتين (PD) هي الفجوة بالميليمترات بين بؤبؤَي عينيك. وهي ما يضمن تمركز وصفتك الطبية بشكل صحيح في كل عدسة.",
      sections: [
        {
          heading: "الطريقة 1 — بمساعدة صديق",
          body: "أمسك مسطرة بالميليمتر مسطّحة على حاجبك، وانظر مباشرةً إلى حائط يبعد 3 أمتار. اطلب من صديقك أن يقيس من مركز بؤبؤك الأيسر إلى مركز بؤبؤك الأيمن. كرّر القياس 3 مرات وخذ المعدّل.",
        },
        {
          heading: "الطريقة 2 — بمفردك أمام مرآة",
          body: "ضع المسطرة على حاجبك، وانظر إلى انعكاسك من على بُعد ذراع، وحاذِ 0mm مع مركز بؤبؤك الأيمن. ثم اقرأ القيمة المقابلة لمركز بؤبؤك الأيسر.",
        },
        {
          heading: "النطاقات الشائعة",
          body: "البالغون: 54–74mm. الأطفال: 41–55mm. لا تقلق إن انحرفت بمقدار 1mm — فمعظم الوصفات تتحمّل ذلك.",
        },
      ],
      cta: { label: "استخدم أداة قياس PD", to: "/measure-pd" },
    },
    vi: {
      eyebrow: "Công cụ đơn thuốc",
      title: "Cách đo PD của bạn",
      intro:
        "Khoảng cách đồng tử (PD) là khoảng cách tính bằng milimet giữa hai đồng tử. Nó giúp đặt tâm đơn thuốc đúng vị trí trên mỗi tròng kính.",
      sections: [
        {
          heading: "Phương pháp 1 — với bạn bè",
          body: "Đặt thước milimet phẳng trên trán. Nhìn thẳng vào bức tường cách 3 mét. Nhờ bạn đo từ tâm đồng tử trái sang tâm đồng tử phải. Lặp lại 3 lần và lấy trung bình.",
        },
        {
          heading: "Phương pháp 2 — một mình với gương",
          body: "Đặt thước trên trán, nhìn vào hình phản chiếu của mình ở khoảng cách cánh tay, và canh 0mm với tâm đồng tử phải. Đọc giá trị đến tâm đồng tử trái.",
        },
        {
          heading: "Khoảng giá trị thông thường",
          body: "Người lớn: 54–74mm. Trẻ em: 41–55mm. Đừng lo nếu sai 1mm — hầu hết đơn thuốc dung sai được.",
        },
      ],
      cta: { label: "Dùng công cụ đo PD số", to: "/measure-pd" },
    },
    th: {
      eyebrow: "เครื่องมือใบสั่งยา",
      title: "วิธีวัด PD ของคุณ",
      intro:
        "ระยะห่างของรูม่านตา (PD) คือระยะเป็นมิลลิเมตรระหว่างรูม่านตาทั้งสองข้าง ใช้สำหรับวางจุดศูนย์กลางของใบสั่งยาบนเลนส์อย่างถูกต้อง",
      sections: [
        {
          heading: "วิธีที่ 1 — ขอให้เพื่อนช่วย",
          body: "วางไม้บรรทัดมิลลิเมตรราบกับคิ้ว มองตรงไปยังกำแพงที่อยู่ห่าง 3 เมตร ให้เพื่อนวัดจากจุดศูนย์กลางของรูม่านตาซ้ายไปยังจุดศูนย์กลางของรูม่านตาขวา ทำซ้ำ 3 ครั้งและหาค่าเฉลี่ย",
        },
        {
          heading: "วิธีที่ 2 — วัดเองด้วยกระจก",
          body: "วางไม้บรรทัดบนคิ้ว มองภาพสะท้อนของตัวเองในระยะแขนเอื้อม จัด 0mm ให้ตรงกับจุดศูนย์กลางของรูม่านตาขวา แล้วอ่านค่าที่ตรงกับจุดศูนย์กลางของรูม่านตาซ้าย",
        },
        {
          heading: "ช่วงค่าที่พบบ่อย",
          body: "ผู้ใหญ่: 54–74mm เด็ก: 41–55mm คลาดเคลื่อน 1mm ไม่ใช่เรื่องน่ากังวล — ใบสั่งยาส่วนใหญ่รับได้",
        },
      ],
      cta: { label: "ใช้เครื่องมือวัด PD ดิจิทัล", to: "/measure-pd" },
    },
    id: {
      eyebrow: "Alat resep",
      title: "Cara mengukur PD Anda",
      intro:
        "Jarak pupil (PD) adalah jarak dalam milimeter antara kedua pupil. Ini menempatkan resep Anda dengan benar di tengah setiap lensa.",
      sections: [
        {
          heading: "Metode 1 — dengan teman",
          body: "Tempelkan penggaris milimeter datar pada alis. Lihat lurus ke dinding berjarak 3 meter. Mintalah teman mengukur dari pusat pupil kiri ke pusat pupil kanan. Ulangi 3 kali dan ambil rata-ratanya.",
        },
        {
          heading: "Metode 2 — sendiri dengan cermin",
          body: "Tempelkan penggaris pada alis, lihat pantulan diri dari jarak satu lengan, dan luruskan 0mm dengan pusat pupil kanan. Baca nilainya hingga pusat pupil kiri.",
        },
        {
          heading: "Rentang umum",
          body: "Dewasa: 54–74mm. Anak: 41–55mm. Jangan khawatir jika meleset 1mm — kebanyakan resep mentoleransinya.",
        },
      ],
      cta: { label: "Gunakan alat PD digital", to: "/measure-pd" },
    },
    ms: {
      eyebrow: "Alat preskripsi",
      title: "Cara mengukur PD anda",
      intro:
        "Jarak pupil (PD) ialah jurang dalam milimeter antara kedua-dua pupil anda. Ia memusatkan preskripsi anda dengan betul pada setiap kanta.",
      sections: [
        {
          heading: "Kaedah 1 — dengan rakan",
          body: "Letakkan pembaris milimeter mendatar pada kening. Pandang terus ke arah dinding berjarak 3 meter. Mintalah rakan mengukur dari tengah pupil kiri ke tengah pupil kanan. Ulang 3 kali dan ambil purata.",
        },
        {
          heading: "Kaedah 2 — sendirian dengan cermin",
          body: "Letakkan pembaris pada kening, lihat pantulan diri dari jarak satu lengan, dan jajarkan 0mm dengan tengah pupil kanan. Baca nilainya sehingga tengah pupil kiri.",
        },
        {
          heading: "Julat lazim",
          body: "Dewasa: 54–74mm. Kanak-kanak: 41–55mm. Jangan risau jika tersasar 1mm — kebanyakan preskripsi menerimanya.",
        },
      ],
      cta: { label: "Guna alat PD digital", to: "/measure-pd" },
    },
  },
  "prescription-guide": {
    en: {
      eyebrow: "Prescription Tools",
      title: "How to read your prescription",
      intro:
        "Don’t panic at the table of numbers. Here’s a plain-language decoder you can use in 60 seconds.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD is your right eye, OS is your left. Always.\nOU when both eyes share a value.",
        },
        {
          heading: "Sphere (SPH)",
          body: "The strength of correction in diopters. Negative numbers correct nearsightedness, positive numbers correct farsightedness.",
        },
        {
          heading: "Cylinder (CYL) & Axis",
          body: "Cylinder corrects astigmatism. Axis (1–180°) tells the lab where to orient the cylinder correction.",
        },
        {
          heading: "Add (ADD) & PD",
          body: "ADD is the extra magnification for reading — required for progressive and bifocal lenses. PD is your pupillary distance.",
        },
      ],
      cta: { label: "Upload your prescription", to: "/products" },
    },
    zh: {
      eyebrow: "配镜工具",
      title: "如何看懂处方单",
      intro: "别被一长串数字吓到。这是一份 60 秒看懂的通俗解读。",
      sections: [
        {
          heading: "OD 与 OS",
          body: "OD 是右眼，OS 是左眼，永远如此。两眼共用一个数值时记作 OU。",
        },
        {
          heading: "球镜 (SPH)",
          body: "矫正强度，单位为屈光度。负数矫正近视，正数矫正远视。",
        },
        {
          heading: "柱镜 (CYL) 与轴位",
          body: "柱镜矫正散光。轴位（1–180°）告诉实验室柱镜应当朝向的方向。",
        },
        {
          heading: "加光 (ADD) 与瞳距",
          body: "ADD 是阅读所需的额外放大度数——渐进与双光镜片必填。PD 即瞳距。",
        },
      ],
      cta: { label: "上传你的处方", to: "/products" },
    },
    es: {
      eyebrow: "Herramientas de receta",
      title: "Cómo leer tu receta",
      intro:
        "No te asustes con la tabla de números. Aquí tienes un decodificador en lenguaje claro que puedes usar en 60 segundos.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD es tu ojo derecho, OS el izquierdo. Siempre.\nOU cuando ambos ojos comparten el mismo valor.",
        },
        {
          heading: "Esfera (SPH)",
          body: "La potencia de corrección en dioptrías. Los números negativos corrigen la miopía y los positivos la hipermetropía.",
        },
        {
          heading: "Cilindro (CYL) y eje",
          body: "El cilindro corrige el astigmatismo. El eje (1–180°) indica al laboratorio cómo orientar la corrección del cilindro.",
        },
        {
          heading: "Adición (ADD) y DP",
          body: "ADD es el aumento adicional para la lectura, necesario para lentes progresivas y bifocales. PD es tu distancia pupilar.",
        },
      ],
      cta: { label: "Sube tu receta", to: "/products" },
    },
    fr: {
      eyebrow: "Outils de prescription",
      title: "Comment lire votre ordonnance",
      intro:
        "Ne paniquez pas devant ce tableau de chiffres. Voici un décodeur en langage clair, utilisable en 60 secondes.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD désigne votre œil droit, OS votre œil gauche. Toujours.\nOU lorsque les deux yeux partagent la même valeur.",
        },
        {
          heading: "Sphère (SPH)",
          body: "La puissance de correction en dioptries. Les valeurs négatives corrigent la myopie, les valeurs positives corrigent l’hypermétropie.",
        },
        {
          heading: "Cylindre (CYL) & axe",
          body: "Le cylindre corrige l’astigmatisme. L’axe (1–180°) indique au laboratoire l’orientation de la correction cylindrique.",
        },
        {
          heading: "Addition (ADD) & EP",
          body: "L’ADD est le grossissement supplémentaire pour la lecture — indispensable pour les verres progressifs et bifocaux. Le PD est votre écart pupillaire.",
        },
      ],
      cta: { label: "Téléverser votre ordonnance", to: "/products" },
    },
    de: {
      eyebrow: "Rezept-Tools",
      title: "So liest du dein Rezept",
      intro:
        "Keine Panik vor der Zahlentabelle. Hier ist eine verständliche Entschlüsselung in 60 Sekunden.",
      sections: [
        {
          heading: "OD vs. OS",
          body: "OD ist dein rechtes Auge, OS dein linkes. Immer.\nOU steht dafür, dass beide Augen denselben Wert haben.",
        },
        {
          heading: "Sphäre (SPH)",
          body: "Die Stärke der Korrektur in Dioptrien. Negative Werte korrigieren Kurzsichtigkeit, positive Werte korrigieren Weitsichtigkeit.",
        },
        {
          heading: "Zylinder (CYL) & Achse",
          body: "Der Zylinder korrigiert eine Hornhautverkrümmung. Die Achse (1–180°) sagt dem Labor, in welche Richtung die Zylinderkorrektur ausgerichtet werden soll.",
        },
        {
          heading: "Addition (ADD) & PD",
          body: "ADD ist die zusätzliche Vergrößerung zum Lesen — erforderlich für Gleitsicht- und Bifokalgläser. PD ist deine Pupillendistanz.",
        },
      ],
      cta: { label: "Rezept hochladen", to: "/products" },
    },
    it: {
      eyebrow: "Strumenti per la ricetta",
      title: "Come leggere la tua ricetta",
      intro:
        "Niente panico davanti alla tabella di numeri. Ecco un decodificatore in linguaggio semplice che puoi usare in 60 secondi.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD è il tuo occhio destro, OS il sinistro. Sempre.\nOU quando entrambi gli occhi condividono lo stesso valore.",
        },
        {
          heading: "Sfera (SPH)",
          body: "La potenza di correzione in diottrie. I numeri negativi correggono la miopia, quelli positivi l’ipermetropia.",
        },
        {
          heading: "Cilindro (CYL) e asse",
          body: "Il cilindro corregge l’astigmatismo. L’asse (1–180°) indica al laboratorio come orientare la correzione cilindrica.",
        },
        {
          heading: "Addizione (ADD) e DP",
          body: "ADD è l’ingrandimento aggiuntivo per la lettura — necessario per lenti progressive e bifocali. PD è la tua distanza pupillare.",
        },
      ],
      cta: { label: "Carica la tua ricetta", to: "/products" },
    },
    pt: {
      eyebrow: "Ferramentas de receita",
      title: "Como ler sua receita",
      intro:
        "Não se assuste com a tabela de números. Aqui vai um decodificador em linguagem simples que você usa em 60 segundos.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD é seu olho direito, OS é o esquerdo. Sempre.\nOU quando ambos os olhos têm o mesmo valor.",
        },
        {
          heading: "Esfera (SPH)",
          body: "A força da correção em dioptrias. Números negativos corrigem miopia; números positivos corrigem hipermetropia.",
        },
        {
          heading: "Cilindro (CYL) e eixo",
          body: "O cilindro corrige o astigmatismo. O eixo (1–180°) indica ao laboratório como orientar a correção cilíndrica.",
        },
        {
          heading: "Adição (ADD) e DP",
          body: "ADD é a ampliação adicional para leitura — exigida em lentes progressivas e bifocais. PD é sua distância pupilar.",
        },
      ],
      cta: { label: "Enviar sua receita", to: "/products" },
    },
    ja: {
      eyebrow: "処方ツール",
      title: "処方箋の読み方",
      intro:
        "数字の表を前にして慌てる必要はありません。60 秒で読み解ける、わかりやすい解説をご用意しました。",
      sections: [
        {
          heading: "OD と OS",
          body: "OD は右目、OS は左目を表します。常にそうです。\n両目で同じ値の場合は OU と表記されます。",
        },
        {
          heading: "球面度数 (SPH)",
          body: "ディオプターで表される矯正度数の強さです。マイナスの数値は近視を、プラスの数値は遠視を矯正します。",
        },
        {
          heading: "乱視度数 (CYL) と軸",
          body: "CYL は乱視を矯正します。軸（1〜180°）は、乱視矯正をどの方向に向けるかをラボに伝える値です。",
        },
        {
          heading: "加入度 (ADD) と PD",
          body: "ADD は読書用の追加倍率で、プログレッシブレンズや二重焦点レンズに必須です。PD は瞳孔間距離を指します。",
        },
      ],
      cta: { label: "処方箋をアップロード", to: "/products" },
    },
    ko: {
      eyebrow: "처방 도구",
      title: "처방전 읽는 법",
      intro:
        "숫자가 가득한 표를 보고 당황하지 마세요. 60초 만에 이해할 수 있는 쉬운 해설을 준비했습니다.",
      sections: [
        {
          heading: "OD 대 OS",
          body: "OD는 오른쪽 눈, OS는 왼쪽 눈입니다. 언제나 그렇습니다.\n두 눈이 같은 값을 공유할 때는 OU로 표기합니다.",
        },
        {
          heading: "구면 (SPH)",
          body: "디옵터 단위의 교정 강도입니다. 음수는 근시를, 양수는 원시를 교정합니다.",
        },
        {
          heading: "원주 (CYL) & 축",
          body: "CYL은 난시를 교정합니다. AXIS(1–180°)는 실험실에 원주 교정의 방향을 알려줍니다.",
        },
        {
          heading: "가입도 (ADD) & PD",
          body: "ADD는 독서를 위한 추가 배율입니다 — 누진과 이중 초점 렌즈에 필수입니다. PD는 동공 간 거리입니다.",
        },
      ],
      cta: { label: "처방전 업로드", to: "/products" },
    },
    ar: {
      eyebrow: "أدوات الوصفة",
      title: "كيف تقرأ وصفتك الطبية",
      intro:
        "لا تَدَع جدول الأرقام يربكك. إليك دليل تفكيك بلغة بسيطة يمكنك استخدامه في 60 ثانية.",
      sections: [
        {
          heading: "OD مقابل OS",
          body: "OD هي عينك اليمنى، وOS هي اليسرى. دائمًا.\nأما OU فتعني أن العينين تشتركان في القيمة نفسها.",
        },
        {
          heading: "الكروي (SPH)",
          body: "قوة التصحيح بوحدة diopters. الأرقام السالبة تصحّح قصر النظر، والأرقام الموجبة تصحّح طول النظر.",
        },
        {
          heading: "الأسطواني (CYL) والمحور",
          body: "CYL يصحّح اللابؤرية (astigmatism). وAXIS (من 1 إلى 180°) يُخبر المختبر بالاتجاه الذي يجب أن يوجَّه إليه تصحيح الأسطواني.",
        },
        {
          heading: "الإضافة (ADD) و PD",
          body: "ADD هي درجة التكبير الإضافية للقراءة — مطلوبة للعدسات التقدّمية وثنائية البؤرة. وPD هي المسافة بين الحدقتين.",
        },
      ],
      cta: { label: "حمّل وصفتك", to: "/products" },
    },
    vi: {
      eyebrow: "Công cụ đơn thuốc",
      title: "Cách đọc đơn thuốc của bạn",
      intro:
        "Đừng hoảng trước bảng số. Đây là bộ giải mã bằng ngôn ngữ dễ hiểu, bạn có thể dùng trong 60 giây.",
      sections: [
        {
          heading: "OD và OS",
          body: "OD là mắt phải, OS là mắt trái. Luôn luôn như vậy.\nOU khi cả hai mắt có cùng giá trị.",
        },
        {
          heading: "Cầu (SPH)",
          body: "Độ mạnh của hiệu chỉnh theo diopters. Số âm hiệu chỉnh cận thị, số dương hiệu chỉnh viễn thị.",
        },
        {
          heading: "Trụ (CYL) & Trục",
          body: "Trụ điều chỉnh loạn thị. Trục (1–180°) cho phòng lab biết hướng đặt phần trụ.",
        },
        {
          heading: "Thêm (ADD) & PD",
          body: "ADD là độ phóng đại bổ sung cho đọc — bắt buộc với tròng đa tròng và hai tròng. PD là khoảng cách đồng tử.",
        },
      ],
      cta: { label: "Tải lên đơn thuốc của bạn", to: "/products" },
    },
    th: {
      eyebrow: "เครื่องมือใบสั่งยา",
      title: "วิธีอ่านใบสั่งยาแว่นของคุณ",
      intro:
        "ไม่ต้องตกใจกับตารางตัวเลข นี่คือคำอธิบายแบบเข้าใจง่ายที่ใช้ได้ใน 60 วินาที",
      sections: [
        {
          heading: "OD กับ OS",
          body: "OD คือตาขวา OS คือตาซ้าย เสมอ\nOU เมื่อทั้งสองตาใช้ค่าเดียวกัน",
        },
        {
          heading: "Sphere (SPH)",
          body: "ความแรงของการแก้สายตาในหน่วย diopters เลขลบใช้แก้สายตาสั้น เลขบวกใช้แก้สายตายาว",
        },
        {
          heading: "Cylinder (CYL) และ Axis",
          body: "Cylinder ใช้แก้สายตาเอียง AXIS (1–180°) บอกห้องแล็บถึงทิศทางในการวางการแก้สายตา cylinder",
        },
        {
          heading: "Add (ADD) และ PD",
          body: "ADD คือกำลังขยายเพิ่มสำหรับการอ่าน — จำเป็นสำหรับเลนส์โปรเกรสซีฟและไบโฟคอล PD คือระยะห่างของรูม่านตา",
        },
      ],
      cta: { label: "อัปโหลดใบสั่งยา", to: "/products" },
    },
    id: {
      eyebrow: "Alat resep",
      title: "Cara membaca resep Anda",
      intro:
        "Jangan panik dengan tabel angka. Berikut penjelasan bahasa sederhana yang bisa dipakai dalam 60 detik.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD adalah mata kanan, OS adalah mata kiri. Selalu.\nOU saat kedua mata memiliki nilai yang sama.",
        },
        {
          heading: "Sphere (SPH)",
          body: "Kekuatan koreksi dalam diopters. Angka negatif mengoreksi rabun jauh, angka positif mengoreksi rabun dekat.",
        },
        {
          heading: "Cylinder (CYL) & Axis",
          body: "Cylinder mengoreksi astigmatisme. Axis (1–180°) memberi tahu laboratorium arah orientasi koreksi cylinder.",
        },
        {
          heading: "Add (ADD) & PD",
          body: "ADD adalah pembesaran ekstra untuk membaca — wajib untuk lensa progresif dan bifokal. PD adalah jarak pupil Anda.",
        },
      ],
      cta: { label: "Unggah resep Anda", to: "/products" },
    },
    ms: {
      eyebrow: "Alat preskripsi",
      title: "Cara membaca preskripsi anda",
      intro:
        "Jangan panik melihat jadual nombor. Inilah penjelasan bahasa mudah yang boleh anda guna dalam 60 saat.",
      sections: [
        {
          heading: "OD vs OS",
          body: "OD ialah mata kanan, OS ialah mata kiri. Sentiasa.\nOU apabila kedua-dua mata berkongsi nilai yang sama.",
        },
        {
          heading: "Sphere (SPH)",
          body: "Kekuatan pembetulan dalam diopters. Nombor negatif membetulkan rabun jauh, nombor positif membetulkan rabun dekat.",
        },
        {
          heading: "Cylinder (CYL) & Axis",
          body: "Cylinder membetulkan astigmatisme. Axis (1–180°) memberitahu makmal arah pembetulan cylinder.",
        },
        {
          heading: "Add (ADD) & PD",
          body: "ADD ialah pembesaran tambahan untuk membaca — wajib untuk kanta progresif dan bifokal. PD ialah jarak pupil anda.",
        },
      ],
      cta: { label: "Muat naik preskripsi anda", to: "/products" },
    },
  },
  rewards: {
    en: {
      eyebrow: "Loyalty Program",
      title: "loollook Rewards",
      intro:
        "Earn 1 point for every $1 you spend, plus bonus points for reviews, referrals, and your birthday. Redeem points for free upgrades, gifts, and exclusive frames.",
      sections: [
        {
          heading: "How it works",
          body: "Sign up with your email — it’s free. Every purchase earns 1 point per dollar. Write a verified review for 50 points. Refer a friend for 200 points when they place their first order.",
        },
        {
          heading: "Tiers",
          body: "Insider (0–499 pts): free shipping always. VIP (500–1499 pts): free blue-light upgrades. Icon (1500+ pts): early access to new collections, complimentary engraving, and a free frame on your sign-up anniversary.",
        },
        {
          heading: "Redeeming points",
          body: "500 points = $25 off. 1000 points = $60 off. 2000 points = a free frame from our Essentials collection. Points never expire as long as your account stays active.",
        },
      ],
      cta: { label: "Sign in to earn", to: "/account" },
    },
    zh: {
      eyebrow: "会员计划",
      title: "loollook 会员奖励",
      intro:
        "每消费 1 美元得 1 积分，再加上评价、推荐与生日的额外奖励。积分可兑换免费升级、礼品与限定镜架。",
      sections: [
        {
          heading: "如何参与",
          body: "用邮箱免费注册。每消费 1 美元得 1 积分。撰写经过验证的评价获 50 积分。好友首次下单后，你获 200 积分。",
        },
        {
          heading: "会员等级",
          body: "Insider（0–499 分）：始终免运费。VIP（500–1499 分）：免费防蓝光升级。Icon（1500+ 分）：抢先体验新系列、免费刻字、注册周年免费一副镜架。",
        },
        {
          heading: "积分兑换",
          body: "500 分 = 25 美元抵扣。1000 分 = 60 美元。2000 分 = 一副 Essentials 系列免费镜架。账户活跃则积分永不过期。",
        },
      ],
      cta: { label: "登录开始赚积分", to: "/account" },
    },
    es: {
      eyebrow: "Programa de fidelidad",
      title: "Recompensas loollook",
      intro:
        "Gana 1 punto por cada $1 que gastes, además de puntos extra por reseñas, recomendaciones y tu cumpleaños. Canjea puntos por mejoras gratuitas, regalos y monturas exclusivas.",
      sections: [
        {
          heading: "Cómo funciona",
          body: "Regístrate con tu correo: es gratis. Cada compra suma 1 punto por dólar. Escribe una reseña verificada y gana 50 puntos. Recomienda a un amigo y gana 200 puntos cuando haga su primer pedido.",
        },
        {
          heading: "Niveles",
          body: "Insider (0–499 pts): envío gratis siempre. VIP (500–1499 pts): mejoras gratuitas de filtro de luz azul. Icon (1500+ pts): acceso anticipado a nuevas colecciones, grabado de cortesía y una montura gratis en el aniversario de tu registro.",
        },
        {
          heading: "Canjear puntos",
          body: "500 puntos = $25 de descuento. 1000 puntos = $60 de descuento. 2000 puntos = una montura gratis de nuestra colección Essentials. Los puntos no caducan mientras tu cuenta siga activa.",
        },
      ],
      cta: { label: "Inicia sesión para ganar", to: "/account" },
    },
    fr: {
      eyebrow: "Programme de fidélité",
      title: "Récompenses loollook",
      intro:
        "Gagnez 1 point pour chaque $1 dépensé, plus des points bonus pour les avis, les parrainages et votre anniversaire. Échangez vos points contre des upgrades gratuits, des cadeaux et des montures exclusives.",
      sections: [
        {
          heading: "Comment ça marche",
          body: "Inscrivez-vous avec votre e-mail — c’est gratuit. Chaque achat rapporte 1 point par dollar. Rédigez un avis vérifié pour 50 points. Parrainez un ami et recevez 200 points dès sa première commande.",
        },
        {
          heading: "Niveaux",
          body: "Insider (0–499 pts) : livraison toujours offerte. VIP (500–1499 pts) : upgrades anti-lumière bleue offerts. Icon (1500+ pts) : accès anticipé aux nouvelles collections, gravure offerte, et une monture offerte à l’anniversaire de votre inscription.",
        },
        {
          heading: "Utiliser vos points",
          body: "500 points = $25 de remise. 1000 points = $60 de remise. 2000 points = une monture offerte de notre collection Essentials. Les points n’expirent jamais tant que votre compte reste actif.",
        },
      ],
      cta: { label: "Connectez-vous pour cumuler", to: "/account" },
    },
    de: {
      eyebrow: "Treueprogramm",
      title: "loollook Rewards",
      intro:
        "Sammle 1 Punkt für jeden ausgegebenen $1, plus Bonuspunkte für Bewertungen, Empfehlungen und deinen Geburtstag. Löse Punkte gegen kostenlose Upgrades, Geschenke und exklusive Fassungen ein.",
      sections: [
        {
          heading: "So funktioniert’s",
          body: "Registriere dich mit deiner E-Mail — kostenlos. Jeder Kauf bringt 1 Punkt pro Dollar. Schreibe eine verifizierte Bewertung für 50 Punkte. Wirb eine Freundin oder einen Freund: 200 Punkte, sobald die erste Bestellung aufgegeben wird.",
        },
        {
          heading: "Stufen",
          body: "Insider (0–499 Pkt.): immer kostenloser Versand. VIP (500–1499 Pkt.): kostenlose Blaulicht-Upgrades. Icon (ab 1500 Pkt.): früher Zugang zu neuen Kollektionen, kostenlose Gravur und eine kostenlose Fassung zum Jahrestag deiner Registrierung.",
        },
        {
          heading: "Punkte einlösen",
          body: "500 Punkte = $25 Rabatt. 1000 Punkte = $60 Rabatt. 2000 Punkte = eine kostenlose Fassung aus unserer Essentials-Kollektion. Punkte verfallen nie, solange dein Konto aktiv bleibt.",
        },
      ],
      cta: { label: "Anmelden & sammeln", to: "/account" },
    },
    it: {
      eyebrow: "Programma fedeltà",
      title: "Premi loollook",
      intro:
        "Guadagna 1 punto per ogni $1 speso, più punti bonus per recensioni, inviti e per il tuo compleanno. Riscatta i punti per upgrade gratuiti, regali e montature esclusive.",
      sections: [
        {
          heading: "Come funziona",
          body: "Iscriviti con la tua email — è gratis. Ogni acquisto ti dà 1 punto per dollaro. Scrivi una recensione verificata per 50 punti. Invita un amico per 200 punti quando effettua il suo primo ordine.",
        },
        {
          heading: "Livelli",
          body: "Insider (0–499 pt): spedizione gratuita sempre. VIP (500–1499 pt): upgrade anti luce blu gratuiti. Icon (1500+ pt): accesso anticipato alle nuove collezioni, incisione omaggio e una montatura gratuita per l’anniversario della tua iscrizione.",
        },
        {
          heading: "Riscatta i punti",
          body: "500 punti = $25 di sconto. 1000 punti = $60 di sconto. 2000 punti = una montatura gratuita dalla collezione Essentials. I punti non scadono finché il tuo account resta attivo.",
        },
      ],
      cta: { label: "Accedi per guadagnare", to: "/account" },
    },
    pt: {
      eyebrow: "Programa de fidelidade",
      title: "Recompensas loollook",
      intro:
        "Ganhe 1 ponto a cada $1 gasto, além de pontos bônus por avaliações, indicações e aniversário. Troque seus pontos por upgrades gratuitos, presentes e armações exclusivas.",
      sections: [
        {
          heading: "Como funciona",
          body: "Cadastre-se com seu e-mail — é gratuito. Cada compra rende 1 ponto por dólar. Escreva uma avaliação verificada e ganhe 50 pontos. Indique um amigo e receba 200 pontos quando ele fizer o primeiro pedido.",
        },
        {
          heading: "Níveis",
          body: "Insider (0–499 pts): frete grátis sempre. VIP (500–1499 pts): upgrade gratuito para luz azul. Icon (1500+ pts): acesso antecipado a novas coleções, gravação cortesia e uma armação gratuita no aniversário do cadastro.",
        },
        {
          heading: "Resgatar pontos",
          body: "500 pontos = $25 de desconto. 1000 pontos = $60 de desconto. 2000 pontos = uma armação grátis da nossa coleção Essentials. Os pontos não expiram enquanto sua conta estiver ativa.",
        },
      ],
      cta: { label: "Entre para ganhar", to: "/account" },
    },
    ja: {
      eyebrow: "ロイヤルティプログラム",
      title: "loollook リワード",
      intro:
        "$1 のお買い物ごとに 1 ポイント獲得、さらにレビュー、紹介、お誕生日にはボーナスポイントも。貯めたポイントは無料アップグレード、ギフト、限定フレームと交換できます。",
      sections: [
        {
          heading: "仕組み",
          body: "メールアドレスで無料登録できます。お買い物ごとに $1 につき 1 ポイント獲得。認証済みレビューの投稿で 50 ポイント。お友達を紹介し、そのお友達が初回注文を完了されると 200 ポイントを獲得できます。",
        },
        {
          heading: "ランク",
          body: "Insider（0〜499 ポイント）：常時送料無料。VIP（500〜1499 ポイント）：ブルーライトカット無料アップグレード。Icon（1500 ポイント以上）：新作コレクションへの先行アクセス、無料刻印、ご登録 1 周年記念に無料フレームをプレゼント。",
        },
        {
          heading: "ポイントの利用",
          body: "500 ポイント = $25 OFF。1000 ポイント = $60 OFF。2000 ポイント = Essentials コレクションのフレーム 1 本無料。アカウントが有効である限り、ポイントの有効期限はありません。",
        },
      ],
      cta: { label: "ログインして貯める", to: "/account" },
    },
    ko: {
      eyebrow: "로열티 프로그램",
      title: "loollook 리워드",
      intro:
        "$1를 쓸 때마다 1포인트를 적립하세요. 리뷰, 친구 추천, 생일에는 보너스 포인트가 더해집니다. 포인트는 무료 업그레이드, 선물, 한정 프레임으로 교환할 수 있습니다.",
      sections: [
        {
          heading: "이용 방법",
          body: "이메일로 무료 가입하세요. 1달러당 1포인트가 적립됩니다. 인증된 리뷰를 작성하면 50포인트, 친구가 첫 주문을 완료하면 200포인트가 지급됩니다.",
        },
        {
          heading: "등급",
          body: "Insider(0–499 포인트): 항상 무료 배송. VIP(500–1499 포인트): 블루라이트 업그레이드 무료. Icon(1500+ 포인트): 신상 컬렉션 우선 액세스, 무료 각인, 가입 기념일에 무료 프레임 제공.",
        },
        {
          heading: "포인트 사용",
          body: "500 포인트 = $25 할인. 1000 포인트 = $60 할인. 2000 포인트 = Essentials 컬렉션의 프레임 1개 무료. 계정이 활성 상태인 한 포인트는 만료되지 않습니다.",
        },
      ],
      cta: { label: "로그인하고 적립", to: "/account" },
    },
    ar: {
      eyebrow: "برنامج الولاء",
      title: "مكافآت loollook",
      intro:
        "اكسب نقطة واحدة عن كل $1 تنفقه، إضافةً إلى نقاط إضافية على التقييمات والإحالات وعيد ميلادك. استبدل النقاط بترقيات مجانية وهدايا وإطارات حصرية.",
      sections: [
        {
          heading: "كيف يعمل",
          body: "سجّل ببريدك الإلكتروني — مجانًا. كل عملية شراء تمنحك نقطة لكل دولار. اكتب تقييمًا موثّقًا واحصل على 50 نقطة. ادعُ صديقًا واحصل على 200 نقطة عندما يقدّم أول طلب له.",
        },
        {
          heading: "المستويات",
          body: "Insider (0–499 نقطة): شحن مجاني دائمًا. VIP (500–1499 نقطة): ترقية مجانية لفلتر الضوء الأزرق. Icon (1500+ نقطة): وصول مبكر للمجموعات الجديدة، نقش مجاني، وإطار مجاني في الذكرى السنوية لتسجيلك.",
        },
        {
          heading: "استبدال النقاط",
          body: "500 نقطة = خصم $25. 1000 نقطة = خصم $60. 2000 نقطة = إطار مجاني من مجموعة Essentials. لا تنتهي صلاحية النقاط طالما يبقى حسابك نشطًا.",
        },
      ],
      cta: { label: "سجّل الدخول لتكسب", to: "/account" },
    },
    vi: {
      eyebrow: "Chương trình khách hàng thân thiết",
      title: "loollook Rewards",
      intro:
        "Nhận 1 điểm cho mỗi $1 chi tiêu, cộng thêm điểm thưởng cho đánh giá, giới thiệu và sinh nhật. Đổi điểm lấy nâng cấp miễn phí, quà tặng và những chiếc gọng độc quyền.",
      sections: [
        {
          heading: "Cách hoạt động",
          body: "Đăng ký bằng email — hoàn toàn miễn phí. Mỗi đơn hàng nhận 1 điểm cho mỗi đô la. Viết đánh giá đã được xác minh để nhận 50 điểm. Giới thiệu bạn bè để nhận 200 điểm khi họ đặt đơn đầu tiên.",
        },
        {
          heading: "Các hạng thành viên",
          body: "Insider (0–499 điểm): miễn phí vận chuyển mọi lúc. VIP (500–1499 điểm): nâng cấp chống ánh sáng xanh miễn phí. Icon (1500+ điểm): truy cập sớm các bộ sưu tập mới, khắc miễn phí, và một chiếc gọng miễn phí vào dịp kỷ niệm đăng ký.",
        },
        {
          heading: "Đổi điểm",
          body: "500 điểm = giảm $25. 1000 điểm = giảm $60. 2000 điểm = một chiếc gọng miễn phí từ bộ sưu tập Essentials. Điểm không bao giờ hết hạn khi tài khoản của bạn còn hoạt động.",
        },
      ],
      cta: { label: "Đăng nhập để tích điểm", to: "/account" },
    },
    th: {
      eyebrow: "โปรแกรมสมาชิก",
      title: "loollook Rewards",
      intro:
        "รับ 1 คะแนนทุก ๆ $1 ที่ใช้จ่าย พร้อมคะแนนพิเศษสำหรับการรีวิว แนะนำเพื่อน และวันเกิด แลกคะแนนเป็นการอัปเกรดฟรี ของขวัญ และกรอบแว่นรุ่นพิเศษเฉพาะสมาชิก",
      sections: [
        {
          heading: "วิธีทำงาน",
          body: "สมัครด้วยอีเมลของคุณ — ฟรี ทุกการซื้อรับ 1 คะแนนต่อดอลลาร์ เขียนรีวิวที่ได้รับการยืนยันรับ 50 คะแนน แนะนำเพื่อนรับ 200 คะแนนเมื่อเพื่อนสั่งซื้อครั้งแรก",
        },
        {
          heading: "ระดับสมาชิก",
          body: "Insider (0–499 คะแนน): ส่งฟรีตลอด VIP (500–1499 คะแนน): อัปเกรดกันแสงสีฟ้าฟรี Icon (1500+ คะแนน): เข้าถึงคอลเลกชันใหม่ก่อนใคร สลักชื่อฟรี และรับกรอบฟรี 1 อันในวันครบรอบการสมัคร",
        },
        {
          heading: "การแลกคะแนน",
          body: "500 คะแนน = ส่วนลด $25, 1000 คะแนน = ส่วนลด $60, 2000 คะแนน = กรอบจากคอลเลกชัน Essentials ฟรี 1 อัน คะแนนไม่หมดอายุตราบใดที่บัญชีของคุณยังใช้งานอยู่",
        },
      ],
      cta: { label: "เข้าสู่ระบบเพื่อสะสมคะแนน", to: "/account" },
    },
    id: {
      eyebrow: "Program loyalitas",
      title: "loollook Rewards",
      intro:
        "Dapatkan 1 poin untuk setiap $1 yang Anda belanjakan, plus poin bonus untuk ulasan, rekomendasi, dan ulang tahun Anda. Tukar poin dengan upgrade gratis, hadiah, dan bingkai eksklusif.",
      sections: [
        {
          heading: "Cara kerjanya",
          body: "Daftar dengan email Anda — gratis. Setiap pembelian mendapat 1 poin per dolar. Tulis ulasan terverifikasi untuk 50 poin. Rekomendasikan teman dan dapatkan 200 poin saat mereka memesan pertama kali.",
        },
        {
          heading: "Tingkatan",
          body: "Insider (0–499 poin): pengiriman gratis selalu. VIP (500–1499 poin): upgrade cahaya biru gratis. Icon (1500+ poin): akses awal ke koleksi baru, ukiran gratis, dan satu bingkai gratis di hari jadi pendaftaran Anda.",
        },
        {
          heading: "Menukar poin",
          body: "500 poin = diskon $25. 1000 poin = diskon $60. 2000 poin = satu bingkai gratis dari koleksi Essentials. Poin tidak pernah kedaluwarsa selama akun Anda tetap aktif.",
        },
      ],
      cta: { label: "Masuk untuk menabung", to: "/account" },
    },
    ms: {
      eyebrow: "Program kesetiaan",
      title: "loollook Rewards",
      intro:
        "Dapatkan 1 mata untuk setiap $1 yang anda belanjakan, tambah mata bonus untuk ulasan, rujukan, dan hari jadi anda. Tebus mata untuk naik taraf percuma, hadiah, dan bingkai eksklusif.",
      sections: [
        {
          heading: "Cara ia berfungsi",
          body: "Daftar dengan e-mel anda — percuma. Setiap pembelian memberikan 1 mata setiap dolar. Tulis ulasan disahkan untuk 50 mata. Rujuk rakan untuk 200 mata apabila mereka membuat pesanan pertama.",
        },
        {
          heading: "Peringkat",
          body: "Insider (0–499 mata): penghantaran percuma sentiasa. VIP (500–1499 mata): naik taraf cahaya biru percuma. Icon (1500+ mata): akses awal ke koleksi baharu, ukiran percuma, dan satu bingkai percuma pada ulang tahun pendaftaran anda.",
        },
        {
          heading: "Menebus mata",
          body: "500 mata = diskaun $25. 1000 mata = diskaun $60. 2000 mata = satu bingkai percuma dari koleksi Essentials. Mata tidak akan luput selagi akaun anda aktif.",
        },
      ],
      cta: { label: "Log masuk untuk kumpul", to: "/account" },
    },
  },
  refer: {
    en: {
      eyebrow: "Refer-a-Friend",
      title: "Give $20, get $20",
      intro:
        "Share loollook with the people in your life. They’ll get $20 off their first pair, and we’ll send you $20 in credit the moment their order ships.",
      sections: [
        {
          heading: "How to refer",
          body: "Sign in to your account and grab your unique referral link from the Rewards tab. Share it via email, text, or social — there’s no limit to how many friends you can refer.",
        },
        {
          heading: "How they redeem",
          body: "Your friend visits your link, shops as usual, and the $20 discount applies automatically at checkout — on any frame above $50.",
        },
        {
          heading: "How you earn",
          body: "The moment your friend’s order ships, $20 in store credit lands in your account. Stack credits — refer 5 friends, get $100 toward your next pair.",
        },
        {
          heading: "Fine print",
          body: "Self-referrals don’t count. Credits expire 12 months after issuance. Combinable with Rewards points but not other promo codes.",
        },
      ],
      cta: { label: "Get my referral link", to: "/account" },
    },
    zh: {
      eyebrow: "邀请好友",
      title: "送 20 美元，得 20 美元",
      intro:
        "把 loollook 分享给身边的人。他们首次购买减 20 美元，订单一发货你就能获得 20 美元店内积分。",
      sections: [
        {
          heading: "如何邀请",
          body: "登录账户，在 Rewards 标签内获取你的专属邀请链接。通过邮件、短信或社交媒体分享——人数不设上限。",
        },
        {
          heading: "好友如何使用",
          body: "好友通过你的链接进入，正常下单，结账时 50 美元以上的镜架自动减免 20 美元。",
        },
        {
          heading: "你如何赚取",
          body: "好友订单一发货，20 美元店内积分立即到账。可叠加：邀请 5 位好友 = 100 美元抵扣下一副。",
        },
        {
          heading: "细则",
          body: "不可自我邀请。积分自发放起 12 个月有效。可与 Rewards 积分叠加，不可与其他促销码合并。",
        },
      ],
      cta: { label: "获取我的邀请链接", to: "/account" },
    },
    es: {
      eyebrow: "Recomienda a un amigo",
      title: "Da $20, recibe $20",
      intro:
        "Comparte loollook con las personas de tu vida. Recibirán $20 de descuento en su primer par y te enviaremos $20 en crédito en cuanto se envíe su pedido.",
      sections: [
        {
          heading: "Cómo recomendar",
          body: "Inicia sesión en tu cuenta y copia tu enlace de recomendación único desde la pestaña Recompensas. Compártelo por correo, mensaje o redes sociales: no hay límite de cuántos amigos puedes recomendar.",
        },
        {
          heading: "Cómo lo canjean",
          body: "Tu amigo entra por tu enlace, compra como siempre y el descuento de $20 se aplica automáticamente al pagar, sobre cualquier montura de más de $50.",
        },
        {
          heading: "Cómo ganas tú",
          body: "En cuanto se envíe el pedido de tu amigo, $20 en crédito de tienda llegan a tu cuenta. Acumula créditos: recomienda a 5 amigos y consigue $100 para tu próximo par.",
        },
        {
          heading: "Letra pequeña",
          body: "Las autorrecomendaciones no cuentan. Los créditos caducan 12 meses después de su emisión. Combinables con puntos Rewards, pero no con otros códigos promocionales.",
        },
      ],
      cta: { label: "Obtener mi enlace", to: "/account" },
    },
    fr: {
      eyebrow: "Parrainez un ami",
      title: "Offrez 20 $, recevez 20 $",
      intro:
        "Partagez loollook avec vos proches. Ils obtiennent $20 de remise sur leur première paire, et nous vous créditons $20 dès l’expédition de leur commande.",
      sections: [
        {
          heading: "Comment parrainer",
          body: "Connectez-vous à votre compte et récupérez votre lien de parrainage unique dans l’onglet Récompenses. Partagez-le par e-mail, SMS ou réseaux sociaux — sans limite de nombre de filleuls.",
        },
        {
          heading: "Comment ils l’utilisent",
          body: "Votre ami visite votre lien, fait ses achats comme d’habitude, et la remise de $20 s’applique automatiquement au paiement — sur toute monture à plus de $50.",
        },
        {
          heading: "Comment vous gagnez",
          body: "Dès l’expédition de la commande de votre ami, $20 de crédit boutique arrivent sur votre compte. Cumulez les crédits — parrainez 5 amis, recevez $100 pour votre prochaine paire.",
        },
        {
          heading: "Conditions",
          body: "Les auto-parrainages ne comptent pas. Les crédits expirent 12 mois après leur émission. Cumulables avec les points Récompenses mais non avec d’autres codes promo.",
        },
      ],
      cta: { label: "Obtenir mon lien", to: "/account" },
    },
    de: {
      eyebrow: "Freunde werben",
      title: "Verschenke 20 $, erhalte 20 $",
      intro:
        "Teile loollook mit den Menschen in deinem Leben. Sie bekommen $20 Rabatt auf ihre erste Brille, und wir schreiben dir $20 Guthaben gut, sobald ihre Bestellung versandt wird.",
      sections: [
        {
          heading: "So empfiehlst du",
          body: "Melde dich in deinem Konto an und hol dir deinen persönlichen Empfehlungslink aus dem Rewards-Tab. Teile ihn per E-Mail, SMS oder Social Media — es gibt keine Obergrenze, wie viele Freunde du werben kannst.",
        },
        {
          heading: "So lösen sie ein",
          body: "Deine Freundin oder dein Freund öffnet deinen Link, kauft wie gewohnt ein, und der Rabatt von $20 wird an der Kasse automatisch auf jede Fassung über $50 angewendet.",
        },
        {
          heading: "So verdienst du",
          body: "Sobald die Bestellung versandt wird, landen $20 Store-Guthaben auf deinem Konto. Guthaben lässt sich stapeln — wirb 5 Freunde und erhalte $100 für deine nächste Brille.",
        },
        {
          heading: "Das Kleingedruckte",
          body: "Selbstempfehlungen zählen nicht. Guthaben verfällt 12 Monate nach Ausstellung. Kombinierbar mit Rewards-Punkten, aber nicht mit anderen Promo-Codes.",
        },
      ],
      cta: { label: "Meinen Empfehlungslink", to: "/account" },
    },
    it: {
      eyebrow: "Invita un amico",
      title: "Regala 20 $, ricevi 20 $",
      intro:
        "Condividi loollook con le persone della tua vita. Riceveranno $20 di sconto sul primo paio e a te invieremo $20 di credito nel momento in cui il loro ordine viene spedito.",
      sections: [
        {
          heading: "Come invitare",
          body: "Accedi al tuo account e prendi il tuo link di invito unico dalla scheda Rewards. Condividilo via email, sms o social — non c’è un limite al numero di amici che puoi invitare.",
        },
        {
          heading: "Come lo riscattano",
          body: "Il tuo amico visita il tuo link, fa acquisti come al solito e lo sconto di $20 viene applicato automaticamente al checkout — su qualsiasi montatura sopra i $50.",
        },
        {
          heading: "Come guadagni tu",
          body: "Nel momento in cui l’ordine del tuo amico viene spedito, $20 di credito spendibile arrivano nel tuo account. Crediti cumulabili — invita 5 amici, ottieni $100 da spendere sul tuo prossimo paio.",
        },
        {
          heading: "Condizioni",
          body: "Gli auto-inviti non valgono. I crediti scadono 12 mesi dopo l’emissione. Cumulabili con i punti Rewards ma non con altri codici promo.",
        },
      ],
      cta: { label: "Ottieni il mio link", to: "/account" },
    },
    pt: {
      eyebrow: "Indique um amigo",
      title: "Dê US$20, ganhe US$20",
      intro:
        "Compartilhe a loollook com as pessoas da sua vida. Elas ganham $20 de desconto no primeiro par, e enviamos $20 em crédito para você assim que o pedido for despachado.",
      sections: [
        {
          heading: "Como indicar",
          body: "Acesse sua conta e pegue seu link exclusivo de indicação na aba Recompensas. Compartilhe por e-mail, mensagem ou redes sociais — não há limite de quantos amigos você pode indicar.",
        },
        {
          heading: "Como eles resgatam",
          body: "Seu amigo acessa o seu link, compra normalmente e o desconto de $20 é aplicado automaticamente no checkout — em qualquer armação acima de $50.",
        },
        {
          heading: "Como você ganha",
          body: "Assim que o pedido do seu amigo é despachado, $20 em crédito da loja caem na sua conta. Acumule créditos — indique 5 amigos e ganhe $100 para o seu próximo par.",
        },
        {
          heading: "Letras miúdas",
          body: "Indicações para si mesmo não contam. Os créditos expiram 12 meses após a emissão. Podem ser combinados com pontos Rewards, mas não com outros códigos promocionais.",
        },
      ],
      cta: { label: "Obter meu link", to: "/account" },
    },
    ja: {
      eyebrow: "友達紹介",
      title: "$20 を贈って、$20 をもらう",
      intro:
        "身近な方に loollook をご紹介ください。お友達は初回購入で $20 OFF、そしてご注文が発送された瞬間に、あなたへ $20 のクレジットをお届けします。",
      sections: [
        {
          heading: "紹介の方法",
          body: "アカウントにサインインし、Rewards タブからあなた専用の紹介リンクを取得します。メール、SMS、SNS でシェアしてください。紹介できるお友達の人数に制限はありません。",
        },
        {
          heading: "友達の使い方",
          body: "お友達があなたのリンクからアクセスし、いつも通りお買い物をすると、チェックアウト時に $50 以上のフレームに対して $20 の割引が自動的に適用されます。",
        },
        {
          heading: "あなたの獲得方法",
          body: "お友達のご注文が発送された瞬間、$20 分のストアクレジットがあなたのアカウントに付与されます。クレジットは積み上げ可能。5 人のお友達を紹介すれば、次回のお買い物に $100 が使えます。",
        },
        {
          heading: "注意事項",
          body: "ご自身を紹介することはできません。クレジットの有効期限は発行から 12 か月です。リワードポイントとの併用は可能ですが、他のプロモコードとの併用はできません。",
        },
      ],
      cta: { label: "紹介リンクを取得", to: "/account" },
    },
    ko: {
      eyebrow: "친구 추천",
      title: "$20 선물하고 $20 받기",
      intro:
        "주변 사람들에게 loollook을 소개해 보세요. 친구는 첫 구매 시 $20 할인을, 친구의 주문이 발송되는 순간 회원님께도 $20 스토어 크레딧이 적립됩니다.",
      sections: [
        {
          heading: "추천 방법",
          body: "계정에 로그인한 뒤 Rewards 탭에서 본인의 고유 추천 링크를 받으세요. 이메일, 문자, SNS로 공유할 수 있으며 추천 가능한 친구 수에 제한은 없습니다.",
        },
        {
          heading: "친구가 받는 방법",
          body: "친구가 링크로 들어와 평소처럼 쇼핑하면, $50 이상 프레임에 한해 결제 단계에서 $20 할인이 자동 적용됩니다.",
        },
        {
          heading: "내가 적립받는 방법",
          body: "친구의 주문이 발송되는 순간, $20 스토어 크레딧이 회원님 계정에 입금됩니다. 누적도 가능합니다 — 친구 5명을 추천하면 다음 안경에 쓸 수 있는 $100가 모입니다.",
        },
        {
          heading: "세부 약관",
          body: "본인 추천은 인정되지 않습니다. 크레딧은 발행일로부터 12개월 후 만료됩니다. Rewards 포인트와는 중복 사용 가능하지만, 다른 프로모션 코드와는 함께 사용할 수 없습니다.",
        },
      ],
      cta: { label: "추천 링크 받기", to: "/account" },
    },
    ar: {
      eyebrow: "أوصِ بصديق",
      title: "امنح 20$ واحصل على 20$",
      intro:
        "شارك loollook مع من حولك. سيحصلون على خصم $20 على نظارتهم الأولى، وسنرسل لك رصيدًا بقيمة $20 في اللحظة التي يُشحن فيها طلبهم.",
      sections: [
        {
          heading: "كيف توصي",
          body: "سجّل الدخول إلى حسابك واحصل على رابط الإحالة الخاص بك من تبويب Rewards. شاركه عبر البريد الإلكتروني أو الرسائل النصية أو وسائل التواصل — لا حدّ لعدد الأصدقاء الذين يمكنك دعوتهم.",
        },
        {
          heading: "كيف يستفيد صديقك",
          body: "يدخل صديقك عبر رابطك، يتسوّق كالمعتاد، ويُطبَّق خصم الـ $20 تلقائيًا عند الدفع — على أي إطار يزيد سعره عن $50.",
        },
        {
          heading: "كيف تربح أنت",
          body: "في اللحظة التي يُشحن فيها طلب صديقك، يدخل رصيد $20 إلى حسابك. الأرصدة قابلة للتكديس — أحِل 5 أصدقاء واحصل على $100 لخصمها من نظارتك التالية.",
        },
        {
          heading: "الشروط الدقيقة",
          body: "الإحالات الذاتية لا تُحتسَب. تنتهي صلاحية الأرصدة بعد 12 شهرًا من إصدارها. يمكن دمجها مع نقاط Rewards، لكن ليس مع أكواد الترويج الأخرى.",
        },
      ],
      cta: { label: "احصل على رابطي", to: "/account" },
    },
    vi: {
      eyebrow: "Giới thiệu bạn bè",
      title: "Tặng $20, nhận $20",
      intro:
        "Chia sẻ loollook với những người thân thiết. Họ được giảm $20 cho lần mua đầu tiên, và chúng tôi sẽ gửi cho bạn $20 tín dụng ngay khi đơn của họ được gửi đi.",
      sections: [
        {
          heading: "Cách giới thiệu",
          body: "Đăng nhập tài khoản và lấy liên kết giới thiệu duy nhất của bạn từ tab Rewards. Chia sẻ qua email, tin nhắn hoặc mạng xã hội — không giới hạn số bạn bè bạn có thể giới thiệu.",
        },
        {
          heading: "Cách họ sử dụng",
          body: "Bạn của bạn truy cập liên kết, mua sắm như bình thường, và mức giảm $20 được áp dụng tự động khi thanh toán — cho bất kỳ gọng nào trên $50.",
        },
        {
          heading: "Cách bạn kiếm điểm",
          body: "Ngay khi đơn của bạn của bạn được gửi đi, $20 tín dụng cửa hàng sẽ về tài khoản của bạn. Tín dụng có thể cộng dồn — giới thiệu 5 người bạn, nhận $100 cho lần mua tiếp theo.",
        },
        {
          heading: "Điều khoản nhỏ",
          body: "Không chấp nhận tự giới thiệu. Tín dụng hết hạn sau 12 tháng kể từ ngày phát hành. Có thể kết hợp với điểm Rewards nhưng không với mã khuyến mãi khác.",
        },
      ],
      cta: { label: "Lấy liên kết giới thiệu", to: "/account" },
    },
    th: {
      eyebrow: "แนะนำเพื่อน",
      title: "ให้ $20 รับ $20",
      intro:
        "แบ่งปัน loollook ให้คนรอบตัวคุณ พวกเขาจะได้ส่วนลด $20 สำหรับการซื้อครั้งแรก และเราจะส่ง $20 เครดิตให้คุณทันทีที่คำสั่งซื้อของพวกเขาถูกจัดส่ง",
      sections: [
        {
          heading: "วิธีแนะนำ",
          body: "เข้าสู่ระบบบัญชีของคุณและรับลิงก์แนะนำเฉพาะของคุณจากแท็บ Rewards แชร์ผ่านอีเมล ข้อความ หรือโซเชียลมีเดีย — ไม่จำกัดจำนวนเพื่อนที่คุณสามารถแนะนำได้",
        },
        {
          heading: "เพื่อนของคุณใช้อย่างไร",
          body: "เพื่อนของคุณเข้าผ่านลิงก์ของคุณ ช้อปตามปกติ และส่วนลด $20 จะถูกนำมาใช้อัตโนมัติเมื่อชำระเงิน — สำหรับกรอบใด ๆ ที่ราคาเกิน $50",
        },
        {
          heading: "คุณรับรายได้อย่างไร",
          body: "ทันทีที่คำสั่งซื้อของเพื่อนถูกจัดส่ง $20 เครดิตร้านค้าจะเข้าบัญชีของคุณ สะสมเครดิตได้ — แนะนำเพื่อน 5 คนรับ $100 สำหรับการซื้อครั้งถัดไป",
        },
        {
          heading: "เงื่อนไขเล็กน้อย",
          body: "การแนะนำตนเองไม่นับ เครดิตหมดอายุ 12 เดือนหลังจากออกให้ ใช้ร่วมกับคะแนน Rewards ได้ แต่ใช้ร่วมกับโค้ดโปรโมชั่นอื่นไม่ได้",
        },
      ],
      cta: { label: "รับลิงก์แนะนำของฉัน", to: "/account" },
    },
    id: {
      eyebrow: "Ajak teman",
      title: "Beri $20, dapat $20",
      intro:
        "Bagikan loollook kepada orang-orang dalam hidup Anda. Mereka mendapat diskon $20 untuk pesanan pertama, dan kami mengirimkan $20 dalam bentuk kredit kepada Anda saat pesanan mereka dikirim.",
      sections: [
        {
          heading: "Cara merekomendasikan",
          body: "Masuk ke akun Anda dan ambil tautan rujukan unik dari tab Rewards. Bagikan via email, pesan, atau media sosial — tidak ada batasan jumlah teman yang dapat Anda rekomendasikan.",
        },
        {
          heading: "Cara mereka menukarkan",
          body: "Teman Anda mengunjungi tautan Anda, berbelanja seperti biasa, dan diskon $20 berlaku otomatis di checkout — untuk bingkai apa pun di atas $50.",
        },
        {
          heading: "Cara Anda mendapatkannya",
          body: "Begitu pesanan teman Anda dikirim, $20 kredit toko masuk ke akun Anda. Akumulasikan kredit — rekomendasikan 5 teman, dapatkan $100 untuk pasangan kacamata berikutnya.",
        },
        {
          heading: "Ketentuan kecil",
          body: "Rekomendasi diri sendiri tidak dihitung. Kredit kedaluwarsa 12 bulan setelah diterbitkan. Dapat dikombinasikan dengan poin Rewards tetapi tidak dengan kode promo lain.",
        },
      ],
      cta: { label: "Ambil tautan rujukan saya", to: "/account" },
    },
    ms: {
      eyebrow: "Rujuk rakan",
      title: "Beri $20, dapat $20",
      intro:
        "Kongsi loollook dengan orang-orang dalam hidup anda. Mereka mendapat diskaun $20 untuk pasangan pertama, dan kami menghantar $20 kredit kepada anda sebaik sahaja pesanan mereka dihantar.",
      sections: [
        {
          heading: "Cara merujuk",
          body: "Log masuk ke akaun anda dan dapatkan pautan rujukan unik anda dari tab Rewards. Kongsi melalui e-mel, mesej atau media sosial — tiada had bilangan rakan yang boleh anda rujuk.",
        },
        {
          heading: "Bagaimana mereka menebus",
          body: "Rakan anda melawat pautan anda, membeli-belah seperti biasa, dan diskaun $20 dikenakan secara automatik semasa pembayaran — untuk mana-mana bingkai melebihi $50.",
        },
        {
          heading: "Bagaimana anda dapat",
          body: "Sebaik sahaja pesanan rakan anda dihantar, $20 kredit kedai masuk ke akaun anda. Kumpul kredit — rujuk 5 rakan, dapat $100 untuk pasangan seterusnya.",
        },
        {
          heading: "Syarat kecil",
          body: "Rujukan kepada diri sendiri tidak dikira. Kredit luput 12 bulan selepas diterbitkan. Boleh digabungkan dengan mata Rewards tetapi bukan dengan kod promosi lain.",
        },
      ],
      cta: { label: "Dapatkan pautan rujukan saya", to: "/account" },
    },
  },
  affiliate: {
    en: {
      eyebrow: "For Creators & Partners",
      title: "loollook Affiliate Program",
      intro:
        "Whether you’re a stylist, an optometrist, or a creator with an audience that loves great design, our affiliate program rewards every sale you drive.",
      sections: [
        {
          heading: "Commission",
          body: "10% on every order from a new customer, scaling up to 15% once you reach $5,000 in monthly tracked sales. Cookie window is 30 days.",
        },
        {
          heading: "Tools we provide",
          body: "A creator dashboard with real-time stats, downloadable assets (lifestyle photography, lookbooks, video), curated landing pages, and unique discount codes for your audience.",
        },
        {
          heading: "Who we work with",
          body: "Stylists, optometrists, eye-health writers, lifestyle creators with engaged audiences (no minimum follower count — engagement matters more), and small media properties.",
        },
        {
          heading: "Apply",
          body: "Tell us about your audience at partners@loollook.com. We respond within 5 business days.",
        },
      ],
    },
    zh: {
      eyebrow: "创作者与合作伙伴",
      title: "loollook 联盟计划",
      intro:
        "无论你是造型师、视光师，还是拥有热爱设计受众的创作者，我们的联盟计划都能让你的每一次推荐获得回报。",
      sections: [
        {
          heading: "佣金",
          body: "新客每单 10% 佣金；月追踪销售达到 5,000 美元后升至 15%。Cookie 周期 30 天。",
        },
        {
          heading: "我们提供的工具",
          body: "实时数据创作者后台、可下载素材包（生活方式摄影、Lookbook、视频）、定制落地页，以及面向你的受众的专属折扣码。",
        },
        {
          heading: "合作对象",
          body: "造型师、视光师、眼健康作者、有高互动度的生活方式创作者（不设最低粉丝量——互动比数量更重要），以及小型媒体。",
        },
        {
          heading: "申请加入",
          body: "把你的受众情况发给 partners@loollook.com，我们将在 5 个工作日内回复。",
        },
      ],
    },
    es: {
      eyebrow: "Para creadores y socios",
      title: "Programa de afiliados loollook",
      intro:
        "Tanto si eres estilista, optometrista o creador con una audiencia que adora el buen diseño, nuestro programa de afiliados recompensa cada venta que generas.",
      sections: [
        {
          heading: "Comisión",
          body: "10% en cada pedido de un cliente nuevo, escalando al 15% cuando alcances $5,000 en ventas mensuales rastreadas. La ventana de cookies es de 30 días.",
        },
        {
          heading: "Herramientas que ofrecemos",
          body: "Un panel para creadores con estadísticas en tiempo real, recursos descargables (fotografía de estilo de vida, lookbooks, vídeo), landing pages personalizadas y códigos de descuento únicos para tu audiencia.",
        },
        {
          heading: "Con quién trabajamos",
          body: "Estilistas, optometristas, divulgadores de salud visual, creadores lifestyle con audiencias comprometidas (no hay un mínimo de seguidores: la interacción importa más) y pequeños medios de comunicación.",
        },
        {
          heading: "Aplicar",
          body: "Cuéntanos sobre tu audiencia en partners@loollook.com. Respondemos en un plazo de 5 días hábiles.",
        },
      ],
    },
    fr: {
      eyebrow: "Pour créateurs et partenaires",
      title: "Programme d’affiliation loollook",
      intro:
        "Que vous soyez styliste, optométriste ou créateur d’une audience qui aime le beau design, notre programme d’affiliation récompense chaque vente que vous générez.",
      sections: [
        {
          heading: "Commission",
          body: "10 % sur chaque commande d’un nouveau client, jusqu’à 15 % dès que vous atteignez $5 000 de ventes mensuelles suivies. Fenêtre de cookie de 30 jours.",
        },
        {
          heading: "Outils fournis",
          body: "Un tableau de bord créateur avec des stats en temps réel, des ressources téléchargeables (photographie lifestyle, lookbooks, vidéos), des pages d’atterrissage sur mesure et des codes promo uniques pour votre audience.",
        },
        {
          heading: "Avec qui nous travaillons",
          body: "Stylistes, optométristes, rédacteurs santé visuelle, créateurs lifestyle avec une audience engagée (pas de minimum de followers — l’engagement compte davantage), et petits médias.",
        },
        {
          heading: "Postuler",
          body: "Parlez-nous de votre audience à partners@loollook.com. Nous répondons sous 5 jours ouvrés.",
        },
      ],
    },
    de: {
      eyebrow: "Für Creator & Partner",
      title: "loollook Affiliate-Programm",
      intro:
        "Ob Stylistin, Augenoptiker oder Creator mit einer Community, die gutes Design liebt — unser Affiliate-Programm belohnt jeden Verkauf, den du auslöst.",
      sections: [
        {
          heading: "Provision",
          body: "10 % auf jede Bestellung eines Neukunden, gestaffelt auf bis zu 15 %, sobald du im Monat $5.000 nachverfolgte Umsätze erreichst. Das Cookie-Fenster beträgt 30 Tage.",
        },
        {
          heading: "Unsere Tools",
          body: "Ein Creator-Dashboard mit Echtzeit-Statistiken, downloadbare Assets (Lifestyle-Fotografie, Lookbooks, Video), kuratierte Landingpages und individuelle Rabattcodes für deine Community.",
        },
        {
          heading: "Mit wem wir arbeiten",
          body: "Stylistinnen und Stylisten, Augenoptikerinnen, Autorinnen rund um Augengesundheit, Lifestyle-Creator mit engagierten Communities (keine Mindestfollowerzahl — Engagement zählt mehr) sowie kleinere Medienformate.",
        },
        {
          heading: "Bewerben",
          body: "Erzähl uns unter partners@loollook.com von deiner Community. Wir antworten innerhalb von 5 Werktagen.",
        },
      ],
    },
    it: {
      eyebrow: "Per creator e partner",
      title: "Programma affiliati loollook",
      intro:
        "Che tu sia uno stylist, un optometrista o un creator con un pubblico che ama il buon design, il nostro programma di affiliazione premia ogni vendita che generi.",
      sections: [
        {
          heading: "Commissione",
          body: "10% su ogni ordine di un nuovo cliente, che sale al 15% una volta raggiunti $5.000 in vendite tracciate mensili. Finestra cookie di 30 giorni.",
        },
        {
          heading: "Strumenti forniti",
          body: "Una dashboard per creator con statistiche in tempo reale, asset scaricabili (fotografia lifestyle, lookbook, video), landing page dedicate e codici sconto unici per il tuo pubblico.",
        },
        {
          heading: "Con chi collaboriamo",
          body: "Stylist, optometristi, autori di contenuti sulla salute degli occhi, creator lifestyle con pubblico coinvolto (nessun minimo di follower richiesto — l’engagement conta di più) e piccole proprietà media.",
        },
        {
          heading: "Candidati",
          body: "Raccontaci del tuo pubblico scrivendo a partners@loollook.com. Rispondiamo entro 5 giorni lavorativi.",
        },
      ],
    },
    pt: {
      eyebrow: "Para criadores e parceiros",
      title: "Programa de afiliados loollook",
      intro:
        "Seja você um stylist, um optometrista ou um criador com uma audiência que ama bom design, nosso programa de afiliados recompensa cada venda que você gera.",
      sections: [
        {
          heading: "Comissão",
          body: "10% em todo pedido de um novo cliente, subindo para 15% quando você atinge $5.000 em vendas rastreadas por mês. A janela de cookie é de 30 dias.",
        },
        {
          heading: "Ferramentas que oferecemos",
          body: "Um painel de criador com estatísticas em tempo real, materiais para download (fotografia de lifestyle, lookbooks, vídeo), landing pages selecionadas e códigos de desconto exclusivos para a sua audiência.",
        },
        {
          heading: "Com quem trabalhamos",
          body: "Stylists, optometristas, autores de conteúdo sobre saúde ocular, criadores de lifestyle com audiências engajadas (sem número mínimo de seguidores — engajamento conta mais) e pequenos veículos de mídia.",
        },
        {
          heading: "Candidatar-se",
          body: "Conte para nós sobre sua audiência em partners@loollook.com. Respondemos em até 5 dias úteis.",
        },
      ],
    },
    ja: {
      eyebrow: "クリエイター・パートナー向け",
      title: "loollook アフィリエイトプログラム",
      intro:
        "スタイリスト、オプトメトリスト、優れたデザインを愛するオーディエンスを持つクリエイター、いずれの方であっても、当社のアフィリエイトプログラムはあなたが生み出したすべての売上に報酬をお支払いします。",
      sections: [
        {
          heading: "報酬",
          body: "新規顧客からのご注文ごとに 10%、月間トラッキング売上が $5,000 に達すると 15% へ引き上げ。クッキーの有効期間は 30 日間です。",
        },
        {
          heading: "提供ツール",
          body: "リアルタイム統計を備えたクリエイター向けダッシュボード、ダウンロード可能なアセット（ライフスタイル写真、ルックブック、動画）、専用のランディングページ、そしてオーディエンス向けのユニークな割引コードをご提供します。",
        },
        {
          heading: "パートナーの種類",
          body: "スタイリスト、オプトメトリスト、目の健康に関するライター、エンゲージメントの高いオーディエンスを持つライフスタイル系クリエイター（最低フォロワー数の条件はありません。数よりエンゲージメントを重視します）、そして小規模メディアの方々を歓迎します。",
        },
        {
          heading: "応募する",
          body: "あなたのオーディエンスについて partners@loollook.com までお知らせください。5 営業日以内に返信いたします。",
        },
      ],
    },
    ko: {
      eyebrow: "크리에이터 & 파트너",
      title: "loollook 제휴 프로그램",
      intro:
        "스타일리스트든, 검안사든, 좋은 디자인을 사랑하는 오디언스를 보유한 크리에이터든 — 저희 제휴 프로그램은 회원님이 만들어낸 모든 판매에 보상해드립니다.",
      sections: [
        {
          heading: "수수료",
          body: "신규 고객의 모든 주문에 10% 수수료를 지급하며, 월 추적 매출이 $5,000를 넘으면 최대 15%까지 상승합니다. 쿠키 유효 기간은 30일입니다.",
        },
        {
          heading: "제공 도구",
          body: "실시간 통계가 제공되는 크리에이터 대시보드, 다운로드 가능한 에셋(라이프스타일 사진, 룩북, 비디오), 큐레이션된 랜딩 페이지, 그리고 회원님의 오디언스 전용 할인 코드를 지원합니다.",
        },
        {
          heading: "함께하는 파트너",
          body: "스타일리스트, 검안사, 안 건강 분야 작가, 참여도가 높은 오디언스를 보유한 라이프스타일 크리에이터(최소 팔로워 수 기준 없음 — 참여도가 더 중요합니다), 그리고 소규모 미디어와 함께합니다.",
        },
        {
          heading: "신청하기",
          body: "partners@loollook.com으로 회원님의 오디언스에 대해 알려주세요. 영업일 기준 5일 이내에 답변드립니다.",
        },
      ],
    },
    ar: {
      eyebrow: "للمبدعين والشركاء",
      title: "برنامج شركاء loollook",
      intro:
        "سواء كنت مصمّم مظهر، أو أخصائي بصريات، أو صانع محتوى يتابعه جمهور يعشق التصميم الجيّد، فإن برنامج الشركاء لدينا يكافئ كل عملية بيع تجلبها.",
      sections: [
        {
          heading: "العمولة",
          body: "10% على كل طلب من عميل جديد، وترتفع إلى 15% عند وصولك إلى $5,000 من المبيعات الشهرية المُتتبَّعة. نافذة الـ Cookie هي 30 يومًا.",
        },
        {
          heading: "الأدوات التي نوفرها",
          body: "لوحة تحكّم للمبدعين بإحصائيات لحظية، أصول قابلة للتنزيل (صور أسلوب حياة، lookbooks، فيديو)، صفحات هبوط مصمّمة خصيصًا، وأكواد خصم فريدة لجمهورك.",
        },
        {
          heading: "مع من نعمل",
          body: "مصمّمو المظهر، أخصائيو البصريات، كتّاب صحة العين، صنّاع محتوى أسلوب الحياة ذوو الجمهور المتفاعل (لا يوجد حدّ أدنى لعدد المتابعين — التفاعل أهم)، وكذلك المنصّات الإعلامية الصغيرة.",
        },
        {
          heading: "قدّم طلبك",
          body: "أخبرنا عن جمهورك عبر partners@loollook.com. سنردّ خلال 5 أيام عمل.",
        },
      ],
    },
    vi: {
      eyebrow: "Cho người sáng tạo & đối tác",
      title: "Chương trình affiliate loollook",
      intro:
        "Dù bạn là stylist, bác sĩ đo mắt hay người sáng tạo có cộng đồng yêu thiết kế đẹp, chương trình affiliate của chúng tôi tưởng thưởng cho mọi đơn hàng bạn mang lại.",
      sections: [
        {
          heading: "Hoa hồng",
          body: "10% trên mỗi đơn của khách mới, tăng lên 15% khi bạn đạt $5,000 doanh số được theo dõi hàng tháng. Cửa sổ cookie là 30 ngày.",
        },
        {
          heading: "Công cụ chúng tôi cung cấp",
          body: "Bảng điều khiển dành cho người sáng tạo với thống kê thời gian thực, tài nguyên có thể tải xuống (ảnh lifestyle, lookbook, video), trang đích được tuyển chọn, và mã giảm giá riêng cho khán giả của bạn.",
        },
        {
          heading: "Đối tượng chúng tôi hợp tác",
          body: "Stylist, bác sĩ đo mắt, người viết về sức khỏe mắt, người sáng tạo lifestyle có cộng đồng tương tác cao (không có yêu cầu tối thiểu về số follower — tương tác quan trọng hơn), và các đơn vị truyền thông nhỏ.",
        },
        {
          heading: "Đăng ký",
          body: "Hãy kể cho chúng tôi về khán giả của bạn qua partners@loollook.com. Chúng tôi phản hồi trong 5 ngày làm việc.",
        },
      ],
    },
    th: {
      eyebrow: "สำหรับครีเอเตอร์และพาร์ตเนอร์",
      title: "โปรแกรมพันธมิตร loollook",
      intro:
        "ไม่ว่าคุณจะเป็นสไตลิสต์ นักทัศนมาตร หรือครีเอเตอร์ที่มีผู้ติดตามรักงานออกแบบดี ๆ โปรแกรมพันธมิตรของเราจะให้รางวัลกับทุกการขายที่คุณนำพามา",
      sections: [
        {
          heading: "ค่าคอมมิชชั่น",
          body: "10% ทุกคำสั่งซื้อจากลูกค้าใหม่ เพิ่มเป็น 15% เมื่อคุณทำยอดขายที่ติดตามได้ถึง $5,000 ต่อเดือน หน้าต่างคุกกี้คือ 30 วัน",
        },
        {
          heading: "เครื่องมือที่เรามอบให้",
          body: "แดชบอร์ดครีเอเตอร์พร้อมสถิติแบบเรียลไทม์ ทรัพย์สินดิจิทัลที่ดาวน์โหลดได้ (ภาพไลฟ์สไตล์ ลุคบุ๊ค วิดีโอ) แลนดิ้งเพจที่คัดสรร และโค้ดส่วนลดเฉพาะสำหรับผู้ติดตามของคุณ",
        },
        {
          heading: "ผู้ที่เราทำงานด้วย",
          body: "สไตลิสต์ นักทัศนมาตร นักเขียนด้านสุขภาพดวงตา ครีเอเตอร์ไลฟ์สไตล์ที่มีผู้ติดตามที่มีส่วนร่วม (ไม่มีจำนวนผู้ติดตามขั้นต่ำ — การมีส่วนร่วมสำคัญกว่า) และสื่อขนาดเล็ก",
        },
        {
          heading: "สมัคร",
          body: "บอกเราเกี่ยวกับผู้ติดตามของคุณที่ partners@loollook.com เราตอบกลับภายใน 5 วันทำการ",
        },
      ],
    },
    id: {
      eyebrow: "Untuk kreator & mitra",
      title: "Program afiliasi loollook",
      intro:
        "Baik Anda seorang stylist, optometris, atau kreator dengan audiens yang menyukai desain hebat, program afiliasi kami memberikan imbalan atas setiap penjualan yang Anda dorong.",
      sections: [
        {
          heading: "Komisi",
          body: "10% pada setiap pesanan dari pelanggan baru, naik hingga 15% setelah Anda mencapai $5,000 dalam penjualan terlacak bulanan. Jendela cookie adalah 30 hari.",
        },
        {
          heading: "Alat yang kami sediakan",
          body: "Dasbor kreator dengan statistik waktu nyata, aset yang dapat diunduh (fotografi lifestyle, lookbook, video), halaman landing terkurasi, dan kode diskon unik untuk audiens Anda.",
        },
        {
          heading: "Dengan siapa kami bekerja",
          body: "Stylist, optometris, penulis kesehatan mata, kreator lifestyle dengan audiens yang aktif (tidak ada syarat minimum jumlah pengikut — keterlibatan lebih penting), dan media kecil.",
        },
        {
          heading: "Ajukan diri",
          body: "Ceritakan tentang audiens Anda di partners@loollook.com. Kami merespons dalam 5 hari kerja.",
        },
      ],
    },
    ms: {
      eyebrow: "Untuk pencipta & rakan kongsi",
      title: "Program afiliasi loollook",
      intro:
        "Sama ada anda seorang stylist, ahli optometri, atau pencipta dengan audiens yang menyukai reka bentuk hebat, program afiliasi kami memberi ganjaran atas setiap jualan yang anda dorong.",
      sections: [
        {
          heading: "Komisen",
          body: "10% pada setiap pesanan daripada pelanggan baharu, naik kepada 15% apabila anda mencapai $5,000 jualan terjejak bulanan. Tetingkap cookie ialah 30 hari.",
        },
        {
          heading: "Alat yang kami sediakan",
          body: "Papan pemuka pencipta dengan statistik masa nyata, aset yang boleh dimuat turun (fotografi lifestyle, lookbook, video), halaman pendaratan terpilih, dan kod diskaun unik untuk audiens anda.",
        },
        {
          heading: "Dengan siapa kami bekerjasama",
          body: "Stylist, ahli optometri, penulis kesihatan mata, pencipta lifestyle dengan audiens yang aktif (tiada syarat minimum jumlah pengikut — penglibatan lebih penting), dan media kecil.",
        },
        {
          heading: "Mohon",
          body: "Beritahu kami tentang audiens anda di partners@loollook.com. Kami akan membalas dalam 5 hari bekerja.",
        },
      ],
    },
  },
  "education-discount": {
    en: {
      eyebrow: "Students & Educators",
      title: "Education discount",
      intro:
        "Because clear vision shouldn’t come with a tuition bill. Verified students and educators save 15% on every loollook order, every day.",
      sections: [
        {
          heading: "Who qualifies",
          body: "Currently enrolled students at any accredited high school, college, or university. K–12, college, and graduate-level teachers, professors, and full-time faculty members.",
        },
        {
          heading: "How to verify",
          body: "We partner with SheerID for instant, secure verification. The process takes under 60 seconds — most users are verified before they finish checkout.",
        },
        {
          heading: "What’s included",
          body: "15% off frames, lenses, coatings, blue-light upgrades, and accessories. Stackable with free shipping. Not combinable with other promo codes.",
        },
        {
          heading: "Validity",
          body: "Verification is valid for 12 months, after which we’ll ask you to re-verify your status. Easy.",
        },
      ],
      cta: { label: "Shop with discount", to: "/products" },
    },
    zh: {
      eyebrow: "学生与教育工作者",
      title: "教育折扣",
      intro:
        "清晰视野不该让你为学费再付一笔账单。已验证的学生与教育者，每天每单 8.5 折。",
      sections: [
        {
          heading: "谁可以参与",
          body: "任何认可制高中、学院或大学在读学生。K–12、大学及研究生阶段教师、教授和全职教职员工。",
        },
        {
          heading: "如何验证",
          body: "我们与 SheerID 合作完成即时安全验证。整个过程不到 60 秒——大多数用户在结账完成前就已通过。",
        },
        {
          heading: "包含内容",
          body: "镜架、镜片、镀膜、防蓝光升级和配件全部 8.5 折。可叠加免运费，不可与其他促销码合并。",
        },
        {
          heading: "有效期",
          body: "验证有效期为 12 个月，到期后我们会请你重新验证身份。简单方便。",
        },
      ],
      cta: { label: "享折扣购物", to: "/products" },
    },
    es: {
      eyebrow: "Estudiantes y educadores",
      title: "Descuento educativo",
      intro:
        "Porque ver bien no debería venir con una factura de matrícula. Estudiantes y educadores verificados ahorran un 15% en cada pedido de loollook, todos los días.",
      sections: [
        {
          heading: "Quién califica",
          body: "Estudiantes matriculados en cualquier instituto, college o universidad acreditados. Profesores, docentes y profesorado a tiempo completo de K-12, college y posgrado.",
        },
        {
          heading: "Cómo verificar",
          body: "Trabajamos con SheerID para una verificación instantánea y segura. El proceso lleva menos de 60 segundos: la mayoría de los usuarios se verifican antes de terminar la compra.",
        },
        {
          heading: "Qué incluye",
          body: "15% de descuento en monturas, lentes, tratamientos, mejoras de filtro de luz azul y accesorios. Combinable con el envío gratis. No combinable con otros códigos promocionales.",
        },
        {
          heading: "Vigencia",
          body: "La verificación es válida durante 12 meses, tras los cuales te pediremos que revalides tu estado. Sencillo.",
        },
      ],
      cta: { label: "Comprar con descuento", to: "/products" },
    },
    fr: {
      eyebrow: "Étudiants et enseignants",
      title: "Réduction éducation",
      intro:
        "Parce qu’une vision nette ne devrait pas s’accompagner d’une facture de scolarité. Les étudiants et enseignants vérifiés économisent 15 % sur chaque commande loollook, tous les jours.",
      sections: [
        {
          heading: "Qui peut bénéficier",
          body: "Étudiants actuellement inscrits dans tout lycée, collège ou université accrédité. Enseignants, professeurs et personnel à temps plein du primaire au supérieur (K–12, université, troisième cycle).",
        },
        {
          heading: "Comment vérifier",
          body: "Nous travaillons avec SheerID pour une vérification instantanée et sécurisée. Le processus prend moins de 60 secondes — la plupart des utilisateurs sont vérifiés avant la fin du paiement.",
        },
        {
          heading: "Ce qui est inclus",
          body: "15 % de remise sur les montures, verres, traitements, upgrades anti-lumière bleue et accessoires. Cumulable avec la livraison gratuite. Non cumulable avec d’autres codes promo.",
        },
        {
          heading: "Validité",
          body: "La vérification est valable 12 mois ; nous vous demanderons ensuite de revérifier votre statut. C’est simple.",
        },
      ],
      cta: { label: "Profiter de la remise", to: "/products" },
    },
    de: {
      eyebrow: "Schüler & Lehrkräfte",
      title: "Bildungsrabatt",
      intro:
        "Weil scharfes Sehen nicht mit einer Studiengebühr verbunden sein sollte. Verifizierte Schülerinnen, Studierende und Lehrende sparen jeden Tag 15 % auf jede loollook-Bestellung.",
      sections: [
        {
          heading: "Wer ist berechtigt",
          body: "Aktuell eingeschriebene Schülerinnen und Studierende an akkreditierten weiterführenden Schulen, Colleges und Universitäten. Lehrkräfte aus K–12, Hochschulen und Graduate-Programmen, Professorinnen und Festangestellte des Lehrkörpers.",
        },
        {
          heading: "So bestätigst du",
          body: "Wir arbeiten mit SheerID für eine sofortige, sichere Verifizierung. Der Prozess dauert unter 60 Sekunden — die meisten Nutzer sind verifiziert, bevor sie die Kasse abschließen.",
        },
        {
          heading: "Was enthalten ist",
          body: "15 % Rabatt auf Fassungen, Gläser, Beschichtungen, Blaulicht-Upgrades und Zubehör. Kombinierbar mit kostenlosem Versand. Nicht kombinierbar mit anderen Promo-Codes.",
        },
        {
          heading: "Gültigkeit",
          body: "Die Verifizierung gilt 12 Monate; danach bitten wir dich, deinen Status erneut zu bestätigen. Ganz einfach.",
        },
      ],
      cta: { label: "Mit Rabatt einkaufen", to: "/products" },
    },
    it: {
      eyebrow: "Studenti e docenti",
      title: "Sconto education",
      intro:
        "Perché una visione nitida non dovrebbe arrivare insieme alla retta universitaria. Studenti e docenti verificati risparmiano il 15% su ogni ordine loollook, ogni giorno.",
      sections: [
        {
          heading: "Chi può aderire",
          body: "Studenti attualmente iscritti a qualsiasi scuola superiore, college o università accreditati. Insegnanti, professori e personale docente a tempo pieno di livello K–12, universitario e post-laurea.",
        },
        {
          heading: "Come verificare",
          body: "Collaboriamo con SheerID per una verifica istantanea e sicura. Il processo richiede meno di 60 secondi — la maggior parte degli utenti viene verificata prima di completare il checkout.",
        },
        {
          heading: "Cosa è incluso",
          body: "15% di sconto su montature, lenti, trattamenti, upgrade anti luce blu e accessori. Cumulabile con la spedizione gratuita. Non cumulabile con altri codici promo.",
        },
        {
          heading: "Validità",
          body: "La verifica è valida per 12 mesi, dopodiché ti chiederemo di riverificare il tuo stato. Semplice.",
        },
      ],
      cta: { label: "Acquista con sconto", to: "/products" },
    },
    pt: {
      eyebrow: "Estudantes e educadores",
      title: "Desconto educacional",
      intro:
        "Porque enxergar com clareza não deveria vir junto com a conta da faculdade. Estudantes e educadores verificados economizam 15% em cada pedido loollook, todos os dias.",
      sections: [
        {
          heading: "Quem se qualifica",
          body: "Estudantes atualmente matriculados em qualquer ensino médio, faculdade ou universidade reconhecidos. Professores, docentes e membros de corpo docente em tempo integral nos níveis K–12, graduação e pós-graduação.",
        },
        {
          heading: "Como verificar",
          body: "Trabalhamos com a SheerID para verificação instantânea e segura. O processo leva menos de 60 segundos — a maioria dos usuários é verificada antes de concluir o checkout.",
        },
        {
          heading: "O que está incluído",
          body: "15% de desconto em armações, lentes, tratamentos, upgrades para luz azul e acessórios. Pode ser combinado com frete grátis. Não combinável com outros códigos promocionais.",
        },
        {
          heading: "Validade",
          body: "A verificação vale por 12 meses; depois disso, pediremos para você reverificar seu status. Simples.",
        },
      ],
      cta: { label: "Comprar com desconto", to: "/products" },
    },
    ja: {
      eyebrow: "学生・教育者",
      title: "教育割引",
      intro:
        "クリアな視界に、追加の学費はいりません。認証された学生と教育者の方は、loollook のすべてのご注文で毎日 15% OFF をご利用いただけます。",
      sections: [
        {
          heading: "対象者",
          body: "認可された高校・短期大学・大学に在籍中の学生の方。K-12（幼稚園〜高校）、大学、大学院レベルの教員、教授、フルタイムの教職員の方々。",
        },
        {
          heading: "認証方法",
          body: "SheerID と提携し、即時かつ安全な認証を実施しています。手続きは 60 秒未満で完了し、ほとんどの方はチェックアウトを完了する前に認証されます。",
        },
        {
          heading: "対象内容",
          body: "フレーム、レンズ、コーティング、ブルーライトカットアップグレード、アクセサリーが 15% OFF。送料無料との併用が可能です。他のプロモコードとの併用はできません。",
        },
        {
          heading: "有効期間",
          body: "認証の有効期間は 12 か月で、期限後は再認証をお願いしています。手続きは簡単です。",
        },
      ],
      cta: { label: "割引で購入", to: "/products" },
    },
    ko: {
      eyebrow: "학생 & 교육자",
      title: "교육 할인",
      intro:
        "선명한 시야가 등록금 청구서를 동반해서는 안 됩니다. 인증된 학생과 교육자는 loollook의 모든 주문에서 매일 15% 할인을 받습니다.",
      sections: [
        {
          heading: "대상자",
          body: "공인된 고등학교, 대학 또는 대학교에 재학 중인 학생. K–12, 대학, 대학원 교사·교수 및 정규직 교직원이 해당됩니다.",
        },
        {
          heading: "인증 방법",
          body: "즉시·안전한 인증을 위해 SheerID와 협력하고 있습니다. 절차는 60초 이내로 완료되며, 대부분의 사용자는 결제를 마치기 전에 인증이 완료됩니다.",
        },
        {
          heading: "포함 내역",
          body: "프레임, 렌즈, 코팅, 블루라이트 업그레이드, 액세서리 15% 할인. 무료 배송과 중복 적용 가능하며, 다른 프로모션 코드와는 함께 사용할 수 없습니다.",
        },
        {
          heading: "유효 기간",
          body: "인증은 12개월간 유효하며, 이후에는 다시 인증을 요청합니다. 간단합니다.",
        },
      ],
      cta: { label: "할인 받고 쇼핑", to: "/products" },
    },
    ar: {
      eyebrow: "الطلاب والمعلمون",
      title: "خصم تعليمي",
      intro:
        "لأن الرؤية الواضحة لا ينبغي أن تأتي مع فاتورة دراسية. يحصل الطلاب والمعلّمون المُتحقَّق منهم على خصم 15% على كل طلب من loollook، كل يوم.",
      sections: [
        {
          heading: "من يحق له",
          body: "الطلاب المسجَّلون حاليًا في أي مدرسة ثانوية أو كلية أو جامعة معتمدة. ومعلّمو K–12 والكليات والدراسات العليا، والأساتذة، وأعضاء هيئة التدريس بدوام كامل.",
        },
        {
          heading: "كيفية التحقق",
          body: "نتعاون مع SheerID لإجراء تحقّق فوري وآمن. تستغرق العملية أقل من 60 ثانية — يُتحقَّق من معظم المستخدمين قبل أن يُكملوا الدفع.",
        },
        {
          heading: "ما هو مشمول",
          body: "خصم 15% على الإطارات والعدسات والطلاءات وترقية فلتر الضوء الأزرق والإكسسوارات. قابل للدمج مع الشحن المجاني، لكنه غير قابل للدمج مع أكواد الترويج الأخرى.",
        },
        {
          heading: "الصلاحية",
          body: "التحقق صالح لمدة 12 شهرًا، وبعدها سنطلب منك إعادة التحقق من حالتك. الأمر بسيط.",
        },
      ],
      cta: { label: "تسوق بالخصم", to: "/products" },
    },
    vi: {
      eyebrow: "Sinh viên & nhà giáo",
      title: "Ưu đãi giáo dục",
      intro:
        "Vì tầm nhìn rõ ràng không nên đi kèm với hóa đơn học phí. Sinh viên và nhà giáo đã được xác minh tiết kiệm 15% trên mọi đơn loollook, mỗi ngày.",
      sections: [
        {
          heading: "Ai đủ điều kiện",
          body: "Sinh viên đang theo học tại bất kỳ trường trung học, cao đẳng hoặc đại học được công nhận nào. Giáo viên K–12, đại học và sau đại học, giáo sư, và giảng viên toàn thời gian.",
        },
        {
          heading: "Cách xác minh",
          body: "Chúng tôi hợp tác với SheerID để xác minh ngay lập tức và an toàn. Quy trình mất chưa đến 60 giây — hầu hết người dùng được xác minh trước khi hoàn tất thanh toán.",
        },
        {
          heading: "Những gì bao gồm",
          body: "Giảm 15% trên gọng, tròng, lớp phủ, nâng cấp chống ánh sáng xanh và phụ kiện. Có thể kết hợp với miễn phí vận chuyển. Không kết hợp được với các mã khuyến mãi khác.",
        },
        {
          heading: "Hiệu lực",
          body: "Xác minh có hiệu lực trong 12 tháng, sau đó chúng tôi sẽ đề nghị bạn xác minh lại trạng thái. Đơn giản.",
        },
      ],
      cta: { label: "Mua sắm với ưu đãi", to: "/products" },
    },
    th: {
      eyebrow: "นักเรียนและบุคลากรการศึกษา",
      title: "ส่วนลดการศึกษา",
      intro:
        "เพราะการมองเห็นชัดเจนไม่ควรมาพร้อมกับใบเรียกเก็บค่าเล่าเรียน นักเรียนและบุคลากรการศึกษาที่ได้รับการยืนยันรับส่วนลด 15% สำหรับทุกคำสั่งซื้อ loollook ทุกวัน",
      sections: [
        {
          heading: "ใครมีสิทธิ์",
          body: "นักเรียน/นักศึกษาที่กำลังลงทะเบียนเรียนในโรงเรียนมัธยม วิทยาลัย หรือมหาวิทยาลัยที่ได้รับการรับรอง ครู อาจารย์ระดับ K–12 มหาวิทยาลัย และบัณฑิตศึกษา รวมถึงบุคลากรเต็มเวลา",
        },
        {
          heading: "วิธียืนยัน",
          body: "เราเป็นพันธมิตรกับ SheerID เพื่อการยืนยันที่รวดเร็วและปลอดภัย กระบวนการใช้เวลาน้อยกว่า 60 วินาที — ผู้ใช้ส่วนใหญ่ได้รับการยืนยันก่อนชำระเงินเสร็จ",
        },
        {
          heading: "สิ่งที่รวมอยู่",
          body: "ส่วนลด 15% สำหรับกรอบ เลนส์ การเคลือบ อัปเกรดกันแสงสีฟ้า และอุปกรณ์เสริม รวมกับการส่งฟรีได้ ไม่สามารถใช้ร่วมกับโค้ดโปรโมชั่นอื่นได้",
        },
        {
          heading: "ระยะเวลามีผล",
          body: "การยืนยันมีผล 12 เดือน หลังจากนั้นเราจะขอให้คุณยืนยันสถานะอีกครั้ง ง่ายมาก",
        },
      ],
      cta: { label: "ช้อปด้วยส่วนลด", to: "/products" },
    },
    id: {
      eyebrow: "Pelajar & pendidik",
      title: "Diskon pendidikan",
      intro:
        "Karena penglihatan yang jernih tidak seharusnya datang bersama tagihan SPP. Pelajar dan pendidik yang terverifikasi menghemat 15% di setiap pesanan loollook, setiap hari.",
      sections: [
        {
          heading: "Siapa yang memenuhi syarat",
          body: "Pelajar yang sedang terdaftar di sekolah menengah, college, atau universitas yang terakreditasi. Guru K–12, dosen college dan pascasarjana, profesor, serta staf pengajar penuh waktu.",
        },
        {
          heading: "Cara verifikasi",
          body: "Kami bermitra dengan SheerID untuk verifikasi instan yang aman. Prosesnya kurang dari 60 detik — kebanyakan pengguna terverifikasi sebelum mereka menyelesaikan checkout.",
        },
        {
          heading: "Yang termasuk",
          body: "Diskon 15% untuk bingkai, lensa, pelapis, upgrade cahaya biru, dan aksesori. Bisa digabungkan dengan pengiriman gratis. Tidak bisa digabungkan dengan kode promo lain.",
        },
        {
          heading: "Masa berlaku",
          body: "Verifikasi berlaku selama 12 bulan, setelah itu kami akan meminta Anda memverifikasi ulang status. Mudah.",
        },
      ],
      cta: { label: "Belanja dengan diskon", to: "/products" },
    },
    ms: {
      eyebrow: "Pelajar & pendidik",
      title: "Diskaun pendidikan",
      intro:
        "Kerana penglihatan jelas tidak sepatutnya datang dengan bil yuran pengajian. Pelajar dan pendidik yang disahkan menjimatkan 15% pada setiap pesanan loollook, setiap hari.",
      sections: [
        {
          heading: "Siapa yang layak",
          body: "Pelajar yang sedang berdaftar di mana-mana sekolah menengah, kolej atau universiti yang diiktiraf. Guru K–12, pensyarah kolej dan pascasiswazah, profesor, serta tenaga pengajar sepenuh masa.",
        },
        {
          heading: "Cara mengesahkan",
          body: "Kami bekerjasama dengan SheerID untuk pengesahan segera yang selamat. Prosesnya mengambil masa kurang daripada 60 saat — kebanyakan pengguna disahkan sebelum mereka menyelesaikan pembayaran.",
        },
        {
          heading: "Apa yang termasuk",
          body: "Diskaun 15% pada bingkai, kanta, salutan, naik taraf cahaya biru, dan aksesori. Boleh digabungkan dengan penghantaran percuma. Tidak boleh digabungkan dengan kod promosi lain.",
        },
        {
          heading: "Tempoh sah",
          body: "Pengesahan sah selama 12 bulan, selepas itu kami akan meminta anda mengesahkan semula status anda. Mudah.",
        },
      ],
      cta: { label: "Beli-belah dengan diskaun", to: "/products" },
    },
  },
  promise: {
    en: {
      eyebrow: "Our Guarantee",
      title: "The loollook Promise",
      intro:
        "Every loollook frame is engineered to last — and we stand behind it. Here’s exactly what we cover, and for how long.",
      sections: [
        {
          heading: "365-day warranty",
          body: "If anything fails because of how we made it — a hinge that loosens, a coating that bubbles, a temple that cracks — we repair or replace it free, for one full year from delivery.",
        },
        {
          heading: "Free adjustments for life",
          body: "Visit any partner optometrist worldwide for free fitting adjustments — anytime, no expiration. Or request a free at-home adjustment kit and we’ll walk you through it.",
        },
        {
          heading: "30-Day Returns (non-prescription)",
          body: "30-day free returns & exchanges for non-prescription glasses. Prescription glasses are custom-made to your prescription and PD and are non-returnable except for manufacturing defects or prescription errors.",
        },
        {
          heading: "What’s not covered",
          body: "Cosmetic damage from drops, scratches from improper cleaning, or modifications by third-party shops. Lenses with custom prescription edits older than 90 days.",
        },
      ],
    },
    zh: {
      eyebrow: "我们的承诺",
      title: "loollook 的承诺",
      intro:
        "每一副 loollook 镜架都为耐用而生——我们以行动背书。下面是我们具体保障什么、保多久。",
      sections: [
        {
          heading: "365 天质保",
          body: "因制造问题导致的任何故障——铰链松动、镀膜起泡、镜腿断裂——交付起一年内，我们免费维修或更换。",
        },
        {
          heading: "终身免费调整",
          body: "全球任何合作视光店均可享受免费佩戴调整——任何时候都可，无有效期。也可申请免费居家调整工具包，我们将引导你完成。",
        },
        {
          heading: "30 天退换货（非处方）",
          body: "非处方眼镜（平光镜）30 天内免费退换；处方眼镜按您的处方与瞳距定制，除非存在制造缺陷或我方配镜错误，否则不接受退换。",
        },
        {
          heading: "不在范围内的情况",
          body: "跌落造成的外观损伤、不当清洁产生的划痕、第三方店铺的改装。镜片定制超过 90 天的处方修改不在质保范围内。",
        },
      ],
    },
    es: {
      eyebrow: "Nuestra garantía",
      title: "La promesa loollook",
      intro:
        "Cada montura loollook está diseñada para durar, y la respaldamos. Aquí tienes exactamente qué cubrimos y por cuánto tiempo.",
      sections: [
        {
          heading: "Garantía de 365 días",
          body: "Si algo falla por nuestra fabricación —una bisagra que se afloja, un tratamiento que se burbujea, una varilla que se rompe— lo reparamos o reemplazamos gratis durante un año completo desde la entrega.",
        },
        {
          heading: "Ajustes gratis de por vida",
          body: "Acude a cualquier optometrista asociado en todo el mundo para ajustes gratuitos, en cualquier momento y sin caducidad. O solicita un kit de ajuste gratuito para casa y te guiamos paso a paso.",
        },
        {
          heading: "Devoluciones a 30 días (sin graduación)",
          body: "Devoluciones y cambios gratuitos a 30 días para gafas sin graduación. Las gafas graduadas se fabrican a medida según su prescripción y DP y no son devolvibles salvo defecto de fabricación o error nuestro.",
        },
        {
          heading: "Lo que no se cubre",
          body: "Daños estéticos por caídas, rayaduras por una limpieza inadecuada o modificaciones realizadas por terceros. Lentes con ajustes personalizados de receta de más de 90 días.",
        },
      ],
    },
    fr: {
      eyebrow: "Notre garantie",
      title: "L’engagement loollook",
      intro:
        "Chaque monture loollook est conçue pour durer — et nous l’assumons. Voici exactement ce que nous couvrons, et pour combien de temps.",
      sections: [
        {
          heading: "Garantie 365 jours",
          body: "Si quoi que ce soit défaille à cause d’un défaut de fabrication — charnière qui se desserre, traitement qui cloque, branche qui casse — nous réparons ou remplaçons gratuitement, pendant une année complète à compter de la livraison.",
        },
        {
          heading: "Ajustements gratuits à vie",
          body: "Rendez-vous chez n’importe quel optométriste partenaire dans le monde pour des ajustements gratuits — à tout moment, sans expiration. Ou demandez un kit d’ajustement à domicile gratuit et nous vous guidons pas à pas.",
        },
        {
          heading: "Retours à 30 jours (sans prescription)",
          body: "Retours et échanges gratuits à 30 jours pour les lunettes sans prescription. Les lunettes à prescription sont fabriquées sur mesure et ne sont pas retournables sauf défaut de fabrication ou erreur de notre part.",
        },
        {
          heading: "Ce qui n’est pas couvert",
          body: "Les dommages esthétiques dus aux chutes, les rayures liées à un mauvais nettoyage ou les modifications faites par des ateliers tiers. Les verres avec corrections personnalisées de plus de 90 jours.",
        },
      ],
    },
    de: {
      eyebrow: "Unsere Garantie",
      title: "Das loollook-Versprechen",
      intro:
        "Jede loollook-Fassung ist auf Langlebigkeit ausgelegt — und wir stehen dahinter. Hier steht genau, was wir abdecken und für wie lange.",
      sections: [
        {
          heading: "365 Tage Garantie",
          body: "Wenn etwas wegen unserer Verarbeitung versagt — ein Scharnier lockert sich, eine Beschichtung blättert ab, ein Bügel bricht — reparieren oder ersetzen wir es ein ganzes Jahr ab Lieferung kostenlos.",
        },
        {
          heading: "Lebenslange kostenlose Anpassungen",
          body: "Geh weltweit zu jeder Partner-Augenoptikerin für kostenlose Anpassungen — jederzeit, ohne Ablauffrist. Oder fordere ein kostenloses Anpassungsset für zuhause an, wir leiten dich Schritt für Schritt an.",
        },
        {
          heading: "30-Tage-Rückgabe (ohne Sehstärke)",
          body: "30-tägige kostenlose Rücksendungen und Umtausch für Brillen ohne Sehstärke. Brillen mit Sehstärke werden individuell nach Ihrer Verordnung gefertigt und sind außer bei Herstellungsfehlern oder Fehlern unsererseits nicht rücksendbar.",
        },
        {
          heading: "Was nicht abgedeckt ist",
          body: "Kosmetische Schäden durch Stürze, Kratzer durch unsachgemäße Reinigung oder Veränderungen durch Drittanbieter. Gläser mit individuellen Rezeptanpassungen, die älter als 90 Tage sind.",
        },
      ],
    },
    it: {
      eyebrow: "La nostra garanzia",
      title: "La promessa loollook",
      intro:
        "Ogni montatura loollook è progettata per durare — e noi ci mettiamo la faccia. Ecco esattamente cosa copriamo e per quanto tempo.",
      sections: [
        {
          heading: "Garanzia 365 giorni",
          body: "Se qualcosa cede a causa di come l’abbiamo fatto — una cerniera che si allenta, un trattamento che si scolla, un’asta che si crepa — la ripariamo o sostituiamo gratis, per un anno intero dalla consegna.",
        },
        {
          heading: "Regolazioni gratuite a vita",
          body: "Recati da qualsiasi optometrista partner nel mondo per regolazioni di vestibilità gratuite — in qualsiasi momento, senza scadenza. Oppure richiedi un kit di regolazione gratuito a domicilio e ti guideremo passo passo.",
        },
        {
          heading: "Resi a 30 giorni (senza prescrizione)",
          body: "Resi e cambi gratuiti entro 30 giorni per occhiali senza prescrizione. Gli occhiali con prescrizione sono realizzati su misura e non sono restituibili salvo difetti di fabbricazione o errori nostri.",
        },
        {
          heading: "Cosa non è coperto",
          body: "Danni estetici da cadute, graffi dovuti a pulizia impropria o modifiche fatte da negozi terzi. Lenti con modifiche personalizzate della ricetta più vecchie di 90 giorni.",
        },
      ],
    },
    pt: {
      eyebrow: "Nossa garantia",
      title: "A promessa loollook",
      intro:
        "Cada armação loollook é projetada para durar — e nós colocamos a cara a tapa por isso. Veja exatamente o que cobrimos e por quanto tempo.",
      sections: [
        {
          heading: "Garantia de 365 dias",
          body: "Se algo falhar por causa de como produzimos — uma dobradiça que afrouxa, um tratamento que bolha, uma haste que rompe — reparamos ou substituímos sem custo, por um ano completo a partir da entrega.",
        },
        {
          heading: "Ajustes grátis para sempre",
          body: "Visite qualquer optometrista parceiro no mundo para ajustes de encaixe gratuitos — a qualquer momento, sem prazo. Ou solicite um kit gratuito de ajuste em casa que orientamos você passo a passo.",
        },
        {
          heading: "Devoluções em 30 dias (sem grau)",
          body: "Devoluções e trocas gratuitas em até 30 dias para óculos sem grau. Óculos com grau são feitos sob medida e não são devolvíveis, exceto defeito de fabricação ou erro nosso.",
        },
        {
          heading: "O que não está coberto",
          body: "Danos estéticos por quedas, arranhões por limpeza inadequada ou modificações feitas por lojas de terceiros. Lentes com edições personalizadas de receita feitas há mais de 90 dias.",
        },
      ],
    },
    ja: {
      eyebrow: "保証について",
      title: "loollook の約束",
      intro:
        "すべての loollook フレームは長く使えるように設計されています。そして、私たちはその品質を保証します。具体的な保証範囲と期間をご紹介します。",
      sections: [
        {
          heading: "365 日保証",
          body: "ヒンジの緩み、コーティングの剥がれ、テンプルの破損など、製造上の不具合があれば、お届けから丸 1 年間、無料で修理または交換いたします。",
        },
        {
          heading: "生涯フィッティング無料",
          body: "世界中の提携オプトメトリストで無料のフィッティング調整をいつでも受けられます（有効期限なし）。または、無料のホーム調整キットをご請求いただければ、手順をご案内します。",
        },
        {
          heading: "30 日間返品（度なし）",
          body: "度なしメガネは30日間無料返品・交換可能。度付きメガネは処方とPDに基づきオーダーメイドのため、製造上の欠陥または当社側のミスを除き返品不可です。",
        },
        {
          heading: "対象外の事項",
          body: "落下による外観の損傷、誤った手入れによる傷、第三者ショップによる改造は対象外です。また、カスタム処方変更から 90 日以上経過したレンズも対象外となります。",
        },
      ],
    },
    ko: {
      eyebrow: "보증 안내",
      title: "loollook의 약속",
      intro:
        "모든 loollook 프레임은 오래 사용할 수 있도록 설계되었으며, 저희는 이를 확실히 책임집니다. 보장 범위와 기간을 정확히 알려드립니다.",
      sections: [
        {
          heading: "365일 보증",
          body: "제조상의 결함으로 인해 발생한 모든 문제 — 헐거워진 힌지, 들뜬 코팅, 깨진 템플 — 에 대해 배송일로부터 만 1년간 무상 수리 또는 교체해 드립니다.",
        },
        {
          heading: "평생 무료 조정",
          body: "전 세계 어느 파트너 검안원에서나 무료 피팅 조정을 받으실 수 있습니다 — 언제든, 유효 기간 없이. 또는 무료 가정용 조정 키트를 요청하시면 사용법을 안내해 드립니다.",
        },
        {
          heading: "30일 반품 (도수 없음)",
          body: "도수 없는 안경은 30일 내 무료 반품·교환 가능. 도수 안경은 처방전과 PD에 따라 주문 제작되어 제조 결함 또는 당사 과실을 제외하고는 반품이 불가합니다.",
        },
        {
          heading: "보장되지 않는 항목",
          body: "낙하로 인한 외관 손상, 잘못된 세척으로 생긴 긁힘, 제3자 매장의 개조는 보장되지 않습니다. 발급 후 90일이 지난 맞춤 처방 변경 렌즈도 제외됩니다.",
        },
      ],
    },
    ar: {
      eyebrow: "ضماننا",
      title: "وعد loollook",
      intro:
        "كل إطار من loollook مصمَّم ليدوم — ونحن نقف خلفه. إليك بالضبط ما نغطّيه، ولكم من الوقت.",
      sections: [
        {
          heading: "ضمان 365 يومًا",
          body: "إذا تعطّل أي شيء بسبب طريقة تصنيعنا — مفصل يرتخي، طلاء يتفقّع، ذراع ينكسر — نُصلحه أو نستبدله مجانًا لمدة سنة كاملة من تاريخ التسليم.",
        },
        {
          heading: "تعديلات مجانية مدى الحياة",
          body: "زُر أيّ أخصائي بصريات شريك حول العالم لإجراء تعديلات قياس مجانية — في أي وقت ودون انتهاء صلاحية. أو اطلب طقم تعديل منزلي مجاني وسنرشدك خطوة بخطوة.",
        },
        {
          heading: "إرجاع خلال 30 يومًا (غير طبية)",
          body: "إرجاع واستبدال مجاني خلال 30 يومًا للنظارات غير الطبية. النظارات الطبية تُصنع حسب الطلب ولا يمكن إرجاعها إلا في حالة عيب تصنيع أو خطأ من جانبنا.",
        },
        {
          heading: "ما هو غير مشمول",
          body: "الأضرار التجميلية الناتجة عن السقوط، أو الخدوش الناتجة عن تنظيف غير سليم، أو التعديلات في محلات طرف ثالث. كذلك العدسات ذات التعديلات الطبية المُخصَّصة الأقدم من 90 يومًا.",
        },
      ],
    },
    vi: {
      eyebrow: "Cam kết của chúng tôi",
      title: "Cam kết loollook",
      intro:
        "Mỗi chiếc gọng loollook được chế tạo để bền lâu — và chúng tôi đứng sau điều đó. Đây chính xác là những gì chúng tôi bảo hành, và trong bao lâu.",
      sections: [
        {
          heading: "Bảo hành 365 ngày",
          body: "Nếu có bất kỳ hư hỏng nào do lỗi sản xuất — bản lề lỏng, lớp phủ bong, càng kính nứt — chúng tôi sửa chữa hoặc thay miễn phí, trong một năm kể từ ngày giao.",
        },
        {
          heading: "Điều chỉnh miễn phí trọn đời",
          body: "Ghé bất kỳ bác sĩ đo mắt đối tác nào trên toàn cầu để được điều chỉnh fit miễn phí — bất kỳ lúc nào, không hết hạn. Hoặc yêu cầu bộ điều chỉnh tại nhà miễn phí và chúng tôi sẽ hướng dẫn bạn.",
        },
        {
          heading: "Trả hàng 30 ngày (không toa)",
          body: "Đổi trả miễn phí trong 30 ngày đối với kính không toa. Kính có toa được sản xuất riêng theo toa thuốc và PD, không thể trả lại trừ khi có lỗi sản xuất hoặc lỗi từ phía chúng tôi.",
        },
        {
          heading: "Những gì không được bảo hành",
          body: "Hư hỏng thẩm mỹ do rơi, trầy xước do vệ sinh sai cách, hoặc các sửa đổi từ cửa hàng bên thứ ba. Tròng có chỉnh sửa đơn thuốc tùy chỉnh quá 90 ngày.",
        },
      ],
    },
    th: {
      eyebrow: "การรับประกันของเรา",
      title: "คำมั่นสัญญาของ loollook",
      intro:
        "ทุกกรอบของ loollook ถูกออกแบบให้ใช้งานได้ทนทาน — และเรายืนหยัดอยู่เบื้องหลังมัน นี่คือสิ่งที่เราครอบคลุมและระยะเวลาที่ครอบคลุม",
      sections: [
        {
          heading: "รับประกัน 365 วัน",
          body: "หากมีปัญหาใด ๆ เกิดจากการผลิตของเรา — บานพับหลวม การเคลือบเป็นฟอง ขาแว่นแตก — เราซ่อมหรือเปลี่ยนให้ฟรีตลอดหนึ่งปีเต็มนับจากการจัดส่ง",
        },
        {
          heading: "ปรับฟิตฟรีตลอดชีพ",
          body: "ไปที่ร้านนักทัศนมาตรพันธมิตรใดก็ได้ทั่วโลกเพื่อรับการปรับฟิตฟรี — เมื่อไรก็ได้ ไม่มีวันหมดอายุ หรือขอชุดปรับฟิตที่บ้านฟรี และเราจะแนะนำคุณ",
        },
        {
          heading: "คืนสินค้า 30 วัน (ไร้แว่นสายตา)",
          body: "เปลี่ยนหรือคืนสินค้าได้ฟรีภายใน 30 วันสำหรับแว่นไร้แว่นสายตา แว่นตามใบสั่งแพทย์ผลิตตามสั่งและไม่สามารถคืนได้ เว้นแต่มีความบกพร่องจากการผลิตหรือความผิดพลาดของเรา",
        },
        {
          heading: "สิ่งที่ไม่คุ้มครอง",
          body: "ความเสียหายด้านความสวยงามจากการตก รอยขีดข่วนจากการทำความสะอาดที่ไม่ถูกต้อง หรือการดัดแปลงโดยร้านภายนอก เลนส์ที่มีการแก้ไขเฉพาะตามใบสั่งยาที่เก่ากว่า 90 วัน",
        },
      ],
    },
    id: {
      eyebrow: "Jaminan kami",
      title: "Janji loollook",
      intro:
        "Setiap bingkai loollook dirancang agar tahan lama — dan kami berdiri di belakangnya. Inilah yang tepatnya kami jamin, dan untuk berapa lama.",
      sections: [
        {
          heading: "Garansi 365 hari",
          body: "Jika ada yang gagal karena cara kami membuatnya — engsel yang longgar, lapisan yang menggelembung, tangkai yang retak — kami memperbaiki atau mengganti secara gratis, selama satu tahun penuh sejak pengiriman.",
        },
        {
          heading: "Penyesuaian gratis seumur hidup",
          body: "Kunjungi optometris mitra mana pun di seluruh dunia untuk penyesuaian fit gratis — kapan saja, tanpa kedaluwarsa. Atau minta perangkat penyesuaian gratis di rumah dan kami akan memandu Anda.",
        },
        {
          heading: "Pengembalian 30 hari (non-resep)",
          body: "Pengembalian dan penukaran gratis 30 hari untuk kacamata non-resep. Kacamata resep dibuat sesuai pesanan dan tidak dapat dikembalikan kecuali ada cacat produksi atau kesalahan kami.",
        },
        {
          heading: "Yang tidak tercakup",
          body: "Kerusakan kosmetik karena jatuh, goresan akibat pembersihan yang tidak tepat, atau modifikasi oleh toko pihak ketiga. Lensa dengan modifikasi resep khusus yang lebih dari 90 hari.",
        },
      ],
    },
    ms: {
      eyebrow: "Jaminan kami",
      title: "Janji loollook",
      intro:
        "Setiap bingkai loollook direka untuk tahan lama — dan kami menyokongnya. Inilah dengan tepat apa yang kami lindungi, dan berapa lama.",
      sections: [
        {
          heading: "Jaminan 365 hari",
          body: "Jika ada yang rosak kerana cara kami membuatnya — engsel longgar, salutan bergelembung, tangkai retak — kami membaiki atau menggantinya secara percuma, untuk setahun penuh dari penghantaran.",
        },
        {
          heading: "Pelarasan percuma seumur hidup",
          body: "Lawati mana-mana optometri rakan kongsi di seluruh dunia untuk pelarasan padanan percuma — pada bila-bila masa, tiada tarikh luput. Atau minta kit pelarasan rumah percuma dan kami akan membimbing anda.",
        },
        {
          heading: "Pemulangan 30 hari (tanpa preskripsi)",
          body: "Pemulangan dan pertukaran percuma 30 hari untuk cermin mata tanpa preskripsi. Cermin mata preskripsi dibuat khas dan tidak boleh dipulangkan kecuali kecacatan pembuatan atau kesilapan kami.",
        },
        {
          heading: "Apa yang tidak dilindungi",
          body: "Kerosakan kosmetik akibat jatuh, calar akibat pembersihan yang tidak betul, atau pengubahsuaian oleh kedai pihak ketiga. Kanta dengan suntingan preskripsi tersuai lebih lama daripada 90 hari.",
        },
      ],
    },
  },
  "shipping-returns": {
    en: {
      eyebrow: "Shipping, Returns & Warranty",
      title: "Shipping, Returns & Warranty",
      intro:
        "Free tracked shipping on orders over $69. 365-day quality warranty on every pair. 30-day free returns & exchanges for non-prescription glasses. Prescription glasses are custom-made to your prescription and PD, and cannot be returned or exchanged unless there is a manufacturing defect or prescription error on our part. Policy v1.1, effective 2026-10-08, applies globally.",
      sections: [
        {
          heading: "Free tracked shipping on orders over $69",
          body: "We offer free, tracked worldwide shipping on all orders over $69. Orders under $69 have a flat $9.9 shipping fee. Prescription orders add 3–5 days for lab work.",
        },
        {
          heading: "Tracking",
          body: "You’ll receive an email with a tracking link as soon as your order ships. Track from your account at any time.",
        },
        {
          heading: "Duties & taxes",
          body: "For most destinations, loollook pre-pays import duties and taxes, but some countries may occasionally require a payment. If you receive a customs duty or tax notice, contact us before paying so we can offer the best solution. Duties paid without loollook confirmation are not reimbursable. At checkout, a 5% sales tax is added to the order subtotal (after any discount) and shown as a separate line before you pay.",
        },
        {
          heading: "365-day quality warranty (all products)",
          body: "Within 365 days of delivery, if your pair shows a material or workmanship defect (frame breakage, broken welds, peeling coating, lens delamination, etc.), we remake an identical pair free of charge — you do not need to return the original. How to claim: sign in to your account → find the order → request after-sales support → upload photos of the issue → we review within 24 hours → reshipment arranged. Not covered: accidental drops, crushing, scratches, damage from chemicals/heat/pets, normal fading, loose screws, and similar wear-and-tear.",
        },
        {
          heading: "30-Day Returns",
          body: "30-day free returns & exchanges for non-prescription glasses. Prescription glasses are custom-made to your prescription and PD, and cannot be returned or exchanged unless there is a manufacturing defect or prescription error on our part. All returned items must be unworn and in original packaging. You cover the international return shipping back to China (use a tracked courier). Once we receive the frames we will either exchange (ship a different style) or refund (item value paid; original shipping is non-refundable). Please note the following return instructions: Do not send returned items to the address on the package. That address is incorrect. Please use the return label we provide or the address you received from our customer service team.",
        },
        {
          heading: "Prescription lenses (with a prescription)",
          body: "Prescription glasses are custom-made to your prescription and PD, and cannot be returned or exchanged unless there is a manufacturing defect or prescription error on our part. They are only eligible for warranty or remake when: there is a quality defect (handled under the 365-day warranty above); we made a production error (prescription does not match what you uploaded, wrong frame or wrong lens type — handled under “Our responsibility” below); the package arrived damaged in transit (also handled under “Our responsibility”).",
        },
        {
          heading: "Our responsibility (free reshipment or full refund)",
          body: "In the following cases we reship the correct pair free of charge or issue a full refund (shipping included), with no need to return the item: we shipped the wrong style, color, or lens type; the prescription was produced incorrectly (does not match the Rx you uploaded); the package arrived damaged in transit (please share unboxing photos); a clear production defect.",
        },
        {
          heading: "Other terms",
          body: "Bulk orders: on single orders of more than 5 plano pairs, personal-reason returns are handled normally for the first 2 pairs; the remainder is refunded at 10%. Color and size tolerances: minor color variation and ±1mm dimensional tolerance are not considered quality issues. Prescription validity: we only accept prescriptions issued within the last 12 months.",
        },
        {
          heading: "Contact us",
          body: "Live chat: bottom-right of the site, 24/7. Email: support@loollook.com. This policy is designed to be fair and transparent. For special cases, our support team will work with you on a tailored solution.",
        },
      ],
    },
    zh: {
      eyebrow: "配送、退换货与保修",
      title: "配送、退换货与保修政策",
      intro:
        "满 $69 全球免运费并附实时追踪；所有产品享 365 天质量保修；非处方眼镜（平光镜）30 天内免费退换。处方眼镜按您的处方与瞳距（PD）定制，除非存在制造缺陷或我方配镜错误，否则不接受退换。政策版本 1.1，2026 年 10 月 8 日起生效，适用全球。",
      sections: [
        {
          heading: "满 $69 全球免运费（可追踪）",
          body: "订单满 $69 可享全球免运费并附实时追踪；订单低于 $69 收取 $9.9 固定运费。",
        },
        {
          heading: "物流追踪",
          body: "订单一发货你将收到包含追踪链接的邮件，也可随时在账户中查看。",
        },
        {
          heading: "关税与税金",
          body: "对大多数目的地，loollook 会预付进口关税与税金；但少数国家偶尔可能要求缴纳关税或税费。收到缴税通知后，请先联系我们，以便我们为您提供更合适的解决方案。未经 loollook 确认而自行支付的关税，我们将不予报销。 结账时会按订单商品小计（扣除折扣后）加收 5% 销售税，并在付款前单独列出。",
        },
        {
          heading: "365 天质量保修（所有产品）",
          body: "自签收之日起 365 天内，出现材料或工艺缺陷（镜框自然断裂、脱焊、镀层脱落、镜片脱膜等），免费重做一副相同的眼镜，您无需寄回原眼镜。申请方式：登录账户 → 找到订单 → 申请售后 → 上传问题照片 → 24 小时内审核 → 安排重发。不保修情形：人为摔坏、挤压、划伤、化学品 / 高温 / 宠物损坏、正常掉色、螺丝松动等。",
        },
        {
          heading: "30 天退换货",
          body: "非处方眼镜（平光镜）30 天内免费退换。处方眼镜按您的处方与瞳距（PD）定制，除非存在制造缺陷或我方配镜错误，否则不接受退换。退回商品须未经佩戴并保持原包装。",
        },
        {
          heading: "定制镜片（有度数）",
          body: "处方眼镜按您的处方与瞳距（PD）定制，除非存在制造缺陷或我方配镜错误，否则不接受退换。",
        },
        {
          heading: "我方责任（免费重发或全额退款）",
          body: "以下情况我们免费重发正确眼镜或全额退款（含运费），您无需寄回：发错款式 / 颜色 / 镜片类型；处方制作错误（与您上传的不符）；运输途中损坏（请提供开箱照片）；明显生产缺陷。",
        },
        {
          heading: "其他条款",
          body: "批量订单：单笔平光镜超过 5 副，个人原因退换仅前 2 副按标准处理，其余按 10% 退款。色差 / 尺寸公差：轻微色差、±1mm 公差不属于质量问题。处方有效期：仅接受 1 年内开具的处方。",
        },
        {
          heading: "联系我们",
          body: "在线聊天：官网右下角，24/7 在线。邮箱：support@loollook.com。本政策公平透明。如有特殊个案，客服将根据实际情况与您沟通解决。",
        },
      ],
    },
    es: {
      eyebrow: "Envíos, devoluciones y garantía",
      title: "Envíos, devoluciones y garantía",
      intro:
        "Envío gratuito y con seguimiento en pedidos superiores a $69. Garantía de calidad de 365 días en cada par. Devoluciones y cambios gratuitos a 30 días para gafas sin graduación. Las gafas graduadas se fabrican a medida según su prescripción y DP, y no pueden devolverse ni cambiarse salvo defecto de fabricación o error nuestro. Política v1.1, en vigor desde el 8 de octubre de 2026, válida globalmente.",
      sections: [
        {
          heading:
            "Envío gratuito y con seguimiento en pedidos superiores a $69",
          body: "Ofrecemos envío gratuito y con seguimiento a todo el mundo en todos los pedidos superiores a $69. Los pedidos inferiores a $69 tienen una tarifa plana de envío de $9.9. Los pedidos con receta suman 3–5 días por el trabajo de laboratorio.",
        },
        {
          heading: "Seguimiento",
          body: "Recibirás un correo con el enlace de seguimiento en cuanto se envíe tu pedido. Consulta el estado desde tu cuenta cuando quieras.",
        },
        {
          heading: "Aranceles e impuestos",
          body: "Para la mayoría de los destinos, loollook prepaga los aranceles e impuestos de importación, pero algunos países pueden pedir un pago ocasionalmente. Si recibes un aviso de aduana o impuestos, contáctanos antes de pagar para que podamos ofrecerte la mejor solución. Los pagos realizados sin confirmación de loollook no son reembolsables. Al pagar, se añade un impuesto sobre las ventas del 5 % al subtotal del pedido (tras descuentos), que se muestra en una línea aparte antes de pagar.",
        },
        {
          heading: "Garantía de calidad de 365 días (todos los productos)",
          body: "Dentro de los 365 días posteriores a la entrega, si tu par presenta un defecto de material o de fabricación (rotura de la montura, soldadura suelta, recubrimiento descascarillado, deslaminación de la lente, etc.), rehacemos un par idéntico sin coste — no necesitas devolver el original. Cómo reclamar: inicia sesión en tu cuenta → encuentra el pedido → solicita servicio posventa → sube fotos del problema → revisamos en 24 horas → organizamos el reenvío. No cubierto: caídas, aplastamientos, arañazos, daños por productos químicos / calor / mascotas, decoloración normal y tornillos sueltos.",
        },
        {
          heading: "Devoluciones a 30 días",
          body: "Devoluciones y cambios gratuitos a 30 días para gafas sin graduación. Las gafas graduadas se fabrican a medida según su prescripción y DP, y no pueden devolverse ni cambiarse salvo defecto de fabricación o error nuestro. Todos los artículos devueltos deben estar sin estrenar y en su embalaje original. Tú asumes el coste del envío internacional de devolución a China (usa un mensajero con seguimiento). Cuando recibamos las gafas, ofrecemos un cambio (enviamos otro modelo) o un reembolso (importe del producto pagado; el envío original no se reembolsa). Ten en cuenta estas instrucciones de devolución: no envíes los artículos devueltos a la dirección del paquete. Esa dirección es incorrecta. Usa la etiqueta de devolución que proporcionamos o la dirección que recibiste de nuestro equipo de atención al cliente.",
        },
        {
          heading: "Lentes graduadas (con receta)",
          body: "Las gafas graduadas se fabrican a medida según su prescripción y DP, y no pueden devolverse ni cambiarse salvo defecto de fabricación o error nuestro. Solo son elegibles para garantía o reposición en estos casos: defecto de calidad (gestionado bajo la garantía de 365 días); error de producción nuestro (la receta no coincide con la que subiste, montura o tipo de lente equivocados — gestionado bajo “Nuestra responsabilidad”); el paquete llegó dañado en tránsito (también bajo “Nuestra responsabilidad”).",
        },
        {
          heading:
            "Nuestra responsabilidad (reenvío gratuito o reembolso completo)",
          body: "En los siguientes casos reenviamos el par correcto sin coste o emitimos un reembolso completo (envío incluido), sin necesidad de devolver el artículo: enviamos un estilo, color o tipo de lente equivocados; la receta se produjo de forma incorrecta (no coincide con la que subiste); el paquete llegó dañado en tránsito (por favor envía fotos del unboxing); defecto de producción evidente.",
        },
        {
          heading: "Otros términos",
          body: "Pedidos al por mayor: en pedidos únicos de más de 5 monturas planas, las devoluciones por motivos personales se gestionan de forma estándar para las 2 primeras; el resto se reembolsa al 10%. Tolerancias de color y tamaño: la variación leve de color y la tolerancia dimensional de ±1 mm no se consideran defectos de calidad. Validez de la receta: solo aceptamos recetas emitidas en los últimos 12 meses.",
        },
        {
          heading: "Contacto",
          body: "Chat en vivo: parte inferior derecha del sitio, 24/7. Correo: support@loollook.com. Esta política está pensada para ser justa y transparente. En casos especiales, nuestro equipo de soporte trabajará contigo en una solución a medida.",
        },
      ],
    },
    fr: {
      eyebrow: "Livraison, retours & garantie",
      title: "Livraison, retours & garantie",
      intro:
        "Livraison gratuite et suivie pour les commandes de plus de $69. Garantie qualité de 365 jours sur chaque paire. Retours et échanges gratuits à 30 jours pour les lunettes sans prescription. Les lunettes à prescription sont fabriquées sur mesure selon votre ordonnance et votre DP, et ne peuvent être retournées ni échangées sauf en cas de défaut de fabrication ou d'erreur de notre part. Politique v1.1, en vigueur à compter du 8 octobre 2026, applicable dans le monde entier.",
      sections: [
        {
          heading: "Livraison gratuite et suivie dès $69",
          body: "Nous offrons une livraison mondiale gratuite et suivie pour toutes les commandes de plus de $69. Les commandes de moins de $69 comportent des frais de port fixes de 9,9 $. Les commandes correctrices ajoutent 3 à 5 jours pour le travail en laboratoire.",
        },
        {
          heading: "Suivi",
          body: "Vous recevrez un e-mail avec un lien de suivi dès l’expédition de votre commande. Suivi accessible à tout moment depuis votre compte.",
        },
        {
          heading: "Droits & taxes",
          body: "Pour la plupart des destinations, loollook prépaye les droits d’importation et les taxes, mais certains pays peuvent parfois demander un paiement. Si vous recevez un avis de droits ou taxes, contactez-nous avant de payer afin que nous puissions proposer la meilleure solution. Les droits payés sans confirmation de loollook ne sont pas remboursables. Lors du paiement, une taxe de vente de 5 % est ajoutée au sous-total de la commande (après remise) et affichée sur une ligne distincte avant le règlement.",
        },
        {
          heading: "Garantie qualité 365 jours (tous les produits)",
          body: "Dans les 365 jours suivant la livraison, si votre paire présente un défaut de matériau ou de fabrication (rupture de monture, soudure cassée, revêtement qui s’écaille, délaminage des verres, etc.), nous refabriquons une paire identique gratuitement — sans que vous ayez à renvoyer la paire d’origine. Procédure : connectez-vous à votre compte → trouvez la commande → demandez un service après-vente → téléversez des photos du problème → examen sous 24 heures → réexpédition organisée. Non couvert : chutes accidentelles, écrasements, rayures, dommages dus aux produits chimiques / à la chaleur / aux animaux, décoloration normale, vis desserrées et autres signes d’usure.",
        },
        {
          heading: "Retours à 30 jours",
          body: "Retours et échanges gratuits à 30 jours pour les lunettes sans prescription. Les lunettes à prescription sont fabriquées sur mesure selon votre ordonnance et votre DP, et ne peuvent être retournées ni échangées sauf en cas de défaut de fabrication ou d'erreur de notre part. Tous les articles retournés doivent être non portés et dans leur emballage d'origine. Vous prenez en charge les frais de retour international vers la Chine (utilisez un transporteur avec suivi). À réception, nous proposons soit un échange (envoi d’un autre modèle), soit un remboursement (montant du produit ; les frais de livraison initiaux ne sont pas remboursés). Veuillez noter les consignes de retour suivantes : n’envoyez pas les articles retournés à l’adresse figurant sur le colis. Cette adresse est incorrecte. Utilisez l’étiquette de retour que nous fournissons ou l’adresse reçue de notre service client.",
        },
        {
          heading: "Verres correcteurs (avec ordonnance)",
          body: "Les lunettes à prescription sont fabriquées sur mesure selon votre ordonnance et votre DP, et ne peuvent être retournées ni échangées sauf en cas de défaut de fabrication ou d'erreur de notre part. Ils ne sont donc pas éligibles à un retour pour préférence personnelle ou problème de confort. Ils restent éligibles à la garantie ou à une refabrication uniquement dans les cas suivants : défaut de qualité (pris en charge au titre de la garantie 365 jours) ; erreur de fabrication de notre côté (ordonnance non conforme à celle que vous avez téléversée, monture ou type de verres incorrect — pris en charge au titre de « Notre responsabilité ») ; colis endommagé pendant le transport (également au titre de « Notre responsabilité »).",
        },
        {
          heading:
            "Notre responsabilité (réexpédition gratuite ou remboursement intégral)",
          body: "Dans les cas suivants, nous réexpédions la paire correcte gratuitement ou émettons un remboursement intégral (livraison comprise), sans que vous ayez à retourner l’article : nous avons expédié le mauvais style, la mauvaise couleur ou le mauvais type de verres ; l’ordonnance a été mal exécutée (ne correspond pas à celle que vous avez téléversée) ; le colis est arrivé endommagé pendant le transport (merci de partager des photos du déballage) ; défaut de fabrication évident.",
        },
        {
          heading: "Autres conditions",
          body: "Commandes en gros : pour une commande unique de plus de 5 paires plates, les retours pour motif personnel sont traités normalement pour les 2 premières paires ; le reste est remboursé à 10 %. Tolérances de couleur et de taille : les variations légères de couleur et la tolérance dimensionnelle de ±1 mm ne sont pas considérées comme un défaut de qualité. Validité de l’ordonnance : nous n’acceptons que les ordonnances émises depuis moins de 12 mois.",
        },
        {
          heading: "Nous contacter",
          body: "Chat en direct : en bas à droite du site, 24/7. E-mail : support@loollook.com. Cette politique se veut juste et transparente. Pour les cas particuliers, notre équipe support trouvera avec vous une solution adaptée.",
        },
      ],
    },
    de: {
      eyebrow: "Versand, Rückgabe & Garantie",
      title: "Versand, Rückgabe & Garantie",
      intro:
        "Kostenloser, nachverfolgbarer Versand bei Bestellungen über $69. 365-tägige Qualitätsgarantie auf jede Brille. 30-tägige kostenlose Rücksendungen und Umtausch für Brillen ohne Sehstärke. Brillen mit Sehstärke werden individuell nach Ihrer Verordnung und Ihrem PD-Wert gefertigt und können nur bei Herstellungsfehlern oder Fehlern unsererseits zurückgegeben oder umgetauscht werden. Richtlinie v1.1, gültig ab 8. Oktober 2026, weltweit anwendbar.",
      sections: [
        {
          heading: "Kostenloser, nachverfolgbarer Versand ab $69",
          body: "Wir bieten kostenlosen, nachverfolgbaren weltweiten Versand für alle Bestellungen über $69. Bestellungen unter $69 unterliegen einer Pauschalversandgebühr von 9,9 $. Rezeptbestellungen brauchen 3–5 Tage zusätzlich für die Laborarbeit.",
        },
        {
          heading: "Sendungsverfolgung",
          body: "Du erhältst eine E-Mail mit einem Tracking-Link, sobald deine Bestellung versandt wird. Du kannst jederzeit über dein Konto verfolgen.",
        },
        {
          heading: "Zoll & Steuern",
          body: "Für die meisten Zielländer zahlt loollook Einfuhrzölle und Steuern im Voraus, doch einzelne Länder können gelegentlich eine Zahlung verlangen. Wenn du eine Zoll- oder Steuerbenachrichtigung erhältst, kontaktiere uns bitte vor der Zahlung, damit wir die beste Lösung anbieten können. Ohne Bestätigung von loollook gezahlte Abgaben können nicht erstattet werden. Beim Checkout wird auf die Zwischensumme (nach Rabatten) eine Umsatzsteuer von 5 % aufgeschlagen und vor der Zahlung als eigene Zeile angezeigt.",
        },
        {
          heading: "365 Tage Qualitätsgarantie (alle Produkte)",
          body: "Innerhalb von 365 Tagen ab Lieferung fertigen wir bei Material- oder Verarbeitungsfehlern (Bruch der Fassung, gelöste Schweißnähte, abplatzende Beschichtung, Glasdelamination usw.) eine identische Brille kostenlos neu — die Originalbrille musst du nicht zurücksenden. So beantragst du es: in dein Konto einloggen → Bestellung suchen → After-Sales anfragen → Fotos des Problems hochladen → Prüfung innerhalb von 24 Stunden → Neuversand wird arrangiert. Nicht abgedeckt: Stürze, Quetschungen, Kratzer, Schäden durch Chemikalien / Hitze / Haustiere, normales Ausbleichen, lose Schrauben und ähnlicher Verschleiß.",
        },
        {
          heading: "30-Tage-Rückgabe",
          body: "30-tägige kostenlose Rücksendungen und Umtausch für Brillen ohne Sehstärke. Brillen mit Sehstärke werden individuell nach Ihrer Verordnung und Ihrem PD-Wert gefertigt und können nur bei Herstellungsfehlern oder Fehlern unsererseits zurückgegeben oder umgetauscht werden. Alle zurückgesandten Artikel müssen ungetragen und in der Originalverpackung sein. Du trägst die internationalen Rücksendekosten nach China (bitte verfolgten Versand nutzen). Nach Erhalt bieten wir Umtausch (anderes Modell) oder Rückerstattung (gezahlter Artikelpreis; die ursprünglichen Versandkosten werden nicht erstattet). Bitte beachte die folgenden Rücksendehinweise: Sende zurückgegebene Artikel nicht an die Adresse auf dem Paket. Diese Adresse ist falsch. Verwende bitte das von uns bereitgestellte Rücksendeetikett oder die Adresse, die du von unserem Kundenservice erhalten hast.",
        },
        {
          heading: "Korrektionsgläser (mit Sehstärke)",
          body: "Brillen mit Sehstärke werden individuell nach Ihrer Verordnung und Ihrem PD-Wert gefertigt und können nur bei Herstellungsfehlern oder Fehlern unsererseits zurückgegeben oder umgetauscht werden. Daher sind sie nicht aus persönlichen Gründen oder wegen Trageempfinden rückgabefähig. Sie sind nur in folgenden Fällen garantie- oder ersatzberechtigt: Qualitätsmangel (über die 365-Tage-Garantie geregelt); Produktionsfehler unsererseits (Rezept stimmt nicht mit dem hochgeladenen überein, falsche Fassung oder falscher Glas-Typ — geregelt unter „Unsere Verantwortung“); Transportschaden (ebenfalls unter „Unsere Verantwortung“).",
        },
        {
          heading:
            "Unsere Verantwortung (kostenloser Neuversand oder volle Rückerstattung)",
          body: "In folgenden Fällen versenden wir die korrekte Brille kostenlos neu oder erstatten den vollen Betrag (Versand inklusive), ohne dass du den Artikel zurücksenden musst: wir haben den falschen Stil, die falsche Farbe oder den falschen Glas-Typ verschickt; das Rezept wurde fehlerhaft produziert (stimmt nicht mit dem überein, was du hochgeladen hast); das Paket kam beschädigt an (bitte Unboxing-Fotos schicken); klarer Produktionsfehler.",
        },
        {
          heading: "Weitere Bedingungen",
          body: "Großbestellungen: Bei einer Einzelbestellung von mehr als 5 Plano-Brillen werden Rückgaben aus persönlichen Gründen für die ersten 2 Paare regulär bearbeitet; der Rest wird mit 10 % erstattet. Farb- und Maßtoleranzen: leichte Farbabweichungen und ±1 mm Maßtoleranz gelten nicht als Qualitätsmangel. Rezeptgültigkeit: wir akzeptieren ausschließlich Rezepte, die innerhalb der letzten 12 Monate ausgestellt wurden.",
        },
        {
          heading: "Kontakt",
          body: "Live-Chat: rechts unten auf der Website, rund um die Uhr. E-Mail: support@loollook.com. Diese Richtlinie ist auf Fairness und Transparenz ausgelegt. Für Einzelfälle findet unser Support gemeinsam mit dir eine individuelle Lösung.",
        },
      ],
    },
    it: {
      eyebrow: "Spedizione, resi e garanzia",
      title: "Spedizione, resi e garanzia",
      intro:
        "Spedizione gratuita e tracciabile per ordini superiori a $69. Garanzia di qualità di 365 giorni su ogni paio. Resi e cambi gratuiti entro 30 giorni per occhiali senza prescrizione. Gli occhiali con prescrizione sono realizzati su misura in base alla tua ricetta e al tuo PD e non possono essere restituiti o cambiati salvo difetti di fabbricazione o errori nostri. Politica v1.1, in vigore dall'8 ottobre 2026, valida in tutto il mondo.",
      sections: [
        {
          heading: "Spedizione gratuita e tracciabile sopra i $69",
          body: "Offriamo spedizione gratuita e tracciabile in tutto il mondo per tutti gli ordini superiori a $69. Gli ordini inferiori a $69 prevedono una tariffa fissa di spedizione di 9,9 $. Per gli ordini con lenti graduate aggiungi 3–5 giorni di lavorazione in laboratorio.",
        },
        {
          heading: "Tracciamento",
          body: "Riceverai un’email con il link di tracciamento non appena il tuo ordine viene spedito. Puoi seguirlo in qualsiasi momento dal tuo account.",
        },
        {
          heading: "Dazi e tasse",
          body: "Per la maggior parte delle destinazioni, loollook pre-paga dazi e tasse d’importazione, ma alcuni Paesi possono occasionalmente richiedere un pagamento. Se ricevi un avviso di dazi o tasse, contattaci prima di pagare così possiamo offrirti la soluzione migliore. I dazi pagati senza conferma di loollook non sono rimborsabili. Al checkout viene aggiunta un'imposta sulle vendite del 5% al subtotale dell'ordine (dopo gli sconti), mostrata in una riga separata prima del pagamento.",
        },
        {
          heading: "Garanzia qualità 365 giorni (tutti i prodotti)",
          body: "Entro 365 giorni dalla consegna, in caso di difetti di materiale o di fabbricazione (rottura della montatura, saldature rotte, rivestimento che si stacca, delaminazione delle lenti, ecc.) realizziamo nuovamente un paio identico gratuitamente — non è necessario rispedire l’originale. Come fare richiesta: accedi al tuo account → trova l’ordine → richiedi assistenza post-vendita → carica le foto del problema → revisione entro 24 ore → riconsegna organizzata. Non coperti: cadute accidentali, schiacciamenti, graffi, danni da prodotti chimici / calore / animali domestici, normale scoloritura, viti allentate e simile usura.",
        },
        {
          heading: "Resi entro 30 giorni",
          body: "Resi e cambi gratuiti entro 30 giorni per occhiali senza prescrizione. Gli occhiali con prescrizione sono realizzati su misura in base alla tua ricetta e al tuo PD e non possono essere restituiti o cambiati salvo difetti di fabbricazione o errori nostri. Tutti gli articoli restituiti devono essere non indossati e nella confezione originale. Le spese di spedizione internazionale per il rientro in Cina sono a tuo carico (usa un corriere tracciato). Una volta ricevuta la montatura, ti offriamo cambio (spediamo un altro modello) o rimborso (importo dell’articolo; le spese di spedizione originali non sono rimborsabili). Nota le seguenti istruzioni per il reso: non spedire gli articoli restituiti all’indirizzo indicato sul pacco. Quell’indirizzo non è corretto. Usa l’etichetta di reso che forniamo o l’indirizzo ricevuto dal nostro team di assistenza clienti.",
        },
        {
          heading: "Lenti graduate (con prescrizione)",
          body: "Gli occhiali con prescrizione sono realizzati su misura in base alla tua ricetta e al tuo PD e non possono essere restituiti o cambiati salvo difetti di fabbricazione o errori nostri. Sono idonee a garanzia o rifacimento solo nei seguenti casi: difetto di qualità (gestito tramite la garanzia 365 giorni); errore di produzione da parte nostra (prescrizione non corrispondente a quella caricata, montatura o tipo di lente sbagliati — gestito sotto “Nostra responsabilità”); pacco arrivato danneggiato durante il trasporto (anch’esso sotto “Nostra responsabilità”).",
        },
        {
          heading:
            "Nostra responsabilità (rispedizione gratuita o rimborso totale)",
          body: "Nei seguenti casi rispediamo il paio corretto senza costi o emettiamo un rimborso totale (spedizione inclusa), senza che tu debba restituire l’articolo: abbiamo spedito stile, colore o tipo di lente sbagliati; la prescrizione è stata realizzata in modo errato (non corrisponde a quella caricata); il pacco è arrivato danneggiato durante il trasporto (condividi foto dell’unboxing); difetto di produzione evidente.",
        },
        {
          heading: "Altri termini",
          body: "Ordini in volume: per ordini singoli di oltre 5 montature plano, i resi per motivi personali sono gestiti normalmente per i primi 2 paia; il resto è rimborsato al 10%. Tolleranze di colore e taglia: leggere variazioni cromatiche e ±1 mm di tolleranza dimensionale non sono considerate difetti di qualità. Validità della prescrizione: accettiamo solo prescrizioni rilasciate negli ultimi 12 mesi.",
        },
        {
          heading: "Contatti",
          body: "Chat live: in basso a destra sul sito, 24/7. Email: support@loollook.com. Questa politica è pensata per essere equa e trasparente. Per casi particolari, il nostro team di assistenza lavorerà con te a una soluzione su misura.",
        },
      ],
    },
    pt: {
      eyebrow: "Envios, devoluções e garantia",
      title: "Envios, devoluções e garantia",
      intro:
        "Frete gratuito e rastreável em pedidos acima de $69. Garantia de qualidade de 365 dias em todos os pares. Devoluções e trocas gratuitas em até 30 dias para óculos sem grau. Óculos com grau são feitos sob medida de acordo com sua receita e DP, e não podem ser devolvidos ou trocados, exceto em caso de defeito de fabricação ou erro nosso. Política v1.1, em vigor a partir de 8 de outubro de 2026, válida globalmente.",
      sections: [
        {
          heading: "Frete gratuito e rastreável em pedidos acima de $69",
          body: "Oferecemos frete gratuito e rastreável para todo o mundo em todos os pedidos acima de $69. Pedidos abaixo de $69 têm uma taxa fixa de frete de $9,9. Pedidos com receita levam de 3 a 5 dias adicionais para o trabalho de laboratório.",
        },
        {
          heading: "Rastreamento",
          body: "Você recebe um e-mail com o link de rastreio assim que seu pedido é despachado. Acompanhe pela sua conta a qualquer momento.",
        },
        {
          heading: "Impostos e taxas",
          body: "Para a maioria dos destinos, a loollook pré-paga os impostos e taxas de importação, mas alguns países podem ocasionalmente exigir pagamento. Se você receber um aviso de imposto ou taxa alfandegária, fale conosco antes de pagar para que possamos oferecer a melhor solução. Valores pagos sem confirmação da loollook não são reembolsáveis. No checkout, é acrescentado um imposto sobre vendas de 5% ao subtotal do pedido (após descontos), exibido em linha separada antes do pagamento.",
        },
        {
          heading: "Garantia de qualidade de 365 dias (todos os produtos)",
          body: "Dentro de 365 dias após a entrega, se o seu par apresentar defeito de material ou fabricação (quebra da armação, solda solta, descascamento do revestimento, descolamento da lente, etc.), refazemos um par idêntico gratuitamente — você não precisa devolver o original. Como solicitar: faça login na sua conta → encontre o pedido → solicite atendimento pós-venda → envie fotos do problema → análise em até 24 horas → reenvio organizado. Não coberto: quedas acidentais, esmagamento, arranhões, danos por produtos químicos / calor / animais, desbotamento normal, parafusos soltos e desgaste similar.",
        },
        {
          heading: "Devoluções em 30 dias",
          body: "Devoluções e trocas gratuitas em até 30 dias para óculos sem grau. Óculos com grau são feitos sob medida de acordo com sua receita e DP, e não podem ser devolvidos ou trocados, exceto em caso de defeito de fabricação ou erro nosso. Todos os itens devolvidos devem estar sem uso e na embalagem original. Você arca com o frete internacional de retorno para a China (use uma transportadora rastreável). Após o recebimento, oferecemos troca (enviamos outro modelo) ou reembolso (valor do produto pago; o frete original não é reembolsado). Observe as seguintes instruções de devolução: não envie os itens devolvidos para o endereço no pacote. Esse endereço está incorreto. Use a etiqueta de devolução que fornecemos ou o endereço recebido da nossa equipe de atendimento ao cliente.",
        },
        {
          heading: "Lentes de grau (com receita)",
          body: "Óculos com grau são feitos sob medida de acordo com sua receita e DP, e não podem ser devolvidos ou trocados, exceto em caso de defeito de fabricação ou erro nosso. Por isso, não são elegíveis para devolução por preferência pessoal ou desconforto. Só são elegíveis para garantia ou refazimento nos seguintes casos: defeito de qualidade (tratado pela garantia de 365 dias); erro de produção do nosso lado (receita não corresponde à enviada, armação ou tipo de lente errado — tratado em “Nossa responsabilidade”); pacote chegou danificado em trânsito (também em “Nossa responsabilidade”).",
        },
        {
          heading:
            "Nossa responsabilidade (reenvio gratuito ou reembolso total)",
          body: "Nos seguintes casos, reenviamos o par correto gratuitamente ou emitimos reembolso total (incluindo frete), sem necessidade de devolver o item: enviamos o estilo, cor ou tipo de lente errado; a receita foi produzida incorretamente (não corresponde à que você enviou); o pacote chegou danificado em trânsito (envie fotos do unboxing); defeito claro de produção.",
        },
        {
          heading: "Outros termos",
          body: "Pedidos em volume: em pedidos únicos com mais de 5 armações plano, devoluções por motivo pessoal são processadas normalmente para os 2 primeiros pares; o restante é reembolsado a 10%. Tolerâncias de cor e tamanho: pequenas variações de cor e tolerância dimensional de ±1mm não são consideradas defeito de qualidade. Validade da receita: aceitamos apenas receitas emitidas nos últimos 12 meses.",
        },
        {
          heading: "Fale com a gente",
          body: "Chat ao vivo: canto inferior direito do site, 24/7. E-mail: support@loollook.com. Esta política foi pensada para ser justa e transparente. Para casos especiais, nosso time de suporte trabalhará com você em uma solução personalizada.",
        },
      ],
    },
    ja: {
      eyebrow: "配送・返品・保証",
      title: "配送・返品・保証ポリシー",
      intro:
        "69ドル以上のご注文で送料無料（追跡付き）。すべての商品に365日品質保証。度なしメガネは30日間無料返品・交換可能。度付きメガネは処方とPDに基づきオーダーメイドで製造されるため、製造上の欠陥または当社側のミスを除き、返品・交換はできません。ポリシーv1.1（2026年10月8日施行）は全世界に適用されます。",
      sections: [
        {
          heading: "69ドル以上で送料無料（追跡付き）",
          body: "69ドル以上のすべてのご注文で、世界どこでも送料無料・追跡付きでお届けします。69ドル未満のご注文は送料一律9.9ドルです。",
        },
        {
          heading: "追跡",
          body: "ご注文が発送されると、追跡リンク付きのメールをお送りします。アカウントからいつでも追跡可能です。",
        },
        {
          heading: "関税・税金",
          body: "ほとんどの配送先では loollook が輸入関税と税金を事前に支払いますが、一部の国ではまれにお支払いを求められる場合があります。関税または税金の通知を受け取った場合は、お支払い前に必ず当社へご連絡ください。loollook の確認なしにお支払いされた関税は返金対象外です。 ご注文時には、商品小計（割引適用後）に 5% の販売税が加算され、お支払い前に別行で表示されます。",
        },
        {
          heading: "365 日間品質保証（全商品対象）",
          body: "お受け取りから 365 日以内に、材料・製造上の不具合（フレームの自然破損、溶接外れ、メッキ剥がれ、レンズコーティング剥離など）が見られる場合、同じ仕様で無償で作り直してお届けします。元のメガネをご返送いただく必要はありません。お申し込み方法：アカウントにログイン → 該当注文を選択 → アフターサービスを申請 → 問題箇所の写真をアップロード → 24 時間以内に確認 → 再発送を手配。対象外：落下・圧迫・引っかき傷、化学薬品 / 高温 / ペットによる損傷、通常の褪色、ねじの緩みなどの経年劣化。",
        },
        {
          heading: "30日間返品",
          body: "度なしメガネは30日間無料返品・交換が可能です。度付きメガネは処方とPDに基づきオーダーメイドで製造されるため、製造上の欠陥または当社側のミスを除き、返品・交換はできません。返品商品は未使用で元のパッケージのままご返送ください。",
        },
        {
          heading: "度付きレンズ（処方付き）",
          body: "度付きメガネは処方とPDに基づきオーダーメイドで製造されるため、製造上の欠陥または当社側のミスを除き、返品・交換はできません。",
        },
        {
          heading: "当社の責任（無償再送または全額返金）",
          body: "以下の場合は、無償で正しい商品を再送するか、全額（送料込み）を返金いたします。商品のご返送は不要です：誤ったデザイン／カラー／レンズタイプの発送；処方の製造ミス（アップロードいただいたものと一致しない）；輸送中の破損（開封時の写真をご提供ください）；明らかな製造上の欠陥。",
        },
        {
          heading: "その他の条件",
          body: "まとめ買い：1 件のご注文でプラノが 5 本を超える場合、お客様都合での返品は最初の 2 本のみ通常対応とし、残りは 10% 返金となります。色差・サイズ公差：わずかな色の違いおよび ±1mm の公差は品質不良には該当しません。処方の有効期間：発行から 1 年以内の処方のみ受け付けます。",
        },
        {
          heading: "お問い合わせ",
          body: "ライブチャット：サイト右下、24 時間対応。メール：support@loollook.com。本ポリシーは公平かつ透明性を重視して設計されています。個別ケースについては、カスタマーサポートが状況に応じた解決策をご案内いたします。",
        },
      ],
    },
    ko: {
      eyebrow: "배송·반품·보증",
      title: "배송·반품·보증 정책",
      intro:
        "69달러 이상 주문 시 무료 추적 배송. 모든 안경에 365일 품질 보증. 도수 없는 안경은 30일 내 무료 반품 및 교환 가능. 도수 안경은 처방전과 PD에 따라 주문 제작되며, 제조 결함 또는 당사 과실이 아닌 경우 반품·교환이 불가합니다. 정책 v1.1(2026년 10월 8일 시행)은 전 세계에 적용됩니다.",
      sections: [
        {
          heading: "69달러 이상 무료 추적 배송",
          body: "69달러 이상의 모든 주문에 대해 전 세계 무료 추적 배송을 제공합니다. 69달러 미만 주문은 9.9달러 고정 배송비가 적용됩니다. 처방 주문은 렌즈 가공을 위해 3–5일이 추가됩니다.",
        },
        {
          heading: "배송 추적",
          body: "주문이 발송되는 즉시 추적 링크가 포함된 이메일이 전송됩니다. 계정에서도 언제든 추적할 수 있습니다.",
        },
        {
          heading: "관세 및 세금",
          body: "대부분의 배송 지역에서는 loollook이 수입 관세와 세금을 사전에 부담하지만, 일부 국가에서는 간혹 납부를 요구할 수 있습니다. 관세 또는 세금 납부 통지를 받으면 결제 전에 먼저 저희에게 연락해 주세요. loollook의 확인 없이 결제한 관세는 환불되지 않습니다. 결제 시 주문 상품 소계(할인 적용 후)에 5% 판매세가 추가되며, 결제 전에 별도 항목으로 표시됩니다.",
        },
        {
          heading: "365일 품질 보증(전 제품)",
          body: "수령일로부터 365일 이내에 소재 또는 제조상의 결함(프레임 자연 파손, 용접부 분리, 도금 박리, 렌즈 코팅 박리 등)이 발생하면 동일 사양으로 무상 재제작하여 발송해 드립니다. 원 안경을 반송하실 필요는 없습니다. 신청 방법: 계정 로그인 → 해당 주문 선택 → 사후 서비스 신청 → 문제 사진 업로드 → 24시간 내 검토 → 재발송 안내. 보증 제외 사항: 낙하·압착·긁힘, 화학약품/고온/반려동물에 의한 손상, 자연 변색, 나사 풀림 등 일반 마모.",
        },
        {
          heading: "30일 반품",
          body: "도수 없는 안경은 30일 내 무료 반품 및 교환이 가능합니다. 도수 안경은 처방전과 PD에 따라 주문 제작되며, 제조 결함 또는 당사 과실이 아닌 경우 반품·교환이 불가합니다. 반품된 모든 제품은 미착용 상태로 원래 포장 그대로여야 합니다. 중국까지의 국제 반송 비용은 고객님께서 부담하셔야 합니다(추적 가능한 운송 서비스를 권장합니다). 제품 수령 후 교환(다른 모델 발송) 또는 환불(상품 결제 금액, 최초 배송비는 환불 불가)을 선택해 드립니다. 다음 반품 안내를 확인해 주세요. 반품 상품을 포장에 적힌 주소로 보내지 마세요. 해당 주소는 올바르지 않습니다. 저희가 제공한 반품 라벨 또는 고객 서비스팀에서 받은 주소를 사용해 주세요.",
        },
        {
          heading: "도수 렌즈(처방 포함)",
          body: "도수 안경은 처방전과 PD에 따라 주문 제작되며, 제조 결함 또는 당사 과실이 아닌 경우 반품·교환이 불가합니다. 다음의 경우에만 보증 또는 재제작이 가능합니다: 품질 결함(상기 365일 보증 적용); 당사의 제작 오류(업로드하신 처방과 불일치, 잘못된 프레임 또는 렌즈 유형 — 아래 “당사 책임” 항목 적용); 배송 중 손상(역시 “당사 책임” 적용).",
        },
        {
          heading: "당사 책임(무상 재발송 또는 전액 환불)",
          body: "다음의 경우에는 올바른 제품을 무상으로 재발송하거나 배송비를 포함한 전액을 환불해 드리며, 제품을 반송하실 필요가 없습니다: 잘못된 스타일/색상/렌즈 유형 발송; 처방 제작 오류(업로드하신 내용과 불일치); 배송 중 손상(언박싱 사진을 제공해 주세요); 명백한 제조 결함.",
        },
        {
          heading: "기타 조건",
          body: "대량 주문: 단일 주문에서 플라노가 5점을 초과할 경우, 개인 사유 반품은 처음 2점만 일반 처리되며 나머지는 10% 환불됩니다. 색상·사이즈 공차: 미세한 색상 차이 및 ±1mm 공차는 품질 결함에 해당하지 않습니다. 처방 유효기간: 발급일로부터 1년 이내의 처방만 접수합니다.",
        },
        {
          heading: "문의하기",
          body: "실시간 채팅: 사이트 오른쪽 하단, 24/7 운영. 이메일: support@loollook.com. 본 정책은 공정하고 투명하게 설계되었습니다. 특수 사례의 경우, 고객지원팀이 상황에 맞춰 함께 해결책을 안내해 드립니다.",
        },
      ],
    },
    ar: {
      eyebrow: "الشحن والإرجاع والضمان",
      title: "الشحن والإرجاع والضمان",
      intro:
        "شحن مجاني مع تتبع للطلبات التي تزيد عن 69 دولارًا. ضمان جودة 365 يومًا على كل نظارة. إرجاع واستبدال مجاني خلال 30 يومًا للنظارات غير الطبية. النظارات الطبية تُصنع حسب وصفة الطبيب ومسافة الحدقتين (PD)، ولا يمكن إرجاعها أو استبدالها إلا في حالة وجود عيب تصنيع أو خطأ من جانبنا. السياسة الإصدار 1.1، سارية من 8 أكتوبر 2026، تنطبق عالميًا.",
      sections: [
        {
          heading: "شحن مجاني مع تتبع للطلبات التي تزيد عن 69 دولارًا",
          body: "نوفر شحنًا مجانيًا مع تتبع إلى جميع أنحاء العالم للطلبات التي تزيد عن 69 دولارًا. الطلبات التي تقل عن 69 دولارًا تخضع لرسوم شحن ثابتة بقيمة 9.9 دولار. الطلبيات بوصفة طبية تتطلّب 3–5 أيام إضافية لعمل المختبر.",
        },
        {
          heading: "التتبّع",
          body: "ستصلك رسالة بريد إلكتروني تحتوي على رابط التتبّع بمجرد شحن طلبك. ويمكنك متابعته من حسابك في أي وقت.",
        },
        {
          heading: "الرسوم والضرائب",
          body: "في معظم الوجهات، تدفع loollook رسوم الاستيراد والضرائب مسبقًا، لكن بعض البلدان قد تطلب الدفع أحيانًا. إذا تلقيت إشعارًا برسوم جمركية أو ضرائب، فتواصل معنا قبل الدفع حتى نقدم لك الحل الأنسب. الرسوم المدفوعة دون تأكيد من loollook غير قابلة للاسترداد. عند الدفع، تُضاف ضريبة مبيعات بنسبة 5% إلى المجموع الفرعي للطلب (بعد الخصم)، وتظهر في سطر منفصل قبل الدفع.",
        },
        {
          heading: "ضمان الجودة 365 يومًا (لجميع المنتجات)",
          body: "خلال 365 يومًا من تاريخ الاستلام، إذا ظهر عيب في الخامات أو في التصنيع (كسر طبيعي في الإطار، فك اللحام، تقشّر الطلاء، انفصال طبقة العدسة، وما شابه)، فإننا نُعيد تصنيع نظارة مطابقة مجانًا — دون الحاجة إلى إعادة النظارة الأصلية. آلية التقديم: سجّل الدخول إلى حسابك → ابحث عن الطلب → اطلب خدمة ما بعد البيع → ارفع صور المشكلة → تتم المراجعة خلال 24 ساعة → نُرتّب إعادة الشحن. الحالات غير المشمولة: السقوط، أو الانسحاق، أو الخدوش، أو الأضرار الناتجة عن المواد الكيميائية / الحرارة / الحيوانات الأليفة، أو البهت الطبيعي، أو ارتخاء البراغي.",
        },
        {
          heading: "إرجاع خلال 30 يومًا",
          body: "إرجاع واستبدال مجاني خلال 30 يومًا للنظارات غير الطبية. النظارات الطبية تُصنع حسب وصفة الطبيب ومسافة الحدقتين، ولا يمكن إرجاعها أو استبدالها إلا في حالة وجود عيب تصنيع أو خطأ من جانبنا. يجب أن تكون جميع العناصر المرجعة غير مستخدمة وفي عبوتها الأصلية. تتحمّل أنت تكاليف الشحن الدولي لإعادة الإطار إلى الصين (يُفضَّل استخدام شركة شحن قابلة للتتبّع). بعد استلامنا للنظارة، نقدّم لك خيار الاستبدال (إرسال موديل آخر) أو استرداد قيمة المنتج (لا تُسترَدّ تكلفة الشحن الأصلية). يُرجى الانتباه إلى تعليمات الإرجاع التالية: لا ترسل المنتجات المرتجعة إلى العنوان الموجود على الطرد. هذا العنوان غير صحيح. يرجى استخدام ملصق الإرجاع الذي نوفره أو العنوان الذي تلقيته من فريق خدمة العملاء لدينا.",
        },
        {
          heading: "العدسات الطبية (بوصفة طبية)",
          body: "النظارات الطبية تُصنع حسب وصفة الطبيب ومسافة الحدقتين، ولا يمكن إرجاعها أو استبدالها إلا في حالة وجود عيب تصنيع أو خطأ من جانبنا. تخضع للضمان أو لإعادة التصنيع في الحالات التالية فقط: عيب جودة (يُعالج وفق ضمان الـ 365 يومًا أعلاه)؛ خطأ في التصنيع من جانبنا (الوصفة لا تطابق ما رفعتَه، أو إطار خاطئ، أو نوع عدسات خاطئ — يُعالَج ضمن «مسؤوليتنا»)؛ تلف خلال النقل (يُعالج أيضًا ضمن «مسؤوليتنا»).",
        },
        {
          heading: "مسؤوليتنا (إعادة شحن مجانية أو استرداد كامل)",
          body: "في الحالات التالية، نُعيد شحن النظارة الصحيحة مجانًا أو نُصدِر استردادًا كاملًا (شامل الشحن)، دون حاجة لإعادة المنتج: شحن تصميم/لون/نوع عدسة غير صحيح؛ خطأ في تنفيذ الوصفة (لا تطابق ما رفعتَه)؛ وصول الطرد متضرّرًا أثناء النقل (يرجى مشاركة صور فتح الطرد)؛ عيب تصنيع واضح.",
        },
        {
          heading: "شروط أخرى",
          body: "الطلبات بكميات كبيرة: في الطلب الواحد الذي يتضمّن أكثر من 5 نظّارات زخرفية، تُعالَج طلبات الإرجاع لأسباب شخصية بصورة اعتيادية للزوجَين الأوّلين فقط، ويُسترَدّ ما تبقّى بنسبة 10%. تسامحات اللون والمقاس: الفروق اللونية البسيطة وتسامح القياس ±1 مم لا تُعدّ عيوب جودة. صلاحية الوصفة الطبية: نقبل فقط الوصفات الصادرة خلال السنة الأخيرة.",
        },
        {
          heading: "تواصل معنا",
          body: "الدردشة المباشرة: في أسفل يمين الموقع، 24/7. البريد الإلكتروني: support@loollook.com. صُمِّمت هذه السياسة لتكون عادلة وشفافة. للحالات الخاصة، سيعمل فريق دعم العملاء معك للوصول إلى حلٍّ مناسب.",
        },
      ],
    },
    vi: {
      eyebrow: "Vận chuyển, đổi trả & bảo hành",
      title: "Vận chuyển, đổi trả & bảo hành",
      intro:
        "Miễn phí vận chuyển có theo dõi cho đơn hàng trên $69. Bảo hành chất lượng 365 ngày cho mọi cặp kính. Trả hàng và đổi hàng miễn phí trong 30 ngày đối với kính không toa. Kính có toa được sản xuất riêng theo toa thuốc và khoảng cách đồng tử (PD) của bạn, không thể trả hoặc đổi trừ khi có lỗi sản xuất hoặc lỗi từ phía chúng tôi. Chính sách v1.1, có hiệu lực từ 8/10/2026, áp dụng toàn cầu.",
      sections: [
        {
          heading: "Miễn phí vận chuyển có theo dõi cho đơn trên $69",
          body: "Chúng tôi cung cấp miễn phí vận chuyển có theo dõi trên toàn thế giới cho mọi đơn hàng trên $69. Đơn hàng dưới $69 có phí vận chuyển cố định $9.9. Đơn có đơn thuốc cộng thêm 3–5 ngày cho công việc tại lab.",
        },
        {
          heading: "Theo dõi",
          body: "Bạn sẽ nhận được email với liên kết theo dõi ngay khi đơn được gửi đi. Theo dõi từ tài khoản của bạn bất kỳ lúc nào.",
        },
        {
          heading: "Thuế và phí",
          body: "Với hầu hết các điểm đến, loollook trả trước thuế và phí nhập khẩu, nhưng một số quốc gia đôi khi có thể yêu cầu thanh toán. Nếu bạn nhận được thông báo thuế hoặc phí hải quan, hãy liên hệ với chúng tôi trước khi thanh toán để chúng tôi có thể đưa ra giải pháp tốt nhất. Các khoản đã trả khi chưa có xác nhận của loollook sẽ không được hoàn lại. Khi thanh toán, thuế bán hàng 5% sẽ được cộng vào tạm tính đơn hàng (sau giảm giá) và hiển thị thành một dòng riêng trước khi bạn trả tiền.",
        },
        {
          heading: "Bảo hành chất lượng 365 ngày (tất cả sản phẩm)",
          body: "Trong vòng 365 ngày kể từ ngày giao, nếu cặp kính của bạn có lỗi vật liệu hoặc lỗi tay nghề (gãy gọng, mối hàn bị bung, lớp phủ bong, tách lớp tròng kính, v.v.), chúng tôi làm lại một cặp giống hệt miễn phí — bạn không cần gửi lại bản gốc. Cách yêu cầu: đăng nhập tài khoản → tìm đơn hàng → yêu cầu hỗ trợ sau bán hàng → tải ảnh về vấn đề → chúng tôi xem xét trong 24 giờ → sắp xếp gửi lại. Không bao gồm: rơi vô tình, va đập, trầy xước, hư hỏng do hóa chất/nhiệt/thú cưng, phai màu tự nhiên, ốc vít lỏng, và các hao mòn tương tự.",
        },
        {
          heading: "Trả hàng trong 30 ngày",
          body: "Trả hàng và đổi hàng miễn phí trong 30 ngày đối với kính không toa. Kính có toa được sản xuất riêng theo toa thuốc và PD của bạn, không thể trả hoặc đổi trừ khi có lỗi sản xuất hoặc lỗi từ phía chúng tôi. Mọi sản phẩm trả lại phải chưa qua sử dụng và còn nguyên bao bì gốc. Bạn chịu chi phí gửi trả quốc tế về Trung Quốc (sử dụng chuyển phát có theo dõi). Khi chúng tôi nhận được gọng, chúng tôi sẽ đổi (gửi kiểu khác) hoặc hoàn tiền (giá trị sản phẩm đã trả; phí vận chuyển ban đầu không được hoàn). Vui lòng lưu ý các hướng dẫn trả hàng sau: không gửi hàng trả về địa chỉ trên kiện hàng. Địa chỉ đó không chính xác. Vui lòng sử dụng nhãn trả hàng do chúng tôi cung cấp hoặc địa chỉ bạn nhận được từ đội ngũ chăm sóc khách hàng.",
        },
        {
          heading: "Tròng có độ (với đơn thuốc)",
          body: 'Kính có toa được sản xuất riêng theo toa thuốc và PD của bạn, không thể trả hoặc đổi trừ khi có lỗi sản xuất hoặc lỗi từ phía chúng tôi. Chỉ đủ điều kiện bảo hành hoặc làm lại khi: có lỗi chất lượng (xử lý theo bảo hành 365 ngày bên trên); chúng tôi mắc lỗi sản xuất (đơn thuốc không khớp với những gì bạn tải lên, sai gọng hoặc sai loại tròng — xử lý theo "Trách nhiệm của chúng tôi" bên dưới); gói hàng đến nơi bị hư hỏng trong quá trình vận chuyển (cũng xử lý theo "Trách nhiệm của chúng tôi").',
        },
        {
          heading:
            "Trách nhiệm của chúng tôi (gửi lại miễn phí hoặc hoàn tiền đầy đủ)",
          body: "Trong những trường hợp sau, chúng tôi gửi lại cặp đúng miễn phí hoặc hoàn tiền đầy đủ (bao gồm vận chuyển), không cần trả lại sản phẩm: chúng tôi gửi sai kiểu, màu hoặc loại tròng; đơn thuốc được sản xuất sai (không khớp với đơn bạn đã tải); gói hàng đến nơi bị hư hỏng trong vận chuyển (vui lòng gửi ảnh mở hộp); lỗi sản xuất rõ ràng.",
        },
        {
          heading: "Điều khoản khác",
          body: "Đơn số lượng lớn: trên các đơn đơn lẻ hơn 5 cặp plano, đổi trả vì lý do cá nhân được xử lý bình thường cho 2 cặp đầu; phần còn lại được hoàn 10%. Dung sai màu sắc và kích cỡ: sai lệch màu nhẹ và dung sai kích thước ±1mm không được coi là vấn đề chất lượng. Hiệu lực đơn thuốc: chúng tôi chỉ chấp nhận đơn thuốc được cấp trong 12 tháng gần đây.",
        },
        {
          heading: "Liên hệ chúng tôi",
          body: "Live chat: góc dưới bên phải trang, 24/7. Email: support@loollook.com. Chính sách này được thiết kế để công bằng và minh bạch. Với các trường hợp đặc biệt, đội hỗ trợ của chúng tôi sẽ phối hợp với bạn để có giải pháp phù hợp.",
        },
      ],
    },
    th: {
      eyebrow: "การจัดส่ง การคืน และการรับประกัน",
      title: "การจัดส่ง การคืน และการรับประกัน",
      intro:
        "จัดส่งฟรีพร้อมติดตามพัสดุสำหรับคำสั่งซื้อที่มากกว่า $69 รับประกันคุณภาพ 365 วันทุกแว่น เปลี่ยนหรือคืนสินค้าได้ฟรีภายใน 30 วันสำหรับแว่นไร้แว่นสายตา แว่นตามใบสั่งแพทย์ผลิตตามใบสั่งและระยะจุดศูนย์กลางม่านตา (PD) ของคุณโดยเฉพาะ ไม่สามารถคืนหรือเปลี่ยนได้เว้นแต่มีความบกพร่องจากการผลิตหรือความผิดพลาดของเรา นโยบาย v1.1 มีผลตั้งแต่วันที่ 8 ตุลาคม 2026 ใช้ทั่วโลก",
      sections: [
        {
          heading: "จัดส่งฟรีพร้อมติดตามพัสดุสำหรับคำสั่งซื้อที่มากกว่า $69",
          body: "เราจัดส่งฟรีพร้อมติดตามพัสดุทั่วโลกสำหรับทุกคำสั่งซื้อที่มากกว่า $69 คำสั่งซื้อต่ำกว่า $69 มีค่าจัดส่งคงที่ $9.9",
        },
        {
          heading: "การติดตาม",
          body: "คุณจะได้รับอีเมลพร้อมลิงก์ติดตามทันทีที่คำสั่งซื้อของคุณถูกจัดส่ง ติดตามจากบัญชีของคุณได้ตลอดเวลา",
        },
        {
          heading: "ภาษีและอากร",
          body: "สำหรับปลายทางส่วนใหญ่ loollook ชำระภาษีและอากรนำเข้าไว้ล่วงหน้า แต่บางประเทศอาจมีการเรียกเก็บเป็นครั้งคราว หากคุณได้รับแจ้งให้ชำระภาษีหรืออากร โปรดติดต่อเราก่อนชำระเงิน เพื่อให้เราหาทางออกที่เหมาะสมที่สุดให้คุณ ค่าภาษีหรืออากรที่ชำระโดยไม่ได้รับการยืนยันจาก loollook จะไม่สามารถขอคืนได้ เมื่อชำระเงิน จะมีการบวกภาษีขาย 5% จากยอดรวมสินค้า (หลังหักส่วนลด) และแสดงเป็นรายการแยกก่อนชำระเงิน",
        },
        {
          heading: "รับประกันคุณภาพ 365 วัน (สินค้าทั้งหมด)",
          body: "ภายใน 365 วันนับจากการส่งมอบ หากแว่นของคุณมีข้อบกพร่องจากวัสดุหรือฝีมือ (กรอบหัก จุดเชื่อมหลุด การเคลือบลอก เลนส์แยกชั้น ฯลฯ) เราผลิตคู่ใหม่ที่เหมือนกันให้ฟรี — คุณไม่ต้องส่งคืนของเดิม วิธีเคลม: เข้าสู่ระบบ → หาคำสั่งซื้อ → ขอบริการหลังการขาย → อัปโหลดรูปภาพปัญหา → เราตรวจสอบภายใน 24 ชั่วโมง → จัดส่งใหม่ ไม่ครอบคลุม: การตกหล่นโดยไม่ตั้งใจ การกระแทก รอยขีดข่วน ความเสียหายจากสารเคมี/ความร้อน/สัตว์เลี้ยง การซีดจางตามปกติ สกรูหลวม และการสึกหรอที่คล้ายกัน",
        },
        {
          heading: "คืนสินค้าภายใน 30 วัน",
          body: "เปลี่ยนหรือคืนสินค้าได้ฟรีภายใน 30 วันสำหรับแว่นไร้แว่นสายตา แว่นตามใบสั่งแพทย์ผลิตตามใบสั่งและ PD ของคุณโดยเฉพาะ ไม่สามารถคืนหรือเปลี่ยนได้เว้นแต่มีความบกพร่องจากการผลิตหรือความผิดพลาดของเรา สินค้าที่คืนต้องไม่ผ่านการใช้งานและอยู่ในบรรจุภัณฑ์เดิม",
        },
        {
          heading: "เลนส์มีองศา (พร้อมใบสั่ง)",
          body: "แว่นตามใบสั่งแพทย์ผลิตตามใบสั่งและ PD ของคุณโดยเฉพาะ ไม่สามารถคืนหรือเปลี่ยนได้เว้นแต่มีความบกพร่องจากการผลิตหรือความผิดพลาดของเรา",
        },
        {
          heading: "ความรับผิดชอบของเรา (จัดส่งใหม่ฟรีหรือคืนเงินเต็มจำนวน)",
          body: "ในกรณีต่อไปนี้ เราจัดส่งคู่ที่ถูกต้องใหม่ฟรีหรือคืนเงินเต็มจำนวน (รวมค่าจัดส่ง) โดยไม่ต้องคืนสินค้า: เราจัดส่งสไตล์ สี หรือชนิดเลนส์ผิด; ใบสั่งถูกผลิตผิด (ไม่ตรงกับที่คุณอัปโหลด); พัสดุมาถึงเสียหายในระหว่างการขนส่ง (โปรดแชร์รูปภาพการแกะกล่อง); ข้อบกพร่องในการผลิตที่ชัดเจน",
        },
        {
          heading: "เงื่อนไขอื่น ๆ",
          body: "คำสั่งซื้อจำนวนมาก: สำหรับคำสั่งซื้อเดียวที่มี plano มากกว่า 5 คู่ การคืนด้วยเหตุผลส่วนตัวจัดการแบบปกติสำหรับ 2 คู่แรก ส่วนที่เหลือคืน 10% ส่วนเผื่อสีและขนาด: ความแตกต่างของสีเล็กน้อยและส่วนเผื่อขนาด ±1mm ไม่ถือเป็นปัญหาคุณภาพ ความถูกต้องของใบสั่ง: เรารับเฉพาะใบสั่งที่ออกภายใน 12 เดือนที่ผ่านมา",
        },
        {
          heading: "ติดต่อเรา",
          body: "แชทสด: มุมขวาล่างของเว็บไซต์ 24/7 อีเมล: support@loollook.com นโยบายนี้ถูกออกแบบให้ยุติธรรมและโปร่งใส สำหรับกรณีพิเศษ ทีมสนับสนุนของเราจะทำงานร่วมกับคุณเพื่อหาทางออกที่เหมาะสม",
        },
      ],
    },
    id: {
      eyebrow: "Pengiriman, pengembalian & garansi",
      title: "Pengiriman, pengembalian & garansi",
      intro:
        "Gratis ongkir dengan pelacakan untuk pesanan di atas $69. Garansi kualitas 365 hari untuk setiap pasang. Pengembalian dan penukaran gratis 30 hari untuk kacamata non-resep. Kacamata resep dibuat khusus sesuai resep dan PD Anda, tidak dapat dikembalikan atau ditukar kecuali ada cacat produksi atau kesalahan dari kami. Kebijakan v1.1, berlaku mulai 8 Oktober 2026, berlaku secara global.",
      sections: [
        {
          heading: "Gratis ongkir dengan pelacakan di atas $69",
          body: "Kami menawarkan gratis ongkir dengan pelacakan ke seluruh dunia untuk semua pesanan di atas $69. Pesanan di bawah $69 dikenakan biaya pengiriman tetap $9,9. Pesanan dengan resep menambah 3–5 hari untuk pengerjaan laboratorium.",
        },
        {
          heading: "Pelacakan",
          body: "Anda akan menerima email dengan tautan pelacakan begitu pesanan Anda dikirim. Lacak dari akun Anda kapan saja.",
        },
        {
          heading: "Bea masuk & pajak",
          body: "Untuk sebagian besar tujuan, loollook membayar bea masuk dan pajak impor di muka, tetapi beberapa negara terkadang dapat meminta pembayaran. Jika Anda menerima pemberitahuan bea atau pajak, hubungi kami sebelum membayar agar kami dapat menawarkan solusi terbaik. Bea yang dibayar tanpa konfirmasi loollook tidak dapat diganti. Saat checkout, pajak penjualan 5% ditambahkan ke subtotal pesanan (setelah diskon) dan ditampilkan sebagai baris terpisah sebelum Anda membayar.",
        },
        {
          heading: "Garansi kualitas 365 hari (semua produk)",
          body: "Dalam 365 hari setelah pengiriman, jika pasangan Anda menunjukkan cacat material atau pengerjaan (patah bingkai, sambungan las putus, lapisan mengelupas, delaminasi lensa, dll.), kami membuat ulang pasangan identik secara gratis — Anda tidak perlu mengembalikan aslinya. Cara klaim: masuk ke akun Anda → cari pesanan → minta dukungan purnajual → unggah foto masalah → kami tinjau dalam 24 jam → pengiriman ulang diatur. Tidak tercakup: jatuh tidak sengaja, penghancuran, goresan, kerusakan akibat bahan kimia/panas/hewan peliharaan, pudar normal, sekrup longgar, dan keausan serupa.",
        },
        {
          heading: "Pengembalian 30 hari",
          body: "Pengembalian dan penukaran gratis 30 hari untuk kacamata non-resep. Kacamata resep dibuat khusus sesuai resep dan PD Anda, tidak dapat dikembalikan atau ditukar kecuali ada cacat produksi atau kesalahan dari kami. Semua barang yang dikembalikan harus belum dipakai dan dalam kemasan asli. Anda menanggung pengiriman pengembalian internasional kembali ke China (gunakan kurir terlacak). Setelah kami menerima bingkainya, kami akan menukar (mengirim gaya berbeda) atau mengembalikan dana (nilai barang dibayar; pengiriman asli tidak dapat dikembalikan). Harap perhatikan instruksi pengembalian berikut: jangan kirim barang retur ke alamat pada paket. Alamat tersebut tidak benar. Gunakan label pengembalian yang kami sediakan atau alamat yang Anda terima dari tim layanan pelanggan kami.",
        },
        {
          heading: "Lensa berresep (dengan resep)",
          body: 'Kacamata resep dibuat khusus sesuai resep dan PD Anda, tidak dapat dikembalikan atau ditukar kecuali ada cacat produksi atau kesalahan dari kami. Mereka hanya memenuhi syarat untuk garansi atau pembuatan ulang ketika: ada cacat kualitas (ditangani di bawah garansi 365 hari di atas); kami melakukan kesalahan produksi (resep tidak sesuai dengan yang Anda unggah, bingkai salah atau jenis lensa salah — ditangani di bawah "Tanggung jawab kami" di bawah); paket tiba rusak dalam perjalanan (juga ditangani di bawah "Tanggung jawab kami").',
        },
        {
          heading:
            "Tanggung jawab kami (pengiriman ulang gratis atau pengembalian dana penuh)",
          body: "Dalam kasus berikut kami mengirim ulang pasangan yang benar secara gratis atau menerbitkan pengembalian dana penuh (termasuk pengiriman), tanpa perlu mengembalikan barang: kami mengirim gaya, warna, atau jenis lensa yang salah; resep diproduksi secara tidak benar (tidak sesuai dengan Rx yang Anda unggah); paket tiba rusak dalam perjalanan (mohon bagikan foto unboxing); cacat produksi yang jelas.",
        },
        {
          heading: "Ketentuan lainnya",
          body: "Pesanan dalam jumlah besar: untuk pesanan tunggal lebih dari 5 pasang plano, pengembalian dengan alasan pribadi ditangani secara normal untuk 2 pasang pertama; sisanya dikembalikan 10%. Toleransi warna dan ukuran: variasi warna kecil dan toleransi dimensi ±1mm tidak dianggap sebagai masalah kualitas. Validitas resep: kami hanya menerima resep yang diterbitkan dalam 12 bulan terakhir.",
        },
        {
          heading: "Hubungi kami",
          body: "Live chat: kanan bawah situs, 24/7. Email: support@loollook.com. Kebijakan ini dirancang agar adil dan transparan. Untuk kasus khusus, tim dukungan kami akan bekerja sama dengan Anda untuk solusi yang disesuaikan.",
        },
      ],
    },
    ms: {
      eyebrow: "Penghantaran, pemulangan & jaminan",
      title: "Penghantaran, pemulangan & jaminan",
      intro:
        "Penghantaran percuma dengan penjejakan untuk pesanan melebihi $69. Waranti kualiti 365 hari untuk setiap pasang. Pemulangan dan pertukaran percuma 30 hari untuk cermin mata tanpa preskripsi. Cermin mata preskripsi dibuat khas mengikut preskripsi dan PD anda, dan tidak boleh dipulangkan atau ditukar kecuali terdapat kecacatan pembuatan atau kesilapan kami. Polisi v1.1, berkuat kuasa mulai 8 Oktober 2026, terpakai di seluruh dunia.",
      sections: [
        {
          heading: "Penghantaran percuma dengan penjejakan melebihi $69",
          body: "Kami menawarkan penghantaran percuma dengan penjejakan ke seluruh dunia untuk semua pesanan melebihi $69. Pesanan di bawah $69 dikenakan yuran penghantaran tetap $9.9. Pesanan preskripsi menambah 3–5 hari untuk kerja makmal.",
        },
        {
          heading: "Penjejakan",
          body: "Anda akan menerima e-mel dengan pautan penjejakan sebaik sahaja pesanan anda dihantar. Jejak dari akaun anda pada bila-bila masa.",
        },
        {
          heading: "Duti & cukai",
          body: "Untuk kebanyakan destinasi, loollook membayar duti import dan cukai terlebih dahulu, tetapi sesetengah negara mungkin sekali-sekala meminta bayaran. Jika anda menerima notis duti atau cukai, hubungi kami sebelum membuat bayaran supaya kami boleh menawarkan penyelesaian terbaik. Duti yang dibayar tanpa pengesahan loollook tidak boleh dibayar balik. Semasa pembayaran, cukai jualan 5% ditambah pada subjumlah pesanan (selepas diskaun) dan dipaparkan sebagai baris berasingan sebelum anda membayar.",
        },
        {
          heading: "Jaminan kualiti 365 hari (semua produk)",
          body: "Dalam tempoh 365 hari selepas penghantaran, jika pasangan anda menunjukkan kecacatan bahan atau mutu kerja (kepatahan bingkai, kimpalan putus, salutan terkupas, delaminasi kanta, dll.), kami membuat semula pasangan yang sama secara percuma — anda tidak perlu mengembalikan yang asal. Cara membuat tuntutan: log masuk ke akaun anda → cari pesanan → minta sokongan purna jual → muat naik foto isu → kami semak dalam 24 jam → penghantaran semula diatur. Tidak dilindungi: kejatuhan tidak sengaja, dihimpit, calar, kerosakan akibat bahan kimia/haba/haiwan peliharaan, pudar biasa, skru longgar, dan haus-lusuh serupa.",
        },
        {
          heading: "Pemulangan 30 hari",
          body: "Pemulangan dan pertukaran percuma 30 hari untuk cermin mata tanpa preskripsi. Cermin mata preskripsi dibuat khas mengikut preskripsi dan PD anda, dan tidak boleh dipulangkan atau ditukar kecuali terdapat kecacatan pembuatan atau kesilapan kami. Semua item yang dipulangkan mestilah tidak dipakai dan dalam pembungkusan asal. Anda menanggung penghantaran pemulangan antarabangsa kembali ke China (gunakan kurier yang boleh dijejaki). Setelah kami menerima bingkai, kami akan menukar (menghantar gaya berbeza) atau membayar balik (nilai item yang dibayar; penghantaran asal tidak boleh dibayar balik). Sila ambil perhatian arahan pemulangan berikut: jangan hantar item pemulangan ke alamat pada bungkusan. Alamat itu tidak betul. Gunakan label pemulangan yang kami sediakan atau alamat yang anda terima daripada pasukan khidmat pelanggan kami.",
        },
        {
          heading: "Kanta preskripsi (dengan preskripsi)",
          body: 'Cermin mata preskripsi dibuat khas mengikut preskripsi dan PD anda, dan tidak boleh dipulangkan atau ditukar kecuali terdapat kecacatan pembuatan atau kesilapan kami. Ia hanya layak untuk jaminan atau membuat semula apabila: terdapat kecacatan kualiti (dikendalikan di bawah jaminan 365 hari di atas); kami membuat kesilapan pengeluaran (preskripsi tidak sepadan dengan apa yang anda muat naik, bingkai salah atau jenis kanta salah — dikendalikan di bawah "Tanggungjawab kami" di bawah); bungkusan tiba rosak semasa transit (juga dikendalikan di bawah "Tanggungjawab kami").',
        },
        {
          heading:
            "Tanggungjawab kami (penghantaran semula percuma atau bayaran balik penuh)",
          body: "Dalam kes berikut kami menghantar semula pasangan yang betul secara percuma atau mengeluarkan bayaran balik penuh (termasuk penghantaran), tanpa perlu memulangkan item: kami menghantar gaya, warna, atau jenis kanta yang salah; preskripsi dihasilkan dengan tidak betul (tidak sepadan dengan Rx yang anda muat naik); bungkusan tiba rosak semasa transit (sila kongsi foto unboxing); kecacatan pengeluaran yang jelas.",
        },
        {
          heading: "Syarat lain",
          body: "Pesanan pukal: pada pesanan tunggal lebih daripada 5 pasangan plano, pemulangan atas sebab peribadi dikendalikan secara normal untuk 2 pasangan pertama; selebihnya dibayar balik pada 10%. Toleransi warna dan saiz: variasi warna kecil dan toleransi dimensi ±1mm tidak dianggap isu kualiti. Kesahan preskripsi: kami hanya menerima preskripsi yang dikeluarkan dalam 12 bulan yang lalu.",
        },
        {
          heading: "Hubungi kami",
          body: "Sembang langsung: kanan bawah laman web, 24/7. E-mel: support@loollook.com. Dasar ini direka untuk adil dan telus. Untuk kes khas, pasukan sokongan kami akan bekerjasama dengan anda untuk penyelesaian yang disesuaikan.",
        },
      ],
    },
  },
  privacy: {
    en: {
      eyebrow: "Legal",
      title: "Privacy & Security",
      intro:
        "We collect what we need to deliver your order and improve your experience — nothing more. Here’s exactly what we store, why, and how to control it.",
      sections: [
        {
          heading: "What we collect",
          body: "Account details (email, name), shipping address, optional prescription data, browsing patterns on loollook.com, and payment tokens (we never store full card numbers — they’re tokenized by our PCI-DSS Level 1 processor).",
        },
        {
          heading: "Why we collect it",
          body: "To process and ship orders, recommend better-fitting frames, improve site performance, and (with your consent) send marketing you’ve opted into. We don’t sell your data.",
        },
        {
          heading: "Your rights",
          body: "Request a full export of your data, deletion of your account, or correction of any field — anytime, free, by emailing privacy@loollook.com. We respond within 30 days, in line with GDPR and CCPA.",
        },
        {
          heading: "Security",
          body: "TLS 1.3 in transit, AES-256 at rest, mandatory 2FA for staff access, annual external penetration testing, and an active bug-bounty program.",
        },
      ],
    },
    zh: {
      eyebrow: "法律",
      title: "隐私与安全",
      intro:
        "我们只收集为完成订单与改善体验所必需的信息——仅此而已。这里说明我们存什么、为什么存，以及你如何掌控。",
      sections: [
        {
          heading: "我们收集哪些信息",
          body: "账户信息（邮箱、姓名）、配送地址、可选的处方数据、loollook.com 上的浏览行为、支付令牌（我们从不存储完整卡号——它们由我们 PCI-DSS Level 1 支付方进行令牌化处理）。",
        },
        {
          heading: "为什么收集",
          body: "用于处理与发货、推荐更合适的镜架、改进网站性能，并在你同意的前提下发送营销信息。我们不出售你的数据。",
        },
        {
          heading: "你的权利",
          body: "随时免费导出全部数据、删除账户、修正任何字段——发送邮件至 privacy@loollook.com 即可。我们将在 30 天内回复，符合 GDPR 与 CCPA。",
        },
        {
          heading: "安全保障",
          body: "传输使用 TLS 1.3，存储使用 AES-256，员工访问强制 2FA，每年外部渗透测试，并设有活跃的漏洞赏金计划。",
        },
      ],
    },
    es: {
      eyebrow: "Legal",
      title: "Privacidad y seguridad",
      intro:
        "Recopilamos lo necesario para entregar tu pedido y mejorar tu experiencia, nada más. Aquí tienes exactamente qué guardamos, por qué y cómo controlarlo.",
      sections: [
        {
          heading: "Qué recopilamos",
          body: "Datos de la cuenta (correo, nombre), dirección de envío, datos de receta opcionales, patrones de navegación en loollook.com y tokens de pago (nunca guardamos números de tarjeta completos: están tokenizados por nuestro procesador PCI-DSS Nivel 1).",
        },
        {
          heading: "Por qué lo recopilamos",
          body: "Para procesar y enviar los pedidos, recomendar monturas que se ajusten mejor, mejorar el rendimiento del sitio y (con tu consentimiento) enviarte la comunicación de marketing a la que te hayas suscrito. No vendemos tus datos.",
        },
        {
          heading: "Tus derechos",
          body: "Solicita una exportación completa de tus datos, la eliminación de tu cuenta o la corrección de cualquier campo en cualquier momento, gratis, escribiendo a privacy@loollook.com. Respondemos en un plazo de 30 días, conforme a RGPD y CCPA.",
        },
        {
          heading: "Seguridad",
          body: "TLS 1.3 en tránsito, AES-256 en reposo, 2FA obligatorio para el acceso del personal, pruebas de penetración externas anuales y un programa activo de bug bounty.",
        },
      ],
    },
    fr: {
      eyebrow: "Mentions légales",
      title: "Confidentialité & sécurité",
      intro:
        "Nous collectons ce dont nous avons besoin pour livrer votre commande et améliorer votre expérience — rien de plus. Voici exactement ce que nous stockons, pourquoi, et comment le contrôler.",
      sections: [
        {
          heading: "Ce que nous collectons",
          body: "Informations de compte (e-mail, nom), adresse de livraison, données d’ordonnance facultatives, parcours de navigation sur loollook.com, et jetons de paiement (nous ne stockons jamais les numéros de carte complets — ils sont tokenisés par notre prestataire certifié PCI-DSS Niveau 1).",
        },
        {
          heading: "Pourquoi nous le collectons",
          body: "Pour traiter et expédier les commandes, recommander des montures mieux adaptées, améliorer les performances du site et (avec votre consentement) vous envoyer le marketing auquel vous avez souscrit. Nous ne vendons pas vos données.",
        },
        {
          heading: "Vos droits",
          body: "Demandez un export complet de vos données, la suppression de votre compte ou la correction de tout champ — à tout moment, gratuitement, en écrivant à privacy@loollook.com. Nous répondons sous 30 jours, conformément au RGPD et au CCPA.",
        },
        {
          heading: "Sécurité",
          body: "TLS 1.3 en transit, AES-256 au repos, 2FA obligatoire pour les accès équipe, tests d’intrusion externes annuels, et un programme de bug bounty actif.",
        },
      ],
    },
    de: {
      eyebrow: "Rechtliches",
      title: "Datenschutz & Sicherheit",
      intro:
        "Wir erfassen nur, was nötig ist, um deine Bestellung auszuliefern und dein Erlebnis zu verbessern — mehr nicht. Hier steht genau, was wir speichern, warum und wie du es kontrollieren kannst.",
      sections: [
        {
          heading: "Was wir erfassen",
          body: "Kontodaten (E-Mail, Name), Lieferadresse, optionale Rezeptdaten, Nutzungsmuster auf loollook.com sowie Zahlungstoken (vollständige Kartennummern speichern wir nie — sie werden von unserem PCI-DSS Level 1 zertifizierten Zahlungsdienstleister tokenisiert).",
        },
        {
          heading: "Warum wir es erfassen",
          body: "Um Bestellungen zu bearbeiten und zu versenden, besser passende Fassungen zu empfehlen, die Performance der Website zu verbessern und dir (mit deinem Einverständnis) Marketing zu senden, dem du zugestimmt hast. Wir verkaufen deine Daten nicht.",
        },
        {
          heading: "Deine Rechte",
          body: "Fordere jederzeit kostenlos einen vollständigen Export deiner Daten, die Löschung deines Kontos oder die Korrektur jedes Felds an — per E-Mail an privacy@loollook.com. Wir antworten innerhalb von 30 Tagen, im Einklang mit DSGVO und CCPA.",
        },
        {
          heading: "Sicherheit",
          body: "TLS 1.3 für die Übertragung, AES-256 für gespeicherte Daten, verpflichtende 2FA für Mitarbeiterzugriffe, jährliche externe Penetrationstests und ein aktives Bug-Bounty-Programm.",
        },
      ],
    },
    it: {
      eyebrow: "Legale",
      title: "Privacy e sicurezza",
      intro:
        "Raccogliamo ciò che ci serve per consegnare il tuo ordine e migliorare la tua esperienza — nulla di più. Ecco esattamente cosa conserviamo, perché e come puoi controllarlo.",
      sections: [
        {
          heading: "Cosa raccogliamo",
          body: "Dati dell’account (email, nome), indirizzo di spedizione, dati della ricetta facoltativi, comportamenti di navigazione su loollook.com e token di pagamento (non conserviamo mai i numeri completi delle carte — vengono tokenizzati dal nostro processore PCI-DSS Level 1).",
        },
        {
          heading: "Perché lo raccogliamo",
          body: "Per elaborare e spedire gli ordini, consigliarti montature più adatte, migliorare le prestazioni del sito e (con il tuo consenso) inviarti le comunicazioni di marketing a cui hai aderito. Non vendiamo i tuoi dati.",
        },
        {
          heading: "I tuoi diritti",
          body: "Puoi richiedere l’esportazione completa dei tuoi dati, la cancellazione dell’account o la correzione di qualsiasi campo — in qualsiasi momento, gratuitamente, scrivendo a privacy@loollook.com. Rispondiamo entro 30 giorni, in conformità con GDPR e CCPA.",
        },
        {
          heading: "Sicurezza",
          body: "TLS 1.3 in transito, AES-256 a riposo, 2FA obbligatoria per l’accesso del personale, penetration test esterni annuali e un programma di bug bounty attivo.",
        },
      ],
    },
    pt: {
      eyebrow: "Legal",
      title: "Privacidade e segurança",
      intro:
        "Coletamos apenas o necessário para entregar seu pedido e melhorar sua experiência — nada além disso. Veja exatamente o que armazenamos, por quê e como você pode controlar.",
      sections: [
        {
          heading: "O que coletamos",
          body: "Dados da conta (e-mail, nome), endereço de entrega, dados opcionais de receita, padrões de navegação no loollook.com e tokens de pagamento (nunca armazenamos números completos de cartão — são tokenizados pelo nosso processador PCI-DSS Nível 1).",
        },
        {
          heading: "Por que coletamos",
          body: "Para processar e enviar pedidos, recomendar armações que se encaixem melhor, melhorar o desempenho do site e (com sua autorização) enviar comunicações de marketing nas quais você optou por receber. Não vendemos seus dados.",
        },
        {
          heading: "Seus direitos",
          body: "Solicite a exportação completa dos seus dados, a exclusão da sua conta ou a correção de qualquer campo — a qualquer momento, gratuitamente, enviando um e-mail para privacy@loollook.com. Respondemos em até 30 dias, em conformidade com o GDPR e a CCPA.",
        },
        {
          heading: "Segurança",
          body: "TLS 1.3 em trânsito, AES-256 em repouso, 2FA obrigatório para acesso da equipe, testes de penetração externos anuais e um programa ativo de bug bounty.",
        },
      ],
    },
    ja: {
      eyebrow: "法的事項",
      title: "プライバシーとセキュリティ",
      intro:
        "ご注文をお届けし、体験を向上させるために必要な情報のみを収集します。それ以上はいたしません。当社が保存する内容、その理由、そして管理方法を明確にご説明します。",
      sections: [
        {
          heading: "取得する情報",
          body: "アカウント情報（メールアドレス、氏名）、配送先住所、任意の処方データ、loollook.com 上の閲覧パターン、決済トークン（カード番号全体は保存しません。PCI-DSS Level 1 認証の決済プロセッサーによりトークン化されます）。",
        },
        {
          heading: "利用目的",
          body: "ご注文の処理と発送、より合うフレームのご提案、サイトのパフォーマンス向上、そしてお客様の同意のもとでオプトインされたマーケティング情報の送信に利用します。お客様のデータを販売することはありません。",
        },
        {
          heading: "あなたの権利",
          body: "privacy@loollook.com までメールにてご連絡いただければ、データの全件エクスポート、アカウント削除、各項目の修正をいつでも無料でリクエストいただけます。GDPR および CCPA に従い、30 日以内に対応いたします。",
        },
        {
          heading: "セキュリティ",
          body: "通信は TLS 1.3、保存は AES-256 で暗号化。スタッフのアクセスには 2FA を義務付け、毎年外部のペネトレーションテストを実施し、アクティブなバグバウンティプログラムも運用しています。",
        },
      ],
    },
    ko: {
      eyebrow: "법적 고지",
      title: "개인정보 및 보안",
      intro:
        "당사는 주문 처리와 서비스 개선에 필요한 정보만을 수집하며, 그 이상은 수집하지 않습니다. 무엇을 저장하는지, 왜 저장하는지, 그리고 어떻게 통제할 수 있는지 정확히 안내드립니다.",
      sections: [
        {
          heading: "수집 항목",
          body: "계정 정보(이메일, 이름), 배송지 주소, 선택적 처방 데이터, loollook.com 내 이용 패턴, 결제 토큰(전체 카드 번호는 절대 저장하지 않으며, PCI-DSS Level 1 결제 처리사가 토큰화합니다)을 수집합니다.",
        },
        {
          heading: "수집 이유",
          body: "주문 처리와 배송, 더 잘 맞는 프레임 추천, 사이트 성능 개선, 그리고 (귀하의 동의 하에) 신청하신 마케팅 정보 발송을 위해 사용합니다. 당사는 귀하의 데이터를 판매하지 않습니다.",
        },
        {
          heading: "귀하의 권리",
          body: "privacy@loollook.com으로 이메일을 보내시면 언제든 무료로 전체 데이터 내보내기, 계정 삭제, 항목 정정을 요청하실 수 있습니다. GDPR 및 CCPA에 따라 30일 이내에 답변드립니다.",
        },
        {
          heading: "보안",
          body: "전송 시 TLS 1.3, 저장 시 AES-256 암호화를 적용하며, 직원 액세스에는 2FA가 필수입니다. 매년 외부 침투 테스트를 실시하고 활발한 버그 바운티 프로그램을 운영합니다.",
        },
      ],
    },
    ar: {
      eyebrow: "قانوني",
      title: "الخصوصية والأمان",
      intro:
        "نجمع فقط ما نحتاج إليه لتسليم طلبك وتحسين تجربتك — لا أكثر من ذلك. فيما يلي بالضبط ما نخزّنه، ولماذا، وكيف يمكنك التحكّم فيه.",
      sections: [
        {
          heading: "ما نجمعه",
          body: "بيانات الحساب (البريد الإلكتروني، الاسم)، عنوان الشحن، بيانات الوصفة الطبية الاختيارية، أنماط التصفّح على loollook.com، ورموز الدفع (لا نخزّن أرقام البطاقات الكاملة أبدًا — يجري ترميزها لدى معالج الدفع المعتمد PCI-DSS Level 1).",
        },
        {
          heading: "لماذا نجمعها",
          body: "لمعالجة الطلبات وشحنها، واقتراح إطارات أنسب لك، وتحسين أداء الموقع، و(بموافقتك) إرسال الرسائل التسويقية التي اخترت الاشتراك فيها. نحن لا نبيع بياناتك.",
        },
        {
          heading: "حقوقك",
          body: "يمكنك طلب تصدير كامل لبياناتك، أو حذف حسابك، أو تصحيح أي حقل — في أي وقت ومجانًا، عبر مراسلتنا على privacy@loollook.com. نردّ خلال 30 يومًا، بما يتوافق مع GDPR وCCPA.",
        },
        {
          heading: "الأمان",
          body: "تشفير TLS 1.3 أثناء النقل، وAES-256 للبيانات المخزَّنة، والتفعيل الإلزامي للمصادقة الثنائية (2FA) لوصول الموظفين، واختبار اختراق خارجي سنوي، وبرنامج نشط لمكافآت اكتشاف الثغرات.",
        },
      ],
    },
    vi: {
      eyebrow: "Pháp lý",
      title: "Quyền riêng tư & bảo mật",
      intro:
        "Chúng tôi chỉ thu thập những gì cần thiết để giao đơn của bạn và cải thiện trải nghiệm — không gì hơn. Đây chính xác là những gì chúng tôi lưu, tại sao, và cách kiểm soát.",
      sections: [
        {
          heading: "Những gì chúng tôi thu thập",
          body: "Thông tin tài khoản (email, tên), địa chỉ giao hàng, dữ liệu đơn thuốc tùy chọn, mẫu hành vi duyệt trên loollook.com, và token thanh toán (chúng tôi không bao giờ lưu số thẻ đầy đủ — chúng được token hóa bởi nhà xử lý thanh toán PCI-DSS Level 1 của chúng tôi).",
        },
        {
          heading: "Tại sao chúng tôi thu thập",
          body: "Để xử lý và giao đơn hàng, đề xuất gọng phù hợp hơn, cải thiện hiệu suất trang web, và (với sự đồng ý của bạn) gửi tiếp thị bạn đã chọn nhận. Chúng tôi không bán dữ liệu của bạn.",
        },
        {
          heading: "Quyền của bạn",
          body: "Yêu cầu xuất toàn bộ dữ liệu, xóa tài khoản, hoặc sửa bất kỳ trường nào — bất cứ lúc nào, miễn phí, bằng cách gửi email tới privacy@loollook.com. Chúng tôi phản hồi trong vòng 30 ngày, theo GDPR và CCPA.",
        },
        {
          heading: "Bảo mật",
          body: "TLS 1.3 khi truyền tải, AES-256 khi lưu trữ, 2FA bắt buộc cho truy cập của nhân viên, kiểm thử thâm nhập từ bên ngoài hàng năm, và một chương trình bug-bounty đang hoạt động.",
        },
      ],
    },
    th: {
      eyebrow: "ข้อกฎหมาย",
      title: "ความเป็นส่วนตัวและความปลอดภัย",
      intro:
        "เราเก็บข้อมูลเท่าที่จำเป็นในการส่งคำสั่งซื้อและปรับปรุงประสบการณ์ของคุณ — ไม่มากกว่านั้น นี่คือสิ่งที่เราเก็บ เหตุผล และวิธีควบคุม",
      sections: [
        {
          heading: "เราเก็บอะไรบ้าง",
          body: "รายละเอียดบัญชี (อีเมล ชื่อ) ที่อยู่จัดส่ง ข้อมูลใบสั่งยาตามที่เลือก รูปแบบการเรียกดูบน loollook.com และโทเค็นการชำระเงิน (เราไม่เก็บหมายเลขบัตรแบบเต็ม — มันถูกแปลงเป็นโทเค็นโดยผู้ประมวลผล PCI-DSS Level 1 ของเรา)",
        },
        {
          heading: "ทำไมเราจึงเก็บ",
          body: "เพื่อดำเนินการและจัดส่งคำสั่งซื้อ แนะนำกรอบที่เหมาะสมยิ่งขึ้น ปรับปรุงประสิทธิภาพของเว็บไซต์ และ (โดยได้รับความยินยอมจากคุณ) ส่งการตลาดที่คุณเลือกรับ เราไม่ขายข้อมูลของคุณ",
        },
        {
          heading: "สิทธิ์ของคุณ",
          body: "ขอส่งออกข้อมูลทั้งหมดของคุณ ลบบัญชี หรือแก้ไขฟิลด์ใดก็ได้ — ทุกเมื่อ ฟรี โดยส่งอีเมลถึง privacy@loollook.com เราตอบกลับภายใน 30 วัน ตามมาตรฐาน GDPR และ CCPA",
        },
        {
          heading: "ความปลอดภัย",
          body: "TLS 1.3 ระหว่างการส่งข้อมูล, AES-256 เมื่อพักข้อมูล, 2FA บังคับสำหรับการเข้าถึงของพนักงาน, การทดสอบเจาะระบบจากภายนอกประจำปี และโปรแกรม bug-bounty ที่กำลังดำเนินอยู่",
        },
      ],
    },
    id: {
      eyebrow: "Legal",
      title: "Privasi & keamanan",
      intro:
        "Kami hanya mengumpulkan apa yang kami butuhkan untuk mengirim pesanan Anda dan meningkatkan pengalaman Anda — tidak lebih. Inilah yang tepatnya kami simpan, mengapa, dan bagaimana cara mengontrolnya.",
      sections: [
        {
          heading: "Apa yang kami kumpulkan",
          body: "Detail akun (email, nama), alamat pengiriman, data resep opsional, pola penjelajahan di loollook.com, dan token pembayaran (kami tidak pernah menyimpan nomor kartu lengkap — mereka ditokenisasi oleh prosesor PCI-DSS Level 1 kami).",
        },
        {
          heading: "Mengapa kami mengumpulkannya",
          body: "Untuk memproses dan mengirim pesanan, merekomendasikan bingkai yang lebih cocok, meningkatkan kinerja situs, dan (dengan persetujuan Anda) mengirim pemasaran yang telah Anda setujui. Kami tidak menjual data Anda.",
        },
        {
          heading: "Hak Anda",
          body: "Minta ekspor data Anda secara lengkap, penghapusan akun, atau koreksi bidang apa pun — kapan saja, gratis, dengan mengirim email ke privacy@loollook.com. Kami merespons dalam 30 hari, sejalan dengan GDPR dan CCPA.",
        },
        {
          heading: "Keamanan",
          body: "TLS 1.3 saat transit, AES-256 saat istirahat, 2FA wajib untuk akses staf, uji penetrasi eksternal tahunan, dan program bug-bounty aktif.",
        },
      ],
    },
    ms: {
      eyebrow: "Undang-undang",
      title: "Privasi & keselamatan",
      intro:
        "Kami mengumpul hanya apa yang kami perlukan untuk menghantar pesanan anda dan meningkatkan pengalaman anda — tidak lebih. Inilah dengan tepat apa yang kami simpan, mengapa, dan cara mengawalnya.",
      sections: [
        {
          heading: "Apa yang kami kumpulkan",
          body: "Maklumat akaun (e-mel, nama), alamat penghantaran, data preskripsi pilihan, corak penyemakan imbas pada loollook.com, dan token pembayaran (kami tidak pernah menyimpan nombor kad penuh — ia ditokenkan oleh pemproses PCI-DSS Level 1 kami).",
        },
        {
          heading: "Mengapa kami mengumpulkannya",
          body: "Untuk memproses dan menghantar pesanan, mengesyorkan bingkai yang lebih sesuai, meningkatkan prestasi laman web, dan (dengan persetujuan anda) menghantar pemasaran yang anda pilih. Kami tidak menjual data anda.",
        },
        {
          heading: "Hak anda",
          body: "Minta eksport penuh data anda, pemadaman akaun anda, atau pembetulan mana-mana medan — pada bila-bila masa, percuma, dengan menghantar e-mel ke privacy@loollook.com. Kami membalas dalam 30 hari, selaras dengan GDPR dan CCPA.",
        },
        {
          heading: "Keselamatan",
          body: "TLS 1.3 semasa transit, AES-256 semasa rehat, 2FA wajib untuk akses kakitangan, ujian penembusan luaran tahunan, dan program bug-bounty yang aktif.",
        },
      ],
    },
  },
  terms: {
    en: {
      eyebrow: "Legal",
      title: "Terms & Conditions",
      intro:
        "By using loollook.com or buying from us, you agree to the following. Plain language version below — full legal text available on request.",
      sections: [
        {
          heading: "Your account",
          body: "You’re responsible for keeping your password safe and for any activity under your account. Tell us immediately if you suspect unauthorized access.",
        },
        {
          heading: "Orders & pricing",
          body: "All prices are in USD unless otherwise stated and include applicable lenses but exclude regional sales tax. We may correct pricing errors and cancel orders affected by them, with a full refund.",
        },
        {
          heading: "Prescriptions",
          body: "You’re responsible for the accuracy of any prescription you upload. We verify against common ranges but cannot detect typos. Always use a current prescription (under 12 months for adults, 6 months for children).",
        },
        {
          heading: "Intellectual property",
          body: "All site content — frame designs, photography, copy, code — is owned by loollook and may not be reproduced without written consent.",
        },
        {
          heading: "Liability",
          body: "loollook’s total liability for any order is capped at the order’s value. We are not liable for indirect, incidental, or consequential damages.",
        },
        {
          heading: "Governing law",
          body: "These terms are governed by the laws of the State of California. Disputes go to binding arbitration in San Francisco unless prohibited by your local consumer-protection law.",
        },
      ],
    },
    zh: {
      eyebrow: "法律",
      title: "条款与条件",
      intro:
        "使用 loollook.com 或在我们这里购物即视为同意以下条款。下方为通俗版，完整法律文本可应请求提供。",
      sections: [
        {
          heading: "你的账户",
          body: "你需妥善保管密码并对账户下的所有活动负责。如怀疑账户被未授权访问，请立即告知我们。",
        },
        {
          heading: "订单与价格",
          body: "若无特别说明，所有价格均为美元，含相应镜片但不含地区销售税。如出现价格错误，我们可纠正并取消受影响的订单并全额退款。",
        },
        {
          heading: "处方",
          body: "你需对上传处方的准确性负责。我们会比对常见范围，但无法识别拼写错误。请使用最新处方（成人 12 个月内，儿童 6 个月内）。",
        },
        {
          heading: "知识产权",
          body: "网站全部内容——镜架设计、摄影、文案、代码——归 loollook 所有，未经书面同意不得复制。",
        },
        {
          heading: "责任",
          body: "loollook 对任一订单的总责任以该订单价值为上限。我们不对间接、附带或后果性损失承担责任。",
        },
        {
          heading: "适用法律",
          body: "本条款受美国加利福尼亚州法律管辖。除非当地消费者保护法另有禁止，争议将于旧金山进行强制仲裁。",
        },
      ],
    },
    es: {
      eyebrow: "Legal",
      title: "Términos y condiciones",
      intro:
        "Al usar loollook.com o comprar con nosotros, aceptas lo siguiente. Versión en lenguaje claro a continuación; el texto legal completo está disponible bajo petición.",
      sections: [
        {
          heading: "Tu cuenta",
          body: "Eres responsable de mantener tu contraseña segura y de cualquier actividad realizada bajo tu cuenta. Avísanos de inmediato si sospechas un acceso no autorizado.",
        },
        {
          heading: "Pedidos y precios",
          body: "Todos los precios están en USD salvo indicación contraria e incluyen las lentes correspondientes pero excluyen los impuestos regionales sobre ventas. Podemos corregir errores de precio y cancelar los pedidos afectados con un reembolso completo.",
        },
        {
          heading: "Recetas",
          body: "Eres responsable de la exactitud de cualquier receta que subas. Verificamos frente a rangos habituales, pero no podemos detectar erratas. Usa siempre una receta vigente (de menos de 12 meses para adultos, 6 meses para niños).",
        },
        {
          heading: "Propiedad intelectual",
          body: "Todo el contenido del sitio —diseños de monturas, fotografía, textos, código— es propiedad de loollook y no puede reproducirse sin consentimiento por escrito.",
        },
        {
          heading: "Responsabilidad",
          body: "La responsabilidad total de loollook por cualquier pedido se limita al valor del propio pedido. No nos hacemos responsables de daños indirectos, incidentales o derivados.",
        },
        {
          heading: "Ley aplicable",
          body: "Estos términos se rigen por las leyes del Estado de California. Las disputas se someten a arbitraje vinculante en San Francisco, salvo que lo prohíba tu legislación local de protección al consumidor.",
        },
      ],
    },
    fr: {
      eyebrow: "Mentions légales",
      title: "Conditions générales",
      intro:
        "En utilisant loollook.com ou en achetant chez nous, vous acceptez ce qui suit. Version en langage clair ci-dessous — texte juridique complet disponible sur demande.",
      sections: [
        {
          heading: "Votre compte",
          body: "Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité réalisée depuis votre compte. Avertissez-nous immédiatement si vous soupçonnez un accès non autorisé.",
        },
        {
          heading: "Commandes & prix",
          body: "Tous les prix sont en USD sauf mention contraire et comprennent les verres applicables mais excluent la TVA ou la taxe de vente locale. Nous pouvons corriger les erreurs de prix et annuler les commandes concernées, avec remboursement intégral.",
        },
        {
          heading: "Ordonnances",
          body: "Vous êtes responsable de l’exactitude de toute ordonnance téléversée. Nous vérifions par rapport à des plages habituelles mais ne pouvons détecter les fautes de frappe. Utilisez toujours une ordonnance en cours de validité (moins de 12 mois pour les adultes, 6 mois pour les enfants).",
        },
        {
          heading: "Propriété intellectuelle",
          body: "Tout le contenu du site — designs de monture, photographies, textes, code — appartient à loollook et ne peut être reproduit sans accord écrit.",
        },
        {
          heading: "Responsabilité",
          body: "La responsabilité totale de loollook pour toute commande est plafonnée à la valeur de la commande. Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs.",
        },
        {
          heading: "Loi applicable",
          body: "Ces conditions sont régies par les lois de l’État de Californie. Les litiges sont soumis à un arbitrage contraignant à San Francisco, sauf interdiction par votre droit local de la consommation.",
        },
      ],
    },
    de: {
      eyebrow: "Rechtliches",
      title: "AGB",
      intro:
        "Mit der Nutzung von loollook.com oder einem Kauf bei uns stimmst du den folgenden Bedingungen zu. Unten in klarer Sprache — den vollständigen rechtlichen Text stellen wir auf Anfrage bereit.",
      sections: [
        {
          heading: "Dein Konto",
          body: "Du bist dafür verantwortlich, dein Passwort sicher aufzubewahren, sowie für alle Aktivitäten, die unter deinem Konto stattfinden. Informiere uns unverzüglich, wenn du unbefugten Zugriff vermutest.",
        },
        {
          heading: "Bestellungen & Preise",
          body: "Alle Preise verstehen sich, sofern nicht anders angegeben, in USD und enthalten passende Gläser, jedoch keine regionalen Verkaufssteuern. Wir können Preisfehler korrigieren und davon betroffene Bestellungen stornieren — gegen vollständige Rückerstattung.",
        },
        {
          heading: "Rezepte",
          body: "Du bist für die Richtigkeit jedes hochgeladenen Rezepts verantwortlich. Wir prüfen gegen übliche Wertebereiche, können aber Tippfehler nicht erkennen. Verwende stets ein aktuelles Rezept (unter 12 Monaten bei Erwachsenen, 6 Monaten bei Kindern).",
        },
        {
          heading: "Geistiges Eigentum",
          body: "Sämtliche Inhalte der Website — Fassungsdesigns, Fotografie, Texte, Code — sind Eigentum von loollook und dürfen ohne schriftliche Zustimmung nicht reproduziert werden.",
        },
        {
          heading: "Haftung",
          body: "Die Gesamthaftung von loollook für jede Bestellung ist auf den Wert der Bestellung begrenzt. Wir haften nicht für mittelbare Schäden, Begleit- oder Folgeschäden.",
        },
        {
          heading: "Anwendbares Recht",
          body: "Diese Bedingungen unterliegen den Gesetzen des US-Bundesstaats Kalifornien. Streitigkeiten werden in San Francisco einem verbindlichen Schiedsverfahren unterzogen, sofern nicht durch dein örtliches Verbraucherschutzrecht untersagt.",
        },
      ],
    },
    it: {
      eyebrow: "Legale",
      title: "Termini e condizioni",
      intro:
        "Utilizzando loollook.com o acquistando da noi, accetti quanto segue. Di seguito una versione in linguaggio semplice — il testo legale completo è disponibile su richiesta.",
      sections: [
        {
          heading: "Il tuo account",
          body: "Sei responsabile della custodia della tua password e di qualsiasi attività effettuata con il tuo account. Avvisaci immediatamente se sospetti un accesso non autorizzato.",
        },
        {
          heading: "Ordini e prezzi",
          body: "Salvo diversa indicazione, tutti i prezzi sono in USD e includono le lenti applicabili ma escludono l’imposta sulle vendite regionale. Possiamo correggere errori di prezzo e annullare gli ordini interessati, con rimborso completo.",
        },
        {
          heading: "Ricette",
          body: "Sei responsabile dell’accuratezza di qualsiasi ricetta che carichi. Verifichiamo i valori rispetto agli intervalli comuni ma non possiamo individuare errori di battitura. Usa sempre una ricetta aggiornata (entro 12 mesi per gli adulti, entro 6 mesi per i bambini).",
        },
        {
          heading: "Proprietà intellettuale",
          body: "Tutti i contenuti del sito — design delle montature, fotografie, testi, codice — sono di proprietà di loollook e non possono essere riprodotti senza consenso scritto.",
        },
        {
          heading: "Responsabilità",
          body: "La responsabilità complessiva di loollook per ogni ordine è limitata al valore dell’ordine stesso. Non siamo responsabili per danni indiretti, incidentali o consequenziali.",
        },
        {
          heading: "Legge applicabile",
          body: "I presenti termini sono regolati dalle leggi dello Stato della California. Le controversie sono soggette ad arbitrato vincolante a San Francisco, salvo dove vietato dalla normativa locale a tutela dei consumatori.",
        },
      ],
    },
    pt: {
      eyebrow: "Legal",
      title: "Termos e condições",
      intro:
        "Ao utilizar o loollook.com ou comprar conosco, você concorda com o que segue. Abaixo está a versão em linguagem simples — o texto legal completo pode ser solicitado.",
      sections: [
        {
          heading: "Sua conta",
          body: "Você é responsável por manter sua senha segura e por qualquer atividade realizada em sua conta. Avise-nos imediatamente se suspeitar de acesso não autorizado.",
        },
        {
          heading: "Pedidos e preços",
          body: "Todos os preços estão em USD, salvo indicação contrária, e incluem as lentes aplicáveis, mas excluem impostos sobre vendas regionais. Podemos corrigir erros de precificação e cancelar pedidos afetados, com reembolso integral.",
        },
        {
          heading: "Receitas",
          body: "Você é responsável pela precisão de qualquer receita que enviar. Verificamos contra faixas comuns, mas não conseguimos identificar erros de digitação. Use sempre uma receita atualizada (menos de 12 meses para adultos, 6 meses para crianças).",
        },
        {
          heading: "Propriedade intelectual",
          body: "Todo o conteúdo do site — desenhos de armação, fotografia, textos, código — é de propriedade da loollook e não pode ser reproduzido sem consentimento por escrito.",
        },
        {
          heading: "Responsabilidade",
          body: "A responsabilidade total da loollook por qualquer pedido limita-se ao valor desse pedido. Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais.",
        },
        {
          heading: "Lei aplicável",
          body: "Estes termos são regidos pelas leis do Estado da Califórnia. As controvérsias serão submetidas à arbitragem vinculante em San Francisco, exceto quando proibido pela legislação local de defesa do consumidor.",
        },
      ],
    },
    ja: {
      eyebrow: "法的事項",
      title: "利用規約",
      intro:
        "loollook.com をご利用いただく、または当社から商品をご購入いただくことで、以下の規約に同意したものとみなされます。下記はわかりやすい言葉によるものです。完全な法的文書はご請求に応じてご提供します。",
      sections: [
        {
          heading: "アカウント",
          body: "パスワードの安全な管理、およびアカウント下でのすべての活動について、お客様に責任があります。不正アクセスが疑われる場合は、直ちに当社までご連絡ください。",
        },
        {
          heading: "注文と価格",
          body: "特に明記のない限り、すべての価格は USD 表示で、該当するレンズを含みますが、地域の売上税は含まれません。価格に誤りがあった場合は、当社が修正し、影響を受けた注文をキャンセルのうえ全額返金する場合があります。",
        },
        {
          heading: "処方箋",
          body: "アップロードされた処方箋の正確性については、お客様に責任があります。当社は一般的な範囲との照合を行いますが、入力ミスを検出することはできません。常に有効な処方箋（成人は 12 か月以内、お子様は 6 か月以内）をご使用ください。",
        },
        {
          heading: "知的財産",
          body: "サイト上のすべてのコンテンツ（フレームデザイン、写真、コピー、コード）は loollook に帰属し、書面による同意なしに複製することはできません。",
        },
        {
          heading: "責任",
          body: "loollook のあらゆるご注文に対する責任の総額は、当該注文の金額を上限とします。間接的、付随的、または結果的損害について当社は責任を負いません。",
        },
        {
          heading: "準拠法",
          body: "本規約は米国カリフォルニア州法に準拠します。お住まいの地域の消費者保護法により禁止されていない限り、紛争はサンフランシスコにおける拘束力のある仲裁により解決します。",
        },
      ],
    },
    ko: {
      eyebrow: "법적 고지",
      title: "이용약관",
      intro:
        "loollook.com을 이용하거나 당사로부터 제품을 구매하시는 것은 아래 약관에 동의하는 것으로 간주됩니다. 아래는 쉬운 언어로 정리한 요약본이며, 전체 법률 원문은 요청 시 제공됩니다.",
      sections: [
        {
          heading: "계정",
          body: "귀하는 비밀번호의 안전 보관 및 계정으로 발생하는 모든 활동에 대해 책임이 있습니다. 무단 접근이 의심되는 경우 즉시 당사에 알려 주시기 바랍니다.",
        },
        {
          heading: "주문 및 가격",
          body: "별도로 명시되지 않는 한 모든 가격은 USD 기준이며, 해당 렌즈가 포함되지만 지역 판매세는 제외됩니다. 가격 오류가 발생한 경우 당사는 이를 수정하고 영향을 받은 주문을 취소한 뒤 전액 환불할 수 있습니다.",
        },
        {
          heading: "처방전",
          body: "귀하는 업로드한 처방전의 정확성에 대해 책임이 있습니다. 당사는 일반 범위와 대조해 검증하지만 오탈자는 감지할 수 없습니다. 항상 최신 처방전을 사용하시기 바랍니다(성인은 12개월 이내, 어린이는 6개월 이내).",
        },
        {
          heading: "지식재산",
          body: "프레임 디자인, 사진, 카피, 코드 등 사이트의 모든 콘텐츠는 loollook의 소유이며, 서면 동의 없이 복제할 수 없습니다.",
        },
        {
          heading: "책임",
          body: "어떠한 주문에 대해서도 loollook의 총 책임은 해당 주문 금액으로 제한됩니다. 당사는 간접적, 부수적 또는 결과적 손해에 대해 책임지지 않습니다.",
        },
        {
          heading: "준거법",
          body: "본 약관은 미국 캘리포니아주 법률의 적용을 받습니다. 분쟁은 귀하의 현지 소비자 보호법에서 금지하지 않는 한, 샌프란시스코에서 구속력 있는 중재를 통해 해결됩니다.",
        },
      ],
    },
    ar: {
      eyebrow: "قانوني",
      title: "الشروط والأحكام",
      intro:
        "باستخدامك loollook.com أو الشراء منا، فإنك توافق على ما يلي. النسخة بلغة مبسّطة أدناه — والنص القانوني الكامل متاح عند الطلب.",
      sections: [
        {
          heading: "حسابك",
          body: "أنت مسؤول عن الحفاظ على سرية كلمة المرور وعن أي نشاط يجري ضمن حسابك. أخبرنا فور أن تشتبه في وصول غير مصرَّح به.",
        },
        {
          heading: "الطلبات والأسعار",
          body: "جميع الأسعار بالدولار الأمريكي ما لم يُذكر خلاف ذلك، وتشمل العدسات المنطبقة لكنها لا تشمل ضريبة المبيعات الإقليمية. يحقّ لنا تصحيح أخطاء التسعير وإلغاء الطلبات المتأثّرة بها مع ردّ كامل المبلغ.",
        },
        {
          heading: "الوصفات الطبية",
          body: "أنت مسؤول عن دقّة أي وصفة طبية ترفعها. نتحقّق من تطابقها مع النطاقات الشائعة لكننا لا نستطيع كشف الأخطاء الإملائية. استخدم دائمًا وصفة حديثة (أقل من 12 شهرًا للبالغين، و6 أشهر للأطفال).",
        },
        {
          heading: "الملكية الفكرية",
          body: "جميع محتويات الموقع — تصاميم الإطارات، والتصوير الفوتوغرافي، والنصوص، والكود — مملوكة لـ loollook ولا يجوز إعادة إنتاجها دون موافقة خطية.",
        },
        {
          heading: "المسؤولية",
          body: "تقتصر المسؤولية الإجمالية لـ loollook عن أي طلب على قيمة ذلك الطلب. ولا نتحمّل أي مسؤولية عن أضرار غير مباشرة أو عرضية أو تبعية.",
        },
        {
          heading: "القانون المعمول به",
          body: "تخضع هذه الشروط لقوانين ولاية California. وتُحال النزاعات إلى تحكيم مُلزِم في San Francisco، ما لم يحظر ذلك قانون حماية المستهلك المحلي لديك.",
        },
      ],
    },
    vi: {
      eyebrow: "Pháp lý",
      title: "Điều khoản & điều kiện",
      intro:
        "Bằng việc sử dụng loollook.com hoặc mua hàng từ chúng tôi, bạn đồng ý với các điều sau. Phiên bản ngôn ngữ dễ hiểu bên dưới — văn bản pháp lý đầy đủ có sẵn theo yêu cầu.",
      sections: [
        {
          heading: "Tài khoản của bạn",
          body: "Bạn chịu trách nhiệm giữ an toàn mật khẩu và mọi hoạt động dưới tài khoản của bạn. Hãy báo cho chúng tôi ngay nếu nghi ngờ có truy cập trái phép.",
        },
        {
          heading: "Đơn hàng & giá",
          body: "Tất cả giá được tính bằng USD trừ khi có ghi chú khác, bao gồm tròng kính áp dụng nhưng không bao gồm thuế bán hàng vùng. Chúng tôi có thể chỉnh sửa lỗi giá và hủy các đơn bị ảnh hưởng, kèm hoàn tiền đầy đủ.",
        },
        {
          heading: "Đơn thuốc",
          body: "Bạn chịu trách nhiệm về độ chính xác của bất kỳ đơn thuốc nào bạn tải lên. Chúng tôi xác minh dựa trên các phạm vi phổ biến nhưng không thể phát hiện lỗi đánh máy. Luôn dùng đơn thuốc còn hiệu lực (dưới 12 tháng cho người lớn, 6 tháng cho trẻ em).",
        },
        {
          heading: "Sở hữu trí tuệ",
          body: "Toàn bộ nội dung trang — thiết kế gọng, ảnh, văn bản, mã — đều thuộc sở hữu của loollook và không được sao chép nếu không có sự đồng ý bằng văn bản.",
        },
        {
          heading: "Trách nhiệm",
          body: "Tổng trách nhiệm của loollook đối với bất kỳ đơn hàng nào được giới hạn ở giá trị của đơn hàng. Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả.",
        },
        {
          heading: "Luật áp dụng",
          body: "Các điều khoản này chịu sự điều chỉnh của luật pháp Bang California. Tranh chấp sẽ đưa ra trọng tài bắt buộc tại San Francisco trừ khi bị luật bảo vệ người tiêu dùng địa phương của bạn cấm.",
        },
      ],
    },
    th: {
      eyebrow: "ข้อกฎหมาย",
      title: "ข้อกำหนดและเงื่อนไข",
      intro:
        "การใช้ loollook.com หรือซื้อสินค้าจากเราถือว่าคุณยอมรับเงื่อนไขต่อไปนี้ ฉบับภาษาเข้าใจง่ายอยู่ด้านล่าง — ฉบับกฎหมายฉบับเต็มมีให้เมื่อร้องขอ",
      sections: [
        {
          heading: "บัญชีของคุณ",
          body: "คุณรับผิดชอบในการรักษารหัสผ่านให้ปลอดภัยและกิจกรรมใด ๆ ภายใต้บัญชีของคุณ แจ้งเราทันทีหากสงสัยว่ามีการเข้าถึงโดยไม่ได้รับอนุญาต",
        },
        {
          heading: "คำสั่งซื้อและราคา",
          body: "ราคาทั้งหมดเป็น USD เว้นแต่จะระบุไว้เป็นอย่างอื่น และรวมเลนส์ที่เกี่ยวข้องแต่ไม่รวมภาษีขายในพื้นที่ เราอาจแก้ไขข้อผิดพลาดด้านราคาและยกเลิกคำสั่งซื้อที่ได้รับผลกระทบ พร้อมคืนเงินเต็มจำนวน",
        },
        {
          heading: "ใบสั่งยา",
          body: "คุณรับผิดชอบต่อความถูกต้องของใบสั่งยาที่คุณอัปโหลด เราตรวจสอบเทียบกับช่วงทั่วไปแต่ไม่สามารถตรวจจับข้อผิดพลาดการพิมพ์ได้ ใช้ใบสั่งยาปัจจุบันเสมอ (น้อยกว่า 12 เดือนสำหรับผู้ใหญ่ 6 เดือนสำหรับเด็ก)",
        },
        {
          heading: "ทรัพย์สินทางปัญญา",
          body: "เนื้อหาทั้งหมดบนเว็บไซต์ — การออกแบบกรอบ การถ่ายภาพ ข้อความ โค้ด — เป็นของ loollook และไม่สามารถทำซ้ำได้โดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษร",
        },
        {
          heading: "ความรับผิด",
          body: "ความรับผิดทั้งหมดของ loollook สำหรับคำสั่งซื้อใด ๆ จำกัดที่มูลค่าของคำสั่งซื้อ เราไม่รับผิดชอบสำหรับความเสียหายทางอ้อม โดยบังเอิญ หรือสืบเนื่อง",
        },
        {
          heading: "กฎหมายที่ใช้บังคับ",
          body: "เงื่อนไขเหล่านี้อยู่ภายใต้กฎหมายของรัฐ California การโต้แย้งจะส่งไปที่อนุญาโตตุลาการที่ผูกพันใน San Francisco เว้นแต่จะถูกห้ามโดยกฎหมายคุ้มครองผู้บริโภคในท้องถิ่นของคุณ",
        },
      ],
    },
    id: {
      eyebrow: "Legal",
      title: "Syarat dan ketentuan",
      intro:
        "Dengan menggunakan loollook.com atau membeli dari kami, Anda menyetujui hal-hal berikut. Versi bahasa sederhana di bawah ini — teks hukum lengkap tersedia atas permintaan.",
      sections: [
        {
          heading: "Akun Anda",
          body: "Anda bertanggung jawab menjaga keamanan kata sandi dan setiap aktivitas di bawah akun Anda. Beri tahu kami segera jika Anda mencurigai akses yang tidak sah.",
        },
        {
          heading: "Pesanan & harga",
          body: "Semua harga dalam USD kecuali dinyatakan lain dan termasuk lensa yang berlaku tetapi tidak termasuk pajak penjualan regional. Kami dapat memperbaiki kesalahan harga dan membatalkan pesanan yang terpengaruh, dengan pengembalian dana penuh.",
        },
        {
          heading: "Resep",
          body: "Anda bertanggung jawab atas keakuratan resep yang Anda unggah. Kami memverifikasi terhadap rentang umum tetapi tidak dapat mendeteksi salah ketik. Selalu gunakan resep yang masih berlaku (di bawah 12 bulan untuk dewasa, 6 bulan untuk anak-anak).",
        },
        {
          heading: "Kekayaan intelektual",
          body: "Semua konten situs — desain bingkai, fotografi, salinan, kode — adalah milik loollook dan tidak dapat direproduksi tanpa persetujuan tertulis.",
        },
        {
          heading: "Tanggung jawab",
          body: "Tanggung jawab total loollook untuk pesanan apa pun dibatasi pada nilai pesanan tersebut. Kami tidak bertanggung jawab atas kerusakan tidak langsung, insidental, atau konsekuensial.",
        },
        {
          heading: "Hukum yang berlaku",
          body: "Ketentuan ini diatur oleh hukum Negara Bagian California. Perselisihan diajukan ke arbitrase mengikat di San Francisco kecuali dilarang oleh hukum perlindungan konsumen lokal Anda.",
        },
      ],
    },
    ms: {
      eyebrow: "Undang-undang",
      title: "Terma & syarat",
      intro:
        "Dengan menggunakan loollook.com atau membeli daripada kami, anda bersetuju dengan yang berikut. Versi bahasa biasa di bawah — teks undang-undang penuh tersedia atas permintaan.",
      sections: [
        {
          heading: "Akaun anda",
          body: "Anda bertanggungjawab menjaga kata laluan anda selamat dan sebarang aktiviti di bawah akaun anda. Beritahu kami dengan segera jika anda mengesyaki akses tanpa kebenaran.",
        },
        {
          heading: "Pesanan & harga",
          body: "Semua harga dalam USD melainkan dinyatakan sebaliknya dan termasuk kanta yang berkenaan tetapi tidak termasuk cukai jualan serantau. Kami boleh membetulkan kesilapan harga dan membatalkan pesanan yang terjejas, dengan bayaran balik penuh.",
        },
        {
          heading: "Preskripsi",
          body: "Anda bertanggungjawab atas ketepatan mana-mana preskripsi yang anda muat naik. Kami mengesahkan terhadap julat biasa tetapi tidak boleh mengesan kesilapan menaip. Sentiasa gunakan preskripsi semasa (kurang daripada 12 bulan untuk dewasa, 6 bulan untuk kanak-kanak).",
        },
        {
          heading: "Harta intelek",
          body: "Semua kandungan tapak — reka bentuk bingkai, fotografi, salinan, kod — dimiliki oleh loollook dan tidak boleh diterbitkan semula tanpa persetujuan bertulis.",
        },
        {
          heading: "Liabiliti",
          body: "Jumlah liabiliti loollook untuk mana-mana pesanan dihadkan kepada nilai pesanan tersebut. Kami tidak bertanggungjawab atas kerosakan tidak langsung, sampingan atau berbangkit.",
        },
        {
          heading: "Undang-undang yang mengawal",
          body: "Terma ini ditadbir oleh undang-undang Negeri California. Pertikaian dirujuk kepada timbang tara mengikat di San Francisco melainkan dilarang oleh undang-undang perlindungan pengguna tempatan anda.",
        },
      ],
    },
  },
  cookies: {
    en: {
      eyebrow: "Legal",
      title: "Cookie & tracking preferences",
      intro:
        "We use a minimal set of cookies to make loollook.com work, plus optional analytics and marketing cookies you can control here.",
      sections: [
        {
          heading: "Strictly necessary",
          body: "Cookies that keep you signed in, remember your cart, and process checkout. These can’t be turned off — without them the site doesn’t function.",
        },
        {
          heading: "Analytics",
          body: "Aggregate, anonymized data so we can see which pages help shoppers and which confuse them. We use Plausible (privacy-first, no cross-site tracking).",
        },
        {
          heading: "Marketing",
          body: "Used only if you opt in. Helps us show you relevant ads on Instagram, Google, and Pinterest. Disable anytime in this panel or via your browser.",
        },
        {
          heading: "Do not sell my data",
          body: "Per CCPA, you can opt out of any sharing of your data for cross-context behavioral advertising by emailing privacy@loollook.com — no account required.",
        },
      ],
    },
    zh: {
      eyebrow: "法律",
      title: "Cookie 与跟踪偏好",
      intro:
        "我们使用极少量必要 Cookie 来确保 loollook.com 运作，以及可选的分析与营销 Cookie——你可以在此控制。",
      sections: [
        {
          heading: "必要 Cookie",
          body: "维持登录状态、记住购物车、完成结账所必需的 Cookie。无法关闭——一旦关闭网站将无法运作。",
        },
        {
          heading: "分析",
          body: "聚合且匿名的数据，让我们了解哪些页面对购物者有帮助、哪些让人困惑。我们使用 Plausible（注重隐私，无跨站追踪）。",
        },
        {
          heading: "营销",
          body: "仅在你授权的前提下使用，帮助我们在 Instagram、Google、Pinterest 上展示相关广告。可在此面板或浏览器中随时关闭。",
        },
        {
          heading: "不要出售我的数据",
          body: "依据 CCPA，你可发送邮件至 privacy@loollook.com 退出任何用于跨场景行为广告的数据共享——无需账户。",
        },
      ],
    },
    es: {
      eyebrow: "Legal",
      title: "Preferencias de cookies y rastreo",
      intro:
        "Usamos un conjunto mínimo de cookies para que loollook.com funcione, además de cookies opcionales de analítica y marketing que puedes controlar aquí.",
      sections: [
        {
          heading: "Estrictamente necesarias",
          body: "Cookies que te mantienen con la sesión iniciada, recuerdan tu carrito y procesan el pago. No se pueden desactivar: sin ellas el sitio no funciona.",
        },
        {
          heading: "Analítica",
          body: "Datos agregados y anonimizados para que veamos qué páginas ayudan a los compradores y cuáles los confunden. Usamos Plausible (privacy-first, sin rastreo entre sitios).",
        },
        {
          heading: "Marketing",
          body: "Solo se usan si das tu consentimiento. Nos ayudan a mostrarte anuncios relevantes en Instagram, Google y Pinterest. Desactívalas cuando quieras en este panel o desde tu navegador.",
        },
        {
          heading: "No vender mis datos",
          body: "Conforme a la CCPA, puedes oponerte a cualquier intercambio de tus datos con fines de publicidad conductual entre contextos escribiendo a privacy@loollook.com; no se requiere cuenta.",
        },
      ],
    },
    fr: {
      eyebrow: "Mentions légales",
      title: "Préférences cookies & suivi",
      intro:
        "Nous utilisons un ensemble minimal de cookies pour faire fonctionner loollook.com, plus des cookies d’analyse et de marketing optionnels que vous pouvez contrôler ici.",
      sections: [
        {
          heading: "Strictement nécessaires",
          body: "Cookies qui vous gardent connecté, mémorisent votre panier et traitent le paiement. Ils ne peuvent pas être désactivés — sans eux, le site ne fonctionne pas.",
        },
        {
          heading: "Analyse",
          body: "Données agrégées et anonymisées pour savoir quelles pages aident les acheteurs et lesquelles les perdent. Nous utilisons Plausible (axé sur la vie privée, sans suivi inter-sites).",
        },
        {
          heading: "Marketing",
          body: "Utilisés uniquement si vous y consentez. Nous aident à vous montrer des publicités pertinentes sur Instagram, Google et Pinterest. Désactivables à tout moment depuis ce panneau ou via votre navigateur.",
        },
        {
          heading: "Ne pas vendre mes données",
          body: "Conformément au CCPA, vous pouvez refuser tout partage de vos données à des fins publicitaires comportementales inter-contextes en écrivant à privacy@loollook.com — aucun compte requis.",
        },
      ],
    },
    de: {
      eyebrow: "Rechtliches",
      title: "Cookies & Tracking-Einstellungen",
      intro:
        "Wir verwenden ein Minimum an Cookies, damit loollook.com funktioniert, dazu optionale Analyse- und Marketing-Cookies, die du hier steuern kannst.",
      sections: [
        {
          heading: "Unbedingt erforderlich",
          body: "Cookies, die dich angemeldet halten, deinen Warenkorb merken und die Kasse abwickeln. Sie lassen sich nicht abschalten — ohne sie funktioniert die Website nicht.",
        },
        {
          heading: "Analyse",
          body: "Aggregierte, anonymisierte Daten, damit wir sehen, welche Seiten Kundinnen und Kunden helfen und welche verwirren. Wir nutzen Plausible (datenschutzfreundlich, kein seitenübergreifendes Tracking).",
        },
        {
          heading: "Marketing",
          body: "Wird nur eingesetzt, wenn du zustimmst. Hilft uns, dir relevante Anzeigen auf Instagram, Google und Pinterest zu zeigen. Du kannst sie jederzeit in diesem Panel oder über deinen Browser deaktivieren.",
        },
        {
          heading: "Meine Daten nicht verkaufen",
          body: "Gemäß CCPA kannst du jeder Weitergabe deiner Daten für kontextübergreifende verhaltensbasierte Werbung widersprechen, indem du eine E-Mail an privacy@loollook.com schickst — ohne Konto.",
        },
      ],
    },
    it: {
      eyebrow: "Legale",
      title: "Preferenze cookie e tracciamento",
      intro:
        "Utilizziamo un set minimo di cookie per far funzionare loollook.com, oltre a cookie facoltativi di analitica e marketing che puoi controllare da qui.",
      sections: [
        {
          heading: "Strettamente necessari",
          body: "Cookie che ti mantengono autenticato, memorizzano il tuo carrello ed elaborano il checkout. Non possono essere disattivati — senza di essi il sito non funziona.",
        },
        {
          heading: "Analitica",
          body: "Dati aggregati e anonimizzati che ci permettono di capire quali pagine aiutano chi acquista e quali generano confusione. Usiamo Plausible (orientato alla privacy, nessun tracciamento cross-site).",
        },
        {
          heading: "Marketing",
          body: "Utilizzati solo se dai il consenso. Ci aiutano a mostrarti annunci pertinenti su Instagram, Google e Pinterest. Puoi disattivarli in qualsiasi momento da questo pannello o tramite il tuo browser.",
        },
        {
          heading: "Non vendere i miei dati",
          body: "In conformità con il CCPA, puoi rinunciare a qualsiasi condivisione dei tuoi dati per pubblicità comportamentale cross-context scrivendo a privacy@loollook.com — non è richiesto un account.",
        },
      ],
    },
    pt: {
      eyebrow: "Legal",
      title: "Preferências de cookies e rastreamento",
      intro:
        "Usamos um conjunto mínimo de cookies para fazer o loollook.com funcionar, além de cookies opcionais de análise e marketing que você pode controlar aqui.",
      sections: [
        {
          heading: "Estritamente necessários",
          body: "Cookies que mantêm você conectado, lembram seu carrinho e processam o checkout. Não podem ser desativados — sem eles o site não funciona.",
        },
        {
          heading: "Análise",
          body: "Dados agregados e anônimos para vermos quais páginas ajudam quem está comprando e quais confundem. Usamos o Plausible (privacidade em primeiro lugar, sem rastreamento entre sites).",
        },
        {
          heading: "Marketing",
          body: "Usados apenas se você autorizar. Ajudam-nos a mostrar anúncios relevantes no Instagram, Google e Pinterest. Desative a qualquer momento neste painel ou pelo navegador.",
        },
        {
          heading: "Não vender meus dados",
          body: "Conforme a CCPA, você pode optar por não permitir o compartilhamento dos seus dados para publicidade comportamental entre contextos enviando um e-mail para privacy@loollook.com — sem necessidade de conta.",
        },
      ],
    },
    ja: {
      eyebrow: "法的事項",
      title: "Cookie とトラッキング設定",
      intro:
        "loollook.com を機能させるために必要最小限の Cookie を使用しており、加えて、こちらで管理いただける任意の分析・マーケティング Cookie を提供しています。",
      sections: [
        {
          heading: "必須",
          body: "ログイン状態の保持、カートの記憶、チェックアウト処理に使用される Cookie です。これらを無効にすることはできません。これらがないとサイトは機能しません。",
        },
        {
          heading: "分析",
          body: "どのページが買い物のお役に立ち、どのページが混乱を招いているかを把握するための、集約・匿名化されたデータです。プライバシー重視・クロスサイトトラッキングなしの Plausible を使用しています。",
        },
        {
          heading: "マーケティング",
          body: "オプトインされた場合のみ使用されます。Instagram、Google、Pinterest 上で関連する広告を表示するために役立ちます。このパネルまたはブラウザからいつでも無効にできます。",
        },
        {
          heading: "私のデータを販売しないで",
          body: "CCPA に基づき、privacy@loollook.com までメールでご連絡いただくことで、クロスコンテキスト行動広告のためのデータ共有をオプトアウトできます。アカウントは不要です。",
        },
      ],
    },
    ko: {
      eyebrow: "법적 고지",
      title: "쿠키 및 추적 설정",
      intro:
        "당사는 loollook.com이 정상적으로 작동하도록 하는 최소한의 쿠키와, 귀하가 이 페이지에서 제어할 수 있는 선택적 분석·마케팅 쿠키를 사용합니다.",
      sections: [
        {
          heading: "필수",
          body: "로그인 상태 유지, 장바구니 기억, 결제 처리에 사용되는 쿠키입니다. 이 쿠키는 비활성화할 수 없으며, 없을 경우 사이트가 정상적으로 작동하지 않습니다.",
        },
        {
          heading: "분석",
          body: "어떤 페이지가 쇼핑객에게 도움이 되는지, 어떤 페이지가 혼란을 주는지 파악하기 위한 집계·익명화된 데이터입니다. 당사는 프라이버시를 우선하고 교차 사이트 추적이 없는 Plausible을 사용합니다.",
        },
        {
          heading: "마케팅",
          body: "동의하신 경우에만 사용됩니다. Instagram, Google, Pinterest에서 관련성 높은 광고를 보여드리는 데 도움이 됩니다. 이 패널이나 브라우저에서 언제든 비활성화할 수 있습니다.",
        },
        {
          heading: "내 데이터 판매 금지",
          body: "CCPA에 따라, privacy@loollook.com으로 이메일을 보내 교차 맥락 행동 광고를 위한 데이터 공유를 거부하실 수 있습니다 — 계정 없이도 가능합니다.",
        },
      ],
    },
    ar: {
      eyebrow: "قانوني",
      title: "تفضيلات ملفات تعريف الارتباط",
      intro:
        "نستخدم الحد الأدنى من ملفات تعريف الارتباط لجعل loollook.com يعمل، إضافةً إلى ملفات تحليل وتسويق اختيارية يمكنك التحكّم بها من هنا.",
      sections: [
        {
          heading: "ضرورية تمامًا",
          body: "ملفات تعريف الارتباط التي تُبقيك مسجَّلًا للدخول، وتتذكّر سلّة التسوّق، وتعالج عملية الدفع. لا يمكن تعطيلها — فبدونها لا يعمل الموقع.",
        },
        {
          heading: "التحليلات",
          body: "بيانات مجمَّعة ومجهولة الهوية تتيح لنا معرفة الصفحات التي تساعد المتسوّقين وتلك التي تُربكهم. نستخدم Plausible (يعطي الأولوية للخصوصية، بدون تتبّع عبر المواقع).",
        },
        {
          heading: "التسويق",
          body: "تُستخدم فقط في حال موافقتك. تساعدنا على عرض إعلانات ذات صلة على Instagram وGoogle وPinterest. عطّلها متى شئت من هذه اللوحة أو من متصفّحك.",
        },
        {
          heading: "عدم بيع بياناتي",
          body: "وفقًا لـ CCPA، يمكنك الانسحاب من أي مشاركة لبياناتك لأغراض الإعلانات السلوكية عبر السياقات بمراسلتنا على privacy@loollook.com — دون الحاجة إلى حساب.",
        },
      ],
    },
    vi: {
      eyebrow: "Pháp lý",
      title: "Cookie & tùy chọn theo dõi",
      intro:
        "Chúng tôi dùng một bộ cookie tối thiểu để loollook.com hoạt động, cùng các cookie phân tích và tiếp thị tùy chọn mà bạn có thể kiểm soát ở đây.",
      sections: [
        {
          heading: "Cần thiết tuyệt đối",
          body: "Cookie giúp bạn duy trì đăng nhập, ghi nhớ giỏ hàng và xử lý thanh toán. Không thể tắt — không có chúng trang web không hoạt động.",
        },
        {
          heading: "Phân tích",
          body: "Dữ liệu tổng hợp, ẩn danh để chúng tôi thấy trang nào giúp ích cho người mua và trang nào gây nhầm lẫn. Chúng tôi dùng Plausible (ưu tiên quyền riêng tư, không theo dõi xuyên trang).",
        },
        {
          heading: "Tiếp thị",
          body: "Chỉ dùng khi bạn đồng ý. Giúp chúng tôi hiển thị quảng cáo phù hợp trên Instagram, Google và Pinterest. Tắt bất cứ lúc nào trong bảng này hoặc qua trình duyệt.",
        },
        {
          heading: "Không bán dữ liệu của tôi",
          body: "Theo CCPA, bạn có thể chọn không tham gia bất kỳ chia sẻ dữ liệu nào của bạn cho quảng cáo hành vi liên ngữ cảnh bằng cách gửi email tới privacy@loollook.com — không cần tài khoản.",
        },
      ],
    },
    th: {
      eyebrow: "ข้อกฎหมาย",
      title: "การตั้งค่าคุกกี้และการติดตาม",
      intro:
        "เราใช้คุกกี้ขั้นต่ำที่จำเป็นเพื่อให้ loollook.com ทำงาน พร้อมคุกกี้วิเคราะห์และการตลาดเสริมที่คุณสามารถควบคุมได้ที่นี่",
      sections: [
        {
          heading: "จำเป็นอย่างยิ่ง",
          body: "คุกกี้ที่ทำให้คุณเข้าสู่ระบบอยู่ จดจำตะกร้าสินค้า และดำเนินการชำระเงิน ไม่สามารถปิดได้ — เว็บไซต์จะไม่ทำงานหากไม่มีคุกกี้เหล่านี้",
        },
        {
          heading: "การวิเคราะห์",
          body: "ข้อมูลรวมที่ไม่ระบุตัวตน เพื่อให้เราเห็นว่าหน้าใดช่วยผู้ซื้อและหน้าใดทำให้สับสน เราใช้ Plausible (เน้นความเป็นส่วนตัว ไม่ติดตามข้ามไซต์)",
        },
        {
          heading: "การตลาด",
          body: "ใช้เฉพาะเมื่อคุณยินยอม ช่วยให้เราแสดงโฆษณาที่เกี่ยวข้องบน Instagram, Google และ Pinterest ปิดได้ทุกเมื่อจากแผงนี้หรือผ่านเบราว์เซอร์",
        },
        {
          heading: "ไม่ขายข้อมูลของฉัน",
          body: "ตาม CCPA คุณสามารถเลือกที่จะไม่แบ่งปันข้อมูลของคุณสำหรับโฆษณาเชิงพฤติกรรมข้ามบริบทใด ๆ โดยส่งอีเมลถึง privacy@loollook.com — ไม่จำเป็นต้องมีบัญชี",
        },
      ],
    },
    id: {
      eyebrow: "Legal",
      title: "Preferensi cookie & pelacakan",
      intro:
        "Kami menggunakan kumpulan cookie minimal agar loollook.com berfungsi, ditambah cookie analitik dan pemasaran opsional yang dapat Anda kontrol di sini.",
      sections: [
        {
          heading: "Sangat diperlukan",
          body: "Cookie yang menjaga Anda tetap masuk, mengingat keranjang Anda, dan memproses checkout. Tidak dapat dimatikan — tanpa cookie ini situs tidak berfungsi.",
        },
        {
          heading: "Analitik",
          body: "Data agregat dan anonim sehingga kami dapat melihat halaman mana yang membantu pembeli dan mana yang membingungkan. Kami menggunakan Plausible (mengutamakan privasi, tanpa pelacakan lintas situs).",
        },
        {
          heading: "Pemasaran",
          body: "Digunakan hanya jika Anda menyetujuinya. Membantu kami menampilkan iklan yang relevan di Instagram, Google, dan Pinterest. Nonaktifkan kapan saja di panel ini atau melalui peramban Anda.",
        },
        {
          heading: "Jangan jual data saya",
          body: "Sesuai CCPA, Anda dapat memilih untuk tidak berbagi data Anda untuk iklan perilaku lintas konteks dengan mengirim email ke privacy@loollook.com — tanpa perlu akun.",
        },
      ],
    },
    ms: {
      eyebrow: "Undang-undang",
      title: "Keutamaan kuki & penjejakan",
      intro:
        "Kami menggunakan set kuki yang minimum agar loollook.com berfungsi, tambahan kuki analitik dan pemasaran pilihan yang anda boleh kawal di sini.",
      sections: [
        {
          heading: "Mutlak diperlukan",
          body: "Kuki yang menjadikan anda kekal log masuk, mengingati troli anda, dan memproses pembayaran. Ia tidak boleh dimatikan — tanpa ia tapak tidak berfungsi.",
        },
        {
          heading: "Analitik",
          body: "Data agregat tanpa nama supaya kami boleh melihat halaman mana membantu pembeli dan mana yang mengelirukan. Kami menggunakan Plausible (mengutamakan privasi, tiada penjejakan merentas tapak).",
        },
        {
          heading: "Pemasaran",
          body: "Hanya digunakan jika anda bersetuju. Membantu kami menunjukkan iklan yang relevan di Instagram, Google, dan Pinterest. Nyahdayakan pada bila-bila masa dari panel ini atau melalui pelayar anda.",
        },
        {
          heading: "Jangan jual data saya",
          body: "Mengikut CCPA, anda boleh memilih untuk tidak berkongsi data anda untuk pengiklanan tingkah laku merentas konteks dengan menghantar e-mel ke privacy@loollook.com — tiada akaun diperlukan.",
        },
      ],
    },
  },
  contact: {
    en: {
      eyebrow: "Customer Care",
      title: "Contact us",
      intro:
        "We’re humans, not bots. Reach our team any of these ways — most messages get a real reply within a few hours.",
      sections: [
        {
          heading: "Live chat",
          body: "Open the chat bubble at the bottom-right of any page. Live agents are online 7 AM – 1 AM (Pacific), every day.",
        },
        {
          heading: "Email",
          body: "General questions: hello@loollook.com — we reply within 12 hours.\nPrescription help: rx@loollook.com — answered by a licensed optometrist within 24 hours.",
        },
        {
          heading: "Phone",
          body: "+1 (800) 555-0199 — free from the US and Canada. International callers, please use chat or email so we don’t run up your bill.",
        },
        {
          heading: "Hours",
          body: "7 AM – 1 AM Pacific Time, 7 days a week, including holidays. Yes, we’re open on Christmas.",
        },
      ],
    },
    zh: {
      eyebrow: "客户服务",
      title: "联系我们",
      intro:
        "我们是真人，不是机器人。通过下方任意方式联系我们——大多数留言会在数小时内得到真人回复。",
      sections: [
        {
          heading: "在线客服",
          body: "点击任意页面右下角的对话气泡。在线坐席每日 7:00–次日 1:00（太平洋时间）值守。",
        },
        {
          heading: "电子邮件",
          body: "常规咨询：hello@loollook.com，12 小时内回复。\n处方咨询：rx@loollook.com，由持证视光师在 24 小时内回复。",
        },
        {
          heading: "电话",
          body: "+1 (800) 555-0199 — 美国与加拿大免费。其他国家请使用在线客服或邮件，避免产生话费。",
        },
        {
          heading: "服务时间",
          body: "太平洋时间每日 7:00–次日 1:00，包含节假日。是的，圣诞节我们也在线。",
        },
      ],
    },
    es: {
      eyebrow: "Atención al cliente",
      title: "Contáctanos",
      intro:
        "Somos humanos, no bots. Contacta con nuestro equipo por cualquiera de estas vías: la mayoría de los mensajes reciben respuesta real en pocas horas.",
      sections: [
        {
          heading: "Chat en vivo",
          body: "Abre la burbuja de chat en la esquina inferior derecha de cualquier página. Hay agentes en directo de 7:00 a 1:00 (hora del Pacífico), todos los días.",
        },
        {
          heading: "Correo electrónico",
          body: "Consultas generales: hello@loollook.com — respondemos en 12 horas.\nAyuda con la receta: rx@loollook.com — contestada por un optometrista colegiado en 24 horas.",
        },
        {
          heading: "Teléfono",
          body: "+1 (800) 555-0199 — gratis desde EE. UU. y Canadá. Para llamadas internacionales, usa el chat o el correo para no encarecer tu factura.",
        },
        {
          heading: "Horario",
          body: "De 7:00 a 1:00 hora del Pacífico, los 7 días de la semana, festivos incluidos. Sí, abrimos el día de Navidad.",
        },
      ],
    },
    fr: {
      eyebrow: "Service client",
      title: "Nous contacter",
      intro:
        "Nous sommes des humains, pas des bots. Joignez notre équipe par l’un de ces moyens — la plupart des messages reçoivent une vraie réponse en quelques heures.",
      sections: [
        {
          heading: "Chat en direct",
          body: "Ouvrez la bulle de chat en bas à droite de n’importe quelle page. Des conseillers en direct sont disponibles tous les jours de 7h à 1h (heure du Pacifique).",
        },
        {
          heading: "E-mail",
          body: "Questions générales : hello@loollook.com — réponse sous 12 heures.\nAide ordonnance : rx@loollook.com — réponse d’un optométriste diplômé sous 24 heures.",
        },
        {
          heading: "Téléphone",
          body: "+1 (800) 555-0199 — gratuit depuis les États-Unis et le Canada. Appels internationaux : merci d’utiliser le chat ou l’e-mail pour éviter les frais.",
        },
        {
          heading: "Horaires",
          body: "7h–1h heure du Pacifique, 7 jours sur 7, jours fériés inclus. Oui, nous sommes ouverts à Noël.",
        },
      ],
    },
    de: {
      eyebrow: "Kundenservice",
      title: "Kontakt",
      intro:
        "Wir sind Menschen, keine Bots. Erreich unser Team auf jedem der folgenden Wege — die meisten Nachrichten erhalten innerhalb weniger Stunden eine echte Antwort.",
      sections: [
        {
          heading: "Live-Chat",
          body: "Öffne die Chat-Blase unten rechts auf jeder Seite. Unsere Live-Agentinnen und -Agenten sind täglich von 7:00 bis 1:00 Uhr (Pacific Time) online.",
        },
        {
          heading: "E-Mail",
          body: "Allgemeine Fragen: hello@loollook.com — wir antworten innerhalb von 12 Stunden.\nRezepthilfe: rx@loollook.com — beantwortet von einer zugelassenen Augenoptikerin innerhalb von 24 Stunden.",
        },
        {
          heading: "Telefon",
          body: "+1 (800) 555-0199 — kostenlos aus den USA und Kanada. Internationale Anrufer nutzen bitte Chat oder E-Mail, damit deine Telefonrechnung nicht belastet wird.",
        },
        {
          heading: "Öffnungszeiten",
          body: "7:00 bis 1:00 Uhr Pacific Time, 7 Tage die Woche, einschließlich Feiertage. Ja, auch an Weihnachten sind wir erreichbar.",
        },
      ],
    },
    it: {
      eyebrow: "Assistenza clienti",
      title: "Contattaci",
      intro:
        "Siamo umani, non bot. Raggiungi il nostro team in uno qualsiasi di questi modi — la maggior parte dei messaggi riceve una risposta vera in poche ore.",
      sections: [
        {
          heading: "Chat dal vivo",
          body: "Apri la bolla della chat in basso a destra di qualsiasi pagina. I nostri operatori sono online dalle 7:00 all’1:00 (ora del Pacifico), tutti i giorni.",
        },
        {
          heading: "Email",
          body: "Domande generali: hello@loollook.com — rispondiamo entro 12 ore.\nAiuto sulla ricetta: rx@loollook.com — risposta da un optometrista abilitato entro 24 ore.",
        },
        {
          heading: "Telefono",
          body: "+1 (800) 555-0199 — gratuito da Stati Uniti e Canada. Chi chiama dall’estero, per favore usa la chat o l’email per evitare costi sulla tua bolletta.",
        },
        {
          heading: "Orari",
          body: "Dalle 7:00 all’1:00 (ora del Pacifico), 7 giorni su 7, festivi inclusi. Sì, siamo aperti anche a Natale.",
        },
      ],
    },
    pt: {
      eyebrow: "Atendimento",
      title: "Fale conosco",
      intro:
        "Somos humanos, não bots. Fale com nosso time por qualquer um destes canais — a maioria das mensagens recebe uma resposta de verdade em poucas horas.",
      sections: [
        {
          heading: "Chat ao vivo",
          body: "Abra o balão de chat no canto inferior direito de qualquer página. Atendentes ao vivo ficam online das 7h às 1h (horário do Pacífico), todos os dias.",
        },
        {
          heading: "E-mail",
          body: "Dúvidas gerais: hello@loollook.com — respondemos em até 12 horas.\nAjuda com receita: rx@loollook.com — respondido por um optometrista licenciado em até 24 horas.",
        },
        {
          heading: "Telefone",
          body: "+1 (800) 555-0199 — gratuito a partir dos EUA e do Canadá. Quem liga do exterior, por favor use o chat ou e-mail para não correr conta de telefone.",
        },
        {
          heading: "Horário",
          body: "Das 7h às 1h, horário do Pacífico, 7 dias por semana, incluindo feriados. Sim, atendemos no Natal.",
        },
      ],
    },
    ja: {
      eyebrow: "カスタマーケア",
      title: "お問い合わせ",
      intro:
        "私たちは人間です、ボットではありません。下記のいずれかの方法で当社チームへご連絡ください。ほとんどのメッセージには数時間以内に人からの返信が届きます。",
      sections: [
        {
          heading: "ライブチャット",
          body: "どのページでも右下のチャットバブルを開いてください。ライブエージェントは毎日 7:00〜翌 1:00（太平洋時間）対応しています。",
        },
        {
          heading: "メール",
          body: "一般的なご質問：hello@loollook.com — 12 時間以内に返信します。\n処方に関するご相談：rx@loollook.com — 認定オプトメトリストが 24 時間以内に回答します。",
        },
        {
          heading: "電話",
          body: "+1 (800) 555-0199 — アメリカ・カナダ国内からは無料です。海外からのお客様は通話料を抑えるため、チャットまたはメールをご利用ください。",
        },
        {
          heading: "営業時間",
          body: "太平洋時間 7:00〜翌 1:00、祝日を含む週 7 日対応。はい、クリスマスも営業しています。",
        },
      ],
    },
    ko: {
      eyebrow: "고객 지원",
      title: "문의하기",
      intro:
        "저희는 봇이 아닌 진짜 사람입니다. 아래 어떤 방법으로든 팀에 연락해 주세요 — 대부분의 문의는 몇 시간 내에 실제 답변을 받으실 수 있습니다.",
      sections: [
        {
          heading: "라이브 채팅",
          body: "어느 페이지든 우측 하단의 채팅 버블을 열어주세요. 실시간 상담원이 매일 오전 7시부터 익일 새벽 1시(태평양 시간)까지 대기합니다.",
        },
        {
          heading: "이메일",
          body: "일반 문의: hello@loollook.com — 12시간 이내 답변드립니다.\n처방 관련 도움: rx@loollook.com — 면허를 보유한 검안사가 24시간 이내에 답변드립니다.",
        },
        {
          heading: "전화",
          body: "+1 (800) 555-0199 — 미국과 캐나다에서는 무료입니다. 해외 발신자는 통화료가 부담되지 않도록 채팅이나 이메일을 이용해 주세요.",
        },
        {
          heading: "운영 시간",
          body: "태평양 시간 오전 7시부터 익일 새벽 1시까지, 휴일 포함 주 7일 운영합니다. 네, 크리스마스에도 영업합니다.",
        },
      ],
    },
    ar: {
      eyebrow: "خدمة العملاء",
      title: "تواصل معنا",
      intro:
        "نحن بشر، لسنا روبوتات. تواصل مع فريقنا عبر أي من هذه القنوات — معظم الرسائل تتلقى ردًّا حقيقيًا خلال بضع ساعات.",
      sections: [
        {
          heading: "الدردشة المباشرة",
          body: "افتح فقاعة الدردشة في أسفل يمين أي صفحة. الموظّفون متاحون يوميًا من 7 صباحًا حتى 1 صباحًا (بتوقيت Pacific).",
        },
        {
          heading: "البريد الإلكتروني",
          body: "الاستفسارات العامة: hello@loollook.com — نردّ خلال 12 ساعة.\nمساعدة الوصفات الطبية: rx@loollook.com — يجيب عليها أخصائي بصريات مرخَّص خلال 24 ساعة.",
        },
        {
          heading: "الهاتف",
          body: "+1 (800) 555-0199 — مجاني من الولايات المتحدة وكندا. للمتّصلين دوليًا، يُرجى استخدام الدردشة أو البريد الإلكتروني حتى لا تتراكم فاتورتك.",
        },
        {
          heading: "ساعات العمل",
          body: "من 7 صباحًا حتى 1 صباحًا بتوقيت Pacific، 7 أيام في الأسبوع، بما في ذلك أيام العطلات. نعم، نحن مفتوحون يوم Christmas.",
        },
      ],
    },
    vi: {
      eyebrow: "Chăm sóc khách hàng",
      title: "Liên hệ chúng tôi",
      intro:
        "Chúng tôi là con người, không phải bot. Liên hệ đội ngũ của chúng tôi qua bất kỳ cách nào dưới đây — phần lớn tin nhắn nhận được phản hồi thật trong vài giờ.",
      sections: [
        {
          heading: "Live chat",
          body: "Mở bong bóng chat ở góc dưới bên phải bất kỳ trang nào. Nhân viên trực tuyến từ 7 sáng đến 1 sáng (giờ Thái Bình Dương), hằng ngày.",
        },
        {
          heading: "Email",
          body: "Câu hỏi chung: hello@loollook.com — chúng tôi phản hồi trong 12 giờ.\nHỗ trợ đơn thuốc: rx@loollook.com — bác sĩ đo mắt có giấy phép trả lời trong 24 giờ.",
        },
        {
          heading: "Điện thoại",
          body: "+1 (800) 555-0199 — miễn phí từ Mỹ và Canada. Người gọi quốc tế, vui lòng dùng chat hoặc email để không tốn phí điện thoại.",
        },
        {
          heading: "Giờ làm việc",
          body: "7 giờ sáng – 1 giờ sáng giờ Thái Bình Dương, 7 ngày một tuần, kể cả ngày lễ. Đúng vậy, chúng tôi mở cửa cả ngày Giáng sinh.",
        },
      ],
    },
    th: {
      eyebrow: "ฝ่ายดูแลลูกค้า",
      title: "ติดต่อเรา",
      intro:
        "เราเป็นมนุษย์ ไม่ใช่บอท ติดต่อทีมของเราด้วยวิธีใดวิธีหนึ่งต่อไปนี้ — ข้อความส่วนใหญ่จะได้รับการตอบกลับจากคนจริงภายในไม่กี่ชั่วโมง",
      sections: [
        {
          heading: "แชทสด",
          body: "เปิดฟองแชทที่มุมขวาล่างของหน้าใดก็ได้ เจ้าหน้าที่ออนไลน์ตั้งแต่ 7:00–1:00 (เวลาแปซิฟิก) ทุกวัน",
        },
        {
          heading: "อีเมล",
          body: "คำถามทั่วไป: hello@loollook.com — เราตอบกลับภายใน 12 ชั่วโมง\nความช่วยเหลือใบสั่งยา: rx@loollook.com — ตอบโดยนักทัศนมาตรที่มีใบอนุญาตภายใน 24 ชั่วโมง",
        },
        {
          heading: "โทรศัพท์",
          body: "+1 (800) 555-0199 — ฟรีจากสหรัฐอเมริกาและแคนาดา ผู้โทรระหว่างประเทศ โปรดใช้แชทหรืออีเมลเพื่อไม่ให้บิลค่าโทรของคุณบาน",
        },
        {
          heading: "เวลาทำการ",
          body: "7:00–1:00 เวลาแปซิฟิก ทุกวัน 7 วัน รวมวันหยุดนักขัตฤกษ์ ใช่ เราเปิดในวันคริสต์มาส",
        },
      ],
    },
    id: {
      eyebrow: "Layanan pelanggan",
      title: "Hubungi kami",
      intro:
        "Kami manusia, bukan bot. Jangkau tim kami dengan salah satu cara berikut — sebagian besar pesan mendapat balasan asli dalam beberapa jam.",
      sections: [
        {
          heading: "Obrolan langsung",
          body: "Buka gelembung obrolan di sudut kanan bawah halaman mana saja. Agen langsung online 7 pagi – 1 pagi (waktu Pasifik), setiap hari.",
        },
        {
          heading: "Email",
          body: "Pertanyaan umum: hello@loollook.com — kami membalas dalam 12 jam.\nBantuan resep: rx@loollook.com — dijawab oleh optometris berlisensi dalam 24 jam.",
        },
        {
          heading: "Telepon",
          body: "+1 (800) 555-0199 — gratis dari AS dan Kanada. Penelepon internasional, silakan gunakan obrolan atau email agar tagihan Anda tidak membengkak.",
        },
        {
          heading: "Jam",
          body: "7 pagi – 1 pagi Waktu Pasifik, 7 hari seminggu, termasuk hari libur. Ya, kami buka pada hari Natal.",
        },
      ],
    },
    ms: {
      eyebrow: "Khidmat pelanggan",
      title: "Hubungi kami",
      intro:
        "Kami adalah manusia, bukan bot. Hubungi pasukan kami melalui mana-mana cara berikut — kebanyakan mesej mendapat balasan sebenar dalam beberapa jam.",
      sections: [
        {
          heading: "Sembang langsung",
          body: "Buka belon sembang di sudut kanan bawah mana-mana halaman. Ejen langsung dalam talian 7 pagi – 1 pagi (waktu Pasifik), setiap hari.",
        },
        {
          heading: "E-mel",
          body: "Soalan umum: hello@loollook.com — kami membalas dalam 12 jam.\nBantuan preskripsi: rx@loollook.com — dijawab oleh ahli optometri berlesen dalam 24 jam.",
        },
        {
          heading: "Telefon",
          body: "+1 (800) 555-0199 — percuma dari AS dan Kanada. Pemanggil antarabangsa, sila gunakan sembang atau e-mel supaya bil anda tidak meningkat.",
        },
        {
          heading: "Waktu",
          body: "7 pagi – 1 pagi Waktu Pasifik, 7 hari seminggu, termasuk cuti umum. Ya, kami buka pada Christmas.",
        },
      ],
    },
  },
};

export function getInfoContent(slug: InfoSlug, lang: Lang): InfoPageContent {
  return REGISTRY[slug][lang] ?? REGISTRY[slug].en;
}

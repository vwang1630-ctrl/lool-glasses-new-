import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { LangLink } from "@/components/LangLink";
import { useI18n, type Lang } from "@/lib/i18n";
import {
  Feather,
  Eye,
  Camera,
  DollarSign,
  Globe2,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

export const Route = createFileRoute("/$lang/why-lool")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("whyLool", params.lang) },
      {
        name: "description",
        content:
          pageDesc("whyLool", params.lang),
      },
      { property: "og:description", content: pageOgDesc("whyLool", params.lang) },
      { name: "twitter:description", content: pageOgDesc("whyLool", params.lang) },
    ],
  }),
  component: WhyLoolPage,
});

type L<T> = Partial<Record<Lang, T>>;
function pickL<T>(map: L<T>, lang: Lang): T | undefined {
  return map[lang] ?? map.en;
}

const STORY: { paragraphs: L<[string, string, string]>; author: L<string> } = {
  paragraphs: {
    en: [
      "“The first time I went to buy glasses, the optician pointed at a frame that started at $300-something and called it the ‘entry-level’ option. Right next to it was the one I actually wanted to try — the tag said $500.",
      "Later I kept wondering: the design, the materials, the lens tech — none of it is that different. So why does a single pair of glasses cost more than a month of rent? Good optics shouldn’t belong only to a lucky few.",
      "What loollook wants to do is simple. Keep the quality and the design that should be there, and pull the price back to where it belongs. No brand markup — just the pair of glasses you actually need.”",
    ],
    zh: [
      "“第一次去配眼镜，店员指着一副起价三百多美元的镜架说‘这个是入门款’。我看了眼旁边真正想试的款式，标签上写着五百美元。",
      "后来我总在想：设计、材料和技术都不差太多，为什么一副眼镜可以贵出一整个月的房租？好的光学产品不该只属于少数人。",
      "所以 loollook 想做的很简单：保留本该有的品质和设计感，但把价格拉回正常的范围。不靠品牌溢价，只提供你真正需要的那副眼镜。”",
    ],
    es: [
      "«La primera vez que fui a comprar gafas, el óptico señaló una montura que empezaba en más de 300 dólares y la llamó ‘el modelo de entrada’. Justo al lado estaba la que de verdad quería probar — la etiqueta decía 500 dólares.",
      "Después no paraba de pensar: el diseño, los materiales y la tecnología no son tan distintos. ¿Por qué unas gafas cuestan más que un mes de alquiler? La buena óptica no debería ser para unos pocos.",
      "Lo que quiere loollook es sencillo: mantener la calidad y el diseño que deberían estar ahí, y devolver el precio a un nivel razonable. Sin sobreprecio de marca — solo las gafas que de verdad necesitas.»",
    ],
    fr: [
      "« La première fois que je suis allé acheter des lunettes, l’opticien a pointé une monture à plus de 300 $ en disant que c’était “l’entrée de gamme”. Juste à côté, celle que je voulais vraiment essayer affichait 500 $.",
      "Après, je me suis demandé : le design, les matériaux, la technologie des verres — rien de tout cela n’est si différent. Pourquoi une seule paire de lunettes coûterait-elle plus cher qu’un mois de loyer ? Une bonne optique ne devrait pas être réservée à quelques-uns.",
      "L’ambition de loollook est simple : garder la qualité et le design qui doivent y être, et ramener le prix là où il devrait être. Pas de marge de marque — juste les lunettes dont vous avez réellement besoin. »",
    ],
    de: [
      "„Als ich das erste Mal eine Brille kaufen wollte, zeigte der Optiker auf ein Gestell ab 300 $ und nannte es ‚das Einsteigermodell‘. Direkt daneben hing das Modell, das ich eigentlich anprobieren wollte — auf dem Etikett standen 500 $.",
      "Später habe ich immer wieder gedacht: Design, Materialien und Glastechnik sind nicht so unterschiedlich. Warum kostet eine Brille mehr als eine Monatsmiete? Gute Optik darf nicht nur wenigen gehören.",
      "Was loollook will, ist einfach: die Qualität und das Design behalten, das selbstverständlich sein sollte — und den Preis dorthin zurückholen, wo er hingehört. Kein Marken-Aufschlag, nur die Brille, die du wirklich brauchst.“",
    ],
    it: [
      "«La prima volta che sono andato a comprare degli occhiali, l’ottico mi ha indicato una montatura a partire da 300 $ definendola ‘il modello base’. Accanto c’era quella che volevo davvero provare — sul cartellino c’era scritto 500 $.",
      "Poi ho continuato a chiedermi: il design, i materiali, la tecnologia delle lenti — non sono così diversi. Perché un paio di occhiali può costare più di un mese di affitto? L’ottica fatta bene non dovrebbe essere solo per pochi.",
      "Quello che vuole fare loollook è semplice: tenere la qualità e il design che dovrebbero esserci, e riportare il prezzo dove ha senso. Niente sovrapprezzo di marca — solo gli occhiali che ti servono davvero.»",
    ],
    pt: [
      "“Da primeira vez que fui comprar óculos, o vendedor apontou para uma armação a partir de 300 dólares e disse que era ‘a opção básica’. Bem ao lado estava a que eu queria mesmo experimentar — a etiqueta dizia 500 dólares.",
      "Depois eu ficava pensando: design, materiais e tecnologia de lentes não são tão diferentes. Por que um par de óculos custa mais do que um mês de aluguel? Boa óptica não devia ser só para alguns.",
      "O que a loollook quer fazer é simples: manter a qualidade e o design que precisam estar ali, e trazer o preço de volta a um patamar justo. Sem ágio de marca — só os óculos que você realmente precisa.”",
    ],
    ja: [
      "「初めて眼鏡を買いに行ったとき、店員さんは 300 ドル台から始まるフレームを指して『これが入門モデルです』と言いました。その横にあった、本当に試したかったモデルの値札には 500 ドルと書かれていました。",
      "それから何度も思ったんです。デザインも素材もレンズ技術も、そこまで違わない。それなのに、なぜ一本の眼鏡が家賃一か月分より高くなるのか。良い光学製品は、ごく一部の人だけのものではないはずです。",
      "loollook がやりたいことはとてもシンプルです。本来あるべき品質とデザインは保ち、価格を本来の場所に戻す。ブランドの上乗せはなし。あなたに本当に必要な、その一本だけを。」",
    ],
    ko: [
      "“처음 안경을 사러 갔을 때, 매장 직원이 300달러대부터 시작하는 프레임을 가리키며 ‘이게 입문용’이라고 했습니다. 바로 옆에는 정말 써보고 싶었던 모델이 있었고, 가격표에는 500달러라고 적혀 있었습니다.",
      "이후로 계속 생각했습니다. 디자인도, 소재도, 렌즈 기술도 그렇게 크게 다르지 않은데, 왜 안경 한 개가 한 달 월세보다 비쌀 수 있을까. 좋은 광학 제품이 일부 사람만의 것이어선 안 됩니다.",
      "loollook이 하고 싶은 일은 단순합니다. 있어야 할 품질과 디자인은 그대로 두고, 가격을 제자리로 돌려놓는 것. 브랜드 프리미엄 없이, 당신에게 정말 필요한 안경 한 개만.”",
    ],
    ar: [
      "«في أوّل مرة ذهبتُ فيها لشراء نظّارة، أشار البائع إلى إطار يبدأ سعره من 300 دولار وقال إنّه ‘الموديل المبتدئ’. وبجواره كان الإطار الذي أردتُ تجربته فعلًا، وعلى البطاقة كُتب 500 دولار.",
      "بعدها ظللتُ أتساءل: التصميم والخامات وتقنية العدسات لا تختلف كثيرًا، فلماذا قد تكلف نظّارة واحدة أكثر من إيجار شهر كامل؟ البصريّات الجيّدة لا يجب أن تكون حِكرًا على قِلّة.",
      "ما تريده loollook بسيط: الحفاظ على الجودة والتصميم اللذين يجب أن يكونا موجودَين، وإعادة السعر إلى مكانه الطبيعي. لا علاوة على اسم العلامة — فقط النظّارة التي تحتاجها فعلًا.»",
    ],
    vi: [
      "“Lần đầu tôi đi mua kính, nhân viên chỉ vào một gọng giá khởi điểm hơn 300 đô và bảo đó là ‘mẫu nhập môn’. Ngay bên cạnh là chiếc tôi thật sự muốn thử — nhãn ghi 500 đô.",
      "Sau đó tôi cứ tự hỏi: thiết kế, chất liệu, công nghệ tròng kính — chẳng có gì khác biệt đến vậy. Tại sao một chiếc kính lại đắt hơn cả một tháng tiền thuê nhà? Quang học tốt không nên chỉ dành cho một số ít.",
      "Điều loollook muốn làm rất đơn giản. Giữ lại chất lượng và thiết kế đáng có, đưa giá về đúng chỗ của nó. Không phụ phí thương hiệu — chỉ là chiếc kính mà bạn thật sự cần.”",
    ],
    th: [
      "“ครั้งแรกที่ผมไปซื้อแว่น พนักงานชี้ไปที่กรอบราคาเริ่มต้น 300 กว่าดอลลาร์แล้วบอกว่าเป็น ‘รุ่นเริ่มต้น’ ข้างๆ คือรุ่นที่ผมอยากลองจริงๆ — ป้ายเขียนว่า 500 ดอลลาร์",
      "หลังจากนั้นผมคิดอยู่ตลอด: ดีไซน์ วัสดุ และเทคโนโลยีเลนส์ก็ไม่ได้ต่างกันมากนัก ทำไมแว่นคู่เดียวถึงแพงกว่าค่าเช่าบ้านหนึ่งเดือน? ทัศนูปกรณ์ดีๆ ไม่ควรเป็นของคนเพียงไม่กี่คน",
      "สิ่งที่ loollook อยากทำนั้นเรียบง่าย คงคุณภาพและดีไซน์ที่ควรมีเอาไว้ และดึงราคากลับมาที่ที่มันควรอยู่ ไม่มีค่าแบรนด์ส่วนเกิน — มีแค่แว่นคู่ที่คุณต้องการจริงๆ”",
    ],
    id: [
      "“Pertama kali saya beli kacamata, petugasnya menunjuk satu bingkai yang harganya mulai dari $300-an dan menyebutnya ‘opsi pemula’. Tepat di sebelahnya ada model yang sebenarnya ingin saya coba — labelnya $500.",
      "Setelah itu saya terus berpikir: desain, material, teknologi lensa — semuanya tidak terlalu beda. Lalu kenapa satu kacamata bisa lebih mahal dari sebulan sewa rumah? Optik yang baik tidak seharusnya hanya milik segelintir orang.",
      "Yang loollook ingin lakukan sederhana. Pertahankan kualitas dan desain yang memang seharusnya ada, lalu tarik harganya kembali ke tempat yang wajar. Tanpa premi merek — hanya kacamata yang benar-benar Anda butuhkan.”",
    ],
    ms: [
      "“Kali pertama saya pergi membeli cermin mata, jurujual menunjuk ke bingkai yang harganya bermula dari $300 lebih dan memanggilnya ‘pilihan permulaan’. Tepat di sebelahnya ialah model yang saya benar-benar ingin cuba — label tertulis $500.",
      "Selepas itu saya asyik terfikir: reka bentuk, bahan, dan teknologi kanta — semuanya tidak begitu berbeza. Mengapa sepasang cermin mata boleh lebih mahal daripada sewa rumah sebulan? Optik yang baik tidak sepatutnya milik segelintir orang sahaja.",
      "Apa yang loollook ingin lakukan sangat mudah. Kekalkan kualiti dan reka bentuk yang sepatutnya ada, dan tarik harga kembali ke tempat yang sepatutnya. Tiada tambahan harga jenama — cuma sepasang cermin mata yang anda benar-benar perlukan.”",
    ],
  },
  author: {
    en: "— the loollook team",
    zh: "—— loollook 团队",
    es: "— el equipo loollook",
    fr: "— l’équipe loollook",
    de: "— das loollook Team",
    it: "— il team loollook",
    pt: "— a equipe loollook",
    ja: "— loollook チーム",
    ko: "— loollook 팀",
    ar: "— فريق loollook",
    vi: "— đội ngũ loollook",
    th: "— ทีม loollook",
    id: "— tim loollook",
    ms: "— pasukan loollook",
  },
};

type ValueCard = {
  icon: ComponentType<{ className?: string }>;
  title: L<string>;
  desc: L<string>;
};

const VALUES: ValueCard[] = [
  {
    icon: Feather,
    title: {
      en: "Featherlight, all-day-easy",
      zh: "轻若无物，久戴无感",
      es: "Ligeras, fáciles de llevar todo el día",
      fr: "Légères, faciles à porter toute la journée",
      de: "Federleicht, den ganzen Tag bequem",
      it: "Leggerissime, comode tutto il giorno",
      pt: "Leves como uma pluma, o dia inteiro",
      ja: "羽のように軽く、一日中ラク",
      ko: "깃털처럼 가볍게, 하루 종일 편하게",
      ar: "بخفّة الريشة، مريحة طوال اليوم",
      vi: "Nhẹ như lông vũ, đeo cả ngày vẫn dễ chịu",
      th: "เบาดั่งขนนก สวมสบายตลอดวัน",
      id: "Ringan seperti bulu, nyaman sepanjang hari",
      ms: "Ringan seperti bulu, selesa sepanjang hari",
    },
    desc: {
      en: "Most loollook frames weigh under 12 g — about half a typical pair. No pinching on the nose or behind the ears, even after a full day of wear.",
      zh: "大多数 loollook 镜架重量低于 12 克，约为常规眼镜的一半。鼻梁和耳朵没有负担，戴上一整天也不会压痕。",
      es: "La mayoría de las monturas loollook pesan menos de 12 g, casi la mitad de unas gafas normales. Sin marcas en la nariz ni detrás de las orejas, ni siquiera después de un día entero.",
      fr: "La plupart des montures loollook pèsent moins de 12 g — environ la moitié d’une paire classique. Aucune pression sur le nez ou derrière les oreilles, même après une journée entière.",
      de: "Die meisten loollook-Fassungen wiegen unter 12 g — etwa halb so viel wie eine übliche Brille. Kein Drücken an Nase oder Ohren, auch nach einem ganzen Tag.",
      it: "La maggior parte delle montature loollook pesa meno di 12 g, circa metà di un occhiale tradizionale. Niente segni sul naso o dietro le orecchie, anche dopo una giornata intera.",
      pt: "A maioria das armações loollook pesa menos de 12 g — cerca de metade de um par comum. Sem marcas no nariz ou atrás das orelhas, mesmo depois de um dia inteiro.",
      ja: "loollook のフレームの多くは 12g 以下。一般的な眼鏡の約半分の重さです。一日中かけても鼻や耳に跡が残りません。",
      ko: "loollook 프레임 대부분은 12g 이하 — 일반 안경의 절반 정도입니다. 하루 종일 써도 코나 귀에 자국이 남지 않습니다.",
      ar: "معظم إطارات loollook يقل وزنها عن 12 جرامًا — أي نصف وزن النظارة العادية تقريبًا. لا ضغط على الأنف أو خلف الأذنين، حتى بعد يوم كامل من الارتداء.",
      vi: "Hầu hết gọng loollook nặng dưới 12 g — khoảng một nửa so với kính thông thường. Không cấn sống mũi hay sau tai, kể cả khi đeo cả ngày.",
      th: "กรอบ loollook ส่วนใหญ่หนักไม่ถึง 12 กรัม — ประมาณครึ่งหนึ่งของแว่นทั่วไป ไม่กดดั้งจมูกหรือหลังใบหู แม้สวมตลอดวัน",
      id: "Sebagian besar bingkai loollook beratnya di bawah 12 g — sekitar setengah dari kacamata biasa. Tidak menekan hidung atau di belakang telinga, bahkan setelah seharian dipakai.",
      ms: "Kebanyakan bingkai loollook beratnya kurang daripada 12 g — kira-kira separuh daripada cermin mata biasa. Tiada tekanan pada hidung atau belakang telinga, walaupun selepas dipakai sepanjang hari.",
    },
  },
  {
    icon: Eye,
    title: {
      en: "All-inclusive lenses, no hidden upsell",
      zh: "全配镜片，一步到位",
      es: "Cristales todo incluido, sin sorpresas",
      fr: "Verres tout inclus, sans extras cachés",
      de: "Komplett-Gläser, keine versteckten Aufpreise",
      it: "Lenti tutto incluso, senza sorprese",
      pt: "Lentes completas, sem cobranças escondidas",
      ja: "コミコミのレンズ、隠れ追加なし",
      ko: "올인 렌즈, 숨은 추가비 없음",
      ar: "عدسات شاملة، بلا رسوم خفيّة",
      vi: "Tròng kính trọn gói, không phí ẩn",
      th: "เลนส์ครบในตัว ไม่มีค่าใช้จ่ายแอบแฝง",
      id: "Lensa serba lengkap, tanpa biaya tersembunyi",
      ms: "Kanta serba lengkap, tanpa bayaran tersembunyi",
    },
    desc: {
      en: "Anti-glare, scratch-resistant, UV protection, and blue-light filter come standard. The price you see at checkout is the price you pay.",
      zh: "防眩光、防刮、UV 防护、防蓝光涂层全部标配，无任何隐藏加价。结账时你看到的价格就是最终价格。",
      es: "Antirreflejos, antiarañazos, protección UV y filtro de luz azul vienen de serie. El precio del checkout es el precio final.",
      fr: "Antireflet, anti-rayures, protection UV et filtre lumière bleue sont inclus de série. Le prix au paiement est le prix final.",
      de: "Entspiegelung, kratzfeste Beschichtung, UV-Schutz und Blaulichtfilter sind Standard. Was du im Checkout siehst, zahlst du auch.",
      it: "Antiriflesso, antigraffio, protezione UV e filtro luce blu sono di serie. Il prezzo che vedi al checkout è quello che paghi.",
      pt: "Antirreflexo, antirrisco, proteção UV e filtro de luz azul vêm de série. O preço que você vê no checkout é o que paga.",
      ja: "反射防止・キズ防止・UV カット・ブルーライトカットコートはすべて標準装備。レジで見える価格が、そのまま支払う金額です。",
      ko: "반사 방지, 스크래치 방지, UV 차단, 블루라이트 차단 코팅이 모두 기본. 결제 화면의 가격이 곧 최종 가격입니다.",
      ar: "طبقات مضادّة للوهج، مضادّة للخدش، حماية من الأشعّة فوق البنفسجيّة، وفلتر للضوء الأزرق — كلّها قياسيّة. السعر الذي تراه عند الدفع هو ما تدفعه فعلًا.",
      vi: "Chống lóa, chống xước, chống tia UV và lọc ánh sáng xanh đều là tiêu chuẩn. Giá bạn thấy ở bước thanh toán chính là giá bạn trả.",
      th: "เคลือบกันแสงสะท้อน กันรอย ป้องกัน UV และกรองแสงสีฟ้า ครบเป็นมาตรฐาน ราคาที่เห็นตอนชำระเงินคือราคาที่จ่ายจริง",
      id: "Anti-silau, anti-gores, perlindungan UV, dan filter cahaya biru semuanya standar. Harga yang Anda lihat saat checkout adalah harga yang Anda bayar.",
      ms: "Anti-silau, anti-calar, perlindungan UV dan penapis cahaya biru semuanya standard. Harga yang anda lihat semasa pembayaran ialah harga yang anda bayar.",
    },
  },
  {
    icon: Camera,
    title: {
      en: "AI try-on — no more guessing",
      zh: "AI 试戴，告别犹豫",
      es: "Prueba con IA — sin dudas",
      fr: "Essai IA — fini les hésitations",
      de: "KI-Anprobe — kein Rätselraten mehr",
      it: "Prova con IA — basta indecisione",
      pt: "Prova com IA — sem mais dúvida",
      ja: "AI 試着で、もう迷わない",
      ko: "AI 가상 착용 — 더 이상 망설이지 않기",
      ar: "تجربة بالذكاء الاصطناعي — وداعًا للتردّد",
      vi: "Thử kính bằng AI — không còn đoán mò",
      th: "ลองแว่นด้วย AI — หมดยุคเดาสุ่ม",
      id: "Coba pakai dengan AI — tidak perlu menebak lagi",
      ms: "Cuba pakai dengan AI — tiada lagi tekaan",
    },
    desc: {
      en: "Your phone camera is your mirror. Hundreds of frames live on your face in seconds, so picking a pair feels as easy as choosing earrings.",
      zh: "手机摄像头就是你的随身镜柜。上百款镜框实时上脸，买眼镜跟挑耳环一样直观简单。",
      es: "La cámara del móvil es tu espejo. Cientos de monturas en tu cara al instante: elegir gafas es tan fácil como elegir pendientes.",
      fr: "La caméra de ton téléphone devient ton miroir. Des centaines de montures en direct sur ton visage — choisir une paire devient aussi simple que choisir des boucles d’oreilles.",
      de: "Deine Handykamera ist dein Spiegel. Hunderte Fassungen live im Gesicht — eine Brille auszusuchen fühlt sich an wie das Auswählen von Ohrringen.",
      it: "La fotocamera del telefono è il tuo specchio. Centinaia di montature in tempo reale sul viso: scegliere un paio è facile come scegliere un paio di orecchini.",
      pt: "A câmera do celular é seu espelho. Centenas de armações no seu rosto em segundos — escolher um par fica tão fácil quanto escolher um brinco.",
      ja: "スマホのカメラがそのまま鏡に。数百種類のフレームが瞬時に顔に乗り、ピアスを選ぶみたいに気軽に選べます。",
      ko: "스마트폰 카메라가 곧 거울이 됩니다. 수백 개의 프레임을 실시간으로 얼굴에 올려보고, 귀걸이 고르듯 가볍게 선택하세요.",
      ar: "كاميرا هاتفك هي مرآتك. تجرّب مئات الإطارات على وجهك مباشرة، فيصبح اختيار النظّارة سهلًا كاختيار قُرط.",
      vi: "Camera điện thoại chính là chiếc gương của bạn. Hàng trăm gọng kính lên mặt trong vài giây, chọn kính dễ như chọn khuyên tai.",
      th: "กล้องโทรศัพท์ของคุณคือกระจกของคุณ กรอบแว่นนับร้อยขึ้นใบหน้าได้ในไม่กี่วินาที เลือกแว่นง่ายราวกับเลือกต่างหู",
      id: "Kamera ponsel adalah cermin Anda. Ratusan bingkai langsung hadir di wajah dalam hitungan detik, memilih kacamata jadi semudah memilih anting.",
      ms: "Kamera telefon anda ialah cermin anda. Beratus-ratus bingkai muncul di wajah dalam beberapa saat, memilih cermin mata jadi semudah memilih anting.",
    },
  },
];

type PromiseItem = {
  icon: ComponentType<{ className?: string }>;
  title: L<string>;
  desc: L<string>;
};

const PROMISES: PromiseItem[] = [
  {
    icon: DollarSign,
    title: {
      en: "Fair prices, no theater",
      zh: "公道价格，不玩虚的",
      es: "Precios justos, sin trucos",
      fr: "Des prix justes, sans jeux de scène",
      de: "Faire Preise, ohne Show",
      it: "Prezzi onesti, senza giochetti",
      pt: "Preços justos, sem teatro",
      ja: "公正な価格、見せかけ無し",
      ko: "공정한 가격, 눈속임 없이",
      ar: "أسعار عادلة، بلا تمثيليّات",
      vi: "Giá công bằng, không màu mè",
      th: "ราคายุติธรรม ไม่มีการแสดง",
      id: "Harga adil, tanpa drama",
      ms: "Harga berpatutan, tanpa drama",
    },
    desc: {
      en: "Prescription glasses start at $95. The same optical quality typically costs around $400 at a brick-and-mortar optician — we strip out everything else.",
      zh: "含处方镜片起售价 95 美元。同等光学质量在线下视光店通常需要 400 美元，我们帮你剔除多余溢价。",
      es: "Gafas graduadas desde 95 $. La misma calidad óptica suele costar unos 400 $ en una óptica física — eliminamos todo lo demás.",
      fr: "Lunettes de vue à partir de 95 $. La même qualité optique coûte souvent autour de 400 $ chez un opticien physique — nous enlevons tout le reste.",
      de: "Brillen mit Stärke ab 95 $. Dieselbe optische Qualität kostet beim Optiker meist rund 400 $ — wir lassen alles andere weg.",
      it: "Occhiali da vista a partire da 95 $. La stessa qualità ottica in un negozio fisico costa di solito sui 400 $ — togliamo tutto il resto.",
      pt: "Óculos de grau a partir de 95 $. A mesma qualidade óptica costuma custar uns 400 $ em uma ótica física — a gente tira o resto.",
      ja: "度付き眼鏡は 95 ドルから。同等の光学品質は実店舗の眼鏡店だと通常 400 ドル前後。余計な上乗せを取り除きました。",
      ko: "도수 안경이 95달러부터. 동일한 광학 품질은 오프라인 안경원에서 보통 400달러 정도 — 그 외의 모든 비용을 덜어냈습니다.",
      ar: "نظّارات طبّية تبدأ من 95 دولارًا. الجودة البصرية نفسها تكلّف عادةً نحو 400 دولار في محلّ بصريّات تقليدي — نحن نُسقط الباقي.",
      vi: "Kính có độ từ $95. Cùng chất lượng quang học thường có giá khoảng $400 ở cửa hàng kính truyền thống — chúng tôi loại bỏ tất cả phần còn lại.",
      th: "แว่นสายตาเริ่มต้นที่ $95 คุณภาพแสงทัศนะเดียวกันโดยทั่วไปราคาประมาณ $400 ที่ร้านแว่นหน้าร้าน — เราตัดส่วนเกินอื่นๆ ออกหมด",
      id: "Kacamata resep mulai dari $95. Kualitas optik yang sama biasanya seharga sekitar $400 di optik konvensional — kami pangkas semua yang lain.",
      ms: "Cermin mata berpreskripsi bermula dari $95. Kualiti optik yang sama biasanya berharga sekitar $400 di kedai optik tradisional — kami buang segala-galanya yang lain.",
    },
  },
  {
    icon: Globe2,
    title: {
      en: "Worldwide shipping, free over $69",
      zh: "全球配送，满 69 免邮",
      es: "Envío mundial, gratis desde 69 $",
      fr: "Livraison mondiale, gratuite dès 69 $",
      de: "Weltweiter Versand, ab 69 $ gratis",
      it: "Spedizione mondiale, gratis oltre 69 $",
      pt: "Envio mundial, grátis acima de 69 $",
      ja: "世界配送、69 ドル以上で送料無料",
      ko: "전 세계 배송, 69달러 이상 무료",
      ar: "شحن دولي، مجّاني فوق 69 دولارًا",
      vi: "Giao hàng toàn cầu, miễn phí từ $69",
      th: "จัดส่งทั่วโลก ฟรีเมื่อสั่งซื้อเกิน $69",
      id: "Pengiriman ke seluruh dunia, gratis di atas $69",
      ms: "Penghantaran ke seluruh dunia, percuma melebihi $69",
    },
    desc: {
      en: "Free tracked shipping on orders over $69; orders under $69 have a flat $9.9 shipping fee. Import duties are pre-paid for most destinations. Delivery takes 7–30 days depending on your country.",
      zh: "订单满 $69 免运费并附实时追踪；不满 $69 收取 $9.9 固定运费。大多数目的地的进口关税由我们预付。根据所在国家/地区不同，送达时间为 7–30 天。",
      es: "Envío gratis y con seguimiento en pedidos superiores a $69; los pedidos inferiores a $69 tienen una tarifa plana de $9.9. Los aranceles están prepagados para la mayoría de destinos. La entrega tarda de 7 a 30 días según tu país.",
      fr: "Livraison gratuite et suivie dès 69 $ d'achat ; en dessous de 69 $, frais de port fixes de 9,9 $. Les droits de douane sont prépayés pour la plupart des destinations. Délai de livraison : 7 à 30 jours selon votre pays.",
      de: "Kostenloser, nachverfolgbarer Versand ab 69 $; unter 69 $ fällt eine Versandpauschale von 9,9 $ an. Einfuhrzölle sind für die meisten Länder vorausbezahlt. Die Lieferung dauert je nach Land 7–30 Tage.",
      it: "Spedizione gratuita e tracciata per ordini superiori a 69 $; sotto i 69 $ si applica una tariffa fissa di 9,9 $. I dazi sono prepagati per la maggior parte delle destinazioni. La consegna richiede 7–30 giorni a seconda del paese.",
      pt: "Frete grátis e rastreado em pedidos acima de 69 $; abaixo de 69 $ há uma taxa fixa de 9,9 $. Os impostos de importação são pré-pagos para a maioria dos destinos. A entrega leva de 7 a 30 dias, conforme o seu país.",
      ja: "69ドル以上のご注文は送料無料・追跡付き、69ドル未満は送料一律9.9ドルです。ほとんどの配送先で輸入関税は当社が前払いします。お届けまでの日数は国により異なり、7〜30日です。",
      ko: "$69 이상 주문은 무료 추적 배송, $69 미만은 고정 배송비 $9.9입니다. 대부분의 배송지에 대해 수입 관세를 선납합니다. 배송 기간은 국가에 따라 7–30일입니다.",
      ar: "شحن مجاني مع تتبع للطلبات التي تزيد عن 69 دولارًا، ورسوم شحن ثابتة بقيمة 9.9 دولار للطلبات الأقل من ذلك. الرسوم الجمركية مدفوعة مسبقًا لمعظم الوجهات. يستغرق التوصيل من 7 إلى 30 يومًا حسب بلدك.",
      vi: "Miễn phí vận chuyển có theo dõi cho đơn trên $69; đơn dưới $69 có phí cố định $9.9. Thuế nhập khẩu được trả trước cho hầu hết điểm đến. Thời gian giao hàng 7–30 ngày tùy quốc gia.",
      th: "จัดส่งฟรีพร้อมติดตามพัสดุเมื่อสั่งซื้อเกิน $69 ต่ำกว่า $69 มีค่าจัดส่งคงที่ $9.9 ภาษีนำเข้าชำระล่วงหน้าสำหรับปลายทางส่วนใหญ่ ระยะเวลาจัดส่ง 7–30 วัน ขึ้นอยู่กับประเทศของคุณ",
      id: "Gratis ongkir dengan pelacakan untuk pesanan di atas $69; di bawah $69 dikenakan biaya tetap $9,9. Bea masuk dibayar di muka untuk sebagian besar tujuan. Pengiriman memakan waktu 7–30 hari tergantung negara Anda.",
      ms: "Penghantaran percuma dengan penjejakan untuk pesanan melebihi $69; bawah $69 dikenakan yuran tetap $9.9. Duti import dibayar awal untuk kebanyakan destinasi. Penghantaran mengambil masa 7–30 hari bergantung pada negara anda.",
    },
  },
  {
    icon: CalendarDays,
    title: {
      en: "365-day worry-free warranty",
      zh: "365 天无忧质保",
      es: "Garantía de 365 días sin preocupaciones",
      fr: "Garantie 365 jours sans souci",
      de: "365 Tage sorgenfreie Garantie",
      it: "Garanzia 365 giorni senza pensieri",
      pt: "Garantia de 365 dias sem preocupação",
      ja: "365 日の安心保証",
      ko: "365일 무료 보증",
      ar: "ضمان 365 يومًا بلا قلق",
      vi: "Bảo hành 365 ngày, an tâm tuyệt đối",
      th: "รับประกัน 365 วัน หมดกังวล",
      id: "Garansi 365 hari tanpa khawatir",
      ms: "Jaminan 365 hari tanpa risau",
    },
    desc: {
      en: "If anything fails for a manufacturing reason within a full year — lenses included — we replace it for free. No fee, no fuss.",
      zh: "因制造问题导致的任何故障，整一年内（包括镜片）我们免费更换，不收取任何费用。",
      es: "Si algo falla por motivos de fabricación durante todo un año — cristales incluidos — lo reemplazamos gratis. Sin coste, sin enredos.",
      fr: "Si quelque chose défaille pour un défaut de fabrication pendant un an entier — verres compris — nous le remplaçons gratuitement. Sans frais, sans complications.",
      de: "Wenn innerhalb eines vollen Jahres etwas aus Fertigungsgründen kaputtgeht — Gläser inklusive —, ersetzen wir es kostenlos. Ohne Aufpreis, ohne Aufwand.",
      it: "Se qualcosa cede per un difetto di fabbrica entro un anno intero — lenti incluse — lo sostituiamo gratis. Senza costi, senza complicazioni.",
      pt: "Se qualquer coisa falhar por defeito de fabricação em até um ano inteiro — lentes incluídas — substituímos sem custo. Sem taxa, sem dor de cabeça.",
      ja: "製造上の不具合は、レンズを含めて 1 年以内ならすべて無料で交換します。費用も手間もかかりません。",
      ko: "1년 안에 제조상의 결함으로 문제가 생기면 — 렌즈 포함 — 무료로 교환해 드립니다. 비용도, 번거로움도 없습니다.",
      ar: "إذا حدث أيّ خلل بسبب التصنيع خلال سنة كاملة — حتى العدسات — نُبدله لك مجّانًا. بلا رسوم وبلا تعقيد.",
      vi: "Nếu xảy ra bất kỳ lỗi sản xuất nào trong vòng một năm — bao gồm cả tròng kính — chúng tôi thay miễn phí. Không phụ phí, không phiền toái.",
      th: "หากมีสิ่งใดเสียจากสาเหตุการผลิตภายในหนึ่งปีเต็ม — รวมถึงเลนส์ — เราจะเปลี่ยนให้ฟรี ไม่มีค่าใช้จ่าย ไม่ยุ่งยาก",
      id: "Jika ada cacat produksi dalam satu tahun penuh — termasuk lensa — kami ganti gratis. Tanpa biaya, tanpa ribet.",
      ms: "Jika berlaku sebarang kerosakan disebabkan pengeluaran dalam tempoh satu tahun penuh — termasuk kanta — kami gantikan secara percuma. Tiada bayaran, tiada kerumitan.",
    },
  },
  {
    icon: RotateCcw,
    title: {
      en: "Easy 30-day returns & exchanges",
      zh: "30 天轻松退换",
      es: "Devoluciones y cambios fáciles en 30 días",
      fr: "Retours et échanges faciles sous 30 jours",
      de: "30 Tage einfache Rückgabe & Umtausch",
      it: "Resi e cambi facili in 30 giorni",
      pt: "Trocas e devoluções fáceis em 30 dias",
      ja: "30 日間のかんたん返品・交換",
      ko: "30일 손쉬운 반품·교환",
      ar: "إرجاع واستبدال خلال 30 يومًا بسهولة",
      vi: "Đổi trả dễ dàng trong 30 ngày",
      th: "เปลี่ยนคืนสบายๆ ภายใน 30 วัน",
      id: "Pengembalian & penukaran mudah dalam 30 hari",
      ms: "Pemulangan & pertukaran mudah dalam 30 hari",
    },
    desc: {
      en: "Not in love with what arrived? Return or exchange anything within 30 days of delivery — no second-guessing.",
      zh: "收货后 30 天内，不满意的产品可退可换，让你没有后顾之忧。",
      es: "¿No te enamoró lo que llegó? Devuélvelo o cámbialo dentro de los 30 días posteriores a la entrega — sin dudar.",
      fr: "Pas conquis(e) par ce que vous avez reçu ? Retournez ou échangez sous 30 jours après la livraison — l’esprit tranquille.",
      de: "Doch nicht überzeugt? Innerhalb von 30 Tagen nach Erhalt kannst du alles zurücksenden oder umtauschen — ohne Zweifel.",
      it: "Non ti convince? Restituisci o cambia entro 30 giorni dalla consegna, senza pensarci due volte.",
      pt: "Não amou o que chegou? Devolva ou troque dentro de 30 dias após a entrega — sem hesitar.",
      ja: "届いた商品が気に入らなかったら、受け取りから 30 日以内に返品・交換できます。迷う必要はありません。",
      ko: "받은 제품이 마음에 들지 않으세요? 수령 후 30일 안에 반품·교환할 수 있습니다 — 망설일 필요 없습니다.",
      ar: "لم تُعجبك القطعة التي وصلت؟ يمكنك إرجاعها أو استبدالها خلال 30 يومًا من الاستلام — دون تردّد.",
      vi: "Không ưng món vừa nhận? Đổi trả trong vòng 30 ngày kể từ khi giao hàng — không cần đắn đo.",
      th: "ไม่ถูกใจสินค้าที่ได้รับ? คืนหรือเปลี่ยนภายใน 30 วันหลังได้รับสินค้า — ไม่ต้องลังเล",
      id: "Tidak cocok dengan yang datang? Kembalikan atau tukar dalam 30 hari setelah diterima — tanpa ragu.",
      ms: "Tidak berkenan dengan apa yang tiba? Pulangkan atau tukar dalam tempoh 30 hari selepas penghantaran — tanpa ragu-ragu.",
    },
  },
];

const PROMISE_HEADING: L<{ eyebrow: string; title: string }> = {
  en: {
    eyebrow: "Our promise",
    title: "Buy with confidence, wear without worry",
  },
  zh: { eyebrow: "我们的承诺", title: "买得安心，用得放心" },
  es: {
    eyebrow: "Nuestro compromiso",
    title: "Compra tranquilo, lleva sin preocupaciones",
  },
  fr: {
    eyebrow: "Notre engagement",
    title: "Achetez serein, portez l’esprit tranquille",
  },
  de: {
    eyebrow: "Unser Versprechen",
    title: "Sicher kaufen, sorgenfrei tragen",
  },
  it: {
    eyebrow: "La nostra promessa",
    title: "Compra sereno, indossa senza pensieri",
  },
  pt: {
    eyebrow: "Nossa promessa",
    title: "Compre confiante, use sem preocupações",
  },
  ja: { eyebrow: "私たちの約束", title: "安心して買って、気兼ねなく使う" },
  ko: { eyebrow: "우리의 약속", title: "안심하고 사고, 마음 편히 쓰세요" },
  ar: { eyebrow: "وعدنا", title: "اشتري بثقة، وارتدي بلا قلق" },
  vi: { eyebrow: "Lời hứa của chúng tôi", title: "Mua tự tin, đeo không lo" },
  th: { eyebrow: "คำมั่นของเรา", title: "ซื้ออย่างมั่นใจ ใส่อย่างไร้กังวล" },
  id: {
    eyebrow: "Janji kami",
    title: "Beli dengan percaya diri, pakai tanpa khawatir",
  },
  ms: {
    eyebrow: "Janji kami",
    title: "Beli dengan yakin, pakai tanpa bimbang",
  },
};

const CTA: { title: L<string>; desc: L<string>; button: L<string> } = {
  title: {
    en: "Ready to meet your next pair?",
    zh: "准备好遇见你的下一副眼镜了吗？",
    es: "¿Listo para conocer tus próximas gafas?",
    fr: "Prêt(e) à rencontrer votre prochaine paire ?",
    de: "Bereit, deine nächste Brille zu treffen?",
    it: "Pronto a incontrare il tuo prossimo paio?",
    pt: "Pronto(a) para conhecer seu próximo par?",
    ja: "次の一本に出会う準備はできましたか？",
    ko: "당신의 다음 안경, 만나볼 준비 되셨나요?",
    ar: "هل أنت مستعدّ لمقابلة نظّارتك التالية؟",
    vi: "Sẵn sàng gặp cặp kính tiếp theo của bạn?",
    th: "พร้อมพบกับแว่นคู่ต่อไปของคุณหรือยัง?",
    id: "Siap bertemu pasangan kacamata berikutnya?",
    ms: "Sedia bertemu pasangan cermin mata anda yang seterusnya?",
  },
  desc: {
    en: "Try the AI try-on — the simplest way to find the frame that suits you.",
    zh: "试试 AI 试戴，用最简单的方式找到最衬你的款式。",
    es: "Prueba la prueba con IA — la forma más sencilla de encontrar la montura que te va.",
    fr: "Essayez l’essai IA — la façon la plus simple de trouver la monture qui vous va.",
    de: "Probier die KI-Anprobe — der einfachste Weg, deine passende Fassung zu finden.",
    it: "Prova la prova con IA — il modo più semplice per trovare la montatura giusta per te.",
    pt: "Experimente a prova com IA — o jeito mais simples de achar a armação que combina com você.",
    ja: "AI 試着を試してみてください。一番ぴったりの一本に最短で出会えます。",
    ko: "AI 가상 착용을 사용해 보세요 — 가장 잘 어울리는 프레임을 찾는 가장 쉬운 방법입니다.",
    ar: "جرّب التجربة بالذكاء الاصطناعي — أبسط طريقة للعثور على الإطار الذي يناسبك.",
    vi: "Hãy thử kính bằng AI — cách đơn giản nhất để tìm gọng kính phù hợp với bạn.",
    th: "ลองทดลองสวมแว่นด้วย AI — วิธีที่ง่ายที่สุดในการหากรอบที่เหมาะกับคุณ",
    id: "Coba fitur try-on AI — cara paling sederhana untuk menemukan bingkai yang cocok untuk Anda.",
    ms: "Cuba ciri try-on AI — cara paling mudah untuk mencari bingkai yang sesuai dengan anda.",
  },
  button: {
    en: "Start AI try-on",
    zh: "开始 AI 试戴",
    es: "Empezar la prueba con IA",
    fr: "Lancer l’essai IA",
    de: "KI-Anprobe starten",
    it: "Inizia la prova con IA",
    pt: "Começar a prova com IA",
    ja: "AI 試着を始める",
    ko: "AI 가상 착용 시작",
    ar: "ابدأ التجربة بالذكاء الاصطناعي",
    vi: "Bắt đầu thử kính AI",
    th: "เริ่มลองแว่นด้วย AI",
    id: "Mulai try-on AI",
    ms: "Mula try-on AI",
  },
};

function ValueCardEl({ card, lang }: { card: ValueCard; lang: Lang }) {
  const Icon = card.icon;
  return (
    <div className="rounded-3xl border border-border bg-card p-7 md:p-8 shadow-soft hover:shadow-card transition-smooth">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="subsection-title">{pickL(card.title, lang)}</h3>
      <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
        {pickL(card.desc, lang)}
      </p>
    </div>
  );
}

function PromiseRow({ item, lang }: { item: PromiseItem; lang: Lang }) {
  const Icon = item.icon;
  return (
    <div className="flex items-start gap-4 md:gap-5">
      <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div className="flex-1">
        <h3 className="text-base md:text-lg font-semibold font-display">
          {pickL(item.title, lang)}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {pickL(item.desc, lang)}
        </p>
      </div>
    </div>
  );
}

function StoryParagraphs({
  paragraphs,
}: {
  paragraphs: [string, string, string];
}): ReactNode {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? "" : "mt-4"}>
          {p}
        </p>
      ))}
    </>
  );
}

function WhyLoolPage() {
  const { lang } = useI18n();
  const paragraphs = pickL(STORY.paragraphs, lang)!;
  const author = pickL(STORY.author, lang)!;
  const promiseHead = pickL(PROMISE_HEADING, lang)!;

  return (
    <div>
      {/* ============================ STORY ============================ */}
      <section className="mx-auto max-w-3xl px-6 lg:px-8 pt-12 md:pt-20 pb-10 md:pb-14">
        <div className="rounded-3xl border border-border bg-card shadow-soft p-8 md:p-12">
          <div className="text-base md:text-lg text-foreground/85 leading-relaxed">
            <StoryParagraphs paragraphs={paragraphs} />
          </div>
          <p className="mt-7 text-xs md:text-sm font-medium uppercase tracking-[0.18em] text-primary/80">
            {author}
          </p>
        </div>
      </section>

      {/* ============================ VALUES ============================ */}
      <section className="mx-auto max-w-5xl px-6 lg:px-8 pb-12 md:pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((card, i) => (
            <ValueCardEl key={i} card={card} lang={lang} />
          ))}
        </div>
      </section>

      {/* ============================ PROMISE ============================ */}
      <section className="mx-auto max-w-3xl px-6 lg:px-8 pb-12 md:pb-16">
        <div className="rounded-3xl border border-border bg-card shadow-soft p-7 md:p-10">
          <span className="eyebrow mb-3">{promiseHead.eyebrow}</span>
          <h2 className="section-title text-2xl md:text-3xl mb-7 md:mb-9">
            {promiseHead.title}
          </h2>
          <div className="flex flex-col gap-7 md:gap-8">
            {PROMISES.map((item, i) => (
              <PromiseRow key={i} item={item} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="mx-auto max-w-3xl px-6 lg:px-8 pb-24">
        <div className="rounded-[32px] border border-border bg-card shadow-soft p-10 md:p-14 text-center">
          <h2 className="section-title text-2xl md:text-3xl">
            {pickL(CTA.title, lang)}
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {pickL(CTA.desc, lang)}
          </p>
          <div className="mt-8">
            <LangLink
              to="/try-on"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
            >
              <Camera className="w-4 h-4" />
              {pickL(CTA.button, lang)}
            </LangLink>
          </div>
        </div>
      </section>
    </div>
  );
}

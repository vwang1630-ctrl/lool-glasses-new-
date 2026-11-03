-- Two new home-page surfaces, both editable from /admin:
--   1. home_ugc            — "顾客实拍 LOOK" community grid (section 10)
--   2. home_promo_banners  — single-image promo strips: AI 虚拟试戴 (section 8)
--                            and 品牌主张 (bottom). Both share the same shape
--                            so one table covers them, keyed by `kind`.
--
-- Mirrors home_banners: lang-keyed JSON for copy, image_url points at R2,
-- link_href stays a plain path so admin can re-aim either at an internal
-- route (/try-on, /products, /product/<slug>) or any future deep link.
--
-- image_url stays nullable here on purpose — admin can author copy first
-- and upload the image afterwards. The homepage falls back to bundled
-- default art when image_url is null/empty.

CREATE TABLE home_ugc (
  id           TEXT PRIMARY KEY,
  slot         INTEGER NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 12),
  image_url    TEXT,
  name         TEXT NOT NULL,
  rating       REAL NOT NULL DEFAULT 5.0 CHECK (rating BETWEEN 0 AND 5),
  text_json    TEXT,            -- {"en": "...", "zh": "...", ...}
  link_href    TEXT,            -- optional: e.g. "/product/lool-8668"
  active       INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX idx_home_ugc_active_slot ON home_ugc(active, slot);

CREATE TABLE home_promo_banners (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL UNIQUE CHECK (kind IN ('tryon', 'brand')),
  image_url     TEXT,
  eyebrow_json  TEXT,
  title_json    TEXT,
  sub_json      TEXT,
  cta_json      TEXT,
  link_href     TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Pre-seed 6 UGC slots with the exact copy already on the homepage so the
-- admin lands on a populated editor (not a blank list). Slot 4 and 5
-- carry working R2 image URLs; the other four start with NULL image_url
-- and rely on homepage fallback art until admin uploads new shots.
INSERT INTO home_ugc (id, slot, image_url, name, rating, text_json, link_href, sort_order) VALUES
  ('hu-1', 1, NULL, 'Sarah M.', 5.0,
   '{"en":"Love these frames! So lightweight and comfortable for all-day wear, perfect for my commute and office days.","zh":"太喜欢了！整天戴着完全无负担，通勤和办公都很搭。","es":"¡Me encantan estas monturas! Súper ligeras y cómodas todo el día, perfectas para el día a día.","fr":"J''adore ces montures ! Légères et confortables toute la journée, parfaites pour le quotidien.","de":"Ich liebe diese Fassungen! Federleicht und bequem für den ganzen Tag.","it":"Adoro queste montature! Leggerissime e comode tutto il giorno.","pt":"Amo essas armações! Leves e confortáveis para usar o dia todo.","ja":"本当に気に入っています！軽くて一日中快適、通勤やオフィスにぴったり。","ko":"정말 마음에 들어요! 가볍고 종일 편하게 쓰기 좋아요.","ar":"أحب هذه الإطارات! خفيفة ومريحة طوال اليوم."}',
   NULL, 10),
  ('hu-2', 2, NULL, 'James R.', 5.0,
   '{"en":"Beautifully made and the fit is spot on. Got tons of compliments at work.","zh":"做工精致，戴着特别合适，办公室收获一堆称赞。","es":"Acabado precioso y el ajuste es perfecto. Muchos cumplidos en la oficina.","fr":"Magnifique finition et ajustement parfait. Plein de compliments au travail.","de":"Wunderschön verarbeitet und passt perfekt. Viele Komplimente im Büro.","it":"Bellissima fattura e calzata perfetta. Tanti complimenti in ufficio.","pt":"Acabamento lindo e ajuste perfeito. Recebi muitos elogios no trabalho.","ja":"美しい作りでフィット感も完璧。職場でたくさん褒められました。","ko":"마감이 좋고 핏이 딱 맞아요. 회사에서 칭찬 많이 받았어요.","ar":"صناعة جميلة ومقاس مثالي. تلقيت إطراءً كثيرًا في العمل."}',
   NULL, 20),
  ('hu-3', 3, NULL, 'Yuki T.', 5.0,
   '{"en":"Chic, modern and feels weightless. My new everyday pair.","zh":"时髦又轻盈，已经成为我的日常标配。","es":"Chic, modernas y se sienten sin peso. Mis nuevas gafas diarias.","fr":"Chic, modernes et légères comme une plume. Ma nouvelle paire quotidienne.","de":"Schick, modern und federleicht. Meine neue Alltagsbrille.","it":"Chic, moderne e leggerissime. Le mie nuove preferite per ogni giorno.","pt":"Chic, modernas e sem peso. Meu novo par diário.","ja":"シックでモダン、まるで何も掛けていないみたい。新しい毎日の相棒です。","ko":"세련되고 모던하면서 가벼워요. 매일 쓰는 데일리 안경이 됐어요.","ar":"أنيقة، عصرية وخفيفة جدًا. أصبحت نظارتي اليومية الجديدة."}',
   NULL, 30),
  ('hu-4', 4, '/api/admin/r2/review/NAfKKCF64Xtqt8N55GhpG.png', 'Emma W.', 5.0,
   '{"en":"Oversized squares with a tortoise twist — the easiest sunny-day pair I own.","zh":"玳瑁色大方框，太阳天最好搭的一副。","es":"Cuadradas oversize con un toque carey — las gafas más fáciles de combinar en días soleados.","fr":"De grandes carrées effet écaille — la paire la plus facile à porter sous le soleil.","de":"Übergroße Eckige im Schildpatt-Look — meine entspannteste Brille für sonnige Tage.","it":"Quadrate oversize effetto tartaruga — il paio più easy nei giorni di sole.","pt":"Quadradas oversize com toque tartaruga — o par mais fácil em dias de sol.","ja":"オーバーサイズのスクエアにべっ甲のニュアンス。晴れた日にいちばん掛けやすい一本。","ko":"토터스 무드의 오버사이즈 스퀘어 — 햇살 좋은 날 가장 손이 가는 안경.","ar":"إطار مربع كبير بلمسة سلحفاة — أسهل نظارة أرتديها في الأيام المشمسة."}',
   '/product/lool-8668', 40),
  ('hu-5', 5, '/api/admin/r2/review/Py6WkVkbDvidAESgaD0oo.png', 'Daniel K.', 5.0,
   '{"en":"Solid build, smooth hinges and clean lines — exactly what I wanted.","zh":"做工扎实、线条干净，正合我意。","es":"Construcción sólida, bisagras suaves y líneas limpias — justo lo que quería.","fr":"Construction solide, charnières fluides et lignes nettes — exactement ce que je voulais.","de":"Solide verarbeitet, weiche Scharniere und klare Linien — genau, was ich wollte.","it":"Costruzione solida, cerniere morbide e linee pulite — proprio quello che volevo.","pt":"Construção sólida, dobradiças suaves e linhas limpas — exatamente o que eu queria.","ja":"頑丈な作り、なめらかなヒンジ、すっきりしたライン。まさに理想です。","ko":"탄탄한 마감, 부드러운 힌지, 깔끔한 라인 — 딱 원하던 그대로예요.","ar":"بنية متينة، مفصلات سلسة وخطوط نظيفة — تمامًا كما أردت."}',
   '/product/lool-8673', 50),
  ('hu-6', 6, NULL, 'Olivia P.', 5.0,
   '{"en":"Travel-ready and seriously comfortable. Worn them on three trips already.","zh":"出行神器，舒服到爆，已经陪我跑了三趟旅行。","es":"Listas para viajar y muy cómodas. Ya las he llevado en tres viajes.","fr":"Parfaites pour voyager et vraiment confortables. Déjà trois voyages avec elles.","de":"Reisetauglich und unglaublich bequem. Schon auf drei Reisen getragen.","it":"Perfette in viaggio e comodissime. Già fatto tre viaggi con loro.","pt":"Prontas para viagem e muito confortáveis. Já fui em três viagens com elas.","ja":"旅行にぴったりで本当に快適。もう3回の旅行で使いました。","ko":"여행에 딱이고 정말 편해요. 벌써 세 번의 여행에 함께했어요.","ar":"مثالية للسفر ومريحة جدًا. سافرت بها ثلاث مرات بالفعل."}',
   NULL, 60);

-- Pre-seed the 2 promo banners with the live copy. image_url starts NULL so
-- the homepage continues to render the bundled hero3 / hero4 asset until
-- admin uploads a replacement via /admin/promo-banners.
INSERT INTO home_promo_banners (id, kind, image_url, eyebrow_json, title_json, sub_json, cta_json, link_href) VALUES
  ('hpb-tryon', 'tryon', NULL,
   '{"en":"AI Virtual Try-On","zh":"AI 虚拟试戴","es":"Probador virtual con IA","fr":"Essayage virtuel par IA","de":"KI-Anprobe","it":"Prova virtuale con IA","pt":"Provador virtual com IA","ja":"AI バーチャル試着","ko":"AI 가상 피팅","ar":"تجربة افتراضية بالذكاء الاصطناعي"}',
   '{"en":"Try On Any Frame Virtually, Right From Your Phone","zh":"足不出户，手机上随时虚拟试戴任意镜框","es":"Pruébate cualquier montura virtualmente desde tu móvil","fr":"Essayez n''importe quelle monture virtuellement, depuis votre téléphone","de":"Jede Fassung virtuell anprobieren, direkt vom Handy","it":"Prova qualsiasi montatura virtualmente dal tuo smartphone","pt":"Experimente qualquer armação virtualmente, direto do celular","ja":"スマホで好きなフレームを今すぐバーチャル試着","ko":"휴대폰으로 어떤 프레임이든 바로 가상 피팅","ar":"جرّب أي إطار افتراضيًا مباشرة من هاتفك"}',
   '{"en":"100% Accurate Fit · 360° Full View · 100+ Styles in Seconds","zh":"100% 精准上脸 · 360° 全视角 · 数秒切换百款风格","es":"Ajuste 100% preciso · 360° · 100+ estilos en segundos","fr":"Ajustement 100% précis · 360° · 100+ styles en quelques secondes","de":"100% genaue Passform · 360° · 100+ Stile in Sekunden","it":"Vestibilità 100% accurata · 360° · 100+ stili in pochi secondi","pt":"Ajuste 100% preciso · 360° · 100+ estilos em segundos","ja":"100% 精密フィット · 360° ビュー · 数秒で 100+ スタイル","ko":"100% 정확한 핏 · 360° 뷰 · 수 초 만에 100+ 스타일","ar":"مقاس دقيق 100% · رؤية 360° · 100+ نمط في ثوانٍ"}',
   '{"en":"Try It Now Free","zh":"免费立即试戴","es":"Pruébalo gratis ahora","fr":"Essayez-le maintenant gratuitement","de":"Jetzt kostenlos ausprobieren","it":"Provalo ora gratis","pt":"Experimente agora grátis","ja":"今すぐ無料で試す","ko":"지금 무료로 시작","ar":"جرّبه الآن مجانًا"}',
   '/try-on'),
  ('hpb-brand', 'brand', NULL,
   '{"en":"THE LOOL WAY","zh":"LOOL 品牌主张","es":"EL ESTILO LOOL","fr":"LA SIGNATURE LOOL","de":"DIE LOOL-PHILOSOPHIE","it":"LO STILE LOOL","pt":"O JEITO LOOL","ja":"LOOL のフィロソフィー","ko":"LOOL의 방식","ar":"أسلوب LOOL"}',
   '{"en":"Designed for Everyday Life, Crafted for Your Unique Style","zh":"为日常而设计，为你的独特风格而制作","es":"Diseñadas para la vida diaria, hechas para tu estilo único","fr":"Conçues pour le quotidien, fabriquées pour votre style unique","de":"Für den Alltag gestaltet, für Ihren einzigartigen Stil gefertigt","it":"Pensati per la vita di tutti i giorni, creati per il tuo stile unico","pt":"Pensados para o dia a dia, feitos para o seu estilo único","ja":"日常のためにデザインし、あなたのスタイルのために仕上げる。","ko":"일상을 위해 디자인하고, 당신만의 스타일을 위해 만듭니다","ar":"صُمّمت لحياتك اليومية، وصُنعت لأسلوبك الفريد"}',
   NULL,
   '{"en":"Explore Our Full Collection","zh":"选购全系列","es":"Explorar la colección completa","fr":"Découvrir toute la collection","de":"Die gesamte Kollektion entdecken","it":"Esplora la collezione completa","pt":"Explorar a coleção completa","ja":"全コレクションを見る","ko":"전체 컬렉션 보기","ar":"اكتشف المجموعة الكاملة"}',
   '/products');

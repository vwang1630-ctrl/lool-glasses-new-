-- 0073_banner_i18n_seasia.sql
-- Backfill vi / th / id / ms translations into hero + promo banner JSON columns.
-- The site supports 14 langs but existing rows only carried 10 (en, zh, ja, ko,
-- es, fr, de, it, pt, ar). On a VI / TH / ID / MS visit the frontend fell back
-- to English. We add the four SE-Asian langs in place via json_set.

-- ── home_banners ────────────────────────────────────────────────────────────

UPDATE home_banners
SET eyebrow_json = json_set(eyebrow_json,
      '$.vi', 'Bộ sưu tập kính đọc sách không tuổi',
      '$.th', 'คอลเลกชันแว่นอ่านหนังสือไร้กาลเวลา',
      '$.id', 'Koleksi Kacamata Baca Tanpa Usia',
      '$.ms', 'Koleksi Cermin Mata Baca Tanpa Usia'),
    title_json = json_set(title_json,
      '$.vi', 'Kính đọc sách, hiện đại đến bất ngờ.',
      '$.th', 'แว่นอ่านหนังสือ ในดีไซน์ทันสมัยอย่างน่าประทับใจ',
      '$.id', 'Kacamata baca, modern yang menyegarkan.',
      '$.ms', 'Cermin mata baca, moden yang menyegarkan.'),
    sub_json = json_set(sub_json,
      '$.vi', 'Gọng kính nhẹ, hiện đại, thiết kế cho thế hệ 45–60. Tròng kính chuyên nghiệp, giá hợp lý, miễn phí vận chuyển toàn cầu.',
      '$.th', 'กรอบแว่นน้ำหนักเบา ดีไซน์โมเดิร์น สำหรับคนรุ่น 45–60 เลนส์เกรดมืออาชีพ ราคาที่เป็นธรรม จัดส่งฟรีทั่วโลก',
      '$.id', 'Bingkai ringan dan modern, dirancang untuk generasi 45–60. Lensa profesional, harga adil, gratis ongkir ke seluruh dunia.',
      '$.ms', 'Bingkai ringan dan moden, direka untuk generasi 45–60. Kanta profesional, harga berpatutan, penghantaran percuma ke seluruh dunia.')
WHERE slot = 1;

UPDATE home_banners
SET eyebrow_json = json_set(eyebrow_json,
      '$.vi', 'Kính đeo hằng ngày',
      '$.th', 'แว่นสำหรับใส่ทุกวัน',
      '$.id', 'Kacamata Sehari-hari',
      '$.ms', 'Cermin Mata Harian'),
    title_json = json_set(title_json,
      '$.vi', 'Một cặp kính cho mọi khoảnh khắc.',
      '$.th', 'หนึ่งคู่ สำหรับทุกช่วงเวลา',
      '$.id', 'Satu pasang untuk setiap momen.',
      '$.ms', 'Sepasang untuk setiap saat.'),
    sub_json = json_set(sub_json,
      '$.vi', 'Gọng tối giản với tròng quang học rõ nét — tại nhà, tại văn phòng, hay khi di chuyển.',
      '$.th', 'กรอบมินิมอลกับเลนส์ออปติคัลคมชัด — ที่บ้าน ที่ทำงาน หรือระหว่างเดินทาง',
      '$.id', 'Bingkai minimalis dengan lensa optik yang jernih — di rumah, di kantor, maupun saat bepergian.',
      '$.ms', 'Bingkai minimalis dengan kanta optik yang jernih — di rumah, di pejabat, atau dalam perjalanan.')
WHERE slot = 2;

UPDATE home_banners
SET eyebrow_json = json_set(eyebrow_json,
      '$.vi', 'Kính cận hiện đại',
      '$.th', 'แว่นสายตาสั้นสมัยใหม่',
      '$.id', 'Miopia Modern',
      '$.ms', 'Miopia Moden'),
    title_json = json_set(title_json,
      '$.vi', 'Nhìn rõ hơn. Đeo nhẹ hơn.',
      '$.th', 'มองชัดขึ้น สวมเบาขึ้น',
      '$.id', 'Lihat lebih tajam. Pakai lebih ringan.',
      '$.ms', 'Lihat lebih jelas. Pakai lebih ringan.'),
    sub_json = json_set(sub_json,
      '$.vi', 'Gọng kim loại và acetate nhẹ như lông vũ, kết hợp tròng kính chiết suất cao — đeo cả ngày không mệt.',
      '$.th', 'กรอบโลหะและอะซิเตทเบาดั่งขนนก จับคู่กับเลนส์ดัชนีหักเหสูง สวมได้ทั้งวันสบาย ๆ',
      '$.id', 'Bingkai logam dan asetat seringan bulu, dipadukan lensa indeks tinggi yang nyaman dipakai sepanjang hari.',
      '$.ms', 'Bingkai logam dan asetat seringan bulu, dipadankan dengan kanta indeks tinggi yang selesa dipakai sepanjang hari.')
WHERE slot = 3;

UPDATE home_banners
SET eyebrow_json = json_set(eyebrow_json,
      '$.vi', 'Lựa chọn của biên tập',
      '$.th', 'บรรณาธิการเลือก',
      '$.id', 'Pilihan Editor',
      '$.ms', 'Pilihan Editor'),
    title_json = json_set(title_json,
      '$.vi', 'Chi tiết nhỏ. Khác biệt lớn.',
      '$.th', 'รายละเอียดเล็ก ๆ สร้างความแตกต่างที่ยิ่งใหญ่',
      '$.id', 'Detail kecil. Perbedaan besar.',
      '$.ms', 'Detail kecil. Perbezaan besar.'),
    sub_json = json_set(sub_json,
      '$.vi', 'Được các stylist của chúng tôi chọn riêng — đường nét cổ điển với điểm nhấn hiện đại.',
      '$.th', 'คัดสรรโดยสไตลิสต์ของเรา — ซิลูเอตคลาสสิกผสมความโมเดิร์น',
      '$.id', 'Dipilih langsung oleh stylist kami — siluet klasik dengan sentuhan modern.',
      '$.ms', 'Dipilih sendiri oleh stylist kami — siluet klasik dengan sentuhan moden.')
WHERE slot = 4;

-- ── home_promo_banners ──────────────────────────────────────────────────────

UPDATE home_promo_banners
SET eyebrow_json = json_set(eyebrow_json,
      '$.vi', 'Thử đeo ảo bằng AI',
      '$.th', 'ลองสวมแว่นเสมือนจริงด้วย AI',
      '$.id', 'Coba Virtual dengan AI',
      '$.ms', 'Cubaan Maya dengan AI'),
    title_json = json_set(title_json,
      '$.vi', 'Thử bất kỳ gọng kính nào ngay trên điện thoại của bạn',
      '$.th', 'ลองสวมแว่นทุกกรอบจากบนมือถือของคุณได้เลย',
      '$.id', 'Coba Bingkai Apa Pun Secara Virtual, Langsung Dari Ponsel Anda',
      '$.ms', 'Cuba Mana-mana Bingkai Secara Maya, Terus Dari Telefon Anda'),
    sub_json = json_set(sub_json,
      '$.vi', 'Vừa vặn 100% · Góc nhìn 360° · 100+ kiểu trong vài giây',
      '$.th', 'พอดี 100% · มุมมอง 360° · 100+ สไตล์ในไม่กี่วินาที',
      '$.id', 'Pas 100% · Tampilan 360° · 100+ gaya dalam hitungan detik',
      '$.ms', 'Padan 100% · Pandangan 360° · 100+ gaya dalam beberapa saat'),
    cta_json = json_set(cta_json,
      '$.vi', 'Thử ngay miễn phí',
      '$.th', 'ทดลองฟรีตอนนี้',
      '$.id', 'Coba Sekarang Gratis',
      '$.ms', 'Cuba Sekarang Percuma')
WHERE id = 'hpb-tryon';

UPDATE home_promo_banners
SET eyebrow_json = json_set(eyebrow_json,
      '$.vi', 'Phong cách LOOL',
      '$.th', 'วิถี LOOL',
      '$.id', 'GAYA LOOL',
      '$.ms', 'CARA LOOL'),
    title_json = json_set(title_json,
      '$.vi', 'Thiết kế cho cuộc sống thường nhật, chế tác cho phong cách riêng của bạn',
      '$.th', 'ออกแบบเพื่อชีวิตประจำวัน สร้างขึ้นเพื่อสไตล์เฉพาะตัวของคุณ',
      '$.id', 'Dirancang untuk Kehidupan Sehari-hari, Dibuat untuk Gaya Anda yang Unik',
      '$.ms', 'Direka untuk Kehidupan Harian, Dibuat untuk Gaya Unik Anda'),
    cta_json = json_set(cta_json,
      '$.vi', 'Khám phá toàn bộ sưu tập',
      '$.th', 'สำรวจคอลเลกชันทั้งหมด',
      '$.id', 'Jelajahi Seluruh Koleksi',
      '$.ms', 'Terokai Seluruh Koleksi')
WHERE id = 'hpb-brand';

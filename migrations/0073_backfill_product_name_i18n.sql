-- 给现有 5 个 products.name_json 补齐所有 14 种语言。
-- 之前的状态：
--   lool-8673 (Round Vintage Glasses)         — 只有 en, zh
--   lool-8663 (Classic Boston Oval Frame Eyewear) — 只有 en, zh
--   lool-8662 (Atelier Panto)                 — 缺 vi, th, id, ms
--   lool-8668 (Oversized Geometric)           — 缺 vi, th, id, ms
--   lool-8664 (Saunders Round)                — 缺 vi, th, id, ms
-- 越南语 / 泰语 / 印尼语 / 马来语 4 个 SEA 语言此前全部没填，前端 fallback 到英文，
-- 越语页面 (`/vi/...`) 上的产品卡名字仍是英文。补齐后 pickLang() 会直接命中。
--
-- 用 json_patch 增量合并：原有语言键全部保留，仅新增缺失的键。

-- ============================================================
-- lool-8673  Round Vintage Glasses / 复古圆框
-- ============================================================
UPDATE products SET name_json = json_patch(name_json, json('{
  "ja": "ラウンド・ヴィンテージ",
  "ko": "라운드 빈티지",
  "es": "Vintage Redondas",
  "fr": "Rondes Vintage",
  "de": "Vintage Rund",
  "it": "Tondi Vintage",
  "pt": "Redondos Vintage",
  "ar": "دائرية كلاسيكية",
  "vi": "Tròn Cổ Điển",
  "th": "ทรงกลมวินเทจ",
  "id": "Bundar Vintage",
  "ms": "Bulat Vintaj"
}')) WHERE slug = 'lool-8673';

-- ============================================================
-- lool-8663  Classic Boston Oval Frame Eyewear / 经典波士顿椭圆框眼镜
-- ============================================================
UPDATE products SET name_json = json_patch(name_json, json('{
  "ja": "クラシック・ボストン・オーバル",
  "ko": "클래식 보스턴 오벌",
  "es": "Boston Oval Clásico",
  "fr": "Boston Ovale Classique",
  "de": "Boston Oval Klassisch",
  "it": "Boston Ovale Classico",
  "pt": "Boston Oval Clássico",
  "ar": "بوسطن بيضاوي كلاسيكي",
  "vi": "Boston Oval Cổ Điển",
  "th": "Boston Oval คลาสสิก",
  "id": "Boston Oval Klasik",
  "ms": "Boston Oval Klasik"
}')) WHERE slug = 'lool-8663';

-- ============================================================
-- lool-8662  Atelier Panto / 工坊圆框
-- ============================================================
UPDATE products SET name_json = json_patch(name_json, json('{
  "vi": "Atelier Panto",
  "th": "Atelier Panto",
  "id": "Atelier Panto",
  "ms": "Atelier Panto"
}')) WHERE slug = 'lool-8662';

-- ============================================================
-- lool-8668  Oversized Geometric / 欧美大框主义
-- ============================================================
UPDATE products SET name_json = json_patch(name_json, json('{
  "vi": "Hình Học Cỡ Lớn",
  "th": "เรขาคณิตทรงใหญ่",
  "id": "Geometris Oversize",
  "ms": "Geometri Bersaiz Besar"
}')) WHERE slug = 'lool-8668';

-- ============================================================
-- lool-8664  Saunders Round / Saunders 圆框
-- ============================================================
UPDATE products SET name_json = json_patch(name_json, json('{
  "vi": "Saunders Tròn",
  "th": "Saunders ทรงกลม",
  "id": "Saunders Bundar",
  "ms": "Saunders Bulat"
}')) WHERE slug = 'lool-8664';

-- 0068_normalize_country_codes.sql
--
-- 把 addresses.country 与 orders.ship_country 的历史自由文本回填成 ISO 3166-1
-- alpha-2 大写码（"US" / "CN" / "VN" ...）。从这个 migration 起，所有写入入口
-- (checkout / account address CRUD / admin order edit) 都强制 ISO 校验，新数据
-- 不会再进自由文本。
--
-- 当前实测 (2026-05-26 远程 D1)：
--   addresses(5)  : "zhongguo" × 4  → CN；"Vietnam" × 1 → VN
--   orders(0)     : 空表
--
-- 这个 CASE 表达式覆盖了"实际存在的 5 行" + lool.work 主要市场国家的常见拼写
-- (英文短名 / 中文 / 拼音 / 日韩名 / 大小写)，与 src/lib/countries.ts
-- normalizeLegacyCountry() 的 alias map 保持同构 —— 任何已知 alias 命中就映射，
-- 不命中的行保留原值，等 admin 后续手动 fix（不强删数据）。

UPDATE addresses
   SET country = CASE
     WHEN lower(country) IN ('zhongguo','china','mainland china','中国','中國','prc','cn') THEN 'CN'
     WHEN lower(country) IN ('vietnam','viet nam','越南','vn') THEN 'VN'
     WHEN lower(country) IN ('usa','united states','united states of america','u.s.','u.s.a.','america','美国','美國','us') THEN 'US'
     WHEN lower(country) IN ('hong kong','hong kong sar','香港','hk') THEN 'HK'
     WHEN lower(country) IN ('macau','macao','澳门','澳門','mo') THEN 'MO'
     WHEN lower(country) IN ('taiwan','台湾','台灣','tw') THEN 'TW'
     WHEN lower(country) IN ('japan','日本','jp') THEN 'JP'
     WHEN lower(country) IN ('south korea','korea','republic of korea','韩国','韓國','kr') THEN 'KR'
     WHEN lower(country) IN ('singapore','新加坡','sg') THEN 'SG'
     WHEN lower(country) IN ('malaysia','马来西亚','馬來西亞','my') THEN 'MY'
     WHEN lower(country) IN ('thailand','泰国','泰國','th') THEN 'TH'
     WHEN lower(country) IN ('indonesia','印度尼西亚','印尼','id') THEN 'ID'
     WHEN lower(country) IN ('philippines','菲律宾','菲律賓','ph') THEN 'PH'
     WHEN lower(country) IN ('india','印度','in') THEN 'IN'
     WHEN lower(country) IN ('uk','united kingdom','britain','great britain','英国','英國','gb') THEN 'GB'
     WHEN lower(country) IN ('germany','deutschland','德国','德國','de') THEN 'DE'
     WHEN lower(country) IN ('france','法国','法國','fr') THEN 'FR'
     WHEN lower(country) IN ('italy','italia','意大利','it') THEN 'IT'
     WHEN lower(country) IN ('spain','españa','espana','西班牙','es') THEN 'ES'
     WHEN lower(country) IN ('netherlands','holland','荷兰','荷蘭','nl') THEN 'NL'
     WHEN lower(country) IN ('canada','加拿大','ca') THEN 'CA'
     WHEN lower(country) IN ('australia','澳大利亚','澳大利亞','澳洲','au') THEN 'AU'
     WHEN lower(country) IN ('new zealand','新西兰','紐西蘭','nz') THEN 'NZ'
     WHEN lower(country) IN ('mexico','méxico','墨西哥','mx') THEN 'MX'
     WHEN lower(country) IN ('brazil','brasil','巴西','br') THEN 'BR'
     WHEN lower(country) IN ('russia','russian federation','俄罗斯','俄羅斯','ru') THEN 'RU'
     WHEN lower(country) IN ('united arab emirates','uae','阿联酋','阿聯酋','ae') THEN 'AE'
     WHEN lower(country) IN ('saudi arabia','沙特阿拉伯','sa') THEN 'SA'
     WHEN lower(country) IN ('turkey','türkiye','turkiye','土耳其','tr') THEN 'TR'
     WHEN lower(country) IN ('portugal','葡萄牙','pt') THEN 'PT'
     ELSE country
   END,
   updated_at = unixepoch() * 1000
 WHERE country IS NOT NULL;

UPDATE orders
   SET ship_country = CASE
     WHEN lower(ship_country) IN ('zhongguo','china','mainland china','中国','中國','prc','cn') THEN 'CN'
     WHEN lower(ship_country) IN ('vietnam','viet nam','越南','vn') THEN 'VN'
     WHEN lower(ship_country) IN ('usa','united states','united states of america','u.s.','u.s.a.','america','美国','美國','us') THEN 'US'
     WHEN lower(ship_country) IN ('hong kong','hong kong sar','香港','hk') THEN 'HK'
     WHEN lower(ship_country) IN ('macau','macao','澳门','澳門','mo') THEN 'MO'
     WHEN lower(ship_country) IN ('taiwan','台湾','台灣','tw') THEN 'TW'
     WHEN lower(ship_country) IN ('japan','日本','jp') THEN 'JP'
     WHEN lower(ship_country) IN ('south korea','korea','republic of korea','韩国','韓國','kr') THEN 'KR'
     WHEN lower(ship_country) IN ('singapore','新加坡','sg') THEN 'SG'
     WHEN lower(ship_country) IN ('malaysia','马来西亚','馬來西亞','my') THEN 'MY'
     WHEN lower(ship_country) IN ('thailand','泰国','泰國','th') THEN 'TH'
     WHEN lower(ship_country) IN ('indonesia','印度尼西亚','印尼','id') THEN 'ID'
     WHEN lower(ship_country) IN ('philippines','菲律宾','菲律賓','ph') THEN 'PH'
     WHEN lower(ship_country) IN ('india','印度','in') THEN 'IN'
     WHEN lower(ship_country) IN ('uk','united kingdom','britain','great britain','英国','英國','gb') THEN 'GB'
     WHEN lower(ship_country) IN ('germany','deutschland','德国','德國','de') THEN 'DE'
     WHEN lower(ship_country) IN ('france','法国','法國','fr') THEN 'FR'
     WHEN lower(ship_country) IN ('italy','italia','意大利','it') THEN 'IT'
     WHEN lower(ship_country) IN ('spain','españa','espana','西班牙','es') THEN 'ES'
     WHEN lower(ship_country) IN ('netherlands','holland','荷兰','荷蘭','nl') THEN 'NL'
     WHEN lower(ship_country) IN ('canada','加拿大','ca') THEN 'CA'
     WHEN lower(ship_country) IN ('australia','澳大利亚','澳大利亞','澳洲','au') THEN 'AU'
     WHEN lower(ship_country) IN ('new zealand','新西兰','紐西蘭','nz') THEN 'NZ'
     WHEN lower(ship_country) IN ('mexico','méxico','墨西哥','mx') THEN 'MX'
     WHEN lower(ship_country) IN ('brazil','brasil','巴西','br') THEN 'BR'
     WHEN lower(ship_country) IN ('russia','russian federation','俄罗斯','俄羅斯','ru') THEN 'RU'
     WHEN lower(ship_country) IN ('united arab emirates','uae','阿联酋','阿聯酋','ae') THEN 'AE'
     WHEN lower(ship_country) IN ('saudi arabia','沙特阿拉伯','sa') THEN 'SA'
     WHEN lower(ship_country) IN ('turkey','türkiye','turkiye','土耳其','tr') THEN 'TR'
     WHEN lower(ship_country) IN ('portugal','葡萄牙','pt') THEN 'PT'
     ELSE ship_country
   END,
   updated_at = unixepoch() * 1000
 WHERE ship_country IS NOT NULL;

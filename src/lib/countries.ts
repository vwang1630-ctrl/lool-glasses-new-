// 国家字典 + 归一化 + 本地化显示。
//
// 库内国家码：ISO 3166-1 alpha-2 大写两字（"US" / "CN" / "GB" ...）。所有从用户
// 端进 DB 的国家字段都必须通过 isValidIsoCountry()；旧库历史值靠
// normalizeLegacyCountry() 一次性归一化。
//
// 显示名优先用 Intl.DisplayNames(lang, { type: "region" })（Cloudflare Workers
// V8 + 浏览器都支持），无法识别时退回内置英文名。

import type { Lang } from "./i18n";

// ISO 3166-1 alpha-2 全集 + 英文 short name。英文名只用于 Intl.DisplayNames
// 失败时的 fallback 与服务端日志，不直接展示给用户（用 getCountryName 才会）。
//
// 排序：英文字母升序。在 picker 里我们再按当前语言的本地化名重排。
const ISO_COUNTRIES_EN: ReadonlyArray<readonly [string, string]> = [
  ["AF", "Afghanistan"],
  ["AX", "Åland Islands"],
  ["AL", "Albania"],
  ["DZ", "Algeria"],
  ["AS", "American Samoa"],
  ["AD", "Andorra"],
  ["AO", "Angola"],
  ["AI", "Anguilla"],
  ["AQ", "Antarctica"],
  ["AG", "Antigua & Barbuda"],
  ["AR", "Argentina"],
  ["AM", "Armenia"],
  ["AW", "Aruba"],
  ["AU", "Australia"],
  ["AT", "Austria"],
  ["AZ", "Azerbaijan"],
  ["BS", "Bahamas"],
  ["BH", "Bahrain"],
  ["BD", "Bangladesh"],
  ["BB", "Barbados"],
  ["BY", "Belarus"],
  ["BE", "Belgium"],
  ["BZ", "Belize"],
  ["BJ", "Benin"],
  ["BM", "Bermuda"],
  ["BT", "Bhutan"],
  ["BO", "Bolivia"],
  ["BA", "Bosnia & Herzegovina"],
  ["BW", "Botswana"],
  ["BV", "Bouvet Island"],
  ["BR", "Brazil"],
  ["IO", "British Indian Ocean Territory"],
  ["BN", "Brunei"],
  ["BG", "Bulgaria"],
  ["BF", "Burkina Faso"],
  ["BI", "Burundi"],
  ["CV", "Cabo Verde"],
  ["KH", "Cambodia"],
  ["CM", "Cameroon"],
  ["CA", "Canada"],
  ["KY", "Cayman Islands"],
  ["CF", "Central African Republic"],
  ["TD", "Chad"],
  ["CL", "Chile"],
  ["CN", "China"],
  ["CX", "Christmas Island"],
  ["CC", "Cocos (Keeling) Islands"],
  ["CO", "Colombia"],
  ["KM", "Comoros"],
  ["CG", "Congo - Brazzaville"],
  ["CD", "Congo - Kinshasa"],
  ["CK", "Cook Islands"],
  ["CR", "Costa Rica"],
  ["CI", "Côte d’Ivoire"],
  ["HR", "Croatia"],
  ["CU", "Cuba"],
  ["CW", "Curaçao"],
  ["CY", "Cyprus"],
  ["CZ", "Czechia"],
  ["DK", "Denmark"],
  ["DJ", "Djibouti"],
  ["DM", "Dominica"],
  ["DO", "Dominican Republic"],
  ["EC", "Ecuador"],
  ["EG", "Egypt"],
  ["SV", "El Salvador"],
  ["GQ", "Equatorial Guinea"],
  ["ER", "Eritrea"],
  ["EE", "Estonia"],
  ["SZ", "Eswatini"],
  ["ET", "Ethiopia"],
  ["FK", "Falkland Islands"],
  ["FO", "Faroe Islands"],
  ["FJ", "Fiji"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["GF", "French Guiana"],
  ["PF", "French Polynesia"],
  ["TF", "French Southern Territories"],
  ["GA", "Gabon"],
  ["GM", "Gambia"],
  ["GE", "Georgia"],
  ["DE", "Germany"],
  ["GH", "Ghana"],
  ["GI", "Gibraltar"],
  ["GR", "Greece"],
  ["GL", "Greenland"],
  ["GD", "Grenada"],
  ["GP", "Guadeloupe"],
  ["GU", "Guam"],
  ["GT", "Guatemala"],
  ["GG", "Guernsey"],
  ["GN", "Guinea"],
  ["GW", "Guinea-Bissau"],
  ["GY", "Guyana"],
  ["HT", "Haiti"],
  ["HM", "Heard & McDonald Islands"],
  ["HN", "Honduras"],
  ["HK", "Hong Kong SAR China"],
  ["HU", "Hungary"],
  ["IS", "Iceland"],
  ["IN", "India"],
  ["ID", "Indonesia"],
  ["IR", "Iran"],
  ["IQ", "Iraq"],
  ["IE", "Ireland"],
  ["IM", "Isle of Man"],
  ["IL", "Israel"],
  ["IT", "Italy"],
  ["JM", "Jamaica"],
  ["JP", "Japan"],
  ["JE", "Jersey"],
  ["JO", "Jordan"],
  ["KZ", "Kazakhstan"],
  ["KE", "Kenya"],
  ["KI", "Kiribati"],
  ["KW", "Kuwait"],
  ["KG", "Kyrgyzstan"],
  ["LA", "Laos"],
  ["LV", "Latvia"],
  ["LB", "Lebanon"],
  ["LS", "Lesotho"],
  ["LR", "Liberia"],
  ["LY", "Libya"],
  ["LI", "Liechtenstein"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["MO", "Macao SAR China"],
  ["MG", "Madagascar"],
  ["MW", "Malawi"],
  ["MY", "Malaysia"],
  ["MV", "Maldives"],
  ["ML", "Mali"],
  ["MT", "Malta"],
  ["MH", "Marshall Islands"],
  ["MQ", "Martinique"],
  ["MR", "Mauritania"],
  ["MU", "Mauritius"],
  ["YT", "Mayotte"],
  ["MX", "Mexico"],
  ["FM", "Micronesia"],
  ["MD", "Moldova"],
  ["MC", "Monaco"],
  ["MN", "Mongolia"],
  ["ME", "Montenegro"],
  ["MS", "Montserrat"],
  ["MA", "Morocco"],
  ["MZ", "Mozambique"],
  ["MM", "Myanmar (Burma)"],
  ["NA", "Namibia"],
  ["NR", "Nauru"],
  ["NP", "Nepal"],
  ["NL", "Netherlands"],
  ["NC", "New Caledonia"],
  ["NZ", "New Zealand"],
  ["NI", "Nicaragua"],
  ["NE", "Niger"],
  ["NG", "Nigeria"],
  ["NU", "Niue"],
  ["NF", "Norfolk Island"],
  ["KP", "North Korea"],
  ["MK", "North Macedonia"],
  ["MP", "Northern Mariana Islands"],
  ["NO", "Norway"],
  ["OM", "Oman"],
  ["PK", "Pakistan"],
  ["PW", "Palau"],
  ["PS", "Palestinian Territories"],
  ["PA", "Panama"],
  ["PG", "Papua New Guinea"],
  ["PY", "Paraguay"],
  ["PE", "Peru"],
  ["PH", "Philippines"],
  ["PN", "Pitcairn Islands"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["PR", "Puerto Rico"],
  ["QA", "Qatar"],
  ["RE", "Réunion"],
  ["RO", "Romania"],
  ["RU", "Russia"],
  ["RW", "Rwanda"],
  ["WS", "Samoa"],
  ["SM", "San Marino"],
  ["ST", "São Tomé & Príncipe"],
  ["SA", "Saudi Arabia"],
  ["SN", "Senegal"],
  ["RS", "Serbia"],
  ["SC", "Seychelles"],
  ["SL", "Sierra Leone"],
  ["SG", "Singapore"],
  ["SX", "Sint Maarten"],
  ["SK", "Slovakia"],
  ["SI", "Slovenia"],
  ["SB", "Solomon Islands"],
  ["SO", "Somalia"],
  ["ZA", "South Africa"],
  ["GS", "South Georgia & South Sandwich Islands"],
  ["KR", "South Korea"],
  ["SS", "South Sudan"],
  ["ES", "Spain"],
  ["LK", "Sri Lanka"],
  ["BL", "St. Barthélemy"],
  ["SH", "St. Helena"],
  ["KN", "St. Kitts & Nevis"],
  ["LC", "St. Lucia"],
  ["MF", "St. Martin"],
  ["PM", "St. Pierre & Miquelon"],
  ["VC", "St. Vincent & Grenadines"],
  ["SD", "Sudan"],
  ["SR", "Suriname"],
  ["SJ", "Svalbard & Jan Mayen"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
  ["SY", "Syria"],
  ["TW", "Taiwan"],
  ["TJ", "Tajikistan"],
  ["TZ", "Tanzania"],
  ["TH", "Thailand"],
  ["TL", "Timor-Leste"],
  ["TG", "Togo"],
  ["TK", "Tokelau"],
  ["TO", "Tonga"],
  ["TT", "Trinidad & Tobago"],
  ["TN", "Tunisia"],
  ["TR", "Türkiye"],
  ["TM", "Turkmenistan"],
  ["TC", "Turks & Caicos Islands"],
  ["TV", "Tuvalu"],
  ["UG", "Uganda"],
  ["UA", "Ukraine"],
  ["AE", "United Arab Emirates"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["UM", "U.S. Outlying Islands"],
  ["UY", "Uruguay"],
  ["UZ", "Uzbekistan"],
  ["VU", "Vanuatu"],
  ["VA", "Vatican City"],
  ["VE", "Venezuela"],
  ["VN", "Vietnam"],
  ["VG", "British Virgin Islands"],
  ["VI", "U.S. Virgin Islands"],
  ["WF", "Wallis & Futuna"],
  ["EH", "Western Sahara"],
  ["YE", "Yemen"],
  ["ZM", "Zambia"],
  ["ZW", "Zimbabwe"],
];

const ISO_CODES = new Set<string>(ISO_COUNTRIES_EN.map(([c]) => c));

/** All ISO codes (alpha-2, uppercase), in English alphabetic order. */
export const ALL_ISO_COUNTRY_CODES: ReadonlyArray<string> =
  ISO_COUNTRIES_EN.map(([c]) => c);

/**
 * Display-name lookup. Uses Intl.DisplayNames(lang, { type: "region" }) when
 * available (Cloudflare Workers + every modern browser), falls back to the
 * built-in English name. Returns the bare code if the code itself is unknown.
 */
export function getCountryName(code: string, lang: Lang): string {
  const upper = (code || "").toUpperCase();
  if (!ISO_CODES.has(upper)) return code;
  try {
    const dn = new Intl.DisplayNames([lang], { type: "region" });
    const out = dn.of(upper);
    if (out && out !== upper) return out;
  } catch {
    // Intl.DisplayNames missing or lang unsupported — fall through.
  }
  return ISO_COUNTRIES_EN.find(([c]) => c === upper)?.[1] ?? code;
}

export function isValidIsoCountry(code: unknown): code is string {
  return typeof code === "string" && ISO_CODES.has(code.toUpperCase());
}

/**
 * Picker-ready list: ISO code + name in the user's UI language, sorted by
 * that localized name. Cheap to call on every render (~250 strings).
 */
export function getCountryOptions(
  lang: Lang,
): { code: string; name: string }[] {
  const collator = (() => {
    try {
      return new Intl.Collator(lang);
    } catch {
      return new Intl.Collator("en");
    }
  })();
  return ISO_COUNTRIES_EN.map(([code]) => ({
    code,
    name: getCountryName(code, lang),
  })).sort((a, b) => collator.compare(a.name, b.name));
}

// -- Legacy normalization ----------------------------------------------------
//
// Migration 0057 uses this to turn historical free-text country fields into
// ISO codes. Also acceptable as a server-side last-line-of-defense if a client
// somehow POSTs an unnormalized value, but the picker UI is the primary gate.
//
// Strategy:
//   1. Upper-cased 2-letter input that's a valid ISO code → that code.
//   2. Direct hit on a curated alias map (English short name / 中文 / 拼音 /
//      Vietnamese / Spanish / common typos) → that code.
//   3. Else null. Caller decides whether to reject, log, or leave the row as-is.

const ALIASES: Readonly<Record<string, string>> = Object.fromEntries([
  // English short names (lowercased) — covers the long names that match an
  // ISO entry verbatim, plus common shorthand.
  ...ISO_COUNTRIES_EN.map(([code, en]) => [en.toLowerCase(), code] as const),
  // Manual overrides + locale variants. Keep ordered by ISO code so it's easy
  // to scan for duplicates.
  ["united states of america", "US"],
  ["usa", "US"],
  ["u.s.a.", "US"],
  ["u.s.", "US"],
  ["america", "US"],
  ["美国", "US"],
  ["美國", "US"],
  ["メイコク", "US"], // 日 (rare)
  ["estados unidos", "US"],
  ["états-unis", "US"],
  ["etats-unis", "US"],
  ["vereinigte staaten", "US"],
  ["uk", "GB"],
  ["u.k.", "GB"],
  ["england", "GB"],
  ["britain", "GB"],
  ["great britain", "GB"],
  ["英国", "GB"],
  ["英國", "GB"],
  ["china", "CN"],
  ["mainland china", "CN"],
  ["prc", "CN"],
  ["p.r.c.", "CN"],
  ["zhongguo", "CN"],
  ["中国", "CN"],
  ["中國", "CN"],
  ["中国大陆", "CN"],
  ["中華人民共和國", "CN"],
  ["china (mainland)", "CN"],
  ["hong kong", "HK"],
  ["hong kong sar", "HK"],
  ["香港", "HK"],
  ["macau", "MO"],
  ["macao", "MO"],
  ["澳门", "MO"],
  ["澳門", "MO"],
  ["taiwan", "TW"],
  ["台湾", "TW"],
  ["台灣", "TW"],
  ["chinese taipei", "TW"],
  ["japan", "JP"],
  ["日本", "JP"],
  ["nihon", "JP"],
  ["nippon", "JP"],
  ["korea", "KR"],
  ["south korea", "KR"],
  ["republic of korea", "KR"],
  ["대한민국", "KR"],
  ["한국", "KR"],
  ["韩国", "KR"],
  ["韓國", "KR"],
  ["north korea", "KP"],
  ["dprk", "KP"],
  ["朝鲜", "KP"],
  ["朝鮮", "KP"],
  ["singapore", "SG"],
  ["新加坡", "SG"],
  ["malaysia", "MY"],
  ["马来西亚", "MY"],
  ["馬來西亞", "MY"],
  ["thailand", "TH"],
  ["泰国", "TH"],
  ["泰國", "TH"],
  ["indonesia", "ID"],
  ["印度尼西亚", "ID"],
  ["印尼", "ID"],
  ["philippines", "PH"],
  ["菲律宾", "PH"],
  ["菲律賓", "PH"],
  ["vietnam", "VN"],
  ["viet nam", "VN"],
  ["việt nam", "VN"],
  ["越南", "VN"],
  ["yuenan", "VN"],
  ["india", "IN"],
  ["印度", "IN"],
  ["germany", "DE"],
  ["deutschland", "DE"],
  ["德国", "DE"],
  ["德國", "DE"],
  ["france", "FR"],
  ["法国", "FR"],
  ["法國", "FR"],
  ["italy", "IT"],
  ["italia", "IT"],
  ["意大利", "IT"],
  ["spain", "ES"],
  ["españa", "ES"],
  ["espana", "ES"],
  ["西班牙", "ES"],
  ["portugal", "PT"],
  ["葡萄牙", "PT"],
  ["netherlands", "NL"],
  ["holland", "NL"],
  ["the netherlands", "NL"],
  ["荷兰", "NL"],
  ["荷蘭", "NL"],
  ["canada", "CA"],
  ["加拿大", "CA"],
  ["australia", "AU"],
  ["澳大利亚", "AU"],
  ["澳大利亞", "AU"],
  ["澳洲", "AU"],
  ["new zealand", "NZ"],
  ["新西兰", "NZ"],
  ["紐西蘭", "NZ"],
  ["russia", "RU"],
  ["russian federation", "RU"],
  ["俄罗斯", "RU"],
  ["俄羅斯", "RU"],
  ["mexico", "MX"],
  ["méxico", "MX"],
  ["墨西哥", "MX"],
  ["brazil", "BR"],
  ["brasil", "BR"],
  ["巴西", "BR"],
  ["united arab emirates", "AE"],
  ["uae", "AE"],
  ["阿联酋", "AE"],
  ["阿聯酋", "AE"],
  ["saudi arabia", "SA"],
  ["沙特阿拉伯", "SA"],
  ["turkey", "TR"],
  ["türkiye", "TR"],
  ["turkiye", "TR"],
  ["土耳其", "TR"],
]);

/**
 * Best-effort: turn arbitrary user / legacy text into a valid ISO alpha-2
 * code. Returns null when no confident match — caller decides what to do
 * (typically: keep the row as-is and surface for manual fix).
 */
export function normalizeLegacyCountry(
  input: string | null | undefined,
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && ISO_CODES.has(upper)) return upper;
  const key = trimmed.toLowerCase();
  return ALIASES[key] ?? null;
}

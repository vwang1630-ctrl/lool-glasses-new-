// Language picker for DB JSON i18n fields.
// All user-facing text fields (banner.eyebrow/title/sub, product.name/intro/description,
// color.label, ...) are stored in D1 as TEXT JSON of shape:
//   {"zh":"…","en":"…","ja":"…","ko":"…","es":"…","fr":"…","de":"…","it":"…","pt":"…","ar":"…"}
// Only zh + en are guaranteed to be filled (legacy backfill from 0021); other 8 langs are
// optional. Frontend picks the contentLang first, falls back to en, then to first non-empty.

export type LangMap = Record<string, string | null | undefined>;

/** Parse a DB JSON string into a {lang: text} object. Returns {} on bad input. */
export function parseLangJson(s: string | null | undefined): LangMap {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as LangMap;
    return {};
  } catch {
    return {};
  }
}

/** Pick the best string for the given lang, with en fallback then any-nonempty fallback.
 *  Accepts any object — runtime only reads string-valued keys, so it's safe to pass
 *  front-end option objects (`{id, en, zh, icon, ...}`) directly. */
export function pickLang(
  field: Record<string, unknown> | string | null | undefined,
  lang: string,
): string {
  const map: Record<string, unknown> =
    typeof field === "string" ? parseLangJson(field) : (field ?? {});
  const ordered = [
    lang,
    "en",
    "zh",
    "ja",
    "ko",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ar",
  ];
  for (const k of ordered) {
    const v = map[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return "";
}

/** For arrays-by-lang fields like highlights_json: {"zh":[...], "en":[...]}. */
export function pickLangArray(
  field: Record<string, unknown> | string | null | undefined,
  lang: string,
): string[] {
  const map: Record<string, unknown> =
    typeof field === "string"
      ? (parseLangJson(field) as Record<string, unknown>)
      : (field ?? {});
  const ordered = [lang, "en", "zh"];
  for (const k of ordered) {
    const v = map[k];
    if (Array.isArray(v) && v.length > 0) {
      return v.filter((x): x is string => typeof x === "string");
    }
  }
  return [];
}

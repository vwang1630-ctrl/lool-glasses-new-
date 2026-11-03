// Server-side helpers for the *_json (LangMap) column convention.
// Mirrors src/lib/lang.ts on the client; kept here to avoid pulling React
// helpers into edge worker code.

const VALID_LANGS = new Set([
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
  "vi",
  "th",
  "id",
  "ms",
]);

/**
 * Coerce arbitrary admin POST/PATCH input into a JSON string suitable for a
 * `*_json` column. Accepts:
 *
 * - object form `{ zh: "…", en: "…", … }` (preferred)
 * - already-serialized JSON string form
 *
 * Strips unknown lang keys, non-string values, and empty/whitespace-only
 * strings. Returns `null` if no valid lang/value pair survived (so the
 * column becomes NULL instead of `"{}"`).
 */
export function cleanLangMapInput(raw: unknown): string | null {
  let map: Record<string, unknown> | null = null;
  if (typeof raw === "string" && raw.trim() !== "") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        map = parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    map = raw as Record<string, unknown>;
  }
  if (!map) return null;

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    if (!VALID_LANGS.has(k)) continue;
    if (typeof v !== "string") continue;
    const trimmed = v.trim();
    if (!trimmed) continue;
    out[k] = trimmed;
  }
  return Object.keys(out).length > 0 ? JSON.stringify(out) : null;
}

/**
 * Parse a `*_json` column value into an object. Used by GET handlers so the
 * client receives a plain object (not a raw string). Returns `{}` for
 * NULL/malformed input — callers can decide whether to treat that as "no
 * override" or render an empty editor.
 */
export function parseLangMapColumn(raw: unknown): Record<string, string> {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
  } catch {
    /* ignore */
  }
  return {};
}

// Canonical 12-color palette for frame `color_family` and 4-tier surface
// `finish` enum. Both are hardcoded (not DB lookup tables) — same pattern as
// `shape` / `material` / `style`. Adding a new color/finish = code deploy.
//
// AI-driven upload writes `product_colors.hex` only; the server snaps that hex
// to the nearest palette family via `nearestColorFamily`. Filter swatches on
// the PLP are rendered from this palette directly, not from per-product rows,
// so multiple products sharing the same family deduplicate to one swatch.

export type ColorFamilyId =
  | "black"
  | "tortoise"
  | "brown"
  | "beige"
  | "white"
  | "gray"
  | "silver"
  | "gold"
  | "olive"
  | "forest"
  | "burgundy"
  | "clear";

export interface ColorFamilyDef {
  id: ColorFamilyId;
  hex: string | null; // null = transparent/clear (swatch rendered as outline)
  label: { en: string; zh: string };
}

export const COLOR_PALETTE: readonly ColorFamilyDef[] = [
  { id: "black", hex: "#1a1a1a", label: { en: "Black", zh: "黑" } },
  { id: "tortoise", hex: "#6e3f1d", label: { en: "Tortoise", zh: "玳瑁" } },
  { id: "brown", hex: "#8b5a2b", label: { en: "Brown", zh: "棕" } },
  { id: "beige", hex: "#d9c8a8", label: { en: "Beige", zh: "米色" } },
  { id: "white", hex: "#f5f1ea", label: { en: "White", zh: "白" } },
  { id: "gray", hex: "#8a8a8a", label: { en: "Gray", zh: "灰" } },
  { id: "silver", hex: "#c0c0c0", label: { en: "Silver", zh: "银" } },
  { id: "gold", hex: "#c9a96e", label: { en: "Gold", zh: "金" } },
  { id: "olive", hex: "#7a7a3e", label: { en: "Olive", zh: "橄榄" } },
  { id: "forest", hex: "#2d4a3e", label: { en: "Forest", zh: "墨绿" } },
  { id: "burgundy", hex: "#6e1f2f", label: { en: "Burgundy", zh: "酒红" } },
  { id: "clear", hex: null, label: { en: "Clear", zh: "透明" } },
] as const;

export const COLOR_FAMILY_IDS: readonly ColorFamilyId[] = COLOR_PALETTE.map(
  (c) => c.id,
);

export type FinishId = "matte" | "gloss" | "satin" | "brushed";

export interface FinishDef {
  id: FinishId;
  label: { en: string; zh: string };
}

export const FINISH_OPTIONS: readonly FinishDef[] = [
  { id: "matte", label: { en: "Matte", zh: "哑光" } },
  { id: "gloss", label: { en: "Gloss", zh: "亮面" } },
  { id: "satin", label: { en: "Satin", zh: "缎面" } },
  { id: "brushed", label: { en: "Brushed", zh: "拉丝" } },
] as const;

export const FINISH_IDS: readonly FinishId[] = FINISH_OPTIONS.map((f) => f.id);

// ---------- nearest-match (CIE Lab Delta E) ----------

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace(/^#/, ""), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function hexToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToLab(r, g, b);
}

const PALETTE_LAB: ReadonlyArray<{
  id: ColorFamilyId;
  lab: [number, number, number] | null;
}> = COLOR_PALETTE.map((c) => ({
  id: c.id,
  lab: c.hex ? hexToLab(c.hex) : null,
}));

/**
 * Snap an arbitrary hex (or null for transparent) to the nearest palette
 * family. Uses CIE Lab Euclidean distance (≈ Delta E 76) — perceptually
 * uniform enough for 12 well-separated buckets.
 */
export function nearestColorFamily(
  hex: string | null | undefined,
): ColorFamilyId {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return "clear";
  const target = hexToLab(hex);
  let bestId: ColorFamilyId = "black";
  let bestDist = Infinity;
  for (const p of PALETTE_LAB) {
    if (!p.lab) continue; // skip 'clear' — it has no hex, only NULL maps to it
    const d = Math.hypot(
      target[0] - p.lab[0],
      target[1] - p.lab[1],
      target[2] - p.lab[2],
    );
    if (d < bestDist) {
      bestDist = d;
      bestId = p.id;
    }
  }
  return bestId;
}

export function colorFamilyDef(id: ColorFamilyId): ColorFamilyDef {
  return COLOR_PALETTE.find((c) => c.id === id) ?? COLOR_PALETTE[0];
}

export function finishDef(id: FinishId): FinishDef {
  return FINISH_OPTIONS.find((f) => f.id === id) ?? FINISH_OPTIONS[0];
}

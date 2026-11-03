// Frame-measurement diagram for the PDP. Renders a per-product silhouette
// (one of nine homepage frame shapes) at 2.5× scale, plus live measurement
// annotations bound to product.size.
//
// Layout choice driven by the user reference design:
//   • The silhouette uses a heavier stroke (2px) so the frame reads as the
//     subject of the drawing.
//   • Dimension lines, arrows, and labels use a thinner stroke (1.3px) so
//     they sit on top as a lighter overlay layer.
//   • Lens Width + value live INSIDE the left lens, centered, with a
//     horizontal arrow.
//   • Lens Height + value live INSIDE the right lens, centered, with a
//     vertical arrow positioned so that — for every one of the nine shapes
//     — both endpoints stay strictly inside the lens bounding box.

import type { Shape } from "@/data/products";
import { useI18n } from "@/lib/i18n";

interface Props {
  lensWidth: number;
  bridge: number;
  temple: number;
  /** Product frame shape — picks the lens silhouette. Falls back to rectangle. */
  shape?: Shape;
  /** Optional override for derived lens height; defaults to round(lensWidth × 0.78). */
  lensHeight?: number;
  /** Optional override for total frame width; defaults to lensWidth × 2 + bridge + 5. */
  frameWidth?: number;
  className?: string;
}

// Coordinate system: outer viewBox 440×320. The silhouette is drawn inside
// `<g transform="translate(45 30) scale(2.5)">`, so each shape's native
// 140×60 viewBox maps to outer x∈[45, 395], y∈[30, 180]. Lens centers
// (icon (36, 32) and (104, 32)) map to outer (135, 110) and (305, 110).
//
// Vertical-annotation safety: the LH arrow runs from y=82 to y=140 (58px
// tall) at x=275. That requires every shape's right-lens bounding box to
// satisfy x∈[…, 275, …] and y∈[≤82, …, ≥140, …] when scaled. The shapes
// below are sized so that's true for all nine — rectangle is the only one
// that needed a small enlargement (height 24 → 40) versus the homepage
// icon; the others fit unchanged.

const SHAPE_PATHS: Record<Shape, React.ReactNode> = {
  aviator: (
    <>
      <path d="M8 14 L46 52 Q52 54 56 48 L66 20 Q67 14 63 14 Z" />
      <path d="M132 14 L94 52 Q88 54 84 48 L74 20 Q73 14 77 14 Z" />
      <path d="M66 24 L74 24" />
    </>
  ),
  cateye: (
    <>
      <path d="M6 22 Q12 50 36 50 Q62 50 64 16 Q60 12 36 14 Q14 18 6 22 Z" />
      <path d="M134 22 Q128 50 104 50 Q78 50 76 16 Q80 12 104 14 Q126 18 134 22 Z" />
      <path d="M64 22 L76 22" />
    </>
  ),
  round: (
    <>
      <circle cx="36" cy="32" r="22" />
      <circle cx="104" cy="32" r="22" />
      <path d="M58 32 L82 32" />
    </>
  ),
  oval: (
    <>
      <ellipse cx="36" cy="32" rx="28" ry="20" />
      <ellipse cx="104" cy="32" rx="28" ry="20" />
      <path d="M64 32 L76 32" />
    </>
  ),
  browline: (
    <>
      <path d="M6 14 Q34 4 62 14 Q58 52 36 52 Q12 52 6 14 Z" />
      <path d="M78 14 Q106 4 134 14 Q128 52 104 52 Q82 52 78 14 Z" />
      <path d="M62 18 L78 18" />
    </>
  ),
  butterfly: (
    <>
      <path d="M4 12 Q8 52 38 52 Q66 52 64 22 Q60 14 36 12 Q14 12 4 12 Z" />
      <path d="M136 12 Q132 52 102 52 Q74 52 76 22 Q80 14 104 12 Q126 12 136 12 Z" />
      <path d="M64 26 L76 26" />
    </>
  ),
  geometric: (
    <>
      <path d="M14 22 L24 10 L52 10 L64 26 L52 52 L24 52 Z" />
      <path d="M76 26 L88 10 L116 10 L126 22 L116 52 L88 52 Z" />
      <path d="M64 26 L76 26" />
    </>
  ),
  rectangle: (
    <>
      {/* Enlarged vs. homepage icon so the inner annotation arrow + label
          stack fits inside the lens box. */}
      <rect x="8" y="12" width="56" height="40" rx="7" />
      <rect x="76" y="12" width="56" height="40" rx="7" />
      <path d="M64 32 L76 32" />
    </>
  ),
  square: (
    <>
      <rect x="8" y="10" width="54" height="44" rx="8" />
      <rect x="78" y="10" width="54" height="44" rx="8" />
      <path d="M62 32 L78 32" />
    </>
  ),
};

export function FrameMeasurementsDiagram({
  lensWidth,
  bridge,
  temple,
  shape,
  lensHeight,
  frameWidth,
  className,
}: Props) {
  const { t } = useI18n();
  const lensH = lensHeight ?? Math.round(lensWidth * 0.78);
  const fw = frameWidth ?? lensWidth * 2 + bridge + 5;
  const shapeNode = SHAPE_PATHS[shape ?? "rectangle"];

  // "Lens Height" label sits inside the right lens — narrow vertical column.
  // For multi-word translations we split into two lines so they fit; single-
  // word languages (zh / ja / de) render on one line.
  const lhLabel = t("pdp.specs.lensHeight");
  const lhWords = lhLabel.split(" ");
  const lhLine1 =
    lhWords.length > 1
      ? lhWords.slice(0, Math.ceil(lhWords.length / 2)).join(" ")
      : lhLabel;
  const lhLine2 =
    lhWords.length > 1
      ? lhWords.slice(Math.ceil(lhWords.length / 2)).join(" ")
      : null;

  return (
    <svg
      viewBox="0 0 440 320"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={t("pdp.size.title")}
      className={`w-full h-auto text-foreground/85 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <marker
          id="fmd-arrow"
          markerWidth="9"
          markerHeight="9"
          refX="4.5"
          refY="4.5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L9 4.5 L0 9 z" fill="currentColor" stroke="none" />
        </marker>
      </defs>

      {/* ── FRONT VIEW ── per-product silhouette, drawn at 2.5× with the
          heavier subject stroke. */}
      <g transform="translate(45 30) scale(2.5)" strokeWidth="2">
        {shapeNode}
      </g>

      {/* Bridge label + short arrow above the bridge area */}
      <text
        x="220"
        y="16"
        textAnchor="middle"
        fontSize="13"
        fill="currentColor"
        stroke="none"
      >
        {t("product.bridge")} : <tspan fontWeight="600">{bridge} mm</tspan>
      </text>
      <line
        x1="208"
        y1="30"
        x2="232"
        y2="30"
        strokeWidth="1.3"
        markerStart="url(#fmd-arrow)"
        markerEnd="url(#fmd-arrow)"
      />

      {/* Lens Width — inside the left lens, centered.
          Left lens center ≈ (135, 110); 74px arrow at y=115 fits every shape
          (narrowest is round at 110px wide). */}
      <text
        x="135"
        y="100"
        textAnchor="middle"
        fontSize="12"
        fill="currentColor"
        stroke="none"
      >
        {t("pdp.specs.lensWidth")}
      </text>
      <line
        x1="98"
        y1="115"
        x2="172"
        y2="115"
        strokeWidth="1.3"
        markerStart="url(#fmd-arrow)"
        markerEnd="url(#fmd-arrow)"
      />
      <text
        x="135"
        y="133"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
      >
        {lensWidth} mm
      </text>

      {/* Lens Height — inside the right lens. Arrow sits at x=275 (left
          half of the right lens); label stack sits at x=312 (right half) so
          neither overlaps the other. Arrow runs y=82 → y=140 (58px tall),
          which keeps both endpoints strictly inside every shape's right-
          lens bounding box. */}
      <line
        x1="275"
        y1="82"
        x2="275"
        y2="140"
        strokeWidth="1.3"
        markerStart="url(#fmd-arrow)"
        markerEnd="url(#fmd-arrow)"
      />
      <text
        x="312"
        y={lhLine2 ? 98 : 108}
        textAnchor="middle"
        fontSize="11"
        fill="currentColor"
        stroke="none"
      >
        {lhLine1}
      </text>
      {lhLine2 && (
        <text
          x="312"
          y="112"
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          stroke="none"
        >
          {lhLine2}
        </text>
      )}
      <text
        x="312"
        y="130"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
      >
        {lensH} mm
      </text>

      {/* Frame Width — full-width arrow spanning under the silhouette */}
      <line
        x1="50"
        y1="200"
        x2="390"
        y2="200"
        strokeWidth="1.3"
        markerStart="url(#fmd-arrow)"
        markerEnd="url(#fmd-arrow)"
      />
      <text
        x="220"
        y="220"
        textAnchor="middle"
        fontSize="13"
        fill="currentColor"
        stroke="none"
      >
        {t("pdp.specs.frameWidth")} <tspan fontWeight="600">{fw} mm</tspan>
      </text>

      {/* ── SIDE VIEW ── small lens disc + single-stroke temple with subtle
          ear-tip curve; annotation arrow + label sit below. */}
      <g transform="translate(0, 240)" strokeWidth="2">
        <circle cx="55" cy="20" r="11" />
        <path d="M66 20 L388 20 Q398 20 398 30" />
      </g>
      <line
        x1="66"
        y1="282"
        x2="388"
        y2="282"
        strokeWidth="1.3"
        markerStart="url(#fmd-arrow)"
        markerEnd="url(#fmd-arrow)"
      />
      <text
        x="225"
        y="304"
        textAnchor="middle"
        fontSize="13"
        fill="currentColor"
        stroke="none"
      >
        {t("product.temple")} <tspan fontWeight="600">{temple} mm</tspan>
      </text>
    </svg>
  );
}

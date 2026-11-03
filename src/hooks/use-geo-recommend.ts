import { useEffect, useState } from "react";
import type { Gender, Product } from "@/data/products";

export type GeoRegion = "na" | "eu" | "other";

export interface GeoRecommendation {
  region: GeoRegion;
  /** Preferred gender ordering for chips & sorting (first = most relevant). */
  genderOrder: Gender[];
  /** Country/region label used in UI badges. */
  label: string;
}

/**
 * Lightweight client-side "AI GEO" — we approximate the user's region using
 * `Intl` timezone + browser language. This avoids a backend round-trip and is
 * good enough to power soft personalization (chip ordering, "Recommended for
 * your region" badges). It runs once on mount.
 */
export function useGeoRecommend(): GeoRecommendation {
  const [rec, setRec] = useState<GeoRecommendation>({
    region: "other",
    genderOrder: ["unisex", "women", "men"],
    label: "Global",
  });

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const lang = (navigator.language || "en").toLowerCase();

      // North America heuristic
      const isNA =
        tz.startsWith("America/") ||
        ["en-us", "en-ca", "fr-ca", "es-mx", "en-mx"].some((l) =>
          lang.startsWith(l),
        );
      // Europe heuristic
      const isEU =
        tz.startsWith("Europe/") ||
        [
          "en-gb",
          "fr",
          "de",
          "es",
          "it",
          "pt",
          "nl",
          "sv",
          "no",
          "da",
          "fi",
          "pl",
        ].some((l) => lang.startsWith(l));

      if (isNA) {
        setRec({
          region: "na",
          genderOrder: ["unisex", "men", "women"],
          label: "North America",
        });
      } else if (isEU) {
        setRec({
          region: "eu",
          genderOrder: ["women", "men", "unisex"],
          label: "Europe",
        });
      }
    } catch {
      // keep defaults
    }
  }, []);

  return rec;
}

/** Whether a product is locally trending for the user's detected region. */
export function isLocallyRecommended(
  product: Product,
  rec: GeoRecommendation,
): boolean {
  const top = rec.genderOrder[0];
  if (!product.genders?.includes(top)) return false;

  if (rec.region === "na") {
    // NA: prefer larger / casual silhouettes
    return ["aviator", "square", "round"].includes(product.shape);
  }
  if (rec.region === "eu") {
    // EU: prefer slim / minimal / cat-eye
    return (
      product.styles.includes("minimal") ||
      product.styles.includes("business") ||
      product.shape === "cateye"
    );
  }
  return false;
}

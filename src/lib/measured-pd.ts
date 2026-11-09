// PD measured by the /measure-pd camera tool, kept in localStorage so the lens
// wizard (often open in another tab) can offer it as a one-click fill.
import { useEffect, useState } from "react";

export interface MeasuredPd {
  /** Binocular distance PD in mm, rounded to 0.5. */
  pd: number;
  /** Monocular halves (right eye = OD, left eye = OS), rounded to 0.5. */
  odHalf: number | null;
  osHalf: number | null;
  method: "card" | "iris";
  /** Number of measurements averaged into `pd`. */
  samples: number;
  measuredAt: number;
}

const KEY = "lool:measured-pd";
const EVENT = "lool:measured-pd";

export function loadMeasuredPd(): MeasuredPd | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as MeasuredPd;
    return typeof v?.pd === "number" && v.pd >= 48 && v.pd <= 78 ? v : null;
  } catch {
    return null;
  }
}

export function saveMeasuredPd(v: MeasuredPd): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable — the result is still shown on screen */
  }
}

/** Live view of the saved measurement (updates across tabs and on focus). */
export function useMeasuredPd(): MeasuredPd | null {
  const [v, setV] = useState<MeasuredPd | null>(null);
  useEffect(() => {
    const read = () => setV(loadMeasuredPd());
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    window.addEventListener(EVENT, read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
      window.removeEventListener(EVENT, read);
    };
  }, []);
  return v;
}

export const roundHalf = (n: number) => Math.round(n * 2) / 2;

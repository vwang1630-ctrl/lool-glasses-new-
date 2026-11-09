// Minimal GA4 event helper. gtag is bootstrapped in __root.tsx head; this is a
// no-op during SSR or if the tag is blocked. Never send PII in params.

type GaParams = Record<string, string | number | boolean | undefined>;

export function gaEvent(name: string, params: GaParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", name, params);
  } catch {
    /* analytics must never break the UI */
  }
}

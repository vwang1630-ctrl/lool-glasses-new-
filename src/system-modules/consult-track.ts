// First-party consult-funnel capture.
//
// Owner rule (2026-09-14): WhatsApp is the communication channel and orders
// close on-site — off-site payment is a risk. The funnel's only blind spot was
// the consult step (WhatsApp chats never touch the server). This fires a tiny
// fire-and-forget beacon on every consult click so the consult_events table can
// answer "how many conversations → how many site orders".
//
// Never awaits, never throws: a tracking failure must never break the click.
import { attributionToken } from "@/lib/attribution";

export type ConsultAction = "whatsapp_click" | "consult_submit";

export function trackConsult(
  action: ConsultAction,
  surface: string,
  extra?: { productSlug?: string; note?: string },
): void {
  try {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({
      action,
      surface: (surface || "unknown").slice(0, 64),
      pagePath: String(window.location?.pathname ?? "").slice(0, 256),
      productSlug: (extra?.productSlug ?? "").slice(0, 128),
      locale: String(document.documentElement?.lang ?? "").slice(0, 8),
      // 归因 token 并进 note(周报按 attr[first:..|last:..] 解析网扣)
      note: ((extra?.note ? extra.note + " " : "") + attributionToken()).slice(0, 256),
    });
    const blob = new Blob([payload], { type: "application/json" });
    // sendBeacon survives the tab hand-off to WhatsApp; fetch+keepalive is the
    // fallback for browsers without it.
    if (navigator.sendBeacon?.("/api/public/consult-track", blob)) return;
    void fetch("/api/public/consult-track", { method: "POST", body: payload, keepalive: true });
  } catch {
    /* tracking must never break the click */
  }
}

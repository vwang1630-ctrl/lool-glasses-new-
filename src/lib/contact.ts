// Public customer-service contact points. Single source so the footer, chat
// widget and any future "contact us" surfaces stay in sync.

/** WhatsApp number in international format, digits only (for wa.me links). */
export const WHATSAPP_NUMBER = "66641633446";

/** Build a wa.me click-to-chat link with an optional prefilled message. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Fire-and-forget attribution beacon (consult_events table). */
export function trackWhatsappClick(surface: string, locale: string): void {
  try {
    const body = JSON.stringify({
      action: "whatsapp_click",
      surface,
      pagePath: window.location.pathname,
      locale,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/public/consult-track",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/public/consult-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* tracking must never block the click */
  }
}

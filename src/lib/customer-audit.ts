export const CUSTOMER_CLIENT_ID_KEY = "lool_user_session_id";

type CustomerAuditAction =
  | "CLIENT_IDENTIFIED"
  | "LOGIN"
  | "LOGOUT"
  | "PAGE_VIEW"
  | "CART_ADD"
  | "CART_REMOVE"
  | "CART_QTY"
  | "CHECKOUT_STARTED"
  | "ORDER_CREATED"
  | "PAYMENT_STARTED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "TRYON_UPLOAD"
  | "TRYON_REQUEST"
  | "TRYON_SUCCEEDED"
  | "TRYON_FAILED"
  | "PRESCRIPTION_UPLOAD"
  | "ADDRESS_CHANGED"
  | "CONTACT_STARTED"
  | "SECURITY_SIGNAL";

interface CustomerAuditEvent {
  action: CustomerAuditAction;
  resourceType: string;
  resourceId?: string | null;
  actorEmail?: string | null;
  meta?: Record<string, unknown>;
}

const KEY_PAGE_PATHS = [
  "/products",
  "/cart",
  "/checkout",
  "/account",
  "/try-on",
  "/measure-pd",
];

let identified = false;

export function getCustomerClientId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(CUSTOMER_CLIENT_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : fallbackUuid();
    window.localStorage.setItem(CUSTOMER_CLIENT_ID_KEY, next);
    return next;
  } catch {
    return null;
  }
}

export function ensureCustomerClientId(): string | null {
  const clientId = getCustomerClientId();
  if (clientId && !identified) {
    identified = true;
    void trackCustomerEvent({
      action: "CLIENT_IDENTIFIED",
      resourceType: "client",
      resourceId: clientId,
    });
  }
  return clientId;
}

export function trackCustomerEvent(event: CustomerAuditEvent): void {
  const clientId = getCustomerClientId();
  if (!clientId) return;
  const body = JSON.stringify({
    clientId,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId ?? null,
    actorEmail: event.actorEmail ?? null,
    meta: event.meta ?? null,
  });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/customer/audit-log", blob)) return;
    }
  } catch {
    /* fall back to fetch */
  }
  fetch("/api/customer/audit-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackCustomerPageView(
  pathname: string,
  searchStr: string,
): void {
  if (!isKeyCustomerPath(pathname)) return;
  trackCustomerEvent({
    action: "PAGE_VIEW",
    resourceType: "page",
    resourceId: normalizePath(pathname),
    meta: { search: searchStr.slice(0, 256), title: document.title },
  });
}

function isKeyCustomerPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return KEY_PAGE_PATHS.some(
    (path) => normalized === path || normalized.endsWith(path),
  );
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function fallbackUuid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// /account — email + OTP order / prescription lookup. We don't operate a
// user-table login; customers prove ownership of an email by receiving a
// 6-digit code, and the server then issues an HttpOnly session cookie (see
// src/server/account-session.ts — 30-day rolling TTL).
//
// State model:
//   - cookie (server-issued) is the authoritative "logged in" signal
//   - localStorage cache is the per-browser snapshot of orders + rx so a
//     fresh tab can paint instantly while we revalidate against the cookie
//     in the background via GET /api/account/me
//   - sessionStorage is no longer used (its tab-close-kills-it behavior
//     contradicted the 30-day rolling cookie; we'd show the OTP screen even
//     though the user was effectively still signed in)

import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/lib/page-titles";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Package,
  FileText,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ChevronDown,
  Check,
  Truck,
  Copy as CopyIcon,
  MapPin,
  User,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Star,
  Clock,
  XCircle,
  RotateCcw,
  Ruler,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CountryPicker } from "@/components/CountryPicker";
import { getCountryName, isValidIsoCountry } from "@/lib/countries";
import { getCustomerClientId } from "@/lib/customer-audit";

const ACCOUNT_KEY = "lool_account_data_v2";
const LEGACY_SESSION_KEY = "lool_account_data_v1";

interface OrderItem {
  id: string;
  productId: string;
  productSlug: string;
  colorId: string | null;
  qty: number;
  name: { zh: string; en: string };
  framePng: string | null;
  lens: {
    skuId: string;
    category: string;
    index: string;
    color: string | null;
    retailCents: number;
  };
  prescriptionId: string | null;
  unitFrameCents: number;
  unitLensCents: number;
  lineTotalCents: number;
}

interface OrderShipment {
  carrier: string | null;
  trackingNumber: string | null;
  status: string;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shipping: {
    recipient: string;
    country: string;
    zip: string;
    address: string;
    phone: string;
  };
  paidAt: number | null;
  shippedAt: number | null;
  deliveredAt: number | null;
  cancelledAt: number | null;
  createdAt: number;
  shipment: OrderShipment | null;
  items: OrderItem[];
}

type RxKind = "single" | "reading" | "progressive";

interface RxRow {
  id: string;
  kind: RxKind;
  label: { zh: string | null; en: string | null };
  source: string;
  sph: { od: number | null; os: number | null };
  cyl: { od: number | null; os: number | null };
  axis: { od: number | null; os: number | null };
  add: { od: number | null; os: number | null };
  pd: { total: number | null; odHalf: number | null; osHalf: number | null };
  hasUpload: boolean;
  examDate: number | null;
  notes: string | null;
  createdAt: number;
}

const RX_KIND_ORDER: RxKind[] = ["single", "reading", "progressive"];

type SessionShape = {
  email: string;
  orders: OrderRow[];
  prescriptions: RxRow[];
  ts: number;
};

// Match the cookie TTL in src/server/account-session.ts. The cache itself
// has no hard expiry from this code's perspective — the cookie is the
// authority — but we still drop entries older than this to avoid surfacing
// month-stale snapshots after a forgotten browser comes back to life.
const ACCOUNT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ACCOUNT_CARD_CLASS =
  "rounded-[28px] border border-border/80 bg-card shadow-[0_18px_50px_rgba(45,34,22,0.06)]";
const ACCOUNT_INSET_CLASS =
  "rounded-[20px] border border-border/80 bg-[#faf8f5]";

export const Route = createFileRoute("/$lang/account")({
  head: ({ params }) => ({ meta: [{ title: pageTitle("account", params.lang) }] }),
  component: AccountPage,
});

function AccountPage() {
  const { t, contentLang } = useI18n();
  const [stage, setStage] = useState<"email" | "code" | "ready">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{
    orders: OrderRow[];
    prescriptions: RxRow[];
  } | null>(null);
  const [tab, setTab] = useState<"orders" | "rx" | "address" | "profile">(
    "orders",
  );

  // Restore on mount: paint instantly from the localStorage cache (if any),
  // then revalidate against the server via GET /api/account/me. If the cookie
  // is still alive we silently update the cache; if it's gone we drop back to
  // the email form so the user re-OTPs. One-time legacy-key sweep clears the
  // old sessionStorage entry.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      /* ignore */
    }

    let cached: SessionShape | null = null;
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionShape;
        if (Date.now() - parsed.ts <= ACCOUNT_TTL_MS) {
          cached = parsed;
        } else {
          localStorage.removeItem(ACCOUNT_KEY);
        }
      }
    } catch {
      /* bad cache, ignore */
    }

    if (cached) {
      setEmail(cached.email);
      setData({ orders: cached.orders, prescriptions: cached.prescriptions });
      setStage("ready");
    }

    // Revalidate. /api/account/me returns 401 if the cookie expired; in that
    // case we drop the cached state and go back to the email form.
    let cancelled = false;
    fetch("/api/account/me")
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) {
          try {
            localStorage.removeItem(ACCOUNT_KEY);
          } catch {
            /* ignore */
          }
          if (cached) {
            // Cache claimed signed-in but cookie is gone — reset UI.
            setData(null);
            setEmail("");
            setStage("email");
          }
          return;
        }
        if (!r.ok) return;
        const j = (await r.json()) as {
          email: string;
          orders: OrderRow[];
          prescriptions: RxRow[];
        };
        const orders = j.orders ?? [];
        const prescriptions = j.prescriptions ?? [];
        setEmail(j.email);
        setData({ orders, prescriptions });
        setStage("ready");
        try {
          localStorage.setItem(
            ACCOUNT_KEY,
            JSON.stringify({
              email: j.email,
              orders,
              prescriptions,
              ts: Date.now(),
            } satisfies SessionShape),
          );
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        // Offline — keep the cached view; user can still browse what loaded.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr(t("account.error.email"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: "lookup_order",
        }),
      });
      if (!res.ok) {
        setErr(t("account.error.send"));
        return;
      }
      setStage("code");
    } catch {
      setErr(t("account.error.network"));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const c = code.trim();
    if (!/^\d{6}$/.test(c)) {
      setErr(t("account.error.code"));
      return;
    }
    setBusy(true);
    try {
      let ref: string | undefined;
      try {
        ref = window.localStorage.getItem("lool_ref") ?? undefined;
      } catch {
        /* localStorage may be unavailable */
      }
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: "lookup_order",
          code: c,
          ref,
          clientId: getCustomerClientId(),
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        orders?: OrderRow[];
        prescriptions?: RxRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) {
        setErr(
          t(
            j.error === "code_expired"
              ? "account.error.expired"
              : "account.error.code",
          ),
        );
        return;
      }
      const orders = j.orders ?? [];
      const prescriptions = j.prescriptions ?? [];
      setData({ orders, prescriptions });
      setStage("ready");
      try {
        localStorage.setItem(
          ACCOUNT_KEY,
          JSON.stringify({
            email: email.trim().toLowerCase(),
            orders,
            prescriptions,
            ts: Date.now(),
          } satisfies SessionShape),
        );
      } catch {
        /* localStorage may be unavailable */
      }
    } catch {
      setErr(t("account.error.network"));
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    const signedOutEmail = email.trim().toLowerCase();
    try {
      localStorage.removeItem(ACCOUNT_KEY);
    } catch {
      /* ignore */
    }
    // Clear the server-issued lool_account_session cookie too. Fire-and-forget
    // — the UI doesn't block on the request, and even if it fails the cookie
    // still rolls forward only on use, so an abandoned browser will see it
    // expire after 30 days of inactivity.
    fetch("/api/account/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: getCustomerClientId(),
        email: signedOutEmail,
      }),
    }).catch(() => {});
    setData(null);
    setEmail("");
    setCode("");
    setStage("email");
    setErr(null);
  };

  const updateOrder = (
    updated: Pick<OrderRow, "id" | "email" | "shipping">,
  ) => {
    setData((current) => {
      if (!current) return current;
      const next = {
        ...current,
        orders: current.orders.map((order) =>
          order.id === updated.id
            ? { ...order, email: updated.email, shipping: updated.shipping }
            : order,
        ),
      };
      try {
        localStorage.setItem(
          ACCOUNT_KEY,
          JSON.stringify({
            email,
            orders: next.orders,
            prescriptions: next.prescriptions,
            ts: Date.now(),
          } satisfies SessionShape),
        );
      } catch {
        /* localStorage may be unavailable */
      }
      return next;
    });
  };

  const fmtCents = (c: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      c / 100,
    );
  const fmtDate = (ms: number | null) =>
    ms ? new Date(ms).toISOString().slice(0, 10) : "—";
  const fmtNum = (v: number | null, d = 2) => (v == null ? "—" : v.toFixed(d));

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-8">
        {/* Stage 1 — email */}
        {stage === "email" && (
          <form
            onSubmit={requestCode}
            autoComplete="off"
            className="mx-auto max-w-md space-y-5 rounded-2xl bg-card shadow-card p-8"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-display text-lg">
                  {t("account.signin.title")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("account.signin.subtitle")}
                </p>
              </div>
            </div>
            <input
              // type="text" + inputMode="email" — same anti-Passwork trick as
              // the footer newsletter input. <input type="email"> tells
              // password managers "this is a username field" even with no
              // password field nearby, and Passwork ignores the standard
              // opt-outs. Email format is still validated in requestCode().
              type="text"
              inputMode="email"
              name="account_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("account.email")}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              autoFocus
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
            />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-full h-11"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {t("account.signin.send")}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              {t("account.signin.privacy")}
            </p>
          </form>
        )}

        {/* Stage 2 — code */}
        {stage === "code" && (
          <form
            onSubmit={verifyCode}
            className="mx-auto max-w-md space-y-5 rounded-2xl bg-card shadow-card p-8"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-display text-lg">
                  {t("account.code.title")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("account.code.sub").replace("{email}", email)}
                </p>
              </div>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              autoFocus
              autoComplete="one-time-code"
            />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button
              type="submit"
              disabled={busy || code.length !== 6}
              className="w-full rounded-full h-11"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {t("account.signin.verify")}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStage("email");
                setCode("");
                setErr(null);
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              {t("account.changeEmail")}
            </button>
          </form>
        )}

        {/* Stage 3 — signed-in data, left sidebar + content panel layout. */}
        {stage === "ready" && data && (
          <div className="mx-auto grid max-w-[1130px] gap-6 lg:grid-cols-[292px_minmax(0,1fr)] lg:items-start">
            {/* Sidebar — 4 categories per design mockup. Email + sign-out
                live inside the Profile tab to keep the sidebar clean. */}
            <nav className="grid gap-3 rounded-[28px] border border-border/70 bg-card/95 p-4 shadow-[0_18px_50px_rgba(45,34,22,0.07)]">
              <SidebarBtn
                active={tab === "orders"}
                onClick={() => setTab("orders")}
                icon={Package}
                label={t("account.orders")}
              />
              <SidebarBtn
                active={tab === "rx"}
                onClick={() => setTab("rx")}
                icon={FileText}
                label={t("account.rx")}
              />
              <SidebarBtn
                active={tab === "address"}
                onClick={() => setTab("address")}
                icon={MapPin}
                label={t("account.address")}
              />
              <SidebarBtn
                active={tab === "profile"}
                onClick={() => setTab("profile")}
                icon={User}
                label={t("account.profile")}
              />
            </nav>

            {/* Content panel */}
            <div className="min-w-0">
              {tab === "orders" && (
                <div className="space-y-3">
                  {data.orders.length === 0 && (
                    <EmptyCard
                      icon={Package}
                      title={t("account.empty.orders.title")}
                      sub={t("account.empty.orders.sub")}
                    />
                  )}
                  {data.orders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      t={t}
                      contentLang={contentLang}
                      fmtCents={fmtCents}
                      fmtDate={fmtDate}
                      prescriptions={data.prescriptions}
                      onOrderUpdated={updateOrder}
                    />
                  ))}
                </div>
              )}

              {tab === "rx" && (
                <RxTab
                  prescriptions={data.prescriptions}
                  t={t}
                  contentLang={contentLang}
                  fmtDate={fmtDate}
                />
              )}

              {tab === "address" && <AddressTab t={t} />}

              {tab === "profile" && (
                <div className={`${ACCOUNT_CARD_CLASS} space-y-5 p-5 sm:p-7`}>
                  <div className={`${ACCOUNT_INSET_CLASS} p-5`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t("account.profile.email")}
                    </p>
                    <p className="mt-1 font-medium text-foreground">{email}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t("account.profile.emailHint")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={signOut}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-card px-4 text-foreground shadow-sm hover:border-[#6f523e]"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("account.logout")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-14 w-full items-center gap-4 rounded-[22px] border px-4 text-sm font-medium transition-smooth ${
        active
          ? "border-[#6f523e] bg-card text-foreground shadow-[0_6px_18px_rgba(89,65,48,0.10)]"
          : "border-border/70 bg-card text-muted-foreground hover:border-[#bcae9f] hover:text-foreground"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          active ? "bg-[#6f523e] text-white" : "bg-[#f4f0eb] text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function StatusChip({
  status,
  t,
}: {
  status: string;
  t: (k: never) => string;
}) {
  const Icon =
    status === "pending"
      ? Clock
      : status === "delivered"
        ? Package
        : status === "cancelled"
          ? XCircle
          : status === "refunding" || status === "refunded"
            ? RotateCcw
            : Truck;
  const colorMap: Record<string, string> = {
    pending: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    paid: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    processing: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    shipped: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    out_for_delivery: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    delivered: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    cancelled: "border-border bg-muted text-muted-foreground",
    refunding: "border-[#e4ded6] bg-[#faf8f5] text-[#5d5148]",
    refunded: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
        colorMap[status] ?? "bg-secondary text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(`account.status.${status}` as never)}
    </span>
  );
}

// ───────────────────────────── Order card + tracking ─────────────────────────────
//
// Timeline derivation: we walk the 5-step path created→payment→processing→
// shipped→delivered, marking each step done/active based on the order's
// timestamps + status. Cancelled and refunding orders short-circuit to a
// terminal "cancelled" / "refunding" leaf so the timeline still tells a
// coherent story.
//
// The shipment join (carrier + tracking number) only renders when a shipments
// row exists — we treat it as additive metadata, not a precondition for the
// tracking panel.

type TimelineState = "done" | "active" | "pending";

interface TimelineStep {
  key: string;
  labelKey: string;
  state: TimelineState;
  timestamp: number | null;
}

const CARRIER_PLACEHOLDER_VALUES = new Set([
  "pending",
  "paid",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunding",
  "refunded",
  "returned",
  "待付款",
  "待发货",
  "运输中",
  "派送中",
  "已送达",
  "已签收",
  "已取消",
  "退款中",
  "已退款",
  "退货",
]);

type TrackingCopyTarget = "order" | "tracking";

function displayCarrier(shipment: OrderShipment | null): string | null {
  const carrier = shipment?.carrier?.trim();
  if (!carrier) return null;
  return CARRIER_PLACEHOLDER_VALUES.has(carrier.toLowerCase()) ||
    CARRIER_PLACEHOLDER_VALUES.has(carrier)
    ? null
    : carrier;
}

function buildTimeline(o: OrderRow): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      key: "created",
      labelKey: "account.tracking.steps.created",
      state: "done",
      timestamp: o.createdAt,
    },
    {
      key: "payment",
      labelKey: "account.tracking.steps.payment",
      state: "pending",
      timestamp: o.paidAt,
    },
    {
      key: "processing",
      labelKey: "account.tracking.steps.processing",
      state: "pending",
      timestamp: null,
    },
    {
      key: "shipped",
      labelKey: "account.tracking.steps.shipped",
      state: "pending",
      timestamp: o.shippedAt,
    },
    {
      key: "delivered",
      labelKey: "account.tracking.steps.delivered",
      state: "pending",
      timestamp: o.deliveredAt,
    },
  ];

  const idx = (k: string) => steps.findIndex((s) => s.key === k);

  if (o.status === "cancelled") {
    // Mark whatever happened before cancellation as done, then append a
    // terminal cancelled leaf.
    if (o.paidAt) steps[idx("payment")].state = "done";
    steps.push({
      key: "cancelled",
      labelKey: "account.tracking.steps.cancelled",
      state: "active",
      timestamp: o.cancelledAt,
    });
    return steps;
  }

  if (o.status === "refunding" || o.status === "refunded") {
    if (o.paidAt) steps[idx("payment")].state = "done";
    if (o.shippedAt) steps[idx("processing")].state = "done";
    if (o.shippedAt) steps[idx("shipped")].state = "done";
    if (o.deliveredAt) steps[idx("delivered")].state = "done";
    steps.push({
      key: "refunding",
      labelKey: "account.tracking.steps.refunding",
      state: "active",
      timestamp: null,
    });
    return steps;
  }

  // Normal forward path.
  if (o.status === "pending") {
    steps[idx("payment")].state = "active";
  } else if (o.status === "paid" || o.status === "processing") {
    steps[idx("payment")].state = "done";
    steps[idx("processing")].state = "active";
  } else if (o.status === "shipped") {
    steps[idx("payment")].state = "done";
    steps[idx("processing")].state = "done";
    steps[idx("shipped")].state = "active";
  } else if (o.status === "out_for_delivery") {
    steps[idx("payment")].state = "done";
    steps[idx("processing")].state = "done";
    steps[idx("shipped")].state = "done";
    steps[idx("delivered")].state = "active";
  } else if (o.status === "delivered") {
    steps[idx("payment")].state = "done";
    steps[idx("processing")].state = "done";
    steps[idx("shipped")].state = "done";
    steps[idx("delivered")].state = "done";
  }

  return steps;
}

// The grey sub-line under the status chip in the design mockup. Picks the
// right ETA string and substitutes a date placeholder where the copy needs it.
function statusSubMessage(
  o: OrderRow,
  t: (k: never) => string,
  fmtDate: (ms: number | null) => string,
): string | null {
  const sub = (key: string, dateMs: number | null): string => {
    const raw = t(`account.tracking.eta.${key}` as never);
    return dateMs ? raw.replace("{date}", fmtDate(dateMs)) : raw;
  };
  // shipped_at + 7 days as an ETA placeholder — real carrier integration will
  // overwrite this with the carrier's own ETA later.
  const shipETA = o.shippedAt ? o.shippedAt + 7 * 24 * 60 * 60 * 1000 : null;
  switch (o.status) {
    case "pending":
      return sub("pending", null);
    case "paid":
    case "processing":
      return sub("processing", null);
    case "shipped":
      return sub("shipped", shipETA);
    case "out_for_delivery":
      return sub("out_for_delivery", null);
    case "delivered":
      return sub("delivered", o.deliveredAt);
    case "cancelled":
      return sub("cancelled", o.cancelledAt);
    case "refunding":
      return sub("refunding", null);
    case "refunded":
      return sub("refunded", null);
    default:
      return null;
  }
}

function OrderCard({
  order,
  t,
  contentLang,
  fmtCents,
  fmtDate,
  prescriptions,
  onOrderUpdated,
}: {
  order: OrderRow;
  t: (k: never) => string;
  contentLang: string;
  fmtCents: (c: number, currency?: string) => string;
  fmtDate: (ms: number | null) => string;
  prescriptions: RxRow[];
  onOrderUpdated: (order: Pick<OrderRow, "id" | "email" | "shipping">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<TrackingCopyTarget | null>(
    null,
  );
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [deliveryErr, setDeliveryErr] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    email: order.email ?? "",
    recipient: order.shipping.recipient ?? "",
    country: order.shipping.country ?? "",
    zip: order.shipping.zip ?? "",
    address: order.shipping.address ?? "",
    phone: order.shipping.phone ?? "",
  });
  const subMsg = statusSubMessage(order, t, fmtDate);
  const canEditDelivery =
    !order.shippedAt &&
    ["pending", "paid", "processing"].includes(order.status);
  const carrier = displayCarrier(order.shipment);

  useEffect(() => {
    if (editingDelivery) return;
    setDeliveryForm({
      email: order.email ?? "",
      recipient: order.shipping.recipient ?? "",
      country: order.shipping.country ?? "",
      zip: order.shipping.zip ?? "",
      address: order.shipping.address ?? "",
      phone: order.shipping.phone ?? "",
    });
  }, [editingDelivery, order.email, order.shipping]);

  const handleCopy = async (
    target: TrackingCopyTarget,
    text: string | null | undefined,
  ) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopiedTarget(null);
        copyTimerRef.current = null;
      }, 1500);
    } catch {
      /* clipboard blocked — silently skip */
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const timeline = buildTimeline(order);
  const saveDelivery = async () => {
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryForm.email.trim()) ||
      !deliveryForm.recipient.trim() ||
      !isValidIsoCountry(deliveryForm.country) ||
      !deliveryForm.zip.trim() ||
      !deliveryForm.address.trim() ||
      !deliveryForm.phone.trim()
    ) {
      setDeliveryErr(t("account.orderEdit.error.required" as never));
      return;
    }
    setDeliveryBusy(true);
    setDeliveryErr(null);
    try {
      const res = await fetch(`/api/account/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: deliveryForm.email.trim(),
          recipient: deliveryForm.recipient.trim(),
          country: deliveryForm.country,
          zip: deliveryForm.zip.trim(),
          address: deliveryForm.address.trim(),
          phone: deliveryForm.phone.trim(),
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        order?: Pick<OrderRow, "id" | "email" | "shipping">;
        error?: string;
      };
      if (!res.ok || !j.order) {
        setDeliveryErr(
          j.error === "not_editable"
            ? t("account.orderEdit.error.locked" as never)
            : t("account.address.error.network" as never),
        );
        return;
      }
      onOrderUpdated(j.order);
      setEditingDelivery(false);
    } catch {
      setDeliveryErr(t("account.address.error.network" as never));
    } finally {
      setDeliveryBusy(false);
    }
  };

  // Single product-name line per design — show first item's name + a
  // "+N 件" hint if the order carries more than one line. Total qty in the
  // chip = sum of line qty minus first item's qty.
  const { localizeProductName } = useI18n();
  const firstItem = order.items[0];
  const extraQty =
    order.items.reduce((sum, it) => sum + it.qty, 0) - (firstItem?.qty ?? 0);
  const productName = firstItem
    ? localizeProductName(
        firstItem.productSlug,
        pickLang(firstItem.name, contentLang),
      )
    : "—";

  return (
    <article
      className={`overflow-hidden rounded-[28px] border bg-card shadow-[0_18px_50px_rgba(45,34,22,0.06)] ${
        open ? "border-2 border-[#6f523e]" : "border-border/80"
      }`}
    >
      {/* Header: date · #orderNumber on the left, status chip on the right. */}
      <div className="grid gap-4 px-5 pb-7 pt-5 sm:grid-cols-[minmax(0,1fr)_120px] sm:px-7">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
            {fmtDate(order.createdAt)} · {order.orderNumber}
          </p>
          <p className="mt-1 font-medium leading-snug text-foreground">
            {productName}
            {extraQty > 0 && (
              <span className="ml-2 align-middle text-xs font-normal text-muted-foreground">
                {t("account.orders.itemCount" as never).replace(
                  "{n}",
                  `+${extraQty}`,
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-end">
          <StatusChip status={order.status} t={t} />
          <p className="text-lg font-semibold leading-none tabular-nums text-foreground">
            {fmtCents(order.totalCents)}
          </p>
        </div>
      </div>

      {/* Tracking section — collapsed row mirrors the mockup; expanded content
          follows the detailed logistics design. */}
      <div className="border-t border-border/80">
        <div className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-sm text-foreground transition-smooth hover:bg-secondary/30 sm:px-7">
          <div className="inline-flex min-w-0 shrink-0 items-center gap-2.5 font-medium">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f0eb] text-foreground">
              <Truck className="h-3.5 w-3.5" />
            </span>
            {t("account.tracking.title" as never)}
            <LogisticsInfoDialog t={t} />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-w-0 flex-1 items-center justify-end gap-2 self-stretch text-muted-foreground outline-none transition-smooth hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-expanded={open}
          >
            {!open && subMsg && (
              <span className="truncate text-xs">{subMsg}</span>
            )}
            {open && (
              <span className="hidden text-xs sm:inline">
                {t("account.tracking.collapse" as never)}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {open && (
          <div className="space-y-5 bg-[#f7f3ee] px-5 py-5 sm:px-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <TrackingInfoTile
                label={t("account.tracking.orderNo" as never)}
                value={order.orderNumber}
                onCopy={() => handleCopy("order", order.orderNumber)}
                copied={copiedTarget === "order"}
                copyLabel={t("account.tracking.copy" as never)}
                copiedLabel={t("account.tracking.copied" as never)}
                className="sm:col-span-2"
              />
              <TrackingInfoTile
                label={t("account.tracking.carrier" as never)}
                value={carrier ?? t("account.status.paid" as never)}
              />
              <TrackingInfoTile
                label={t("account.tracking.trackingNo" as never)}
                value={order.shipment?.trackingNumber ?? "—"}
                onCopy={
                  order.shipment?.trackingNumber
                    ? () =>
                        handleCopy("tracking", order.shipment?.trackingNumber)
                    : undefined
                }
                copied={copiedTarget === "tracking"}
                copyLabel={t("account.tracking.copy" as never)}
                copiedLabel={t("account.tracking.copied" as never)}
              />
            </div>

            <div className="rounded-[22px] border border-[#c8baae] bg-[#f2ede8] p-4 text-xs text-[#5c5148] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] sm:p-5">
              {editingDelivery ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t("account.email" as never)}>
                      <Input
                        value={deliveryForm.email}
                        onChange={(e) =>
                          setDeliveryForm((form) => ({
                            ...form,
                            email: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label={t("checkout.recipient" as never)}>
                      <Input
                        value={deliveryForm.recipient}
                        onChange={(e) =>
                          setDeliveryForm((form) => ({
                            ...form,
                            recipient: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label={t("checkout.country" as never)}>
                      <CountryPicker
                        value={deliveryForm.country}
                        onChange={(country) =>
                          setDeliveryForm((form) => ({ ...form, country }))
                        }
                      />
                    </Field>
                    <Field label={t("checkout.zip" as never)}>
                      <Input
                        value={deliveryForm.zip}
                        onChange={(e) =>
                          setDeliveryForm((form) => ({
                            ...form,
                            zip: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label={t("checkout.address.line" as never)} colSpan2>
                      <Input
                        value={deliveryForm.address}
                        onChange={(e) =>
                          setDeliveryForm((form) => ({
                            ...form,
                            address: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label={t("checkout.phone" as never)} colSpan2>
                      <Input
                        value={deliveryForm.phone}
                        onChange={(e) =>
                          setDeliveryForm((form) => ({
                            ...form,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                  {deliveryErr && (
                    <p className="text-destructive">{deliveryErr}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveDelivery}
                      disabled={deliveryBusy}
                      className="rounded-full"
                    >
                      {deliveryBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("account.orderEdit.save" as never)
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingDelivery(false);
                        setDeliveryErr(null);
                      }}
                      disabled={deliveryBusy}
                      className="rounded-full"
                    >
                      {t("account.address.cancel" as never)}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {canEditDelivery
                      ? t("account.tracking.editableHint" as never)
                      : t("account.orderEdit.locked" as never)}
                  </p>
                  {canEditDelivery && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDelivery(true);
                          setShowMeasurements(false);
                          setDeliveryErr(null);
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 text-xs font-medium text-foreground shadow-sm transition-smooth hover:border-[#6f523e]"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {t("account.tracking.editAddress" as never)}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMeasurements((v) => !v);
                          setEditingDelivery(false);
                          setDeliveryErr(null);
                        }}
                        aria-expanded={showMeasurements}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 text-xs font-medium text-foreground shadow-sm transition-smooth hover:border-[#6f523e]"
                      >
                        <Ruler className="h-3.5 w-3.5" />
                        {t("account.tracking.editMeasurements" as never)}
                      </button>
                    </div>
                  )}
                  {showMeasurements && (
                    <OrderMeasurementsPanel
                      order={order}
                      prescriptions={prescriptions}
                      contentLang={contentLang}
                    />
                  )}
                </>
              )}
            </div>

            <ol className="relative space-y-0">
              {timeline.map((step, index) => {
                const Icon = trackingStepIcon(step.key);
                const done = step.state === "done";
                const active = step.state === "active";
                return (
                  <li
                    key={step.key}
                    className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-4 pb-5 last:pb-0"
                  >
                    <div className="relative flex justify-center">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full border ${
                          done
                            ? "border-[#6f523e] bg-[#6f523e] text-white"
                            : active
                              ? "border-[#6f523e] bg-card text-[#6f523e]"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </span>
                      {index < timeline.length - 1 && (
                        <span
                          className="absolute top-9 bottom-0 w-px bg-border"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p
                        className={`text-sm font-medium ${done || active ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {t(step.labelKey as never)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                        {step.timestamp ? fmtDate(step.timestamp) : "—"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </article>
  );
}

function LogisticsInfoDialog({ t }: { t: (k: never) => string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-full border border-[#d8ccc1] bg-background text-muted-foreground shadow-sm transition-smooth hover:border-[#6f523e] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={t("account.tracking.logisticsButton" as never)}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-md overflow-y-auto rounded-[24px]">
        <DialogHeader>
          <DialogTitle>
            {t("account.tracking.logisticsTitle" as never)}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-line pt-2 text-left text-sm leading-7 text-muted-foreground">
            {t("account.tracking.logisticsBody" as never)}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function trackingStepIcon(key: string) {
  if (key === "created") return Clock;
  if (key === "delivered") return Package;
  if (key === "cancelled") return XCircle;
  if (key === "refunding") return RotateCcw;
  return Truck;
}

function TrackingInfoTile({
  label,
  value,
  onCopy,
  copied,
  copyLabel,
  copiedLabel,
  className = "",
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const separator = /[\u4e00-\u9fff]/.test(label) ? "：" : ": ";

  return (
    <div
      className={`flex min-h-16 items-center justify-between gap-4 rounded-[20px] border border-border/80 bg-card px-4 py-3 shadow-sm ${className}`}
    >
      <div className="min-w-0">
        <p className="flex min-w-0 items-baseline text-sm font-medium text-foreground">
          <span className="shrink-0 text-muted-foreground">
            {label}
            {separator}
          </span>
          <span className="truncate">{value}</span>
        </p>
      </div>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-smooth hover:text-foreground"
        >
          <CopyIcon className="h-3.5 w-3.5" />
          {copied ? (copiedLabel ?? copyLabel) : copyLabel}
        </button>
      )}
    </div>
  );
}

function OrderMeasurementsPanel({
  order,
  prescriptions,
  contentLang,
}: {
  order: OrderRow;
  prescriptions: RxRow[];
  contentLang: string;
}) {
  const { t, localizeProductName } = useI18n();
  const isZh = contentLang === "zh";
  const copy = isZh
    ? {
        title: "尺寸修改内容",
        intro:
          "请核对本订单的镜片方案与处方参数。若需要修改，请在镜片加工前联系客服处理。",
        lensPlan: "镜片方案",
        quantity: "数量",
        color: "颜色",
        currentRx: "当前处方",
        noRx: "此商品未关联处方资料。",
        support: "如需修改，客服会在镜片加工前同步给镜片工厂。",
      }
    : {
        title: "Size edit details",
        intro:
          "Review the lens plan and prescription values for this order. Contact support before lens crafting starts to change them.",
        lensPlan: "Lens plan",
        quantity: "Qty",
        color: "Color",
        currentRx: "Current prescription",
        noRx: "No prescription is linked to this item.",
        support:
          "If a change is needed, support will sync it with the lab before crafting.",
      };
  const fmtNum = (v: number | null, d = 2) => (v == null ? "—" : v.toFixed(d));

  return (
    <div className="mt-4 rounded-[20px] border border-[#d8ccc1] bg-card p-4 text-sm shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f4f0eb] text-foreground">
          <Ruler className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{copy.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {copy.intro}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {order.items.map((item, index) => {
          const rx = prescriptions.find((r) => r.id === item.prescriptionId);
          const name = localizeProductName(
            item.productSlug,
            pickLang(item.name, contentLang),
          );
          return (
            <article
              key={item.id}
              className="rounded-[18px] border border-border/80 bg-[#faf8f5] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    #{index + 1}
                  </p>
                  <p className="mt-1 font-medium text-foreground">{name}</p>
                </div>
                <span className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground">
                  {copy.quantity} × {item.qty}
                </span>
              </div>

              <dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                <RxLine
                  k={copy.lensPlan}
                  v={`${item.lens.category} · ${item.lens.index}`}
                />
                <RxLine k={copy.color} v={item.lens.color ?? "—"} />
              </dl>

              {rx ? (
                <div className="mt-3 rounded-[16px] border border-border/70 bg-card p-3">
                  <p className="text-xs font-medium text-foreground">
                    {copy.currentRx} ·{" "}
                    {t(`account.rx.kind.${rx.kind}` as never)}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
                    <RxLine
                      k="SPH (OD/OS)"
                      v={`${fmtNum(rx.sph.od)} / ${fmtNum(rx.sph.os)}`}
                    />
                    <RxLine
                      k="CYL (OD/OS)"
                      v={`${fmtNum(rx.cyl.od)} / ${fmtNum(rx.cyl.os)}`}
                    />
                    <RxLine
                      k="AXIS"
                      v={`${rx.axis.od ?? "—"} / ${rx.axis.os ?? "—"}`}
                    />
                    {rx.kind !== "single" && (
                      <RxLine
                        k="ADD"
                        v={`${fmtNum(rx.add.od)} / ${fmtNum(rx.add.os)}`}
                      />
                    )}
                    <RxLine k="PD" v={fmtNum(rx.pd.total, 1)} />
                  </dl>
                </div>
              ) : (
                <p className="mt-3 rounded-[16px] border border-dashed border-border/80 bg-card p-3 text-xs text-muted-foreground">
                  {copy.noRx}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {copy.support}
      </p>
    </div>
  );
}

function RxLine({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </>
  );
}

// One card per saved kind, in single → reading → progressive order. Missing
// kinds render nothing — the user only sees what they've actually saved.
// Single hides the ADD row (single-vision has no add power by definition).
function RxTab({
  prescriptions,
  t,
  contentLang,
  fmtDate,
}: {
  prescriptions: RxRow[];
  t: (k: string) => string;
  contentLang: "en" | "zh";
  fmtDate: (ms: number) => string;
}) {
  const fmtNum = (v: number | null, d = 2) => (v == null ? "—" : v.toFixed(d));
  const byKind = new Map<RxKind, RxRow>();
  for (const r of prescriptions) byKind.set(r.kind, r);
  const filled = RX_KIND_ORDER.flatMap((kind) => {
    const r = byKind.get(kind);
    return r ? [{ kind, row: r }] : [];
  });
  if (filled.length === 0) {
    return (
      <EmptyCard
        icon={FileText}
        title={t("account.empty.rx.title")}
        sub={t("account.empty.rx.sub")}
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filled.map(({ kind, row: r }) => (
        <article
          key={r.id}
          className={`${ACCOUNT_CARD_CLASS} p-5 text-sm sm:p-6`}
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t(`account.rx.kind.${kind}`)} · {fmtDate(r.createdAt)} · {r.source}
          </p>
          <p className="mt-1 font-medium text-foreground">
            {(contentLang === "zh" ? r.label.zh : r.label.en) ??
              r.label.en ??
              "—"}
          </p>
          <dl
            className={`${ACCOUNT_INSET_CLASS} mt-5 grid grid-cols-2 gap-x-4 gap-y-3 p-4 font-mono text-xs`}
          >
            <RxLine
              k="SPH (OD/OS)"
              v={`${fmtNum(r.sph.od)} / ${fmtNum(r.sph.os)}`}
            />
            <RxLine
              k="CYL (OD/OS)"
              v={`${fmtNum(r.cyl.od)} / ${fmtNum(r.cyl.os)}`}
            />
            <RxLine k="AXIS" v={`${r.axis.od ?? "—"} / ${r.axis.os ?? "—"}`} />
            {kind !== "single" && (
              <RxLine k="ADD" v={`${fmtNum(r.add.od)} / ${fmtNum(r.add.os)}`} />
            )}
            <RxLine k="PD" v={fmtNum(r.pd.total, 1)} />
            {r.hasUpload && <RxLine k={t("account.rx.hasUpload")} v="✓" />}
          </dl>
          {r.notes && (
            <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
              {r.notes}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function EmptyCard({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#c8baae] bg-card p-8 text-center shadow-[0_18px_50px_rgba(45,34,22,0.05)]">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f4f0eb] text-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

// ───────────────────────────── Address book ─────────────────────────────
//
// Lives in the Address tab. Fetches the user's saved shipping addresses
// from /api/account/addresses (cookie-gated), renders one card per row, and
// drives an inline new/edit form. Cap is 10 per email; the "Add address"
// affordance disables once we hit the cap.
//
// One row per email may carry is_default = 1, enforced by a partial unique
// index in the DB. The UI exposes "Set as default" on every non-default
// card. Deleting the default address promotes the next-most-recent one
// server-side.

const ADDRESS_CAP = 10;

interface AddressRow {
  id: string;
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

type AddressFormFields = Pick<
  AddressRow,
  "recipient" | "country" | "zip" | "address" | "phone"
>;

const EMPTY_FORM: AddressFormFields = {
  recipient: "",
  country: "",
  zip: "",
  address: "",
  phone: "",
};

function AddressTab({ t }: { t: (k: never) => string }) {
  const { contentLang } = useI18n();
  const renderCountry = (c: string) =>
    isValidIsoCountry(c) ? getCountryName(c, contentLang) : c;
  const [items, setItems] = useState<AddressRow[] | null>(null);
  const [editing, setEditing] = useState<{ id: string | "new" } | null>(null);
  const [form, setForm] = useState<AddressFormFields>(EMPTY_FORM);
  const [setDefaultOnSave, setSetDefaultOnSave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const j = (await res.json()) as { addresses: AddressRow[] };
      setItems(j.addresses ?? []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openNew = () => {
    setEditing({ id: "new" });
    setForm(EMPTY_FORM);
    // First-ever address auto-defaults on the server side, but offer the
    // toggle for subsequent adds so the user can promote-on-create.
    setSetDefaultOnSave(false);
    setErr(null);
  };

  const openEdit = (a: AddressRow) => {
    setEditing({ id: a.id });
    setForm({
      recipient: a.recipient,
      country: a.country,
      zip: a.zip,
      address: a.address,
      phone: a.phone,
    });
    setSetDefaultOnSave(false);
    setErr(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setErr(null);
  };

  const save = async () => {
    if (!editing) return;
    if (
      !form.recipient ||
      !isValidIsoCountry(form.country) ||
      !form.zip ||
      !form.address ||
      !form.phone
    ) {
      setErr(t("account.address.error.required" as never));
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const isNew = editing.id === "new";
      const url = isNew
        ? "/api/account/addresses"
        : `/api/account/addresses/${editing.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          setDefault: setDefaultOnSave,
          clientId: getCustomerClientId(),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(
          j.error === "cap_reached"
            ? t("account.address.error.cap" as never).replace(
                "{n}",
                String(ADDRESS_CAP),
              )
            : t("account.address.error.network" as never),
        );
        return;
      }
      setEditing(null);
      await refresh();
    } catch {
      setErr(t("account.address.error.network" as never));
    } finally {
      setBusy(false);
    }
  };

  const setAsDefault = async (a: AddressRow) => {
    if (a.isDefault) return;
    setBusy(true);
    try {
      await fetch(`/api/account/addresses/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setDefault: true,
          clientId: getCustomerClientId(),
        }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: AddressRow) => {
    if (!confirm(t("account.address.deleteConfirm" as never))) return;
    setBusy(true);
    try {
      await fetch(`/api/account/addresses/${a.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: getCustomerClientId() }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (items === null) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const atCap = items.length >= ADDRESS_CAP;

  return (
    <div className="space-y-4">
      <div
        className={`${ACCOUNT_CARD_CLASS} flex items-center justify-between gap-4 p-4 sm:p-5`}
      >
        <p className="text-sm text-muted-foreground">
          {t("account.address.count" as never)
            .replace("{n}", String(items.length))
            .replace("{cap}", String(ADDRESS_CAP))}
        </p>
        <Button
          onClick={openNew}
          disabled={atCap || editing?.id === "new"}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[#6f523e] bg-card px-4 text-foreground shadow-sm hover:bg-[#f7f3ee]"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {t("account.address.add" as never)}
        </Button>
      </div>

      {atCap && (
        <p className="rounded-[20px] border border-border/80 bg-[#faf8f5] px-4 py-3 text-sm text-muted-foreground">
          {t("account.address.capReached" as never).replace(
            "{n}",
            String(ADDRESS_CAP),
          )}
        </p>
      )}

      {editing?.id === "new" && (
        <AddressForm
          mode="new"
          form={form}
          setForm={setForm}
          setDefaultOnSave={setDefaultOnSave}
          setSetDefaultOnSave={setSetDefaultOnSave}
          // First-ever address is auto-default by the API; hide the toggle.
          showSetDefault={items.length > 0}
          onSave={save}
          onCancel={cancelEdit}
          busy={busy}
          err={err}
          t={t}
        />
      )}

      {items.length === 0 && editing?.id !== "new" && (
        <EmptyCard
          icon={MapPin}
          title={t("account.empty.address.title")}
          sub={t("account.empty.address.sub")}
        />
      )}

      {items.map((a) =>
        editing?.id === a.id ? (
          <AddressForm
            key={a.id}
            mode="edit"
            form={form}
            setForm={setForm}
            setDefaultOnSave={setDefaultOnSave}
            setSetDefaultOnSave={setSetDefaultOnSave}
            showSetDefault={!a.isDefault}
            onSave={save}
            onCancel={cancelEdit}
            busy={busy}
            err={err}
            t={t}
          />
        ) : (
          <div key={a.id} className={`${ACCOUNT_CARD_CLASS} p-5 sm:p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{a.recipient}</p>
                  {a.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#e4ded6] bg-[#faf8f5] px-2.5 py-1 text-xs text-[#5d5148]">
                      <Star className="h-3 w-3" />
                      {t("account.address.default" as never)}
                    </span>
                  )}
                </div>
                <div
                  className={`${ACCOUNT_INSET_CLASS} mt-4 space-y-1 p-4 text-sm`}
                >
                  <p className="text-foreground">{a.address}</p>
                  <p className="text-muted-foreground">
                    {renderCountry(a.country)} · {a.zip}
                  </p>
                  {a.phone && (
                    <p className="text-muted-foreground">{a.phone}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!a.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAsDefault(a)}
                  disabled={busy}
                  className="rounded-full border border-border/70 bg-card shadow-sm hover:border-[#6f523e]"
                >
                  <Star className="mr-1 h-4 w-4" />
                  {t("account.address.setDefault" as never)}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(a)}
                disabled={busy}
                className="rounded-full border border-border/70 bg-card shadow-sm hover:border-[#6f523e]"
              >
                <Pencil className="mr-1 h-4 w-4" />
                {t("account.address.edit" as never)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(a)}
                disabled={busy}
                className="rounded-full border border-border/70 bg-card text-destructive shadow-sm hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {t("account.address.delete" as never)}
              </Button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function AddressForm({
  mode,
  form,
  setForm,
  setDefaultOnSave,
  setSetDefaultOnSave,
  showSetDefault,
  onSave,
  onCancel,
  busy,
  err,
  t,
}: {
  mode: "new" | "edit";
  form: AddressFormFields;
  setForm: React.Dispatch<React.SetStateAction<AddressFormFields>>;
  setDefaultOnSave: boolean;
  setSetDefaultOnSave: React.Dispatch<React.SetStateAction<boolean>>;
  showSetDefault: boolean;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
  err: string | null;
  t: (k: never) => string;
}) {
  const update =
    (k: keyof AddressFormFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className={`${ACCOUNT_CARD_CLASS} space-y-4 p-5 sm:p-6`}>
      <p className="font-medium">
        {mode === "new"
          ? t("account.address.form.title.new" as never)
          : t("account.address.form.title.edit" as never)}
      </p>
      <div className={`${ACCOUNT_INSET_CLASS} grid gap-3 p-4 sm:grid-cols-2`}>
        <Field label={t("checkout.recipient" as never)}>
          <Input value={form.recipient} onChange={update("recipient")} />
        </Field>
        <Field label={t("checkout.phone" as never)}>
          <Input value={form.phone} onChange={update("phone")} />
        </Field>
        <Field label={t("checkout.country" as never)}>
          <CountryPicker
            value={form.country}
            onChange={(code) => setForm((f) => ({ ...f, country: code }))}
          />
        </Field>
        <Field label={t("checkout.zip" as never)}>
          <Input value={form.zip} onChange={update("zip")} />
        </Field>
        <Field label={t("checkout.address.line" as never)} colSpan2>
          <Input value={form.address} onChange={update("address")} />
        </Field>
      </div>
      {showSetDefault && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2 text-sm shadow-sm">
          <input
            type="checkbox"
            checked={setDefaultOnSave}
            onChange={(e) => setSetDefaultOnSave(e.target.checked)}
          />
          {t("account.address.setDefaultOnSave" as never)}
        </label>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={busy}
          className="rounded-full bg-[#6f523e] px-5 text-white shadow-sm hover:bg-[#5f4433]"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("account.address.save" as never)
          )}
        </Button>
        <Button
          onClick={onCancel}
          disabled={busy}
          variant="ghost"
          className="rounded-full border border-border/70 bg-card shadow-sm hover:border-[#6f523e]"
        >
          {t("account.address.cancel" as never)}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  colSpan2,
  children,
}: {
  label: string;
  colSpan2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm ${colSpan2 ? "sm:col-span-2" : ""}`}>
      <span className="block mb-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

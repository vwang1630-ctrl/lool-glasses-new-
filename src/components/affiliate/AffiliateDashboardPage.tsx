// Affiliate partner portal.
//
// Three states, all driven by GET /api/affiliate/me:
//   401            → "unauth"  → prompt sign-in through /affiliate/login
//   403 / 404      → "notAffiliate" — affiliate access is admin-granted only
//   200            → "ready"   → dashboard

import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Loader2,
  Copy as CopyIcon,
  Check,
  ArrowRight,
  Wallet,
  Lock,
  TrendingUp,
  Plus,
  Glasses,
  LogOut,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  occurredAt: number;
  kind: string;
  deltaCents: number;
  balanceAfterCents: number;
  orderId: string | null;
  payoutId: string | null;
  description: string;
}

interface AffData {
  email: string;
  slug: string;
  role: "l1" | "l2";
  level: number;
  managerCommissionPct: number;
  commissionPct: number;
  customerDiscountPct: number;
  maxCustomerDiscountPct: number;
  status: string;
  balances: {
    lifetimeCents: number;
    lockedCents: number;
    availableCents: number;
  };
  entries: LedgerEntry[];
}

interface ChildAffiliate {
  id: string;
  email: string;
  slug: string;
  manager_commission_pct: number;
  commission_pct: number;
  customer_discount_pct: number;
  status: string;
  notes: string | null;
  created_at: number;
  lifetime_cents: number;
  attributed_order_count: number;
}

type State =
  | { kind: "loading" }
  | { kind: "unauth" }
  | { kind: "notAffiliate" }
  | { kind: "ready"; data: AffData };

export function AffiliateDashboardPage() {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = async () => {
    try {
      const res = await fetch("/api/affiliate/me");
      if (res.status === 401) {
        setState({ kind: "unauth" });
        return;
      }
      if (res.status === 403 || res.status === 404) {
        setState({ kind: "notAffiliate" });
        return;
      }
      if (!res.ok) {
        setState({ kind: "notAffiliate" });
        return;
      }
      const j = (await res.json()) as AffData;
      setState({ kind: "ready", data: j });
    } catch {
      setState({ kind: "notAffiliate" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground">
      <aside className="border-b border-border bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-5 lg:h-auto lg:flex-col lg:items-start lg:gap-8 lg:px-6 lg:py-6">
          <Link to="/affiliate" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Glasses className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">
                LOOL
              </span>
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                Affiliate Admin
              </span>
            </span>
          </Link>
          <nav className="hidden w-full space-y-1 lg:block">
            <div className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Dashboard
            </div>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("aff.title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Independent partner workspace for referral links, discounts,
                commissions, and team agents.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {state.kind === "ready" && (
                <span className="rounded-full bg-secondary px-3 py-1.5 text-muted-foreground">
                  {state.data.email}
                </span>
              )}
              {state.kind === "ready" && (
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/affiliate/logout", { method: "POST" });
                    window.location.href = "/affiliate/login";
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground transition-smooth hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          {state.kind === "loading" && (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {state.kind === "unauth" && <UnauthCard />}
          {state.kind === "notAffiliate" && <NotAffiliateCard />}
          {state.kind === "ready" && <Dashboard data={state.data} t={t} />}
        </div>
      </div>
    </div>
  );
}

function UnauthCard() {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-card p-8 shadow-card text-center space-y-4">
      <p className="font-medium">Sign in to the affiliate portal</p>
      <p className="text-sm text-muted-foreground">
        Affiliate access uses a separate OTP login and does not sign you in to
        the customer account area.
      </p>
      <Link to="/affiliate/login">
        <Button className="rounded-full">
          Affiliate login
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

function NotAffiliateCard() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-card p-8 shadow-card space-y-5">
      <h2 className="font-display text-2xl">Affiliate access is not enabled</h2>
      <p className="text-sm text-muted-foreground">
        lool affiliate accounts are enabled by the admin team. If this email
        should have access, ask an admin to add it in the affiliate management
        screen.
      </p>
    </div>
  );
}

function Dashboard({ data, t }: { data: AffData; t: (k: never) => string }) {
  const [copied, setCopied] = useState(false);
  const [discountPct, setDiscountPct] = useState(
    (data.customerDiscountPct * 100).toFixed(2).replace(/\.?0+$/, ""),
  );
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountMsg, setDiscountMsg] = useState<string | null>(null);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${data.slug}`
      : `https://loollook.com/?ref=${data.slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — silently skip */
    }
  };

  const fmt = (c: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(c / 100);
  const maxDiscountPct = Math.max(0, data.maxCustomerDiscountPct * 100);
  const isL2 = data.role === "l2";
  const l1PoolPct = data.level
    ? 8 + Math.min(6, Math.max(1, data.level)) * 2
    : 0;

  const saveDiscount = async () => {
    const pct = Number(discountPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > maxDiscountPct) {
      setDiscountMsg(
        `Discount must be between 0% and ${fmtPct(maxDiscountPct)}%.`,
      );
      return;
    }
    setSavingDiscount(true);
    setDiscountMsg(null);
    try {
      const res = await fetch("/api/affiliate/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerDiscountPct: pct / 100 }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          maxCustomerDiscountPct?: number;
        };
        const max =
          j.maxCustomerDiscountPct == null
            ? maxDiscountPct
            : j.maxCustomerDiscountPct * 100;
        setDiscountMsg(
          j.error === "customer_discount_too_high"
            ? `Discount must be ${fmtPct(max)}% or less.`
            : (j.error ?? "Failed to save discount."),
        );
        return;
      }
      setDiscountMsg("Saved.");
    } catch {
      setDiscountMsg("Failed to save discount.");
    } finally {
      setSavingDiscount(false);
    }
  };

  return (
    <div className="space-y-6">
      {isL2 ? (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("aff.link.title" as never)}
          </p>
          <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded-xl bg-secondary px-3 py-2.5 text-sm">
              {link}
            </code>
            <Button
              onClick={copy}
              variant="ghost"
              className="rounded-full inline-flex items-center gap-2 shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              {copied
                ? t("aff.link.copied" as never)
                : t("aff.link.copy" as never)}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("aff.link.hint" as never).replace(
              "{pct}",
              `${Math.round(data.commissionPct * 100)}%`,
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Manager account
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a level {data.level} first-tier affiliate account with a{" "}
            {fmtPct(l1PoolPct)}% team sales-fee pool. Create and configure
            second-tier affiliates below.
          </p>
        </div>
      )}

      {!isL2 && <L1ChildrenPanel poolPct={l1PoolPct} fmt={fmt} />}

      {isL2 && (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Customer discount
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
            <label className="block">
              <span className="text-xs text-muted-foreground">
                Discount passed to buyers
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={maxDiscountPct}
                  step="0.5"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="h-10 w-32 rounded-xl border border-border bg-background px-3 text-right text-sm outline-none focus:border-primary/40"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={saveDiscount}
                disabled={savingDiscount}
                className="rounded-full"
              >
                {savingDiscount && <Loader2 className="h-4 w-4 animate-spin" />}
                Save discount
              </Button>
              <p className="text-xs text-muted-foreground">
                Max {fmtPct(maxDiscountPct)}%. Your net commission is{" "}
                {fmtPct(Math.max(0, maxDiscountPct - Number(discountPct || 0)))}
                %.
              </p>
            </div>
          </div>
          {discountMsg && (
            <p className="mt-3 text-xs text-muted-foreground">{discountMsg}</p>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <BalanceCard
          icon={Wallet}
          label={t("aff.balance.available" as never)}
          value={fmt(data.balances.availableCents)}
          hint={t("aff.balance.availableHint" as never)}
          tone="primary"
        />
        <BalanceCard
          icon={Lock}
          label={t("aff.balance.locked" as never)}
          value={fmt(data.balances.lockedCents)}
          hint={t("aff.balance.lockedHint" as never)}
          tone="neutral"
        />
        <BalanceCard
          icon={TrendingUp}
          label={t("aff.balance.lifetime" as never)}
          value={fmt(data.balances.lifetimeCents)}
          hint={t("aff.balance.lifetimeHint" as never)}
          tone="neutral"
        />
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-card">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {t("aff.ledger.title" as never)}
        </p>
        {data.entries.length === 0 ? (
          <p className="py-10 text-sm text-muted-foreground text-center">
            {t("aff.ledger.empty" as never)}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-normal">
                    {t("aff.ledger.col.time" as never)}
                  </th>
                  <th className="py-2 pr-3 font-normal">
                    {t("aff.ledger.col.kind" as never)}
                  </th>
                  <th className="py-2 pr-3 font-normal">
                    {t("aff.ledger.col.desc" as never)}
                  </th>
                  <th className="py-2 pr-3 text-right font-normal">
                    {t("aff.ledger.col.delta" as never)}
                  </th>
                  <th className="py-2 text-right font-normal">
                    {t("aff.ledger.col.balance" as never)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="py-2 pr-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(e.occurredAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {t(`aff.ledger.kind.${e.kind}` as never)}
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {e.description}
                    </td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums ${
                        e.deltaCents >= 0
                          ? "text-foreground"
                          : "text-destructive"
                      }`}
                    >
                      {e.deltaCents > 0 ? "+" : ""}
                      {fmt(e.deltaCents)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {fmt(e.balanceAfterCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function L1ChildrenPanel({
  poolPct,
  fmt,
}: {
  poolPct: number;
  fmt: (c: number) => string;
}) {
  const [items, setItems] = useState<ChildAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [managerPct, setManagerPct] = useState("5");
  const [commissionPct, setCommissionPct] = useState("10");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        managerPct: string;
        commissionPct: string;
        discountPct: string;
        notes: string;
      }
    >
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/affiliate/children");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const j = (await res.json()) as { children?: ChildAffiliate[] };
      const children = j.children ?? [];
      setItems(children);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const item of children) {
          next[item.id] ??= {
            managerPct: fmtPct(item.manager_commission_pct * 100),
            commissionPct: fmtPct(item.commission_pct * 100),
            discountPct: fmtPct(item.customer_discount_pct * 100),
            notes: item.notes ?? "",
          };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const l1 = Number(managerPct);
    const l2 = Number(commissionPct);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMsg("Enter a valid email.");
      return;
    }
    if ([l1, l2].some((n) => !Number.isFinite(n) || n < 0)) {
      setMsg("Percentages must be zero or higher.");
      return;
    }
    if (l1 + l2 > poolPct + 0.000001) {
      setMsg(`Total split cannot exceed ${fmtPct(poolPct)}%.`);
      return;
    }
    setCreating(true);
    setMsg(null);
    try {
      const res = await fetch("/api/affiliate/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          manager_commission_pct: l1 / 100,
          commission_pct: l2 / 100,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          poolPct?: number;
        };
        setMsg(
          j.error === "affiliate_pool_exceeded"
            ? `Total split cannot exceed ${fmtPct((j.poolPct ?? poolPct / 100) * 100)}%.`
            : (j.error ?? "Failed to create affiliate."),
        );
        return;
      }
      setEmail("");
      setNotes("");
      setMsg("Created.");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (slug: string) => {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/?ref=${slug}`
        : `https://loollook.com/?ref=${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const updateDraft = (
    id: string,
    patch: Partial<{
      managerPct: string;
      commissionPct: string;
      discountPct: string;
      notes: string;
    }>,
  ) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveChild = async (item: ChildAffiliate) => {
    const draft = drafts[item.id];
    if (!draft) return;
    const l1 = Number(draft.managerPct);
    const l2 = Number(draft.commissionPct);
    const buyer = item.customer_discount_pct * 100;
    if ([l1, l2].some((n) => !Number.isFinite(n) || n < 0)) {
      setMsg("Percentages must be zero or higher.");
      return;
    }
    if (l1 + l2 + buyer > poolPct + 0.000001) {
      setMsg(`Total split cannot exceed ${fmtPct(poolPct)}%.`);
      return;
    }
    if (l2 + 0.000001 < item.commission_pct * 100) {
      setMsg("L2 share can only increase.");
      return;
    }
    setSavingId(item.id);
    setMsg(null);
    try {
      const res = await fetch("/api/affiliate/children", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          manager_commission_pct: l1 / 100,
          commission_pct: l2 / 100,
          notes: draft.notes || null,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          poolPct?: number;
        };
        setMsg(
          j.error === "affiliate_pool_exceeded"
            ? `Total split cannot exceed ${fmtPct((j.poolPct ?? poolPct / 100) * 100)}%.`
            : j.error === "l2_commission_cannot_decrease"
              ? "L2 share can only increase."
              : (j.error ?? "Failed to save affiliate."),
        );
        return;
      }
      setMsg("Saved.");
      await load();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Second-tier affiliates
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Allocate up to {fmtPct(poolPct)}% between your share and the
            second-tier agent share. Buyer discount is set by the second-tier
            agent.
          </p>
        </div>
      </div>

      <form
        onSubmit={create}
        className="mt-5 grid gap-3 lg:grid-cols-[minmax(180px,1fr)_90px_90px_minmax(160px,1fr)_auto]"
      >
        <input
          type="email"
          placeholder="second-tier email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
        />
        <PercentInput
          label="L1 %"
          value={managerPct}
          onChange={setManagerPct}
        />
        <PercentInput
          label="L2 %"
          value={commissionPct}
          onChange={setCommissionPct}
        />
        <input
          type="text"
          placeholder="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
        />
        <Button type="submit" disabled={creating} className="rounded-full">
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </form>
      {msg && <p className="mt-3 text-xs text-muted-foreground">{msg}</p>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3 font-normal">Email</th>
              <th className="py-2 pr-3 font-normal">Link</th>
              <th className="py-2 pr-3 text-right font-normal">L1</th>
              <th className="py-2 pr-3 text-right font-normal">L2</th>
              <th className="py-2 pr-3 text-right font-normal">Buyer</th>
              <th className="py-2 pr-3 text-right font-normal">Orders</th>
              <th className="py-2 pr-3 text-right font-normal">Balance</th>
              <th className="py-2 pr-3 font-normal">Notes</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 text-right font-normal">Save</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-8 text-center text-muted-foreground"
                >
                  No second-tier affiliates yet.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const draft = drafts[item.id] ?? {
                  managerPct: fmtPct(item.manager_commission_pct * 100),
                  commissionPct: fmtPct(item.commission_pct * 100),
                  discountPct: fmtPct(item.customer_discount_pct * 100),
                  notes: item.notes ?? "",
                };
                const total =
                  Number(draft.managerPct || 0) +
                  Number(draft.commissionPct || 0) +
                  item.customer_discount_pct * 100;
                const invalidTotal =
                  Number.isFinite(total) && total > poolPct + 0.000001;
                const lowersL2 =
                  Number(draft.commissionPct || 0) + 0.000001 <
                  item.commission_pct * 100;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 align-middle"
                  >
                    <td className="py-2 pr-3 font-mono text-xs">
                      {item.email}
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => copyLink(item.slug)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copiedSlug === item.slug ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <CopyIcon className="h-3 w-3" />
                        )}
                        {item.slug}
                      </button>
                    </td>
                    <td className="py-2 pr-3">
                      <InlinePercentInput
                        label={`${item.email} L1 percent`}
                        value={draft.managerPct}
                        invalid={invalidTotal}
                        onChange={(value) =>
                          updateDraft(item.id, { managerPct: value })
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <InlinePercentInput
                        label={`${item.email} L2 percent`}
                        value={draft.commissionPct}
                        invalid={invalidTotal}
                        onChange={(value) =>
                          updateDraft(item.id, { commissionPct: value })
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <InlinePercentInput
                        label={`${item.email} buyer discount percent`}
                        value={fmtPct(item.customer_discount_pct * 100)}
                        invalid={false}
                        readOnly
                      />
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {item.attributed_order_count}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {fmt(item.lifetime_cents)}
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={draft.notes}
                        onChange={(e) =>
                          updateDraft(item.id, { notes: e.target.value })
                        }
                        className="h-9 w-40 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary/40"
                        aria-label={`${item.email} notes`}
                      />
                    </td>
                    <td className="py-2">
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={
                          savingId === item.id || invalidTotal || lowersL2
                        }
                        onClick={() => saveChild(item)}
                        className="rounded-full"
                      >
                        {savingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlinePercentInput({
  label,
  value,
  invalid,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  invalid: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div
      className={`ml-auto flex h-9 w-20 items-center gap-1 rounded-lg border bg-background px-2 ${
        invalid
          ? "border-destructive/70"
          : "border-border focus-within:border-primary/40"
      }`}
    >
      <input
        type="number"
        min="0"
        max="100"
        step="0.5"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="min-w-0 flex-1 bg-transparent text-right text-sm tabular-nums outline-none read-only:text-muted-foreground"
        aria-label={label}
      />
      <span className="text-xs text-muted-foreground">%</span>
    </div>
  );
}

function PercentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div className="flex h-10 items-center gap-1 rounded-xl border border-border bg-background px-2 focus-within:border-primary/40">
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-right text-sm outline-none"
          aria-label={label}
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>
    </label>
  );
}

function fmtPct(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

function BalanceCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone: "primary" | "neutral";
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${
          tone === "primary" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

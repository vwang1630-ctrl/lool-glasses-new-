// /admin/affiliates — create approved affiliates, then edit commission rate,
// payout fields, and suspend / activate.

import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Pencil,
  X,
  Pause,
  Play,
  Copy as CopyIcon,
  Check,
  Plus,
} from "lucide-react";

interface Affiliate {
  id: string;
  email: string;
  slug: string;
  role: "l1" | "l2";
  level: number;
  parent_affiliate_id: string | null;
  parent_email: string | null;
  manager_commission_pct: number;
  commission_pct: number;
  customer_discount_pct: number;
  payout_method: string | null;
  payout_account: string | null;
  status: "active" | "suspended";
  notes: string | null;
  created_at: number;
  updated_at: number;
  lifetime_cents: number;
  locked_cents: number;
  attributed_order_count: number;
}

interface DraftFields {
  role: "l1" | "l2";
  level_input: string;
  parent_affiliate_id: string;
  manager_commission_pct_input: string;
  commission_pct_input: string;
  customer_discount_pct_input: string;
  payout_method: string;
  payout_account: string;
  notes: string;
}

export const Route = createFileRoute("/admin/affiliates/")({
  component: AdminAffiliatesPage,
});

function AdminAffiliatesPage() {
  const [items, setItems] = useState<Affiliate[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftFields>(EMPTY_DRAFT);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newLevel, setNewLevel] = useState("1");
  const [newNotes, setNewNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/affiliates");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const j = (await res.json()) as { affiliates: Affiliate[] };
      setItems(j.affiliates ?? []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const startEdit = (a: Affiliate) => {
    setEditingId(a.id);
    setDraft({
      commission_pct_input: (a.commission_pct * 100)
        .toFixed(2)
        .replace(/\.?0+$/, ""),
      role: a.role,
      level_input: String(a.level ?? 1),
      parent_affiliate_id: a.parent_affiliate_id ?? "",
      manager_commission_pct_input: (a.manager_commission_pct * 100)
        .toFixed(2)
        .replace(/\.?0+$/, ""),
      customer_discount_pct_input: (a.customer_discount_pct * 100)
        .toFixed(2)
        .replace(/\.?0+$/, ""),
      payout_method: a.payout_method ?? "",
      payout_account: a.payout_account ?? "",
      notes: a.notes ?? "",
    });
    setErr(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErr(null);
  };

  const createAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    const level = Number(newLevel);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("请输入有效邮箱");
      return;
    }
    if (!Number.isInteger(level) || level < 1 || level > 6) {
      setErr("1级代理等级必须是 1 - 6");
      return;
    }
    setCreating(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: "l1",
          level,
          manager_commission_pct: 0,
          commission_pct: 0,
          customer_discount_pct: 0,
          notes: newNotes || null,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(j.error ?? "create_failed");
        return;
      }
      setNewEmail("");
      setNewLevel("1");
      setNewNotes("");
      await refresh();
    } finally {
      setCreating(false);
    }
  };

  const save = async (a: Affiliate) => {
    const level = Number(draft.level_input);
    const managerPct = Number(draft.manager_commission_pct_input);
    const pct = Number(draft.commission_pct_input);
    const discountPct = Number(draft.customer_discount_pct_input);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setErr("佣金比例必须在 0 - 100 之间");
      return;
    }
    if (
      draft.role === "l1" &&
      (!Number.isInteger(level) || level < 1 || level > 6)
    ) {
      setErr("1级代理等级必须是 1 - 6");
      return;
    }
    if (
      !validPool(
        draft.role,
        level,
        managerPct,
        pct,
        discountPct,
        draft.parent_affiliate_id,
        items ?? [],
      )
    ) {
      setErr("分配比例超过该 1级代理等级对应的总池");
      return;
    }
    setBusyId(a.id);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/affiliates/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: draft.role,
          level,
          parent_affiliate_id:
            draft.role === "l2" ? draft.parent_affiliate_id || null : null,
          manager_commission_pct: draft.role === "l2" ? managerPct / 100 : 0,
          commission_pct: pct / 100,
          customer_discount_pct: draft.role === "l2" ? discountPct / 100 : 0,
          payout_method: draft.payout_method || null,
          payout_account: draft.payout_account || null,
          notes: draft.notes || null,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(j.error ?? "update_failed");
        return;
      }
      setEditingId(null);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (a: Affiliate) => {
    setBusyId(a.id);
    try {
      await fetch(`/api/admin/affiliates/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: a.status === "active" ? "suspended" : "active",
        }),
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const copySlugLink = async (slug: string) => {
    const link = `https://loollook.com/?ref=${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const fmt = (c: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(c / 100);
  const fmtDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  if (items === null) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const l1Items = items.filter((item) => item.role === "l1");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">代理管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          后台只创建和管理 1级代理；2级代理由对应 1级代理在自己的代理中心创建。
        </p>
      </div>

      <form
        onSubmit={createAffiliate}
        className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[minmax(220px,1fr)_110px_minmax(180px,1fr)_auto]"
      >
        <input
          type="email"
          placeholder="1级代理邮箱"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
        <input
          type="number"
          min="1"
          max="6"
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-right text-sm"
          title="1级等级"
        />
        <input
          type="text"
          placeholder="备注（可选）"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          新建1级代理
        </button>
      </form>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-normal">邮箱</th>
              <th className="px-3 py-2 font-normal">类型</th>
              <th className="px-3 py-2 font-normal">推广链接</th>
              <th className="px-3 py-2 font-normal">上级</th>
              <th className="px-3 py-2 font-normal text-right">1级%</th>
              <th className="px-3 py-2 font-normal text-right">佣金率</th>
              <th className="px-3 py-2 font-normal text-right">用户折扣</th>
              <th className="px-3 py-2 font-normal text-right">累计</th>
              <th className="px-3 py-2 font-normal text-right">锁定</th>
              <th className="px-3 py-2 font-normal text-right">订单数</th>
              <th className="px-3 py-2 font-normal">状态</th>
              <th className="px-3 py-2 font-normal">加入</th>
              <th className="px-3 py-2 font-normal text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={13}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  还没有代理。用上方表单添加允许访问代理后台的邮箱。
                </td>
              </tr>
            )}
            {items.map((a) => {
              const editing = editingId === a.id;
              const busy = busyId === a.id;
              return (
                <Fragment key={a.id}>
                  <tr className="border-b border-border/60 align-top">
                    <td className="px-3 py-3 font-mono text-xs break-all">
                      {a.email}
                    </td>
                    <td className="px-3 py-3">
                      {a.role === "l1" ? `1级 L${a.level}` : "2级"}
                    </td>
                    <td className="px-3 py-3">
                      <div
                        className={`flex items-center gap-1.5 ${a.role === "l1" ? "opacity-40" : ""}`}
                      >
                        <code className="text-xs">{a.slug}</code>
                        <button
                          type="button"
                          onClick={() => copySlugLink(a.slug)}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {copiedSlug === a.slug ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <CopyIcon className="h-3 w-3" />
                          )}
                          {copiedSlug === a.slug ? "已复制" : "复制链接"}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {a.parent_email ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {a.role === "l2"
                        ? `${(a.manager_commission_pct * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {editing ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={draft.commission_pct_input}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                commission_pct_input: e.target.value,
                              }))
                            }
                            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-right text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      ) : (
                        <span>
                          {a.role === "l2"
                            ? `${(a.commission_pct * 100).toFixed(1)}%`
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {editing ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="10"
                            value={draft.customer_discount_pct_input}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                customer_discount_pct_input: e.target.value,
                              }))
                            }
                            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-right text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      ) : (
                        <span>
                          {a.role === "l2"
                            ? `${(a.customer_discount_pct * 100).toFixed(1)}%`
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {fmt(a.lifetime_cents)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {fmt(a.locked_cents)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {a.attributed_order_count}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          a.status === "active"
                            ? "rounded bg-secondary px-2 py-0.5 text-xs"
                            : "rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        }
                      >
                        {a.status === "active" ? "active" : "suspended"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                      {fmtDate(a.created_at)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {editing ? (
                          <>
                            <button
                              onClick={() => save(a)}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                            >
                              {busy ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                              保存
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                            >
                              <X className="h-3 w-3" />
                              取消
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(a)}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                            >
                              <Pencil className="h-3 w-3" />
                              编辑
                            </button>
                            <button
                              onClick={() => toggleStatus(a)}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                            >
                              {a.status === "active" ? (
                                <>
                                  <Pause className="h-3 w-3" />
                                  停用
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3" />
                                  启用
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {editing && (
                    <tr className="border-b border-border/60 bg-secondary/20">
                      <td colSpan={13} className="px-3 py-3">
                        <div className="grid gap-3 sm:grid-cols-6">
                          <label className="block text-xs">
                            <span className="mb-1 block text-muted-foreground">
                              类型
                            </span>
                            <select
                              value={draft.role}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  role: e.target.value === "l1" ? "l1" : "l2",
                                }))
                              }
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                            >
                              <option value="l1">1级代理</option>
                              <option value="l2">2级代理</option>
                            </select>
                          </label>
                          <label className="block text-xs">
                            <span className="mb-1 block text-muted-foreground">
                              等级 / 上级
                            </span>
                            {draft.role === "l1" ? (
                              <input
                                type="number"
                                min="1"
                                max="6"
                                value={draft.level_input}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    level_input: e.target.value,
                                  }))
                                }
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                              />
                            ) : (
                              <select
                                value={draft.parent_affiliate_id}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    parent_affiliate_id: e.target.value,
                                  }))
                                }
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                              >
                                <option value="">无上级</option>
                                {l1Items
                                  .filter((item) => item.id !== a.id)
                                  .map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.email} · L{item.level}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </label>
                          <label className="block text-xs">
                            <span className="mb-1 block text-muted-foreground">
                              1级分成 %
                            </span>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={draft.manager_commission_pct_input}
                              disabled={draft.role === "l1"}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  manager_commission_pct_input: e.target.value,
                                }))
                              }
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                            />
                          </label>
                          <label className="block text-xs">
                            <span className="mb-1 block text-muted-foreground">
                              打款方式
                            </span>
                            <input
                              type="text"
                              placeholder="paypal / wise / bank"
                              value={draft.payout_method}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  payout_method: e.target.value,
                                }))
                              }
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                            />
                          </label>
                          <label className="block text-xs">
                            <span className="mb-1 block text-muted-foreground">
                              打款账号
                            </span>
                            <input
                              type="text"
                              placeholder="收款邮箱 / IBAN / 等"
                              value={draft.payout_account}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  payout_account: e.target.value,
                                }))
                              }
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                            />
                          </label>
                          <label className="block text-xs sm:col-span-1">
                            <span className="mb-1 block text-muted-foreground">
                              备注（仅内部可见）
                            </span>
                            <input
                              type="text"
                              value={draft.notes}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  notes: e.target.value,
                                }))
                              }
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMPTY_DRAFT: DraftFields = {
  role: "l2",
  level_input: "1",
  parent_affiliate_id: "",
  manager_commission_pct_input: "5",
  commission_pct_input: "15",
  customer_discount_pct_input: "0",
  payout_method: "",
  payout_account: "",
  notes: "",
};

function levelPoolPercent(level: number): number {
  return 8 + Math.min(6, Math.max(1, Math.trunc(level))) * 2;
}

function validPool(
  role: "l1" | "l2",
  level: number,
  managerPct: number,
  commissionPct: number,
  discountPct: number,
  parentId: string,
  items: Affiliate[],
): boolean {
  if (role === "l1") return Number.isInteger(level) && level >= 1 && level <= 6;
  if (
    !Number.isFinite(managerPct) ||
    !Number.isFinite(commissionPct) ||
    !Number.isFinite(discountPct) ||
    managerPct < 0 ||
    commissionPct < 0 ||
    discountPct < 0
  ) {
    return false;
  }
  const parent = parentId
    ? items.find((item) => item.id === parentId && item.role === "l1")
    : null;
  const pool = parent ? levelPoolPercent(parent.level) : commissionPct;
  return managerPct + commissionPct + discountPct <= pool + 0.0001;
}

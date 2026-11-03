// /admin/orders/$id — order detail. View shipping / items / addons; update status.

import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, Plus, Trash2, Truck, X } from "lucide-react";
import { CountryPicker } from "@/components/CountryPicker";
import { getCountryName, isValidIsoCountry } from "@/lib/countries";

interface Order {
  id: string;
  order_number: string;
  email: string;
  status: string;
  content_lang: string | null;
  original_subtotal_cents: number | null;
  affiliate_slug: string | null;
  affiliate_discount_pct: number | null;
  affiliate_discount_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  ship_recipient: string;
  ship_country: string;
  ship_zip: string;
  ship_address: string;
  ship_phone: string;
  payment_provider: string | null;
  payment_intent_id: string | null;
  payment_method: string | null;
  paid_at: number | null;
  shipped_at: number | null;
  delivered_at: number | null;
  cancelled_at: number | null;
  created_at: number;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_slug: string;
  product_name_zh: string;
  product_name_en: string;
  frame_color_id: string | null;
  frame_png_snapshot_url: string | null;
  qty: number;
  lens_option_id: string;
  lens_category_snapshot: string;
  lens_index_snapshot: string;
  lens_color_snapshot: string | null;
  lens_retail_cents_snapshot: number;
  prescription_id: string | null;
}

const STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  shipped: "已发货",
  delivered: "已签收",
  cancelled: "已取消",
};

export const Route = createFileRoute("/admin/orders/$id")({
  component: AdminOrderDetailPage,
});

const fmtTs = (ts: number | null) =>
  ts ? new Date(ts).toISOString().slice(0, 19).replace("T", " ") + " UTC" : "—";
const fmtMoney = (cents: number, currency: string) =>
  `${currency === "USD" ? "$" : currency + " "}${(cents / 100).toFixed(2)}`;

function AdminOrderDetailPage() {
  const { id } = useParams({ from: "/admin/orders/$id" });
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/orders/${id}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { order: Order; items: OrderItem[] };
      setOrder(d.order);
      setItems(d.items);
      setStatusDraft(d.order.status);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const patchOrder = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      alert(data.message ?? data.error ?? "更新失败");
      return;
    }
    load();
  };

  const updateStatus = async () => {
    if (!order || statusDraft === order.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusDraft }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "更新失败");
      }
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        加载失败：{err ?? "订单不存在"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {order.order_number}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {order.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            onClick={updateStatus}
            disabled={saving || statusDraft === order.status}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            更新状态
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Section title="客户">
          <EditableKV
            label="邮箱"
            value={order.email}
            onSave={(v) => patchOrder({ email: v })}
          />
          <KV label="语言" value={order.content_lang ?? "—"} />
        </Section>
        <Section title="收货地址">
          <EditableKV
            label="收件人"
            value={order.ship_recipient}
            onSave={(v) => patchOrder({ ship_recipient: v })}
          />
          <CountryField
            value={order.ship_country}
            onSave={(code) => patchOrder({ ship_country: code })}
          />
          <EditableKV
            label="邮编"
            value={order.ship_zip}
            onSave={(v) => patchOrder({ ship_zip: v })}
          />
          <EditableKV
            label="地址"
            value={order.ship_address}
            onSave={(v) => patchOrder({ ship_address: v })}
            multiline
          />
          <EditableKV
            label="电话"
            value={order.ship_phone}
            onSave={(v) => patchOrder({ ship_phone: v })}
          />
        </Section>
        <Section title="支付">
          <KV label="渠道" value={order.payment_provider ?? "—"} />
          <KV label="方式" value={order.payment_method ?? "—"} />
          <KV label="Intent ID" value={order.payment_intent_id ?? "—"} mono />
        </Section>
      </div>

      <Section title="时间线">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5 text-xs">
          <KV label="下单" value={fmtTs(order.created_at)} />
          <KV label="支付" value={fmtTs(order.paid_at)} />
          <KV label="发货" value={fmtTs(order.shipped_at)} />
          <KV label="签收" value={fmtTs(order.delivered_at)} />
          <KV label="取消" value={fmtTs(order.cancelled_at)} />
        </div>
      </Section>

      <Section title="商品行">
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">商品</th>
                <th className="px-3 py-2">镜框色</th>
                <th className="px-3 py-2">镜片</th>
                <th className="px-3 py-2 text-right">数量</th>
                <th className="px-3 py-2 text-right">镜片单价</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-3 py-2">
                    <div className="font-medium">{it.product_name_en}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.product_slug}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {it.frame_color_id ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div>{it.lens_category_snapshot}</div>
                    <div className="text-muted-foreground">
                      {it.lens_index_snapshot}
                      {it.lens_color_snapshot
                        ? ` · ${it.lens_color_snapshot}`
                        : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {it.qty}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {fmtMoney(it.lens_retail_cents_snapshot, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="金额汇总">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 text-sm">
          <KV
            label="原始小计"
            value={fmtMoney(
              order.original_subtotal_cents ?? order.subtotal_cents,
              order.currency,
            )}
          />
          <KV
            label="代理折扣"
            value={
              order.affiliate_discount_cents > 0 ? (
                <span>
                  -{fmtMoney(order.affiliate_discount_cents, order.currency)}
                  {order.affiliate_discount_pct != null
                    ? ` (${(order.affiliate_discount_pct * 100).toFixed(1)}%)`
                    : ""}
                </span>
              ) : (
                "—"
              )
            }
          />
          <KV
            label="折后小计"
            value={fmtMoney(order.subtotal_cents, order.currency)}
          />
          <KV
            label="运费"
            value={fmtMoney(order.shipping_cents, order.currency)}
          />
          <KV label="税费" value={fmtMoney(order.tax_cents, order.currency)} />
          <KV label="代理" value={order.affiliate_slug ?? "—"} mono />
          <KV
            label="合计"
            value={
              <span className="font-semibold">
                {fmtMoney(order.total_cents, order.currency)}
              </span>
            }
          />
        </div>
      </Section>

      <ShipmentsSection orderId={order.id} />
    </div>
  );
}

interface Shipment {
  id: string;
  order_id: string;
  carrier: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: number | null;
  delivered_at: number | null;
}

const SHIPMENT_STATUSES = [
  "pending",
  "in-transit",
  "delivered",
  "returned",
] as const;
const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  pending: "待发货",
  "in-transit": "运输中",
  delivered: "已签收",
  returned: "退货",
};

function ShipmentsSection({ orderId }: { orderId: string }) {
  const [items, setItems] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCarrier, setNewCarrier] = useState("");
  const [newTracking, setNewTracking] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/shipments?limit=200`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { shipments: Shipment[] };
      setItems(d.shipments.filter((s) => s.order_id === orderId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          carrier: newCarrier.trim() || null,
          tracking_number: newTracking.trim() || null,
          status: "pending",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "创建失败");
        return;
      }
      setNewCarrier("");
      setNewTracking("");
      setCreating(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const updateField = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/shipments/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      alert(data.message ?? data.error ?? "更新失败");
    }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("删除此物流记录？")) return;
    await fetch(`/api/admin/shipments/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    load();
  };

  return (
    <Section title={`物流 (${items.length})`}>
      {err && (
        <div className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {err}
        </div>
      )}

      {loading ? (
        <div className="flex h-12 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3 text-sm"
            >
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                {s.id}
              </span>
              <input
                value={s.carrier ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setItems((arr) =>
                    arr.map((x) => (x.id === s.id ? { ...x, carrier: v } : x)),
                  );
                }}
                onBlur={(e) => updateField(s.id, { carrier: e.target.value })}
                placeholder="承运商 (DHL...)"
                className="h-8 w-32 rounded border border-input bg-background px-2 text-xs"
              />
              <input
                value={s.tracking_number ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setItems((arr) =>
                    arr.map((x) =>
                      x.id === s.id ? { ...x, tracking_number: v } : x,
                    ),
                  );
                }}
                onBlur={(e) =>
                  updateField(s.id, { tracking_number: e.target.value })
                }
                placeholder="运单号"
                className="h-8 w-40 rounded border border-input bg-background px-2 font-mono text-xs"
              />
              <select
                value={s.status}
                onChange={(e) => updateField(s.id, { status: e.target.value })}
                className="h-8 rounded border border-input bg-background px-2 text-xs"
              >
                {SHIPMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {SHIPMENT_STATUS_LABEL[st]}
                  </option>
                ))}
              </select>
              <span className="ml-auto text-xs text-muted-foreground">
                {s.shipped_at
                  ? new Date(s.shipped_at).toISOString().slice(0, 10)
                  : "未发货"}
              </span>
              <button
                onClick={() => remove(s.id)}
                className="text-muted-foreground hover:text-destructive"
                title="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {items.length === 0 && !creating && (
            <p className="text-center text-sm text-muted-foreground py-2">
              暂无物流记录。点下面按钮创建。
            </p>
          )}

          {creating ? (
            <form
              onSubmit={submitCreate}
              className="flex flex-wrap items-end gap-2 rounded-md border border-primary/40 bg-secondary/30 p-3"
            >
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  承运商
                </label>
                <input
                  value={newCarrier}
                  onChange={(e) => setNewCarrier(e.target.value)}
                  placeholder="DHL / USPS / 顺丰国际"
                  className="h-8 w-40 rounded border border-input bg-background px-2 text-xs"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  运单号
                </label>
                <input
                  value={newTracking}
                  onChange={(e) => setNewTracking(e.target.value)}
                  placeholder="可后续填写"
                  className="h-8 w-48 rounded border border-input bg-background px-2 font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                创建
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewCarrier("");
                  setNewTracking("");
                }}
                className="flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-secondary"
              >
                <X className="h-3 w-3" />
                取消
              </button>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-dashed border-border text-sm hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              新建物流
            </button>
          )}
        </div>
      )}
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function CountryField({
  value,
  onSave,
}: {
  value: string;
  onSave: (code: string) => void;
}) {
  // 显示当前国家的本地化名 (中文) 加 ISO 码。值不是合法 ISO 时按原文显示并
  // 用红字提示——这种行历史脏数据，应该被 admin 手动修一下。
  const isIso = isValidIsoCountry(value);
  const displayName = isIso ? getCountryName(value, "zh") : "";
  return (
    <div>
      <div className="text-xs text-muted-foreground">国家</div>
      <div className="mt-0.5">
        <CountryPicker
          value={isIso ? value : ""}
          onChange={(code) => {
            if (code && code !== value) onSave(code);
          }}
          variant="input"
          placeholder={value ? `${value}（请重选）` : "选择国家"}
          lang="zh"
        />
      </div>
      {isIso && (
        <div className="mt-1 text-xs text-muted-foreground">
          {displayName} · {value}
        </div>
      )}
      {!isIso && value && (
        <div className="mt-1 text-xs text-destructive">
          历史值 "{value}" 非 ISO 码，请重选。
        </div>
      )}
    </div>
  );
}

function EditableKV({
  label,
  value,
  onSave,
  multiline,
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Reset draft when external value changes (e.g. after parent refetch).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!editing) {
    return (
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <button
          onClick={() => setEditing(true)}
          className="block w-full text-left text-sm hover:bg-secondary/50 rounded px-1 -mx-1"
          title="点击编辑"
        >
          {value || (
            <span className="text-muted-foreground italic">— 点击填写 —</span>
          )}
        </button>
      </div>
    );
  }

  const commit = () => {
    if (draft.trim() && draft !== value) onSave(draft.trim());
    setEditing(false);
  };

  return (
    <div>
      <div className="mb-0.5 text-xs text-muted-foreground">{label}</div>
      {multiline ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          rows={2}
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      ) : (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="h-7 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      )}
    </div>
  );
}

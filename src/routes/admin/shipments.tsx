// /admin/shipments — read-only shipment list. Filter by status; LEFT JOIN orders.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

interface Shipment {
  id: string;
  order_id: string;
  carrier: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: number | null;
  delivered_at: number | null;
  created_at: number;
  logistics_agent_id: string | null;
  agent_name: string | null;
  contact_person: string | null;
  order_number: string | null;
  email: string | null;
  ship_country: string | null;
}

interface CarrierPair {
  agent_id: string;
  supplier_id: string;
  supplier_name_en: string;
  supplier_name_zh: string;
  agent_name: string;
  contact_person: string | null;
}

const STATUSES = [
  { value: "", label: "全部" },
  { value: "pending", label: "待处理" },
  { value: "in-transit", label: "运输中" },
  { value: "delivered", label: "已签收" },
  { value: "returned", label: "退货" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700",
  "in-transit": "bg-blue-500/15 text-blue-700",
  delivered: "bg-emerald-500/15 text-emerald-700",
  returned: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/admin/shipments")({
  component: AdminShipmentsPage,
});

function AdminShipmentsPage() {
  const [items, setItems] = useState<Shipment[]>([]);
  const [pairs, setPairs] = useState<CarrierPair[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (statusFilter) params.set("status", statusFilter);
      const [r, p] = await Promise.all([
        fetch(`/api/admin/shipments?${params}`, { credentials: "same-origin" }),
        fetch(`/api/admin/logistics-contacts/pairs`, {
          credentials: "same-origin",
        }),
      ]);
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { shipments: Shipment[]; total: number };
      setItems(d.shipments);
      setTotal(d.total);
      if (p.ok) {
        const pd = (await p.json()) as { pairs: CarrierPair[] };
        setPairs(pd.pairs);
      }
    } finally {
      setLoading(false);
    }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
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

  useEffect(() => {
    load();
  }, [statusFilter, page]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">物流管理</h1>
        <p className="text-sm text-muted-foreground">
          全部物流记录。Webhook 由承运商写入
          shipment_events；这里只显示主表。承运商 / 货代代理在{" "}
          <Link
            to="/admin/logistics-contacts"
            className="text-primary underline-offset-2 hover:underline"
          >
            货代代理
          </Link>{" "}
          页面维护。
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm text-muted-foreground">
          {loading ? "加载中…" : `共 ${total} 条`}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">物流 ID</th>
              <th className="px-4 py-3">订单</th>
              <th className="px-4 py-3">客户</th>
              <th className="px-4 py-3">承运商 — 货代代理</th>
              <th className="px-4 py-3">运单号</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">发货时间</th>
              <th className="px-4 py-3">签收时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无物流记录
                </td>
              </tr>
            ) : (
              items.map((s) => {
                const currentPair = s.logistics_agent_id ?? "";
                return (
                  <tr key={s.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3">
                      {s.order_number ? (
                        <Link
                          to="/admin/orders/$id"
                          params={{ id: s.order_id }}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {s.order_number}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs">{s.order_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{s.email ?? "—"}</div>
                      <div className="text-muted-foreground">
                        {s.ship_country ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentPair}
                        onChange={(e) => {
                          const selected = pairs.find(
                            (p) => p.agent_id === e.target.value,
                          );
                          if (selected) {
                            patch(s.id, {
                              carrier:
                                selected.supplier_name_en ||
                                selected.supplier_name_zh,
                              logistics_agent_id: selected.agent_id,
                            });
                          } else {
                            patch(s.id, {
                              carrier: null,
                              logistics_agent_id: null,
                            });
                          }
                        }}
                        className="h-7 max-w-[220px] rounded border border-input bg-background px-1.5 text-xs"
                      >
                        <option value="">— 未指派 —</option>
                        {/* If the saved pair is no longer in the active list (carrier
                            or contact was deactivated), keep it visible so the row
                            stays readable. */}
                        {currentPair &&
                          !pairs.some(
                            (p) => p.agent_id === s.logistics_agent_id,
                          ) && (
                            <option value={currentPair}>
                              {s.carrier} — {s.agent_name ?? "?"}（已停用）
                            </option>
                          )}
                        {pairs.map((p) => (
                          <option key={p.agent_id} value={p.agent_id}>
                            {p.supplier_name_en} — {p.agent_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        defaultValue={s.tracking_number ?? ""}
                        onBlur={(e) =>
                          patch(s.id, { tracking_number: e.target.value })
                        }
                        placeholder="运单号"
                        className="h-7 w-32 rounded border border-input bg-background px-1.5 font-mono text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={s.status}
                        onChange={(e) =>
                          patch(s.id, { status: e.target.value })
                        }
                        className={`h-7 rounded px-1.5 text-[10px] font-medium ${
                          STATUS_COLOR[s.status] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        <option value="pending">待发货</option>
                        <option value="in-transit">运输中</option>
                        <option value="delivered">已签收</option>
                        <option value="returned">退货</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.shipped_at
                        ? new Date(s.shipped_at).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.delivered_at
                        ? new Date(s.delivered_at).toISOString().slice(0, 10)
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

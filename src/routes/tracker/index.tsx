// /tracker — order list. Shows all paid + processing orders, with claim
// state. The list is the entry point: tracker picks an unclaimed order to
// work on, or jumps back into one they already claimed.
//
// Claim semantics in the UI:
// - Unclaimed (tracker is null)      → "认领" button + open
// - Claimed by me                    → "继续处理" link
// - Claimed by someone else          → muted row "由 X 处理中"; no action

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/tracker/")({
  component: TrackerOrdersList,
});

interface OrderRow {
  id: string;
  orderNumber: string;
  status: "paid" | "processing";
  email: string;
  shipCountry: string;
  shipRecipient: string;
  paidAt: number | null;
  createdAt: number;
  itemCount: number;
  firstProductName: Record<string, string>;
  tracker: { id: string; name: string; assignedAt: number | null } | null;
}

interface Me {
  id: string;
  email: string;
  name: string;
}

function fmtDate(ms: number | null): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TrackerOrdersList() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [meRes, ordersRes] = await Promise.all([
      fetch("/api/tracker/me", { credentials: "same-origin" }),
      fetch("/api/tracker/orders", { credentials: "same-origin" }),
    ]);
    if (meRes.ok) {
      const j = (await meRes.json()) as { tracker: Me };
      setMe(j.tracker);
    }
    if (ordersRes.ok) {
      const j = (await ordersRes.json()) as { orders: OrderRow[] };
      setOrders(j.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const claim = async (id: string) => {
    setBusy(id);
    const r = await fetch(`/api/tracker/orders/${id}/claim`, {
      method: "POST",
      credentials: "same-origin",
    });
    setBusy(null);
    if (!r.ok) {
      alert("领单失败：可能已被其他人接走。刷新列表。");
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载中
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold font-display">待处理订单</h1>
        <button
          onClick={load}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          刷新
        </button>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          暂无待处理订单
        </p>
      ) : (
        <div className="bg-background rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">订单号</th>
                <th className="text-left px-4 py-3">收件人 / 国家</th>
                <th className="text-left px-4 py-3">商品</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">付款时间</th>
                <th className="text-left px-4 py-3">处理人</th>
                <th className="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const mine = me && o.tracker && o.tracker.id === me.id;
                const otherClaimed =
                  o.tracker && (!me || o.tracker.id !== me.id);
                const unclaimed = !o.tracker;
                const productName =
                  o.firstProductName.zh || o.firstProductName.en || "—";
                return (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>{o.shipRecipient}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.shipCountry}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{productName}</div>
                      {o.itemCount > 1 && (
                        <div className="text-xs text-muted-foreground">
                          +{o.itemCount - 1} 件
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          o.status === "paid"
                            ? "inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                            : "inline-flex px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800"
                        }
                      >
                        {o.status === "paid" ? "待加工" : "加工中"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {fmtDate(o.paidAt)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.tracker ? (
                        <span
                          className={
                            mine ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          {o.tracker.name}
                          {mine && (
                            <span className="ml-1 text-primary">（我）</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {mine && (
                        <Link
                          to="/tracker/orders/$id"
                          params={{ id: o.id }}
                          className="text-primary hover:underline"
                        >
                          继续处理 →
                        </Link>
                      )}
                      {unclaimed && (
                        <button
                          disabled={busy === o.id}
                          onClick={() => claim(o.id)}
                          className="rounded-full px-3 h-7 bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                        >
                          {busy === o.id ? "..." : "认领"}
                        </button>
                      )}
                      {otherClaimed && (
                        <span className="text-xs text-muted-foreground">
                          由他人处理
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

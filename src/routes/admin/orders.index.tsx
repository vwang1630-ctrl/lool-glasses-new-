// /admin/orders — paginated order list. Filter by status + search by order_number/email.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { getCountryName, isValidIsoCountry } from "@/lib/countries";

const STATUSES = [
  { value: "", label: "全部" },
  { value: "pending", label: "待支付" },
  { value: "paid", label: "已支付" },
  { value: "shipped", label: "已发货" },
  { value: "delivered", label: "已签收" },
  { value: "cancelled", label: "已取消" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700",
  paid: "bg-blue-500/15 text-blue-700",
  shipped: "bg-violet-500/15 text-violet-700",
  delivered: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-muted text-muted-foreground",
};

interface Order {
  id: string;
  order_number: string;
  email: string;
  status: string;
  content_lang: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  ship_recipient: string;
  ship_country: string;
  payment_provider: string | null;
  paid_at: number | null;
  shipped_at: number | null;
  delivered_at: number | null;
  cancelled_at: number | null;
  created_at: number;
}

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const r = await fetch(`/api/admin/orders?${params}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { orders: Order[]; total: number };
      setOrders(d.orders);
      setTotal(d.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">订单管理</h1>
        <p className="text-sm text-muted-foreground">
          全部下单记录。按状态筛选；在搜索框输入单号或邮箱。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="搜索单号 / 邮箱"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(0);
                load();
              }
            }}
            className="h-9 w-72 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setPage(0);
            load();
          }}
          className="h-9 rounded-md border border-border px-3 text-sm hover:bg-secondary"
        >
          搜索
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {loading ? "加载中…" : `共 ${total} 条`}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">单号</th>
              <th className="px-4 py-3">邮箱</th>
              <th className="px-4 py-3">收货</th>
              <th className="px-4 py-3 text-right">金额</th>
              <th className="px-4 py-3">支付</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">下单时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无订单
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: o.id }}
                      className="font-mono text-xs font-medium text-primary hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{o.email}</td>
                  <td className="px-4 py-3 text-xs">
                    <div>{o.ship_recipient}</div>
                    <div className="text-muted-foreground">
                      {isValidIsoCountry(o.ship_country)
                        ? `${getCountryName(o.ship_country, "zh")} (${o.ship_country})`
                        : o.ship_country}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {o.currency === "USD" ? "$" : `${o.currency} `}
                    {(o.total_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.payment_provider ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                        STATUS_COLOR[o.status] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(o.created_at)
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

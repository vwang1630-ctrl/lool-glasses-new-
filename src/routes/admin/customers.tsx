// /admin/customers — read-only customer list and persisted referral attribution.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

interface Customer {
  id: string;
  email: string;
  affiliate_ref_slug: string | null;
  affiliate_ref_at: number | null;
  first_order_id: string | null;
  first_order_at: number | null;
  created_at: number;
  updated_at: number;
  affiliate_email: string | null;
  affiliate_role: string | null;
  order_count: number;
  paid_total_cents: number;
}

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (search.trim()) params.set("q", search.trim());
      const r = await fetch(`/api/admin/customers?${params}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { customers: Customer[]; total: number };
      setCustomers(d.customers);
      setTotal(d.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">客户管理</h1>
        <p className="text-sm text-muted-foreground">
          自动注册的客户记录，以及首次固化的邀请码归因。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="搜索邮箱 / ref code"
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
          {loading ? "加载中..." : `共 ${total} 个客户`}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">邮箱</th>
              <th className="px-4 py-3">Ref Code</th>
              <th className="px-4 py-3">代理邮箱</th>
              <th className="px-4 py-3">订单数</th>
              <th className="px-4 py-3">已支付金额</th>
              <th className="px-4 py-3">首次订单</th>
              <th className="px-4 py-3">注册时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  加载中...
                </td>
              </tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  暂无客户记录
                </td>
              </tr>
            )}
            {!loading &&
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{c.email}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {c.id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.affiliate_ref_slug ? (
                      <div>
                        <span className="rounded bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                          {c.affiliate_ref_slug}
                        </span>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {fmtDate(c.affiliate_ref_at)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.affiliate_email ? (
                      <div>
                        <div>{c.affiliate_email}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.affiliate_role}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.order_count}</td>
                  <td className="px-4 py-3 font-medium">
                    {fmtMoney(c.paid_total_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs">
                      {c.first_order_id ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtDate(c.first_order_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function fmtDate(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

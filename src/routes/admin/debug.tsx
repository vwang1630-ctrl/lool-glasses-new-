// /admin/debug — pre-launch destructive data reset tools.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Database,
  FileText,
  MapPin,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";

type CleanupTarget = "customers" | "orders" | "prescriptions" | "addresses";

type CleanupStats = {
  customers?: { customers: number; identityLinks: number };
  orders?: {
    orders: number;
    orderItems: number;
    shipments: number;
    shipmentEvents: number;
  };
  prescriptions?: {
    prescriptions: number;
    uploadObjects: number;
    linkedOrderItems: number;
  };
  addresses?: { addresses: number };
};

const TARGETS: Array<{
  target: CleanupTarget;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: (stats: CleanupStats) => Array<[string, number | string | undefined]>;
}> = [
  {
    target: "customers",
    title: "清理用户",
    desc: "删除 customers 和邮箱/设备号映射；订单里的 customer_id 会置空。",
    icon: Users,
    stats: (s) => [
      ["用户", s.customers?.customers],
      ["邮箱/UUID 映射", s.customers?.identityLinks],
    ],
  },
  {
    target: "orders",
    title: "清理订单",
    desc: "删除订单、订单项、物流、物流事件和订单相关佣金流水。",
    icon: ShoppingCart,
    stats: (s) => [
      ["订单", s.orders?.orders],
      ["订单项", s.orders?.orderItems],
      ["物流", s.orders?.shipments],
      ["物流事件", s.orders?.shipmentEvents],
    ],
  },
  {
    target: "prescriptions",
    title: "清理处方",
    desc: "删除处方记录和处方 R2 上传文件；订单项里的 prescription_id 会置空。",
    icon: FileText,
    stats: (s) => [
      ["处方", s.prescriptions?.prescriptions],
      ["R2 文件", s.prescriptions?.uploadObjects],
      ["订单引用", s.prescriptions?.linkedOrderItems],
    ],
  },
  {
    target: "addresses",
    title: "清理地址",
    desc: "删除 C 端账号地址簿；不会修改历史订单地址快照。",
    icon: MapPin,
    stats: (s) => [["地址", s.addresses?.addresses]],
  },
];

export const Route = createFileRoute("/admin/debug")({
  component: AdminDebugPage,
});

function AdminDebugPage() {
  const [stats, setStats] = useState<CleanupStats>({});
  const [busy, setBusy] = useState<CleanupTarget | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/cleanup", {
      credentials: "same-origin",
    });
    if (!res.ok) throw new Error("load_failed");
    setStats((await res.json()) as CleanupStats);
  };

  useEffect(() => {
    load().catch(() => setErr("Debug 数据读取失败"));
  }, []);

  const cleanup = async (target: CleanupTarget) => {
    if (!confirm(`确认清理 ${target}？此操作不可恢复。`)) return;
    setBusy(target);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/cleanup", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, confirm: target }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "cleanup_failed");
      setOk(`${target} 已清理`);
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "清理失败");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Debug</h1>
        <p className="text-sm text-muted-foreground">
          上线前业务数据清理工具。生产上线后应移除或关闭本页入口。
        </p>
      </div>

      <section className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-800">
        这些按钮会删除真实业务数据，只用于开发、测试、上线前重置数据。操作会写入操作日志。
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => load().catch(() => setErr("刷新失败"))}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          刷新统计
        </button>
      </div>

      {err && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </div>
      )}
      {ok && (
        <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {ok}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {TARGETS.map((item) => {
          const Icon = item.icon;
          return (
            <section
              key={item.target}
              className="rounded-lg border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {item.stats(stats).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border bg-background px-3 py-2"
                  >
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="mt-1 font-mono text-lg">{value ?? "—"}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => cleanup(item.target)}
                disabled={busy !== null}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-destructive px-3 text-sm font-medium text-destructive-foreground disabled:opacity-50"
              >
                {busy === item.target ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                清理
              </button>
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Database className="h-4 w-4" />
          Scope
        </div>
        <p className="text-sm text-muted-foreground">
          本页只处理业务测试数据。日志清理属于运维，放在系统设置里。
        </p>
      </section>
    </div>
  );
}

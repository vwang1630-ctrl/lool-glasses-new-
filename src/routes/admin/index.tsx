// /admin/ — admin dashboard. Stat cards summarising key counts pulled from
// existing admin endpoints. Renders inside the AdminLayout Outlet.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Glasses,
  ShoppingCart,
  Building2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

interface Stat {
  label: string;
  value: number | string | null;
  icon: ComponentType<{ className?: string }>;
  to: string;
  subtitle?: string;
}

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<{
    products: number | null;
    lensSkus: number | null;
    orders: number | null;
    suppliers: number | null;
  }>({ products: null, lensSkus: null, orders: null, suppliers: null });

  useEffect(() => {
    fetch("/api/admin/products?limit=1", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total?: number } | null) => {
        if (typeof d?.total === "number")
          setStats((s) => ({ ...s, products: d.total! }));
      })
      .catch(() => null);

    fetch("/api/admin/lens-skus?limit=1", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total?: number } | null) => {
        if (typeof d?.total === "number")
          setStats((s) => ({ ...s, lensSkus: d.total! }));
      })
      .catch(() => null);

    // Product-side suppliers (lens labs + frame factories + both). Payment
    // & logistics are counted separately if/when we add cards for them.
    fetch("/api/admin/suppliers", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { suppliers?: { kind?: string }[] } | null) => {
        const productKinds = new Set(["lens", "frame", "both"]);
        const total = (d?.suppliers ?? []).filter((s) =>
          productKinds.has(s.kind ?? ""),
        ).length;
        setStats((s) => ({ ...s, suppliers: total }));
      })
      .catch(() => null);

    fetch("/api/admin/orders?limit=1", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total?: number } | null) => {
        if (typeof d?.total === "number")
          setStats((s) => ({ ...s, orders: d.total! }));
      })
      .catch(() => null);
  }, []);

  const cards: Stat[] = [
    {
      label: "镜框商品",
      value: stats.products ?? "—",
      icon: Package,
      to: "/admin/products",
      subtitle: "在售 SKU",
    },
    {
      label: "镜片 SKU",
      value: stats.lensSkus ?? "—",
      icon: Glasses,
      to: "/admin/lens-skus",
      subtitle: "销售层镜片",
    },
    {
      label: "订单",
      value: stats.orders ?? "—",
      icon: ShoppingCart,
      to: "/admin/orders",
      subtitle: "待发货 / 处理中",
    },
    {
      label: "生产供应商",
      value: stats.suppliers ?? "—",
      icon: Building2,
      to: "/admin/suppliers-product",
      subtitle: "镜片厂 + 镜框厂",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">控制台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          欢迎回来，今天平台数据一览。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to as never}
              className="group rounded-xl border border-border bg-card p-5 transition-smooth hover:border-primary/40 hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground/70 group-hover:bg-primary/10 group-hover:text-primary transition-smooth">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-smooth" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {c.value}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground/80">
                  {c.label}
                </p>
                {c.subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.subtitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">快捷操作</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "新建镜框", to: "/admin/products/new" },
            { label: "新增镜片 SKU", to: "/admin/lens-skus/new" },
            { label: "管理品牌", to: "/admin/lens-brands" },
            { label: "镜片 / 镜框供应商", to: "/admin/suppliers-product" },
            { label: "首页 banner", to: "/admin/home-banners" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to as never}
              className="rounded-md border border-border px-4 py-3 text-sm text-foreground hover:border-primary hover:bg-primary/5 transition-smooth text-center"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Roadmap notice */}
      <section className="rounded-xl border border-dashed border-border bg-secondary/30 p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm text-foreground/80 space-y-1">
            <p className="font-medium text-foreground">后台重构进度</p>
            <p>
              控制台 + 登录（密码 /
              邮箱验证码）已上线。商品、镜片、订单、供应商等子页面正在按 schema
              重写，参考设计稿来源见 <code className="text-xs">CLAUDE.md</code>
              。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

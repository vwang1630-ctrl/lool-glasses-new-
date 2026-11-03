// Admin SPA shell: collapsible sidebar + sticky top header + content Outlet.
// Adapted from design repo `vwang1630-ctrl/glasses-opus-studio` with the nav
// restructured to match our actual D1 schema (no fictional customers /
// marketing / finance / analytics — those tables don't exist yet).

import {
  Link,
  Outlet,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Glasses,
  ShoppingCart,
  Truck,
  Building2,
  CreditCard,
  Plane,
  Contact,
  Tag,
  Sparkles,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  LogOut,
  Settings,
  Users,
  ScrollText,
  KeyRound,
  Megaphone,
  Bug,
} from "lucide-react";
import { useState, useEffect, useRef, type ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavIcon = ComponentType<{ className?: string }>;
type NavItem = { to: string; label: string; icon: NavIcon; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

// Nav groups grounded in real D1 tables. Items pointing to routes that don't
// exist yet render the link as a stub page (admin/{name}.tsx will be added
// incrementally).
const groups: NavGroup[] = [
  {
    label: "概览",
    items: [
      { to: "/admin", label: "控制台", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "商品 & 镜片",
    items: [
      { to: "/admin/products", label: "镜框商品", icon: Package },
      { to: "/admin/lens-skus", label: "镜片 SKU", icon: Glasses },
      { to: "/admin/lens-brands", label: "镜片品牌", icon: Tag },
    ],
  },
  {
    label: "订单 & 履约",
    items: [
      { to: "/admin/orders", label: "订单管理", icon: ShoppingCart },
      { to: "/admin/customers", label: "客户管理", icon: Users },
      { to: "/admin/prescriptions", label: "处方记录", icon: FileText },
    ],
  },
  {
    label: "供应链",
    items: [
      {
        to: "/admin/suppliers-product",
        label: "镜片 / 镜框供应商",
        icon: Building2,
      },
      { to: "/admin/suppliers-payment", label: "支付供应商", icon: CreditCard },
      { to: "/admin/suppliers-logistics", label: "物流供应商", icon: Plane },
      { to: "/admin/logistics-contacts", label: "货代代理", icon: Contact },
    ],
  },
  {
    label: "营销",
    items: [
      { to: "/admin/home-banners", label: "首页 banner", icon: ImageIcon },
      { to: "/admin/blog", label: "博客", icon: FileText },
      { to: "/admin/affiliates", label: "代理管理", icon: Megaphone },
    ],
  },
  {
    label: "系统",
    items: [
      { to: "/admin/admin-users", label: "管理员账户", icon: Users },
      { to: "/admin/tracker-users", label: "跟单后台账户", icon: Users },
      { to: "/admin/api-tokens", label: "API Token", icon: KeyRound },
      { to: "/admin/audit-log", label: "操作日志", icon: ScrollText },
      { to: "/admin/settings", label: "系统设置", icon: Settings },
    ],
  },
  {
    label: "Debug",
    items: [{ to: "/admin/debug", label: "业务数据清理", icon: Bug }],
  },
];

interface AdminProfile {
  id: string;
  email: string;
  role: "owner" | "staff";
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { admin: AdminProfile }) => setProfile(d.admin))
      .catch(() => {
        navigate({ to: "/admin/login" });
      });
  }, [navigate]);

  const onLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      /* ignore */
    }
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Glasses className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wider text-foreground">
                LOOL
              </span>
              <span className="text-[10px] text-muted-foreground">
                EYEWEAR ADMIN
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {groups.map((g) => (
            <div key={g.label}>
              {!collapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {g.label}
                </div>
              )}
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.to
                    : pathname === item.to ||
                      pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to as never}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="border-t border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground"
        >
          {collapsed ? "→" : "← 收起菜单"}
        </button>
      </aside>

      {/* Main */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          collapsed ? "ml-16" : "ml-60",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-border bg-card/80 px-6 backdrop-blur">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {(profile?.email ?? "AD").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden text-left text-xs leading-tight md:block">
                <div className="font-medium text-foreground">
                  {profile?.email ?? "—"}
                </div>
                <div className="text-muted-foreground">
                  {profile?.role === "owner"
                    ? "超级管理员"
                    : profile
                      ? "员工"
                      : ""}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-card py-1 shadow-lg">
                <Link
                  to="/admin/admin-users"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  管理员账户
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  系统设置
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

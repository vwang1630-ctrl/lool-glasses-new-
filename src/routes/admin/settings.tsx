// /admin/settings — system settings dashboard. Info-only:
// shows infrastructure bindings, external service account hints, and operator
// dashboard links. Secrets stay in Cloudflare and are never rendered here.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bot,
  Brain,
  Code2,
  CreditCard,
  Database,
  ExternalLink,
  Globe,
  HardDrive,
  Mail,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { getCountryOptions } from "@/lib/countries";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">系统设置</h1>
        <p className="text-sm text-muted-foreground">
          基础设施与外部账号只读展示。这里保留账号线索和入口，不展示密码、API
          key 或 webhook secret。
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <ShippingRulesPanel />
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cloudflare Bindings
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card icon={<Database className="h-4 w-4" />} label="D1 数据库">
            <code>env.DB</code> → <code>lool-work</code>
          </Card>
          <Card icon={<HardDrive className="h-4 w-4" />} label="R2 — 处方上传">
            <code>env.RX_BUCKET</code> → <code>lool-work-rx</code>
          </Card>
          <Card icon={<HardDrive className="h-4 w-4" />} label="R2 — 商品图">
            <code>env.PRODUCTS_BUCKET</code> → <code>lool-work-products</code>
          </Card>
          <Card icon={<Globe className="h-4 w-4" />} label="自定义域">
            loollook.com + www.loollook.com
          </Card>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          服务账号台账
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AccountCard
            icon={<ShieldCheck className="h-4 w-4" />}
            service="Cloudflare"
            account="lucas.xue2020@gmail.com"
            hint="Worker / D1 / R2 / DNS；API token 名称：loollook.com"
            href="https://dash.cloudflare.com"
          />
          <AccountCard
            icon={<CreditCard className="h-4 w-4" />}
            service="Stripe"
            account="paulo.xue@gmail.com"
            hint="acct_1TbBafCSBD46PJJh；HK 沙盒账号；正式收款前需换 live key"
            href="https://dashboard.stripe.com"
          />
          <AccountCard
            icon={<Mail className="h-4 w-4" />}
            service="Resend"
            account="noreply@loollook.com"
            hint="当前 key 是 send-only；发件域 loollook.com；收件 fallback：hello@loollook.com"
            href="https://resend.com/domains"
          />
          <AccountCard
            icon={<Brain className="h-4 w-4" />}
            service="Anthropic"
            account="paulo.xue@gmail.com"
            hint="Claude API；用于处方图片识别；后台只保存 ANTHROPIC_API_KEY secret"
            href="https://console.anthropic.com"
          />
          <AccountCard
            icon={<Bot className="h-4 w-4" />}
            service="Feishu / Lark"
            account="cli_aa8ecfb102badbda"
            hint="内部任务流 bot；凭据只在本地 .env，用于协作系统"
            href="https://open.feishu.cn"
          />
          <AccountCard
            icon={<Code2 className="h-4 w-4" />}
            service="GitHub"
            account="lucasxue2 / loollook.com"
            hint="GitHub 用户：lucasxue2；项目里没有保存登录邮箱；线上部署由 Wrangler 推送到 Cloudflare"
            href="https://github.com/lucasxue2/loollook.com"
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          环境变量 / Secret
        </h2>
        <div className="space-y-2 text-sm">
          <Row label="SITE_URL" value="https://loollook.com" />
          <Row label="RESEND_FROM" value="noreply@loollook.com" />
          <Row
            label="RESEND_API_KEY"
            value="(secret — 通过 wrangler secret put 管理)"
            mute
          />
          <Row
            label="SESSION_SECRET"
            value="(secret — 用于 HMAC 签名账户 / 管理员 / 跟单 session)"
            mute
          />
          <Row
            label="STRIPE_PUBLISHABLE_KEY"
            value="(secret — Stripe 前端 publishable key)"
            mute
          />
          <Row
            label="STRIPE_SECRET_KEY"
            value="(secret — Stripe 后端 API key)"
            mute
          />
          <Row
            label="STRIPE_WEBHOOK_SECRET"
            value="(secret — Stripe webhook 签名校验)"
            mute
          />
          <Row
            label="ANTHROPIC_API_KEY"
            value="(secret — Claude 处方识别)"
            mute
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <AuditLogMaintenancePanel />
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          运维入口
        </h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
          <ExtLink
            icon={<Mail className="h-4 w-4" />}
            href="https://resend.com"
            label="Resend Dashboard"
            note="邮件发送日志 / DKIM 状态"
          />
          <ExtLink
            icon={<ShieldCheck className="h-4 w-4" />}
            href="https://dash.cloudflare.com"
            label="Cloudflare Dashboard"
            note="D1 / R2 / Worker 配置"
          />
          <ExtLink
            icon={<CreditCard className="h-4 w-4" />}
            href="https://dashboard.stripe.com"
            label="Stripe Dashboard"
            note="支付日志 / Webhook / API keys"
          />
          <ExtLink
            icon={<Brain className="h-4 w-4" />}
            href="https://console.anthropic.com"
            label="Anthropic Console"
            note="Claude API key / usage / billing"
          />
          <ExtLink
            icon={<Bot className="h-4 w-4" />}
            href="https://open.feishu.cn"
            label="Feishu Developer"
            note="内部 bot / Lark 应用配置"
          />
          <ExtLink
            icon={<Code2 className="h-4 w-4" />}
            href="https://github.com/lucasxue2/loollook.com"
            label="GitHub Repository"
            note="代码 / 提交 / 发布记录"
          />
        </div>
      </section>

      <section className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-5">
        <h2 className="mb-2 text-sm font-semibold text-amber-700">规划中</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>租户级开关：维护横幅、强制下线、灰度发布</li>
          <li>邮件模板编辑器</li>
          <li>API rate-limit 策略</li>
        </ul>
        <Link
          to="/admin"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          返回控制台
        </Link>
      </section>
    </div>
  );
}

function AuditLogMaintenancePanel() {
  const [scope, setScope] = useState("");
  const [days, setDays] = useState("90");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const cleanup = async () => {
    const olderThanDays = Math.max(0, Math.floor(Number(days)));
    if (!Number.isFinite(olderThanDays)) {
      setErr("保留天数必须是数字");
      return;
    }
    const label = scope ? scopeLabel(scope) : "全部端";
    if (!confirm(`清理 ${label} 中 ${olderThanDays} 天以前的日志？`)) return;
    setBusy(true);
    setMessage(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/audit-log", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: scope || null,
          olderThanDays,
          confirm: "audit_logs",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        before?: { matched?: number; r2Objects?: number };
      };
      if (!res.ok) throw new Error(data.error ?? "cleanup_failed");
      setMessage(
        `已清理 ${data.before?.matched ?? 0} 条日志，R2 对象 ${data.before?.r2Objects ?? 0} 个。`,
      );
    } catch (error) {
      setErr(error instanceof Error ? error.message : "清理失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Audit Log Maintenance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          运维清理操作日志索引和对应 R2 对象。业务数据清理在 Debug 大类中。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_160px_auto]">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">端</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3"
          >
            <option value="">全部端</option>
            <option value="admin">管理后台</option>
            <option value="affiliate">代理后台</option>
            <option value="tracker">跟单后台</option>
            <option value="customer">C 端</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">清理早于 N 天</span>
          <input
            value={days}
            onChange={(e) => setDays(e.target.value)}
            inputMode="numeric"
            className="h-10 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <button
          type="button"
          onClick={cleanup}
          disabled={busy}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          清理日志
        </button>
      </div>
      {err && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </div>
      )}
      {message && (
        <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}
    </div>
  );
}

function scopeLabel(scope: string): string {
  if (scope === "admin") return "管理后台";
  if (scope === "affiliate") return "代理后台";
  if (scope === "tracker") return "跟单后台";
  if (scope === "customer") return "C 端";
  return scope;
}

interface ShippingRule {
  country_code: string;
  shipping_cents: number;
  free_shipping_threshold_cents: number;
  country_discount_pct: number;
}

function ShippingRulesPanel() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [countryCode, setCountryCode] = useState("jp");
  const [shippingUsd, setShippingUsd] = useState("8");
  const [thresholdUsd, setThresholdUsd] = useState("69");
  const [discountPct, setDiscountPct] = useState("0");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const countryOptions = getCountryOptions("zh");

  const load = async () => {
    const res = await fetch("/api/admin/shipping-rules");
    if (!res.ok) throw new Error("load_failed");
    const data = (await res.json()) as { rules?: ShippingRule[] };
    setRules(data.rules ?? []);
  };

  useEffect(() => {
    load().catch(() => setErr("运费配置读取失败"));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const normalized = countryCode.trim().toLowerCase();
      if (normalized !== "row" && !/^[a-z]{2}$/.test(normalized)) {
        setErr("国家代码必须是 ISO 2 位小写代码，或 row");
        return;
      }
      const shipping = Number(shippingUsd);
      const threshold = Number(thresholdUsd);
      const discount = Number(discountPct);
      if (
        !Number.isFinite(shipping) ||
        shipping < 0 ||
        !Number.isFinite(threshold) ||
        threshold < 0
      ) {
        setErr("金额必须是大于等于 0 的数字");
        return;
      }
      if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
        setErr("国家折扣必须是 0 - 100 之间的数字");
        return;
      }
      const res = await fetch("/api/admin/shipping-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: normalized,
          shippingCents: Math.round(shipping * 100),
          freeShippingThresholdCents: Math.round(threshold * 100),
          countryDiscountPct: discount / 100,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        rules?: ShippingRule[];
      };
      if (!res.ok) throw new Error(data.error ?? "save_failed");
      setRules(data.rules ?? []);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (code: string) => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/admin/shipping-rules?countryCode=${encodeURIComponent(code)}`,
        {
          method: "DELETE",
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        rules?: ShippingRule[];
      };
      if (!res.ok) throw new Error(data.error ?? "delete_failed");
      setRules(data.rules ?? []);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Checkout Shipping Rules
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          按国家配置运费、免运费门槛和国家级商品折扣。未配置国家会 fallback 到{" "}
          <code>row</code>。
        </p>
      </div>

      <form
        onSubmit={save}
        className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_1fr_1fr_auto]"
      >
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">国家</span>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3"
          >
            <option value="row">row — 其他国家/地区</option>
            {countryOptions.map((country) => (
              <option key={country.code} value={country.code.toLowerCase()}>
                {country.code.toLowerCase()} — {country.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">运费 USD</span>
          <input
            value={shippingUsd}
            onChange={(e) => setShippingUsd(e.target.value)}
            inputMode="decimal"
            className="h-10 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">免运费门槛 USD</span>
          <input
            value={thresholdUsd}
            onChange={(e) => setThresholdUsd(e.target.value)}
            inputMode="decimal"
            className="h-10 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">国家折扣 %</span>
          <input
            value={discountPct}
            onChange={(e) => setDiscountPct(e.target.value)}
            inputMode="decimal"
            className="h-10 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {rules.some(
            (r) => r.country_code === countryCode.trim().toLowerCase(),
          ) ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          保存
        </button>
      </form>

      {err && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">国家</th>
              <th className="px-3 py-2">运费</th>
              <th className="px-3 py-2">免运费门槛</th>
              <th className="px-3 py-2">国家折扣</th>
              <th className="px-3 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.country_code} className="border-t border-border">
                <td className="px-3 py-2 font-mono">{r.country_code}</td>
                <td className="px-3 py-2">
                  ${(r.shipping_cents / 100).toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  ${(r.free_shipping_threshold_cents / 100).toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  {((r.country_discount_pct ?? 0) * 100)
                    .toFixed(1)
                    .replace(/\.0$/, "")}
                  %
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setCountryCode(r.country_code);
                      setShippingUsd(String(r.shipping_cents / 100));
                      setThresholdUsd(
                        String(r.free_shipping_threshold_cents / 100),
                      );
                      setDiscountPct(
                        String((r.country_discount_pct ?? 0) * 100),
                      );
                    }}
                    className="mr-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary"
                  >
                    编辑
                  </button>
                  {r.country_code !== "row" && (
                    <button
                      type="button"
                      onClick={() => remove(r.country_code)}
                      disabled={busy}
                      className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      aria-label={`Delete ${r.country_code}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  暂无配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountCard({
  icon,
  service,
  account,
  hint,
  href,
}: {
  icon: React.ReactNode;
  service: string;
  account: string;
  hint: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-md border border-border bg-background p-3 hover:bg-secondary"
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {service}
        <ExternalLink className="ml-auto h-3 w-3" />
      </div>
      <div className="break-all font-mono text-sm">{account}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</div>
    </a>
  );
}

function Card({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mute,
}: {
  label: string;
  value: string;
  mute?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-b-0 last:pb-0">
      <code className="text-xs text-muted-foreground">{label}</code>
      <span
        className={`font-mono text-xs ${mute ? "text-muted-foreground" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function ExtLink({
  icon,
  href,
  label,
  note,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
  note: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-start gap-2 rounded-md border border-border bg-background p-3 hover:bg-secondary"
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-1 font-medium">
          {label}
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">{note}</div>
      </div>
    </a>
  );
}

// /admin/audit-log — read-only view of admin operations.

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

interface AuditLog {
  id: string;
  scope: string;
  actor_type: string;
  actor_id: string | null;
  actor_email: string | null;
  client_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  path: string;
  r2_key: string | null;
  summary_json: string | null;
  created_at: number;
}

type AuditDetail = AuditLog & {
  before?: unknown;
  after?: unknown;
  meta?: unknown;
  legacyD1?: boolean;
};

const ACTION_COLOR: Record<string, string> = {
  POST: "bg-emerald-500/15 text-emerald-700",
  PATCH: "bg-blue-500/15 text-blue-700",
  PUT: "bg-violet-500/15 text-violet-700",
  DELETE: "bg-destructive/15 text-destructive",
};

const RESOURCE_TYPES = [
  { value: "", label: "全部资源" },
  { value: "orders", label: "订单" },
  { value: "products", label: "镜框商品" },
  { value: "lens_skus", label: "镜片 SKU" },
  { value: "lens_brands", label: "镜片品牌" },
  { value: "suppliers", label: "供应商" },
  { value: "shipments", label: "物流" },
  { value: "admin_users", label: "管理员账户" },
  { value: "home_banners", label: "首页 banner" },
  { value: "product_colors", label: "商品颜色" },
];

const SCOPES = [
  { value: "", label: "全部端" },
  { value: "admin", label: "管理后台" },
  { value: "affiliate", label: "代理后台" },
  { value: "tracker", label: "跟单后台" },
  { value: "customer", label: "C 端" },
];

export const Route = createFileRoute("/admin/audit-log")({
  component: AdminAuditLogPage,
});

function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<
    Record<string, AuditDetail | "loading" | "error">
  >({});
  const limit = 25;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (scope) params.set("scope", scope);
      if (resourceType) params.set("resource_type", resourceType);
      const r = await fetch(`/api/admin/audit-log?${params}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { logs: AuditLog[]; total: number };
      setLogs(d.logs);
      setTotal(d.total);
    } finally {
      setLoading(false);
    }
  }, [limit, page, resourceType, scope]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [scope, resourceType]);

  const toggle = async (id: string) => {
    setExpanded((x) => (x === id ? null : id));
    if (expanded === id || details[id]) return;
    setDetails((current) => ({ ...current, [id]: "loading" }));
    try {
      const r = await fetch(
        `/api/admin/audit-log?id=${encodeURIComponent(id)}`,
        {
          credentials: "same-origin",
        },
      );
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as AuditDetail;
      setDetails((current) => ({ ...current, [id]: d }));
    } catch {
      setDetails((current) => ({ ...current, [id]: "error" }));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">操作日志</h1>
        <p className="text-sm text-muted-foreground">
          管理后台、代理后台、跟单后台、C 端关键操作记录。D1
          保存索引，完整详情保存在 R2。
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          {SCOPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          {RESOURCE_TYPES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
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
              <th className="px-4 py-3 w-32">时间</th>
              <th className="px-4 py-3 w-24">端</th>
              <th className="px-4 py-3">操作者</th>
              <th className="px-4 py-3 w-20">动作</th>
              <th className="px-4 py-3">资源</th>
              <th className="px-4 py-3">资源 ID</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无日志
                </td>
              </tr>
            ) : (
              logs.flatMap((l) => [
                <tr key={l.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(l.created_at)
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " ")}
                  </td>
                  <td className="px-4 py-3 text-xs">{scopeLabel(l.scope)}</td>
                  <td className="px-4 py-3 text-xs">
                    {l.actor_email ?? l.client_id ?? l.actor_id ?? "anonymous"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                        ACTION_COLOR[l.action] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{l.resource_type}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {l.resource_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => void toggle(l.id)}
                      className="text-muted-foreground hover:text-foreground"
                      title="展开"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expanded === l.id ? "rotate-180" : ""}`}
                      />
                    </button>
                  </td>
                </tr>,
                expanded === l.id ? (
                  <tr key={`${l.id}-expanded`} className="bg-secondary/20">
                    <td colSpan={7} className="px-4 py-3">
                      <AuditDetailBlock detail={details[l.id]} log={l} />
                    </td>
                  </tr>
                ) : null,
              ])
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function AuditDetailBlock({
  detail,
  log,
}: {
  detail: AuditDetail | "loading" | "error" | undefined;
  log: AuditLog;
}) {
  if (!detail || detail === "loading") {
    return (
      <div className="py-3 text-xs text-muted-foreground">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
        加载详情…
      </div>
    );
  }
  if (detail === "error") {
    return <div className="py-3 text-xs text-destructive">详情加载失败</div>;
  }
  return (
    <div className="space-y-2 text-xs">
      <div>
        <span className="text-muted-foreground">Path: </span>
        <code className="break-all">{detail.path ?? log.path}</code>
      </div>
      <div>
        <span className="text-muted-foreground">R2: </span>
        <code className="break-all">{log.r2_key ?? "legacy D1 row"}</code>
      </div>
      {detail.before != null && (
        <details>
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            before
          </summary>
          <pre className="mt-1 overflow-auto rounded bg-background p-2 font-mono text-[11px]">
            {prettyJson(detail.before)}
          </pre>
        </details>
      )}
      {detail.after != null && (
        <details open>
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            after / patch
          </summary>
          <pre className="mt-1 overflow-auto rounded bg-background p-2 font-mono text-[11px]">
            {prettyJson(detail.after)}
          </pre>
        </details>
      )}
      {detail.meta != null && (
        <details>
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            meta
          </summary>
          <pre className="mt-1 overflow-auto rounded bg-background p-2 font-mono text-[11px]">
            {prettyJson(detail.meta)}
          </pre>
        </details>
      )}
      {detail.before == null && detail.after == null && detail.meta == null && (
        <div className="text-muted-foreground">无详情字段</div>
      )}
    </div>
  );
}

function scopeLabel(scope: string): string {
  return SCOPES.find((s) => s.value === scope)?.label ?? scope;
}

function prettyJson(value: unknown): string {
  try {
    return typeof value === "string"
      ? JSON.stringify(JSON.parse(value), null, 2)
      : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

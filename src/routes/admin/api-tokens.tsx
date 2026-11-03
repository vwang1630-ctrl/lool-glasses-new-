// /admin/api-tokens — list / create / revoke long-lived API tokens for
// scripts and the MCP server (see docs/mcp-admin.md). Plaintext is shown
// exactly once at creation; from there only name + timestamps are visible.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

interface ApiToken {
  id: string;
  admin_user_id: string;
  name: string;
  scope: "read" | "write";
  created_at: number;
  last_used_at: number | null;
  revoked_at: number | null;
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

export const Route = createFileRoute("/admin/api-tokens")({
  component: AdminApiTokensPage,
});

function AdminApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState<"read" | "write">("read");
  const [createBusy, setCreateBusy] = useState(false);

  const [justCreated, setJustCreated] = useState<{
    name: string;
    token: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/api-tokens", {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { tokens: ApiToken[] };
      setTokens(d.tokens);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const name = newName.trim();
    if (!name || name.length > 64) return setErr("名称必填，1-64 字符");
    setCreateBusy(true);
    try {
      const res = await fetch("/api/admin/api-tokens", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scope: newScope }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "创建失败");
        return;
      }
      const data = (await res.json()) as {
        id: string;
        name: string;
        token: string;
      };
      setJustCreated({ name: data.name, token: data.token });
      setCreating(false);
      setNewName("");
      setNewScope("read");
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  const revoke = async (id: string, name: string) => {
    if (!confirm(`撤销 token「${name}」？后续凭此 token 的 API 调用将被拒绝。`))
      return;
    const res = await fetch(`/api/admin/api-tokens/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      alert(data.message ?? data.error ?? "撤销失败");
    }
    load();
  };

  const copyToken = async () => {
    if (!justCreated) return;
    try {
      await navigator.clipboard.writeText(justCreated.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available; user can select manually.
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Token</h1>
          <p className="text-sm text-muted-foreground">
            脚本 / MCP server 调用 admin API 用的长效
            token。明文仅在创建时显示一次。
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建 Token
          </button>
        )}
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {justCreated && (
        <div className="rounded-lg border-2 border-amber-500/50 bg-amber-50/50 p-4 dark:bg-amber-500/5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Token「{justCreated.name}
            」已创建。明文只显示这一次，离开本页后无法再取。
          </div>
          <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-card p-2">
            <code className="flex-1 break-all px-2 py-1 font-mono text-xs">
              {justCreated.token}
            </code>
            <button
              onClick={copyToken}
              className="flex h-8 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs hover:bg-secondary"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  复制
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => setJustCreated(null)}
            className="mt-3 text-xs text-muted-foreground underline hover:text-foreground"
          >
            我已保存好，关闭
          </button>
        </div>
      )}

      {creating && (
        <form
          onSubmit={submitCreate}
          className="rounded-lg border border-border bg-card p-4 shadow-soft"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Token 名称（备忘用） *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如 mcp-server / dev-laptop / cron-feed"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                权限 *
              </label>
              <select
                value={newScope}
                onChange={(e) =>
                  setNewScope(e.target.value === "write" ? "write" : "read")
                }
                className={inputCls}
              >
                <option value="read">只读（LoolOS / readonly MCP）</option>
                <option value="write">读写（Admin MCP / Codex）</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={createBusy}
                className="flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                创建
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                  setNewScope("read");
                }}
                className="flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-secondary"
              >
                <X className="h-3.5 w-3.5" />
                取消
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">权限</th>
              <th className="px-4 py-3">创建时间</th>
              <th className="px-4 py-3">最后使用</th>
              <th className="px-4 py-3 w-16 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : tokens.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  还没有 token。点右上角「新建 Token」创建第一个。
                </td>
              </tr>
            ) : (
              tokens.map((t) => {
                const revoked = t.revoked_at !== null;
                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-secondary/30 ${revoked ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-muted-foreground"
                      title={t.id}
                    >
                      {t.id}
                    </td>
                    <td className="px-4 py-3">
                      {revoked ? (
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          已撤销
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          有效
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.scope === "read" ? (
                        <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          只读
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          读写
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(t.created_at)
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.last_used_at
                        ? new Date(t.last_used_at)
                            .toISOString()
                            .slice(0, 16)
                            .replace("T", " ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!revoked && (
                        <button
                          onClick={() => revoke(t.id, t.name)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-destructive hover:bg-destructive/10"
                          title="撤销"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

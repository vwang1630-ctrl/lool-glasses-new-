// /admin/tracker-users — manage 订单跟踪 staff accounts that back the
// /tracker portal. OTP-only login, @loollook.com only — no passwords.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  Archive,
  ArchiveRestore,
} from "lucide-react";

interface TrackerUser {
  id: string;
  email: string;
  name: string;
  active: number;
  last_login_at: number | null;
  created_at: number;
  updated_at: number;
}

const inputCls =
  "h-8 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

export const Route = createFileRoute("/admin/tracker-users")({
  component: TrackerUsersPage,
});

function TrackerUsersPage() {
  const [users, setUsers] = useState<TrackerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/tracker-users", {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { users: TrackerUser[] };
      setUsers(d.users);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setErr("邮箱格式不合法");
    if (!email.endsWith("@loollook.com"))
      return setErr("仅限 @loollook.com 邮箱");
    if (!newName.trim()) return setErr("姓名必填");
    setCreateBusy(true);
    try {
      const res = await fetch("/api/admin/tracker-users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: newName.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "email_taken") setErr("此邮箱已存在");
        else if (data.error === "domain_required")
          setErr("仅限 @loollook.com 邮箱");
        else setErr(data.message ?? data.error ?? "创建失败");
        setCreateBusy(false);
        return;
      }
      setCreating(false);
      setNewEmail("");
      setNewName("");
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  const updateName = async (id: string, name: string) => {
    const res = await fetch(`/api/admin/tracker-users/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) alert("更新姓名失败");
    void load();
  };

  const toggleActive = async (id: string, next: boolean) => {
    const res = await fetch(`/api/admin/tracker-users/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) alert("切换启用状态失败");
    void load();
  };

  const hardDelete = async (id: string, email: string) => {
    if (!confirm(`⚠ 永久删除 ${email}？不可恢复。`)) return;
    const res = await fetch(`/api/admin/tracker-users/${id}?hard=1`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) alert("删除失败");
    void load();
  };

  const fmtDate = (ms: number | null) =>
    ms ? new Date(ms).toISOString().slice(0, 16).replace("T", " ") : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold font-display">跟单后台账户</h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1 text-sm h-9 px-4 rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          新建账户
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        这些账号用来登录 <code className="font-mono">/tracker</code>{" "}
        跟单后台。OTP 邮箱登录，仅限 @loollook.com。完全独立于
        <code className="font-mono">/admin</code>，没有后台权限。
      </p>

      {err && <p className="text-sm text-destructive">{err}</p>}

      {creating && (
        <form
          onSubmit={submitCreate}
          className="rounded-2xl border border-border bg-background p-4 space-y-3 max-w-xl"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                邮箱（@loollook.com）
              </span>
              <input
                className={inputCls + " mt-1"}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="alice@loollook.com"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                姓名
              </span>
              <input
                className={inputCls + " mt-1"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="员工姓名"
                required
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createBusy}
              className="inline-flex items-center gap-1 text-sm h-9 px-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {createBusy ? "创建中…" : "创建"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="inline-flex items-center gap-1 text-sm h-9 px-4 rounded-full border border-border hover:bg-secondary/40"
            >
              <X className="h-4 w-4" />
              取消
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> 加载中…
        </div>
      ) : (
        <div className="bg-background rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">邮箱</th>
                <th className="text-left px-4 py-3">姓名</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">最近登录</th>
                <th className="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={u.name}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== u.name)
                          void updateName(u.id, e.target.value.trim());
                      }}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {u.active ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        启用
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                        停用
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {fmtDate(u.last_login_at)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(u.id, !u.active)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {u.active ? (
                        <>
                          <Archive className="h-3.5 w-3.5" />
                          停用
                        </>
                      ) : (
                        <>
                          <ArchiveRestore className="h-3.5 w-3.5" />
                          启用
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => hardDelete(u.id, u.email)}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

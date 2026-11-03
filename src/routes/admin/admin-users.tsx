// /admin/admin-users — admin user management. Inline create + per-row role/active toggle
// + reset-password modal. Does NOT show password_hash.

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

const ROLES = ["owner", "staff"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABEL: Record<Role, string> = {
  owner: "超级管理员 (owner)",
  staff: "员工 (staff)",
};

interface AdminUser {
  id: string;
  email: string;
  role: Role;
  active: number;
  last_login_at: number | null;
  created_at: number;
  updated_at: number;
}

const inputCls =
  "h-8 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

export const Route = createFileRoute("/admin/admin-users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("staff");
  const [createBusy, setCreateBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/admin-users", {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { users: AdminUser[] };
      setUsers(d.users);
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
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setErr("邮箱格式不合法");
    if (!email.endsWith("@loollook.com"))
      return setErr("仅限 @loollook.com 邮箱");
    setCreateBusy(true);
    try {
      const res = await fetch("/api/admin/admin-users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
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
      setNewRole("staff");
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  const updateRole = async (id: string, role: Role) => {
    const res = await fetch(`/api/admin/admin-users/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      alert(data.message ?? data.error ?? "更新角色失败");
    }
    load();
  };

  const toggleActive = async (id: string, next: boolean) => {
    const res = await fetch(`/api/admin/admin-users/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      alert(data.message ?? data.error ?? "操作失败");
    }
    load();
  };

  const hardDelete = async (id: string, email: string) => {
    if (!confirm(`⚠ 永久删除 ${email}？不可恢复。`)) return;
    const res = await fetch(`/api/admin/admin-users/${id}?hard=1`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      alert(data.message ?? data.error ?? "删除失败");
    }
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">管理员账户</h1>
          <p className="text-sm text-muted-foreground">
            管理后台登录账户。OTP 邮箱登录，仅限 @loollook.com。owner
            受最后一位保护，无法被停用 / 降级。
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建账户
          </button>
        )}
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {creating && (
        <form
          onSubmit={submitCreate}
          className="rounded-lg border border-border bg-card p-4 shadow-soft"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                邮箱 * (@loollook.com)
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="editor@loollook.com"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                角色
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={createBusy}
                className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createBusy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                创建
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-secondary"
              >
                <X className="h-3 w-3" />
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
              <th className="px-4 py-3">邮箱</th>
              <th className="px-4 py-3">角色</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">最后登录</th>
              <th className="px-4 py-3">创建时间</th>
              <th className="px-4 py-3 w-32 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无账户
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as Role)}
                      className="h-7 rounded border border-input bg-background px-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.active === 1 ? (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        启用
                      </span>
                    ) : (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        停用
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toISOString().slice(0, 10)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.active === 1 ? (
                      <button
                        onClick={() => toggleActive(u.id, false)}
                        className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="停用"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleActive(u.id, true)}
                        className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="重新启用"
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => hardDelete(u.id, u.email)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-destructive hover:bg-destructive/10"
                      title="硬删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// /admin/logistics-contacts — logistics agent routes.
//
// One row is one concrete route, e.g. "DHL - Zhang San". The carrier stays in
// suppliers for API/tracking config; this page manages who actually receives
// the package for that carrier.

import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Save,
  X,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";

interface Supplier {
  id: string;
  name_zh: string;
  name_en: string;
  active: number;
}

interface Agent {
  id: string;
  supplier_id: string;
  supplier_name_zh: string;
  supplier_name_en: string;
  agent_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: number;
  sort_order: number;
}

const emptyAgent = (): Agent => ({
  id: "",
  supplier_id: "",
  supplier_name_zh: "",
  supplier_name_en: "",
  agent_name: "",
  contact_person: "",
  phone: "",
  email: "",
  notes: "",
  active: 1,
  sort_order: 0,
});

const inputCls =
  "h-8 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
const textareaCls =
  "w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

export const Route = createFileRoute("/admin/logistics-contacts")({
  component: LogisticsAgentsPage,
});

function LogisticsAgentsPage() {
  const [items, setItems] = useState<Agent[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Agent | null>(null);
  const [creating, setCreating] = useState(false);
  const [newAgent, setNewAgent] = useState<Agent>(emptyAgent());
  const [createBusy, setCreateBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showInactive) params.set("inactive", "1");
      const [a, b] = await Promise.all([
        fetch(`/api/admin/logistics-contacts?${params}`, {
          credentials: "same-origin",
        }),
        fetch(`/api/admin/suppliers?kind=logistics`, {
          credentials: "same-origin",
        }),
      ]);
      if (!a.ok) throw new Error(`agents ${a.status}`);
      if (!b.ok) throw new Error(`suppliers ${b.status}`);
      const ad = (await a.json()) as { agents: Agent[] };
      const bd = (await b.json()) as { suppliers: Supplier[] };
      setItems(ad.agents);
      setSuppliers(bd.suppliers.filter((s) => s.active === 1));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [showInactive]);

  const supplierName = (
    a: Pick<Agent, "supplier_name_en" | "supplier_name_zh" | "supplier_id">,
  ) => a.supplier_name_zh || a.supplier_name_en || a.supplier_id;

  const saveEdit = async () => {
    if (!draft) return;
    setErr(null);
    const res = await fetch(`/api/admin/logistics-contacts/${draft.id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier_id: draft.supplier_id,
        agent_name: draft.agent_name,
        contact_person: draft.contact_person,
        phone: draft.phone,
        email: draft.email,
        notes: draft.notes,
        active: draft.active === 1,
        sort_order: draft.sort_order,
      }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      setErr(d.message ?? d.error ?? "保存失败");
      return;
    }
    setEditingId(null);
    setDraft(null);
    await load();
  };

  const archive = async (id: string) => {
    if (!confirm("停用此货代代理？")) return;
    await fetch(`/api/admin/logistics-contacts/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    load();
  };

  const restore = async (id: string) => {
    await fetch(`/api/admin/logistics-contacts/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    load();
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!newAgent.supplier_id) return setErr("承运商必选");
    if (!newAgent.agent_name.trim()) return setErr("代理名称必填");
    setCreateBusy(true);
    try {
      const res = await fetch(`/api/admin/logistics-contacts`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: newAgent.supplier_id,
          agent_name: newAgent.agent_name.trim(),
          contact_person:
            newAgent.contact_person?.trim() || newAgent.agent_name.trim(),
          phone: newAgent.phone?.trim() || null,
          email: newAgent.email?.trim() || null,
          notes: newAgent.notes?.trim() || null,
          sort_order: items.length * 10,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(d.message ?? d.error ?? "创建失败");
        return;
      }
      setCreating(false);
      setNewAgent(emptyAgent());
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  const supplierSelect = (value: string, onChange: (v: string) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      <option value="">— 选择承运商 —</option>
      {suppliers.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name_zh || s.name_en}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">货代代理</h1>
          <p className="text-sm text-muted-foreground">
            一条记录就是一个可选发货线路，例如 DHL - 张三、顺丰 - 张三。承运商
            API / 轨迹配置仍在{" "}
            <Link
              to="/admin/suppliers-logistics"
              className="text-primary underline-offset-2 hover:underline"
            >
              物流供应商
            </Link>{" "}
            页面维护。
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-input"
          />
          显示停用
        </label>
        <div className="ml-auto text-sm text-muted-foreground">
          共 {items.length} 条
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {creating && (
        <form
          onSubmit={submitCreate}
          className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-soft"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                承运商 *
              </label>
              {supplierSelect(newAgent.supplier_id, (supplier_id) =>
                setNewAgent({ ...newAgent, supplier_id }),
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                代理名称 *
              </label>
              <input
                value={newAgent.agent_name}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, agent_name: e.target.value })
                }
                placeholder="张三 / 某货代公司"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                联系人
              </label>
              <input
                value={newAgent.contact_person ?? ""}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, contact_person: e.target.value })
                }
                placeholder="默认同代理名称"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                电话
              </label>
              <input
                value={newAgent.phone ?? ""}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, phone: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                邮箱
              </label>
              <input
                type="email"
                value={newAgent.email ?? ""}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, email: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              备注
            </label>
            <textarea
              value={newAgent.notes ?? ""}
              onChange={(e) =>
                setNewAgent({ ...newAgent, notes: e.target.value })
              }
              rows={2}
              className={textareaCls}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
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
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">线路</th>
              <th className="px-4 py-3">联系人</th>
              <th className="px-4 py-3">电话</th>
              <th className="px-4 py-3">邮箱</th>
              <th className="px-4 py-3 text-right">排序</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3 w-32 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无货代代理
                </td>
              </tr>
            ) : (
              items.map((a) =>
                editingId === a.id && draft ? (
                  <Fragment key={a.id}>
                    <tr className="bg-secondary/20">
                      <td className="px-4 py-2">
                        <div className="grid gap-2">
                          {supplierSelect(draft.supplier_id, (supplier_id) =>
                            setDraft({ ...draft, supplier_id }),
                          )}
                          <input
                            value={draft.agent_name}
                            onChange={(e) =>
                              setDraft({ ...draft, agent_name: e.target.value })
                            }
                            className={inputCls}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={draft.contact_person ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              contact_person: e.target.value || null,
                            })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={draft.phone ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              phone: e.target.value || null,
                            })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="email"
                          value={draft.email ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              email: e.target.value || null,
                            })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={draft.sort_order}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              sort_order: Number(e.target.value) || 0,
                            })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={draft.active === 1}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                active: e.target.checked ? 1 : 0,
                              })
                            }
                          />
                          启用
                        </label>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={saveEdit}
                          className="mr-1 inline-flex h-7 items-center gap-1 rounded bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                          <Save className="h-3 w-3" />
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setDraft(null);
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-xs hover:bg-secondary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-secondary/20">
                      <td colSpan={7} className="px-4 pb-3 pt-0">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          备注
                        </label>
                        <textarea
                          value={draft.notes ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              notes: e.target.value || null,
                            })
                          }
                          rows={2}
                          className={textareaCls}
                        />
                      </td>
                    </tr>
                  </Fragment>
                ) : (
                  <tr key={a.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">
                      {supplierName(a)} — {a.agent_name}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {a.contact_person ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{a.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{a.email ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs">
                      {a.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      {a.active === 1 ? (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          启用
                        </span>
                      ) : (
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          停用
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setErr(null);
                          setEditingId(a.id);
                          setDraft({ ...a });
                        }}
                        className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="编辑"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {a.active === 1 ? (
                        <button
                          onClick={() => archive(a.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="停用"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => restore(a.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="重新启用"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

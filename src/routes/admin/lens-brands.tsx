// /admin/lens-brands — single-page CRUD for the small lens_brands dictionary.
// Inline create row + edit-in-place rows. No separate /new or /$id pages.

import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { LangTextField } from "@/components/admin/LangTextField";

const TIERS = ["budget", "mainstream", "premium", "luxury"] as const;
type Tier = (typeof TIERS)[number] | null;

interface Brand {
  id: string;
  /** 10-lang map; server returns parsed object. */
  name: Record<string, string>;
  description: Record<string, string>;
  hero_img_url: string | null;
  tier: Tier;
  active: number;
  sort_order: number;
}

export const Route = createFileRoute("/admin/lens-brands")({
  component: AdminLensBrandsPage,
});

const inputCls =
  "h-8 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
const textareaCls =
  "w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function AdminLensBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Brand | null>(null);

  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState<Record<string, string>>({});
  const [newDesc, setNewDesc] = useState<Record<string, string>>({});
  const [newTier, setNewTier] = useState<Tier>("mainstream");
  const [newHeroImgUrl, setNewHeroImgUrl] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/lens-brands", {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { brands: Brand[] };
      setBrands(d.brands);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (b: Brand) => {
    setEditingId(b.id);
    setDraft({ ...b });
    setErr(null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!draft) return;
    setErr(null);
    try {
      const res = await fetch(`/api/admin/lens-brands/${draft.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          hero_img_url: draft.hero_img_url,
          tier: draft.tier,
          active: draft.active === 1,
          sort_order: draft.sort_order,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "保存失败");
        return;
      }
      await load();
      cancelEdit();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const archive = async (id: string) => {
    if (!confirm("停用此品牌？关联 SKU 不会被自动停用。")) return;
    await fetch(`/api/admin/lens-brands/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    load();
  };
  const restore = async (id: string) => {
    await fetch(`/api/admin/lens-brands/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    load();
  };
  const hardDelete = async (id: string) => {
    if (!confirm(`⚠ 硬删除品牌 ${id}？如果有关联 SKU，会因外键拒绝。`)) return;
    const res = await fetch(`/api/admin/lens-brands/${id}?hard=1`, {
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

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(newId.trim()))
      return setErr("ID 需是小写字母/数字/短横线");
    if (Object.keys(newName).length === 0)
      return setErr("至少填一个语言的品牌名");
    setCreateBusy(true);
    try {
      const res = await fetch("/api/admin/lens-brands", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId.trim(),
          name: newName,
          description: newDesc,
          tier: newTier,
          hero_img_url: newHeroImgUrl.trim() || null,
          active: true,
          sort_order: brands.length * 10,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "创建失败");
        setCreateBusy(false);
        return;
      }
      setCreating(false);
      setNewId("");
      setNewName({});
      setNewDesc({});
      setNewTier("mainstream");
      setNewHeroImgUrl("");
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">镜片品牌</h1>
          <p className="text-sm text-muted-foreground">
            小型字典表。用于 wizard 选片器分组。FK：lens_skus.brand_id
            引用此表。
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建品牌
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
          className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-soft"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                ID *
              </label>
              <input
                value={newId}
                onChange={(e) => setNewId(e.target.value.toLowerCase())}
                placeholder="hoya"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                档位
              </label>
              <select
                value={newTier ?? ""}
                onChange={(e) => setNewTier((e.target.value || null) as Tier)}
                className={inputCls}
              >
                <option value="">— 未指定 —</option>
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              品牌名 *（至少填一种语言）
            </label>
            <LangTextField
              value={newName}
              onChange={setNewName}
              placeholder="Hoya / 豪雅"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Logo
            </label>
            <ImageUpload
              value={newHeroImgUrl}
              onChange={setNewHeroImgUrl}
              prefix="brands"
              height={64}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              简介
            </label>
            <LangTextField
              value={newDesc}
              onChange={setNewDesc}
              multiline
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
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
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3 w-16">Logo</th>
              <th className="px-4 py-3">品牌名</th>
              <th className="px-4 py-3">档位</th>
              <th className="px-4 py-3">排序</th>
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
            ) : brands.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无品牌
                </td>
              </tr>
            ) : (
              brands.map((b) =>
                editingId === b.id && draft ? (
                  <Fragment key={b.id}>
                    <tr className="bg-secondary/20">
                      <td className="px-4 py-2 font-mono text-xs">{b.id}</td>
                      <td className="px-4 py-2">
                        <ImageUpload
                          value={draft.hero_img_url ?? ""}
                          onChange={(url) =>
                            setDraft({ ...draft, hero_img_url: url || null })
                          }
                          prefix="brands"
                          height={40}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <LangTextField
                          value={draft.name}
                          onChange={(next) =>
                            setDraft({ ...draft, name: next })
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={draft.tier ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              tier: (e.target.value || null) as Tier,
                            })
                          }
                          className={inputCls}
                        >
                          <option value="">—</option>
                          {TIERS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
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
                          onClick={cancelEdit}
                          className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-xs hover:bg-secondary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-secondary/20">
                      <td colSpan={7} className="px-4 pb-3 pt-0">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          简介
                        </label>
                        <LangTextField
                          value={draft.description}
                          onChange={(next) =>
                            setDraft({ ...draft, description: next })
                          }
                          multiline
                          rows={3}
                        />
                      </td>
                    </tr>
                  </Fragment>
                ) : (
                  <tr key={b.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                    <td className="px-4 py-3">
                      {b.hero_img_url ? (
                        <img
                          src={b.hero_img_url}
                          alt={b.name.en ?? b.id}
                          className="h-8 w-8 rounded object-contain bg-secondary/40"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-xs font-bold text-muted-foreground"
                          title="无 logo — 占位为首字母"
                        >
                          {(b.name.en ?? b.name.zh ?? b.id)
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.name.en ?? "—"}</div>
                      {b.name.zh && b.name.zh !== b.name.en && (
                        <div className="text-xs text-muted-foreground">
                          {b.name.zh}
                        </div>
                      )}
                      {Object.keys(b.name).length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          + {Object.keys(b.name).length - 2} 其它语言
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.tier ? (
                        <span className="rounded bg-secondary px-2 py-0.5">
                          {b.tier}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {b.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      {b.active === 1 ? (
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
                        onClick={() => startEdit(b)}
                        className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="编辑"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {b.active === 1 ? (
                        <button
                          onClick={() => archive(b.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="停用"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => restore(b.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="重新启用"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => hardDelete(b.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-destructive hover:bg-destructive/10"
                        title="硬删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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

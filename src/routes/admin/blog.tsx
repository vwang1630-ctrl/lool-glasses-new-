// /admin/blog — 博客文章 CRUD。
// 单页面：顶部新建表单（点开/折叠），下方列表，每行可展开内联编辑。
// 三个核心字段：标题（10 语 JSON）、内容（10 语 JSON）、封面图（R2 URL）。

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

interface BlogPost {
  id: string;
  slug: string;
  cover_image_url: string;
  title: Record<string, string>;
  content: Record<string, string>;
  published_at: number;
  sort_order: number;
  active: number;
  created_at: number;
  updated_at: number;
}

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogPage,
});

const inputCls =
  "h-8 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function toDateInput(ms: number): string {
  // YYYY-MM-DD in local time
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInput(s: string): number {
  // Treat as local midnight
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return Date.now();
  return new Date(y, m - 1, d).getTime();
}

function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlogPost | null>(null);

  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState<Record<string, string>>({});
  const [newContent, setNewContent] = useState<Record<string, string>>({});
  const [newCover, setNewCover] = useState("");
  const [newPubDate, setNewPubDate] = useState(toDateInput(Date.now()));
  const [createBusy, setCreateBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/blog", { credentials: "same-origin" });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { posts: BlogPost[] };
      setPosts(d.posts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setDraft({ ...p });
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
      const res = await fetch(`/api/admin/blog/${draft.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: draft.slug,
          title: draft.title,
          content: draft.content,
          cover_image_url: draft.cover_image_url,
          published_at: draft.published_at,
          sort_order: draft.sort_order,
          active: draft.active === 1,
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
    if (!confirm("停用此文章？停用后不在前台 /blog 显示。")) return;
    await fetch(`/api/admin/blog/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    load();
  };
  const restore = async (id: string) => {
    await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    load();
  };
  const hardDelete = async (id: string) => {
    if (!confirm("⚠ 硬删除文章？不可恢复。")) return;
    await fetch(`/api/admin/blog/${id}?hard=1`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    load();
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(newSlug.trim()))
      return setErr("Slug 需是小写字母/数字/短横线，2–81 位");
    if (!newCover) return setErr("请上传封面图");
    if (Object.keys(newTitle).length === 0)
      return setErr("至少填一个语言的标题");
    if (Object.keys(newContent).length === 0)
      return setErr("至少填一个语言的正文");
    setCreateBusy(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSlug.trim(),
          title: newTitle,
          content: newContent,
          cover_image_url: newCover,
          published_at: fromDateInput(newPubDate),
          sort_order: 0,
          active: true,
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
      setNewSlug("");
      setNewTitle({});
      setNewContent({});
      setNewCover("");
      setNewPubDate(toDateInput(Date.now()));
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">博客文章</h1>
          <p className="text-sm text-muted-foreground">
            前台 <span className="font-mono">/$lang/blog</span>{" "}
            页面的内容来源。标题与正文按 10 语言维护，未填的语言前台回退到
            en（再回退到 zh）。
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建文章
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
                Slug *（URL 片段，唯一）
              </label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                placeholder="aurora-tortoise-launch"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                发布日期
              </label>
              <input
                type="date"
                value={newPubDate}
                onChange={(e) => setNewPubDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              封面图 *（建议 4:3，约 1200×900）
            </label>
            <ImageUpload
              value={newCover}
              onChange={setNewCover}
              prefix="blog"
              height={96}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              标题 *（至少填一种语言）
            </label>
            <LangTextField
              value={newTitle}
              onChange={setNewTitle}
              placeholder="Aurora Tortoise: 18g of Everyday Lightness"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              内容 *（至少填一种语言）
            </label>
            <LangTextField
              value={newContent}
              onChange={setNewContent}
              multiline
              rows={6}
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
              onClick={() => {
                setCreating(false);
                setErr(null);
              }}
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
              <th className="px-4 py-3 w-20">封面</th>
              <th className="px-4 py-3">Slug / 标题</th>
              <th className="px-4 py-3 w-28">发布日期</th>
              <th className="px-4 py-3 w-20">排序</th>
              <th className="px-4 py-3 w-20">状态</th>
              <th className="px-4 py-3 w-36 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无文章 — 点右上角「新建文章」开始。
                  <br />
                  <span className="text-xs">
                    当列表为空时，前台 /blog
                    页继续显示代码内置的静态示例文章；写入第一篇后切换为后台数据。
                  </span>
                </td>
              </tr>
            ) : (
              posts.map((p) =>
                editingId === p.id && draft ? (
                  <Fragment key={p.id}>
                    <tr className="bg-secondary/20">
                      <td className="px-4 py-2" colSpan={6}>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs text-muted-foreground">
                                Slug
                              </label>
                              <input
                                value={draft.slug}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    slug: e.target.value.toLowerCase(),
                                  })
                                }
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-muted-foreground">
                                发布日期
                              </label>
                              <input
                                type="date"
                                value={toDateInput(draft.published_at)}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    published_at: fromDateInput(e.target.value),
                                  })
                                }
                                className={inputCls}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              封面图
                            </label>
                            <ImageUpload
                              value={draft.cover_image_url}
                              onChange={(url) =>
                                setDraft({ ...draft, cover_image_url: url })
                              }
                              prefix="blog"
                              height={80}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              标题（10 语）
                            </label>
                            <LangTextField
                              value={draft.title}
                              onChange={(next) =>
                                setDraft({ ...draft, title: next })
                              }
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              内容（10 语）
                            </label>
                            <LangTextField
                              value={draft.content}
                              onChange={(next) =>
                                setDraft({ ...draft, content: next })
                              }
                              multiline
                              rows={6}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs text-muted-foreground">
                                排序（小的在前；0 即按发布日期）
                              </label>
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
                            </div>
                            <div className="flex items-end">
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
                                启用（前台显示）
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={saveEdit}
                              className="inline-flex h-8 items-center gap-1 rounded bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                            >
                              <Save className="h-3 w-3" />
                              保存
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex h-8 items-center gap-1 rounded border border-border px-3 text-xs hover:bg-secondary"
                            >
                              <X className="h-3 w-3" />
                              取消
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ) : (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <img
                        src={p.cover_image_url}
                        alt={p.title.en ?? p.slug}
                        className="h-10 w-14 rounded object-cover bg-secondary/40"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {p.title.en ?? p.title.zh ?? "—"}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {p.slug}
                      </div>
                      {Object.keys(p.title).length > 1 && (
                        <div className="text-[10px] text-muted-foreground">
                          {Object.keys(p.title).length} 种语言
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                      {toDateInput(p.published_at)}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {p.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      {p.active === 1 ? (
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
                        onClick={() => startEdit(p)}
                        className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="编辑"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {p.active === 1 ? (
                        <button
                          onClick={() => archive(p.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="停用"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => restore(p.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="重新启用"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => hardDelete(p.id)}
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

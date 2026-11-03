// /admin/products — frame product list. MVP: paginated table with quick
// status badges, thumbnail (first color image), and edit/archive actions.
// Detail / create form lives at /admin/products/new and /admin/products/$id
// (separate files — out of MVP scope here).

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { parseLangJson } from "@/lib/lang";
import { Pagination } from "@/components/admin/Pagination";

const parseStringArray = (json: string | null): string[] => {
  if (!json) return [];
  try {
    const a = JSON.parse(json);
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

interface ProductColor {
  product_id: string;
  color_id: string;
  hex: string;
  label_json: string | null;
  images_json: string | null;
  tryon_image_url: string | null;
  sort_order: number;
}

interface ProductRow {
  id: string;
  slug: string;
  product_kind: "eyeglasses" | "sunglasses" | "accessory";
  categories_json: string | null;
  shape: string | null;
  material: string | null;
  styles_json: string | null;
  price_cents: number;
  original_price_cents: number | null;
  currency: string;
  rating: number;
  review_count: number;
  is_new: number;
  bestseller: number;
  archived_at: number | null;
  created_at: number;
  updated_at: number;
  name_json: string | null;
  intro_json: string | null;
  colors: ProductColor[];
}

interface ListResponse {
  products: ProductRow[];
  total: number;
  limit: number;
  offset: number;
}

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsPage,
});

function firstImageOf(p: ProductRow): string | null {
  const c = p.colors[0];
  if (!c?.images_json) return null;
  try {
    const arr = JSON.parse(c.images_json);
    if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
  } catch {
    return null;
  }
  return null;
}

function pickName(p: ProductRow): string {
  const m = parseLangJson(p.name_json);
  return m.en ?? m.zh ?? p.slug;
}

function pickIntro(p: ProductRow): string | null {
  const m = parseLangJson(p.intro_json);
  return m.en ?? m.zh ?? null;
}

function AdminProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const reload = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    if (showArchived) params.set("archived", "1");
    if (kindFilter) params.set("kind", kindFilter);
    if (q.trim()) params.set("q", q.trim());
    try {
      const r = await fetch(`/api/admin/products?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d: ListResponse = await r.json();
      setItems(d.products ?? []);
      setTotal(d.total ?? 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived, kindFilter, page]);

  // Reset page when any filter changes.
  useEffect(() => {
    setPage(0);
  }, [showArchived, kindFilter, q]);

  // Debounce q → server reload.
  useEffect(() => {
    const t = setTimeout(() => {
      reload();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Server already filtered by q — no client-side filter needed.
  const filtered = items;

  const onArchiveToggle = async (p: ProductRow) => {
    setBusyId(p.id);
    try {
      if (p.archived_at) {
        await fetch(`/api/admin/products/${p.id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: false }),
        });
      } else {
        await fetch(`/api/admin/products/${p.id}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
      }
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">镜框商品</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {total} 个商品{showArchived ? "（含已归档）" : "（仅在售）"}
          </p>
        </div>
        <Link
          to={"/admin/products/new" as never}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
        >
          <Plus className="h-4 w-4" /> 新建商品
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索 slug / 名称 / id"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        >
          <option value="">全部类型</option>
          <option value="eyeglasses">眼镜</option>
          <option value="sunglasses">墨镜</option>
          <option value="accessory">配件</option>
        </select>
        <label className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border text-sm text-foreground cursor-pointer hover:bg-secondary transition-smooth">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4"
          />
          含已归档
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {q ? "没有匹配的商品。" : "还没有商品。点击右上角"}
              {!q && (
                <Link
                  to={"/admin/products/new" as never}
                  className="text-primary hover:underline"
                >
                  新建商品
                </Link>
              )}
              {!q && "开始添加。"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground/80 w-20">
                    图
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                    商品
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                    类型
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                    形状
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                    材质
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground/80">
                    风格
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground/80">
                    价格
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground/80">
                    颜色
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground/80">
                    状态
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground/80 w-28">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const img = firstImageOf(p);
                  const intro = pickIntro(p);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-smooth"
                    >
                      <td className="px-4 py-3">
                        {img ? (
                          <img
                            src={img}
                            alt={pickName(p)}
                            className="h-12 w-12 rounded-md bg-secondary object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-secondary" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={"/admin/products/$id" as never}
                          params={{ id: p.id } as never}
                          className="font-medium text-foreground hover:text-primary transition-smooth"
                        >
                          {pickName(p)}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {p.slug}
                        </p>
                        {intro && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                            {intro}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {p.product_kind === "eyeglasses"
                          ? "眼镜"
                          : p.product_kind === "sunglasses"
                            ? "墨镜"
                            : "配件"}
                        {parseStringArray(p.categories_json).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {parseStringArray(p.categories_json).join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground/80 capitalize">
                        {p.shape ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground/80 capitalize">
                        {p.material ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground/80 capitalize">
                        {parseStringArray(p.styles_json).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <div className="font-semibold text-foreground">
                          ${(p.price_cents / 100).toFixed(2)}
                        </div>
                        {p.original_price_cents &&
                          p.original_price_cents > p.price_cents && (
                            <div className="text-xs text-muted-foreground line-through">
                              ${(p.original_price_cents / 100).toFixed(2)}
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-0.5">
                          {p.colors.slice(0, 5).map((c) => (
                            <span
                              key={c.color_id}
                              title={c.color_id}
                              className="h-4 w-4 rounded-full border border-border"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          {p.colors.length > 5 && (
                            <span className="text-[10px] text-muted-foreground ml-1">
                              +{p.colors.length - 5}
                            </span>
                          )}
                          {p.colors.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {p.archived_at ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                              已归档
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-medium">
                              在售
                            </span>
                          )}
                          <div className="flex gap-1 mt-0.5">
                            {p.is_new === 1 && (
                              <span className="text-[10px] px-1.5 rounded bg-primary/10 text-primary">
                                NEW
                              </span>
                            )}
                            {p.bestseller === 1 && (
                              <span className="text-[10px] px-1.5 rounded bg-amber-500/10 text-amber-600">
                                热销
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={"/admin/products/$id" as never}
                            params={{ id: p.id } as never}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-smooth"
                            title="编辑"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => onArchiveToggle(p)}
                            disabled={busyId === p.id}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive transition-smooth disabled:opacity-50"
                            title={p.archived_at ? "恢复在售" : "归档"}
                          >
                            {busyId === p.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : p.archived_at ? (
                              <ArchiveRestore className="h-4 w-4" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

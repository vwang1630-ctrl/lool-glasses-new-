// /admin/lens-skus — Lens SKU list. Filter by brand and prescription_type.
// Edit / create live at /admin/lens-skus/$id and /admin/lens-skus/new.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Pencil, Search } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

interface LensSku {
  id: string;
  brand_id: string;
  brand_line: string | null;
  prescription_type: string;
  base_function:
    | "clear"
    | "blue"
    | "photo"
    | "driving"
    | "tinted"
    | "polarized";
  function_variant: "base" | "blueUpgrade" | null;
  progressive_design: "standard" | "short" | null;
  progressive_view_area: "standard" | "broader" | null;
  lens_colors_json: string | null;
  refractive_index: number;
  retail_cents: number;
  /** Raw JSON string from D1; parsed on render. Object keyed by supplier_id. */
  supplier_costs_json: string | null;
  display_name_json: string | null;
  hero_img_url: string | null;
  recommended: number;
  active: number;
  sort_order: number;
}

interface LensBrand {
  id: string;
  name: Record<string, string>;
  active: number;
}

const PRESCRIPTION_TYPES: { value: string; label: string }[] = [
  { value: "", label: "全部用法" },
  { value: "single-vision", label: "单光 (近视)" },
  { value: "progressive", label: "渐进多焦" },
  { value: "reading", label: "老花 (阅读)" },
  { value: "non-prescription", label: "无度数" },
];

const PT_LABEL: Record<string, string> = {
  "single-vision": "单光近视",
  progressive: "渐进多焦",
  reading: "老花阅读",
  "non-prescription": "无度数",
};

const BASE_FN_LABEL: Record<string, string> = {
  clear: "透明",
  blue: "防蓝光",
  photo: "变色",
  driving: "驾驶",
  tinted: "染色",
  polarized: "偏光",
};

const VIEW_AREA_LABEL: Record<string, string> = {
  standard: "标准视野",
  broader: "更宽视野",
};

const VARIANT_LABEL: Record<string, string> = {
  base: "变色",
  blueUpgrade: "变色+防蓝光",
};

export const Route = createFileRoute("/admin/lens-skus/")({
  component: AdminLensSkusPage,
});

function AdminLensSkusPage() {
  const [skus, setSkus] = useState<LensSku[]>([]);
  const [brands, setBrands] = useState<LensBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [ptFilter, setPtFilter] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (brandFilter) params.set("brand_id", brandFilter);
      if (ptFilter) params.set("prescription_type", ptFilter);
      if (search.trim()) params.set("q", search.trim());
      const [skusRes, brandsRes] = await Promise.all([
        fetch(`/api/admin/lens-skus?${params}`, { credentials: "same-origin" }),
        fetch(`/api/admin/lens-brands`, { credentials: "same-origin" }),
      ]);
      if (!skusRes.ok || !brandsRes.ok) throw new Error("load_failed");
      const sd = (await skusRes.json()) as { skus: LensSku[]; total: number };
      const bd = (await brandsRes.json()) as { brands: LensBrand[] };
      setSkus(sd.skus);
      setTotal(sd.total ?? 0);
      setBrands(bd.brands);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [brandFilter, ptFilter, page]);

  // Reset page when any filter changes.
  useEffect(() => {
    setPage(0);
  }, [brandFilter, ptFilter, search]);

  // Debounce search input → server reload.
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const brandLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of brands) m.set(b.id, b.name.en || b.name.zh || b.id);
    return m;
  }, [brands]);

  // Server filtered by q already; only honor showInactive client-side toggle.
  const filtered = useMemo(
    () => skus.filter((s) => showInactive || s.active === 1),
    [skus, showInactive],
  );

  const tintColorsOf = (s: LensSku): string[] => {
    if (!s.lens_colors_json) return [];
    try {
      const arr = JSON.parse(s.lens_colors_json);
      if (!Array.isArray(arr)) return [];
      return arr
        .map((x) =>
          x && typeof x === "object" && typeof x.id === "string" ? x.id : null,
        )
        .filter((x): x is string => !!x);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">镜片 SKU</h1>
          <p className="text-sm text-muted-foreground">
            按品牌、用途、折射率组合的销售层 SKU。Wizard 选片器读这张表。
          </p>
        </div>
        <Link
          to="/admin/lens-skus/new"
          className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          新建 SKU
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="搜索 ID / 名称 / 供应商 SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          <option value="">全部品牌</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name.en ?? b.name.zh ?? b.id}
            </option>
          ))}
        </select>
        <select
          value={ptFilter}
          onChange={(e) => setPtFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          {PRESCRIPTION_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
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
          {loading ? "加载中…" : `共 ${total} 条（本页 ${filtered.length}）`}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">SKU ID</th>
              <th className="px-4 py-3">品牌 / 系列</th>
              <th className="px-4 py-3">用途</th>
              <th className="px-4 py-3">基片 / 档位</th>
              <th className="px-4 py-3">折射率</th>
              <th className="px-4 py-3">染色色号</th>
              <th className="px-4 py-3 text-right">售价</th>
              <th className="px-4 py-3 text-right">最低成本(¥)</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-12 text-center text-muted-foreground"
                >
                  没有符合条件的 SKU
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {brandLabel.get(s.brand_id) ?? s.brand_id}
                    </div>
                    {s.brand_line && (
                      <div className="text-xs text-muted-foreground">
                        {s.brand_line}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-mono text-[11px]">
                      {s.prescription_type}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {PT_LABEL[s.prescription_type] ?? ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">
                        {BASE_FN_LABEL[s.base_function] ?? s.base_function}
                      </span>
                      {s.function_variant && (
                        <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] text-purple-700">
                          {VARIANT_LABEL[s.function_variant] ??
                            s.function_variant}
                        </span>
                      )}
                      {s.progressive_view_area && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] ${s.progressive_view_area === "broader" ? "bg-amber-500/15 text-amber-700" : "bg-blue-500/15 text-blue-700"}`}
                        >
                          {VIEW_AREA_LABEL[s.progressive_view_area] ??
                            s.progressive_view_area}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    {s.refractive_index.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(() => {
                      const cs = tintColorsOf(s);
                      if (cs.length === 0)
                        return <span className="text-muted-foreground">—</span>;
                      const visible = cs.slice(0, 3);
                      const hidden = cs.length - visible.length;
                      return (
                        <div className="flex flex-wrap items-center gap-1">
                          {visible.map((c) => (
                            <span
                              key={c}
                              className="rounded bg-secondary px-1.5 py-0.5 text-[10px]"
                              title={c}
                            >
                              {c}
                            </span>
                          ))}
                          {hidden > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{hidden}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${(s.retail_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-muted-foreground">
                    {(() => {
                      if (!s.supplier_costs_json) return "—";
                      try {
                        const obj = JSON.parse(s.supplier_costs_json) as Record<
                          string,
                          { cost_cny_cents: number | null }
                        >;
                        const costs = Object.values(obj)
                          .map((e) => e.cost_cny_cents)
                          .filter((c): c is number => typeof c === "number");
                        if (costs.length === 0) return "—";
                        const min = Math.min(...costs);
                        const n = Object.keys(obj).length;
                        return `¥${(min / 100).toFixed(2)}${n > 1 ? ` · ${n}家` : ""}`;
                      } catch {
                        return "—";
                      }
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {s.active === 1 ? (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        启用
                      </span>
                    ) : (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        停用
                      </span>
                    )}
                    {s.recommended === 1 && (
                      <span className="ml-1 rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        推荐
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/lens-skus/$id"
                      params={{ id: s.id }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

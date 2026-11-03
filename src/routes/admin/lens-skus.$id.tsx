// /admin/lens-skus/$id — full edit form for a lens SKU.
// Loads via GET /api/admin/lens-skus/:id, saves via PATCH (partial update),
// soft archive (active=0) only — SKUs may be referenced by historical
// orders so we never expose hard delete from the UI.

import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  Archive,
  ArchiveRestore,
  Plus,
  Trash2,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { LangTextField } from "@/components/admin/LangTextField";
import {
  SupplierCostsEditor,
  type SupplierCostEntry,
} from "@/components/admin/SupplierCostsEditor";

const PRESCRIPTION_TYPES = [
  "single-vision",
  "progressive",
  "reading",
  "non-prescription",
] as const;

const BASE_FUNCTIONS = [
  "clear",
  "blue",
  "photo",
  "driving",
  "tinted",
  "polarized",
] as const;
type BaseFunction = (typeof BASE_FUNCTIONS)[number];

const FUNCTION_VARIANTS = ["base", "blueUpgrade"] as const;
type FunctionVariant = (typeof FUNCTION_VARIANTS)[number];

const PROGRESSIVE_DESIGNS = ["standard", "short"] as const;
type ProgressiveDesign = (typeof PROGRESSIVE_DESIGNS)[number];
const PROGRESSIVE_VIEW_AREAS = ["standard", "broader"] as const;
type ProgressiveViewArea = (typeof PROGRESSIVE_VIEW_AREAS)[number];

const INDEXES = [1.56, 1.61, 1.67, 1.74];

// Bilingual labels for select options — rendered as `enum-code · 中文`.
const PRESCRIPTION_TYPE_LABEL: Record<string, string> = {
  "single-vision": "单光近视",
  progressive: "渐进多焦",
  reading: "老花阅读",
  "non-prescription": "无度数",
};
const BASE_FUNCTION_LABEL: Record<string, string> = {
  clear: "透明",
  blue: "防蓝光",
  photo: "变色",
  driving: "驾驶",
  tinted: "染色",
  polarized: "偏光",
};
const FUNCTION_VARIANT_LABEL: Record<string, string> = {
  base: "变色基础",
  blueUpgrade: "变色+防蓝光升级",
};
const PROGRESSIVE_DESIGN_LABEL: Record<string, string> = {
  standard: "标准走廊",
  short: "短走廊",
};
const PROGRESSIVE_VIEW_AREA_LABEL: Record<string, string> = {
  standard: "标准视野",
  broader: "更宽视野",
};

interface LensColorOption {
  id: string;
  label: Record<string, string>;
  hex: string;
}

interface Sku {
  id: string;
  brand_id: string;
  brand_line: string | null;
  prescription_type: (typeof PRESCRIPTION_TYPES)[number];
  base_function: BaseFunction;
  function_variant: FunctionVariant | null;
  progressive_design: ProgressiveDesign | null;
  progressive_view_area: ProgressiveViewArea | null;
  lens_colors_json: string | null;
  refractive_index: number;
  retail_cents: number;
  /** Per-supplier cost map. Server returns parsed object (NOT raw JSON string). */
  supplier_costs: Record<string, SupplierCostEntry>;
  /** 10-lang map; server returns parsed object. */
  display_name: Record<string, string>;
  description: Record<string, string>;
  hero_img_url: string | null;
  recommended: number;
  sph_min: number | null;
  sph_max: number | null;
  cyl_min: number | null;
  cyl_max: number | null;
  add_min: number | null;
  add_max: number | null;
  active: number;
  sort_order: number;
}

interface LensBrand {
  id: string;
  name: Record<string, string>;
  active: number;
}

interface Supplier {
  id: string;
  name_en: string | null;
  name_zh: string | null;
  active: number;
}

export const Route = createFileRoute("/admin/lens-skus/$id")({
  component: AdminLensSkuEditPage,
});

function AdminLensSkuEditPage() {
  const { id } = useParams({ from: "/admin/lens-skus/$id" });
  const navigate = useNavigate();
  const [sku, setSku] = useState<Sku | null>(null);
  const [brands, setBrands] = useState<LensBrand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lensColors, setLensColors] = useState<LensColorOption[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/lens-skus/${id}`, { credentials: "same-origin" }).then(
        (r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))),
      ),
      fetch("/api/admin/lens-brands", { credentials: "same-origin" }).then(
        (r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))),
      ),
      // ?inactive=1 returns the full dictionary including stopped suppliers,
      // so the editor can identify which entries to hide vs show as "deleted".
      // Filter to lens-side kinds (lens + both) — `suppliers` is the merged
      // table post-0065 and holds frame / lens / both / accessory / payment /
      // logistics in one place.
      fetch("/api/admin/suppliers?inactive=1", {
        credentials: "same-origin",
      }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      ),
    ])
      .then(
        ([s, b, sup]: [
          { sku: Sku },
          { brands: LensBrand[] },
          { suppliers: (Supplier & { kind?: string })[] },
        ]) => {
          // Server returns supplier_costs / display_name / description as parsed
          // objects (or omits them when no key has been entered yet).
          const normalised: Sku = {
            ...s.sku,
            supplier_costs: s.sku.supplier_costs ?? {},
            display_name: s.sku.display_name ?? {},
            description: s.sku.description ?? {},
          };
          setSku(normalised);
          setBrands(b.brands);
          setSuppliers(
            sup.suppliers.filter((x) => x.kind === "lens" || x.kind === "both"),
          );
          if (s.sku.lens_colors_json) {
            try {
              const arr = JSON.parse(s.sku.lens_colors_json);
              if (Array.isArray(arr)) {
                setLensColors(
                  arr.map((c: Partial<LensColorOption>) => ({
                    id: typeof c.id === "string" ? c.id : "",
                    label:
                      c.label && typeof c.label === "object" ? c.label : {},
                    hex: typeof c.hex === "string" ? c.hex : "#000000",
                  })),
                );
              }
            } catch {
              // Malformed legacy JSON — surface as empty editor; admin can rebuild.
            }
          }
        },
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : String(err)),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const update = <K extends keyof Sku>(key: K, value: Sku[K]) => {
    if (!sku) return;
    setSku({ ...sku, [key]: value });
  };

  const save = async () => {
    if (!sku) return;
    setSaving(true);
    setError(null);
    try {
      // Drop blank rows (no id) before sending. Empty list → null (no picker).
      const trimmedColors = lensColors
        .map((c) => ({ ...c, id: c.id.trim() }))
        .filter((c) => c.id !== "");
      const lensColorsPayload = trimmedColors.length > 0 ? trimmedColors : null;
      const body = {
        brand_id: sku.brand_id,
        brand_line: sku.brand_line,
        prescription_type: sku.prescription_type,
        base_function: sku.base_function,
        function_variant: sku.function_variant,
        progressive_design: sku.progressive_design,
        progressive_view_area: sku.progressive_view_area,
        lens_colors: lensColorsPayload,
        refractive_index: sku.refractive_index,
        retail_cents: sku.retail_cents,
        supplier_costs: sku.supplier_costs,
        display_name: sku.display_name,
        description: sku.description,
        hero_img_url: sku.hero_img_url,
        recommended: sku.recommended === 1,
        sph_min: sku.sph_min,
        sph_max: sku.sph_max,
        cyl_min: sku.cyl_min,
        cyl_max: sku.cyl_max,
        add_min: sku.add_min,
        add_max: sku.add_max,
        active: sku.active === 1,
        sort_order: sku.sort_order,
      };
      const res = await fetch(`/api/admin/lens-skus/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setError(data.message ?? data.error ?? "保存失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    if (!confirm("确定停用此 SKU？停用后用户面 wizard 不再展示。")) return;
    const res = await fetch(`/api/admin/lens-skus/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) {
      navigate({ to: "/admin/lens-skus" });
    }
  };

  const restore = async () => {
    if (!sku) return;
    update("active", 1 as Sku["active"]);
    await fetch(`/api/admin/lens-skus/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!sku) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        加载失败：{error ?? "SKU 不存在"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/lens-skus"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              编辑镜片 SKU
            </h1>
            <p className="font-mono text-xs text-muted-foreground">{sku.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sku.active === 1 ? (
            <button
              onClick={archive}
              className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-secondary"
            >
              <Archive className="h-4 w-4" />
              停用
            </button>
          ) : (
            <button
              onClick={restore}
              className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-secondary"
            >
              <ArchiveRestore className="h-4 w-4" />
              重新启用
            </button>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            保存
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Section title="基本信息">
        <Row>
          <Field label="品牌">
            <select
              value={sku.brand_id}
              onChange={(e) => update("brand_id", e.target.value)}
              className={inputCls}
            >
              {brands.map((b) => {
                const en = b.name.en;
                const zh = b.name.zh;
                const both =
                  en && zh && en !== zh ? `${en} · ${zh}` : (en ?? zh ?? b.id);
                return (
                  <option key={b.id} value={b.id}>
                    {both}
                  </option>
                );
              })}
            </select>
          </Field>
          <Field label="品牌系列">
            <input
              value={sku.brand_line ?? ""}
              onChange={(e) => update("brand_line", e.target.value || null)}
              className={inputCls}
            />
          </Field>
        </Row>
        <Row>
          <Field label="用途 (prescription_type)">
            <select
              value={sku.prescription_type}
              onChange={(e) =>
                update(
                  "prescription_type",
                  e.target.value as Sku["prescription_type"],
                )
              }
              className={inputCls}
            >
              {PRESCRIPTION_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p} · {PRESCRIPTION_TYPE_LABEL[p] ?? p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="基片功能 (base_function)" hint="wizard step 3 单选互斥">
            <select
              value={sku.base_function}
              onChange={(e) => {
                const next = e.target.value as BaseFunction;
                update("base_function", next);
                // Auto-clear function_variant when leaving 'photo'.
                if (next !== "photo" && sku.function_variant !== null) {
                  update("function_variant", null);
                }
              }}
              className={inputCls}
            >
              {BASE_FUNCTIONS.map((bf) => (
                <option key={bf} value={bf}>
                  {bf} · {BASE_FUNCTION_LABEL[bf] ?? bf}
                </option>
              ))}
            </select>
          </Field>
        </Row>
        <Row>
          <Field
            label="功能变种 (function_variant)"
            hint="仅 base_function=photo 时填；base=变色 / blueUpgrade=变色+防蓝光升级"
          >
            <select
              value={sku.function_variant ?? ""}
              onChange={(e) =>
                update(
                  "function_variant",
                  (e.target.value === ""
                    ? null
                    : (e.target
                        .value as FunctionVariant)) as Sku["function_variant"],
                )
              }
              disabled={sku.base_function !== "photo"}
              className={inputCls}
            >
              <option value="">— 无 —</option>
              {FUNCTION_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  {v} · {FUNCTION_VARIANT_LABEL[v] ?? v}
                </option>
              ))}
            </select>
          </Field>
        </Row>
        <Row>
          <Field
            label="渐进设计 (progressive_design)"
            hint="仅 prescription_type=progressive 时填；标准 / 短走廊"
          >
            <select
              value={sku.progressive_design ?? ""}
              onChange={(e) =>
                update(
                  "progressive_design",
                  (e.target.value === ""
                    ? null
                    : (e.target
                        .value as ProgressiveDesign)) as Sku["progressive_design"],
                )
              }
              disabled={sku.prescription_type !== "progressive"}
              className={inputCls}
            >
              <option value="">— 无 —</option>
              {PROGRESSIVE_DESIGNS.map((t) => (
                <option key={t} value={t}>
                  {t} · {PROGRESSIVE_DESIGN_LABEL[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="渐进视野 (progressive_view_area)"
            hint="仅 prescription_type=progressive 时填；标准 / 更宽"
          >
            <select
              value={sku.progressive_view_area ?? ""}
              onChange={(e) =>
                update(
                  "progressive_view_area",
                  (e.target.value === ""
                    ? null
                    : (e.target
                        .value as ProgressiveViewArea)) as Sku["progressive_view_area"],
                )
              }
              disabled={sku.prescription_type !== "progressive"}
              className={inputCls}
            >
              <option value="">— 无 —</option>
              {PROGRESSIVE_VIEW_AREAS.map((t) => (
                <option key={t} value={t}>
                  {t} · {PROGRESSIVE_VIEW_AREA_LABEL[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="折射率">
            <select
              value={sku.refractive_index}
              onChange={(e) =>
                update("refractive_index", Number(e.target.value))
              }
              className={inputCls}
            >
              {INDEXES.map((i) => (
                <option key={i} value={i}>
                  {i.toFixed(2)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="标记">
            <div className="flex h-9 items-center gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={sku.recommended === 1}
                  onChange={(e) =>
                    update(
                      "recommended",
                      (e.target.checked ? 1 : 0) as Sku["recommended"],
                    )
                  }
                />
                推荐
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={sku.active === 1}
                  onChange={(e) =>
                    update(
                      "active",
                      (e.target.checked ? 1 : 0) as Sku["active"],
                    )
                  }
                />
                启用
              </label>
            </div>
          </Field>
        </Row>
        <Row>
          <Field label="排序 sort_order">
            <input
              type="number"
              value={sku.sort_order}
              onChange={(e) =>
                update("sort_order", Number(e.target.value) || 0)
              }
              className={inputCls}
            />
          </Field>
        </Row>
      </Section>

      <Section
        title="染色色号 (lens_colors)"
        hint="仅 base_function=tinted 或 photo 时填；wizard 会出色号 picker。留空则不出 picker。"
      >
        <LensColorsEditor value={lensColors} onChange={setLensColors} />
      </Section>

      <Section title="售价">
        <Row>
          <Field
            label="售价 (USD)"
            hint="例如 49 或 49.99；底层存储为分 (cents)"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={(sku.retail_cents / 100).toString()}
              onChange={(e) => {
                const v = e.target.value;
                const n = v === "" ? 0 : Math.round(parseFloat(v) * 100);
                update("retail_cents", Math.max(0, Number.isFinite(n) ? n : 0));
              }}
              className={inputCls}
            />
          </Field>
        </Row>
      </Section>

      <Section
        title="供应商成本（CNY）"
        hint="一个 SKU 可挂多家供应商；下单后默认按 cost 最低 active 行履约（暂未实装），admin 后续可手动覆盖"
      >
        <SupplierCostsEditor
          value={sku.supplier_costs}
          suppliers={suppliers}
          onChange={(next) => update("supplier_costs", next)}
        />
      </Section>

      <Section
        title="多语言展示文案（覆盖默认拼接）"
        hint="EN 一栏推荐填上；其它语言留空时前端 fallback 到 EN"
      >
        <Field label="名称" wide>
          <LangTextField
            value={sku.display_name}
            onChange={(next) => update("display_name", next)}
          />
        </Field>
        <Field label="描述" wide>
          <LangTextField
            value={sku.description}
            onChange={(next) => update("description", next)}
            multiline
            rows={3}
          />
        </Field>
        <Row>
          <Field label="hero 图" wide>
            <ImageUpload
              value={sku.hero_img_url ?? ""}
              onChange={(url) => update("hero_img_url", url || null)}
              prefix="lenses"
              height={80}
            />
          </Field>
        </Row>
      </Section>

      <Section title="度数限制（wizard gray-out 用）">
        <Row>
          <Field label="SPH min">
            <input
              type="number"
              step="0.25"
              value={sku.sph_min ?? ""}
              onChange={(e) =>
                update(
                  "sph_min",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={inputCls}
            />
          </Field>
          <Field label="SPH max">
            <input
              type="number"
              step="0.25"
              value={sku.sph_max ?? ""}
              onChange={(e) =>
                update(
                  "sph_max",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={inputCls}
            />
          </Field>
        </Row>
        <Row>
          <Field label="CYL min">
            <input
              type="number"
              step="0.25"
              value={sku.cyl_min ?? ""}
              onChange={(e) =>
                update(
                  "cyl_min",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={inputCls}
            />
          </Field>
          <Field label="CYL max">
            <input
              type="number"
              step="0.25"
              value={sku.cyl_max ?? ""}
              onChange={(e) =>
                update(
                  "cyl_max",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={inputCls}
            />
          </Field>
        </Row>
        <Row>
          <Field label="ADD min（老花/渐进）">
            <input
              type="number"
              step="0.25"
              value={sku.add_min ?? ""}
              onChange={(e) =>
                update(
                  "add_min",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={inputCls}
            />
          </Field>
          <Field label="ADD max">
            <input
              type="number"
              step="0.25"
              value={sku.add_max ?? ""}
              onChange={(e) =>
                update(
                  "add_max",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={inputCls}
            />
          </Field>
        </Row>
      </Section>
    </div>
  );
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {hint && <p className="mb-4 text-xs text-muted-foreground">{hint}</p>}
      {!hint && <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  );
}

function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function LensColorsEditor({
  value,
  onChange,
}: {
  value: LensColorOption[];
  onChange: (next: LensColorOption[]) => void;
}) {
  const addRow = () =>
    onChange([...value, { id: "", label: {}, hex: "#000000" }]);
  const removeRow = (i: number) =>
    onChange(value.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<LensColorOption>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          未配置颜色 — 该 SKU 不出色号 picker。点下方按钮添加。
        </p>
      )}
      {value.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-12 items-start gap-2 rounded border border-border bg-secondary/20 p-2"
        >
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">
              id
            </label>
            <input
              value={row.id}
              onChange={(e) => updateRow(i, { id: e.target.value })}
              placeholder="gray"
              className="h-8 w-full rounded border border-input bg-background px-2 font-mono text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="col-span-7">
            <label className="mb-1 block text-xs text-muted-foreground">
              名称（10 语言，至少填一个）
            </label>
            <LangTextField
              value={row.label}
              onChange={(next) => updateRow(i, { label: next })}
              placeholder="灰色 / Gray"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">
              色卡 hex
            </label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(row.hex) ? row.hex : "#000000"}
                onChange={(e) => updateRow(i, { hex: e.target.value })}
                className="h-8 w-9 cursor-pointer rounded border border-input bg-background"
              />
              <input
                value={row.hex}
                onChange={(e) => updateRow(i, { hex: e.target.value })}
                placeholder="#5a5a5a"
                className="h-8 w-full rounded border border-input bg-background px-2 font-mono text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
          <div className="col-span-1 flex h-full items-end justify-end pb-1">
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-destructive hover:bg-destructive/10"
              title="删除此色号"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex h-8 items-center gap-1.5 rounded-md border border-dashed border-border px-3 text-xs hover:bg-secondary"
      >
        <Plus className="h-3.5 w-3.5" />
        添加颜色
      </button>
    </div>
  );
}

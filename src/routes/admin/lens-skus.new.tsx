// /admin/lens-skus/new — create a new lens SKU.
// Required: id, brand_id, prescription_type, base_function, refractive_index, retail_cents.
// progressive_design + progressive_view_area required iff prescription_type='progressive'.
// function_variant required iff base_function='photo'.
// After create, redirect to /admin/lens-skus/$id for full editing.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";

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

interface LensBrand {
  id: string;
  name: Record<string, string>;
  active: number;
}

export const Route = createFileRoute("/admin/lens-skus/new")({
  component: AdminLensSkuNewPage,
});

function AdminLensSkuNewPage() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<LensBrand[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [id, setId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brandLine, setBrandLine] = useState("");
  const [prescriptionType, setPrescriptionType] =
    useState<(typeof PRESCRIPTION_TYPES)[number]>("single-vision");
  const [baseFunction, setBaseFunction] = useState<BaseFunction>("clear");
  const [functionVariant, setFunctionVariant] = useState<FunctionVariant | "">(
    "",
  );
  const [progressiveDesign, setProgressiveDesign] = useState<
    ProgressiveDesign | ""
  >("");
  const [progressiveViewArea, setProgressiveViewArea] = useState<
    ProgressiveViewArea | ""
  >("");
  const [refIndex, setRefIndex] = useState<number>(1.56);
  const [retailUsd, setRetailUsd] = useState("");

  useEffect(() => {
    fetch("/api/admin/lens-brands", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { brands: LensBrand[] }) =>
        setBrands(d.brands.filter((b) => b.active === 1)),
      )
      .catch(() => setError("加载品牌列表失败"));
  }, []);

  // Progressive sub-dimensions apply only to progressive SKUs.
  useEffect(() => {
    if (prescriptionType !== "progressive") {
      setProgressiveDesign("");
      setProgressiveViewArea("");
    } else {
      setProgressiveDesign((d) => (d === "" ? "standard" : d));
      setProgressiveViewArea((a) => (a === "" ? "standard" : a));
    }
  }, [prescriptionType]);

  // function_variant applies only to base_function='photo'.
  useEffect(() => {
    if (baseFunction !== "photo") setFunctionVariant("");
    else setFunctionVariant((v) => (v === "" ? "base" : v));
  }, [baseFunction]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = id.trim();
    if (!trimmedId) return setError("ID 必填");
    if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(trimmedId))
      return setError("ID 必须是小写字母/数字/短横线");
    if (!brandId) return setError("请选择品牌");
    if (
      prescriptionType === "progressive" &&
      (!progressiveDesign || !progressiveViewArea)
    )
      return setError("渐进必须选设计与视野");
    if (baseFunction === "photo" && !functionVariant)
      return setError("变色镜片必须选 function_variant (base / blueUpgrade)");
    const retail = Number(retailUsd);
    if (!Number.isFinite(retail) || retail < 0)
      return setError("售价必须是非负数（USD）");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/lens-skus", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trimmedId,
          brand_id: brandId,
          brand_line: brandLine.trim() || null,
          prescription_type: prescriptionType,
          base_function: baseFunction,
          function_variant: functionVariant || null,
          progressive_design: progressiveDesign || null,
          progressive_view_area: progressiveViewArea || null,
          refractive_index: refIndex,
          retail_cents: Math.round(retail * 100),
          active: true,
          sort_order: 0,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "duplicate") setError("此 ID 已存在");
        else if (data.error === "fk_violation")
          setError("品牌 ID 不存在或外键违反");
        else setError(data.message ?? data.error ?? "创建失败");
        setSubmitting(false);
        return;
      }
      const { id: newId } = (await res.json()) as { id: string };
      navigate({ to: "/admin/lens-skus/$id", params: { id: newId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/lens-skus"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            新建镜片 SKU
          </h1>
          <p className="text-sm text-muted-foreground">
            填写最少必填项，创建后跳到详情继续配置。
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-soft"
      >
        <Field
          label="SKU ID *"
          hint="例如 std-pg-photochromic-1.67-premium，唯一标识"
        >
          <input
            value={id}
            onChange={(e) => setId(e.target.value.toLowerCase())}
            placeholder="std-pg-photochromic-1.67-premium"
            className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="品牌 *">
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="">— 选择品牌 —</option>
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
          <Field label="品牌系列" hint="例如 Signature / GEN8（可选）">
            <input
              value={brandLine}
              onChange={(e) => setBrandLine(e.target.value)}
              placeholder="（可选）"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="用途 (step 1) *">
            <select
              value={prescriptionType}
              onChange={(e) =>
                setPrescriptionType(
                  e.target.value as (typeof PRESCRIPTION_TYPES)[number],
                )
              }
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
            >
              {PRESCRIPTION_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p} · {PRESCRIPTION_TYPE_LABEL[p] ?? p}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="基片功能 (step 3) *"
            hint="5 选 1 互斥；偏光/吸收型防蓝光是基片层属性"
          >
            <select
              value={baseFunction}
              onChange={(e) => setBaseFunction(e.target.value as BaseFunction)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
            >
              {BASE_FUNCTIONS.map((bf) => (
                <option key={bf} value={bf}>
                  {bf} · {BASE_FUNCTION_LABEL[bf] ?? bf}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="功能变种 (function_variant)"
            hint="仅 base_function=photo；base=变色 / blueUpgrade=变色+防蓝光升级"
          >
            <select
              value={functionVariant}
              onChange={(e) =>
                setFunctionVariant(e.target.value as FunctionVariant | "")
              }
              disabled={baseFunction !== "photo"}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring disabled:opacity-50"
            >
              <option value="">— 不适用 —</option>
              {FUNCTION_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  {v} · {FUNCTION_VARIANT_LABEL[v] ?? v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="折射率 (step 5) *">
            <select
              value={refIndex}
              onChange={(e) => setRefIndex(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
            >
              {INDEXES.map((i) => (
                <option key={i} value={i}>
                  {i.toFixed(2)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="渐进设计 (progressive_design)"
            hint="仅 prescription_type=progressive"
          >
            <select
              value={progressiveDesign}
              onChange={(e) =>
                setProgressiveDesign(e.target.value as ProgressiveDesign | "")
              }
              disabled={prescriptionType !== "progressive"}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring disabled:opacity-50"
            >
              <option value="">— 不适用 —</option>
              {PROGRESSIVE_DESIGNS.map((t) => (
                <option key={t} value={t}>
                  {t} · {PROGRESSIVE_DESIGN_LABEL[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="渐进视野 (progressive_view_area)"
            hint="仅 prescription_type=progressive"
          >
            <select
              value={progressiveViewArea}
              onChange={(e) =>
                setProgressiveViewArea(
                  e.target.value as ProgressiveViewArea | "",
                )
              }
              disabled={prescriptionType !== "progressive"}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring disabled:opacity-50"
            >
              <option value="">— 不适用 —</option>
              {PROGRESSIVE_VIEW_AREAS.map((t) => (
                <option key={t} value={t}>
                  {t} · {PROGRESSIVE_VIEW_AREA_LABEL[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="售价 (USD) *" hint="供应商成本在创建后到详情页编辑">
          <input
            type="number"
            step="0.01"
            min="0"
            value={retailUsd}
            onChange={(e) => setRetailUsd(e.target.value)}
            placeholder="49.00"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </Field>

        <p className="text-xs text-muted-foreground">
          创建后到详情页可配置：染色色号 (lens_colors)、供应商成本、display
          name、度数范围等。
        </p>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Link
            to="/admin/lens-skus"
            className="h-9 rounded-md px-4 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            创建并继续编辑
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

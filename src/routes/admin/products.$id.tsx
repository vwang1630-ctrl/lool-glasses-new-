// /admin/products/$id — frame product edit form. Sections by field group:
// basic / shape / size / lens-compat / pricing / multilingual / supply-chain.
// PATCHes the row; refetches on save success. Color CRUD lives below in a
// separate section that hits /api/admin/products/:id/colors.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Plus,
  Archive,
  ArchiveRestore,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { MultiSelect } from "@/components/admin/MultiSelect";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ColorImagesEditor } from "@/components/admin/ColorImagesEditor";
import { SupplierCostsEditor } from "@/components/admin/SupplierCostsEditor";
import { useFormDraft, formatDraftTime } from "@/lib/use-form-draft";

const GENDER_OPTIONS = [
  { value: "men", label: "men (男)" },
  { value: "women", label: "women (女)" },
  { value: "unisex", label: "unisex (中性)" },
  { value: "kids", label: "kids (儿童)" },
];

const FACE_SHAPE_OPTIONS = [
  { value: "round", label: "round (圆脸)" },
  { value: "oval", label: "oval (椭圆脸)" },
  { value: "square", label: "square (方脸)" },
  { value: "heart", label: "heart (心形脸)" },
  { value: "diamond", label: "diamond (菱形脸)" },
  { value: "oblong", label: "oblong (长脸)" },
  { value: "triangle", label: "triangle (三角脸)" },
];

const parseStringArray = (json: string | null): string[] => {
  if (!json) return [];
  try {
    const a = JSON.parse(json);
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

const LANGS = [
  "en",
  "zh",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ar",
  "vi",
  "th",
  "id",
  "ms",
] as const;
type Lang = (typeof LANGS)[number];

const SHAPES: { value: string; label: string }[] = [
  { value: "Square", label: "Square (方形)" },
  { value: "Rectangle", label: "Rectangle (长方形)" },
  { value: "Cat eye", label: "Cat eye (猫眼)" },
  { value: "Butterfly", label: "Butterfly (蝴蝶形)" },
  { value: "Round", label: "Round (圆形)" },
  { value: "Geometric", label: "Geometric (几何形)" },
  { value: "Aviator", label: "Aviator (飞行员形)" },
  { value: "Browline", label: "Browline (眉框)" },
  { value: "Oval", label: "Oval (椭圆形)" },
];
const RIM_TYPES: { value: string; label: string }[] = [
  { value: "Full Rim", label: "Full Rim (全框)" },
  { value: "Semi Rim", label: "Semi Rim (半框)" },
  { value: "Rimless", label: "Rimless (无框)" },
];
const SIZE_CLASSES: { value: string; label: string }[] = [
  { value: "Narrow", label: "Narrow (窄)" },
  { value: "Medium", label: "Medium (中等)" },
  { value: "Wide", label: "Wide (宽)" },
  { value: "Extra Wide", label: "Extra Wide (加宽)" },
  { value: "Custom", label: "Custom (自定义)" },
];
const THICKNESSES: { value: string; label: string }[] = [
  { value: "thin frame", label: "thin frame (薄框)" },
  { value: "normal frame", label: "normal frame (普通)" },
  { value: "thick frame", label: "thick frame (厚框)" },
];
const BRIDGE_FITS: { value: string; label: string }[] = [
  { value: "Universal Fit", label: "Universal Fit (通用)" },
  { value: "Low Fit", label: "Low Fit (低鼻梁)" },
  { value: "Asian Fit", label: "Asian Fit (亚洲版)" },
];
const STYLES: { value: string; label: string }[] = [
  { value: "minimal", label: "minimal (极简)" },
  { value: "business", label: "business (商务)" },
  { value: "character", label: "character (个性)" },
  { value: "classic", label: "classic (经典)" },
];

// Second-level categories — maps to the storefront sub-nav. A frame may
// belong to multiple buckets (e.g. presbyopia AND myopia). Sunglasses /
// accessory generally don't need a category (kind alone is enough).
const CATEGORIES: { value: string; label: string }[] = [
  { value: "presbyopia", label: "presbyopia (老花)" },
  { value: "myopia", label: "myopia (近视)" },
];

const MATERIALS: { value: string; label: string }[] = [
  { value: "acetate", label: "acetate (醋酸纤维)" },
  { value: "metal", label: "metal (金属)" },
  { value: "titanium", label: "titanium (钛)" },
  { value: "TR90", label: "TR90 (记忆塑料)" },
  { value: "stainless-steel", label: "stainless-steel (不锈钢)" },
  { value: "beta-titanium", label: "beta-titanium (β-钛)" },
  { value: "plastic", label: "plastic (塑料)" },
  { value: "wood", label: "wood (木)" },
  { value: "mixed", label: "mixed (混合材质)" },
];

// Surface finish — paired with Material in the editor. Localised so the
// English term (matte/satin/brushed) is recognisable next to the 中文 hint.
const FINISHES: { value: string; label: string }[] = [
  { value: "matte", label: "哑光 (Matte)" },
  { value: "gloss", label: "亮面 (Gloss)" },
  { value: "satin", label: "缎面 (Satin) — 半哑光" },
  { value: "brushed", label: "拉丝 (Brushed) — 金属拉丝纹理" },
];

const ERROR_LABELS: Record<string, string> = {
  invalid_json: "请求体不是合法 JSON",
  invalid_slug:
    "网址标识 slug 格式不合法（必须以小写字母或数字开头，只能包含小写字母、数字、短横线，长度 2–80）",
  slug_taken: "网址标识 slug 已被其他商品占用",
  nothing_to_update: "没有任何字段可以更新",
  not_found: "商品不存在",
  invalid_shape: "镜框形状（shape）值不合法",
  invalid_rim_type: "边框类型（rim_type）值不合法",
  invalid_size_class: "尺寸（size_class）值不合法",
  invalid_thickness: "镜框厚度（thickness）值不合法",
  invalid_material: "镜框材质（material）值不合法",
  invalid_finish:
    "表面工艺（finish）值不合法（必须是 matte/gloss/satin/brushed 之一）",
  invalid_bridge_fit: "鼻梁适配（bridge_fit）值不合法",
  invalid_categories: "类目（categories）值不合法",
  invalid_styles: "风格（styles）值不合法",
  invalid_product_kind: "商品类型（product_kind）值不合法",
  invalid_currency: "币种（currency）值不合法",
};

function formatSaveError(
  d: { error?: string; message?: string },
  status: number | string,
): string {
  if (d.error && ERROR_LABELS[d.error]) return ERROR_LABELS[d.error];
  if (d.message) return d.message;
  if (d.error) return d.error;
  return String(status);
}

interface ProductFull {
  id: string;
  slug: string;
  product_kind: "eyeglasses" | "sunglasses" | "accessory";
  categories_json: string | null;
  shape: string | null;
  rim_type: string | null;
  size_class: string | null;
  thickness: string | null;
  material: string | null;
  finish: string | null;
  bridge_fit: string | null;
  spring_hinge: number;
  adjustable_nosepads: number;
  lens_width_mm: number | null;
  bridge_mm: number | null;
  temple_mm: number | null;
  frame_width_mm: number | null;
  lens_height_mm: number | null;
  weight_g: number | null;
  styles_json: string | null;
  is_kids: number;
  genders_json: string | null;
  face_shape_tags_json: string | null;
  supports_reader: number;
  supports_single_vision: number;
  supports_non_prescription: number;
  supports_progressive: number;
  supports_transitions: number;
  is_frame_only_eligible: number;
  price_cents: number;
  original_price_cents: number | null;
  currency: string;
  rating: number;
  review_count: number;
  is_new: number;
  bestseller: number;
  name_json: string | null;
  intro_json: string | null;
  description_json: string | null;
  highlights_json: string | null;
  /** Product-level storefront card hero (3/4, clean bg). */
  card_image_url: string | null;
  /** Product-level storefront card hover-flip (lifestyle, model-worn). */
  card_hover_image_url: string | null;
  /** Per-frame-supplier cost map. Server returns parsed object. */
  supplier_costs: Record<
    string,
    { cost_cny_cents: number | null; supplier_sku_code: string | null }
  >;
  archived_at: number | null;
  colors: ColorRow[];
}

interface FrameSupplier {
  id: string;
  name_zh: string | null;
  name_en: string | null;
  active: number;
}

interface ColorRow {
  id: string;
  product_id: string;
  color_id: string;
  hex: string;
  sort_order: number;
  tryon_image_url: string | null;
  images_json: string | null;
  views_json: string | null;
  label_json: string | null;
}

export const Route = createFileRoute("/admin/products/$id")({
  component: ProductEditPage,
});

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return v as T;
  } catch {
    return fallback;
  }
}

function ProductEditPage() {
  const { id } = Route.useParams();
  const [p, setP] = useState<ProductFull | null>(null);
  const [frameSuppliers, setFrameSuppliers] = useState<FrameSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [draftRestoredAt, setDraftRestoredAt] = useState<number | null>(null);
  const draft = useFormDraft<ProductFull>(`product:${id}`);

  const reload = async (options?: { useDraft?: boolean }) => {
    const useDraft = options?.useDraft !== false;
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/products/${id}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d: { product: ProductFull } = await r.json();
      const normalised: ProductFull = {
        ...d.product,
        supplier_costs: d.product.supplier_costs ?? {},
      };
      const cached = useDraft ? draft.read() : null;
      if (cached && cached.data.id === d.product.id) {
        // Drafts saved before migration 0036 lack supplier_costs; backfill
        // with the freshly-fetched value so the editor doesn't crash on
        // Object.entries(undefined).
        setP({
          ...cached.data,
          supplier_costs:
            cached.data.supplier_costs ?? normalised.supplier_costs,
        });
        setDraftRestoredAt(cached.ts);
      } else {
        setP(normalised);
        setDraftRestoredAt(null);
      }
    } catch (e) {
      setError(`加载失败：${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // ?inactive=1 returns stopped suppliers too — the editor uses that to
    // hide entries pointing to a globally-deactivated supplier. Filter to
    // frame-side kinds (frame + both); the merged `suppliers` table holds
    // lens / frame / both / accessory / payment / logistics in one place.
    fetch("/api/admin/suppliers?inactive=1", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (d: { suppliers?: (FrameSupplier & { kind?: string })[] } | null) => {
          if (!d?.suppliers) return;
          setFrameSuppliers(
            d.suppliers.filter((s) => s.kind === "frame" || s.kind === "both"),
          );
        },
      )
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (patch: Partial<ProductFull>) => {
    if (!p) return;
    const next = { ...p, ...patch };
    setP(next);
    draft.save(next);
  };

  const discardDraft = () => {
    draft.clear();
    setDraftRestoredAt(null);
    void reload({ useDraft: false });
  };

  const onSave = async () => {
    if (!p) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    // The API expects JSON fields as objects/arrays under the bare key (no
    // _json suffix); server stringifies and stores into `<key>_json`. Parse
    // our stringified state before sending.
    const parseJson = (s: string | null): unknown => {
      if (!s) return null;
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    };
    const body: Record<string, unknown> = {
      slug: p.slug,
      product_kind: p.product_kind,
      categories: parseJson(p.categories_json),
      shape: p.shape,
      rim_type: p.rim_type,
      size_class: p.size_class,
      thickness: p.thickness,
      material: p.material,
      finish: p.finish,
      bridge_fit: p.bridge_fit,
      spring_hinge: !!p.spring_hinge,
      adjustable_nosepads: !!p.adjustable_nosepads,
      lens_width_mm: p.lens_width_mm,
      bridge_mm: p.bridge_mm,
      temple_mm: p.temple_mm,
      frame_width_mm: p.frame_width_mm,
      lens_height_mm: p.lens_height_mm,
      weight_g: p.weight_g,
      styles: parseJson(p.styles_json),
      is_kids: !!p.is_kids,
      genders: parseJson(p.genders_json),
      face_shape_tags: parseJson(p.face_shape_tags_json),
      supports_reader: !!p.supports_reader,
      supports_single_vision: !!p.supports_single_vision,
      supports_non_prescription: !!p.supports_non_prescription,
      supports_progressive: !!p.supports_progressive,
      supports_transitions: !!p.supports_transitions,
      is_frame_only_eligible: !!p.is_frame_only_eligible,
      price_cents: p.price_cents,
      original_price_cents: p.original_price_cents,
      currency: p.currency,
      rating: p.rating,
      review_count: p.review_count,
      is_new: !!p.is_new,
      bestseller: !!p.bestseller,
      name: parseJson(p.name_json),
      intro: parseJson(p.intro_json),
      description: parseJson(p.description_json),
      highlights: parseJson(p.highlights_json),
      card_image_url: p.card_image_url,
      card_hover_image_url: p.card_hover_image_url,
      supplier_costs: p.supplier_costs,
    };
    try {
      const r = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setError(`保存失败：${formatSaveError(d, r.status)}`);
        return;
      }
      setInfo("已保存");
      draft.clear();
      setDraftRestoredAt(null);
      await reload({ useDraft: false });
    } catch (e) {
      setError(`保存失败：${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !p) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth"
            aria-label="返回"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">编辑商品</h1>
            <p className="mt-0.5 text-sm text-muted-foreground font-mono">
              {p.id} · {p.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {p.archived_at ? (
            <button
              onClick={async () => {
                await fetch(`/api/admin/products/${id}`, {
                  method: "PATCH",
                  credentials: "same-origin",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ archived: false }),
                });
                reload();
              }}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border text-sm hover:bg-secondary"
            >
              <ArchiveRestore className="h-4 w-4" />
              恢复
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!confirm("归档此商品？归档后用户面 PLP 不再展示。")) return;
                await fetch(`/api/admin/products/${id}`, {
                  method: "DELETE",
                  credentials: "same-origin",
                });
                reload();
              }}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border text-sm hover:bg-secondary"
            >
              <Archive className="h-4 w-4" />
              归档
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            保存
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2.5 text-sm">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-md bg-emerald-500/10 text-emerald-600 px-4 py-2.5 text-sm">
          {info}
        </div>
      )}
      {draftRestoredAt && (
        <div className="rounded-md bg-amber-500/10 text-amber-700 px-4 py-2.5 text-sm flex items-center justify-between gap-3">
          <span>
            已恢复未保存的草稿（{formatDraftTime(draftRestoredAt)}
            ）。点击右侧"保存"提交，或丢弃草稿。
          </span>
          <button
            onClick={discardDraft}
            className="shrink-0 rounded-md border border-amber-600/30 px-2.5 py-1 text-xs hover:bg-amber-500/20"
          >
            丢弃草稿
          </button>
        </div>
      )}

      <Section title="基本信息">
        <Grid>
          <Field label="slug (网址标识)">
            <input
              value={p.slug}
              onChange={(e) => update({ slug: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="类型">
            <select
              value={p.product_kind}
              onChange={(e) =>
                update({
                  product_kind: e.target.value as ProductFull["product_kind"],
                })
              }
              className={inputCls}
            >
              <option value="eyeglasses">眼镜</option>
              <option value="sunglasses">墨镜</option>
              <option value="accessory">配件</option>
            </select>
          </Field>
          <Field label="Category (类目，可多选)">
            <MultiSelect
              value={parseStringArray(p.categories_json)}
              options={CATEGORIES}
              onChange={(next) =>
                update({
                  categories_json: next.length ? JSON.stringify(next) : null,
                })
              }
              placeholder="— 未指定 —"
            />
          </Field>
          <Field label="风格（可多选）">
            <MultiSelect
              value={parseStringArray(p.styles_json)}
              options={STYLES}
              onChange={(next) =>
                update({
                  styles_json: next.length ? JSON.stringify(next) : null,
                })
              }
              placeholder="— 未指定 —"
            />
          </Field>
          <CheckRow
            checked={!!p.is_kids}
            onChange={(v) => update({ is_kids: v ? 1 : 0 })}
            label="is_kids（儿童款）"
          />
          <CheckRow
            checked={!!p.is_new}
            onChange={(v) => update({ is_new: v ? 1 : 0 })}
            label="is_new（新品）"
          />
          <CheckRow
            checked={!!p.bestseller}
            onChange={(v) => update({ bestseller: v ? 1 : 0 })}
            label="bestseller（畅销）"
          />
        </Grid>
      </Section>

      <Section title="商品卡片图（首页 / 列表 ProductCard）">
        <p className="text-xs text-muted-foreground -mt-1 mb-3">
          产品级图片，跟具体颜色无关。每个产品上线必填。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              card_image_url（卡片正面，干净 3/4 hero）*
            </label>
            <ImageUpload
              value={p.card_image_url ?? ""}
              onChange={(url) => update({ card_image_url: url || null })}
              prefix="product"
              height={120}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              card_hover_image_url（鼠标 hover 翻转：lifestyle / 模特实拍）*
            </label>
            <ImageUpload
              value={p.card_hover_image_url ?? ""}
              onChange={(url) => update({ card_hover_image_url: url || null })}
              prefix="product"
              height={120}
            />
          </div>
        </div>
      </Section>

      <Section title="框型属性">
        <Grid>
          <Field label="Shape (镜框形状)">
            <select
              value={p.shape ?? ""}
              onChange={(e) => update({ shape: e.target.value || null })}
              className={inputCls}
            >
              <option value="">—</option>
              {SHAPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rim type (边框类型)">
            <select
              value={p.rim_type ?? ""}
              onChange={(e) => update({ rim_type: e.target.value || null })}
              className={inputCls}
            >
              <option value="">—</option>
              {RIM_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Size class (尺码)">
            <select
              value={p.size_class ?? ""}
              onChange={(e) => update({ size_class: e.target.value || null })}
              className={inputCls}
            >
              <option value="">—</option>
              {SIZE_CLASSES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Thickness (镜框厚度)">
            <select
              value={p.thickness ?? ""}
              onChange={(e) => update({ thickness: e.target.value || null })}
              className={inputCls}
            >
              <option value="">—</option>
              {THICKNESSES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Material (材质)">
            <select
              value={p.material ?? ""}
              onChange={(e) => update({ material: e.target.value || null })}
              className={inputCls}
            >
              <option value="">— 未指定 —</option>
              {MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Finish (表面工艺)">
            <select
              value={p.finish ?? ""}
              onChange={(e) => update({ finish: e.target.value || null })}
              className={inputCls}
            >
              <option value="">— 未指定 —</option>
              {FINISHES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bridge fit (鼻梁贴合)">
            <select
              value={p.bridge_fit ?? ""}
              onChange={(e) => update({ bridge_fit: e.target.value || null })}
              className={inputCls}
            >
              <option value="">—</option>
              {BRIDGE_FITS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <CheckRow
            checked={!!p.spring_hinge}
            onChange={(v) => update({ spring_hinge: v ? 1 : 0 })}
            label="弹簧铰链"
          />
          <CheckRow
            checked={!!p.adjustable_nosepads}
            onChange={(v) => update({ adjustable_nosepads: v ? 1 : 0 })}
            label="可调鼻托"
          />
        </Grid>
      </Section>

      <Section title="物理尺寸 (mm)">
        <Grid>
          <NumberField
            label="Lens width (镜片宽 mm)"
            value={p.lens_width_mm}
            onChange={(v) => update({ lens_width_mm: v })}
          />
          <NumberField
            label="Bridge (鼻梁宽 mm)"
            value={p.bridge_mm}
            onChange={(v) => update({ bridge_mm: v })}
          />
          <NumberField
            label="Temple (镜腿长 mm)"
            value={p.temple_mm}
            onChange={(v) => update({ temple_mm: v })}
          />
          <NumberField
            label="Frame width (整框宽 mm)"
            value={p.frame_width_mm}
            onChange={(v) => update({ frame_width_mm: v })}
          />
          <NumberField
            label="Lens height (镜片高 mm)"
            value={p.lens_height_mm}
            step="0.1"
            onChange={(v) => update({ lens_height_mm: v })}
          />
          <NumberField
            label="Weight (重量 g)"
            value={p.weight_g}
            step="0.1"
            onChange={(v) => update({ weight_g: v })}
          />
        </Grid>
      </Section>

      <Section title="镜片兼容">
        <Grid>
          <CheckRow
            checked={!!p.supports_reader}
            onChange={(v) => update({ supports_reader: v ? 1 : 0 })}
            label="老花/阅读"
          />
          <CheckRow
            checked={!!p.supports_single_vision}
            onChange={(v) => update({ supports_single_vision: v ? 1 : 0 })}
            label="单光（近视/远视）"
          />
          <CheckRow
            checked={!!p.supports_non_prescription}
            onChange={(v) => update({ supports_non_prescription: v ? 1 : 0 })}
            label="平光/无度数"
          />
          <CheckRow
            checked={!!p.supports_progressive}
            onChange={(v) => update({ supports_progressive: v ? 1 : 0 })}
            label="渐进多焦"
          />
          <CheckRow
            checked={!!p.supports_transitions}
            onChange={(v) => update({ supports_transitions: v ? 1 : 0 })}
            label="变色 (transitions)"
          />
          <CheckRow
            checked={!!p.is_frame_only_eligible}
            onChange={(v) => update({ is_frame_only_eligible: v ? 1 : 0 })}
            label="允许仅框架订单"
          />
        </Grid>
      </Section>

      <Section title="价格 (USD)">
        <Grid>
          <Field
            label="Price (售价 $)"
            hint="例如 26 或 25.99；底层存储为分 (cents)"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={
                p.price_cents == null ? "" : (p.price_cents / 100).toString()
              }
              onChange={(e) => {
                const v = e.target.value;
                const n = v === "" ? 0 : Math.round(parseFloat(v) * 100);
                update({ price_cents: Number.isFinite(n) ? n : 0 });
              }}
              className={inputCls}
            />
          </Field>
          <Field
            label="Original price (原价 $)"
            hint="划线价，可选；显示促销折扣"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={
                p.original_price_cents == null
                  ? ""
                  : (p.original_price_cents / 100).toString()
              }
              onChange={(e) => {
                const v = e.target.value;
                const n = v === "" ? null : Math.round(parseFloat(v) * 100);
                update({
                  original_price_cents: Number.isFinite(n as number) ? n : null,
                });
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Currency (币种)">
            <input
              value={p.currency}
              onChange={(e) => update({ currency: e.target.value })}
              className={inputCls}
            />
          </Field>
          <NumberField
            label="Rating (评分 0-5)"
            value={p.rating}
            step="0.1"
            onChange={(v) => update({ rating: v ?? 0 })}
          />
          <NumberField
            label="Review count (评价数)"
            value={p.review_count}
            onChange={(v) => update({ review_count: v ?? 0 })}
          />
        </Grid>
      </Section>

      <Section title="多语言文案（10 lang JSON）">
        <div className="space-y-4">
          <LangJsonEditor
            label="商品名 name_json"
            value={p.name_json}
            onChange={(v) => update({ name_json: v })}
          />
          <LangJsonEditor
            label="副标题 intro_json"
            value={p.intro_json}
            onChange={(v) => update({ intro_json: v })}
            multiline
          />
          <LangJsonEditor
            label="长描述 description_json"
            value={p.description_json}
            onChange={(v) => update({ description_json: v })}
            multiline
          />
          <LangJsonArrayEditor
            label="高亮 bullet highlights_json"
            value={p.highlights_json}
            onChange={(v) => update({ highlights_json: v })}
          />
        </div>
      </Section>

      <Section title="受众">
        <Grid>
          <Field label="性别 / 受众">
            <MultiSelect
              value={parseStringArray(p.genders_json)}
              options={GENDER_OPTIONS}
              onChange={(arr) =>
                update({
                  genders_json: arr.length > 0 ? JSON.stringify(arr) : null,
                })
              }
              placeholder="— 未指定 —"
            />
          </Field>
          <Field label="适合脸型">
            <MultiSelect
              value={parseStringArray(p.face_shape_tags_json)}
              options={FACE_SHAPE_OPTIONS}
              onChange={(arr) =>
                update({
                  face_shape_tags_json:
                    arr.length > 0 ? JSON.stringify(arr) : null,
                })
              }
              placeholder="— 未指定 —"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="供应商成本（CNY）">
        <p className="-mt-3 mb-2 text-xs text-muted-foreground">
          一个镜框可挂多家工厂；下单后默认按 cost 最低 active
          行履约（暂未实装），admin 后续可手动覆盖。
        </p>
        <SupplierCostsEditor
          value={p.supplier_costs}
          suppliers={frameSuppliers}
          onChange={(next) => update({ supplier_costs: next })}
        />
      </Section>

      <ColorsSection productId={p.id} colors={p.colors} onChanged={reload} />

      <div className="flex justify-end gap-3 pt-4">
        <Link
          to="/admin/products"
          className="h-10 px-4 inline-flex items-center rounded-md border border-border text-sm hover:bg-secondary transition-smooth"
        >
          取消
        </Link>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft disabled:opacity-60"
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
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-foreground/80 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") onChange(null);
          else {
            const n = Number(v);
            onChange(Number.isFinite(n) ? n : null);
          }
        }}
        className={inputCls}
      />
    </Field>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border cursor-pointer hover:bg-secondary transition-smooth">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

// ---------- Multilingual JSON editor (string per lang) ----------

function LangJsonEditor({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  multiline?: boolean;
}) {
  const map = safeParseJson<Record<string, string>>(value, {});
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const setLang = (lang: Lang, text: string) => {
    const next = { ...map };
    if (text === "") delete next[lang];
    else next[lang] = text;
    onChange(Object.keys(next).length > 0 ? JSON.stringify(next) : null);
  };
  return (
    <Field label={label}>
      <div className="rounded-md border border-input bg-background">
        <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-secondary/30">
          {LANGS.map((l) => {
            const filled = !!map[l]?.length;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                className={
                  "px-2 py-1 rounded text-xs uppercase tracking-wider " +
                  (activeLang === l
                    ? "bg-primary text-primary-foreground"
                    : filled
                      ? "bg-card text-foreground hover:bg-secondary"
                      : "text-muted-foreground hover:bg-secondary")
                }
              >
                {l}
                {filled && activeLang !== l && (
                  <span className="ml-0.5 text-[8px]">●</span>
                )}
              </button>
            );
          })}
        </div>
        {multiline ? (
          <textarea
            value={map[activeLang] ?? ""}
            onChange={(e) => setLang(activeLang, e.target.value)}
            rows={4}
            className="w-full p-3 bg-transparent text-sm outline-none resize-y"
          />
        ) : (
          <input
            value={map[activeLang] ?? ""}
            onChange={(e) => setLang(activeLang, e.target.value)}
            className="w-full h-10 px-3 bg-transparent text-sm outline-none"
          />
        )}
      </div>
    </Field>
  );
}

// ---------- Multilingual JSON editor (string[] per lang) ----------

function LangJsonArrayEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const map = safeParseJson<Record<string, string[]>>(value, {});
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const setItems = (lang: Lang, items: string[]) => {
    const next = { ...map };
    if (items.length === 0) delete next[lang];
    else next[lang] = items;
    onChange(Object.keys(next).length > 0 ? JSON.stringify(next) : null);
  };
  const items = map[activeLang] ?? [];
  return (
    <Field label={label}>
      <div className="rounded-md border border-input bg-background">
        <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-secondary/30">
          {LANGS.map((l) => {
            const filled = (map[l]?.length ?? 0) > 0;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                className={
                  "px-2 py-1 rounded text-xs uppercase tracking-wider " +
                  (activeLang === l
                    ? "bg-primary text-primary-foreground"
                    : filled
                      ? "bg-card text-foreground hover:bg-secondary"
                      : "text-muted-foreground hover:bg-secondary")
                }
              >
                {l}
                {filled && activeLang !== l && (
                  <span className="ml-0.5 text-[8px]">●</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="p-3 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  setItems(activeLang, next);
                }}
                className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setItems(
                    activeLang,
                    items.filter((_, j) => j !== i),
                  )
                }
                className="p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems(activeLang, [...items, ""])}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> 添加 bullet
          </button>
        </div>
      </div>
    </Field>
  );
}

// ---------- Colors section (separate POST/DELETE endpoints) ----------

function ColorsSection({
  productId,
  colors,
  onChanged,
}: {
  productId: string;
  colors: ColorRow[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onRemove = async (color_id: string) => {
    if (!window.confirm(`删除颜色 ${color_id}?`)) return;
    setBusy(true);
    try {
      await fetch(
        `/api/admin/products/${productId}/colors?color_id=${encodeURIComponent(color_id)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  // Reorder by re-assigning sort_order to each color's new index. First call
  // for a product may PATCH all rows to normalize; subsequent adjacent swaps
  // only touch the two affected rows. Robust against pre-existing ties or
  // gaps in sort_order (e.g. 0,10,20 vs 0,1,2).
  const reorder = async (fromIdx: number, toIdx: number) => {
    if (busy || fromIdx === toIdx) return;
    if (fromIdx < 0 || fromIdx >= colors.length) return;
    if (toIdx < 0 || toIdx >= colors.length) return;
    const next = colors.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setBusy(true);
    try {
      await Promise.all(
        next.map((c, newIdx) => {
          if (c.sort_order === newIdx) return null;
          return fetch(
            `/api/admin/products/${productId}/colors?color_id=${encodeURIComponent(c.color_id)}`,
            {
              method: "PATCH",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sort_order: newIdx }),
            },
          );
        }),
      );
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title={`颜色变体 (${colors.length})`}>
      <div className="space-y-2">
        {colors.map((c, idx) => {
          const labelMap = safeParseJson<Record<string, string>>(
            c.label_json,
            {},
          );
          const images = safeParseJson<string[]>(c.images_json, []);
          const rawViews = safeParseJson<Record<string, unknown>>(
            c.views_json,
            {},
          );
          const views = {
            front: typeof rawViews.front === "string" ? rawViews.front : null,
            side: typeof rawViews.side === "string" ? rawViews.side : null,
            angle: typeof rawViews.angle === "string" ? rawViews.angle : null,
            folded:
              typeof rawViews.folded === "string" ? rawViews.folded : null,
          };
          if (editingId === c.color_id) {
            return (
              <ColorEditor
                key={c.color_id}
                productId={productId}
                mode="edit"
                initial={{
                  color_id: c.color_id,
                  hex: c.hex,
                  label: labelMap,
                  images,
                  views,
                  tryon_image_url: c.tryon_image_url,
                  sort_order: c.sort_order,
                }}
                onClose={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  onChanged();
                }}
              />
            );
          }
          const isFirst = idx === 0;
          const isLast = idx === colors.length - 1;
          return (
            <div
              key={c.color_id}
              className="flex items-center gap-3 p-3 rounded-md border border-border"
            >
              <span
                className="h-8 w-8 rounded-full border border-border shrink-0"
                style={{ backgroundColor: c.hex }}
                title={c.hex}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground font-mono">
                  {c.color_id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {labelMap.zh ?? "—"} / {labelMap.en ?? "—"} · {images.length}{" "}
                  张图 · sort {c.sort_order}
                </div>
              </div>
              <div className="flex flex-col">
                <button
                  onClick={() => reorder(idx, idx - 1)}
                  disabled={busy || isFirst}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  title="上移"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => reorder(idx, idx + 1)}
                  disabled={busy || isLast}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  title="下移"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setEditingId(c.color_id)}
                className="p-2 text-muted-foreground hover:text-foreground"
                title="编辑"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRemove(c.color_id)}
                disabled={busy}
                className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {colors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            该商品还没有颜色变体。
          </p>
        )}

        {editingId === "new" ? (
          <ColorEditor
            productId={productId}
            mode="add"
            initial={{
              color_id: "",
              hex: "#000000",
              label: {},
              images: [],
              views: { front: null, side: null, angle: null, folded: null },
              tryon_image_url: null,
              sort_order: colors.length * 10,
            }}
            onClose={() => setEditingId(null)}
            onSaved={() => {
              setEditingId(null);
              onChanged();
            }}
          />
        ) : (
          <button
            onClick={() => setEditingId("new")}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-dashed border-border text-sm hover:bg-secondary transition-smooth"
          >
            <Plus className="h-4 w-4" />
            添加颜色
          </button>
        )}
      </div>
    </Section>
  );
}

interface ColorEditorState {
  color_id: string;
  hex: string;
  label: Record<string, string>;
  images: string[];
  views: {
    front: string | null;
    side: string | null;
    angle: string | null;
    folded: string | null;
  };
  tryon_image_url: string | null;
  sort_order: number;
}

function ColorEditor({
  productId,
  mode,
  initial,
  onClose,
  onSaved,
}: {
  productId: string;
  mode: "add" | "edit";
  initial: ColorEditorState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [s, setS] = useState<ColorEditorState>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (mode === "add") {
      if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(s.color_id))
        return setErr("color_id 必须是小写字母/数字/短横线");
    }
    if (!/^#[0-9a-fA-F]{3,8}$/.test(s.hex)) return setErr("HEX 格式不合法");
    if (!s.label.en || !s.label.zh) return setErr("中英文 label 都必填");

    setBusy(true);
    try {
      const url =
        mode === "add"
          ? `/api/admin/products/${productId}/colors`
          : `/api/admin/products/${productId}/colors?color_id=${encodeURIComponent(s.color_id)}`;
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color_id: s.color_id,
          hex: s.hex,
          label: s.label,
          images: s.images,
          views: s.views,
          tryon_image_url: s.tryon_image_url,
          sort_order: s.sort_order,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "color_id_taken") setErr("此 color_id 已存在");
        else setErr(data.message ?? data.error ?? "保存失败");
        return;
      }
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  const setLang = (lang: string, value: string) => {
    setS((prev) => {
      const m = { ...prev.label };
      if (value) m[lang] = value;
      else delete m[lang];
      return { ...prev, label: m };
    });
  };

  const [activeLang, setActiveLang] = useState<Lang>("en");
  const LANG_PLACEHOLDERS: Record<Lang, string> = {
    en: "Tortoise",
    zh: "玳瑁",
    ja: "べっ甲",
    ko: "토터스",
    es: "Carey",
    fr: "Écaille",
    de: "Schildpatt",
    it: "Tartaruga",
    pt: "Tartaruga",
    ar: "صدف السلحفاة",
    vi: "Đồi mồi",
    th: "ลายกระดองเต่า",
    id: "Tortoise",
    ms: "Tortoise",
  };

  return (
    <div className="space-y-3 rounded-md border border-primary/40 bg-secondary/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {mode === "add" ? "新建颜色" : `编辑颜色 ${s.color_id}`}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="关闭"
        >
          <Trash2 className="h-4 w-4 hidden" />
          <span className="text-xs">关闭</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            color_id（颜色 ID）*
          </label>
          <input
            value={s.color_id}
            onChange={(e) =>
              setS({ ...s, color_id: e.target.value.toLowerCase() })
            }
            disabled={mode === "edit"}
            placeholder="tortoise"
            className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            HEX（十六进制色值）*
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.hex}
              onChange={(e) => setS({ ...s, hex: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-md border border-input"
            />
            <input
              value={s.hex}
              onChange={(e) => setS({ ...s, hex: e.target.value })}
              placeholder="#8c5a2b"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            sort_order（排序）
          </label>
          <input
            type="number"
            value={s.sort_order}
            onChange={(e) =>
              setS({ ...s, sort_order: Number(e.target.value) || 0 })
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          颜色名 label（en / zh 必填，其他语言选填）*
        </label>
        <div className="rounded-md border border-input bg-background">
          <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-secondary/30">
            {LANGS.map((l) => {
              const filled = !!s.label[l]?.length;
              const required = l === "en" || l === "zh";
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={
                    "px-2 py-1 rounded text-xs uppercase tracking-wider " +
                    (activeLang === l
                      ? "bg-primary text-primary-foreground"
                      : filled
                        ? "bg-card text-foreground hover:bg-secondary"
                        : "text-muted-foreground hover:bg-secondary")
                  }
                  title={required ? "必填" : "选填"}
                >
                  {l}
                  {required && (
                    <span className="ml-0.5 text-destructive">*</span>
                  )}
                  {filled && activeLang !== l && (
                    <span className="ml-0.5 text-[8px]">●</span>
                  )}
                </button>
              );
            })}
          </div>
          <input
            value={s.label[activeLang] ?? ""}
            onChange={(e) => setLang(activeLang, e.target.value)}
            placeholder={LANG_PLACEHOLDERS[activeLang]}
            className="w-full h-10 px-3 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          颜色图片（[0] 为 hero）
        </label>
        <ColorImagesEditor
          value={s.images}
          onChange={(images) => setS({ ...s, images })}
          prefix="product"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          视图槽位（front / side / angle / folded — front 和 side 上线必填）
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["front", "side", "angle", "folded"] as const).map((k) => (
            <div key={k}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {k}
                {(k === "front" || k === "side") && (
                  <span className="ml-0.5 text-destructive">*</span>
                )}
              </div>
              <ImageUpload
                value={s.views[k] ?? ""}
                onChange={(url) =>
                  setS({ ...s, views: { ...s.views, [k]: url || null } })
                }
                prefix="product"
                height={72}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          试戴图（可选）- tryon
        </label>
        <ImageUpload
          value={s.tryon_image_url ?? ""}
          onChange={(url) => setS({ ...s, tryon_image_url: url || null })}
          prefix="product"
          height={64}
        />
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {err}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <button
          onClick={onClose}
          className="h-8 rounded-md border border-border px-3 text-sm hover:bg-secondary"
        >
          取消
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {mode === "add" ? "创建" : "保存"}
        </button>
      </div>
    </div>
  );
}

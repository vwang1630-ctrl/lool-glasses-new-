// /admin/products/new — create a new frame product (minimum required fields
// only). After creation, redirects to /admin/products/$id for full editing.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

export const Route = createFileRoute("/admin/products/new")({
  component: AdminProductNewPage,
});

function AdminProductNewPage() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<"eyeglasses" | "sunglasses" | "accessory">(
    "eyeglasses",
  );
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugValid = slug.length === 0 || SLUG_RE.test(slug);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!slug || !SLUG_RE.test(slug)) {
      setError("slug 必须是小写字母/数字/短横线，2-81 字符");
      return;
    }
    if (!nameEn.trim()) {
      setError("英文名必填");
      return;
    }
    if (!nameZh.trim()) {
      setError("中文名必填");
      return;
    }
    const priceNum = Number(priceUsd);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("价格必须是非负数（美元）");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          product_kind: kind,
          name: { en: nameEn.trim(), zh: nameZh.trim() },
          price_cents: Math.round(priceNum * 100),
          currency: "USD",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "slug_taken") setError("此 slug 已被占用，换一个");
        else if (data.error === "name_required") setError("英文+中文名都必填");
        else if (data.error === "invalid_slug") setError("slug 格式不合法");
        else if (data.error === "invalid_kind") setError("商品类型不合法");
        else if (data.error === "invalid_price") setError("价格不合法");
        else setError(data.message ?? data.error ?? "创建失败");
        setSubmitting(false);
        return;
      }
      const { id } = (await res.json()) as { id: string };
      navigate({ to: "/admin/products/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">新建商品</h1>
          <p className="text-sm text-muted-foreground">
            填写最少必填项，创建后跳到完整编辑页继续补充。
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-soft"
      >
        <Field
          label="slug (网址标识) *"
          hint="URL 用，小写字母/数字/短横线，2-81 字符"
        >
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="aurora-tortoise"
            className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 ${
              slugValid
                ? "border-input focus:border-ring"
                : "border-destructive"
            }`}
            autoFocus
          />
        </Field>

        <Field label="商品类型 *">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="eyeglasses">光学眼镜 (eyeglasses)</option>
            <option value="sunglasses">太阳镜 (sunglasses)</option>
            <option value="accessory">配件 (accessory)</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="英文名 (name.en) *">
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Aurora Tortoise Round"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </Field>
          <Field label="中文名 (name.zh) *">
            <input
              type="text"
              value={nameZh}
              onChange={(e) => setNameZh(e.target.value)}
              placeholder="极光玳瑁圆框"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </Field>
        </div>

        <Field
          label="价格 (USD) *"
          hint="单位：美元，会换成 cents 存库（例如 26 → 2600）"
        >
          <input
            type="number"
            step="0.01"
            min="0"
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            placeholder="26.00"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </Field>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Link
            to="/admin/products"
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

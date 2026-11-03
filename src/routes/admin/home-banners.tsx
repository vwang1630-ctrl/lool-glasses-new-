// /admin/home-banners — single entry-point for all home-page banner content.
// Four tabs:
//   1. Hero 轮播 (4-slot DB-backed carousel — home_banners table)
//   2. 受众双 banner (近视 / 老花 — audience_banners table)
//   3. 推广 banner (AI 试戴 + 品牌主张 — home_promo_banners table)
//   4. 顾客实拍 (UGC grid — home_ugc table)
// Each tab saves to its own endpoint via its own button.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PromoBannersEditor } from "./home-promo-banners";
import { UgcEditor } from "./home-ugc";

const SLOTS = [1, 2, 3, 4] as const;
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

const AUDIENCES = [
  {
    key: "distance" as const,
    label: "近视 · 潮流校园 & 日常通勤",
    hint: "首页第 5 区左图（年轻面孔 / 校园通勤场景）",
    defaultHref: "/myopia",
  },
  {
    key: "reading" as const,
    label: "老花 · 商务 & 全场景舒适",
    hint: "首页第 5 区右图（成熟面孔 / 商务场景）",
    defaultHref: "/presbyopia",
  },
] as const;
type AudienceKey = (typeof AUDIENCES)[number]["key"];

interface AudienceRow {
  image_url: string;
  href: string;
}

interface Banner {
  id?: string;
  slot: number;
  product_id: string;
  image_url: string;
  eyebrow_json: Record<string, string> | null;
  title_json: Record<string, string> | null;
  sub_json: Record<string, string> | null;
  subtitle_json: Record<string, string> | null;
  active: boolean;
  sort_order: number;
}

interface CatalogProduct {
  id: string;
  slug: string;
  name: Record<string, string>;
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

const emptyBanner = (slot: number): Banner => ({
  slot,
  product_id: "",
  image_url: "",
  eyebrow_json: null,
  title_json: null,
  sub_json: null,
  subtitle_json: null,
  active: true,
  sort_order: slot,
});

type TabId = "hero" | "audience" | "promo" | "ugc";
const TABS: { id: TabId; label: string }[] = [
  { id: "hero", label: "Hero 轮播（4 槽）" },
  { id: "audience", label: "受众双 banner（近视 / 老花）" },
  { id: "promo", label: "推广 banner（AI 试戴 / 品牌主张）" },
  { id: "ugc", label: "顾客实拍（UGC）" },
];

export const Route = createFileRoute("/admin/home-banners")({
  component: AdminHomeBannersPage,
});

function AdminHomeBannersPage() {
  const [tab, setTab] = useState<TabId>("hero");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">首页 Banner</h1>
        <p className="text-sm text-muted-foreground">
          首页所有 banner / 推广位 / UGC 卡片统一在此管理，分 4 个 tab。每个 tab
          单独保存。
        </p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "rounded-t-md border-b-2 px-4 py-2 text-sm font-medium transition-colors " +
              (tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "hero" && <HeroBannersEditor />}
      {tab === "audience" && <AudienceBannersEditor />}
      {tab === "promo" && <PromoBannersEditor />}
      {tab === "ugc" && <UgcEditor />}
    </div>
  );
}

export function HeroBannersEditor() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/home-banners", { credentials: "same-origin" })
        .then((r) =>
          r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
        )
        .then((d: { banners: Banner[] }) => d.banners),
      fetch("/api/admin/products?limit=200", { credentials: "same-origin" })
        .then((r) =>
          r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
        )
        .then(
          (d: {
            products: { id: string; slug: string; name_json: string | null }[];
          }) =>
            d.products.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name_json
                ? (JSON.parse(p.name_json) as Record<string, string>)
                : { en: p.slug },
            })),
        ),
    ])
      .then(([bs, ps]) => {
        const bySlot = new Map<number, Banner>();
        for (const b of bs) bySlot.set(b.slot, b);
        const filled = SLOTS.map((s) => bySlot.get(s) ?? emptyBanner(s));
        setBanners(filled);
        setProducts(ps);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const update = (slot: number, patch: Partial<Banner>) => {
    setBanners((bs) =>
      bs.map((b) => (b.slot === slot ? { ...b, ...patch } : b)),
    );
  };

  const updateLang = (
    slot: number,
    key: "eyebrow_json" | "title_json" | "sub_json" | "subtitle_json",
    lang: string,
    value: string,
  ) => {
    setBanners((bs) =>
      bs.map((b) => {
        if (b.slot !== slot) return b;
        const m = { ...(b[key] ?? {}) };
        if (value) m[lang] = value;
        else delete m[lang];
        return { ...b, [key]: Object.keys(m).length > 0 ? m : null };
      }),
    );
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const payload = banners
        .filter((b) => b.product_id && b.image_url)
        .map((b) => ({
          slot: b.slot,
          product_id: b.product_id,
          image_url: b.image_url,
          eyebrow_json: b.eyebrow_json,
          title_json: b.title_json,
          sub_json: b.sub_json,
          subtitle_json: b.subtitle_json,
          active: b.active,
          sort_order: b.sort_order,
        }));
      const res = await fetch("/api/admin/home-banners", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "保存失败");
      } else {
        alert("已保存");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          4 个 hero 轮播槽位，每个绑定商品 + R2 图片 + 10 语文案。
        </p>
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
          保存 hero 轮播
        </button>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {banners.map((b) => (
          <section
            key={b.slot}
            className="rounded-lg border border-border bg-card p-5 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Slot {b.slot}</h2>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={b.active}
                  onChange={(e) => update(b.slot, { active: e.target.checked })}
                />
                启用
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  商品{" "}
                  <span className="text-muted-foreground/70">
                    （点击 banner 图会跳到这个商品）
                  </span>
                </label>
                <select
                  value={b.product_id}
                  onChange={(e) =>
                    update(b.slot, { product_id: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">— 选择商品 —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name.en ?? p.slug} ({p.slug})
                    </option>
                  ))}
                </select>
                {(() => {
                  const picked = products.find((p) => p.id === b.product_id);
                  if (!picked) return null;
                  return (
                    <a
                      href={`/en/product/${picked.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      → 预览商品页（/product/{picked.slug}）
                    </a>
                  );
                })()}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Banner 图
                </label>
                <ImageUpload
                  value={b.image_url}
                  onChange={(url) => update(b.slot, { image_url: url })}
                  prefix="banner"
                  height={64}
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
              <LangPair
                label="eyebrow"
                map={b.eyebrow_json}
                onChange={(lang, v) =>
                  updateLang(b.slot, "eyebrow_json", lang, v)
                }
              />
              <LangPair
                label="title"
                map={b.title_json}
                onChange={(lang, v) =>
                  updateLang(b.slot, "title_json", lang, v)
                }
              />
              <LangPair
                label="sub"
                map={b.sub_json}
                onChange={(lang, v) => updateLang(b.slot, "sub_json", lang, v)}
              />
              <LangPair
                label="subtitle"
                map={b.subtitle_json}
                onChange={(lang, v) =>
                  updateLang(b.slot, "subtitle_json", lang, v)
                }
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function AudienceBannersEditor() {
  const [audience, setAudience] = useState<Record<AudienceKey, AudienceRow>>({
    distance: { image_url: "", href: "" },
    reading: { image_url: "", href: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/audience-banners", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then(
        (d: {
          banners: {
            audience: AudienceKey;
            image_url: string;
            href: string | null;
          }[];
        }) => {
          const a: Record<AudienceKey, AudienceRow> = {
            distance: { image_url: "", href: "" },
            reading: { image_url: "", href: "" },
          };
          for (const row of d.banners) {
            if (row.audience === "distance" || row.audience === "reading") {
              a[row.audience] = {
                image_url: row.image_url,
                href: row.href ?? "",
              };
            }
          }
          setAudience(a);
        },
      )
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const payload = AUDIENCES.filter((a) => audience[a.key].image_url).map(
        (a) => ({
          audience: a.key,
          image_url: audience[a.key].image_url,
          href: audience[a.key].href.trim() || null,
        }),
      );
      if (payload.length === 0) {
        setErr("请至少为一张图片选择图片");
        return;
      }
      const res = await fetch("/api/admin/audience-banners", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "保存失败");
      } else {
        alert("受众双 banner 已保存");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">
            首页中部的两张大图，左 = 近视（distance），右 =
            老花（reading）。文案由系统统一管理， 这里只换图 + 设置跳转链接。
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            推荐尺寸 <span className="font-mono">1600 × 1280</span> px（横向
            5:4，桌面端展示）， 移动端会按 5:6
            居中裁切；主体（人脸）请放在画面上方约 60% 区域内，
            避免被左下角文字遮挡。格式 JPG / WEBP / PNG，建议 ≤ 1 MB。
          </p>
        </div>
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
          保存受众 banner
        </button>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AUDIENCES.map((a) => (
          <div key={a.key} className="rounded-md border border-border p-4">
            <div className="mb-2">
              <div className="text-sm font-semibold text-foreground">
                {a.label}
              </div>
              <div className="text-xs text-muted-foreground">{a.hint}</div>
            </div>
            <ImageUpload
              value={audience[a.key].image_url}
              onChange={(url) =>
                setAudience((s) => ({
                  ...s,
                  [a.key]: { ...s[a.key], image_url: url },
                }))
              }
              prefix="audience-banner"
              height={120}
              hideUrlInput
            />
            <div className="mt-3">
              <label className="mb-1 block text-xs text-muted-foreground">
                跳转链接
              </label>
              <input
                value={audience[a.key].href}
                onChange={(e) =>
                  setAudience((s) => ({
                    ...s,
                    [a.key]: { ...s[a.key], href: e.target.value },
                  }))
                }
                placeholder={`留空 = 默认跳到 ${a.defaultHref}`}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                支持站内路径（如 <span className="font-mono">/products</span>、
                <span className="font-mono">{a.defaultHref}</span>）或完整
                https:// 链接。
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LangPair({
  label,
  map,
  onChange,
}: {
  label: string;
  map: Record<string, string> | null;
  onChange: (lang: string, value: string) => void;
}) {
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const m = map ?? {};
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">
        {label}
      </label>
      <div className="rounded-md border border-input bg-background">
        <div className="flex flex-wrap gap-1 border-b border-input bg-secondary/30 p-1.5">
          {LANGS.map((l) => {
            const filled = !!m[l]?.length;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                className={
                  "rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider " +
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
        <input
          value={m[activeLang] ?? ""}
          onChange={(e) => onChange(activeLang, e.target.value)}
          placeholder={activeLang.toUpperCase()}
          className="h-9 w-full bg-transparent px-2 text-sm outline-none"
        />
      </div>
    </div>
  );
}

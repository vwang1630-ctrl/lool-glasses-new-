// /admin/home-promo-banners — editor for the two single-image promo strips on
// the homepage: AI 虚拟试戴 + LOOLLOOK 品牌主张. Bulk PUT on save.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

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

const KINDS = [
  { kind: "tryon", label: "AI 虚拟试戴", defaultLink: "/try-on" },
  { kind: "brand", label: "品牌主张", defaultLink: "/products" },
] as const;
type Kind = (typeof KINDS)[number]["kind"];

interface PromoBanner {
  id?: string;
  kind: Kind;
  image_url: string | null;
  eyebrow_json: Record<string, string> | null;
  title_json: Record<string, string> | null;
  sub_json: Record<string, string> | null;
  cta_json: Record<string, string> | null;
  link_href: string;
  active: boolean;
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

const emptyBanner = (kind: Kind, defaultLink: string): PromoBanner => ({
  kind,
  image_url: null,
  eyebrow_json: null,
  title_json: null,
  sub_json: null,
  cta_json: null,
  link_href: defaultLink,
  active: true,
});

export const Route = createFileRoute("/admin/home-promo-banners")({
  component: AdminHomePromoBannersPage,
});

function AdminHomePromoBannersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          首页推广 Banner
        </h1>
        <p className="text-sm text-muted-foreground">
          首页 "AI 虚拟试戴" + "品牌主张" 两个整行 banner。
        </p>
      </div>
      <PromoBannersEditor />
    </div>
  );
}

export function PromoBannersEditor() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/home-promo-banners", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { banners: PromoBanner[] }) => {
        const byKind = new Map(d.banners.map((b) => [b.kind, b]));
        const filled = KINDS.map(
          (k) => byKind.get(k.kind) ?? emptyBanner(k.kind, k.defaultLink),
        );
        setBanners(filled);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const update = (kind: Kind, patch: Partial<PromoBanner>) => {
    setBanners((bs) =>
      bs.map((b) => (b.kind === kind ? { ...b, ...patch } : b)),
    );
  };

  const updateLang = (
    kind: Kind,
    key: "eyebrow_json" | "title_json" | "sub_json" | "cta_json",
    lang: string,
    value: string,
  ) => {
    setBanners((bs) =>
      bs.map((b) => {
        if (b.kind !== kind) return b;
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
      const payload = banners.map((b) => ({
        id: b.id,
        kind: b.kind,
        image_url: b.image_url,
        eyebrow_json: b.eyebrow_json,
        title_json: b.title_json,
        sub_json: b.sub_json,
        cta_json: b.cta_json,
        link_href: b.link_href,
        active: b.active,
      }));
      const res = await fetch("/api/admin/home-promo-banners", {
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
      <div className="flex items-center justify-end">
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
          保存推广 banner
        </button>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {banners.map((b) => {
          const meta = KINDS.find((k) => k.kind === b.kind);
          return (
            <section
              key={b.kind}
              className="rounded-lg border border-border bg-card p-5 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  {meta?.label ?? b.kind}
                </h2>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={b.active}
                    onChange={(e) =>
                      update(b.kind, { active: e.target.checked })
                    }
                  />
                  启用
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Banner 图
                  </label>
                  <ImageUpload
                    value={b.image_url ?? ""}
                    onChange={(url) =>
                      update(b.kind, { image_url: url || null })
                    }
                    prefix="banner"
                    height={120}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    跳转链接（CTA 按钮指向）
                  </label>
                  <input
                    value={b.link_href}
                    onChange={(e) =>
                      update(b.kind, { link_href: e.target.value })
                    }
                    placeholder="/try-on 或 /products 或 /product/lool-xxxx"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <LangPair
                  label="eyebrow（小字标签）"
                  map={b.eyebrow_json}
                  onChange={(lang, v) =>
                    updateLang(b.kind, "eyebrow_json", lang, v)
                  }
                />
                <LangPair
                  label="title（主标题）"
                  map={b.title_json}
                  onChange={(lang, v) =>
                    updateLang(b.kind, "title_json", lang, v)
                  }
                />
                <LangPair
                  label="sub（副标题，可选）"
                  map={b.sub_json}
                  onChange={(lang, v) =>
                    updateLang(b.kind, "sub_json", lang, v)
                  }
                />
                <LangPair
                  label="CTA 按钮文字"
                  map={b.cta_json}
                  onChange={(lang, v) =>
                    updateLang(b.kind, "cta_json", lang, v)
                  }
                />
              </div>
            </section>
          );
        })}
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
  const [activeLang, setActiveLang] = useState<Lang>("zh");
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

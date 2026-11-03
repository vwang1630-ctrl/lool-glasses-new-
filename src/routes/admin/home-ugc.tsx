// /admin/home-ugc — editor for the "顾客实拍 LOOK" home-page community grid.
// Bulk PUT /api/admin/home-ugc on save (delete-all + insert).

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
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

interface UgcCard {
  id?: string;
  slot: number;
  image_url: string | null;
  name: string;
  rating: number;
  text_json: Record<string, string> | null;
  link_href: string | null;
  active: boolean;
  sort_order: number;
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

const emptyCard = (slot: number): UgcCard => ({
  slot,
  image_url: null,
  name: "",
  rating: 5,
  text_json: null,
  link_href: null,
  active: true,
  sort_order: slot * 10,
});

export const Route = createFileRoute("/admin/home-ugc")({
  component: AdminHomeUgcPage,
});

function AdminHomeUgcPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">首页 顾客实拍</h1>
        <p className="text-sm text-muted-foreground">
          首页 "顾客实拍 LOOK · 用户真实社区" 区域。
        </p>
      </div>
      <UgcEditor />
    </div>
  );
}

export function UgcEditor() {
  const [cards, setCards] = useState<UgcCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/home-ugc", { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { cards: UgcCard[] }) => {
        setCards(d.cards.sort((a, b) => a.slot - b.slot));
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const update = (slot: number, patch: Partial<UgcCard>) => {
    setCards((cs) => cs.map((c) => (c.slot === slot ? { ...c, ...patch } : c)));
  };

  const updateLang = (slot: number, lang: string, value: string) => {
    setCards((cs) =>
      cs.map((c) => {
        if (c.slot !== slot) return c;
        const m = { ...(c.text_json ?? {}) };
        if (value) m[lang] = value;
        else delete m[lang];
        return { ...c, text_json: Object.keys(m).length > 0 ? m : null };
      }),
    );
  };

  const addCard = () => {
    setCards((cs) => {
      const used = new Set(cs.map((c) => c.slot));
      let slot = 1;
      while (used.has(slot)) slot++;
      if (slot > 12) {
        alert("最多 12 张");
        return cs;
      }
      return [...cs, emptyCard(slot)].sort((a, b) => a.slot - b.slot);
    });
  };

  const removeCard = (slot: number) => {
    if (!confirm("删除此条？保存后生效。")) return;
    setCards((cs) => cs.filter((c) => c.slot !== slot));
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const payload = cards.map((c) => ({
        id: c.id,
        slot: c.slot,
        image_url: c.image_url,
        name: c.name,
        rating: c.rating,
        text_json: c.text_json,
        link_href: c.link_href,
        active: c.active,
        sort_order: c.sort_order,
      }));
      const res = await fetch("/api/admin/home-ugc", {
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
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={addCard}
          className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
          添加
        </button>
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
          保存顾客实拍
        </button>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cards.map((c) => (
          <section
            key={c.slot}
            className="rounded-lg border border-border bg-card p-5 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Slot {c.slot}</h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={(e) =>
                      update(c.slot, { active: e.target.checked })
                    }
                  />
                  启用
                </label>
                <button
                  onClick={() => removeCard(c.slot)}
                  className="text-muted-foreground hover:text-destructive"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  实拍图
                </label>
                <ImageUpload
                  value={c.image_url ?? ""}
                  onChange={(url) => update(c.slot, { image_url: url || null })}
                  prefix="review"
                  height={120}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    用户名
                  </label>
                  <input
                    value={c.name}
                    onChange={(e) => update(c.slot, { name: e.target.value })}
                    placeholder="例如 Sarah M."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    评分（0–5）
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={c.rating}
                    onChange={(e) =>
                      update(c.slot, { rating: Number(e.target.value) || 0 })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    跳转链接（可选；如 /product/lool-8668）
                  </label>
                  <input
                    value={c.link_href ?? ""}
                    onChange={(e) =>
                      update(c.slot, { link_href: e.target.value || null })
                    }
                    placeholder="留空 = 不可点击"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    排序
                  </label>
                  <input
                    type="number"
                    value={c.sort_order}
                    onChange={(e) =>
                      update(c.slot, {
                        sort_order: Number(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <LangText
                label="评论文字"
                map={c.text_json}
                onChange={(lang, v) => updateLang(c.slot, lang, v)}
              />
            </div>
          </section>
        ))}
        {cards.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            尚无 UGC 卡片。点击"添加"开始。
          </div>
        )}
      </div>
    </div>
  );
}

function LangText({
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
        <textarea
          value={m[activeLang] ?? ""}
          onChange={(e) => onChange(activeLang, e.target.value)}
          placeholder={activeLang.toUpperCase()}
          rows={3}
          className="block w-full resize-y bg-transparent px-2 py-2 text-sm outline-none"
        />
      </div>
    </div>
  );
}

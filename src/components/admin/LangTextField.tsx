// Shared 14-language text editor for admin forms. Renders the supported
// language codes as a tab strip with a fill indicator (●) on filled tabs,
// and a single input/textarea for the active language. Keeps the value as
// a Record<string, string> with empty/whitespace-only values omitted.

import { useState } from "react";

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

interface Props {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  multiline?: boolean;
  placeholder?: string;
  /** Number of textarea rows when multiline. */
  rows?: number;
}

export function LangTextField({
  value,
  onChange,
  multiline,
  placeholder,
  rows = 3,
}: Props) {
  const [activeLang, setActiveLang] = useState<Lang>("en");

  const update = (lang: Lang, raw: string) => {
    const next: Record<string, string> = { ...value };
    if (raw.trim() === "") delete next[lang];
    else next[lang] = raw;
    onChange(next);
  };

  const inputCls = "w-full bg-transparent px-2 text-sm outline-none";

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap gap-1 border-b border-input bg-secondary/30 p-1.5">
        {LANGS.map((l) => {
          const filled = !!value[l]?.trim();
          const active = activeLang === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l)}
              className={
                "rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : filled
                    ? "bg-card text-foreground hover:bg-secondary"
                    : "text-muted-foreground hover:bg-secondary")
              }
            >
              {l}
              {filled && !active && (
                <span className="ml-0.5 text-[8px]">●</span>
              )}
            </button>
          );
        })}
      </div>
      {multiline ? (
        <textarea
          value={value[activeLang] ?? ""}
          onChange={(e) => update(activeLang, e.target.value)}
          placeholder={placeholder ?? activeLang.toUpperCase()}
          rows={rows}
          className={`${inputCls} py-1.5 resize-y`}
        />
      ) : (
        <input
          value={value[activeLang] ?? ""}
          onChange={(e) => update(activeLang, e.target.value)}
          placeholder={placeholder ?? activeLang.toUpperCase()}
          className={`${inputCls} h-9`}
        />
      )}
    </div>
  );
}

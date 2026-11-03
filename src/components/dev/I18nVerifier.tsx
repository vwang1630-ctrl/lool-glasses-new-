import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck, AlertTriangle, X, RefreshCw } from "lucide-react";

/**
 * I18nVerifier — 语言切换校验工具
 * 扫描带有 data-i18n-scope="product-card" 的元素，对其内部可见文本做启发式检测：
 *  - 期望脚本与当前 UI 语言不匹配的文本会被标记
 *  - 命中的卡片会被加上红色虚线边框
 *  - 浮窗给出报告，可一键重新校验或关闭
 *
 * 注意：货币符号、价格、品牌名(lool/Aurora 等)、表情、单位（mm）等会被白名单忽略。
 */

type Issue = {
  id: string;
  text: string;
  reason: string;
};

const LATIN_LANGS = new Set(["en", "es", "fr", "de", "it", "pt"]);
const CJK_LANG_TO_SCRIPT: Record<string, RegExp> = {
  zh: /[\u4e00-\u9fff]/,
  ja: /[\u3040-\u30ff\u4e00-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
};

// Tokens that legitimately stay in source language across all locales.
const WHITELIST = new Set([
  "lool",
  "Aurora",
  "Halo",
  "Noir",
  "Lumen",
  "Atlas",
  "Iris",
  "FSA",
  "HSA",
  "UV",
  "TR90",
  "PD",
  "SPH",
  "CYL",
  "AXIS",
  "ADD",
  "App",
  "Store",
  "Google",
  "Play",
  "AI",
  "GEO",
  "NEW",
  "Instagram",
  "Facebook",
  "YouTube",
  "Twitter",
]);

// Strip currency, digits, punctuation and brand tokens to detect raw alphabetic words.
function extractWords(text: string): string[] {
  return text
    .replace(/[\u00a0]+/g, " ")
    .split(/[\s.,·•|/()[\]{}<>?!:;"'’“”\-—_=+*~`@#$%^&]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function checkText(text: string, lang: string): string | null {
  const t = text.trim();
  if (!t) return null;

  // CJK / Korean expectations
  const cjkRe = CJK_LANG_TO_SCRIPT[lang];
  if (cjkRe) {
    if (!cjkRe.test(t)) {
      // pure ASCII text in a CJK locale → likely untranslated
      const words = extractWords(t).filter(
        (w) => /[A-Za-z]/.test(w) && !WHITELIST.has(w),
      );
      if (words.length > 0)
        return `Expected ${lang.toUpperCase()} script, found Latin: "${words.slice(0, 3).join(" ")}"`;
    }
    return null;
  }

  // Arabic
  if (lang === "ar") {
    if (!/[\u0600-\u06ff]/.test(t)) {
      const words = extractWords(t).filter(
        (w) => /[A-Za-z]/.test(w) && !WHITELIST.has(w),
      );
      if (words.length > 0)
        return `Expected Arabic, found Latin: "${words.slice(0, 3).join(" ")}"`;
    }
    return null;
  }

  // Latin-script locales: warn if the text contains CJK / Arabic from a stale render.
  if (LATIN_LANGS.has(lang)) {
    if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff]/.test(t)) {
      return `Expected ${lang.toUpperCase()}, found non-Latin script in: "${t.slice(0, 30)}"`;
    }
  }

  return null;
}

function getVisibleText(el: Element): string {
  // textContent collapses descendants; good enough for headlines / pills / buttons.
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function I18nVerifier() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);

  // Re-scan whenever language changes or user requests.
  useEffect(() => {
    // wait one frame so React has flushed the new lang into the DOM
    const id = requestAnimationFrame(() => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-i18n-scope="product-card"]',
        ),
      );
      const found: Issue[] = [];

      for (const card of cards) {
        // clear previous mark
        card.classList.remove("i18n-verify-bad");
        card.style.removeProperty("outline");
        card.style.removeProperty("outline-offset");

        // sample meaningful sub-elements: headings, buttons, badges, captions
        const targets = card.querySelectorAll(
          "h1,h2,h3,h4,h5,p,span,button,a,li",
        );
        let bad: string | null = null;
        for (const node of Array.from(targets)) {
          const txt = getVisibleText(node);
          if (!txt || txt.length > 120) continue;
          // skip pure numeric / price tokens
          if (/^[\s$€£¥₩.,0-9·\-+]+$/.test(txt)) continue;
          const reason = checkText(txt, lang);
          if (reason) {
            bad = reason;
            break;
          }
        }
        if (bad) {
          card.classList.add("i18n-verify-bad");
          card.style.outline = "2px dashed hsl(0 84% 60%)";
          card.style.outlineOffset = "4px";
          const label =
            card.querySelector("h3, h2, h4")?.textContent?.trim() ??
            getVisibleText(card).slice(0, 40);
          found.push({
            id: label + Math.random().toString(36).slice(2, 6),
            text: label,
            reason: bad,
          });
        }
      }
      setIssues(found);
    });

    return () => cancelAnimationFrame(id);
  }, [lang, tick]);

  // Keyboard shortcut: Ctrl/⌘ + Shift + L toggles the panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "l"
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const status = useMemo(() => {
    if (issues.length === 0)
      return {
        ok: true,
        msg: "All product cards rendered in current language.",
      };
    return {
      ok: false,
      msg: `${issues.length} card(s) contain untranslated content.`,
    };
  }, [issues]);

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Verify translation (⌘/Ctrl+Shift+L)"
        className="fixed z-50 bottom-5 right-5 inline-flex items-center gap-2 px-3 h-10 rounded-full shadow-lg border border-border bg-background/95 backdrop-blur text-xs hover:bg-secondary transition-smooth"
      >
        {status.ok ? (
          <ShieldCheck className="w-4 h-4 text-primary" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        )}
        <span className="font-medium">i18n · {lang.toUpperCase()}</span>
        {!status.ok && (
          <span className="px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
            {issues.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed z-50 bottom-20 right-5 w-[320px] max-h-[60vh] rounded-2xl border border-border bg-background shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              {status.ok ? (
                <ShieldCheck className="w-4 h-4 text-primary" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm font-medium">Language verifier</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTick((n) => n + 1)}
                className="w-7 h-7 inline-flex items-center justify-center rounded-full hover:bg-secondary"
                aria-label="rescan"
                title="Re-scan"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 inline-flex items-center justify-center rounded-full hover:bg-secondary"
                aria-label="close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-4 py-3 text-xs text-muted-foreground border-b border-border/60">
            <div>
              Current language:{" "}
              <span className="text-foreground font-medium">
                {lang.toUpperCase()}
              </span>
            </div>
            <div
              className={
                status.ok ? "text-primary mt-1" : "text-destructive mt-1"
              }
            >
              {status.msg}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {issues.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                ✓ No untranslated product cards detected
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {issues.map((iss) => (
                  <li key={iss.id} className="px-4 py-3 text-xs">
                    <div className="font-medium text-foreground truncate">
                      {iss.text || "(card)"}
                    </div>
                    <div className="text-destructive mt-0.5">{iss.reason}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2 border-t border-border/60 text-[10px] text-muted-foreground">
            Tip: ⌘/Ctrl + Shift + L to toggle · cards with issues are outlined
            in red.
          </div>
        </div>
      )}
    </>
  );
}

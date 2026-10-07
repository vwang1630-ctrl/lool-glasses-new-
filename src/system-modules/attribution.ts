// attribution.ts — 首触/末触归因(2026-09-30,sales-intent-backlog D 仪表3 前置)
// 目的:consult_events 能回答「这个询盘从哪个网扣来」——
// 落地时若 URL 带 utm_* 则存档(首触只记一次,末触持续覆盖);
// trackConsult 提交时把紧凑 token 写进 note,周报按 src: 解析归因。
// 纯 localStorage,不碰 cookie/第三方。

const KEY = "fuzzsofa.attribution";

type Touch = { src?: string; med?: string; camp?: string; ref?: string };
type Store = { first: Touch; last: Touch; at: string };

function read(): Store | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Store;
    return s?.first ? s : null;
  } catch { return null; }
}

function compact(t: Touch): string {
  return [t.src && `src:${t.src}`, t.camp && `camp:${t.camp}`, t.ref && `ref:${t.ref}`]
    .filter(Boolean).join("|").slice(0, 120);
}

export function initAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const q = new URLSearchParams(window.location.search);
    const touch: Touch = {
      src: q.get("utm_source") || undefined,
      med: q.get("utm_medium") || undefined,
      camp: q.get("utm_campaign") || undefined,
      ref: document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : undefined,
    };
    if (!touch.src && !touch.camp && !touch.ref) return; // 直输/无来源,不记
    const existing = read();
    const next: Store = {
      first: existing?.first ?? touch,
      last: touch,
      at: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* 归因失败绝不影响页面 */ }
}

/** 紧凑归因 token(写进 consult_events.note):首触|末触 */
export function attributionToken(): string {
  const s = read();
  if (!s) return "";
  return `attr[first:${compact(s.first)}|last:${compact(s.last)}]`.slice(0, 200);
}

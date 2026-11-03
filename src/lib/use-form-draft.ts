// Local form draft persistence for admin forms.
//
// Each form passes a unique `key` (e.g. `product:abc123`, `product:new`,
// `lens-sku:xyz`). The hook returns three callbacks:
//   - save(data)  — persist the current form state. Call from edit handlers.
//   - read()      — return { data, ts } | null. Call after server load to
//                   decide whether to restore a draft instead of server data.
//   - clear()     — remove the draft. Call after a successful server save.
//
// Design notes:
// - The hook does NOT auto-write on state change. Caller must call save()
//   explicitly. This avoids the trap of caching freshly-loaded server data
//   as a "draft", which would defeat the purpose.
// - Drafts have no TTL today.

import { useMemo } from "react";

const PREFIX = "lool:draft:";
const VERSION = 1;

interface Stored<T> {
  v: number;
  ts: number;
  data: T;
}

export interface FormDraft<T> {
  save: (data: T) => void;
  read: () => { data: T; ts: number } | null;
  clear: () => void;
}

export function useFormDraft<T>(key: string): FormDraft<T> {
  return useMemo<FormDraft<T>>(
    () => ({
      save(data) {
        try {
          const payload: Stored<T> = { v: VERSION, ts: Date.now(), data };
          localStorage.setItem(PREFIX + key, JSON.stringify(payload));
        } catch {
          // Quota exceeded or storage disabled — silent fail; the live
          // form keeps working, just without draft recovery.
        }
      },
      read() {
        try {
          const raw = localStorage.getItem(PREFIX + key);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as Partial<Stored<T>>;
          if (
            parsed.v !== VERSION ||
            typeof parsed.ts !== "number" ||
            parsed.data == null
          ) {
            return null;
          }
          return { data: parsed.data as T, ts: parsed.ts };
        } catch {
          return null;
        }
      },
      clear() {
        try {
          localStorage.removeItem(PREFIX + key);
        } catch {
          // ignore
        }
      },
    }),
    [key],
  );
}

export function formatDraftTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

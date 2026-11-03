// Multi-image editor for a single color variant's images_json array.
// Adds three things on top of the per-slot ImageUpload widget it replaces:
//   1. Multi-file picker — one click → choose N files → uploaded sequentially,
//      appended in selection order.
//   2. Reorder by drag-and-drop (native HTML5 DnD on each row).
//   3. Reorder by up/down arrow buttons — keyboard-friendly + touch fallback
//      since HTML5 DnD has no touch support.

import { useRef, useState } from "react";
import {
  Loader2,
  Upload,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  value: string[];
  onChange: (images: string[]) => void;
  /** R2 key prefix for uploaded files. */
  prefix?: string;
}

export function ColorImagesEditor({
  value,
  onChange,
  prefix = "product",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const uploadMany = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setBusy(true);
    setErr(null);
    setProgress({ done: 0, total: arr.length });
    const uploaded: string[] = [];
    try {
      for (let idx = 0; idx < arr.length; idx++) {
        const file = arr[idx];
        const fd = new FormData();
        fd.append("file", file);
        fd.append("prefix", prefix);
        const r = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "same-origin",
          body: fd,
        });
        if (!r.ok) {
          const data = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `upload_failed (${file.name})`);
        }
        const d = (await r.json()) as { url: string };
        uploaded.push(d.url);
        setProgress({ done: idx + 1, total: arr.length });
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const moveBy = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  const updateAt = (i: number, url: string) => {
    const next = [...value];
    next[i] = url;
    onChange(next);
  };

  const handleDrop = (target: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === target) {
      setDragIndex(null);
      return;
    }
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(target, 0, moved);
    onChange(next);
    setDragIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          {busy
            ? progress
              ? `上传中… ${progress.done}/${progress.total}`
              : "上传中…"
            : "批量上传图片"}
        </button>
        <button
          type="button"
          onClick={() => onChange([...value, ""])}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-xs hover:bg-secondary"
        >
          <Plus className="h-3 w-3" />
          添加 URL 槽
        </button>
        <span className="text-xs text-muted-foreground">
          可一次选多张图。已有 {value.length} 张。拖拽行或用 ▲▼ 调整顺序，[0] 为
          hero。
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadMany(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}

      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((img, i) => {
            const isDragSource = dragIndex === i;
            return (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop(i)}
                onDragEnd={() => setDragIndex(null)}
                className={`flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 transition-opacity ${
                  isDragSource ? "opacity-50" : ""
                }`}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                  {i}
                </span>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-secondary/50">
                  {img ? (
                    <img
                      src={img}
                      alt={`#${i}`}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <input
                  value={img}
                  onChange={(e) => updateAt(i, e.target.value)}
                  placeholder="https://…"
                  className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => moveBy(i, -1)}
                    disabled={i === 0}
                    aria-label="上移"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs hover:bg-secondary disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBy(i, 1)}
                    disabled={i === value.length - 1}
                    aria-label="下移"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs hover:bg-secondary disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    aria-label="删除"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

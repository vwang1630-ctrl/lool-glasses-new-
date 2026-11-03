// Reusable image upload widget for admin forms.
// Click → POST /api/admin/upload (multipart) → server returns R2 key + URL → onChange.

import { useRef, useState } from "react";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  prefix?: string;
  height?: number;
  className?: string;
  // Hide the URL text input — show only the thumbnail + upload/clear buttons.
  // 当图片地址对运营人员无意义时打开（例：受众双 banner 只关心"图替没替"）。
  hideUrlInput?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  prefix = "misc",
  height = 96,
  className,
  hideUrlInput = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prefix", prefix);
      const r = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as {
          error?: string;
          got?: string;
        };
        setErr(data.error ?? "upload_failed");
        return;
      }
      const d = (await r.json()) as { url: string };
      onChange(d.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <div className="flex items-stretch gap-2">
        {value ? (
          <div
            className="flex items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/50"
            style={{ height, minWidth: height }}
          >
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center rounded-md border border-dashed border-border bg-secondary/30 text-muted-foreground"
            style={{ height, minWidth: height }}
          >
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1.5">
          {!hideUrlInput && (
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://… 或点击下方上传"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          )}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs hover:bg-secondary disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              {busy ? "上传中…" : "上传"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-secondary"
              >
                <X className="h-3 w-3" />
                清除
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

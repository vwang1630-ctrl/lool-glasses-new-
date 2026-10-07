// PreviewEmailCapture — 合成后邮件捕获(sales-intent-backlog 第二批,站主『同意』9/30)
// 「Your X has landed.」+ 邮箱输入 → /api/public/preview-subscribe →
// Resend 把合成图作为附件回发 + 写 newsletter_subscribers(EDM 池,source=preview:<slug>)
// 缩图 ≤1280px jpeg 0.72 后上传(隐私:房间照只回发给本人邮箱,不落公开目录)
import { useState } from "react";
import { useT } from "@/lib/ui-i18n";

async function shrinkImage(dataUrl: string): Promise<string> {
  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("decode"));
      img.src = dataUrl;
    });
  } catch {
    return dataUrl;
  }
}

export default function PreviewEmailCapture({
  productSlug,
  shortLabel,
  imageDataUrl,
  variant = "light",
}: {
  productSlug: string;
  shortLabel: string;
  imageDataUrl: string;
  variant?: "light" | "dark";
}) {
  const $t = useT("ui");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit() {
    if (!email.trim() || state === "sending") return;
    setState("sending");
    setErr("");
    try {
      const shrunk = await shrinkImage(imageDataUrl);
      const res = await fetch("/api/public/preview-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product_slug: productSlug, image_data_url: shrunk }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed");
      setState("sent");
    } catch (e: any) {
      setState("error");
      setErr(e?.message || $t("Something went wrong."));
    }
  }

  const line = variant === "dark" ? "border-white/[0.08] bg-white/5" : "border-line bg-surface";
  const inputCls = variant === "dark"
    ? "min-w-0 flex-1 rounded-none bg-transparent px-3 text-[14px] text-white outline-none placeholder:text-white/30"
    : "min-w-0 flex-1 rounded-none bg-transparent px-3 text-[14px] text-ink outline-none placeholder:text-ink-faint";
  const dim = variant === "dark" ? "text-white/40" : "text-ink-quiet";

  if (state === "sent") {
    return (
      <div className={`mt-3 border-t border-line pt-3 ${dim}`} style={{ borderColor: variant === "dark" ? "rgba(255,255,255,0.08)" : undefined }}>
        {$t("Sent. Check your inbox — your room, with the piece in it.")}
      </div>
    );
  }

  return (
    <div className={`mt-3 border-t pt-3 ${line}`} style={{ borderColor: variant === "dark" ? "rgba(255,255,255,0.08)" : undefined }}>
      <p className={`text-[14px] ${variant === "dark" ? "text-white" : "text-ink"}`}>
        {$t("Your piece has landed.")}
      </p>
      <p className={`mt-1 text-[12px] leading-relaxed ${dim}`}>
        {$t("Email me this preview")}{$t(" — occasional new pieces, unsubscribe anytime.")}
      </p>
      <div className={`mt-2 flex items-stretch border ${variant === "dark" ? "border-white/[0.12]" : "border-line-strong"}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
          inputMode="email"
          placeholder={$t("you@email.com")}
          className={inputCls}
          aria-label={$t("Email address")}
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={state === "sending" || !email.trim()}
          className={`shrink-0 px-4 text-[11px] uppercase tracking-[0.18em] ${variant === "dark" ? "bg-accent text-black" : "bg-accent text-on-accent"} disabled:opacity-40`}
        >
          {state === "sending" ? $t("Sending…") : $t("Send")}
        </button>
      </div>
      {state === "error" && <p className={`mt-1.5 text-[12px] ${variant === "dark" ? "text-red-300" : "text-red-700"}`}>{err}</p>}
    </div>
  );
}

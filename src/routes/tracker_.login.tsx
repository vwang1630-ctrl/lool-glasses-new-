// /tracker/login — 订单跟踪 staff login. Email OTP only, @loollook.com required.
// No layout chrome shared with admin or storefront.
//
// Two-step UI:
//   1. user types their @loollook.com email → POST /api/tracker/otp/request
//   2. user enters the 6-digit code → POST /api/tracker/otp/verify → cookie set

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Glasses, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tracker_/login")({
  head: () => ({
    meta: [
      { title: "loollook — 订单跟踪登录" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TrackerLoginPage,
});

type Step = "request" | "verify";

function TrackerLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized.endsWith("@loollook.com")) {
      setError("仅限 @loollook.com 邮箱");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/tracker/otp/request", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      if (!r.ok) {
        setError("发送验证码失败");
        return;
      }
      // Server always returns ok:true to avoid leaking which addresses are trackers.
      // Advance to the code step regardless; an invalid email never gets a code.
      setStep("verify");
      setInfo("验证码已发送（如该邮箱是有效跟单后台账号），10 分钟内有效");
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("请输入 6 位验证码");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/tracker/otp/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        const map: Record<string, string> = {
          expired: "验证码已过期，请重新申请",
          wrong: "验证码错误，请重新输入或重新申请",
          too_many_attempts: "尝试次数过多，请重新申请",
          no_code: "请先申请验证码",
          no_tracker: "此邮箱未授权登录跟单后台",
        };
        setError(map[data.error ?? ""] ?? "验证失败");
        return;
      }
      navigate({ to: "/tracker" });
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-background border border-border p-8 shadow-soft">
        <div className="flex items-center gap-2 mb-6">
          <Glasses className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-display">
            loollook 订单跟踪
          </span>
        </div>
        <h1 className="text-2xl font-semibold mb-1">登录</h1>
        <p className="text-sm text-muted-foreground mb-6">
          内部跟单员工使用。输入 @loollook.com 邮箱获取验证码。
        </p>

        {step === "request" && (
          <form onSubmit={requestCode} className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                邮箱（@loollook.com）
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="lucas@loollook.com"
                className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border focus:border-primary/40 outline-none bg-background"
                required
              />
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              发送验证码
            </button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={verifyCode} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              验证码已发送至 <span className="font-mono">{email}</span>
              。发送新验证码会覆盖该邮箱之前的验证码。
            </p>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                6 位验证码
              </span>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="off"
                placeholder="000000"
                className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border focus:border-primary/40 outline-none bg-background font-mono tracking-[0.3em] text-center text-lg"
                required
              />
            </label>
            {info && <p className="text-xs text-muted-foreground">{info}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              登录
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setCode("");
                setError(null);
                setInfo(null);
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              换个邮箱
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

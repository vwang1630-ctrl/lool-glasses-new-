// /admin/login — admin login page (standalone, no AdminLayout chrome).
// Trailing `_` on the file segment opts this route out of /admin layout
// nesting per TanStack convention.
//
// Auth: email OTP only. Passwords were removed in migration 0062. The
// email must end in @loollook.com — server-side check is the canonical
// enforcement; the client check is just for UX.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Glasses, Loader2 } from "lucide-react";

type OtpStep = "request" | "verify";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "loollook — 后台登录" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<OtpStep>("request");
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
      const r = await fetch("/api/admin/otp/request", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      if (!r.ok) {
        setError("发送验证码失败");
        return;
      }
      setOtpEmail(normalized);
      setStep("verify");
      setInfo("验证码已发送（如该邮箱是有效管理员），10 分钟内有效。");
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await fetch("/api/admin/otp/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        const map: Record<string, string> = {
          wrong: "验证码错误，请重新输入或重新发送",
          expired: "验证码已过期，请重新发送",
          too_many_attempts: "尝试次数过多，请重新发送",
          no_code: "请先获取验证码",
          no_admin: "此邮箱未授权访问后台",
        };
        setError(map[data.error ?? ""] ?? "验证失败");
        return;
      }
      navigate({ to: "/admin" });
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Glasses className="h-6 w-6" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-wider">LOOLLOOK</div>
            <div className="text-[10px] text-muted-foreground">
              EYEWEAR ADMIN
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              loollook.com 后台
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              输入 @loollook.com 邮箱获取登录验证码。
            </p>
          </div>

          {step === "request" && (
            <form onSubmit={requestCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  管理员邮箱
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucas@loollook.com"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  我们会发送一个 6 位验证码到该邮箱，10 分钟内有效。
                </p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                发送验证码
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={verifyCode} className="space-y-4">
              {info && (
                <p className="text-sm text-foreground/80 bg-secondary/40 rounded-md px-3 py-2 leading-relaxed">
                  {info}
                  {otpEmail && (
                    <>
                      <br />
                      发送新验证码会覆盖该邮箱之前的验证码。
                    </>
                  )}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  6 位验证码
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoComplete="off"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 tracking-[0.3em] font-mono text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setCode("");
                    setOtpEmail("");
                    setError(null);
                    setInfo(null);
                  }}
                  className="mt-1.5 text-xs text-primary hover:underline"
                >
                  ← 用其他邮箱
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                验证并登录
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          仅限授权 @loollook.com 管理员访问。
        </p>
      </div>
    </div>
  );
}

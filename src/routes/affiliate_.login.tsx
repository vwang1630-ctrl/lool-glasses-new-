import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Glasses, Loader2 } from "lucide-react";

type Step = "request" | "verify";

export const Route = createFileRoute("/affiliate_/login")({
  head: () => ({
    meta: [
      { title: "loollook — Affiliate Login" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AffiliateLoginPage,
});

function AffiliateLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setErr("请输入有效邮箱");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/affiliate/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      if (!res.ok) {
        setErr("验证码发送失败");
        return;
      }
      setEmail(normalized);
      setStep("verify");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setErr("请输入 6 位验证码");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/affiliate/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      if (!res.ok) {
        setErr("验证码无效，请重新输入或重新发送");
        return;
      }
      navigate({ to: "/affiliate", replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link to="/" className="mb-8 inline-flex items-center gap-3 self-start">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Glasses className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold">
              LOOLLOOK
            </span>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">
              Affiliate Admin
            </span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="text-2xl font-semibold">代理后台登录</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            使用后台已启用的代理邮箱接收 6 位验证码。这里不会登录 C 端账号。
          </p>

          {step === "request" ? (
            <form onSubmit={requestCode} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Affiliate email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
                  placeholder="agent@example.com"
                />
              </label>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition-smooth hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                发送验证码
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-6 space-y-4">
              <div className="rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                验证码已发送到{" "}
                <span className="font-medium text-foreground">{email}</span>
                。发送新验证码会覆盖该邮箱之前的验证码。
              </div>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Verification code
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-center font-mono text-lg tracking-[0.35em] outline-none focus:border-primary/40"
                  maxLength={6}
                  placeholder="000000"
                />
              </label>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition-smooth hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                登录代理后台
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setErr(null);
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                更换邮箱
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

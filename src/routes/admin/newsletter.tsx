// /admin/newsletter — footer newsletter sign-ups, with CSV export.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Sub {
  id: string;
  email: string;
  locale: string | null;
  source: string | null;
  page_path: string | null;
  country: string | null;
  status: string;
  created_at: number;
}

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/newsletter", { credentials: "same-origin" });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { subscribers: Sub[] };
      setSubs(d.subscribers);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (s: Sub) => {
    const status = s.status === "subscribed" ? "unsubscribed" : "subscribed";
    await fetch("/api/admin/newsletter", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, status }),
    });
    void load();
  };

  const active = subs.filter((s) => s.status === "subscribed").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">邮件订阅</h1>
          <p className="text-sm text-muted-foreground">
            页脚「订阅」提交的邮箱。有效 {active} / 共 {subs.length}
          </p>
        </div>
        <a
          href="/api/admin/newsletter?format=csv"
          className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          导出 CSV
        </a>
      </div>
      {err && <p className="text-sm text-destructive">加载失败：{err}</p>}
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : subs.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无订阅。</p>
      ) : (
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">邮箱</th>
                <th className="px-3 py-2">语言</th>
                <th className="px-3 py-2">国家</th>
                <th className="px-3 py-2">来源页</th>
                <th className="px-3 py-2">时间</th>
                <th className="px-3 py-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">{s.email}</td>
                  <td className="px-3 py-2">{s.locale ?? "—"}</td>
                  <td className="px-3 py-2">{s.country ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.page_path ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => void toggle(s)}
                      className={`rounded px-2 py-0.5 text-xs ${
                        s.status === "subscribed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                      title="点击切换"
                    >
                      {s.status === "subscribed" ? "已订阅" : "已退订"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

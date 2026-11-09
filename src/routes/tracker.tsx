// /tracker — 订单跟踪 portal shell. Children (`/tracker/`,
// `/tracker/orders/$id`) render inside <Outlet />. The login page lives at
// `/tracker/login` via `tracker_.login.tsx` (trailing underscore opts it out
// of this layout).
//
// On every render the shell probes /api/tracker/me — 401 redirects to login.
// We do the probe inline rather than on every child page because the shell
// is the single mount point that wraps the protected children.

import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Glasses, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "loollook — 订单跟踪" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TrackerLayout,
});

interface Tracker {
  id: string;
  email: string;
  name: string;
}

function TrackerLayout() {
  const navigate = useNavigate();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tracker/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const t = (d as { tracker?: Tracker } | null)?.tracker ?? null;
        if (!t) {
          navigate({ to: "/tracker/login" });
          return;
        }
        setTracker(t);
      })
      .catch(() => navigate({ to: "/tracker/login" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const logout = async () => {
    await fetch("/api/tracker/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    navigate({ to: "/tracker/login" });
  };

  if (loading || !tracker) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 print:bg-white">
      <header className="bg-background border-b border-border print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/tracker" className="flex items-center gap-2">
            <Glasses className="h-5 w-5 text-primary" />
            <span className="font-semibold font-display">loollook 订单跟踪</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {tracker.name}（{tracker.email}）
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 print:p-0 print:max-w-none">
        <Outlet />
      </main>
    </div>
  );
}

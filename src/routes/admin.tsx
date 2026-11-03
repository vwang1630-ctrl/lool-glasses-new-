// /admin route — admin SPA layout shell. Children routes (`/admin/`,
// `/admin/products`, `/admin/orders`, ...) render inside the AdminLayout
// Outlet. The login page lives at `/admin/login` via the trailing-underscore
// non-nested route file `admin_.login.tsx` so it has no layout chrome.

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "loollook.com 后台" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

// /$lang/blog — layout route for the blog index and individual article pages.
// The actual list lives in ./blog/index.tsx and each article lives in ./blog/$slug.tsx.

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/blog")({
  component: () => <Outlet />,
});

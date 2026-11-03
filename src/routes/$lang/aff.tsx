import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/aff")({
  beforeLoad: () => {
    throw redirect({ to: "/affiliate", replace: true });
  },
});

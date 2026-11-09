import { createFileRoute } from "@tanstack/react-router";
import { AffiliateDashboardPage } from "@/components/affiliate/AffiliateDashboardPage";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/affiliate")({
  head: () => ({
    meta: [
      { title: "loollook — Affiliate Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AffiliateRoute,
});

function AffiliateRoute() {
  return (
    <I18nProvider>
      <AffiliateDashboardPage />
    </I18nProvider>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/rewards")({
  head: () => ({
    meta: [
      { title: "lool — Rewards, earn points on every order" },
      {
        name: "description",
        content:
          "Earn 1 point per $1 spent and unlock exclusive perks: free lens upgrades, early access to new collections, and birthday gifts.",
      },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const { lang } = useI18n();
  const c = getInfoContent("rewards", lang);
  return (
    <InfoPage
      eyebrow={c.eyebrow}
      title={c.title}
      intro={c.intro}
      sections={c.sections}
      cta={c.cta}
    />
  );
}

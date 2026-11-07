import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/rewards")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("rewards", params.lang) },
      {
        name: "description",
        content:
          pageDesc("rewards", params.lang),
      },
      { property: "og:description", content: pageOgDesc("rewards", params.lang) },
      { name: "twitter:description", content: pageOgDesc("rewards", params.lang) },
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

import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/affiliate")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("affiliate", params.lang) },
      {
        name: "description",
        content:
          pageDesc("affiliate", params.lang),
      },
      { property: "og:description", content: pageOgDesc("affiliate", params.lang) },
      { name: "twitter:description", content: pageOgDesc("affiliate", params.lang) },
    ],
  }),
  component: AffiliatePage,
});

function AffiliatePage() {
  const { lang } = useI18n();
  const c = getInfoContent("affiliate", lang);
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

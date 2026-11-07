import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/refer")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("refer", params.lang) },
      {
        name: "description",
        content:
          pageDesc("refer", params.lang),
      },
      { property: "og:description", content: pageOgDesc("refer", params.lang) },
      { name: "twitter:description", content: pageOgDesc("refer", params.lang) },
    ],
  }),
  component: ReferPage,
});

function ReferPage() {
  const { lang } = useI18n();
  const c = getInfoContent("refer", lang);
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

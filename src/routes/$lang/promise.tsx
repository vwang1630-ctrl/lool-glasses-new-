import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/promise")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("promise", params.lang) },
      {
        name: "description",
        content:
          pageDesc("promise", params.lang),
      },
      { property: "og:description", content: pageOgDesc("promise", params.lang) },
      { name: "twitter:description", content: pageOgDesc("promise", params.lang) },
    ],
  }),
  component: PromisePage,
});

function PromisePage() {
  const { lang } = useI18n();
  const c = getInfoContent("promise", lang);
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

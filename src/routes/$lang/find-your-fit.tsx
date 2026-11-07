import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/find-your-fit")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("findYourFit", params.lang) },
      {
        name: "description",
        content:
          pageDesc("findYourFit", params.lang),
      },
      { property: "og:description", content: pageOgDesc("findYourFit", params.lang) },
      { name: "twitter:description", content: pageOgDesc("findYourFit", params.lang) },
    ],
  }),
  component: FitPage,
});

function FitPage() {
  const { lang } = useI18n();
  const c = getInfoContent("find-your-fit", lang);
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

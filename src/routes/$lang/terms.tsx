import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/terms")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("terms", params.lang) },
      {
        name: "description",
        content:
          pageDesc("terms", params.lang),
      },
      { property: "og:description", content: pageOgDesc("terms", params.lang) },
      { name: "twitter:description", content: pageOgDesc("terms", params.lang) },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useI18n();
  const c = getInfoContent("terms", lang);
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

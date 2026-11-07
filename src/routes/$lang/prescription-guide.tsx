import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/prescription-guide")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("prescriptionGuide", params.lang) },
      {
        name: "description",
        content:
          pageDesc("prescriptionGuide", params.lang),
      },
      { property: "og:description", content: pageOgDesc("prescriptionGuide", params.lang) },
      { name: "twitter:description", content: pageOgDesc("prescriptionGuide", params.lang) },
    ],
  }),
  component: RxPage,
});

function RxPage() {
  const { lang } = useI18n();
  const c = getInfoContent("prescription-guide", lang);
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

import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/accessibility")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("accessibility", params.lang) },
      {
        name: "description",
        content:
          pageDesc("accessibility", params.lang),
      },
      { property: "og:description", content: pageOgDesc("accessibility", params.lang) },
      { name: "twitter:description", content: pageOgDesc("accessibility", params.lang) },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const { lang } = useI18n();
  const c = getInfoContent("accessibility", lang);
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

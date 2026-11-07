import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/privacy")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("privacy", params.lang) },
      {
        name: "description",
        content:
          pageDesc("privacy", params.lang),
      },
      { property: "og:description", content: pageOgDesc("privacy", params.lang) },
      { name: "twitter:description", content: pageOgDesc("privacy", params.lang) },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const c = getInfoContent("privacy", lang);
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

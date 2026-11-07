import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/cookies")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("cookies", params.lang) },
      {
        name: "description",
        content:
          pageDesc("cookies", params.lang),
      },
      { property: "og:description", content: pageOgDesc("cookies", params.lang) },
      { name: "twitter:description", content: pageOgDesc("cookies", params.lang) },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const { lang } = useI18n();
  const c = getInfoContent("cookies", lang);
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

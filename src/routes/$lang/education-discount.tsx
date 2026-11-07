import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/education-discount")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("educationDiscount", params.lang) },
      {
        name: "description",
        content:
          pageDesc("educationDiscount", params.lang),
      },
      { property: "og:description", content: pageOgDesc("educationDiscount", params.lang) },
      { name: "twitter:description", content: pageOgDesc("educationDiscount", params.lang) },
    ],
  }),
  component: EduPage,
});

function EduPage() {
  const { lang } = useI18n();
  const c = getInfoContent("education-discount", lang);
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

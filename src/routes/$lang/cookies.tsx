import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/cookies")({
  head: () => ({
    meta: [
      { title: "lool — Cookie Preferences" },
      {
        name: "description",
        content:
          "Manage your cookie preferences and learn how lool uses cookies and analytics.",
      },
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

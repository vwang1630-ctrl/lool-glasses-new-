import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/education-discount")({
  head: () => ({
    meta: [
      { title: "lool — Education Discount, 15% off for students & educators" },
      {
        name: "description",
        content:
          "Verified students, teachers, and faculty save 15% on every lool order — including frames, lenses, and add-ons.",
      },
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

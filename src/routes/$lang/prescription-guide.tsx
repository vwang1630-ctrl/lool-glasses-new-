import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/prescription-guide")({
  head: () => ({
    meta: [
      { title: "lool — How to read your prescription" },
      {
        name: "description",
        content:
          "OD, OS, SPH, CYL, ADD, PD — a plain-language decoder for your eyeglass prescription.",
      },
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

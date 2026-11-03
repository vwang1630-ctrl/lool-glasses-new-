import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/measure-pd")({
  head: () => ({
    meta: [
      { title: "lool — How to measure your PD" },
      {
        name: "description",
        content:
          "Two simple methods to measure your pupillary distance at home, in under 60 seconds.",
      },
    ],
  }),
  component: MeasurePDPage,
});

function MeasurePDPage() {
  const { lang } = useI18n();
  const c = getInfoContent("measure-pd", lang);
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

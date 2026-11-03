import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/promise")({
  head: () => ({
    meta: [
      { title: "lool — The Promise, 365-day warranty & free fixes" },
      {
        name: "description",
        content:
          "Every lool frame is backed by a 365-day warranty against manufacturer defects, plus free adjustments for life.",
      },
    ],
  }),
  component: PromisePage,
});

function PromisePage() {
  const { lang } = useI18n();
  const c = getInfoContent("promise", lang);
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

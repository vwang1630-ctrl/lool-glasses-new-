import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/find-your-fit")({
  head: () => ({
    meta: [
      { title: "lool — Three Key Frame Dimensions" },
      {
        name: "description",
        content:
          "Read lens width, bridge width, and temple length to choose frames that fit your face shape and existing glasses size.",
      },
    ],
  }),
  component: FitPage,
});

function FitPage() {
  const { lang } = useI18n();
  const c = getInfoContent("find-your-fit", lang);
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

import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/refer")({
  head: () => ({
    meta: [
      { title: "lool — Refer a Friend, Give $20 Get $20" },
      {
        name: "description",
        content:
          "Share lool with friends. They get $20 off their first frame, you get $20 in store credit when their order ships.",
      },
    ],
  }),
  component: ReferPage,
});

function ReferPage() {
  const { lang } = useI18n();
  const c = getInfoContent("refer", lang);
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

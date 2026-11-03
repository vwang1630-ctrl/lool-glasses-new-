import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/affiliate")({
  head: () => ({
    meta: [
      { title: "lool — Affiliate Program" },
      {
        name: "description",
        content:
          "Earn up to 15% commission promoting lool eyewear. Open to creators, optometrists, bloggers, and stylists worldwide.",
      },
    ],
  }),
  component: AffiliatePage,
});

function AffiliatePage() {
  const { lang } = useI18n();
  const c = getInfoContent("affiliate", lang);
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
